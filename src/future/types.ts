export type FutureEpistemicClass =
  | "projection"
  | "forecast"
  | "scenario"
  | "target"
  | "fiction";

export type FutureSourceClass =
  | "science"
  | "government"
  | "industry"
  | "model"
  | "fiction";

export type FutureSpatialScope = {
  level: "global" | "region" | "country" | "subnational" | "city" | "site";
  id: string;
  label: string;
};

export type FutureValue = number | string | boolean | null;

export type FutureStateVariable = {
  key: string;
  label: string;
  value?: FutureValue;
  min?: number;
  max?: number;
  unit?: string;
  sourceClaimIds: readonly string[];
};

export type FutureClaim = {
  id: string;
  sourceId: string;
  sourceClass: FutureSourceClass;
  epistemicClass: FutureEpistemicClass;
  publicationDate?: string;
  targetDate: string;
  spatialScope: FutureSpatialScope;
  variableKey: string;
  value?: FutureValue;
  min?: number;
  max?: number;
  unit?: string;
  scenarioName?: string;
  assumptions?: readonly string[];
  confidence?: number;
  notes?: string;
};

export type FutureTransition = {
  fromStateId: string;
  toStateId: string;
  kind: "event" | "decision" | "trend" | "intervention" | "model-step";
  label: string;
  claimIds?: readonly string[];
};

export type FutureStateNode = {
  id: string;
  parentIds: readonly string[];
  targetDate: string;
  spatialScope: FutureSpatialScope;
  variables: readonly FutureStateVariable[];
  claimIds: readonly string[];
  assumptions?: readonly string[];
  probability?: number;
  confidence?: number;
  modelSourceIds?: readonly string[];
  narrativeRefs?: readonly string[];
};

export type PredictionAssessment = {
  claimId: string;
  assessedAt: string;
  observedValue?: FutureValue;
  error?: number;
  calibrationScore?: number;
  notes?: string;
};

export function isFutureEpistemicClass(value: string): value is FutureEpistemicClass {
  return ["projection", "forecast", "scenario", "target", "fiction"].includes(value);
}

export function assertFutureProbability(value: number | undefined, label: string): void {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }
}
