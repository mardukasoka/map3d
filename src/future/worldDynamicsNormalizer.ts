import type { FutureSpatialScope } from "./types";
import type { NormalizedFutureStateVector, NormalizedStateMetric } from "./stateVector";
import {
  WORLD3_VERIFIED_OUTPUT_MAPPINGS,
  worldDynamicsProvenance,
  type WorldDynamicsModelLineage,
} from "./worldDynamicsAdapter";

export type WorldDynamicsSnapshot = Readonly<Record<string, number | null | undefined>>;

export type WorldDynamicsNormalizeOptions = {
  targetYear: number;
  spatialScope: FutureSpatialScope;
  lineage: WorldDynamicsModelLineage;
  modelVersion?: string;
  modelVintage?: string;
  sourceRef?: string;
  assumptions?: readonly string[];
};

function mappingsFor(lineage: WorldDynamicsModelLineage) {
  if (lineage === "World3") return WORLD3_VERIFIED_OUTPUT_MAPPINGS;
  return [];
}

export function normalizeWorldDynamicsSnapshot(
  snapshot: WorldDynamicsSnapshot,
  options: WorldDynamicsNormalizeOptions,
): NormalizedFutureStateVector {
  const metrics: NormalizedStateMetric[] = [];

  for (const mapping of mappingsFor(options.lineage)) {
    if (!mapping.verified) continue;

    const value = snapshot[mapping.sourceVariable];
    if (value === undefined) continue;

    metrics.push({
      key: mapping.key,
      label: mapping.label,
      domain: mapping.domain,
      value,
      unit: mapping.unit,
      sourceVariable: mapping.sourceVariable,
      notes: mapping.notes,
    });
  }

  return {
    targetDate: `${options.targetYear}-01-01`,
    spatialScope: options.spatialScope,
    metrics,
    provenance: worldDynamicsProvenance({
      lineage: options.lineage,
      targetYear: options.targetYear,
      modelVersion: options.modelVersion,
      modelVintage: options.modelVintage,
      sourceRef: options.sourceRef,
    }),
    assumptions: options.assumptions,
  };
}
