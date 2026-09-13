import { create } from "zustand";
import type { LiveDeliveryState, LiveFeature, LiveLayerResponse } from "../live/adapter";
import type { LiveLayerId } from "../live/layerRegistry";

type LiveLayerStatus = "idle" | "loading" | "ready" | "error";

export type LiveLayerRuntimeState = {
  status: LiveLayerStatus;
  features: readonly LiveFeature[];
  source?: string;
  fetchedAt?: number;
  staleAt?: number;
  lastSuccessAt?: number;
  delivery?: LiveDeliveryState;
  error?: string;
};

type LiveDataStore = {
  layers: Partial<Record<LiveLayerId, LiveLayerRuntimeState>>;
  setLoading: (id: LiveLayerId) => void;
  setResponse: (response: LiveLayerResponse) => void;
  setError: (id: LiveLayerId, error: string) => void;
  clearLayer: (id: LiveLayerId) => void;
};

const idleState = (): LiveLayerRuntimeState => ({
  status: "idle",
  features: [],
});

export const useLiveDataStore = create<LiveDataStore>((set) => ({
  layers: {},
  setLoading: (id) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: {
          ...(state.layers[id] ?? idleState()),
          status: "loading",
          error: undefined,
        },
      },
    })),
  setResponse: (response) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [response.layerId]: {
          status: "ready",
          features: response.features,
          source: response.source,
          fetchedAt: response.fetchedAt,
          staleAt: response.staleAt,
          lastSuccessAt: Date.now(),
          delivery: response.delivery ?? "live",
          error: undefined,
        },
      },
    })),
  setError: (id, error) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: {
          ...(state.layers[id] ?? idleState()),
          status: "error",
          error,
        },
      },
    })),
  clearLayer: (id) =>
    set((state) => {
      if (!state.layers[id]) return state;
      const layers = { ...state.layers };
      delete layers[id];
      return { layers };
    }),
}));
