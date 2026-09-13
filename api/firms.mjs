import { parseLiveBounds, writeLiveJson } from "./_liveBounds.mjs";

const FIRMS_AREA_BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";
const DEFAULT_SOURCE = "VIIRS_NOAA21_NRT";
const DAY_RANGE = 1;
const MAX_HOTSPOTS = 500;

function splitCsvLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields;
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function parseFirmsTimestamp(date, time) {
  const rawTime = String(time ?? "").padStart(4, "0");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? "")) || !/^\d{4}$/.test(rawTime)) {
    return null;
  }
  const iso = `${date}T${rawTime.slice(0, 2)}:${rawTime.slice(2)}:00Z`;
  const timestamp = Date.parse(iso);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function parseFirmsCsv(csv, maxHotspots = MAX_HOTSPOTS) {
  const lines = String(csv ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const hotspots = [];

  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const lat = finite(row.latitude);
    const lon = finite(row.longitude);
    if (lat === null || lon === null || lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;

    hotspots.push({
      lat,
      lon,
      timestamp: parseFirmsTimestamp(row.acq_date, row.acq_time),
      confidence: row.confidence || null,
      frp: finite(row.frp),
      brightTi4: finite(row.bright_ti4),
      satellite: row.satellite || null,
      instrument: row.instrument || null,
      daynight: row.daynight || null,
    });

    if (hotspots.length >= maxHotspots) break;
  }

  return hotspots;
}

export function buildFirmsAreaUrl({ key, source = DEFAULT_SOURCE, bounds }) {
  const area = [bounds.west, bounds.south, bounds.east, bounds.north].join(",");
  return `${FIRMS_AREA_BASE}/${encodeURIComponent(key)}/${encodeURIComponent(source)}/${area}/${DAY_RANGE}`;
}

export default async function handler(request, response) {
  if (request.method && request.method !== "GET") {
    writeLiveJson(response, 405, { error: "method not allowed" });
    return;
  }

  try {
    const bounds = parseLiveBounds(request);
    const key = String(process.env.NASA_FIRMS_MAP_KEY ?? "").trim();
    if (!key) {
      writeLiveJson(response, 503, { error: "NASA FIRMS backend is not configured" });
      return;
    }

    const source = String(process.env.NASA_FIRMS_SOURCE ?? DEFAULT_SOURCE).trim() || DEFAULT_SOURCE;
    const upstream = await fetch(buildFirmsAreaUrl({ key, source, bounds }), {
      headers: { Accept: "text/csv" },
    });
    if (!upstream.ok) {
      writeLiveJson(response, 502, { error: `NASA FIRMS upstream failed (${upstream.status})` });
      return;
    }

    const hotspots = parseFirmsCsv(await upstream.text());
    writeLiveJson(response, 200, {
      source: `NASA FIRMS ${source}`,
      fetchedAt: Date.now(),
      bounds,
      hotspots,
    });
  } catch (error) {
    writeLiveJson(response, 400, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
