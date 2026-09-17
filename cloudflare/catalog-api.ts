export interface Env {
  CATALOG_BUCKET: R2Bucket;
  CATALOG_LOCK: DurableObjectNamespace;
  CATALOG_HMAC_SECRET: string;
  SOURCE_SUPABASE_URL: string;
  SOURCE_SUPABASE_PUBLISHABLE_KEY: string;
}

const SITE_ORIGINS = new Set([
  "https://assistenciasimplificada.site",
  "https://www.assistenciasimplificada.site",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 350 * 1024;
const MAX_ITEMS = 10000;
const encoder = new TextEncoder();

const json = (body: unknown, status = 200, origin = "") => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": status === 200 ? "no-store, max-age=0, must-revalidate" : "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    ...(SITE_ORIGINS.has(origin) ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
  },
});

const base64Url = (bytes: Uint8Array) => {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};

async function publicCode(secret: string, scope: string, value: string, length: number) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signed = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${scope}|${value}`)));
  return base64Url(signed).slice(0, length);
}

const randomCode = (bytes: number) => {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64Url(value);
};
const tokenHash = async (value: string) => base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
const editorKey = (storeCode: string) => `stores/${storeCode}/price-editor.json`;
const priceChangesKey = (storeCode: string) => `stores/${storeCode}/price-changes.json`;
const priceHistoryKey = (storeCode: string) => `stores/${storeCode}/price-history.json`;
const paymentScheduleKey = (storeCode: string, itemCode: string) => `stores/${storeCode}/payment-rates/${itemCode}.json`;
const paymentOverrideKey = (storeCode: string, itemCode: string) => `stores/${storeCode}/payment-overrides/${itemCode}.json`;
const retentionKey = (storeCode: string) => `stores/${storeCode}/retention.json`;
const readJsonObject = async <T>(bucket: R2Bucket, key: string, fallback: T): Promise<T> => {
  const object = await bucket.get(key);
  if (!object) return fallback;
  try { return await object.json<T>(); } catch { return fallback; }
};

async function boundedBody(request: Request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) throw new Error("request_too_large");
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BODY_BYTES) throw new Error("request_too_large");
  const parsed = JSON.parse(new TextDecoder().decode(buffer));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid_request");
  return parsed as Record<string, unknown>;
}

async function sourceJson(env: Env, path: string, authorization: string) {
  const response = await fetch(`${env.SOURCE_SUPABASE_URL.replace(/\/+$/, "")}${path}`, {
    headers: { apikey: env.SOURCE_SUPABASE_PUBLISHABLE_KEY, authorization },
    redirect: "manual",
  });
  if (!response.ok) throw new Error("authentication_required");
  return response.json<unknown>();
}

async function authenticatedStore(env: Env, request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) throw new Error("authentication_required");
  const user = await sourceJson(env, "/auth/v1/user", authorization) as { id?: string };
  if (!user?.id) throw new Error("authentication_required");
  const rows = await sourceJson(
    env,
    `/rest/v1/installations?auth_user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&select=id,store_id,license_id&limit=1`,
    authorization,
  ) as Array<{ id: string; store_id: string; license_id: string }>;
  const installation = rows[0];
  if (!installation?.store_id) throw new Error("authentication_required");
  const stores = await sourceJson(
    env,
    `/rest/v1/stores?id=eq.${encodeURIComponent(installation.store_id)}&status=eq.active&select=id,name&limit=1`,
    authorization,
  ) as Array<{ id: string; name: string }>;
  if (!stores[0]?.name) throw new Error("store_disabled");
  const licenses = await sourceJson(
    env,
    `/rest/v1/licenses?license_id=eq.${encodeURIComponent(installation.license_id)}&status=eq.active&select=starts_at,expires_at,plan&limit=1`,
    authorization,
  ) as Array<{ starts_at?: string; expires_at?: string; plan?: string }>;
  const license = licenses[0];
  const now = Date.now();
  if (!license || (license.starts_at && Date.parse(license.starts_at) > now) || (license.expires_at && Date.parse(license.expires_at) <= now))
    throw new Error("license_expired");
  const rights = await sourceJson(env,
    `/rest/v1/license_rights?license_id=eq.${encodeURIComponent(installation.license_id)}&select=showcase_enabled,showcase_public_link_enabled,showcase_price_editor_enabled,showcase_max_devices,cloud_image_upload_enabled,trial&limit=1`,
    authorization,
  ) as Array<{ showcase_enabled: boolean; showcase_public_link_enabled: boolean; showcase_price_editor_enabled: boolean; showcase_max_devices: number; cloud_image_upload_enabled: boolean; trial: boolean }>;
  if (!rights[0]) throw new Error("license_expired");
  return { id: installation.store_id, name: stores[0].name.trim().slice(0, 160), plan: String(license.plan || ""), expiresAt: license.expires_at || null, rights: rights[0] };
}

type CatalogItem = {
  code: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  deviceType: string;
  purchaseKind: "Novo" | "Usado";
  condition: string;
  color: string;
  availableColors: string[];
  storage: string;
  ram: string;
  batteryHealth: string;
  warranty: string;
  priceCents: number;
  discountPriceCents: number | null;
  conditionDetails: string;
  includedItems: string;
  acceptedPaymentMethods: string[];
  cashDiscountBasisPoints: number;
  cashDiscountMethods: string[];
  cashPriceCents: number;
  paymentMachineName: string;
  interestFreeInstallments: number;
  maxInstallments: number;
  availability: "ready" | "order" | "unavailable";
  orderLeadTime: string;
  specsUrl: string | null;
  interestInstallment: { installments: number; totalCents: number; installmentCents: number; rateBasisPoints: number } | null;
  interestInstallments: { installments: number; totalCents: number; installmentCents: number; rateBasisPoints: number }[];
  featured: boolean;
  salesCount: number;
  imageUrls: string[];
  updatedAt: string;
  priceUpdatedAt?: string | null;
};
type Manifest = { storeCode: string; storeName: string; storePhone: string; primaryColor: string; logoUrl: string; updatedAt: string; items: CatalogItem[] };
type PriceEditorRecord = { tokenHash: string; pinHash: string; expiresAt: string; failedAttempts: number; lockedUntil: string | null };
type RetentionRecord = { storeId?: string; plan: string; licenseExpiresAt: string | null; refreshedAt: string };
type PriceChange = { id: string; itemCode: string; priceCents: number; discountPriceCents: number | null; interestFreeInstallments?: number; interestMaxInstallments?: number; previousPriceCents: number; previousDiscountPriceCents: number | null; previousInterestFreeInstallments?: number; previousInterestMaxInstallments?: number; changedAt: string };
type PaymentSchedule = { maximum: number; rates: { installments: number; rateBasisPoints: number }[] };

const clean = (value: unknown, max: number) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
const cleanMultiline = (value: unknown, max: number) => String(value || "").replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").trim().slice(0, max);
const snapshot = (input: unknown): Omit<CatalogItem, "code" | "imageUrls"> => {
  const value = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const priceCents = Number(value.priceCents);
  const discountInput = Number(value.discountPriceCents);
  const discountPriceCents = Number.isInteger(discountInput) && discountInput > 0 && discountInput < priceCents
    ? discountInput
    : null;
  const updatedAt = clean(value.updatedAt, 40);
  const acceptedPaymentMethods = [...new Set((Array.isArray(value.acceptedPaymentMethods) ? value.acceptedPaymentMethods : []).map((entry) => clean(entry, 40)).filter((entry) => ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito"].includes(entry)))];
  const cashDiscountMethods = [...new Set((Array.isArray(value.cashDiscountMethods) ? value.cashDiscountMethods : []).map((entry) => clean(entry, 20)).filter((entry) => entry === "Pix" || entry === "Dinheiro"))];
  const cashDiscountBasisPoints = Math.min(3000, Math.max(0, Math.trunc(Number(value.cashDiscountBasisPoints) || 0)));
  const cashPriceCents = Math.max(1, Math.min(priceCents, Math.trunc(Number(value.cashPriceCents) || priceCents)));
  const interestFreeInstallments = Math.min(24, Math.max(1, Math.trunc(Number(value.interestFreeInstallments) || 1)));
  const maxInstallments = Math.min(24, Math.max(interestFreeInstallments, Math.trunc(Number(value.maxInstallments) || interestFreeInstallments)));
  const basePriceCents = discountPriceCents || priceCents;
  const rawInterest = value.interestInstallment && typeof value.interestInstallment === "object" && !Array.isArray(value.interestInstallment) ? value.interestInstallment as Record<string, unknown> : null;
  const interestInstallment = rawInterest && Number(rawInterest.installments) > interestFreeInstallments ? {
    installments: Math.min(24, Math.max(2, Math.trunc(Number(rawInterest.installments)))),
    totalCents: Math.max(basePriceCents, Math.trunc(Number(rawInterest.totalCents) || basePriceCents)),
    installmentCents: Math.max(1, Math.trunc(Number(rawInterest.installmentCents) || 1)),
    rateBasisPoints: Math.min(10000, Math.max(1, Math.trunc(Number(rawInterest.rateBasisPoints) || 1))),
  } : null;
  const interestInstallments = (Array.isArray(value.interestInstallments) ? value.interestInstallments : interestInstallment ? [interestInstallment] : [])
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object" && !Array.isArray(entry)))
    .map((entry) => ({
      installments: Math.trunc(Number(entry.installments)),
      totalCents: Math.trunc(Number(entry.totalCents)),
      installmentCents: Math.trunc(Number(entry.installmentCents)),
      rateBasisPoints: Math.trunc(Number(entry.rateBasisPoints)),
    }))
    .filter((entry) => entry.installments > interestFreeInstallments && entry.installments <= maxInstallments && entry.totalCents >= basePriceCents && entry.totalCents <= basePriceCents * 2 && entry.installmentCents >= Math.ceil(entry.totalCents / entry.installments) && entry.installmentCents <= Math.ceil(entry.totalCents / entry.installments) + 1 && entry.rateBasisPoints > 0 && entry.rateBasisPoints <= 10000)
    .sort((a, b) => a.installments - b.installments)
    .filter((entry, index, entries) => index === 0 || entry.installments !== entries[index - 1].installments)
    .slice(0, 24);
  const item = {
    title: clean(value.title, 120), description: cleanMultiline(value.description, 700),
    brand: clean(value.brand, 80), model: clean(value.model, 120), deviceType: clean(value.deviceType, 40),
    purchaseKind: value.purchaseKind === "Novo" ? "Novo" as const : "Usado" as const,
    condition: clean(value.condition, 100), color: clean(value.color, 80), availableColors: [...new Set((Array.isArray(value.availableColors) ? value.availableColors : [value.color]).map((entry) => clean(entry, 40)).filter(Boolean))].slice(0, 8), storage: clean(value.storage, 40),
    ram: clean(value.ram, 40), batteryHealth: clean(value.batteryHealth, 80), warranty: clean(value.warranty, 120),
    priceCents, discountPriceCents,
    conditionDetails: cleanMultiline(value.conditionDetails, 300), includedItems: cleanMultiline(value.includedItems, 240),
    acceptedPaymentMethods, cashDiscountBasisPoints, cashDiscountMethods, cashPriceCents,
    paymentMachineName: clean(value.paymentMachineName, 40), interestFreeInstallments, maxInstallments, interestInstallment: interestInstallments.at(-1) || null, interestInstallments,
    availability: value.availability === "order" ? "order" as const : value.availability === "unavailable" ? "unavailable" as const : "ready" as const,
    orderLeadTime: value.availability === "order" ? clean(value.orderLeadTime, 80) : "",
    specsUrl: /^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9._~!$&'()*+,;=:@%/#?-]*$/.test(String(value.specsUrl || "")) ? String(value.specsUrl) : null,
    featured: value.featured === true,
    salesCount: Math.max(0, Math.min(1_000_000, Math.trunc(Number(value.salesCount) || 0))),
    updatedAt,
    priceUpdatedAt: /^\d{4}-\d{2}-\d{2}T/.test(String(value.priceUpdatedAt || "")) ? clean(value.priceUpdatedAt, 40) : null,
  };
  if (!item.title || !item.brand || !item.model || !Number.isInteger(priceCents) || priceCents <= 0 || priceCents > 1_000_000_000 || !/^\d{4}-\d{2}-\d{2}T/.test(updatedAt))
    throw new Error("invalid_item");
  return item;
};

const paymentSchedule = (value: Record<string, unknown>, fallback?: CatalogItem): PaymentSchedule => {
  const source = Array.isArray(value.paymentRateSchedule) ? value.paymentRateSchedule : Array.isArray(value.rates) ? value.rates : fallback?.interestInstallments || [];
  const fallbackMaximum = Math.max(Number(fallback?.interestFreeInstallments) || 1, Number(fallback?.maxInstallments) || 1, ...source.map((entry) => Number(entry?.installments) || 1));
  const maximum = Math.min(24, Math.max(1, Math.trunc(Number(value.paymentMaximumInstallments ?? value.maximum) || fallbackMaximum)));
  const rates = source
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object" && !Array.isArray(entry)))
    .map((entry) => ({ installments: Number(entry.installments), rateBasisPoints: Number(entry.rateBasisPoints) }))
    .filter((entry) => Number.isInteger(entry.installments) && entry.installments > 1 && entry.installments <= maximum && Number.isInteger(entry.rateBasisPoints) && entry.rateBasisPoints > 0 && entry.rateBasisPoints <= 10000)
    .sort((a, b) => a.installments - b.installments)
    .filter((entry, index, entries) => index === 0 || entry.installments !== entries[index - 1].installments);
  return { maximum, rates };
};

const readPaymentSchedule = async (env: Env, storeCode: string, item: CatalogItem) => {
  const stored = await readJsonObject<Record<string, unknown> | null>(env.CATALOG_BUCKET, paymentScheduleKey(storeCode, item.code), null);
  return paymentSchedule(stored || {}, item);
};

function image(input: unknown) {
  const match = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(input || ""));
  if (!match) throw new Error("invalid_image");
  const bytes = Uint8Array.from(atob(match[2]), character => character.charCodeAt(0));
  if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("invalid_image");
  return { bytes, type: match[1] === "jpeg" ? "image/jpeg" : `image/${match[1]}` };
}

async function readManifest(env: Env, storeCode: string, storeName = ""): Promise<Manifest> {
  const object = await env.CATALOG_BUCKET.get(`stores/${storeCode}/catalog.json`);
  if (!object) return { storeCode, storeName, storePhone: "", primaryColor: "#E1BD00", logoUrl: "", updatedAt: new Date().toISOString(), items: [] };
  const parsed = await object.json<Manifest>();
  const recentUnavailableCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const items = Array.isArray(parsed.items) ? parsed.items.slice(0, MAX_ITEMS).filter((item) =>
    item.availability !== "unavailable" || Date.parse(String(item.updatedAt || "")) >= recentUnavailableCutoff,
  ).map((item) => ({
    ...item,
    availability: (item.availability === "order" ? "order" : item.availability === "unavailable" ? "unavailable" : "ready") as Manifest["items"][number]["availability"],
    orderLeadTime: item.availability === "order" ? clean(item.orderLeadTime, 80) : "",
    availableColors: Array.isArray(item.availableColors) && item.availableColors.length ? item.availableColors.slice(0, 8) : (item.color ? [item.color] : []),
  })) : [];
  return { storeCode, storeName: clean(parsed.storeName || storeName, 160), storePhone: clean(parsed.storePhone, 24), primaryColor: /^#[0-9a-f]{6}$/i.test(parsed.primaryColor || "") ? parsed.primaryColor : "#E1BD00", logoUrl: /^\/media\/[A-Za-z0-9_/-]+\.webp$/.test(parsed.logoUrl || "") ? parsed.logoUrl : "", updatedAt: parsed.updatedAt, items };
}

async function removePrefix(bucket: R2Bucket, prefix: string) {
  while (true) {
    const page = await bucket.list({ prefix, limit: 100 });
    if (!page.objects.length) break;
    if (page.objects.length) await bucket.delete(page.objects.map(object => object.key));
  }
}

async function refreshRetention(env: Env, storeCode: string, store: { id: string; plan: string; expiresAt: string | null }) {
  const record: RetentionRecord = { storeId: store.id, plan: store.plan, licenseExpiresAt: store.expiresAt, refreshedAt: new Date().toISOString() };
  await env.CATALOG_BUCKET.put(retentionKey(storeCode), JSON.stringify(record), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
}

async function requireCurrentCatalogLicense(env: Env, storeCode: string, feature: "catalog" | "priceEditor" = "catalog") {
  const retention = await readJsonObject<RetentionRecord | null>(env.CATALOG_BUCKET, retentionKey(storeCode), null);
  if (retention?.licenseExpiresAt && Date.parse(retention.licenseExpiresAt) <= Date.now()) throw new Error("license_expired");
  // Catalogs written before the rights projection did not persist the internal
  // store id. Keep them reachable until the next authenticated synchronization
  // writes the new record, rather than taking existing stores offline on deploy.
  if (!retention?.storeId) return;
  const response = await fetch(`${env.SOURCE_SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/rpc/public_catalog_access_v1`, {
    method: "POST",
    headers: { apikey: env.SOURCE_SUPABASE_PUBLISHABLE_KEY, authorization: `Bearer ${env.SOURCE_SUPABASE_PUBLISHABLE_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ p_store_id: retention.storeId }),
  });
  if (!response.ok) throw new Error("service_unavailable");
  const access = await response.json<{ catalog?: boolean; priceEditor?: boolean }>();
  if (!access?.[feature]) throw new Error("license_expired");
}

