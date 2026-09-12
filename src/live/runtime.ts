import { assertLayerResponse, type LiveLayerAdapter, type LiveLayerResponse } from "./adapter";
import { getLiveLayerDefinition, type LiveLayerId } from "./layerRegistry";
import type { LiveViewport } from "./viewport";
import { usgsEarthquakesAdapter } from "./adapters/usgsEarthquakes";

const adapters: Partial<Record<LiveLayerId, LiveLayerAdapter>> = {
  earthquakes: usgsEarthquakesAdapter,
};

type CacheEntry = {
  expiresAt: number;
  response: LiveLayerResponse;
};

const cache = new Map<string, CacheEntry>();

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function liveViewportCacheKey(id: LiveLayerId, viewport: LiveViewport): string {
  const { west, south, east, north } = viewport.bounds;
  return [
    id,
    viewport.zoom,
    round(west),
    round(south),
    round(east),
    round(north),
  ].join(":");
}

export function hasLiveLayerAdapter(id: LiveLayerId): boolean {
  return Boolean(adapters[id]);
}

export async function fetchLiveLayer(
  id: LiveLayerId,
  viewport: LiveViewport,
  signal?: AbortSignal,
): Promise<LiveLayerResponse> {
  const adapter = adapters[id];
  if (!adapter) throw new Error(`No live adapter registered for ${id}`);

  const definition = getLiveLayerDefinition(id);
  const key = liveViewportCacheKey(id, viewport);
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) return cached.response;

  const response = assertLayerResponse(
    await adapter.fetch({ layerId: id, viewport, signal }),
    id,
  );

  cache.set(key, {
    expiresAt: now + definition.cacheTtlMs,
    response,
  });

  return response;
}

export function clearExpiredLiveLayerCache(now = Date.now()): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}
