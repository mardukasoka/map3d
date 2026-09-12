export type LiveLayerId =
  | "aircraft"
  | "ships"
  | "satellites"
  | "earthquakes"
  | "fires"
  | "cameras"
  | "infrastructure";

export type LiveLayerKind = "points" | "tracks" | "areas" | "mixed";

export type LiveLayerDefinition = {
  id: LiveLayerId;
  label: string;
  kind: LiveLayerKind;
  enabledByDefault: boolean;
  minZoom: number;
  maxZoom?: number;
  refreshMs: number;
  cacheTtlMs: number;
  viewportOnly: boolean;
  sourceRole: string;
};

export const LIVE_LAYER_REGISTRY: readonly LiveLayerDefinition[] = Object.freeze([
  Object.freeze({
    id: "aircraft",
    label: "Aircraft",
    kind: "tracks",
    enabledByDefault: false,
    minZoom: 5,
    refreshMs: 15000,
    cacheTtlMs: 30000,
    viewportOnly: true,
    sourceRole: "God's Eye compatible ADS-B adapter",
  }),
  Object.freeze({
    id: "ships",
    label: "Ships",
    kind: "tracks",
    enabledByDefault: false,
    minZoom: 5,
    refreshMs: 30000,
    cacheTtlMs: 60000,
    viewportOnly: true,
    sourceRole: "God's Eye compatible AIS adapter",
  }),
  Object.freeze({
    id: "satellites",
    label: "Satellites",
    kind: "tracks",
    enabledByDefault: false,
    minZoom: 3,
    refreshMs: 10000,
    cacheTtlMs: 9000,
    viewportOnly: true,
    sourceRole: "CelesTrak visual-group GP data with local SGP4 propagation",
  }),
  Object.freeze({
    id: "earthquakes",
    label: "Earthquakes",
    kind: "points",
    enabledByDefault: false,
    minZoom: 3,
    refreshMs: 60000,
    cacheTtlMs: 300000,
    viewportOnly: true,
    sourceRole: "God's Eye compatible seismic feed adapter",
  }),
  Object.freeze({
    id: "fires",
    label: "Fires",
    kind: "points",
    enabledByDefault: false,
    minZoom: 4,
    refreshMs: 300000,
    cacheTtlMs: 900000,
    viewportOnly: true,
    sourceRole: "God's Eye compatible active-fire adapter",
  }),
  Object.freeze({
    id: "cameras",
    label: "Cameras",
    kind: "points",
    enabledByDefault: false,
    minZoom: 11,
    refreshMs: 300000,
    cacheTtlMs: 1800000,
    viewportOnly: true,
    sourceRole: "Local camera metadata adapter; streams load only on selection",
  }),
  Object.freeze({
    id: "infrastructure",
    label: "Infrastructure",
    kind: "mixed",
    enabledByDefault: false,
    minZoom: 9,
    refreshMs: 3600000,
    cacheTtlMs: 86400000,
    viewportOnly: true,
    sourceRole: "Regional infrastructure overlay adapter",
  }),
]);

export function getLiveLayerDefinition(id: LiveLayerId): LiveLayerDefinition {
  const definition = LIVE_LAYER_REGISTRY.find((layer) => layer.id === id);
  if (!definition) throw new Error(`Unknown live layer: ${id}`);
  return definition;
}

export function isLayerVisibleAtZoom(layer: LiveLayerDefinition, zoom: number): boolean {
  if (!Number.isFinite(zoom) || zoom < layer.minZoom) return false;
  return layer.maxZoom === undefined || zoom <= layer.maxZoom;
}
