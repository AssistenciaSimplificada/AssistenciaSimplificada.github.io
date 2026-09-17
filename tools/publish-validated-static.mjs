import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist", "client");
const config = JSON.parse(await readFile(path.join(root, "config/product-public-config.json"), "utf8"));
const repository = "AssistenciaSimplificada/AssistenciaSimplificada.github.io";
assert.equal(new URL(config.urls.officialWebsite).hostname, "assistenciasimplificada.site");
assert.equal((await readFile(path.join(output, "CNAME"), "utf8")).trim(), "assistenciasimplificada.site");
for (const file of ["index.html", "a/index.html", "acompanhar/index.html", "acompanhar/page.js", "t/index.html", "tecnico/index.html", "tecnico/page.js", "v/index.html", "v/page.js", "v/page.css", "v/precos/index.html", "v/precos/page.js", "v/precos/page.css", "404.html"]) {
  assert.ok((await stat(path.join(output, file))).size > 0, file);
}
for (const file of ["acompanhar/index.template.html", "tecnico/index.template.html", ".env", "node_modules", "app", "server"]) {
  assert.equal(await stat(path.join(output, file)).catch(() => null), null, `Private build input: ${file}`);
}
const git = (args, cwd = root, options = {}) => execFileSync("git", args, { cwd, encoding: "utf8", windowsHide: true, ...options });
const credential = git(["credential", "fill"], root, {
  input: "protocol=https\nhost=github.com\nusername=AssistenciaSimplificada\n\n",
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
const token = credential.split(/\r?\n/).find(x => x.startsWith("password="))?.slice(9);
assert.ok(token);
const userResponse = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
assert.equal(userResponse.status, 200);
assert.equal((await userResponse.json()).login, "AssistenciaSimplificada");
const temp = await mkdtemp(path.join(os.tmpdir(), "assistencia-site-publish-"));
const checkout = path.join(temp, "site");
try {
  git(["clone", "--depth", "1", `https://github.com/${repository}.git`, checkout]);
  const base = git(["rev-parse", "HEAD"], checkout).trim();
  // This disposable checkout contains only the prior public build. Preserve host settings.
  for (const entry of await readdir(checkout)) {
    if ([".git", "CNAME", "_headers", ".assetsignore"].includes(entry)) continue;
    const target = path.resolve(checkout, entry);
    assert.ok(target.startsWith(checkout + path.sep));
    await rm(target, { recursive: true, force: true });
  }
  await cp(output, checkout, { recursive: true });
  git(["add", "--all"], checkout);
  if (!git(["status", "--porcelain"], checkout).trim()) {
    console.log(JSON.stringify({ unchanged: true, commit: base }));
  } else {
    git(["-c", "user.name=AssistenciaSimplificada", "-c", "user.email=AssistenciaSimplificada@users.noreply.github.com", "commit", "-m", `Atualiza portais e site para ${config.version}`], checkout);
    git(["-c", "credential.username=AssistenciaSimplificada", "push", "origin", "HEAD:main"], checkout);
    console.log(JSON.stringify({ repository, previousCommit: base, commit: git(["rev-parse", "HEAD"], checkout).trim(), version: config.version }));
  }
} finally {
  assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir()) + path.sep + "assistencia-site-publish-"));
  await rm(temp, { recursive: true, force: true });
}
