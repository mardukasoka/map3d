import type { FutureSpatialScope } from "./types";
import type { NormalizedFutureStateVector, NormalizedStateMetric } from "./stateVector";
import {
  EARTH4ALL_SCENARIOS,
  EARTH4ALL_VARIABLE_MAPPINGS,
  type Earth4AllScenarioId,
} from "./earth4AllAdapter";

export type Earth4AllSnapshot = Readonly<Record<string, number | null | undefined>>;

export type Earth4AllNormalizeOptions = {
  targetYear: number;
  spatialScope: FutureSpatialScope;
  scenarioId: Earth4AllScenarioId;
  modelVersion?: string;
  modelVintage?: string;
  runAt?: string;
  sourceRef?: string;
  assumptions?: readonly string[];
};

function sourceKey(subsystem: string, variable: string): string {
  return `${subsystem}.${variable}`;
}

export function normalizeEarth4AllSnapshot(
  snapshot: Earth4AllSnapshot,
  options: Earth4AllNormalizeOptions,
): NormalizedFutureStateVector {
  const scenario = Object.values(EARTH4ALL_SCENARIOS).find(
    (candidate) => candidate.id === options.scenarioId,
  );

  if (!scenario) throw new Error(`Unknown Earth4All scenario: ${options.scenarioId}`);

  const metrics: NormalizedStateMetric[] = [];

  for (const mapping of EARTH4ALL_VARIABLE_MAPPINGS) {
    if (!mapping.verified) continue;

    const value = snapshot[sourceKey(mapping.sourceSubsystem, mapping.sourceVariable)];
    if (value === undefined) continue;

    metrics.push({
      key: mapping.key,
      label: mapping.label,
      domain: mapping.domain,
      value,
      unit: mapping.unit,
      sourceVariable: mapping.sourceVariable,
      sourceSubsystem: mapping.sourceSubsystem,
      notes: mapping.notes,
    });
  }

  return {
    targetDate: `${options.targetYear}-01-01`,
    spatialScope: options.spatialScope,
    metrics,
    provenance: {
      providerId: "earth4all-jl",
      modelId: "earth4all-jl",
      modelVersion: options.modelVersion,
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      modelVintage: options.modelVintage,
      runAt: options.runAt,
      sourceRepository: "mardukasoka/Earth4All.jl",
      sourceRef: options.sourceRef,
    },
    assumptions: options.assumptions,
  };
}
