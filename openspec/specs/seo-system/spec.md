# SEO System Spec

## ADDED Requirements

### Requirement: Default Meta Tags
The system MUST render default meta tags (title, description, canonical) on every page if no specific values are provided.

#### Scenario: Homepage renders default tags
- **WHEN** user visits the homepage
- **THEN** checks source code
- **AND** sees `<title>Fun and Academic Preschool...</title>`
- **AND** sees `<meta name="description" content="...">` with default description
- **AND** sees `<link rel="canonical" href="https://www.kubomontessori.com/">`

### Requirement: Custom Meta Tags
The system MUST allow individual pages to override default meta tags.

#### Scenario: About page renders custom tags
- **WHEN** user visits `/about`
- **THEN** checks source code
- **AND** sees `<title>About - Kubo Montessori</title>`
- **AND** sees `<meta name="description" content="Kubo Montessori mission and vision...">`
- **AND** sees `<link rel="canonical" href="https://www.kubomontessori.com/about">`

### Requirement: Open Graph Tags
The system MUST render Open Graph tags for social sharing.

#### Scenario: Shared link preview
- **WHEN** page is shared on Facebook
- **THEN** includes `og:title`, `og:description`, `og:url`, `og:image`
- **AND** `og:type` is `website` (or `article` if specified)

### Requirement: Twitter Card Tags
The system MUST render Twitter Card tags.

#### Scenario: Twitter preview
- **WHEN** page is shared on Twitter
- **THEN** includes `twitter:card` (summary_large_image)
- **AND** includes `twitter:title`, `twitter:description`, `twitter:image`
