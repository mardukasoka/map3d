import { context } from "esbuild";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const outdir = resolve(root, "dist-dev");

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

const html = readFileSync(resolve(root, "index.html"), "utf8")
  .replace('/src/main.tsx', '/assets/main.js')
  .replace("</head>", '    <link rel="stylesheet" href="/assets/main.css" />\n  </head>');
writeFileSync(resolve(outdir, "index.html"), html);

const ctx = await context({
  absWorkingDir: root,
  entryPoints: ["src/main.tsx"],
  bundle: true,
  splitting: true,
  format: "esm",
  target: "es2020",
  outdir: "dist-dev/assets",
  entryNames: "main",
  chunkNames: "chunk-[hash]",
  assetNames: "asset-[hash]",
  sourcemap: "inline",
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

await ctx.watch();
const { host, port } = await ctx.serve({ servedir: outdir, host: "0.0.0.0", port: 5173 });
console.log(`Map3D dev server: http://${host}:${port}`);
