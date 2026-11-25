# Technical Quickstart Guide

This guide describes how to run and test the Local SEO and AI Search Optimization changes.

## 1. Local Development
To start the Astro development server locally:
```bash
make dev
```
Access the local site at `http://localhost:4321`.

---

## 2. Running the Test Suite
All tests (unit tests, e2e routing tests, and Lighthouse CI tests) are run using the standard make command:
```bash
make test
```

### Running Specific Tests
* **Playwright E2E & Redirect Tests**:
  ```bash
  npm run test:e2e
  ```
* **Lighthouse CI Performance Checks**:
  ```bash
  npm run build && npm run test:lighthouse
  ```
* **Unit Tests**:
  ```bash
  npm run test:unit
  ```

---

## 3. Verifying redirects
To manually verify that redirects return a 301 Moved Permanently:
```bash
curl -I http://localhost:4321/rw
curl -I http://localhost:4321/homedaycare
```
Verify that the output contains:
* `HTTP/1.1 301 Moved Permanently`
* `Location: /redwood-city-preschool-center` (for `/rw`)
* `Location: /san-mateo-preschool-daycare` (for `/homedaycare`)
