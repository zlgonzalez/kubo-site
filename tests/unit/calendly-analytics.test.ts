import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  isValidCalendlyOrigin,
  handleCalendlyMessage,
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
  });

  test('isValidCalendlyOrigin validates calendly domains strictly', () => {
    expect(isValidCalendlyOrigin('https://calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://assets.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://sub.calendly.com')).toBe(true);
    expect(isValidCalendlyOrigin('https://malicious-calendly.com')).toBe(false);
    expect(isValidCalendlyOrigin('https://example.com')).toBe(false);
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
