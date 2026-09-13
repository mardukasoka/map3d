import type {
  LiveFeature,
  LiveLayerAdapter,
  LiveLayerRequest,
  LiveLayerResponse,
} from "../adapter";
import { normalizeLongitude, pointInBounds } from "../viewport";

const ENDPOINT = "https://api.adsb.lol/v2/point";
const MAX_RADIUS_NM = 250;
const MIN_RADIUS_NM = 5;
const EARTH_RADIUS_NM = 3440.065;
const FOOT_TO_M = 0.3048;
const KNOT_TO_MPS = 0.514444;

type AdsbAircraft = {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number | string;
  lon?: number | string;
  alt_baro?: number | string;
  alt_geom?: number | string;
  gs?: number | string;
  track?: number | string;
  seen?: number | string;
  seen_pos?: number | string;
  squawk?: string;
  category?: string;
};

type AdsbPayload = {
  now?: number | string;
  ac?: AdsbAircraft[];
};

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(normalizeLongitude(lon2 - lon1));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function viewportQuery(request: LiveLayerRequest): { lat: number; lon: number; radiusNm: number } {
  const { west, south, east, north } = request.viewport.bounds;
  const lat = (south + north) / 2;
  const eastUnwrapped = west <= east ? east : east + 360;
  const lon = normalizeLongitude((west + eastUnwrapped) / 2);

  const radiusNm = Math.max(
    haversineNm(lat, lon, south, west),
    haversineNm(lat, lon, south, east),
    haversineNm(lat, lon, north, west),
    haversineNm(lat, lon, north, east),
  );

  if (radiusNm > MAX_RADIUS_NM) {
    throw new Error("Aircraft viewport exceeds adsb.lol 250 nm point-query limit; zoom in");
  }

  return {
    lat,
    lon,
    radiusNm: Math.max(MIN_RADIUS_NM, Math.ceil(radiusNm)),
  };
}

function normalizePayloadTime(value: unknown): number {
  const raw = finiteNumber(value);
  if (raw === null) return Date.now();
  return raw > 10_000_000_000 ? raw : raw * 1000;
}

function aircraftFeature(
  aircraft: AdsbAircraft,
  responseTimeMs: number,
  request: LiveLayerRequest,
): LiveFeature | null {
  const lat = finiteNumber(aircraft.lat);
  const lonRaw = finiteNumber(aircraft.lon);
  const hex = String(aircraft.hex ?? "").trim().toLowerCase();
  if (!hex || lat === null || lonRaw === null) return null;

  const lon = normalizeLongitude(lonRaw);
  if (!pointInBounds(lon, lat, request.viewport.bounds)) return null;

  const seenSeconds = Math.max(
    0,
    finiteNumber(aircraft.seen_pos) ?? finiteNumber(aircraft.seen) ?? 0,
  );
  const onGround = aircraft.alt_baro === "ground";
  const altitudeFeet = onGround
    ? 0
    : finiteNumber(aircraft.alt_geom) ?? finiteNumber(aircraft.alt_baro);
  const speedKnots = finiteNumber(aircraft.gs);
  const heading = finiteNumber(aircraft.track);
  const callsign = String(aircraft.flight ?? "").trim();
  const registration = String(aircraft.r ?? "").trim();

  return {
    id: `adsb-lol-${hex}`,
    layerId: "aircraft",
    lon,
    lat,
    timestamp: Math.max(0, responseTimeMs - seenSeconds * 1000),
    altitudeM: altitudeFeet === null ? undefined : altitudeFeet * FOOT_TO_M,
    speedMps: speedKnots === null ? undefined : speedKnots * KNOT_TO_MPS,
    headingDeg: heading === null ? undefined : heading,
    label: callsign || registration || hex.toUpperCase(),
    properties: {
      icao24: hex,
      callsign: callsign || null,
      registration: registration || null,
      aircraftType: String(aircraft.t ?? "").trim() || null,
      squawk: aircraft.squawk ?? null,
      category: aircraft.category ?? null,
      onGround,
    },
  };
}

export const adsbLolAircraftAdapter: LiveLayerAdapter = {
  id: "adsb-lol-aircraft",
  layerId: "aircraft",
  async fetch(request): Promise<LiveLayerResponse> {
    if (request.layerId !== "aircraft") {
      throw new Error("adsb.lol aircraft adapter only supports the aircraft layer");
    }

    const query = viewportQuery(request);
    const url = `${ENDPOINT}/${query.lat.toFixed(4)}/${query.lon.toFixed(4)}/${query.radiusNm}`;
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) {
      throw new Error(`adsb.lol aircraft request failed: ${response.status}`);
    }

    const payload = (await response.json()) as AdsbPayload;
    const responseTimeMs = normalizePayloadTime(payload.now);
    const features = (Array.isArray(payload.ac) ? payload.ac : [])
      .map((aircraft) => aircraftFeature(aircraft, responseTimeMs, request))
      .filter((feature): feature is LiveFeature => feature !== null);

    return {
      layerId: "aircraft",
      fetchedAt: Date.now(),
      source: "adsb.lol",
      bounds: request.viewport.bounds,
      features,
    };
  },
};
