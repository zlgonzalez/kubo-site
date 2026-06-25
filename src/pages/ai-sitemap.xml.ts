import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, "") : url.origin;

  const pages = [
    "",
    "/san-mateo-preschool-daycare",
    "/redwood-city-preschool-center",
    "/parent-handbook",
    "/about",
    "/services",
    "/san-mateo-location-directions",
    "/rw-location-directions",
  ];

  // Fetch blog posts for AI sitemap
  try {
    const res = await fetch("https://api.dropinblog.com/v1/json/?b=0530ca52-f373-4292-800a-b93c30543ee4");
    if (res.ok) {
      const json = await res.json();
      const posts = json.data?.posts || [];
      posts.forEach((post: any) => {
        pages.push(`/blog/${post.slug}`);
      });
    }
  } catch (e) {
    console.error("Failed to fetch blog posts for AI sitemap:", e);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
