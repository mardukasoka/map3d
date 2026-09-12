import type {
  LiveLayerAdapter,
  LiveLayerRequest,
  LiveLayerResponse,
  LiveFeature,
} from "../adapter";
import type { GeoBounds } from "../viewport";

const ENDPOINT = "https://earthquake.usgs.gov/fdsnws/event/1/query";

type UsgsItem = {
  id?: string;
  geometry?: { coordinates?: number[] };
  properties?: {
    mag?: number | null;
    place?: string | null;
    time?: number | null;
    url?: string | null;
  };
};

function buildUrl(bounds: GeoBounds): string {
  const params = new URLSearchParams({
    format: "geojson",
    minlatitude: String(bounds.south),
    maxlatitude: String(bounds.north),
    minlongitude: String(bounds.west),
    maxlongitude: String(bounds.east),
    orderby: "time",
    limit: "250",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

function splitDatelineBounds(bounds: GeoBounds): GeoBounds[] {
  if (bounds.west <= bounds.east) return [bounds];
  return [
    { ...bounds, east: 180 },
    { ...bounds, west: -180 },
  ];
}

async function fetchItems(bounds: GeoBounds, signal?: AbortSignal): Promise<UsgsItem[]> {
  const response = await fetch(buildUrl(bounds), { signal });
  if (!response.ok) throw new Error(`USGS earthquake request failed: ${response.status}`);
  const json = (await response.json()) as { features?: UsgsItem[] };
  return json.features ?? [];
}

export const usgsEarthquakesAdapter: LiveLayerAdapter = {
  id: "usgs-earthquakes",
  layerId: "earthquakes",
  async fetch(request: LiveLayerRequest): Promise<LiveLayerResponse> {
    if (request.layerId !== "earthquakes") {
      throw new Error("USGS earthquake adapter only supports the earthquakes layer");
    }

    const parts = splitDatelineBounds(request.viewport.bounds);
    const responses = await Promise.all(
      parts.map((bounds) => fetchItems(bounds, request.signal)),
    );

    const items = new Map<string, UsgsItem>();
    for (const item of responses.flat()) {
      const coordinates = item.geometry?.coordinates;
      const fallbackKey = coordinates
        ? `${coordinates[0]}:${coordinates[1]}:${item.properties?.time ?? 0}`
        : `unknown:${items.size}`;
      items.set(item.id ?? fallbackKey, item);
    }

    const features: LiveFeature[] = [];
    for (const item of items.values()) {
      const coordinates = item.geometry?.coordinates;
      if (!coordinates || coordinates.length < 2) continue;
      const [lon, lat, depthKm] = coordinates;
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      features.push({
        id: item.id ?? `usgs-${lon}-${lat}-${item.properties?.time ?? 0}`,
        layerId: "earthquakes",
        lon,
        lat,
        altitudeM: Number.isFinite(depthKm) ? -Number(depthKm) * 1000 : undefined,
        timestamp: Number.isFinite(item.properties?.time) ? Number(item.properties?.time) : Date.now(),
        label: item.properties?.place ?? "Earthquake",
        properties: {
          magnitude: item.properties?.mag ?? null,
          sourceUrl: item.properties?.url ?? null,
        },
      });
    }

    return {
      layerId: "earthquakes",
      fetchedAt: Date.now(),
      source: "USGS Earthquake Hazards Program",
      bounds: request.viewport.bounds,
      features,
    };
  },
};
