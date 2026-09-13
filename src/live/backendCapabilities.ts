import { fetchLiveApiJson } from "./backend";

export type LiveBackendCapabilities = {
  version: number;
  backend: boolean;
  providers: {
    firms: boolean;
    ais: boolean;
    cctv: boolean;
  };
};

const STATIC_CAPABILITIES: LiveBackendCapabilities = Object.freeze({
  version: 1,
  backend: false,
  providers: Object.freeze({ firms: false, ais: false, cctv: false }),
});

let capabilitiesPromise: Promise<LiveBackendCapabilities> | null = null;

function normalizeCapabilities(value: unknown): LiveBackendCapabilities {
  if (!value || typeof value !== "object") return STATIC_CAPABILITIES;
  const candidate = value as Partial<LiveBackendCapabilities>;
  const providers = candidate.providers ?? {};
  return Object.freeze({
    version: Number.isFinite(candidate.version) ? Number(candidate.version) : 1,
    backend: candidate.backend === true,
    providers: Object.freeze({
      firms: (providers as LiveBackendCapabilities["providers"]).firms === true,
      ais: (providers as LiveBackendCapabilities["providers"]).ais === true,
      cctv: (providers as LiveBackendCapabilities["providers"]).cctv === true,
    }),
  });
}

export function getLiveBackendCapabilities(): Promise<LiveBackendCapabilities> {
  if (!capabilitiesPromise) {
    capabilitiesPromise = fetchLiveApiJson<unknown>("/api/capabilities")
      .then(normalizeCapabilities)
      .catch(() => STATIC_CAPABILITIES);
  }
  return capabilitiesPromise;
}

export function resetLiveBackendCapabilities(): void {
  capabilitiesPromise = null;
}
