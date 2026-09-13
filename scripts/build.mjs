import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const outdir = resolve(root, "dist");

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const result = await build({
  absWorkingDir: root,
  entryPoints: ["src/main.tsx"],
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2020",
  outdir: "dist/assets",
  entryNames: "[name]-[hash]",
  chunkNames: "chunk-[hash]",
  assetNames: "asset-[hash]",
  minify: true,
  sourcemap: false,
  metafile: true,
  tsconfig: "tsconfig.app.json",
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".svg": "file",
    ".webp": "file"
  }
});

if (existsSync(resolve(root, "public"))) {
  cpSync(resolve(root, "public"), outdir, { recursive: true });
}

const outputs = Object.entries(result.metafile.outputs);
const entry = outputs.find(([, meta]) => meta.entryPoint === "src/main.tsx");
if (!entry) throw new Error("esbuild did not emit the main entry bundle");

const [entryPath, entryMeta] = entry;
const scriptSrc = `/${relative(outdir, resolve(root, entryPath)).replaceAll("\\\\", "/")}`;
let html = readFileSync(resolve(root, "index.html"), "utf8")
  .replace('/src/main.tsx', scriptSrc);

if (entryMeta.cssBundle) {
  const cssHref = `/${relative(outdir, resolve(root, entryMeta.cssBundle)).replaceAll("\\\\", "/")}`;
  html = html.replace("</head>", `    <link rel=\"stylesheet\" href=\"${cssHref}\" />\n  </head>`);
}

writeFileSync(resolve(outdir, "index.html"), html);
console.log(`Built ${outputs.length} assets into ${relative(root, outdir)}/`);
