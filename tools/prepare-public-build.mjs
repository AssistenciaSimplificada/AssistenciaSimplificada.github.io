import { cp, readdir, stat } from "node:fs/promises";
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
  ".nojekyll",
  "favicon.svg",
  "og.png",
  "robots.txt",
  "sitemap.xml",
];

const forbiddenEntries = ["app", "lib", "tools", "node_modules", "server", ".git"];

const prerenderMetadata = await stat(prerenderRoot).catch(() => null);
if (prerenderMetadata?.isDirectory()) {
  await cp(prerenderRoot, publicRoot, { recursive: true, force: true });
}

for (const relativePath of requiredFiles) {
  const file = path.join(publicRoot, relativePath);
  const metadata = await stat(file).catch(() => null);
  if (!metadata?.isFile() || metadata.size === 0) {
    throw new Error(`Build público incompleto: ${relativePath}`);
  }
}

const rootEntries = new Set(await readdir(publicRoot));
for (const entry of forbiddenEntries) {
  if (rootEntries.has(entry)) {
    throw new Error(`Entrada privada encontrada no build público: ${entry}`);
  }
}

console.log(`Build público preparado em ${publicRoot}`);
