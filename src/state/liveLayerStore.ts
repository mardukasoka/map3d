import { create } from "zustand";
import {
  LIVE_LAYER_REGISTRY,
  getLiveLayerDefinition,
  type LiveLayerId,
} from "../live/layerRegistry";
import {
  viewportCanActivateLayer,
  type LiveViewport,
} from "../live/viewport";

type LayerEnabledState = Record<LiveLayerId, boolean>;

const defaultEnabled = Object.fromEntries(
  LIVE_LAYER_REGISTRY.map((layer) => [layer.id, layer.enabledByDefault]),
) as LayerEnabledState;

type LiveLayerStore = {
  enabled: LayerEnabledState;
  viewport: LiveViewport | null;
  setLayerEnabled: (id: LiveLayerId, enabled: boolean) => void;
  toggleLayer: (id: LiveLayerId) => void;
  setViewport: (viewport: LiveViewport | null) => void;
  activeLayerIds: () => LiveLayerId[];
  reset: () => void;
};

export const useLiveLayerStore = create<LiveLayerStore>((set, get) => ({
  enabled: { ...defaultEnabled },
  viewport: null,
  setLayerEnabled: (id, enabled) =>
    set((state) => ({ enabled: { ...state.enabled, [id]: enabled } })),
  toggleLayer: (id) =>
    set((state) => ({ enabled: { ...state.enabled, [id]: !state.enabled[id] } })),
  setViewport: (viewport) => set({ viewport }),
  activeLayerIds: () => {
    const { enabled, viewport } = get();
    if (!viewport) return [];
    return LIVE_LAYER_REGISTRY
      .filter((layer) => viewportCanActivateLayer(layer, viewport, enabled[layer.id]))
      .map((layer) => layer.id);
  },
  reset: () => set({ enabled: { ...defaultEnabled }, viewport: null }),
}));

export function shouldFetchLiveLayer(id: LiveLayerId): boolean {
  const state = useLiveLayerStore.getState();
  if (!state.viewport) return false;
  const layer = getLiveLayerDefinition(id);
  return viewportCanActivateLayer(layer, state.viewport, state.enabled[id]);
}
