import assert from "node:assert/strict";
import { parseLiveBounds } from "../api/_liveBounds.mjs";
import { liveCapabilitiesFromEnv } from "../api/capabilities.mjs";
import { buildFirmsAreaUrl, parseFirmsCsv, parseFirmsTimestamp } from "../api/firms.mjs";

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

const noBackendProviders = liveCapabilitiesFromEnv({});
assert.equal(noBackendProviders.backend, true);
assert.deepEqual(noBackendProviders.providers, { firms: false, ais: false, cctv: false });

const configuredProviders = liveCapabilitiesFromEnv({ NASA_FIRMS_MAP_KEY: "SECRET_TEST_KEY" });
assert.equal(configuredProviders.providers.firms, true);
assert.equal(JSON.stringify(configuredProviders).includes("SECRET_TEST_KEY"), false);

assert.equal(
  parseFirmsTimestamp("2026-09-13", "0527"),
  Date.parse("2026-09-13T05:27:00Z"),
);
assert.equal(parseFirmsTimestamp("bad-date", "0527"), null);

const sampleCsv = [
  "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight",
  "-34.9000,138.6000,332.4,0.5,0.7,2026-09-13,0527,N21,VIIRS,n,2.0NRT,301.1,12.7,D",
].join("\n");
const hotspots = parseFirmsCsv(sampleCsv);
assert.equal(hotspots.length, 1);
assert.deepEqual(hotspots[0], {
  lat: -34.9,
  lon: 138.6,
  timestamp: Date.parse("2026-09-13T05:27:00Z"),
  confidence: "n",
  frp: 12.7,
  brightTi4: 332.4,
  satellite: "N21",
  instrument: "VIIRS",
  daynight: "D",
});

const firmsUrl = buildFirmsAreaUrl({
  key: "TEST_KEY",
  source: "VIIRS_NOAA21_NRT",
  bounds: valid,
});
assert.match(firmsUrl, /\/api\/area\/csv\/TEST_KEY\/VIIRS_NOAA21_NRT\/138,-35\.5,139\.5,-34\/1$/);

console.log("Live API bounds + capabilities + FIRMS contract: passed");
