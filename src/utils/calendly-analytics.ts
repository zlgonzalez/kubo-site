/**
 * Calendly Analytics Tracking Utility
 * Listens to client-side window.postMessage events from embedded Calendly widgets
 * and dispatches conversion events to Google Analytics (gtag / dataLayer) without requiring paid plan webhooks.
 */

export interface CalendlyEventPayload {
  event: string;
  payload?: {
    event?: {
      uri?: string;
    };
    invitee?: {
      uri?: string;
    };
    [key: string]: unknown;
  };
}

export interface GAConversionEventPayload {
  event: 'tour_booking_scheduled';
  event_category: 'engagement';
  event_label: 'Calendly Widget';
  value: 1;
}

const CALENDLY_HOST_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*calendly\.com$/;
export const CALENDLY_BOOKING_EVENT = 'calendly.event_scheduled';
export const GA_CONVERSION_EVENT = 'tour_booking_scheduled';
export const CALENDLY_DEFAULT_URL = 'https://calendly.com/mary-kubo';
export const CALENDLY_WIDGET_CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';
export const CALENDLY_WIDGET_JS_URL = 'https://assets.calendly.com/assets/external/widget.js';

const MAX_MESSAGE_DATA_LENGTH = 8192;
const MAX_UTM_PARAM_LENGTH = 256;
const CALENDLY_POPUP_LOAD_TIMEOUT_MS = 5000;
const MARKETING_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[] | unknown[];
    gtag?: (...args: unknown[]) => void;
    __calendlyBadgeInitialized?: boolean;
    Calendly?: {
      initPopupWidget?: (options: { url: string }) => void;
      initBadgeWidget?: (options: Record<string, unknown>) => void;
    };
  }
}

let pendingCalendlyUrl: string | null = null;
let pendingPopupTimer: ReturnType<typeof setTimeout> | null = null;
let pendingScriptElement: HTMLScriptElement | null = null;
let registeredAnalyticsWindow: Window | null = null;
let activeAnalyticsCleanup: (() => void) | null = null;

type CalendlyScriptStatus = 'loading' | 'loaded' | 'error';

const trackedStatusScripts = new WeakSet<HTMLScriptElement>();
const boundPopupScripts = new WeakSet<HTMLScriptElement>();
const boundBadgeScripts = new WeakSet<HTMLScriptElement>();
const scriptStatusMap = new WeakMap<HTMLScriptElement, CalendlyScriptStatus>();

function getScriptStatus(script: HTMLScriptElement | null): CalendlyScriptStatus | undefined {
  if (!script) return undefined;
  return (script.dataset?.calendlyStatus as CalendlyScriptStatus | undefined) ?? scriptStatusMap.get(script);
}

function setScriptStatus(script: HTMLScriptElement, status: CalendlyScriptStatus): void {
  scriptStatusMap.set(script, status);
  if (script.dataset) {
    script.dataset.calendlyStatus = status;
  }
}

function clearPendingPopupTimer(): void {
  if (pendingPopupTimer !== null) {
    clearTimeout(pendingPopupTimer);
    pendingPopupTimer = null;
  }
}

function parseValidCalendlyUrl(raw: string, requireExactOrigin: boolean): URL | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = new URL(raw);
    if (
      parsed.origin === 'null' ||
      parsed.protocol !== 'https:' ||
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.port !== '' ||
      !CALENDLY_HOST_REGEX.test(parsed.hostname)
    ) {
      return null;
    }
    if (requireExactOrigin && parsed.origin !== raw) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function tryInitPopupWidget(targetUrl: string): boolean {
  if (
    typeof window === 'undefined' ||
    !window.Calendly ||
    typeof window.Calendly.initPopupWidget !== 'function'
  ) {
    return false;
  }
  try {
    window.Calendly.initPopupWidget({ url: targetUrl });
    return true;
  } catch (e) {
    console.error('Failed to open Calendly popup widget:', e);
    return false;
  }
}

function openCalendlyFallbackTab(targetUrl: string): void {
  if (typeof window === 'undefined' || !isValidCalendlyUrl(targetUrl)) return;
  if (typeof window.open === 'function') {
    try {
      // HTML spec: window.open(..., '_blank', 'noopener,noreferrer') always returns null even when opening succeeds.
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    } catch {
      // Fall back to same-tab navigation only if window.open throws synchronously.
    }
  }
  if (window.location && typeof window.location.assign === 'function') {
    window.location.assign(targetUrl);
  }
}

