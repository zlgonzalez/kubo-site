import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  isValidCalendlyOrigin,
  isValidCalendlyUrl,
  handleCalendlyMessage,
  handleCalendlyLinkClick,
  dispatchGAConversionEvent,
  CALENDLY_BOOKING_EVENT,
  GA_CONVERSION_EVENT,
} from '../../src/utils/calendly-analytics';

describe('Calendly Analytics Utility', () => {
  beforeEach(() => {
    // Setup clean window mocks before each test
    global.window = global.window || ({} as any);
    global.window.dataLayer = [];
    global.window.gtag = vi.fn();
    global.window.Calendly = {
      initPopupWidget: vi.fn(),
    };
  });

  test('isValidCalendlyOrigin validates calendly domains strictly', () => {
    expect(isValidCalendlyOrigin('https://calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://assets.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://sub.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://malicious-calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://example.com')).toBe(false);
  });

  test('isValidCalendlyUrl validates calendly booking links', () => {
    expect(isValidCalendlyUrl('https://calendly.com/mary-kubo')).toBe(true);
    expect(isValidCalendlyUrl('https://calendly.com')).toBe(true);
    expect(isValidCalendlyUrl('https://malicious-calendly.com/mary-kubo')).toBe(false);
    expect(isValidCalendlyUrl('/san-mateo-preschool-daycare/')).toBe(false);
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
});
