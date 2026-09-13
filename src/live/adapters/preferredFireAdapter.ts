import type { LiveLayerAdapter, LiveLayerRequest, LiveLayerResponse } from "../adapter";
import { LiveBackendError } from "../backend";
import { getLiveBackendCapabilities } from "../backendCapabilities";
import { nasaEonetFiresAdapter } from "./nasaEonetFires";
import { nasaFirmsHotspotsAdapter } from "./nasaFirmsHotspots";

const BACKEND_UNAVAILABLE_TTL_MS = 15 * 60 * 1000;
const TRANSIENT_BACKOFF_MS = 60 * 1000;

let firmsRetryAfter = 0;

function backoffFor(error: unknown): number {
  if (error instanceof LiveBackendError) {
    if (error.status === 404 || error.status === 503) return BACKEND_UNAVAILABLE_TTL_MS;
    if (error.status >= 500) return TRANSIENT_BACKOFF_MS;
  }
  return TRANSIENT_BACKOFF_MS;
}

function aborted(request: LiveLayerRequest): boolean {
  return Boolean(request.signal?.aborted);
}

export const preferredFireAdapter: LiveLayerAdapter = {
  id: "preferred-fire-source-v2",
  layerId: "fires",
  async fetch(request: LiveLayerRequest): Promise<LiveLayerResponse> {
    const now = Date.now();
    const capabilities = await getLiveBackendCapabilities();

    if (capabilities.providers.firms && now >= firmsRetryAfter) {
      try {
        const response = await nasaFirmsHotspotsAdapter.fetch(request);
        firmsRetryAfter = 0;
        return response;
      } catch (error: unknown) {
        if (aborted(request)) throw error;
        firmsRetryAfter = Date.now() + backoffFor(error);
      }
    }

    const fallback = await nasaEonetFiresAdapter.fetch(request);
    return {
      ...fallback,
      source: capabilities.providers.firms
        ? `${fallback.source} (FIRMS fallback)`
        : `${fallback.source} (public fallback)`,
    };
  },
};

export function resetFireBackendProbe(): void {
  firmsRetryAfter = 0;
}
