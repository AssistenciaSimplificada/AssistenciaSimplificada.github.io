const routes = ["", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade"];

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const today = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `\n  <url><loc>${origin}${route || "/"}</loc><lastmod>${today}</lastmod></url>`).join("")}\n</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
