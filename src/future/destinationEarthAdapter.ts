import type { FutureSpatialScope } from "./types";
import type { NormalizedFutureStateVector, NormalizedStateMetric } from "./stateVector";

export type DestinationEarthFeatureType =
  | "timeseries"
  | "boundingbox"
  | "polygon"
  | "trajectory"
  | "verticalprofile";

export type DestinationEarthExtractionRequest = {
  dataset: "climate-dt" | "extremes-dt" | "on-demand-extremes-dt" | "nextgems";
  activity?: string;
  experiment?: string;
  model?: string;
  parameter: string;
  date: string;
  time?: string;
  featureType: DestinationEarthFeatureType;
  points?: readonly (readonly [number, number])[];
  polygon?: readonly (readonly [number, number])[];
  targetYear?: number;
  spatialScope: FutureSpatialScope;
};

export type DestinationEarthExtractedValue = {
  key: string;
  label: string;
  value: number | null;
  unit?: string;
  sourceVariable: string;
  domain: NormalizedStateMetric["domain"];
  notes?: string;
};

export type DestinationEarthExtractionResult = {
  request: DestinationEarthExtractionRequest;
  values: readonly DestinationEarthExtractedValue[];
  modelVersion?: string;
  modelVintage?: string;
  runAt?: string;
  sourceRef?: string;
};

export const DESTINATION_EARTH_EXTRACTION_POLICY = Object.freeze({
  execution: "backend-only" as const,
  browserReceivesRawDatacube: false,
  boundedExtractionRequired: true,
  supportedFeatures: Object.freeze([
    "timeseries",
    "boundingbox",
    "polygon",
    "trajectory",
    "verticalprofile",
  ] as const),
  notes: Object.freeze([
    "Use Polytope feature extraction to request only the point, path, polygon, profile, or visible viewport needed by the Atlas.",
    "Do not ship Destination Earth authentication credentials or raw high-volume datacubes to the mobile client.",
    "Projection outputs remain model-derived and must not be relabelled as observations.",
  ]),
});

export function normalizeDestinationEarthExtraction(
  result: DestinationEarthExtractionResult,
): NormalizedFutureStateVector {
  const targetYear = result.request.targetYear;
  if (targetYear === undefined) {
    throw new Error("Destination Earth future-state normalization requires targetYear");
  }

  return {
    targetDate: `${targetYear}-01-01`,
    spatialScope: result.request.spatialScope,
    metrics: result.values.map((item) => ({
      key: item.key,
      label: item.label,
      domain: item.domain,
      value: item.value,
      unit: item.unit,
      sourceVariable: item.sourceVariable,
      sourceSubsystem: result.request.dataset,
      notes: item.notes,
    })),
    provenance: {
      providerId: "destination-earth",
      modelId: `destination-earth:${result.request.dataset}`,
      modelVersion: result.modelVersion,
      modelVintage: result.modelVintage,
      scenarioId: result.request.experiment,
      scenarioLabel: result.request.experiment,
      runAt: result.runAt,
      sourceRepository: "mardukasoka/polytope-examples",
      sourceRef: result.sourceRef,
    },
    assumptions: Object.freeze([
      `feature=${result.request.featureType}`,
      `parameter=${result.request.parameter}`,
      ...(result.request.model ? [`model=${result.request.model}`] : []),
    ]),
  };
}