async function admin(request: Request, env: Env) {
  const store = await authenticatedStore(env, request);
  if (!store.rights.showcase_enabled) throw new Error("feature_unavailable");
  const body = await boundedBody(request);
  const action = String(body.action || "");
  const localItemId = clean(body.localItemId, 100);
  if (!localItemId || !["upsert", "delete"].includes(action)) throw new Error("invalid_request");
  const storeCode = await publicCode(env.CATALOG_HMAC_SECRET, "store", store.id, 12);
  await refreshRetention(env, storeCode, store);
  const itemCode = await publicCode(env.CATALOG_HMAC_SECRET, "item", `${store.id}|${localItemId}`, 10);
  const prefix = `stores/${storeCode}/items/${itemCode}/`;
  const storedCatalog = await readJsonObject<Partial<Manifest> | null>(env.CATALOG_BUCKET, `stores/${storeCode}/catalog.json`, null);
  const expiredCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const expiredCodes = (Array.isArray(storedCatalog?.items) ? storedCatalog.items : [])
    .filter(item => item.availability === "unavailable" && Date.parse(String(item.updatedAt || "")) < expiredCutoff && /^[A-Za-z0-9_-]{10}$/.test(item.code))
    .map(item => item.code);
  for (const code of expiredCodes) await removePrefix(env.CATALOG_BUCKET, `stores/${storeCode}/items/${code}/`);
  const manifest = await readManifest(env, storeCode, store.name);
  const existingItem = manifest.items.find(item => item.code === itemCode);
  let prepared: Omit<CatalogItem, "code" | "imageUrls"> | null = null;
  if (action === "upsert") {
    if (!store.rights.cloud_image_upload_enabled) throw new Error("feature_unavailable");
    prepared = snapshot(body.snapshot);
    const used = manifest.items.filter(item => item.availability !== "unavailable").length;
    const wasPublished = existingItem?.availability !== "unavailable" && Boolean(existingItem);
    const willPublish = prepared.availability !== "unavailable";
    if (willPublish && !wasPublished && used >= store.rights.showcase_max_devices)
      throw new Error("catalog_limit_reached");
  }
  if (action === "upsert") {
    manifest.storeName = clean(body.storeName, 160) || store.name;
    manifest.storePhone = clean(body.storePhone, 24);
    manifest.primaryColor = /^#[0-9a-f]{6}$/i.test(String(body.primaryColor || "")) ? String(body.primaryColor) : "#E1BD00";
    const logoKey = `stores/${storeCode}/logo.webp`;
    if (body.storeLogo) {
      const logo = image(body.storeLogo);
      await env.CATALOG_BUCKET.put(logoKey, logo.bytes, { httpMetadata: { contentType: logo.type, cacheControl: "public, max-age=300" } });
      manifest.logoUrl = `/media/${storeCode}/logo.webp`;
    } else {
      await env.CATALOG_BUCKET.delete(logoKey);
      manifest.logoUrl = "";
    }
  }
  manifest.updatedAt = new Date().toISOString();
  manifest.items = manifest.items.filter(item => item.code !== itemCode);
  if (action === "delete") {
    await env.CATALOG_BUCKET.delete([paymentScheduleKey(storeCode, itemCode), paymentOverrideKey(storeCode, itemCode)]);
    // Preserve the recent announcement as a clear unavailable card after a
    // sale or removal, instead of leaving a broken public link.
    if (existingItem) {
      manifest.items.push({ ...existingItem, availability: "unavailable", orderLeadTime: "", updatedAt: manifest.updatedAt });
      manifest.items.sort((a, b) => Number(b.salesCount || 0) - Number(a.salesCount || 0) || Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
    }
  } else {
    await removePrefix(env.CATALOG_BUCKET, prefix);
  }
  if (action === "upsert") {
    if (manifest.items.length >= MAX_ITEMS) throw new Error("catalog_limit_reached");
    let data = prepared!;
    const rawSnapshot = body.snapshot && typeof body.snapshot === "object" && !Array.isArray(body.snapshot) ? body.snapshot as Record<string, unknown> : {};
    const override = await readJsonObject<{ interestFreeInstallments: number; interestMaxInstallments: number } | null>(env.CATALOG_BUCKET, paymentOverrideKey(storeCode, itemCode), null);
    if (Array.isArray(rawSnapshot.paymentRateSchedule)) {
      const schedule = paymentSchedule(rawSnapshot, { code: itemCode, ...data, imageUrls: [] });
      await env.CATALOG_BUCKET.put(paymentScheduleKey(storeCode, itemCode), JSON.stringify(schedule), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
      if (override) await env.CATALOG_BUCKET.delete(paymentOverrideKey(storeCode, itemCode));
    } else if (override) {
      const schedule = await readPaymentSchedule(env, storeCode, { code: itemCode, ...data, imageUrls: [] });
      data = { ...data, ...recalculatePrices({ code: itemCode, ...data, imageUrls: [] }, data.priceCents, data.discountPriceCents, override.interestFreeInstallments, override.interestMaxInstallments, schedule) };
    }
    const supplied = Array.isArray(body.images) ? body.images.slice(0, store.rights.trial ? 2 : 5) : [];
    if (!supplied.length) throw new Error("image_required");
    const imageUrls: string[] = [];
    for (let index = 0; index < supplied.length; index += 1) {
      const media = image(supplied[index]);
      if (store.rights.trial && media.bytes.byteLength > 150 * 1024) throw new Error("invalid_image");
      const extension = media.type === "image/webp" ? "webp" : media.type === "image/png" ? "png" : "jpg";
      const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", media.bytes));
      const imageRevision = Array.from(digest.slice(0, 8), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const key = `${prefix}${index + 1}-${imageRevision}.${extension}`;
      await env.CATALOG_BUCKET.put(key, media.bytes, { httpMetadata: { contentType: media.type, cacheControl: "public, max-age=31536000, immutable" } });
      imageUrls.push(`/media/${storeCode}/${itemCode}/${index + 1}-${imageRevision}.${extension}`);
    }
    manifest.items.push({ code: itemCode, ...data, imageUrls });
    manifest.items.sort((a, b) => b.salesCount - a.salesCount || Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
  }
  await env.CATALOG_BUCKET.put(`stores/${storeCode}/catalog.json`, JSON.stringify(manifest), {
    httpMetadata: { contentType: "application/json", cacheControl: "public, max-age=60" },
  });
  return json({ storeCode, itemCode, action, publicUrl: `https://assistenciasimplificada.site/v/#${storeCode}/${itemCode}`, updatedAt: manifest.updatedAt });
}

async function priceEditorManage(request: Request, env: Env) {
  const store = await authenticatedStore(env, request);
  const body = await boundedBody(request);
  const action = clean(body.action, 20);
  const storeCode = await publicCode(env.CATALOG_HMAC_SECRET, "store", store.id, 12);
  await refreshRetention(env, storeCode, store);
  if (action === "create") {
    if (!store.rights.showcase_enabled || !store.rights.showcase_public_link_enabled || !store.rights.showcase_price_editor_enabled)
      throw new Error("feature_unavailable");
    const token = randomCode(32);
    const pin = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    const hash = await tokenHash(token);
    const days = Math.min(180, Math.max(1, Math.trunc(Number(body.expiresDays) || 90)));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const record: PriceEditorRecord = {
      tokenHash: hash,
      pinHash: await publicCode(env.CATALOG_HMAC_SECRET, "price-editor-pin", `${hash}|${pin}`, 43),
      expiresAt,
      failedAttempts: 0,
      lockedUntil: null,
    };
    await env.CATALOG_BUCKET.put(editorKey(storeCode), JSON.stringify(record), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
    return json({ url: `https://assistenciasimplificada.site/v/precos/#${storeCode}/${token}`, pin, expiresAt, storeCode });
  }
  if (action === "revoke") {
    await env.CATALOG_BUCKET.delete(editorKey(storeCode));
    return json({ revoked: true });
  }
  const changes = await readJsonObject<PriceChange[]>(env.CATALOG_BUCKET, priceChangesKey(storeCode), []);
  if (action === "pull") return json({ changes: changes.slice(0, 200) });
  if (action === "ack") {
    const ids = new Set((Array.isArray(body.ids) ? body.ids : []).map(value => clean(value, 64)).filter(Boolean).slice(0, 200));
    const remaining = changes.filter(change => !ids.has(change.id));
    await env.CATALOG_BUCKET.put(priceChangesKey(storeCode), JSON.stringify(remaining), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
    return json({ acknowledged: changes.length - remaining.length });
  }
  throw new Error("invalid_request");
}

async function authenticatePriceEditor(env: Env, body: Record<string, unknown>) {
  const storeCode = clean(body.storeCode, 16);
  const token = clean(body.token, 100);
  const pin = String(body.pin || "").replace(/\D/g, "");
  if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode) || !/^[A-Za-z0-9_-]{40,60}$/.test(token) || !/^\d{6}$/.test(pin)) throw new Error("editor_authentication_required");
  await requireCurrentCatalogLicense(env, storeCode, "priceEditor");
  const key = editorKey(storeCode);
  const record = await readJsonObject<PriceEditorRecord | null>(env.CATALOG_BUCKET, key, null);
  if (!record || Date.parse(record.expiresAt) <= Date.now()) throw new Error("editor_expired");
  if (record.lockedUntil && Date.parse(record.lockedUntil) > Date.now()) throw new Error("editor_locked");
  const hash = await tokenHash(token);
  const pinHash = await publicCode(env.CATALOG_HMAC_SECRET, "price-editor-pin", `${hash}|${pin}`, 43);
  if (hash !== record.tokenHash || pinHash !== record.pinHash) {
    const failedAttempts = Number(record.failedAttempts || 0) + 1;
    const next = { ...record, failedAttempts: failedAttempts >= 5 ? 0 : failedAttempts, lockedUntil: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null };
    await env.CATALOG_BUCKET.put(key, JSON.stringify(next), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
    throw new Error(failedAttempts >= 5 ? "editor_locked" : "editor_authentication_required");
  }
  if (record.failedAttempts || record.lockedUntil)
    await env.CATALOG_BUCKET.put(key, JSON.stringify({ ...record, failedAttempts: 0, lockedUntil: null }), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
  return { storeCode, record };
}

const recalculatePrices = (item: CatalogItem, priceCents: number, discountPriceCents: number | null, interestFreeInstallments: number, interestMaxInstallments: number, schedule: PaymentSchedule) => {
  const base = discountPriceCents || priceCents;
  const cashPriceCents = Math.max(1, Math.round(base * (1 - Number(item.cashDiscountBasisPoints || 0) / 10000)));
  const interestInstallments = schedule.rates.filter(term => term.installments > interestFreeInstallments && term.installments <= interestMaxInstallments).map(term => {
    const totalCents = Math.round(base * (1 + Number(term.rateBasisPoints || 0) / 10000));
    return { ...term, totalCents, installmentCents: Math.ceil(totalCents / term.installments) };
  });
  return { priceCents, discountPriceCents, cashPriceCents, interestFreeInstallments, maxInstallments: interestMaxInstallments, interestInstallments, interestInstallment: interestInstallments.at(-1) || null };
};

async function priceEditorSession(request: Request, env: Env) {
  const body = await boundedBody(request);
  const { storeCode, record } = await authenticatePriceEditor(env, body);
  const manifest = await readManifest(env, storeCode);
  if (!manifest.storeName) throw new Error("catalog_not_found");
  const items = await Promise.all(manifest.items.map(async (item) => {
    const schedule = await readPaymentSchedule(env, storeCode, item);
    return { code: item.code, title: item.title, purchaseKind: item.purchaseKind, availability: item.availability, imageUrl: item.imageUrls[0] || "", priceCents: item.priceCents, discountPriceCents: item.discountPriceCents, interestFreeInstallments: Number(item.interestFreeInstallments) || 1, interestMaxInstallments: Number(item.maxInstallments) || schedule.maximum, paymentMaximumInstallments: schedule.maximum, availableWithInterest: schedule.rates.map(rate => rate.installments), updatedAt: item.updatedAt };
  }));
  return json({ storeName: manifest.storeName, expiresAt: record.expiresAt, items }, 200, request.headers.get("origin") || "");
}

async function priceEditorUpdate(request: Request, env: Env) {
  const body = await boundedBody(request);
  const { storeCode } = await authenticatePriceEditor(env, body);
  const updates = Array.isArray(body.changes) ? body.changes.slice(0, MAX_ITEMS) : [];
  if (!updates.length) throw new Error("invalid_request");
  const manifest = await readManifest(env, storeCode);
  const now = new Date().toISOString();
  const applied: PriceChange[] = [];
  const schedules: { itemCode: string; schedule: PaymentSchedule }[] = [];
  const overrides: { itemCode: string; interestFreeInstallments: number; interestMaxInstallments: number }[] = [];
  for (const raw of updates) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("invalid_request");
    const value = raw as Record<string, unknown>;
    const code = clean(value.itemCode, 16);
    const item = manifest.items.find(entry => entry.code === code);
    const priceCents = Math.trunc(Number(value.priceCents));
    const discountInput = value.discountPriceCents == null || value.discountPriceCents === "" ? null : Math.trunc(Number(value.discountPriceCents));
    if (!item || !Number.isInteger(priceCents) || priceCents <= 0 || priceCents > 1_000_000_000 || (discountInput != null && (!Number.isInteger(discountInput) || discountInput <= 0 || discountInput >= priceCents))) throw new Error("invalid_price");
    const schedule = await readPaymentSchedule(env, storeCode, item);
    const interestFreeInstallments = Number(value.interestFreeInstallments ?? item.interestFreeInstallments ?? 1);
    const interestMaxInstallments = Number(value.interestMaxInstallments ?? item.maxInstallments ?? schedule.maximum);
    if (!Number.isInteger(interestFreeInstallments) || interestFreeInstallments < 1 || interestFreeInstallments > schedule.maximum || !Number.isInteger(interestMaxInstallments) || interestMaxInstallments < interestFreeInstallments || interestMaxInstallments > schedule.maximum || (interestMaxInstallments > interestFreeInstallments && !schedule.rates.some(rate => rate.installments === interestMaxInstallments))) throw new Error("invalid_installments");
    const priceChanged = item.priceCents !== priceCents || item.discountPriceCents !== discountInput;
    const termsChanged = Number(item.interestFreeInstallments || 1) !== interestFreeInstallments || Number(item.maxInstallments || schedule.maximum) !== interestMaxInstallments;
    if (!priceChanged && !termsChanged) continue;
    const change: PriceChange = { id: randomCode(18), itemCode: code, priceCents, discountPriceCents: discountInput, interestFreeInstallments, interestMaxInstallments, previousPriceCents: item.priceCents, previousDiscountPriceCents: item.discountPriceCents, previousInterestFreeInstallments: Number(item.interestFreeInstallments) || 1, previousInterestMaxInstallments: Number(item.maxInstallments) || schedule.maximum, changedAt: now };
    Object.assign(item, recalculatePrices(item, priceCents, discountInput, interestFreeInstallments, interestMaxInstallments, schedule), { updatedAt: now, ...(priceChanged ? { priceUpdatedAt: now } : {}) });
    applied.push(change);
    schedules.push({ itemCode: code, schedule });
    if (termsChanged) overrides.push({ itemCode: code, interestFreeInstallments, interestMaxInstallments });
  }
  if (!applied.length) return json({ updated: 0 }, 200, request.headers.get("origin") || "");
  manifest.updatedAt = now;
  const pending = await readJsonObject<PriceChange[]>(env.CATALOG_BUCKET, priceChangesKey(storeCode), []);
  const changedCodes = new Set(applied.map(change => change.itemCode));
  const nextPending = [...pending.filter(change => !changedCodes.has(change.itemCode)), ...applied].slice(-200);
  const history = await readJsonObject<PriceChange[]>(env.CATALOG_BUCKET, priceHistoryKey(storeCode), []);
  await Promise.all([
    env.CATALOG_BUCKET.put(`stores/${storeCode}/catalog.json`, JSON.stringify(manifest), { httpMetadata: { contentType: "application/json", cacheControl: "public, max-age=60" } }),
    env.CATALOG_BUCKET.put(priceChangesKey(storeCode), JSON.stringify(nextPending), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } }),
    env.CATALOG_BUCKET.put(priceHistoryKey(storeCode), JSON.stringify([...history, ...applied].slice(-200)), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } }),
    ...schedules.map(({ itemCode, schedule }) => env.CATALOG_BUCKET.put(paymentScheduleKey(storeCode, itemCode), JSON.stringify(schedule), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } })),
    ...overrides.map(({ itemCode, interestFreeInstallments, interestMaxInstallments }) => env.CATALOG_BUCKET.put(paymentOverrideKey(storeCode, itemCode), JSON.stringify({ interestFreeInstallments, interestMaxInstallments }), { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } })),
  ]);
  return json({ updated: applied.length, updatedAt: now }, 200, request.headers.get("origin") || "");
}

