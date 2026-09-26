import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
// Fetch blog posts at build-time for dynamic redirects
let postsList = [];
try {
  const res = await fetch("https://api.dropinblog.com/v1/json/?b=0530ca52-f373-4292-800a-b93c30543ee4");
  if (res.ok) {
    const json = await res.json();
    postsList = json.data?.posts || [];
  }
} catch (e) {
  console.error("Failed to fetch blog posts for dynamic redirects configuration:", e);
}

// Define redirects mapping
const redirects = {
    '/rw': {
        status: 301,
        destination: '/redwood-city-preschool-center/'
    },
    '/homedaycare': {
        status: 301,
        destination: '/san-mateo-preschool-daycare/'
    },
    '/rw.html': {
        status: 301,
        destination: '/redwood-city-preschool-center/'
    },
    '/rw-location-directions.html': {
        status: 301,
        destination: '/rw-location-directions/'
    },
    '/about.html': {
        status: 301,
        destination: '/about/'
    },
    '/rw-baking.html': {
        status: 301,
        destination: '/rw-baking/'
    },
    '/homedaycare.html': {
        status: 301,
        destination: '/san-mateo-preschool-daycare/'
    },
    '/rw-gardening.html': {
        status: 301,
        destination: '/rw-gardening/'
    },
    '/services.html': {
        status: 301,
        destination: '/services/'
    },
    '/contact.html': {
        status: 301,
        destination: '/contact/'
    },
    '/rw-gymnastics.html': {
        status: 301,
        destination: '/rw-gymnastics/'
    },
    '/roots-n-wings-montessori-school': {
        status: 301,
        destination: '/redwood-city-preschool-center/'
    },
    '/parent-handbook': {
        status: 301,
        destination: '/resources/parent-handbook/'
    },
    '/parent-handbook.html': {
        status: 301,
        destination: '/resources/parent-handbook/'
    }
};

// Add dynamic blog post redirects
postsList.forEach(post => {
  redirects[`/blog/${post.slug}`] = {
    status: 301,
    destination: `/blog/?p=${post.slug}`
  };
});

// https://astro.build/config
export default defineConfig({
    site: 'https://www.kubomontessori.com',
    redirects: redirects,
    integrations: [
        tailwind(),
        sitemap({
            filter: (page) => !page.endsWith('/blog.html/') && !page.endsWith('/blog.html')
        }),
        robotsTxt({
            sitemap: [
                'https://www.kubomontessori.com/sitemap-index.xml',
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
