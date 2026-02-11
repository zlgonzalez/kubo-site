# Tasks: Improve SEO Foundation

## 1. Foundation Components

- [x] 1.1 Create `src/components/SEO.astro` component
    - Implement props interface (`title`, `description`, `image`, `article`)
    - Add canonical URL logic from `Astro.url`
    - Add Open Graph meta tags
    - Add Twitter Card meta tags
- [x] 1.2 Implement JSON-LD Schema
    - Add `LocalBusiness` / `ChildCare` schema object to `SEO.astro` (or separate helper)
    - Hardcode business details (address, hours, etc.)
- [x] 1.3 Update `src/layouts/Layout.astro`
    - Import and use `<SEO />` component in `<head>`
    - Pass necessary props from Layout props to SEO component
    - Remove old hardcoded meta tags

## 2. Page Updates

- [x] 2.1 Update Main Pages
    - `src/pages/index.astro`: Add unique description, custom OG image if available
    - `src/pages/about.astro`: Add unique description
    - `src/pages/contact.astro`: Add unique description
    - `src/pages/services.astro`: Add unique description
    - `src/pages/blog.astro`: Add unique description
    - `src/pages/homedaycare.astro`: Add unique description
    - `src/pages/rw.astro`: Add unique description
- [x] 2.2 Update Sub-pages (RW)
    - `src/pages/rw-baking.astro`
    - `src/pages/rw-gardening.astro`
    - `src/pages/rw-gymnastics.astro`
    - `src/pages/rw-location-directions.astro`
    - `src/pages/rw-technology.astro`

## 3. Verification

- [x] 3.1 Build Verification
    - Run `npm run build` to ensure no type errors or broken links
- [x] 3.2 HTML Inspection
    - Inspect `dist/index.html` for correct meta tags and JSON-LD
    - Inspect `dist/about/index.html` (or equivalent) for correct canonical URL
