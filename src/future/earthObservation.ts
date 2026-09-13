import type { FutureSpatialScope, FutureValue } from "./types";
import type { NormalizedFutureStateVector, NormalizedStateMetric } from "./stateVector";

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

export type CalibrationResult = {
  modelMetricKey: string;
  observationMetricKey: string;
  targetDate: string;
  modelValue?: number;
  observedValue?: number;
  absoluteError?: number;
  relativeError?: number;
  withinTolerance?: boolean;
  notes?: string;
};

function findMetric(
  vector: NormalizedFutureStateVector,
  key: string,
): NormalizedStateMetric | undefined {
  return vector.metrics.find((metric) => metric.key === key);
}

export function calibrateMetric(
  vector: NormalizedFutureStateVector,
  observation: EarthObservationMetric,
  pair: CalibrationPair,
): CalibrationResult {
  const metric = findMetric(vector, pair.modelMetricKey);

  if (typeof metric?.value !== "number" || typeof observation.value !== "number") {
    return {
      modelMetricKey: pair.modelMetricKey,
      observationMetricKey: pair.observationMetricKey,
      targetDate: pair.targetDate,
      notes: "Calibration requires numeric model and observation values.",
    };
  }

  const absoluteError = Math.abs(metric.value - observation.value);
  const relativeError = observation.value === 0 ? undefined : absoluteError / Math.abs(observation.value);

  return {
    modelMetricKey: pair.modelMetricKey,
    observationMetricKey: pair.observationMetricKey,
    targetDate: pair.targetDate,
    modelValue: metric.value,
    observedValue: observation.value,
    absoluteError,
    relativeError,
    withinTolerance: pair.tolerance === undefined ? undefined : absoluteError <= pair.tolerance,
  };
}

export const EARTHENGINE_EXECUTION_POLICY = Object.freeze({
  execution: "remote-worker" as const,
  authentication: "server-side" as const,
  clientPayload: "bounded-normalized-observations" as const,
  predictionRole: "none" as const,
  calibrationRole: "observation-source" as const,
});
