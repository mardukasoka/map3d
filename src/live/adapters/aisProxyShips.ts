import type { LiveLayerAdapter, LiveLayerRequest, LiveLayerResponse } from "../adapter";
import { fetchLiveApiJson } from "../backend";
import type { GeoBounds } from "../viewport";

const MAX_SHIPS = 300;

type AisProxyVessel = {
  mmsi: string | number;
  lon: number;
  lat: number;
  timestamp: number;
  headingDeg?: number;
  speedMps?: number;
  name?: string;
  shipType?: string;
};

type AisProxyResponse = {
  source?: string;
  fetchedAt?: number;
  vessels?: AisProxyVessel[];
};

function splitDatelineBounds(bounds: GeoBounds): GeoBounds[] {
  if (bounds.west <= bounds.east) return [bounds];
  return [
    { ...bounds, east: 180 },
    { ...bounds, west: -180 },
  ];
}

function buildPath(bounds: GeoBounds): string {
  const params = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  });
  return `/api/ais-live?${params.toString()}`;
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value);
}

async function fetchBounds(bounds: GeoBounds, signal?: AbortSignal): Promise<AisProxyResponse> {
  return await fetchLiveApiJson<AisProxyResponse>(buildPath(bounds), signal);
}

export const aisProxyShipsAdapter: LiveLayerAdapter = {
  id: "ais-proxy-ships",
  layerId: "ships",
  async fetch(request: LiveLayerRequest): Promise<LiveLayerResponse> {
    const responses = await Promise.all(
      splitDatelineBounds(request.viewport.bounds).map((bounds) => fetchBounds(bounds, request.signal)),
    );

    const deduped = new Map<string, AisProxyVessel>();
    let source = "AIS server proxy";
    let fetchedAt = Date.now();

    for (const response of responses) {
      if (response.source) source = response.source;
      if (Number.isFinite(response.fetchedAt)) fetchedAt = Math.max(fetchedAt, Number(response.fetchedAt));
      for (const vessel of response.vessels ?? []) {
        if (!isFiniteCoordinate(vessel.lon) || !isFiniteCoordinate(vessel.lat)) continue;
        if (vessel.lon < -180 || vessel.lon > 180 || vessel.lat < -90 || vessel.lat > 90) continue;
        const mmsi = String(vessel.mmsi).trim();
        if (!mmsi) continue;
        const previous = deduped.get(mmsi);
        if (!previous || vessel.timestamp >= previous.timestamp) deduped.set(mmsi, vessel);
      }
    }

    const features = [...deduped.values()]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_SHIPS)
      .map((vessel) => ({
        id: `ais-${String(vessel.mmsi)}`,
        layerId: "ships" as const,
        lon: vessel.lon,
        lat: vessel.lat,
        timestamp: Number.isFinite(vessel.timestamp) ? vessel.timestamp : fetchedAt,
        headingDeg: Number.isFinite(vessel.headingDeg) ? vessel.headingDeg : undefined,
        speedMps: Number.isFinite(vessel.speedMps) ? vessel.speedMps : undefined,
        label: vessel.name?.trim() || `MMSI ${String(vessel.mmsi)}`,
        properties: {
          mmsi: String(vessel.mmsi),
          shipType: vessel.shipType ?? null,
          via: "same-origin AIS proxy",
        },
      }));

    return {
      layerId: "ships",
      fetchedAt,
      source,
      bounds: request.viewport.bounds,
      features,
    };
  },
};
