# kubo-site Blueprint

**Status**: Living document — the authoritative backlog + architecture map for this project.

<!--
  HOW THIS DOCUMENT WORKS
  =======================
  Decreasing-detail map. Sections are DETAILED (backlog: design pending), SETTLED
  (digest + pointer; owner is a feature spec specs/<slug> or the CODE itself —
  brownfield), or CONTEXT (framing; never backlog). Ground truth is the filesystem;
  the machine-readable provenance markers under each heading are what the oracle
  reads — banners and prose are cosmetic. To change a code-owned slice:
  /speckit.specify it as usual; distill collapses its section when the spec ships.
  STRUCTURE IS COMPUTED (blueprint-slice.sh scaffold), never improvised: to change
  the cut, edit blueprint-config.yml and re-derive; the check gate validates
  structural conformance.
-->

## Table of Contents

- `public` — Static asset root copied verbatim into the built site: campus photography, icons, AI discovery manifest (`llms.txt`), and Apache redirect/security rules (`.htaccess`); **distilled** → `specs/000-product-baseline`
- `scripts` — Operational CLI scripts for static FTP deployment and manual image payload optimization; **distilled** → `specs/000-product-baseline`
- `src` — Astro static site application containing pages, shared layout/SEO chrome, interactive widgets, CSV schedule/calendar data, and client-side Calendly analytics tracking; **distilled** → `specs/000-product-baseline`
- `tests` — Automated verification suite covering Vitest unit/audit tests, Playwright end-to-end smoke tests, and a local static preview server with redirect emulation; **code-owned**

---

## public
<!-- blueprint:section state=distilled owner=specs/000-product-baseline -->
> **Distilled — owned by `specs/000-product-baseline`** (implemented at `public/`).
> The full behavioral baseline lives in that spec, which is the source of truth.
<!-- blueprint:code path=public sha=7876a61da2c4c9b8c1f66b5dc32b061cc9e4103c -->

Static asset root copied verbatim into the built site: campus photography, icons, AI discovery manifest (`llms.txt`), and Apache redirect/security rules (`.htaccess`). At a glance:

- **Security & Redirects** — Enforces HTTPS/www canonicalization, 301 legacy route redirects (`/rw`, `/homedaycare`), and security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- **AI Discovery Manifest** — Publishes machine-readable campus overview, program links, and parent resource index for LLM crawlers
- **Media Assets** — Stores optimized campus, enrichment, and staff photography under `public/images/` plus the site icon

For every requirement, threshold, and entity shape, see `specs/000-product-baseline/spec.md`.
Do not restate those details here — this section indexes the spec.
---

## scripts
<!-- blueprint:section state=distilled owner=specs/000-product-baseline -->
> **Distilled — owned by `specs/000-product-baseline`** (implemented at `scripts/`).
> The full behavioral baseline lives in that spec, which is the source of truth.
<!-- blueprint:code path=scripts sha=c5d604f08e51470cd9c746cbaf7f7a302bededec -->

Operational CLI scripts for static FTP deployment and manual image payload optimization. At a glance:

- **FTP Deployment** — Mirrors the built `./dist` output to `ftp.kubomontessori.com` via `lftp` with `--reverse --delete`, credential stdin piping, and `--dry-run` support
- **Image Optimization** — Resizes and re-encodes selected campus/staff JPEG assets in `public/images/` to max 1600px with `sharp` mozjpeg

For every requirement, threshold, and entity shape, see `specs/000-product-baseline/spec.md`.
Do not restate those details here — this section indexes the spec.
---

## src
<!-- blueprint:section state=distilled owner=specs/000-product-baseline -->
> **Distilled — owned by `specs/000-product-baseline`** (implemented at `src/`).
> The full behavioral baseline lives in that spec, which is the source of truth.
<!-- blueprint:code path=src sha=3060a68fa48c3c1a490082cb3bb5d06aaf123297 -->

Astro static site application containing pages, shared layout/SEO chrome, interactive widgets, CSV schedule/calendar data, and client-side Calendly analytics tracking. At a glance:

