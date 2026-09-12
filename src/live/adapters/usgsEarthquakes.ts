import type {
  LiveLayerAdapter,
  LiveLayerRequest,
  LiveLayerResponse,
  LiveFeature,
} from "../adapter";

const ENDPOINT = "https://earthquake.usgs.gov/fdsnws/event/1/query";

function buildUrl(request: LiveLayerRequest): string {
  const { west, south, east, north } = request.viewport.bounds;
  const params = new URLSearchParams({
    format: "geojson",
    minlatitude: String(south),
    maxlatitude: String(north),
    minlongitude: String(west),
    maxlongitude: String(east),
    orderby: "time",
    limit: "250",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

export const usgsEarthquakesAdapter: LiveLayerAdapter = {
  id: "usgs-earthquakes",
  layerId: "earthquakes",
  async fetch(request: LiveLayerRequest): Promise<LiveLayerResponse> {
    if (request.layerId !== "earthquakes") {
      throw new Error("USGS earthquake adapter only supports the earthquakes layer");
    }

    const response = await fetch(buildUrl(request), { signal: request.signal });
    if (!response.ok) throw new Error(`USGS earthquake request failed: ${response.status}`);
    const json = await response.json() as {
      features?: Array<{
        id?: string;
        geometry?: { coordinates?: number[] };
        properties?: { mag?: number | null; place?: string | null; time?: number | null; url?: string | null };
      }>;
    };

    const features: LiveFeature[] = [];
    for (const item of json.features ?? []) {
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
