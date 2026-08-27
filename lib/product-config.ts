import productSource from "../config/product-public-config.json";
import siteSource from "../config/site.config.json";

const requiredText = (value: unknown, label: string) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) throw new Error(`Configuração obrigatória ausente: ${label}.`);
  return normalized;
};
const httpsUrl = (value: unknown, label: string) => {
  const parsed = new URL(requiredText(value, label));
  if (parsed.protocol !== "https:") throw new Error(`${label} deve usar HTTPS.`);
  return parsed.toString().replace(/\/$/, "");
};
const sitePath = (value: unknown, label: string) => {
  const normalized = requiredText(value, label);
  if (!normalized.startsWith("/")) throw new Error(`${label} deve começar com '/'.`);
  return normalized;
};
const money = (cents: number) => {
  if (!Number.isInteger(cents) || cents < 0)
    throw new Error("Os preços dos planos devem usar centavos inteiros positivos.");
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

if (productSource.schemaVersion !== 1 || siteSource.schemaVersion !== 1)
  throw new Error("Versão desconhecida da configuração pública do site.");
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(productSource.version))
  throw new Error("A versão pública do produto é inválida.");
if (!/^\d{10,15}$/.test(productSource.support.whatsapp))
  throw new Error("O WhatsApp de suporte deve conter somente dígitos.");
if (
  productSource.support.email &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(productSource.support.email)
)
  throw new Error("O e-mail de suporte é inválido.");

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || productSource.urls.officialWebsite;
const officialWebsite = httpsUrl(configuredSiteUrl, "urls.officialWebsite");
const absoluteSitePath = (value: unknown, label: string) =>
  new URL(sitePath(value, label), `${officialWebsite}/`).toString();

export const PRODUCT_CONFIG = Object.freeze({
  name: requiredText(productSource.productName, "productName"),
  shortName: requiredText(productSource.shortName, "shortName"),
  version: productSource.version,
  description: requiredText(productSource.description, "description"),
  authorName: requiredText(productSource.authorName, "authorName"),
  copyrightStartYear: productSource.copyrightStartYear,
  trialDays: productSource.trialDays,
  platform: productSource.platform,
  artifacts: productSource.artifacts,
  support: Object.freeze({
    ...productSource.support,
    whatsappUrl: `https://wa.me/${productSource.support.whatsapp}`,
  }),
  urls: Object.freeze({
    officialWebsite,
    technicianPortal: absoluteSitePath(
      productSource.urls.technicianPath,
      "urls.technicianPath",
    ),
    documentation: absoluteSitePath(
      productSource.urls.documentationPath,
      "urls.documentationPath",
    ),
    support: absoluteSitePath(productSource.urls.supportPath, "urls.supportPath"),
    terms: absoluteSitePath(productSource.urls.termsPath, "urls.termsPath"),
    privacy: absoluteSitePath(productSource.urls.privacyPath, "urls.privacyPath"),
    legacyPublicOrigins: Object.freeze(
      productSource.urls.legacyPublicOrigins.map((origin, index) =>
        httpsUrl(origin, `urls.legacyPublicOrigins[${index}]`),
      ),
    ),
    creatorInstagram: httpsUrl(
      productSource.urls.creatorInstagram,
      "urls.creatorInstagram",
    ),
    creatorInstagramHandle: productSource.urls.creatorInstagramHandle,
    releaseRepository: requiredText(
      productSource.urls.releaseRepository,
      "urls.releaseRepository",
    ),
    technicianApi: httpsUrl(
      process.env.NEXT_PUBLIC_TECHNICIAN_API_URL ||
        productSource.urls.technicianApi,
      "urls.technicianApi",
    ),
  }),
});

export const SITE_COMMERCIAL_CONFIG = Object.freeze({
  legalLastUpdated: requiredText(
    siteSource.legalLastUpdated,
    "legalLastUpdated",
  ),
  plans: Object.fromEntries(
    Object.entries(siteSource.plans).map(([key, plan]) => [
      key,
      { ...plan, price: money(plan.priceCents) },
    ]),
  ) as {
    [Key in keyof typeof siteSource.plans]:
      (typeof siteSource.plans)[Key] & { price: string };
  },
});
