import type { LiveLayerDefinition } from "./layerRegistry";
import { isLayerVisibleAtZoom } from "./layerRegistry";

export type GeoBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type LiveViewport = {
  zoom: number;
  bounds: GeoBounds;
};

export function normalizeLongitude(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("longitude must be finite");
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

export function validateBounds(bounds: GeoBounds): boolean {
  return [bounds.west, bounds.south, bounds.east, bounds.north].every(Number.isFinite) &&
    bounds.south >= -90 && bounds.south <= 90 &&
    bounds.north >= -90 && bounds.north <= 90 &&
    bounds.south <= bounds.north &&
    bounds.west >= -180 && bounds.west <= 180 &&
    bounds.east >= -180 && bounds.east <= 180;
}

export function viewportCanActivateLayer(
  layer: LiveLayerDefinition,
  viewport: LiveViewport,
  enabled: boolean,
): boolean {
  return enabled && validateBounds(viewport.bounds) && isLayerVisibleAtZoom(layer, viewport.zoom);
}

export function pointInBounds(lon: number, lat: number, bounds: GeoBounds): boolean {
  if (!validateBounds(bounds) || !Number.isFinite(lon) || !Number.isFinite(lat)) return false;
  if (lat < bounds.south || lat > bounds.north) return false;
  const normalizedLon = normalizeLongitude(lon);
  if (bounds.west <= bounds.east) return normalizedLon >= bounds.west && normalizedLon <= bounds.east;
  return normalizedLon >= bounds.west || normalizedLon <= bounds.east;
}

export function cacheKey(layerId: string, viewport: LiveViewport): string {
  const { west, south, east, north } = viewport.bounds;
  const q = (value: number) => Math.round(value * 100) / 100;
  return [layerId, Math.floor(viewport.zoom), q(west), q(south), q(east), q(north)].join(":");
}
