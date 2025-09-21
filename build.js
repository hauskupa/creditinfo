// build.js
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createHash } from "crypto";

mkdirSync("dist", { recursive: true });

await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019"],
  outfile: "dist/main.js"
});

const code = readFileSync("dist/main.js");
const hash = createHash("sha1").update(code).digest("hex").slice(0, 8);
const fileName = `main.${hash}.js`;
writeFileSync(`dist/${fileName}`, code);

console.log(`Built: dist/${fileName}`);
console.log(`Paste into Webflow Footer:\n<script src="https://uploads-ssl.webflow.com/…/${fileName}" defer></script>`);
