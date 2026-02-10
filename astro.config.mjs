import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import sitemapHttp from './src/integrations/sitemap-http';

// https://astro.build/config
export default defineConfig({
    site: 'https://www.kubomontessori.com',
    integrations: [
        tailwind(),
        sitemap(),
        sitemapHttp(),
        robotsTxt({
            sitemap: [
                'https://www.kubomontessori.com/sitemap-index.xml',
                'https://www.kubomontessori.com/sitemap-http.xml'
            ],
            policy: [
                {
                    userAgent: '*',
                    allow: '/',
                },
            ],
        })
    ],
});
