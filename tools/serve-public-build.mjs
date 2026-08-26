import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

const publicRoot = path.resolve(process.cwd(), "dist", "client");
const port = Number(process.env.PORT || 4175);
const host = "127.0.0.1";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".rsc", "text/x-component; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function resolvePublicFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?", 1)[0]);
  const normalizedPath = path.posix.normalize(decodedPath).replace(/^\/+/, "");
  const candidates = normalizedPath
    ? [normalizedPath, `${normalizedPath}.html`, path.join(normalizedPath, "index.html")]
    : ["index.html"];

  for (const candidate of candidates) {
    const absolutePath = path.resolve(publicRoot, candidate);
    if (absolutePath !== publicRoot && !absolutePath.startsWith(`${publicRoot}${path.sep}`)) continue;
    const metadata = await stat(absolutePath).catch(() => null);
    if (metadata?.isFile()) return absolutePath;
  }

  return path.join(publicRoot, "404.html");
}

createServer(async (request, response) => {
  const file = await resolvePublicFile(request.url || "/");
  const isNotFound = path.basename(file) === "404.html";
  response.writeHead(isNotFound ? 404 : 200, {
    "Content-Type": contentTypes.get(path.extname(file)) || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`Build público disponível em http://${host}:${port}`);
});
