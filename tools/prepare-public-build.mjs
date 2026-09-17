import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "dist", "client");
const prerenderRoot = path.join(projectRoot, "dist", "server", "prerendered-routes");

const requiredFiles = [
  "index.html",
  "404.html",
  "recursos.html",
  "planos.html",
  "guia.html",
  "faq.html",
  "privacidade.html",
  "termos.html",
  path.join("tecnico", "index.html"),
  path.join("tecnico", "config.js"),
  path.join("t", "index.html"),
  path.join("acompanhar", "index.html"),
  path.join("acompanhar", "config.js"),
  path.join("a", "index.html"),
  ".nojekyll",
  "favicon.svg",
  "og.png",
  "robots.txt",
  "sitemap.xml",
];

const forbiddenEntries = ["app", "lib", "tools", "node_modules", "server", ".git"];
const publicRoutes = ["recursos", "planos", "guia", "faq", "privacidade", "termos"];

const prerenderMetadata = await stat(prerenderRoot).catch(() => null);
if (prerenderMetadata?.isDirectory()) {
  await cp(prerenderRoot, publicRoot, { recursive: true, force: true });
}

// The technician template is a build input. Only the fully rendered page may
// be exposed by GitHub Pages.
await rm(path.join(publicRoot, "tecnico", "index.template.html"), {
  force: true,
});
await rm(path.join(publicRoot, "acompanhar", "index.template.html"), {
  force: true,
});

// GitHub Pages resolves /recursos but not /recursos/. Preserve both forms so
// links copied from a browser never fall into the generic 404 page.
for (const route of publicRoutes) {
  const routeDirectory = path.join(publicRoot, route);
  await mkdir(routeDirectory, { recursive: true });
  await cp(path.join(publicRoot, `${route}.html`), path.join(routeDirectory, "index.html"), {
    force: true,
  });
}

for (const relativePath of requiredFiles) {
  const file = path.join(publicRoot, relativePath);
  const metadata = await stat(file).catch(() => null);
  if (!metadata?.isFile() || metadata.size === 0) {
    throw new Error(`Build público incompleto: ${relativePath}`);
  }
}

for (const route of publicRoutes) {
  const routeIndex = path.join(publicRoot, route, "index.html");
  const metadata = await stat(routeIndex).catch(() => null);
  if (!metadata?.isFile() || metadata.size === 0)
    throw new Error(`Build público sem compatibilidade com barra final: ${route}/`);
}

const rootEntries = new Set(await readdir(publicRoot));
for (const entry of forbiddenEntries) {
  if (rootEntries.has(entry)) {
    throw new Error(`Entrada privada encontrada no build público: ${entry}`);
  }
}

console.log(`Build público preparado em ${publicRoot}`);
