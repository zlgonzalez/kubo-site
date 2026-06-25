import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import sitemapHttp from './src/integrations/sitemap-http';

// Fetch blog posts at build-time for sitemap inclusion
let blogPostUrls = [];
try {
  const res = await fetch("https://api.dropinblog.com/v1/json/?b=0530ca52-f373-4292-800a-b93c30543ee4");
  if (res.ok) {
    const json = await res.json();
    const posts = json.data?.posts || [];
    blogPostUrls = posts.map(post => `https://www.kubomontessori.com/blog/${post.slug}`);
  }
} catch (e) {
  console.error("Failed to fetch blog posts for sitemap dynamic configuration:", e);
}

// https://astro.build/config
export default defineConfig({
    site: 'https://www.kubomontessori.com',
    redirects: {
        '/rw': {
            status: 301,
            destination: '/redwood-city-preschool-center'
        },
        '/homedaycare': {
            status: 301,
            destination: '/san-mateo-preschool-daycare'
        }
    },
    integrations: [
        tailwind(),
        sitemap({
            customPages: blogPostUrls
        }),
        sitemapHttp(),
        robotsTxt({
            sitemap: [
                'https://www.kubomontessori.com/sitemap-index.xml',
                'https://www.kubomontessori.com/sitemap-http.xml',
                'https://www.kubomontessori.com/ai-sitemap.xml'
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
