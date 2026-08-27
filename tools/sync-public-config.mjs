import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const localConfigPath = path.join(root, "config", "product-public-config.json");
const fallback = JSON.parse(fs.readFileSync(localConfigPath, "utf8"));
const appRoot = path.resolve(
  process.env.ASSISTENCIA_APP_SOURCE ||
    path.join(root, "..", "Assistencia-Simplificada-Source"),
);

const readJson = (target) => JSON.parse(fs.readFileSync(target, "utf8"));
const required = (value, label) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Configuração obrigatória ausente: ${label}.`);
  return normalized;
};
const httpsUrl = (value, label) => {
  const parsed = new URL(required(value, label));
  if (parsed.protocol !== "https:") throw new Error(`${label} deve usar HTTPS.`);
  return parsed.toString().replace(/\/$/, "");
};
const writeChanged = (target, contents) => {
  const normalized = contents.endsWith("\n") ? contents : `${contents}\n`;
  if (fs.existsSync(target) && fs.readFileSync(target, "utf8") === normalized) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, normalized, "utf8");
};

let generated = fallback;
if (
  fs.existsSync(path.join(appRoot, "package.json")) &&
  fs.existsSync(path.join(appRoot, "shared", "product-public-config.json"))
) {
  const metadata = readJson(path.join(appRoot, "package.json"));
  const shared = readJson(
    path.join(appRoot, "shared", "product-public-config.json"),
  );
  const supabase = fs.existsSync(
    path.join(appRoot, "electron", "assets", "supabase-config.json"),
  )
    ? readJson(path.join(appRoot, "electron", "assets", "supabase-config.json"))
    : null;
  const authorName =
    typeof metadata.author === "string" ? metadata.author : metadata.author?.name;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || supabase?.url;
  const technicianApi =
    process.env.NEXT_PUBLIC_TECHNICIAN_API_URL ||
    (supabaseUrl
      ? `${String(supabaseUrl).replace(/\/+$/, "")}/functions/v1/technician-quote`
      : fallback.urls.technicianApi);
  generated = {
    ...shared,
    productName: metadata.productName,
    version: metadata.version,
    description: metadata.description,
    authorName,
    urls: {
      ...shared.urls,
      officialWebsite:
        process.env.NEXT_PUBLIC_SITE_URL || shared.urls.officialWebsite,
      technicianApi,
    },
  };
}

if (generated.schemaVersion !== 1)
  throw new Error("schemaVersion pública desconhecida.");
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(generated.version))
  throw new Error("A versão pública do produto é inválida.");
if (!/^\d{10,15}$/.test(generated.support?.whatsapp || ""))
  throw new Error("O WhatsApp de suporte deve conter somente dígitos.");
if (generated.support?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(generated.support.email))
  throw new Error("O e-mail de suporte é inválido.");
if (!Array.isArray(generated.urls?.legacyPublicOrigins))
  throw new Error("urls.legacyPublicOrigins deve ser uma lista.");
generated.urls.legacyPublicOrigins.forEach((origin, index) =>
  httpsUrl(origin, `urls.legacyPublicOrigins[${index}]`),
);
const website = httpsUrl(generated.urls.officialWebsite, "urls.officialWebsite");
const technicianApi = httpsUrl(generated.urls.technicianApi, "urls.technicianApi");
const technicianPortal = new URL(generated.urls.technicianPath, `${website}/`).toString();
const apiOrigin = new URL(technicianApi).origin;

writeChanged(localConfigPath, `${JSON.stringify(generated, null, 2)}\n`);

const packagePath = path.join(root, "package.json");
const packageMetadata = readJson(packagePath);
if (packageMetadata.version !== generated.version) {
  packageMetadata.version = generated.version;
  writeChanged(packagePath, `${JSON.stringify(packageMetadata, null, 2)}\n`);
}

const technicianRuntime = {
  apiUrl: technicianApi,
  productName: generated.productName,
};
writeChanged(
  path.join(root, "public", "tecnico", "config.js"),
  `window.__ASSISTENCIA_PUBLIC_CONFIG__ = Object.freeze(${JSON.stringify(technicianRuntime)});`,
);

const template = fs.readFileSync(
  path.join(root, "public", "tecnico", "index.template.html"),
  "utf8",
);
const technicianHtml = template
  .replaceAll("{{PRODUCT_NAME}}", generated.productName)
  .replaceAll("{{PRODUCT_NAME_UPPER}}", generated.productName.toLocaleUpperCase("pt-BR"))
  .replaceAll("{{TECHNICIAN_PORTAL_URL}}", technicianPortal)
  .replaceAll("{{TECHNICIAN_API_ORIGIN}}", apiOrigin);
if (/{{[A-Z0-9_]+}}/.test(technicianHtml))
  throw new Error("O template técnico contém marcadores não preenchidos.");
writeChanged(
  path.join(root, "public", "tecnico", "index.html"),
  `<!-- ARQUIVO GERADO por tools/sync-public-config.mjs. -->\n${technicianHtml}`,
);

writeChanged(path.join(root, "public", "CNAME"), `${new URL(website).hostname}\n`);
writeChanged(
  path.join(root, "public", "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${website}/sitemap.xml\n`,
);
const publicRoutes = [
  "/",
  "/recursos",
  "/guia",
  "/planos",
  "/faq",
  "/termos",
  "/privacidade",
];
writeChanged(
  path.join(root, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map((route) => `  <url><loc>${new URL(route, `${website}/`).toString()}</loc></url>`).join("\n")}
</urlset>\n`,
);
process.stdout.write(
  `Configuração do site sincronizada com ${generated.productName} ${generated.version}.\n`,
);
