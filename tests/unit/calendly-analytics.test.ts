import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isValidCalendlyOrigin,
  isValidCalendlyUrl,
  handleCalendlyMessage,
  handleCalendlyLinkClick,
  dispatchGAConversionEvent,
  buildCalendlyUrlWithUtms,
  openCalendlyPopup,
  initCalendlyAnalytics,
  initCalendlyBadge,
  scheduleCalendlyBadge,
  CALENDLY_BOOKING_EVENT,
  GA_CONVERSION_EVENT,
  CALENDLY_WIDGET_CSS_URL,
  CALENDLY_WIDGET_JS_URL,
} from '../../src/utils/calendly-analytics';

interface MockElement {
  tagName: string;
  rel?: string;
  href?: string;
  src?: string;
  async?: boolean;
  dataset: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
  addEventListener: (type: string, cb: () => void, opts?: { once?: boolean }) => void;
  removeEventListener: (type: string, cb: () => void) => void;
  dispatch: (type: string) => void;
  listenerCount: (type: string) => number;
}

function createMockElement(tagName: string): MockElement {
  const listeners = new Map<string, Array<{ cb: () => void; once?: boolean }>>();
  const el: MockElement = {
    tagName,
    dataset: {},
    setAttribute(name: string, value: string) {
      if (name === 'href') el.href = value;
      if (name === 'src') el.src = value;
      if (name === 'rel') el.rel = value;
    },
    getAttribute(name: string) {
      if (name === 'href') return el.href ?? null;
      if (name === 'src') return el.src ?? null;
      if (name === 'rel') return el.rel ?? null;
      return null;
    },
    addEventListener(type: string, cb: () => void, opts?: { once?: boolean }) {
      const list = listeners.get(type) ?? [];
      list.push({ cb, once: opts?.once });
      listeners.set(type, list);
    },
    removeEventListener(type: string, cb: () => void) {
      const list = listeners.get(type) ?? [];
      listeners.set(
        type,
        list.filter((entry) => entry.cb !== cb)
      );
    },
    dispatch(type: string) {
      const list = [...(listeners.get(type) ?? [])];
      const remaining = (listeners.get(type) ?? []).filter((entry) => !entry.once);
      listeners.set(type, remaining);
      for (const entry of list) {
        entry.cb();
      }
    },
    listenerCount(type: string) {
      return (listeners.get(type) ?? []).length;
    },
  };
  return el;
}

function createMockDom() {
  const headChildren: MockElement[] = [];
  const docListeners = new Map<string, Set<EventListener>>();

  const mockDocument = {
    body: {},
    readyState: 'complete',
    head: {
      appendChild(el: MockElement) {
        headChildren.push(el);
        return el;
      },
    },
    createElement(tag: string) {
      return createMockElement(tag.toUpperCase());
    },
    querySelectorAll(selector: string) {
      if (selector === 'link[rel="stylesheet"]') {
        return headChildren.filter((el) => el.tagName === 'LINK' && el.rel === 'stylesheet');
      }
      return [];
    },
    querySelector(selector: string) {
      if (selector.startsWith('link[href="')) {
        const href = selector.slice('link[href="'.length, -2);
        return headChildren.find((el) => el.tagName === 'LINK' && el.href === href) ?? null;
      }
      if (selector.startsWith('script[src="')) {
        const src = selector.slice('script[src="'.length, -2);
        return headChildren.find((el) => el.tagName === 'SCRIPT' && el.src === src) ?? null;
      }
      return null;
    },
    addEventListener(type: string, cb: EventListener) {
      const set = docListeners.get(type) ?? new Set<EventListener>();
      set.add(cb);
      docListeners.set(type, set);
    },
    removeEventListener(type: string, cb: EventListener) {
      docListeners.get(type)?.delete(cb);
    },
  };

  return { mockDocument, headChildren, docListeners };
}

