import assert from "node:assert/strict";
import { parseLiveBounds } from "../api/_liveBounds.mjs";

function request(url) {
  return { url, headers: { host: "localhost" } };
}

const valid = parseLiveBounds(request("/api/example?west=138&south=-35.5&east=139.5&north=-34"));
assert.deepEqual(valid, { west: 138, south: -35.5, east: 139.5, north: -34 });

assert.throws(
  () => parseLiveBounds(request("/api/example?west=138&south=-35&east=138&north=-34")),
  /west < east/,
);
assert.throws(
  () => parseLiveBounds(request("/api/example?west=0&south=-10&east=60&north=10")),
  /viewport too large/,
);
assert.throws(
  () => parseLiveBounds(request("/api/example?west=x&south=-35&east=139&north=-34")),
  /required finite numbers/,
);
assert.throws(
  () => parseLiveBounds(request("/api/example?west=-181&south=-35&east=-170&north=-34")),
  /longitude bounds/,
);

console.log("Live API bounds contract: passed");
