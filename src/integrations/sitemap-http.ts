import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function sitemapHttp(): AstroIntegration {
    return {
        name: 'sitemap-http',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                try {
                    // The build output directory
                    const distDir = fileURLToPath(dir);

                    // Check for sitemap-index.xml first (if huge site), otherwise sitemap-0.xml
                    // For a small site like this, it's likely just sitemap-0.xml or sitemap-index.xml pointing to sitemap-0.xml
                    // However, @astrojs/sitemap usually generates sitemap-index.xml and sitemap-0.xml

                    // Let's try to read sitemap-0.xml as it contains the actual URLs
                    let sitemapPath = path.join(distDir, 'sitemap-0.xml');

                    // If sitemap-0.xml doesn't exist, try sitemap-index.xml (though index usually points to other sitemaps)
                    // or just standard sitemap.xml if configured differently (but default is index + 0)

                    // Wait, let's verify what @astrojs/sitemap generates by default.
                    // It generates sitemap-index.xml and sitemap-0.xml.
                    // But wait, if we want a sitemap-http.xml that search engines can use, passing an index might be better if we have one.
                    // But the requirement is likely just a list of HTTP URLs.
                    // Let's read sitemap-0.xml, replace https with http, and save as sitemap-http.xml

                    // Check if sitemap-0.xml exists
                    try {
                        await fs.access(sitemapPath);
                    } catch {
                        // fallback to sitemap-index.xml if for some reason sitemap-0 isn't there (unlikely for default config)
                        sitemapPath = path.join(distDir, 'sitemap-index.xml');
                    }

                    const content = await fs.readFile(sitemapPath, 'utf-8');

                    // Replace https:// with http://
                    const httpContent = content.replace(/https:\/\//g, 'http://');

                    // Write to sitemap-http.xml
                    const outputPath = path.join(distDir, 'sitemap-http.xml');
                    await fs.writeFile(outputPath, httpContent, 'utf-8');

                    console.log(`\x1b[32m[sitemap-http]\x1b[0m Generated sitemap-http.xml`);

                } catch (error) {
                    console.error(`\x1b[31m[sitemap-http]\x1b[0m Error generating sitemap-http.xml:`, error);
                }
            },
        },
    };
}
