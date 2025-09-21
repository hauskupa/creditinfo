// build.js
import { build } from "esbuild";
import { mkdirSync, readdirSync, copyFileSync } from "fs";
import { join } from "path";

mkdirSync("dist", { recursive: true });

// Step 1: bundle JS
await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  outfile: "dist/main.js"
});

// Step 2: copy all CSS from src → dist
const files = readdirSync("src");
files.forEach(file => {
  if (file.endsWith(".css")) {
    copyFileSync(join("src", file), join("dist", file));
    console.log(`Copied: ${file}`);
  }
});

console.log("Build complete. JS + CSS are in dist/");
console.log(`Use in Webflow:
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/style.css">
<script src="https://cdn.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/main.js" defer></script>`);