- **Layout & Analytics Shell** — Wraps every page with `SEO`, async low-priority Google Analytics (`G-BE43SM2H4T`), and client-side `initCalendlyAnalytics` / `scheduleCalendlyBadge` bootstrap
- **Multi-Entity SEO & Schema** — Emits canonical URLs, Open Graph/Twitter metadata, and a 3-node JSON-LD `@graph` (`EducationalOrganization`, San Mateo campus, Redwood City campus) with on-site `ReserveAction` targets
- **Navigation & Site Chrome** — Provides responsive `NavBar` with mobile toggle and dropdowns for Programs, Locations Served (7 Peninsula cities), and Resources (including Parent Handbook), plus `Footer`
- **Calendly Tracking & Popup** — Intercepts Calendly links to open on-page popups with UTM forwarding, 5s timeout/fallback tab handling, strict origin validation, and URI/window deduplicated `gtag` `tour_booking_scheduled` events
- **Blog & AI Sitemap** — Pre-renders DropInBlog posts statically at build time on `/blog/` (with `/blog.html` query-preserving redirect) and serves canonical trailing-slash URLs at `/ai-sitemap.xml`
- **CSV Data Widgets** — Renders build-time sorted, client-paginated events from `src/data/calendar.csv` (`CalendarWidget`) and classroom daily schedules (`ScheduleWidget`) plus `FAQSection` (`FAQPage` JSON-LD) and `QuickFactTable`

For every requirement, threshold, and entity shape, see `specs/000-product-baseline/spec.md`.
Do not restate those details here — this section indexes the spec.
---

## tests
<!-- blueprint:section state=code -->
> **Distilled — owned by code at `tests/`.** (no spec yet) The implementation
> is the source of truth; this section maps it. To change it, `/speckit.specify`
> the area as usual and `distill` it when the spec ships.
<!-- blueprint:code path=tests sha=c5c10eec3a37cd22c298d4f79247d740331a87ae -->

Automated verification suite covering Vitest unit/audit tests, Playwright end-to-end smoke tests, and a local static preview server with redirect emulation. At a glance:

- **Calendly Unit Tests** — Verifies origin/URL validation, UTM forwarding, popup lifecycle/fallback, and booking event deduplication against `src/utils/calendly-analytics.ts`
- **SEO & Audit Unit Tests** — Enforces sitemap hygiene, title length (<= 70 chars), trailing-slash internal links and redirects, image alt attributes, `< 1 MB` image budget, single `h1`, and `llms.txt` presence
- **E2E Smoke Suite** — Exercises homepage navigation, mobile toggle, 301/client redirects, location pages, no-JS blog crawlability, JSON-LD `ReserveAction` targets, and Calendly popup/fallback/deduplication flows
- **Local Preview Server** — Serves `./dist` on port 4321 while emulating Apache/Astro 301 redirects (including dynamic `/blog/:slug` -> `/blog/?p=:slug`) for Playwright tests

For exact behavior, read the code under `tests/`. Do not restate it here.
---

## Architecture — subsystem relations
<!-- blueprint:section state=context -->

Rendered from the recovery facts; every edge below is machine-validated by
the check gate (endpoints on the map, evidence tracked in git).

| from | kind | to | why |
|---|---|---|---|
| scripts | uses | public | Reads and overwrites JPEG images in `public/images/` |
| src | uses | public | References static favicon and campus/logo images served from `public/` |
| tests | uses | public | Validates `public/.htaccess` redirect destinations, `public/llms.txt` content, and `public/images/` file sizes |
| tests | uses | src | Imports `calendly-analytics` and statically inspects `src/` pages and components for SEO and accessibility invariants |

<!-- blueprint:relation from=scripts to=public kind=uses evidence=scripts/optimize-images.cjs#../public/images -->
<!-- blueprint:relation from=src to=public kind=uses evidence=src/components/NavBar.astro#/images/kubo-logo.jpeg -->
<!-- blueprint:relation from=tests to=public kind=uses evidence=tests/unit/sitemap.test.ts#public/.htaccess -->
<!-- blueprint:relation from=tests to=src kind=uses evidence=tests/unit/calendly-analytics.test.ts#../../src/utils/calendly-analytics -->
