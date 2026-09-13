export const DEFAULT_LIVE_BOUNDS_LIMITS = Object.freeze({
  maxLonSpanDeg: 30,
  maxLatSpanDeg: 20,
});

function finiteParam(url, name) {
  const raw = url.searchParams.get(name);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function parseLiveBounds(request, limits = DEFAULT_LIVE_BOUNDS_LIMITS) {
  const origin = `http://${request.headers?.host || "localhost"}`;
  const url = new URL(request.url || "/", origin);
  const west = finiteParam(url, "west");
  const south = finiteParam(url, "south");
  const east = finiteParam(url, "east");
  const north = finiteParam(url, "north");

  if ([west, south, east, north].some((value) => value === null)) {
    throw new Error("west, south, east and north are required finite numbers");
  }
  if (west < -180 || west > 180 || east < -180 || east > 180) {
    throw new Error("longitude bounds must be between -180 and 180");
  }
  if (south < -90 || south > 90 || north < -90 || north > 90) {
    throw new Error("latitude bounds must be between -90 and 90");
  }
  if (west >= east || south >= north) {
    throw new Error("bounds must be ordered west < east and south < north");
  }
  if (east - west > limits.maxLonSpanDeg || north - south > limits.maxLatSpanDeg) {
    throw new Error(
      `viewport too large; maximum span is ${limits.maxLonSpanDeg}° × ${limits.maxLatSpanDeg}°`,
    );
  }

  return Object.freeze({ west, south, east, north });
}

export function writeLiveJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.setHeader("x-content-type-options", "nosniff");
  response.end(JSON.stringify(body));
}
