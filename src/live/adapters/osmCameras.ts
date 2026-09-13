import type { LiveFeature, LiveLayerAdapter, LiveLayerResponse } from "../adapter";
import type { GeoBounds } from "../viewport";
import { pointInBounds } from "../viewport";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const MAX_CAMERAS = 250;

type OverpassElement = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type OverpassPayload = {
  elements?: OverpassElement[];
};

function bboxFragments(bounds: GeoBounds): GeoBounds[] {
  if (bounds.west <= bounds.east) return [bounds];
  return [
    { ...bounds, east: 180 },
    { ...bounds, west: -180 },
  ];
}

function bboxText(bounds: GeoBounds): string {
  return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
}

function queryForBounds(bounds: GeoBounds): string {
  const bbox = bboxText(bounds);
  return `[out:json][timeout:12];(
    node["man_made"="surveillance"](${bbox});
    way["man_made"="surveillance"](${bbox});
  );out center ${MAX_CAMERAS};`;
}

function cameraLabel(tags: Record<string, string>): string {
  return tags.name?.trim() || tags.ref?.trim() || "Surveillance camera";
}

function toFeature(element: OverpassElement, bounds: GeoBounds, now: number): LiveFeature | null {
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  const id = element.id;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || id === undefined) return null;
  if (!pointInBounds(lon, lat, bounds)) return null;

  const tags = element.tags ?? {};
  return {
    id: `osm-camera:${element.type ?? "element"}:${id}`,
    layerId: "cameras",
    lon,
    lat,
    timestamp: now,
    headingDeg: Number.isFinite(Number(tags.direction)) ? Number(tags.direction) : undefined,
    label: cameraLabel(tags),
    properties: {
      kind: "surveillance-camera",
      surveillanceType: tags["surveillance:type"] ?? null,
      surveillanceZone: tags["surveillance:zone"] ?? null,
      cameraType: tags.camera ?? null,
      mount: tags["camera:mount"] ?? null,
      direction: tags.direction ?? null,
      operator: tags.operator ?? null,
      osmType: element.type ?? null,
      osmId: id,
      mediaAvailable: false,
      source: "OpenStreetMap contributors",
    },
  };
}

async function fetchFragment(bounds: GeoBounds, signal?: AbortSignal): Promise<OverpassElement[]> {
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ data: queryForBounds(bounds) }),
    signal,
  });
  if (!response.ok) throw new Error(`Overpass camera request failed: ${response.status}`);
  const payload = (await response.json()) as OverpassPayload;
  return Array.isArray(payload.elements) ? payload.elements : [];
}

export const osmCamerasAdapter: LiveLayerAdapter = {
  id: "osm-surveillance-metadata-v1",
  layerId: "cameras",
  async fetch({ viewport, signal }): Promise<LiveLayerResponse> {
    const now = Date.now();
    const elements = (await Promise.all(
      bboxFragments(viewport.bounds).map((bounds) => fetchFragment(bounds, signal)),
    )).flat();

    const seen = new Set<string>();
    const features: LiveFeature[] = [];
    for (const element of elements) {
      const feature = toFeature(element, viewport.bounds, now);
      if (!feature || seen.has(feature.id)) continue;
      seen.add(feature.id);
      features.push(feature);
      if (features.length >= MAX_CAMERAS) break;
    }

    return {
      layerId: "cameras",
      fetchedAt: now,
      source: "OpenStreetMap surveillance metadata via Overpass API",
      bounds: viewport.bounds,
      features,
    };
  },
};
