import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

await import("./generate-icon-subset.mjs");

const vinextCli = path.join(process.cwd(), "node_modules", "vinext", "dist", "cli.js");
const result = spawnSync(process.execPath, [vinextCli, "build", "--prerender-all"], {
  cwd: process.cwd(),
  env: { ...process.env, GITHUB_PAGES: "true" },
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

await import("./prepare-public-build.mjs");
