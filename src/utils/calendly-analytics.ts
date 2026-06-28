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
export const CALENDLY_BOOKING_EVENT = 'calendly.event_scheduled';
export const GA_CONVERSION_EVENT = 'tour_booking_scheduled';

/**
 * Checks if a MessageEvent originates from a valid Calendly domain.
 */
export function isValidCalendlyOrigin(origin: string): boolean {
  return CALENDLY_ORIGIN_REGEX.test(origin);
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
 * Initializes the global window postMessage event listener for Calendly widgets.
 */
export function initCalendlyAnalytics(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('message', handleCalendlyMessage);

  return () => {
    window.removeEventListener('message', handleCalendlyMessage);
  };
}
