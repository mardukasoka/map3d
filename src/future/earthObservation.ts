import type { FutureSpatialScope, FutureValue } from "./types";

export type EarthObservationKind = "observed" | "catalogued" | "derived";

export type EarthObservationMetric = {
  key: string;
  label: string;
  value: FutureValue;
  unit?: string;
  observedAt: string;
  spatialScope: FutureSpatialScope;
  provenanceKind: EarthObservationKind;
  datasetId?: string;
  processingNotes?: string;
};

export type CalibrationPair = {
  modelMetricKey: string;
  observationMetricKey: string;
  targetDate: string;
  tolerance?: number;
  unit?: string;
};

export const EARTHENGINE_EXECUTION_POLICY = Object.freeze({
  execution: "remote-worker" as const,
  authentication: "server-side" as const,
  clientPayload: "bounded-normalized-observations" as const,
  predictionRole: "none" as const,
  calibrationRole: "observation-source" as const,
});
