# Data Model & Schema Contracts: Local SEO & GEO Strategy

**Feature Branch**: `004-local-seo-and-geo`  
**Date**: 2026-08-19  

## Data Entities & Interfaces

### 1. CityTargetData (Geo Landing Page Entity)
Defines localized content requirements for each Peninsula target city landing page.

```typescript
export interface CityTargetData {
  cityName: string;              // e.g. "Foster City", "Belmont", "San Carlos"
  citySlug: string;              // e.g. "foster-city-preschool-daycare"
  targetKeywords: string[];      // e.g. ["Foster City preschool", "Montessori daycare near Foster City"]
  metaTitle: string;             // Page meta title
  metaDescription: string;       // Page meta description
  nearestCampus: 'san-mateo' | 'redwood-city' | 'both';
  commuteHighlight: string;      // Commute distance and driving route context (e.g. "5 minutes via CA-92 & Hillsdale Blvd")
  geoCoordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### 2. CampusSpec (Quick-Fact Table Entity)
Structured data representing campus specifications for Quick-Fact tables and schema markup.

```typescript
export interface CampusSpec {
  campusId: 'san-mateo' | 'redwood-city';
  campusName: string;            // "San Mateo Campus (Casa dei Bambini)" or "Roots N' Wings (Redwood City)"
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  agesServed: string;            // e.g. "20 months – 6 years"
  ratio: string;                 // e.g. "12:2 (6:1 effective)"
  hours: string;                 // e.g. "9:00 AM – 5:30 PM (M–F)"
  pottyTrainingPolicy: string;   // e.g. "Not Required (Gentle support provided)"
  mealProgram: string;           // e.g. "Hot organic lunches & snacks prepared daily in-house"
  licensing: string;             // State license numbers
}
```

### 3. FAQItem (Answer Engine & FAQ Schema Entity)
Collapsible FAQ data structure used for on-page rendering and `FAQPage` JSON-LD schema generation.

```typescript
export interface FAQItem {
  question: string;
  answer: string;
  category?: 'potty-training' | 'ratios' | 'curriculum' | 'enrollment';
}
```

### 4. CalendlyAnalyticsEvent (Analytics Contract)
Client-side conversion event schema pushed to `window.dataLayer` and `window.gtag` upon successful tour scheduling.

```typescript
export interface CalendlyAnalyticsEvent {
  event: 'tour_booking_scheduled';
  event_category: 'engagement';
  event_label: 'Calendly Widget';
  value: 1;
  page_location?: string;        // URL of local landing page where tour was booked
}
```
