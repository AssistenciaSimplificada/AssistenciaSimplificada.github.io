import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orcamentos-simplificados.bielzinhovale.chatgpt.site";
  return ["", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade"].map((route) => ({ url: `${siteUrl}${route || "/"}`, lastModified: new Date("2026-08-22") }));
}
