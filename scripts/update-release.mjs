#!/usr/bin/env node
// Recomputes version, size, SHA-256 and date of the installer into src/data/release.ts.
//
//   node scripts/update-release.mjs [path/to/DeskLock-Setup.exe] [--version 1.2.3] [--date 2026-12-01]
//
// Defaults: ../dist/DeskLock-Setup.exe (relative to site/), version read from the exe's
// ProductVersion via PowerShell (Windows), date = today. Only the block between
// "// @release:start" and "// @release:end" is rewritten.
import { createHash } from "node:crypto";
import { createReadStream, readFileSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const releaseTs = resolve(siteDir, "src/data/release.ts");

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
let version = opt("--version");
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const date = opt("--date") ?? localToday();
const exe = resolve(args[0] ?? resolve(siteDir, "../dist/DeskLock-Setup.exe"));

const sha256 = await new Promise((ok, fail) => {
  const h = createHash("sha256");
  createReadStream(exe).on("error", fail).on("data", (c) => h.update(c)).on("end", () => ok(h.digest("hex")));
});
const sizeBytes = statSync(exe).size;

if (!version) {
  try {
    const raw = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-Command", `(Get-Item -LiteralPath '${exe.replace(/'/g, "''")}').VersionInfo.ProductVersion`],
      { encoding: "utf8" },
    ).trim();
    // "1.0.0.0" -> "1.0.0"
    version = raw.split(".").length === 4 && raw.endsWith(".0") ? raw.slice(0, -2) : raw;
  } catch {
    /* not on Windows */
  }
}
if (!version) {
  console.error("Could not read the version from the exe: pass --version x.y.z");
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`Invalid --date ${date} (expected YYYY-MM-DD)`);
  process.exit(1);
}

const block = `// @release:start
export const release = {
  version: ${JSON.stringify(version)},
  sizeBytes: ${sizeBytes},
  sha256: ${JSON.stringify(sha256)},
  releaseDate: ${JSON.stringify(date)},
} as const;
// @release:end`;

const src = readFileSync(releaseTs, "utf8");
const re = /\/\/ @release:start[\s\S]*?\/\/ @release:end/;
if (!re.test(src)) {
  console.error(`Markers not found in ${releaseTs}`);
  process.exit(1);
}
writeFileSync(releaseTs, src.replace(re, block));
console.log(`release.ts updated: v${version}, ${sizeBytes} bytes, sha256 ${sha256}, ${date}`);
