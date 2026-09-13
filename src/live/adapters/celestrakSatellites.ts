import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  json2satrec,
  propagate,
} from "satellite.js";
import type {
  LiveFeature,
  LiveLayerAdapter,
  LiveLayerRequest,
  LiveLayerResponse,
} from "../adapter";
import { pointInBounds } from "../viewport";

const ENDPOINT =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=JSON";
const SOURCE_TTL_MS = 2 * 60 * 60 * 1000;

type OmmElement = {
  OBJECT_NAME?: string;
  OBJECT_ID?: string;
  EPOCH?: string;
  NORAD_CAT_ID?: number | string;
  MEAN_MOTION?: number;
  ECCENTRICITY?: number;
  INCLINATION?: number;
  RA_OF_ASC_NODE?: number;
  ARG_OF_PERICENTER?: number;
  MEAN_ANOMALY?: number;
  EPHEMERIS_TYPE?: number;
  CLASSIFICATION_TYPE?: string;
  ELEMENT_SET_NO?: number;
  REV_AT_EPOCH?: number;
  BSTAR?: number;
  MEAN_MOTION_DOT?: number;
  MEAN_MOTION_DDOT?: number;
};

let sourceCache: { expiresAt: number; elements: OmmElement[] } | null = null;

async function getElements(signal?: AbortSignal): Promise<OmmElement[]> {
  const now = Date.now();
  if (sourceCache && sourceCache.expiresAt > now) return sourceCache.elements;

  const response = await fetch(ENDPOINT, { signal });
  if (!response.ok) {
    throw new Error(`CelesTrak request failed: ${response.status}`);
  }

  const json = (await response.json()) as OmmElement[];
  const elements = Array.isArray(json) ? json : [];
  sourceCache = { expiresAt: now + SOURCE_TTL_MS, elements };
  return elements;
}

export const celestrakSatellitesAdapter: LiveLayerAdapter = {
  id: "celestrak-visual-satellites",
  layerId: "satellites",
  async fetch(request: LiveLayerRequest): Promise<LiveLayerResponse> {
    if (request.layerId !== "satellites") {
      throw new Error("CelesTrak satellite adapter only supports the satellites layer");
    }

    const elements = await getElements(request.signal);
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const gmst = gstime(date);
    const features: LiveFeature[] = [];

    for (const element of elements) {
      try {
        const satrec = json2satrec(element as any);
        const state = propagate(satrec, date);
        if (!state.position || typeof state.position === "boolean") continue;

        const geodetic = eciToGeodetic(state.position, gmst);
        const lat = degreesLat(geodetic.latitude);
        const lon = degreesLong(geodetic.longitude);
        if (!pointInBounds(lon, lat, request.viewport.bounds)) continue;

        const noradId = String(element.NORAD_CAT_ID ?? "unknown");
        const sourceTimestamp = Date.parse(element.EPOCH ?? "");
        features.push({
          id: `celestrak-${noradId}`,
          layerId: "satellites",
          lon,
          lat,
          altitudeM: geodetic.height * 1000,
          timestamp,
          provenanceKind: "derived",
          sourceTimestamp: Number.isFinite(sourceTimestamp) ? sourceTimestamp : undefined,
          label: element.OBJECT_NAME ?? `NORAD ${noradId}`,
          properties: {
            noradCatId: noradId,
            objectId: element.OBJECT_ID ?? null,
            epoch: element.EPOCH ?? null,
            sourceGroup: "visual",
            derivation: "SGP4 propagation from CelesTrak GP elements",
          },
        });
      } catch {
        // One malformed element must not invalidate the whole visible layer.
      }
    }

    return {
      layerId: "satellites",
      fetchedAt: timestamp,
      source: "CelesTrak GP visual group; positions propagated locally with SGP4",
      bounds: request.viewport.bounds,
      features,
    };
  },
};
