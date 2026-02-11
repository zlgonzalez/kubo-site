# Structured Data Spec

## ADDED Requirements

### Requirement: Local Business JSON-LD
The system MUST include JSON-LD structured data for `ChildCare` and `LocalBusiness` types.

#### Scenario: Google Rich Results Test
- **WHEN** page source is inspected
- **THEN** contains `<script type="application/ld+json">`
- **AND** content includes `@type: "ChildCare"`
- **AND** includes correct name "Kubo Montessori"
- **AND** includes address, phone, priceRange, openingHours

### Requirement: Homepage Only (Initially)
The structured data MUST be present at least on the homepage.
<!-- Or potentially all pages, as footer/header info is site-wide. Making it site-wide in Layout is easier. -->

#### Scenario: Site-wide presence
- **WHEN** visiting any page
- **THEN** the JSON-LD script is present in the `<head>` or `<body>`
