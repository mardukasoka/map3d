import type { LiveFeature, LiveLayerAdapter, LiveLayerResponse } from "../adapter";
import type { GeoBounds } from "../viewport";
import { pointInBounds } from "../viewport";

const EONET_ENDPOINT = "https://eonet.gsfc.nasa.gov/api/v3/events";
const MAX_EVENTS = 200;
const LOOKBACK_DAYS = 30;

type EonetGeometry = {
  date?: string;
  type?: "Point" | "Polygon" | string;
  coordinates?: unknown;
};

type EonetSource = {
  id?: string;
  url?: string;
};

type EonetEvent = {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  closed?: string | null;
  geometry?: EonetGeometry[];
  sources?: EonetSource[];
};

type EonetPayload = {
  events?: EonetEvent[];
};

function bboxFragments(bounds: GeoBounds): GeoBounds[] {
  if (bounds.west <= bounds.east) return [bounds];
  return [
    { ...bounds, east: 180 },
    { ...bounds, west: -180 },
  ];
}

function bboxParam(bounds: GeoBounds): string {
  // EONET order: min lon, max lat, max lon, min lat.
  return `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`;
}

function flattenCoordinatePairs(value: unknown, out: Array<[number, number]>): void {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  ) {
    out.push([Number(value[0]), Number(value[1])]);
    return;
  }
  for (const child of value) flattenCoordinatePairs(child, out);
}

function representativePoint(geometry: EonetGeometry): [number, number] | null {
  const pairs: Array<[number, number]> = [];
  flattenCoordinatePairs(geometry.coordinates, pairs);
  if (pairs.length === 0) return null;

  let lon = 0;
  let lat = 0;
  for (const pair of pairs) {
    lon += pair[0];
    lat += pair[1];
  }
  return [lon / pairs.length, lat / pairs.length];
}

function toFeature(event: EonetEvent, bounds: GeoBounds, now: number): LiveFeature | null {
  const id = event.id?.trim();
  const geometries = Array.isArray(event.geometry) ? event.geometry : [];
  if (!id || geometries.length === 0) return null;

  let selected: { point: [number, number]; geometry: EonetGeometry } | null = null;
  for (let index = geometries.length - 1; index >= 0; index -= 1) {
    const geometry = geometries[index];
    const point = representativePoint(geometry);
    if (!point || !pointInBounds(point[0], point[1], bounds)) continue;
    selected = { point, geometry };
    break;
  }
  if (!selected) return null;

  const observedAt = Date.parse(selected.geometry.date ?? "");
  const sources = (event.sources ?? [])
    .map((source) => source.id?.trim())
    .filter((source): source is string => Boolean(source));

  return {
    id: `eonet:${id}`,
    layerId: "fires",
    lon: selected.point[0],
    lat: selected.point[1],
    timestamp: Number.isFinite(observedAt) ? observedAt : now,
    label: event.title?.trim() || "Wildfire event",
    properties: {
      status: event.closed ? "closed" : "open",
      geometryType: selected.geometry.type ?? null,
      description: event.description?.trim() || null,
      sourceIds: sources.join(", ") || null,
      source: "NASA EONET",
    },
  };
}

async function fetchFragment(bounds: GeoBounds, signal?: AbortSignal): Promise<EonetEvent[]> {
  const url = new URL(EONET_ENDPOINT);
  url.searchParams.set("category", "wildfires");
  url.searchParams.set("status", "open");
  url.searchParams.set("days", String(LOOKBACK_DAYS));
  url.searchParams.set("limit", String(MAX_EVENTS));
  url.searchParams.set("bbox", bboxParam(bounds));

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`NASA EONET request failed: ${response.status}`);
  const payload = (await response.json()) as EonetPayload;
  return Array.isArray(payload.events) ? payload.events : [];
}

export const nasaEonetFiresAdapter: LiveLayerAdapter = {
  id: "nasa-eonet-wildfires-v1",
  layerId: "fires",
  async fetch({ viewport, signal }): Promise<LiveLayerResponse> {
    const now = Date.now();
    const events = (await Promise.all(
      bboxFragments(viewport.bounds).map((bounds) => fetchFragment(bounds, signal)),
    )).flat();

    const seen = new Set<string>();
    const features: LiveFeature[] = [];
    for (const event of events) {
      const feature = toFeature(event, viewport.bounds, now);
      if (!feature || seen.has(feature.id)) continue;
      seen.add(feature.id);
      features.push(feature);
      if (features.length >= MAX_EVENTS) break;
    }

    return {
      layerId: "fires",
      fetchedAt: now,
      source: "NASA EONET open wildfire events",
      bounds: viewport.bounds,
      features,
    };
  },
};
