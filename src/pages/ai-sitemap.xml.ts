import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, "") : url.origin;

  const pages = [
    "",
    "/homedaycare",
    "/rw",
    "/parent-handbook",
    "/about",
    "/services",
  ];

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
