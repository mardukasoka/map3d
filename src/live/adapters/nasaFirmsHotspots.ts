import type { LiveFeature, LiveLayerAdapter, LiveLayerResponse } from "../adapter";
import { buildBoundedApiPath } from "../apiTransport";
import { fetchLiveApiJson } from "../backend";

type FirmsHotspot = {
  lat: number;
  lon: number;
  timestamp?: number | null;
  confidence?: string | null;
  frp?: number | null;
  brightTi4?: number | null;
  satellite?: string | null;
  instrument?: string | null;
  daynight?: string | null;
};

type FirmsResponse = {
  source?: string;
  fetchedAt?: number;
  hotspots?: FirmsHotspot[];
};

const MAX_HOTSPOTS = 500;

export const nasaFirmsHotspotsAdapter: LiveLayerAdapter = {
  id: "nasa-firms-hotspots-v1",
  layerId: "fires",
  async fetch({ viewport, signal }): Promise<LiveLayerResponse> {
    const path = buildBoundedApiPath("/api/firms", viewport.bounds);
    const payload = await fetchLiveApiJson<FirmsResponse>(path, signal);
    const fetchedAt = Number.isFinite(payload.fetchedAt) ? Number(payload.fetchedAt) : Date.now();

    const features: LiveFeature[] = [];
    for (const hotspot of Array.isArray(payload.hotspots) ? payload.hotspots : []) {
      if (!Number.isFinite(hotspot.lat) || !Number.isFinite(hotspot.lon)) continue;
      if (hotspot.lat < -90 || hotspot.lat > 90 || hotspot.lon < -180 || hotspot.lon > 180) continue;

      const timestamp = Number.isFinite(hotspot.timestamp) ? Number(hotspot.timestamp) : fetchedAt;
      features.push({
        id: `firms:${hotspot.lon.toFixed(5)}:${hotspot.lat.toFixed(5)}:${timestamp}`,
        layerId: "fires",
        lon: hotspot.lon,
        lat: hotspot.lat,
        timestamp,
        label: "Satellite fire hotspot",
        properties: {
          source: payload.source ?? "NASA FIRMS",
          confidence: hotspot.confidence ?? null,
          frp: Number.isFinite(hotspot.frp) ? Number(hotspot.frp) : null,
          brightTi4: Number.isFinite(hotspot.brightTi4) ? Number(hotspot.brightTi4) : null,
          satellite: hotspot.satellite ?? null,
          instrument: hotspot.instrument ?? null,
          daynight: hotspot.daynight ?? null,
        },
      });

      if (features.length >= MAX_HOTSPOTS) break;
    }

    return {
      layerId: "fires",
      fetchedAt,
      source: payload.source ?? "NASA FIRMS hotspots",
      bounds: viewport.bounds,
      features,
    };
  },
};
