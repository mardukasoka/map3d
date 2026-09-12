import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  let candidate = normalize(join(dist, pathname));
  if (!candidate.startsWith(dist)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate = join(candidate, "index.html");
  if (!existsSync(candidate)) candidate = join(dist, "index.html");
  res.writeHead(200, { "Content-Type": types[extname(candidate)] || "application/octet-stream" });
  createReadStream(candidate).pipe(res);
}).listen(port, "0.0.0.0", () => {
  console.log(`Map3D preview: http://0.0.0.0:${port}`);
});
