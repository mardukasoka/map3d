import type {
  FutureEpistemicClass,
  FutureSourceClass,
  FutureSpatialScope,
} from "./types";

export type FutureStateDomain =
  | "population"
  | "economy"
  | "finance"
  | "labour"
  | "energy"
  | "climate"
  | "food-land"
  | "resources"
  | "public-systems"
  | "wellbeing"
  | "ai-capability";

export type NormalizedStateMetric = {
  key: string;
  label: string;
  domain: FutureStateDomain;
  value: number | string | boolean | null;
  unit?: string;
  sourceVariable?: string;
  sourceSubsystem?: string;
  notes?: string;
};

export type ModelRunProvenance = {
  providerId: string;
  modelId: string;
  sourceClass?: FutureSourceClass;
  epistemicClass?: FutureEpistemicClass;
  modelVersion?: string;
  scenarioId?: string;
  scenarioLabel?: string;
  modelVintage?: string;
  runAt?: string;
  sourceRepository?: string;
  sourceRef?: string;
  datasetId?: string;
  doi?: string;
  checksum?: string;
};

export type NormalizedFutureStateVector = {
  targetDate: string;
  spatialScope: FutureSpatialScope;
  metrics: readonly NormalizedStateMetric[];
  provenance: ModelRunProvenance;
  assumptions?: readonly string[];
};

export function getMetric(
  vector: NormalizedFutureStateVector,
  key: string,
): NormalizedStateMetric | undefined {
  return vector.metrics.find((metric) => metric.key === key);
}
