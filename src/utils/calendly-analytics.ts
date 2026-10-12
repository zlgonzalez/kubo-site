/**
 * Calendly Analytics Tracking Utility
 * Listens to client-side window.postMessage events from embedded Calendly widgets
 * and dispatches conversion events to Google Analytics (gtag / dataLayer) without requiring paid plan webhooks.
 */

export interface CalendlyEventPayload {
  event: string;
  payload?: Record<string, unknown>;
}

export const CALENDLY_ORIGIN_REGEX = /^https:\/\/(.*\.)?calendly\.com$/;
export const CALENDLY_URL_REGEX = /^https:\/\/(.*\.)?calendly\.com(\/|$)/;
export const CALENDLY_BOOKING_EVENT = 'calendly.event_scheduled';
export const GA_CONVERSION_EVENT = 'tour_booking_scheduled';
export const CALENDLY_WIDGET_CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';
export const CALENDLY_WIDGET_JS_URL = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[] | unknown[];
    gtag?: (...args: unknown[]) => void;
    Calendly?: {
      initPopupWidget?: (options: { url: string }) => void;
      initBadgeWidget?: (options: Record<string, unknown>) => void;
    };
  }
}

/**
 * Checks if a MessageEvent originates from a valid Calendly domain.
 */
export function isValidCalendlyOrigin(origin: string): boolean {
  return CALENDLY_ORIGIN_REGEX.test(origin);
}

/**
 * Checks if a URL points to a valid Calendly booking link.
 */
export function isValidCalendlyUrl(url: string): boolean {
  return CALENDLY_URL_REGEX.test(url);
}

/**
 * Forwards inbound marketing and tracking parameters (e.g. utm_*, gclid) from the current page to a Calendly URL.
 */
export function buildCalendlyUrlWithUtms(targetUrl: string, searchParams?: string): string {
  let search = searchParams;
  if (typeof search === 'undefined') {
    if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string') {
      search = window.location.search;
    } else {
      return targetUrl;
    }
  }

  if (!search || !search.includes('=')) {
    return targetUrl;
  }

  try {
    const currentParams = new URLSearchParams(search);
    const target = new URL(targetUrl);
    const marketingKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
    ];

    for (const key of marketingKeys) {
      const val = currentParams.get(key);
      if (val && !target.searchParams.has(key)) {
        target.searchParams.set(key, val);
      }
    }

    return target.toString();
  } catch {
    return targetUrl;
  }
}

/**
 * Opens the embedded Calendly popup widget for a given URL, loading the widget script on demand if needed.
 */
export function openCalendlyPopup(url: string): void {
  if (typeof window === 'undefined') return;

  const targetUrl = buildCalendlyUrlWithUtms(url);

  if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
    window.Calendly.initPopupWidget({ url: targetUrl });
    return;
  }

  if (typeof document === 'undefined') return;

  if (!document.querySelector(`link[href="${CALENDLY_WIDGET_CSS_URL}"]`)) {
    const calendlyCSS = document.createElement('link');
    calendlyCSS.rel = 'stylesheet';
    calendlyCSS.href = CALENDLY_WIDGET_CSS_URL;
    document.head.appendChild(calendlyCSS);
  }

  let calendlyJS = document.querySelector(
    `script[src="${CALENDLY_WIDGET_JS_URL}"]`
  ) as HTMLScriptElement | null;

  if (!calendlyJS) {
    calendlyJS = document.createElement('script');
    calendlyJS.src = CALENDLY_WIDGET_JS_URL;
    calendlyJS.async = true;
    document.head.appendChild(calendlyJS);
  }

  calendlyJS.addEventListener(
    'load',
    () => {
      if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
        window.Calendly.initPopupWidget({ url: targetUrl });
      }
    },
    { once: true }
  );

  calendlyJS.addEventListener(
    'error',
    () => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    },
    { once: true }
  );
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

  event.preventDefault();
  openCalendlyPopup(href);
}

/**
 * Safely dispatches a conversion event to Google Analytics / Google Tag Manager dataLayer.
 */
export function dispatchGAConversionEvent(): void {
  if (typeof window === 'undefined') return;

  const eventData = {
    event: GA_CONVERSION_EVENT,
    event_category: 'engagement',
    event_label: 'Calendly Widget',
    value: 1,
  };

  // 1. Push to window.dataLayer for GTM / GA4
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);

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

  const data = event.data as CalendlyEventPayload | undefined;
  if (data && typeof data === 'object' && data.event === CALENDLY_BOOKING_EVENT) {
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

  window.addEventListener('message', handleCalendlyMessage);
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', handleCalendlyLinkClick);
  }

  return () => {
    window.removeEventListener('message', handleCalendlyMessage);
    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
      document.removeEventListener('click', handleCalendlyLinkClick);
    }
  };
}