async function publicRequest(request: Request, env: Env, parts: string[]) {
  const origin = request.headers.get("origin") || "";
  const storeCode = clean(parts[1], 16);
  const itemCode = clean(parts[2], 16);
  if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode)) return json({ error: "catalog_not_found" }, 404, origin);
  await requireCurrentCatalogLicense(env, storeCode);
  const manifest = await readManifest(env, storeCode);
  if (!manifest.storeName) return json({ error: "catalog_not_found" }, 404, origin);
  if (!itemCode) return json({ catalog: manifest }, 200, origin);
  const item = manifest.items.find(entry => entry.code === itemCode);
  return item ? json({ catalog: { ...manifest, items: [item] } }, 200, origin) : json({ error: "item_not_found", catalog: manifest }, 404, origin);
}

const htmlEscape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);

async function sharePage(request: Request, env: Env, parts: string[]) {
  const storeCode = String(parts[1] || "");
  const itemCode = String(parts[2] || "");
  if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode) || (itemCode && !/^[A-Za-z0-9_-]{10}$/.test(itemCode)) || parts.length > 3)
    return new Response("Vitrine não encontrada.", { status: 404 });
  await requireCurrentCatalogLicense(env, storeCode);
  const manifest = await readManifest(env, storeCode);
  if (!manifest.storeName) return new Response("Vitrine não encontrada.", { status: 404 });
  const item = itemCode ? manifest.items.find((entry) => entry.code === itemCode) : null;
  if (itemCode && !item) return new Response("Aparelho não encontrado.", { status: 404 });
  const title = item ? `${item.title} — ${manifest.storeName}` : `Vitrine — ${manifest.storeName}`;
  const description = item
    ? `${item.title} na vitrine de ${manifest.storeName}. Consulte preço e disponibilidade.`
    : `Confira os aparelhos novos e seminovos da ${manifest.storeName}.`;
  const imagePath = item?.imageUrls?.[0] || manifest.logoUrl;
  const imageUrl = imagePath ? `https://catalogo.assistenciasimplificada.site${imagePath}` : "https://assistenciasimplificada.site/favicon.svg";
  const destination = `https://assistenciasimplificada.site/v/#${storeCode}${itemCode ? `/${itemCode}` : ""}`;
  const shareUrl = new URL(request.url).href;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${htmlEscape(title)}</title><meta name="description" content="${htmlEscape(description)}"><meta property="og:type" content="${item ? "product" : "website"}"><meta property="og:title" content="${htmlEscape(title)}"><meta property="og:description" content="${htmlEscape(description)}"><meta property="og:image" content="${htmlEscape(imageUrl)}"><meta property="og:url" content="${htmlEscape(shareUrl)}"><meta name="twitter:card" content="summary_large_image"><script>location.replace(${JSON.stringify(destination)})</script></head><body><p>Abra a <a href="${htmlEscape(destination)}">vitrine de ${htmlEscape(manifest.storeName)}</a>.</p></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store, max-age=0", "x-content-type-options": "nosniff" } });
}

