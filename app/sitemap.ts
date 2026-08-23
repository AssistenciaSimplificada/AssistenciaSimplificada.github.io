import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/recursos", "/guia", "/planos", "/faq", "/termos", "/privacidade"].map((route) => ({ url: `${SITE_URL}${route || "/"}`, lastModified: new Date("2026-08-23") }));
}
