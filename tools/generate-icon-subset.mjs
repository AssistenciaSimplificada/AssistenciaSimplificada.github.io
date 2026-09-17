import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoots = [path.join(root, "app"), path.join(root, "lib")];
const iconDirectory = path.join(root, "node_modules", "bootstrap-icons", "icons");
const destination = path.join(root, "app", "styles", "bootstrap-icons-subset.css");
const extensions = new Set([".ts", ".tsx", ".css"]);

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(file));
    else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(file);
  }
  return files;
}

const names = new Set();
for (const sourceRoot of sourceRoots) {
  for (const file of await collectFiles(sourceRoot)) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/\bbi-([a-z0-9-]+)/g)) {
      const name = match[1];
      if ((await stat(path.join(iconDirectory, `${name}.svg`)).catch(() => null))?.isFile())
        names.add(name);
    }
  }
}

if (!names.size) throw new Error("Nenhum ícone usado pelo site foi encontrado.");

const rules = [
  "/* Gerado por tools/generate-icon-subset.mjs. Não editar manualmente. */",
  ".bi { display: inline-block; width: 1em; height: 1em; flex: 0 0 auto; line-height: 1; vertical-align: -.125em; }",
  ".bi::before { content: \"\"; display: block; width: 100%; height: 100%; background-color: currentColor; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; }",
];

for (const name of [...names].sort()) {
  const svg = (await readFile(path.join(iconDirectory, `${name}.svg`), "utf8"))
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!--[^]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const data = encodeURIComponent(svg).replace(/%20/g, " ").replace(/'/g, "%27");
  rules.push(`.bi-${name}::before { -webkit-mask-image: url(\"data:image/svg+xml,${data}\"); mask-image: url(\"data:image/svg+xml,${data}\"); }`);
}

await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, `${rules.join("\n")}\n`, "utf8");
console.log(`Subconjunto de ${names.size} ícones gerado em ${destination}.`);
