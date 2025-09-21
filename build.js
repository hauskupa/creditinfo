// build.js
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";

mkdirSync("dist", { recursive: true });

// Step 1: build the bundle
await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  outfile: "dist/main.js"
});

// Step 2: bump version number
const versionFile = "dist/version.txt";
let version = 1;

if (existsSync(versionFile)) {
  const current = parseInt(readFileSync(versionFile, "utf8"), 10);
  if (!isNaN(current)) version = current + 1;
}
writeFileSync(versionFile, String(version));

// Step 3: log the script tag
console.log("Built: dist/main.js");
console.log(
  `Use in Webflow:\n<script src="https://cdn.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/main.js?v=${version}" defer></script>`
);