describe('Calendly Analytics Utility', () => {
  const originalWindow = global.window;
  const originalDocument = global.document;
  let cleanupAnalytics: (() => void) | null = null;
  let cleanupBadgeSchedule: (() => void) | null = null;

  beforeEach(() => {
    const winListeners = new Map<string, Set<EventListener>>();
    global.window = {
      dataLayer: [],
      gtag: vi.fn(),
      // Real HTML spec: window.open(..., '_blank', 'noopener,noreferrer') returns null even on success.
      open: vi.fn(() => null),
      location: {
        search: '',
        assign: vi.fn(),
      },
      Calendly: {
        initPopupWidget: vi.fn(),
      },
      addEventListener: vi.fn((type: string, cb: EventListener) => {
        const set = winListeners.get(type) ?? new Set<EventListener>();
        set.add(cb);
        winListeners.set(type, set);
      }),
      removeEventListener: vi.fn((type: string, cb: EventListener) => {
        winListeners.get(type)?.delete(cb);
      }),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    if (cleanupBadgeSchedule) {
      cleanupBadgeSchedule();
      cleanupBadgeSchedule = null;
    }
    if (cleanupAnalytics) {
      cleanupAnalytics();
      cleanupAnalytics = null;
    } else {
      initCalendlyAnalytics()();
    }
    vi.useRealTimers();
    global.window = originalWindow;
    global.document = originalDocument;
  });

  test('isValidCalendlyOrigin validates calendly domains strictly', () => {
    expect(isValidCalendlyOrigin('https://calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://assets.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://sub.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://malicious-calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://example.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://evil.com/.calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://evil.com?.calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://calendly.com@evil.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://calendly.com:8443')).toBe(false);
    expect(isValidCalendlyOrigin('https://-.calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://sub-.calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://c\u0430lendly.com')).toBe(false); // Cyrillic 'а' homograph
    expect(isValidCalendlyOrigin('https://calendly.com.')).toBe(false); // trailing dot FQDN
    expect(isValidCalendlyOrigin('null')).toBe(false);
    expect(isValidCalendlyOrigin('data:text/html,test')).toBe(false);
    expect(isValidCalendlyOrigin('blob:https://calendly.com/123')).toBe(false);
    expect(isValidCalendlyOrigin('http://calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin(null as unknown as string)).toBe(false);
  });

  test('isValidCalendlyUrl validates calendly booking links strictly', () => {
    expect(isValidCalendlyUrl('https://calendly.com/mary-kubo')).toBe(true);
    expect(isValidCalendlyUrl('https://calendly.com')).toBe(true);
    expect(isValidCalendlyUrl('https://calendly.com?utm_source=test')).toBe(true);
    expect(isValidCalendlyUrl('https://malicious-calendly.com/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('/san-mateo-preschool-daycare/')).toBe(false);
    expect(isValidCalendlyUrl('https://evil.com/.calendly.com/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('https://evil.com?.calendly.com')).toBe(false);
    expect(isValidCalendlyUrl('https://calendly.com@evil.com/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('https://calendly.com:8443/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('https://-.calendly.com/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('javascript:alert(1)')).toBe(false);
  });

  test('handleCalendlyLinkClick intercepts Calendly link clicks and opens popup widget', () => {
    const preventDefault = vi.fn();
    const mockAnchor = {
      getAttribute: (attr: string) => (attr === 'href' ? 'https://calendly.com/mary-kubo' : null),
      href: 'https://calendly.com/mary-kubo',
    };
    const mockEvent = {
      defaultPrevented: false,
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      preventDefault,
      target: {
        closest: (selector: string) => (selector === 'a[href]' ? mockAnchor : null),
      },
    } as unknown as MouseEvent;

    handleCalendlyLinkClick(mockEvent);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(global.window.Calendly?.initPopupWidget).toHaveBeenCalledWith({
      url: 'https://calendly.com/mary-kubo',
    });
  });

  test('handleCalendlyLinkClick allows native navigation with UTMs when widget script already errored', () => {
    const { mockDocument, headChildren } = createMockDom();
    const failedScript = createMockElement('SCRIPT');
    failedScript.src = CALENDLY_WIDGET_JS_URL;
    failedScript.dataset.calendlyStatus = 'error';
    headChildren.push(failedScript);

    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;
    global.window.location = { search: '?utm_source=organic', assign: vi.fn() } as any;

    const preventDefault = vi.fn();
    const setAttribute = vi.fn();
    const mockAnchor = {
      getAttribute: (attr: string) => (attr === 'href' ? 'https://calendly.com/mary-kubo' : null),
      setAttribute,
      href: 'https://calendly.com/mary-kubo',
    };

    handleCalendlyLinkClick({
      defaultPrevented: false,
      button: 0,
      preventDefault,
      target: { closest: () => mockAnchor },
    } as unknown as MouseEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(setAttribute).toHaveBeenCalledWith(
      'href',
      'https://calendly.com/mary-kubo?utm_source=organic'
    );
    expect(global.window.open).not.toHaveBeenCalled();
    expect(global.window.location.assign).not.toHaveBeenCalled();
  });

  test('handleCalendlyLinkClick ignores non-Calendly links and modified clicks', () => {
    const preventDefault = vi.fn();
    const internalAnchor = {
      getAttribute: () => '/contact/',
      href: 'https://www.kubomontessori.com/contact/',
    };

    handleCalendlyLinkClick({
      defaultPrevented: false,
      button: 0,
      preventDefault,
      target: { closest: () => internalAnchor },
    } as unknown as MouseEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(global.window.Calendly?.initPopupWidget).not.toHaveBeenCalled();

    // Cmd+click on a Calendly link should not be intercepted
    const calendlyAnchor = {
      getAttribute: () => 'https://calendly.com/mary-kubo',
      href: 'https://calendly.com/mary-kubo',
    };
    handleCalendlyLinkClick({
      defaultPrevented: false,
      button: 0,
      metaKey: true,
      preventDefault,
      target: { closest: () => calendlyAnchor },
    } as unknown as MouseEvent);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(global.window.Calendly?.initPopupWidget).not.toHaveBeenCalled();
  });

  test('dispatchGAConversionEvent pushes event to dataLayer and calls gtag safely', () => {
    dispatchGAConversionEvent();

    expect(global.window.dataLayer).toContainEqual({
      event: GA_CONVERSION_EVENT,
      event_category: 'engagement',
      event_label: 'Calendly Widget',
      value: 1,
    });

    expect(global.window.gtag).toHaveBeenCalledWith('event', GA_CONVERSION_EVENT, {
      event_category: 'engagement',
      event_label: 'Calendly Widget',
      value: 1,
    });
  });

  test('dispatchGAConversionEvent continues calling gtag if dataLayer is corrupted or throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.window.dataLayer = {
      push: () => {
        throw new Error('blocked dataLayer');
      },
    } as unknown as unknown[];

    expect(() => dispatchGAConversionEvent()).not.toThrow();
    expect(global.window.gtag).toHaveBeenCalledWith('event', GA_CONVERSION_EVENT, {
      event_category: 'engagement',
      event_label: 'Calendly Widget',
      value: 1,
    });

    errorSpy.mockRestore();
  });

  test('handleCalendlyMessage triggers conversion event for valid booking message', () => {
    const validMessage = {
      origin: 'https://calendly.com',
      data: {
        event: CALENDLY_BOOKING_EVENT,
        payload: { event_type: { uuid: '123' } },
      },
    } as MessageEvent;

    handleCalendlyMessage(validMessage);

    expect(global.window.dataLayer).toContainEqual(
      expect.objectContaining({ event: GA_CONVERSION_EVENT })
    );
  });

  test('handleCalendlyMessage triggers conversion event for stringified JSON booking message', () => {
    const stringifiedMessage = {
      origin: 'https://calendly.com',
      data: JSON.stringify({
        event: CALENDLY_BOOKING_EVENT,
        payload: { event_type: { uuid: '456' } },
      }),
    } as MessageEvent;

    handleCalendlyMessage(stringifiedMessage);

    expect(global.window.dataLayer).toContainEqual(
      expect.objectContaining({ event: GA_CONVERSION_EVENT })
    );
  });

  test('handleCalendlyMessage safely ignores malformed, oversized, array, primitive, and prototype payloads', () => {
    const cases: unknown[] = [
      '{not-valid-json',
      'null',
      '123',
      JSON.stringify([CALENDLY_BOOKING_EVENT]),
      JSON.stringify({ event: CALENDLY_BOOKING_EVENT, padding: 'x'.repeat(9000) }),
      Object.create({ event: CALENDLY_BOOKING_EVENT }),
      [CALENDLY_BOOKING_EVENT],
    ];

    for (const data of cases) {
      expect(() =>
        handleCalendlyMessage({
          origin: 'https://calendly.com',
          data,
        } as MessageEvent)
      ).not.toThrow();
    }

    expect(global.window.dataLayer).toHaveLength(0);
  });

  test('handleCalendlyMessage ignores non-booking events or invalid origins', () => {
    const invalidOriginMessage = {
      origin: 'https://attacker.com',
      data: { event: CALENDLY_BOOKING_EVENT },
    } as MessageEvent;

    handleCalendlyMessage(invalidOriginMessage);
    expect(global.window.dataLayer).toHaveLength(0);

    const nonBookingMessage = {
      origin: 'https://calendly.com',
      data: { event: 'calendly.date_and_time_selected' },
    } as MessageEvent;

    handleCalendlyMessage(nonBookingMessage);
    expect(global.window.dataLayer).toHaveLength(0);
  });

  test('buildCalendlyUrlWithUtms forwards UTM parameters properly and normalizes valid URLs', () => {
    const target = 'https://calendly.com/mary-kubo';
    const search = '?utm_source=google&utm_medium=cpc&utm_campaign=preschool_launch&other=123';
    const result = buildCalendlyUrlWithUtms(target, search);
    expect(result).toContain('utm_source=google');
    expect(result).toContain('utm_medium=cpc');
    expect(result).toContain('utm_campaign=preschool_launch');
    expect(result).not.toContain('other=123');

    expect(buildCalendlyUrlWithUtms('https://calendly.com')).toBe('https://calendly.com/');
    expect(buildCalendlyUrlWithUtms('javascript:alert(1)', '?utm_source=google')).toBe(
      'javascript:alert(1)'
    );

    const oversizedUtm = `?utm_source=${'a'.repeat(300)}&utm_medium=cpc`;
    const boundedResult = buildCalendlyUrlWithUtms(target, oversizedUtm);
    expect(boundedResult).not.toContain('utm_source=');
    expect(boundedResult).toContain('utm_medium=cpc');
  });

  test('buildCalendlyUrlWithUtms does not overwrite existing params on target URL', () => {
    const target = 'https://calendly.com/mary-kubo?utm_source=existing';
    const search = '?utm_source=new&utm_medium=email';
    const result = buildCalendlyUrlWithUtms(target, search);
    expect(result).toContain('utm_source=existing');
    expect(result).toContain('utm_medium=email');
  });

  test('openCalendlyPopup passes UTM parameters to initPopupWidget, guards throws, and rejects untrusted URLs', () => {
    global.window.location = { search: '?utm_source=seo_audit&utm_campaign=peninsula', assign: vi.fn() } as any;
    openCalendlyPopup('https://calendly.com/mary-kubo');

    expect(global.window.Calendly?.initPopupWidget).toHaveBeenCalledWith({
      url: expect.stringMatching(/utm_source=seo_audit/),
    });

    // If Calendly SDK throws synchronously, degrade to fallback tab cleanly
    (global.window.Calendly!.initPopupWidget as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('SDK internal failure');
    });
    openCalendlyPopup('https://calendly.com/mary-kubo');
    expect(global.window.open).toHaveBeenCalledTimes(1);
    expect(global.window.location.assign).not.toHaveBeenCalled();

    openCalendlyPopup('https://evil.com/.calendly.com/mary-kubo');
    expect(global.window.Calendly?.initPopupWidget).toHaveBeenCalledTimes(2);
    expect(global.window.open).toHaveBeenCalledTimes(1);
  });

  test('openCalendlyPopup loads CSS/JS on demand and initializes popup when widget script loads', () => {
    const { mockDocument, headChildren } = createMockDom();
    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;

    openCalendlyPopup('https://calendly.com/mary-kubo');

    const cssEl = headChildren.find((el) => el.href === CALENDLY_WIDGET_CSS_URL);
    const jsEl = headChildren.find((el) => el.src === CALENDLY_WIDGET_JS_URL);
    expect(cssEl).toBeDefined();
    expect(jsEl).toBeDefined();
    expect(jsEl?.dataset.calendlyStatus).toBe('loading');

    const initPopupWidget = vi.fn();
    global.window.Calendly = { initPopupWidget };
    jsEl!.dispatch('load');

    expect(jsEl?.dataset.calendlyStatus).toBe('loaded');
    expect(initPopupWidget).toHaveBeenCalledWith({ url: 'https://calendly.com/mary-kubo' });
    expect(global.window.open).not.toHaveBeenCalled();
  });

  test('openCalendlyPopup falls back to window.open without double-navigating via location.assign', () => {
    const { mockDocument, headChildren } = createMockDom();
    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;

    openCalendlyPopup('https://calendly.com/mary-kubo');
    const jsEl = headChildren.find((el) => el.src === CALENDLY_WIDGET_JS_URL)!;
    jsEl.dispatch('error');

    expect(jsEl.dataset.calendlyStatus).toBe('error');
    expect(global.window.open).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo',
      '_blank',
      'noopener,noreferrer'
    );
    // Crucial: window.open(..., 'noopener,noreferrer') returns null even on success, so location.assign MUST NOT fire
    expect(global.window.location.assign).not.toHaveBeenCalled();

    // Fall back to location.assign if window.open throws or is unavailable
    (global.window.open as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('WebView blocked window.open');
    });
    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=throw');
    expect(global.window.location.assign).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo?utm_source=throw'
    );

    (global.window as any).open = undefined;
    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=retry');
    expect(global.window.location.assign).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo?utm_source=retry'
    );
  });

  test('openCalendlyPopup prevents rapid-click timer starvation/listener stacking and recovers if late load arrives', () => {
    vi.useFakeTimers();
    const { mockDocument, headChildren } = createMockDom();
    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;

    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=first');
    vi.advanceTimersByTime(3000);
    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=second');

    const scripts = headChildren.filter((el) => el.src === CALENDLY_WIDGET_JS_URL);
    expect(scripts).toHaveLength(1);
    expect(scripts[0].listenerCount('load')).toBe(2); // 1 status tracker + 1 popup launcher

    // Timer must NOT be starved back to 5s on second click; fires 2s later (5s from first click)
    vi.advanceTimersByTime(2000);
    expect(scripts[0].dataset.calendlyStatus).toBe('error');
    expect(global.window.open).toHaveBeenCalledTimes(1);
    expect(global.window.open).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo?utm_source=second',
      '_blank',
      'noopener,noreferrer'
    );

    // Late script load after timeout updates status cleanly without triggering duplicate popup
    const initPopupWidget = vi.fn();
    global.window.Calendly = { initPopupWidget };
    scripts[0].dispatch('load');
    expect(scripts[0].dataset.calendlyStatus).toBe('loaded');
    expect(initPopupWidget).not.toHaveBeenCalled();
  });

  test('openCalendlyPopup falls back immediately when document.head is missing or pre-existing script is marked loaded', () => {
    const { mockDocument, headChildren } = createMockDom();
    const preExisting = createMockElement('SCRIPT');
    preExisting.src = CALENDLY_WIDGET_JS_URL;
    preExisting.dataset.calendlyStatus = 'loaded';
    headChildren.push(preExisting);

    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;

    openCalendlyPopup('https://calendly.com/mary-kubo');
    expect(global.window.open).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo',
      '_blank',
      'noopener,noreferrer'
    );

    // Missing document.head falls back immediately without arming timer
    const headlessDoc = createMockDom().mockDocument;
    (headlessDoc as any).head = null;
    global.document = headlessDoc as unknown as Document;
    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=headless');
    expect(global.window.open).toHaveBeenCalledWith(
      'https://calendly.com/mary-kubo?utm_source=headless',
      '_blank',
      'noopener,noreferrer'
    );
  });

  test('openCalendlyPopup tracks status via WeakMap and avoids stacking listeners even if script lacks dataset', () => {
    const { mockDocument, headChildren } = createMockDom();
    const datasetlessScript = createMockElement('SCRIPT');
    delete (datasetlessScript as any).dataset;

    global.document = {
      ...mockDocument,
      createElement(tag: string) {
        if (tag.toUpperCase() === 'SCRIPT') return datasetlessScript;
        return createMockElement(tag.toUpperCase());
      },
      querySelector(selector: string) {
        if (selector.startsWith('script[src="')) {
          return headChildren.find((el) => el.tagName === 'SCRIPT') ?? null;
        }
        return mockDocument.querySelector(selector);
      },
    } as unknown as Document;
    global.window.Calendly = undefined;

    openCalendlyPopup('https://calendly.com/mary-kubo');
    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=again');

    expect(datasetlessScript.listenerCount('load')).toBe(2);

    // Once error settles on Click 1, WeakMap remembers 'error' so subsequent clicks fall back immediately without stalling
    datasetlessScript.dispatch('error');
    expect(global.window.open).toHaveBeenCalledTimes(1);

    openCalendlyPopup('https://calendly.com/mary-kubo?utm_source=third');
    expect(global.window.open).toHaveBeenCalledTimes(2);
    expect(global.window.open).toHaveBeenLastCalledWith(
      'https://calendly.com/mary-kubo?utm_source=third',
      '_blank',
      'noopener,noreferrer'
    );
  });

  test('initCalendlyAnalytics enforces singleton listener registration per window and cleans up cleanly', () => {
    const { mockDocument } = createMockDom();
    global.document = mockDocument as unknown as Document;

    const cleanup1 = initCalendlyAnalytics();
    const cleanup2 = initCalendlyAnalytics();
    cleanupAnalytics = cleanup2;

    expect(cleanup2).toBe(cleanup1);
    expect(global.window.addEventListener).toHaveBeenCalledTimes(1);

    cleanup1();
    cleanupAnalytics = null;
    expect(global.window.removeEventListener).toHaveBeenCalledWith(
      'message',
      handleCalendlyMessage
    );
  });

  test('initCalendlyBadge guards against missing initBadgeWidget and throwing SDK without locking retries', () => {
    const { mockDocument } = createMockDom();
    global.document = mockDocument as unknown as Document;

    expect(() => initCalendlyBadge()).not.toThrow();

    const initBadgeWidget = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('widget init failed');
      })
      .mockImplementationOnce(() => undefined);

    global.window.Calendly = { initBadgeWidget };
    initCalendlyBadge();
    expect(global.window.__calendlyBadgeInitialized).toBeUndefined();

    initCalendlyBadge();
    expect(global.window.__calendlyBadgeInitialized).toBe(true);

    initCalendlyBadge();
    expect(initBadgeWidget).toHaveBeenCalledTimes(2);
    expect(initBadgeWidget).toHaveBeenLastCalledWith(
      expect.objectContaining({ url: 'https://calendly.com/mary-kubo' })
    );
  });

  test('scheduleCalendlyBadge supports requestIdleCallback, readyState complete, error short-circuit, and cancellation', () => {
    vi.useFakeTimers();
    const { mockDocument, headChildren } = createMockDom();
    global.document = mockDocument as unknown as Document;
    global.window.Calendly = undefined;

    const idleCallbacks: Array<() => void> = [];
    (global.window as any).requestIdleCallback = vi.fn((cb: () => void) => {
      idleCallbacks.push(cb);
      return 1;
    });
    (global.window as any).cancelIdleCallback = vi.fn();

    cleanupBadgeSchedule = scheduleCalendlyBadge();
    expect(idleCallbacks).toHaveLength(1);
    idleCallbacks[0]();
    vi.advanceTimersByTime(1000);

    const jsEl = headChildren.find((el) => el.src === CALENDLY_WIDGET_JS_URL);
    expect(jsEl).toBeDefined();

    const initBadgeWidget = vi.fn();
    global.window.Calendly = { initBadgeWidget };
    jsEl!.dispatch('load');
    expect(initBadgeWidget).toHaveBeenCalledTimes(1);

    // Cancellation prevents deferred load from running
    (global.window as any).requestIdleCallback = undefined;
    const cancel = scheduleCalendlyBadge();
    cancel();
    vi.advanceTimersByTime(1000);
    expect(initBadgeWidget).toHaveBeenCalledTimes(1);
  });
});