function ensureCalendlyStylesheet(): void {
  if (typeof document === 'undefined') return;
  const existingLink = Array.from(document.querySelectorAll?.('link[rel="stylesheet"]') ?? []).find(
    (el) =>
      (el as HTMLLinkElement).getAttribute('href') === CALENDLY_WIDGET_CSS_URL ||
      (el as HTMLLinkElement).href === CALENDLY_WIDGET_CSS_URL
  );
  if (existingLink || document.querySelector?.(`link[href="${CALENDLY_WIDGET_CSS_URL}"]`)) {
    return;
  }

  const calendlyCSS = document.createElement('link');
  calendlyCSS.rel = 'stylesheet';
  calendlyCSS.href = CALENDLY_WIDGET_CSS_URL;
  document.head?.appendChild(calendlyCSS);
}

function ensureCalendlyScriptElement(): {
  script: HTMLScriptElement;
  isNew: boolean;
} {
  const existingScript = document.querySelector?.(
    `script[src="${CALENDLY_WIDGET_JS_URL}"]`
  ) as HTMLScriptElement | null;

  const script = existingScript ?? document.createElement('script');
  const isNew = !existingScript;

  if (isNew) {
    script.src = CALENDLY_WIDGET_JS_URL;
    script.async = true;
    setScriptStatus(script, 'loading');
  }

  if (!trackedStatusScripts.has(script) && !script.dataset?.calendlyStatusTracked) {
    trackedStatusScripts.add(script);
    if (script.dataset) {
      script.dataset.calendlyStatusTracked = 'true';
    }
    script.addEventListener?.(
      'load',
      () => {
        setScriptStatus(script, 'loaded');
      },
      { once: true }
    );
    script.addEventListener?.(
      'error',
      () => {
        setScriptStatus(script, 'error');
      },
      { once: true }
    );
  }

  return { script, isNew };
}

/**
 * Checks if a MessageEvent originates from a valid Calendly domain.
 */
export function isValidCalendlyOrigin(origin: string): boolean {
  return parseValidCalendlyUrl(origin, true) !== null;
}

/**
 * Checks if a URL points to a valid Calendly booking link.
 */
export function isValidCalendlyUrl(url: string): boolean {
  return parseValidCalendlyUrl(url, false) !== null;
}

/**
 * Forwards inbound marketing and tracking parameters (e.g. utm_*, gclid) from the current page to a Calendly URL.
 */
export function buildCalendlyUrlWithUtms(targetUrl: string, searchParams?: string): string {
  const target = parseValidCalendlyUrl(targetUrl, false);
  if (!target) {
    return targetUrl;
  }

  let search = searchParams;
  if (typeof search === 'undefined') {
    if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string') {
      search = window.location.search;
    } else {
      return target.toString();
    }
  }

  if (!search || !search.includes('=')) {
    return target.toString();
  }

  try {
    const currentParams = new URLSearchParams(search);

    for (const key of MARKETING_QUERY_KEYS) {
      const val = currentParams.get(key);
      if (val && val.length <= MAX_UTM_PARAM_LENGTH && !target.searchParams.has(key)) {
        target.searchParams.set(key, val);
      }
    }

    return target.toString();
  } catch {
    return target.toString();
  }
}

/**
 * Initializes the floating Calendly badge widget if the SDK has finished loading.
 */
export function initCalendlyBadge(url: string = CALENDLY_DEFAULT_URL): void {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !document.body ||
    window.__calendlyBadgeInitialized ||
    !window.Calendly ||
    typeof window.Calendly.initBadgeWidget !== 'function' ||
    !isValidCalendlyUrl(url)
  ) {
    return;
  }

  try {
    window.Calendly.initBadgeWidget({
      url: buildCalendlyUrlWithUtms(url),
      text: 'Click to Schedule a Tour',
      color: '#2563eb',
      textColor: '#ffffff',
      branding: true,
    });
    window.__calendlyBadgeInitialized = true;
  } catch (e) {
    console.error('Failed to initialize Calendly badge widget:', e);
  }
}

function loadCalendlyBadgeAssets(url: string = CALENDLY_DEFAULT_URL): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isValidCalendlyUrl(url)) return;

  ensureCalendlyStylesheet();

  if (window.Calendly && typeof window.Calendly.initBadgeWidget === 'function') {
    initCalendlyBadge(url);
    return;
  }

  const { script, isNew } = ensureCalendlyScriptElement();
  const status = getScriptStatus(script);
  if (status === 'loaded') {
    initCalendlyBadge(url);
    return;
  }
  if (status === 'error') {
    return;
  }

  if (!boundBadgeScripts.has(script) && !script.dataset?.calendlyBadgeBound) {
    boundBadgeScripts.add(script);
    if (script.dataset) {
      script.dataset.calendlyBadgeBound = 'true';
    }
    script.addEventListener?.(
      'load',
      () => {
        initCalendlyBadge(url);
      },
      { once: true }
    );
  }

  if (isNew) {
    document.head?.appendChild(script);
  }
}

