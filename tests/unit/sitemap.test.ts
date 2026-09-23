import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('SEMrush Audit Full Remediation', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const astroConfigPath = path.join(repoRoot, 'astro.config.mjs');
  const aiSitemapPath = path.join(repoRoot, 'src/pages/ai-sitemap.xml.ts');
  const sitemapHttpPath = path.join(repoRoot, 'src/integrations/sitemap-http.ts');
  const seoComponentPath = path.join(repoRoot, 'src/components/SEO.astro');
  const parentHandbookPath = path.join(repoRoot, 'src/pages/resources/parent-handbook.astro');
  const rwBakingPath = path.join(repoRoot, 'src/pages/rw-baking.astro');
  const contactPath = path.join(repoRoot, 'src/pages/contact.astro');
  const rwLocationPath = path.join(repoRoot, 'src/pages/rw-location-directions.astro');
  const llmsPath = path.join(repoRoot, 'public/llms.txt');

  // Foundational Checks
  test('sitemap-http integration and declaration are removed', () => {
    expect(fs.existsSync(sitemapHttpPath)).toBe(false);

    const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8');
    expect(astroConfig).not.toContain('sitemapHttp');
    expect(astroConfig).not.toContain('sitemap-http.xml');
  });

  // Primary Sitemap Blog URLs
  test('Primary sitemap formats blog URLs with canonical trailing slash before query parameter', () => {
    const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8');
    expect(astroConfig).toContain('/blog/?p=${post.slug}');
    expect(astroConfig).not.toMatch(/\/blog\?p=\$\{post\.slug\}/);
  });

  // AI Sitemap Canonical URLs
  test('ai-sitemap.xml formats all static and blog paths with trailing slashes', () => {
    const aiSitemap = fs.readFileSync(aiSitemapPath, 'utf-8');

    const staticPagesToCheck = [
      '/',
      '/san-mateo-preschool-daycare/',
      '/redwood-city-preschool-center/',
      '/foster-city-preschool-daycare/',
      '/belmont-ca-montessori-daycare/',
      '/san-carlos-montessori-preschool/',
      '/burlingame-montessori-preschool/',
      '/menlo-park-montessori-preschool/',
      '/resources/montessori-vs-traditional-preschool/',
      '/resources/potty-training-preschool-guide/',
      '/resources/home-vs-center-childcare/',
      '/resources/parent-handbook/',
      '/about/',
      '/services/',
      '/san-mateo-location-directions/',
      '/rw-location-directions/',
    ];

    for (const page of staticPagesToCheck) {
      expect(aiSitemap).toContain(`"${page}"`);
    }

    expect(aiSitemap).toContain('/blog/?p=${post.slug}');
    expect(aiSitemap).not.toMatch(/\/blog\?p=\$\{post\.slug\}/);
  });

  // Remove Redirect Stubs from Sitemaps
  test('blog.html redirect shim is filtered from sitemap configuration', () => {
    const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8');
    expect(astroConfig).toMatch(/filter:\s*\(page\)\s*=>/);
    expect(astroConfig).toContain('blog.html');
  });

  // Single-Hop Dynamic Redirects
  test('Dynamic blog redirects map /blog/{slug} directly to canonical /blog/?p={slug}', () => {
    const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8');
    expect(astroConfig).toContain("destination: `/blog/?p=${post.slug}`");
  });

  // Structured Data Compliance
  test('Structured data schema has valid types and excludes invalid typicalAgeRange', () => {
    const seoContent = fs.readFileSync(seoComponentPath, 'utf-8');
    expect(seoContent).not.toContain('typicalAgeRange');
    expect(seoContent).toContain('"@type": "EducationalOrganization"');
  });

  // Title Tag Length Limits (<= 70 characters)
  test('All page titles are 70 characters or less', () => {
    function walk(dir: string): string[] {
      let results: string[] = [];
      for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          results = results.concat(walk(full));
        } else if (full.endsWith('.astro')) {
          results.push(full);
        }
      }
      return results;
    }

    const pages = walk(path.join(repoRoot, 'src/pages'));
    for (const file of pages) {
      const content = fs.readFileSync(file, 'utf-8');
      const m = content.match(/title=["'](.*?)["']/);
      if (m) {
        const title = m[1];
        expect(title.length, `Title in ${file} exceeded 70 chars: "${title}"`).toBeLessThanOrEqual(70);
      }
    }
  });

  // Image Alt Attributes
  test('Baking page images all contain alt attributes', () => {
    const bakingContent = fs.readFileSync(rwBakingPath, 'utf-8');
    expect(bakingContent).toContain('alt={img.alt}');
    expect(bakingContent).not.toMatch(/<img\s+src=\{img\}\s+class=/);
  });

  // Single H1 Tag
  test('Parent Handbook contains exactly one h1 tag', () => {
    const handbookContent = fs.readFileSync(parentHandbookPath, 'utf-8');
    const h1Matches = handbookContent.match(/<h1[\s>]/gi) || [];
    expect(h1Matches.length).toBe(1);
  });

  // No Unslashed Internal Links
  test('No internal links in src omit trailing slashes (including NavBar and components)', () => {
    function walk(dir: string): string[] {
      let results: string[] = [];
      for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          results = results.concat(walk(full));
        } else if (full.endsWith('.astro') || full.endsWith('.ts')) {
          results.push(full);
        }
      }
      return results;
    }

    const files = walk(path.join(repoRoot, 'src'));
    const unslashed: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      // Check both href="..." and { href: "..." } / url: "..."
      const matches = content.matchAll(/(?:href[:=]\s*["']|\burl:\s*["'])(\/[a-zA-Z0-9\-_]+(?:\/[a-zA-Z0-9\-_]+)*)["']/g);
      for (const m of matches) {
        const href = m[1];
        if (!href.endsWith('/') && !href.includes('.') && href !== '/') {
          unslashed.push(`${file}: ${href}`);
        }
      }
    }
    expect(unslashed).toEqual([]);
  });

  // Redirect Destinations Trailing Slashes
  test('All redirect destinations in astro.config.mjs and .htaccess have canonical trailing slashes', () => {
    const astroConfig = fs.readFileSync(astroConfigPath, 'utf-8');
    const destMatches = astroConfig.matchAll(/destination:\s*["'](\/[^"']*)["']/g);
    for (const m of destMatches) {
      const dest = m[1];
      expect(dest.endsWith('/'), `astro.config.mjs redirect destination missing trailing slash: ${dest}`).toBe(true);
    }

    const htaccessPath = path.join(repoRoot, 'public/.htaccess');
    const htaccess = fs.readFileSync(htaccessPath, 'utf-8');
    const redirectLines = htaccess.split('\n').filter(line => line.trim().startsWith('Redirect 301'));
    for (const line of redirectLines) {
      const parts = line.trim().split(/\s+/);
      const dest = parts[3];
      if (dest && dest.startsWith('/')) {
        expect(dest.endsWith('/'), `.htaccess redirect destination missing trailing slash: ${dest}`).toBe(true);
      }
    }
  });

  // LLMS.txt
  test('llms.txt exists in public directory and contains key sections', () => {
    expect(fs.existsSync(llmsPath)).toBe(true);
    const llmsContent = fs.readFileSync(llmsPath, 'utf-8');
    expect(llmsContent).toContain('# Kubo Montessori');
    expect(llmsContent).toContain('## Campuses & Programs');
    expect(llmsContent).toContain('https://www.kubomontessori.com/san-mateo-preschool-daycare/');
  });
});
