# Quickstart Guide: AI Visibility Optimization

This guide outlines how to build, run, and verify the changes made to the Kubo Montessori site to optimize its AI visibility.

## 1. Prerequisites & Installation

Ensure you are in the repository root and install dependencies:

```bash
npm install
```

## 2. Running Local Development

Start the Astro development server:

```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

## 3. Verifying the Changes

### A. Checking Naming and NAP Consistency
- Open `http://localhost:4321/` and `http://localhost:4321/rw` in your browser.
- Verify that the Redwood City location is consistently labeled **Roots N' Wings Montessori by Kubo Montessori LLC** (specifically in the hero banner, footer, and body text).
- Verify that the Norfolk St address is completely absent from all pages.

### B. Validating JSON-LD Schema
- Build the project to generate the production build:
  ```bash
  npm run build
  ```
- Run the build locally to preview:
  ```bash
  npm run preview
  ```
- Retrieve the generated HTML source for the homepage and run it through [Google's Rich Results Test](https://search.google.com/test/rich-results) or the schema validator at [validator.schema.org](https://validator.schema.org/).
- Ensure the output parsed is a single `EducationalOrganization` with two nested `subOrganization` children matching the specs.

### C. Testing the AI Sitemap (`/ai-sitemap.xml`)
- Visit `http://localhost:4321/ai-sitemap.xml` in your browser or run:
  ```bash
  curl -I http://localhost:4321/ai-sitemap.xml
  ```
- Ensure it returns a `200 OK` status with `Content-Type: application/xml` and lists only high-value pages:
  - `/`
  - `/homedaycare`
  - `/rw`
  - `/parent-handbook`
  - `/about`
  - `/services`

### D. Testing the Parent Handbook Page (`/parent-handbook`)
- Navigate to `http://localhost:4321/parent-handbook` and verify it contains clear, crawlable schedules, meal programs, age groups, and potty training assistance guidelines.
- Try printing the page in the browser (Ctrl+P / Cmd+P) to ensure the print styling displays correctly as a single documents booklet for parents.