/**
 * Schedules the floating Calendly badge widget to load after initial critical paint when idle.
 */
export function scheduleCalendlyBadge(url: string = CALENDLY_DEFAULT_URL): () => void {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  let idleHandle: number | null = null;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  let waitingForLoad = false;

  const scheduleDeferredLoad = () => {
    if (cancelled) return;
    timeoutHandle = setTimeout(() => {
      timeoutHandle = null;
      if (!cancelled) {
        loadCalendlyBadgeAssets(url);
      }
    }, 1000);
  };

  if (typeof window.requestIdleCallback === 'function') {
    idleHandle = window.requestIdleCallback(scheduleDeferredLoad);
  } else if (typeof document !== 'undefined' && document.readyState === 'complete') {
    scheduleDeferredLoad();
  } else {
    waitingForLoad = true;
    window.addEventListener?.('load', scheduleDeferredLoad, { once: true });
  }

  return () => {
    cancelled = true;
    if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleHandle);
      idleHandle = null;
    }
    if (timeoutHandle !== null) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    if (waitingForLoad) {
      window.removeEventListener?.('load', scheduleDeferredLoad);
      waitingForLoad = false;
    }
  };
}

/**
 * Opens the embedded Calendly popup widget for a given URL, loading the widget script on demand if needed.
 */
export function openCalendlyPopup(url: string): void {
  if (typeof window === 'undefined' || !isValidCalendlyUrl(url)) return;

  const targetUrl = buildCalendlyUrlWithUtms(url);
  if (!isValidCalendlyUrl(targetUrl)) return;

  if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
    clearPendingPopupTimer();
    pendingCalendlyUrl = null;
    pendingScriptElement = null;
    if (!tryInitPopupWidget(targetUrl)) {
      openCalendlyFallbackTab(targetUrl);
    }
    return;
  }

  if (typeof document === 'undefined') return;

  ensureCalendlyStylesheet();

  const { script, isNew } = ensureCalendlyScriptElement();
  const status = getScriptStatus(script);

  // Already-settled script without window.Calendly.initPopupWidget will never fire load/error again.
  if (status === 'error' || status === 'loaded' || (isNew && !document.head)) {
    clearPendingPopupTimer();
    pendingCalendlyUrl = null;
    pendingScriptElement = null;
    openCalendlyFallbackTab(targetUrl);
    return;
  }

  pendingCalendlyUrl = targetUrl;
  pendingScriptElement = script;

  // Do not reset an already-running timer on rapid clicks so a stalled script still fails over at 5s.
  if (pendingPopupTimer === null) {
    pendingPopupTimer = setTimeout(() => {
      pendingPopupTimer = null;
      const nextUrl = pendingCalendlyUrl;
      const timedOutScript = pendingScriptElement;
      pendingCalendlyUrl = null;
      pendingScriptElement = null;
      if (timedOutScript && getScriptStatus(timedOutScript) !== 'loaded') {
        setScriptStatus(timedOutScript, 'error');
      }
      if (nextUrl) {
        openCalendlyFallbackTab(nextUrl);
      }
    }, CALENDLY_POPUP_LOAD_TIMEOUT_MS);
  }

  if (!boundPopupScripts.has(script) && !script.dataset?.calendlyPopupBound) {
    boundPopupScripts.add(script);
    if (script.dataset) {
      script.dataset.calendlyPopupBound = 'true';
    }

    const settlePopup = (succeeded: boolean) => {
      clearPendingPopupTimer();
      const nextUrl = pendingCalendlyUrl;
      pendingCalendlyUrl = null;
      pendingScriptElement = null;
      if (!nextUrl) return;

      if (!succeeded || !tryInitPopupWidget(nextUrl)) {
        openCalendlyFallbackTab(nextUrl);
      }
    };

    const onLoad = () => {
      script.removeEventListener?.('error', onError);
      settlePopup(true);
    };

    const onError = () => {
      script.removeEventListener?.('load', onLoad);
      settlePopup(false);
    };

    script.addEventListener?.('load', onLoad, { once: true });
    script.addEventListener?.('error', onError, { once: true });
  }

  if (isNew) {
    document.head?.appendChild(script);
  }
}

