// build.js
import { build } from "esbuild";
import { mkdirSync, readdirSync, copyFileSync } from "fs";

mkdirSync("dist", { recursive: true });

// Simple cache-busting version (timestamp)
const v = Date.now().toString().slice(-6);

// Build JS (always dist/main.js)
await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: true,
  sourcemap: true, 
  format: "iife",
  target: ["es2019"],
  outfile: "dist/main.js",
  drop: [], // <- make sure esbuild does NOT strip console.log
  banner: {
    js: `// Build version: ${v} (${new Date().toISOString()})`
  }
});

// Copy any CSS from src → dist
for (const f of readdirSync("src")) {
  if (f.endsWith(".css")) copyFileSync(`src/${f}`, `dist/${f}`);
}

// Print the tags to paste into Webflow
console.log("\nUse in Webflow:");
for (const f of readdirSync("dist")) {
  if (f.endsWith(".css")) {
    console.log(
      `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/${f}?v=${v}">`
    );
  }
}
console.log(
  `<script src="https://cdn.jsdelivr.net/gh/hauskupa/creditinfo@main/dist/main.js?v=${v}" defer></script>`
);
