import type { LiveLayerId } from "./layerRegistry";
import type { GeoBounds, LiveViewport } from "./viewport";

export type LiveFeature = {
  id: string;
  layerId: LiveLayerId;
  lon: number;
  lat: number;
  timestamp: number;
  altitudeM?: number;
  headingDeg?: number;
  speedMps?: number;
  label?: string;
  properties?: Readonly<Record<string, string | number | boolean | null>>;
};

export type LiveLayerRequest = {
  layerId: LiveLayerId;
  viewport: LiveViewport;
  signal?: AbortSignal;
};

export type LiveLayerResponse = {
  layerId: LiveLayerId;
  fetchedAt: number;
  source: string;
  bounds: GeoBounds;
  features: readonly LiveFeature[];
};

export interface LiveLayerAdapter {
  readonly id: string;
  readonly layerId: LiveLayerId;
  fetch(request: LiveLayerRequest): Promise<LiveLayerResponse>;
}

export function assertLayerResponse(
  response: LiveLayerResponse,
  expectedLayerId: LiveLayerId,
): LiveLayerResponse {
  if (response.layerId !== expectedLayerId) {
    throw new Error(`Adapter returned ${response.layerId} for ${expectedLayerId}`);
  }
  if (!Number.isFinite(response.fetchedAt)) throw new Error("Invalid fetchedAt timestamp");
  for (const feature of response.features) {
    if (feature.layerId !== expectedLayerId) throw new Error("Feature layer mismatch");
    if (!Number.isFinite(feature.lon) || feature.lon < -180 || feature.lon > 180) {
      throw new Error(`Invalid longitude for feature ${feature.id}`);
    }
    if (!Number.isFinite(feature.lat) || feature.lat < -90 || feature.lat > 90) {
      throw new Error(`Invalid latitude for feature ${feature.id}`);
    }
  }
  return response;
}