/**
 * Intercepts clicks on external Calendly anchor links and opens the embedded Calendly popup widget instead,
 * ensuring the parent stays on the site and `calendly.event_scheduled` postMessage events are captured by GA.
 */
export function handleCalendlyLinkClick(event: MouseEvent): void {
  if (
    !event ||
    event.defaultPrevented ||
    (typeof event.button === 'number' && event.button !== 0) ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const target = event.target as Element | null;
  if (!target || typeof target.closest !== 'function') {
    return;
  }

  const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) {
    return;
  }

  const href = anchor.getAttribute('href') || anchor.href;
  if (!href || !isValidCalendlyUrl(href)) {
    return;
  }

  // If widget.js already settled/errored without Calendly SDK, preserve UTMs and let native <a target="_blank"> navigate cleanly.
  if (
    typeof window !== 'undefined' &&
    (!window.Calendly || typeof window.Calendly.initPopupWidget !== 'function') &&
    typeof document !== 'undefined'
  ) {
    const existingScript = document.querySelector?.(
      `script[src="${CALENDLY_WIDGET_JS_URL}"]`
    ) as HTMLScriptElement | null;
    const status = getScriptStatus(existingScript);
    if (status === 'error' || status === 'loaded') {
      const targetUrl = buildCalendlyUrlWithUtms(href);
      if (isValidCalendlyUrl(targetUrl)) {
        anchor.setAttribute?.('href', targetUrl);
      }
      return;
    }
  }

  event.preventDefault();
  openCalendlyPopup(href);
}

/**
 * Safely dispatches a conversion event to Google Analytics / Google Tag Manager dataLayer.
 */
export function dispatchGAConversionEvent(): void {
  if (typeof window === 'undefined') return;

  const eventData: GAConversionEventPayload = {
    event: GA_CONVERSION_EVENT,
    event_category: 'engagement',
    event_label: 'Calendly Widget',
    value: 1,
  };

  // 1. Push to window.dataLayer for GTM / GA4
  try {
    if (!window.dataLayer || typeof window.dataLayer.push !== 'function') {
      window.dataLayer = [];
    }
    window.dataLayer.push(eventData);
  } catch (e) {
    console.error('Failed to push event to dataLayer:', e);
  }

  // 2. Call gtag directly if defined
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', GA_CONVERSION_EVENT, {
        event_category: eventData.event_category,
        event_label: eventData.event_label,
        value: eventData.value,
      });
    } catch (e) {
      console.error('Failed to send event to gtag:', e);
    }
  }
}

/**
 * Handles incoming browser window postMessage events.
 */
export function handleCalendlyMessage(event: MessageEvent): void {
  if (!event || !event.origin || !isValidCalendlyOrigin(event.origin)) {
    return;
  }

  let rawData: unknown = event.data;
  if (typeof rawData === 'string') {
    if (
      rawData.length > MAX_MESSAGE_DATA_LENGTH ||
      !rawData.includes(CALENDLY_BOOKING_EVENT)
    ) {
      return;
    }
    try {
      rawData = JSON.parse(rawData);
    } catch {
      return;
    }
  }

  if (
    rawData !== null &&
    typeof rawData === 'object' &&
    !Array.isArray(rawData) &&
    Object.prototype.hasOwnProperty.call(rawData, 'event') &&
    (rawData as CalendlyEventPayload).event === CALENDLY_BOOKING_EVENT
  ) {
    dispatchGAConversionEvent();
  }
}

/**
 * Initializes the global window postMessage event listener and link click interceptor for Calendly widgets.
 */
export function initCalendlyAnalytics(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (activeAnalyticsCleanup && registeredAnalyticsWindow === window) {
    return activeAnalyticsCleanup;
  }

  if (activeAnalyticsCleanup) {
    activeAnalyticsCleanup();
  }

  const boundWindow = window;
  const boundDocument = typeof document !== 'undefined' ? document : undefined;

  boundWindow.addEventListener?.('message', handleCalendlyMessage);
  boundDocument?.addEventListener?.('click', handleCalendlyLinkClick);

  const cleanup = () => {
    clearPendingPopupTimer();
    pendingCalendlyUrl = null;
    pendingScriptElement = null;
    boundWindow.removeEventListener?.('message', handleCalendlyMessage);
    boundDocument?.removeEventListener?.('click', handleCalendlyLinkClick);
    if (activeAnalyticsCleanup === cleanup) {
      activeAnalyticsCleanup = null;
      registeredAnalyticsWindow = null;
    }
  };

  registeredAnalyticsWindow = boundWindow;
  activeAnalyticsCleanup = cleanup;
  return cleanup;
}