async function media(request: Request, env: Env, parts: string[], ctx: ExecutionContext) {
  const [storeCode, itemCode, file] = parts.slice(1);
  const isLogo = itemCode === "logo.webp" && !file;
  if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode || "") || (!isLogo && (!/^[A-Za-z0-9_-]{10}$/.test(itemCode || "") || !/^\d+(?:-[a-f0-9]{16})?\.(?:webp|png|jpg)$/.test(file || ""))))
    return new Response(null, { status: 404 });
  await requireCurrentCatalogLicense(env, storeCode);
  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(request);
  if (cached) return cached;
  const object = await env.CATALOG_BUCKET.get(isLogo ? `stores/${storeCode}/logo.webp` : `stores/${storeCode}/items/${itemCode}/${file}`);
  if (!object) return new Response(null, { status: 404 });
  const response = new Response(object.body, { headers: {
    "content-type": object.httpMetadata?.contentType || "image/webp",
    "cache-control": isLogo ? "public, max-age=300" : "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
  }});
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}

const catalogApi = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const url = new URL(request.url);
      const parts = url.pathname.split("/").filter(Boolean);
      if (request.method === "GET" && parts.length === 0)
        return Response.redirect("https://assistenciasimplificada.site/v/", 302);
      if (request.method === "OPTIONS") {
        const origin = request.headers.get("origin") || "";
        if (!SITE_ORIGINS.has(origin)) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "600",
        }});
      }
      if (parts[0] === "admin" && request.method === "POST") {
        const store = await authenticatedStore(env, request);
        const storeCode = await publicCode(env.CATALOG_HMAC_SECRET, "store", store.id, 12);
        return await env.CATALOG_LOCK.get(env.CATALOG_LOCK.idFromName(storeCode)).fetch(request);
      }
      if (parts[0] === "price-editor" && parts[1] === "manage" && request.method === "POST") return await priceEditorManage(request, env);
      if (parts[0] === "price-editor" && parts[1] === "session" && request.method === "POST") return await priceEditorSession(request, env);
      if (parts[0] === "price-editor" && parts[1] === "update" && request.method === "POST") {
        const body = await boundedBody(request.clone() as Request);
        const storeCode = clean(body.storeCode, 16);
        if (!/^[A-Za-z0-9_-]{12}$/.test(storeCode)) throw new Error("editor_authentication_required");
        return await env.CATALOG_LOCK.get(env.CATALOG_LOCK.idFromName(storeCode)).fetch(request);
      }
      if (parts[0] === "public" && request.method === "GET") return await publicRequest(request, env, parts);
      if (parts[0] === "share" && request.method === "GET") return await sharePage(request, env, parts);
      if (parts[0] === "media" && request.method === "GET") {
        return await media(request, env, parts, ctx);
      }
      return json({ error: "not_found" }, 404, request.headers.get("origin") || "");
    } catch (error) {
      const code = error instanceof Error ? error.message : "unexpected_error";
      const status = code === "authentication_required" || code === "editor_authentication_required" ? 401 : code === "store_disabled" || code === "license_expired" || code === "editor_expired" || code === "feature_unavailable" ? 403 : code === "editor_locked" ? 429 : ["invalid_request", "invalid_item", "invalid_image", "image_required", "invalid_price", "invalid_installments"].includes(code) ? 400 : code === "catalog_limit_reached" ? 409 : code === "request_too_large" ? 413 : code === "catalog_not_found" ? 404 : 503;
      if (status >= 500) console.error("catalog_request_failed", {
        code,
        name: error instanceof Error ? error.name : "Error",
      });
      return json({ error: code === "request_too_large" ? code : code === "catalog_limit_reached" ? code : status >= 500 ? "service_unavailable" : code }, status);
    }
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => {
      let cursor: string | undefined;
      do {
        const page = await env.CATALOG_BUCKET.list({ prefix: "stores/", cursor, limit: 1000 });
        const retentionObjects = page.objects.filter(object => /\/retention\.json$/.test(object.key));
        for (const object of retentionObjects) {
          const storeCode = object.key.split("/")[1] || "";
          const retention = await readJsonObject<RetentionRecord | null>(env.CATALOG_BUCKET, object.key, null);
          if (!retention?.licenseExpiresAt) continue;
          const graceDays = retention.plan === "TRIAL_DAY" || retention.plan === "TRIAL_WEEK" ? 2 : 7;
          if (Date.parse(retention.licenseExpiresAt) + graceDays * 86_400_000 <= Date.now())
            await removePrefix(env.CATALOG_BUCKET, `stores/${storeCode}/`);
        }
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);
    })());
  },
};

export class CatalogLock {
  private tail: Promise<void> = Promise.resolve();
  private env: Env;
  constructor(_state: DurableObjectState, env: Env) { this.env = env; }
  async fetch(request: Request): Promise<Response> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>(resolve => { release = resolve; });
    await previous;
    try {
      const path = new URL(request.url).pathname;
      if (path === "/admin") return await admin(request, this.env);
      if (path === "/price-editor/update") return await priceEditorUpdate(request, this.env);
      return new Response(null, { status: 404 });
    } finally { release(); }
  }
}

export default catalogApi;
