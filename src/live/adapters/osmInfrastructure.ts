import type { LiveFeature, LiveLayerAdapter, LiveLayerResponse } from "../adapter";
import type { GeoBounds } from "../viewport";
import { pointInBounds } from "../viewport";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const MAX_FEATURES = 300;

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
    node["power"~"^(plant|substation)$"](${bbox});
    way["power"~"^(plant|substation)$"](${bbox});
    node["man_made"="communications_tower"](${bbox});
    way["man_made"="communications_tower"](${bbox});
    node["amenity"="hospital"](${bbox});
    way["amenity"="hospital"](${bbox});
    node["aeroway"="aerodrome"](${bbox});
    way["aeroway"="aerodrome"](${bbox});
  );out center tags ${MAX_FEATURES};`;
}

function infrastructureKind(tags: Record<string, string> | undefined): string {
  if (!tags) return "infrastructure";
  if (tags.power === "plant") return "power-plant";
  if (tags.power === "substation") return "substation";
  if (tags.man_made === "communications_tower") return "communications-tower";
  if (tags.amenity === "hospital") return "hospital";
  if (tags.aeroway === "aerodrome") return "aerodrome";
  return "infrastructure";
}

function toFeature(element: OverpassElement, bounds: GeoBounds, now: number): LiveFeature | null {
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  const id = element.id;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || id === undefined) return null;
  if (!pointInBounds(lon, lat, bounds)) return null;

  const tags = element.tags ?? {};
  const kind = infrastructureKind(tags);
  const name = tags.name?.trim();

  return {
    id: `osm:${element.type ?? "element"}:${id}`,
    layerId: "infrastructure",
    lon,
    lat,
    timestamp: now,
    label: name || kind.replaceAll("-", " "),
    properties: {
      kind,
      osmType: element.type ?? null,
      osmId: id,
      operator: tags.operator ?? null,
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
  if (!response.ok) throw new Error(`Overpass request failed: ${response.status}`);
  const payload = (await response.json()) as OverpassPayload;
  return Array.isArray(payload.elements) ? payload.elements : [];
}

export const osmInfrastructureAdapter: LiveLayerAdapter = {
  id: "osm-infrastructure-v1",
  layerId: "infrastructure",
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
      if (features.length >= MAX_FEATURES) break;
    }

    return {
      layerId: "infrastructure",
      fetchedAt: now,
      source: "OpenStreetMap via Overpass API",
      bounds: viewport.bounds,
      features,
    };
  },
};
