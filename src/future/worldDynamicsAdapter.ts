import type { FutureStateDomain, ModelRunProvenance } from "./stateVector";

export type WorldDynamicsModelLineage =
  | "World1"
  | "World1A"
  | "World1B"
  | "World2"
  | "World3"
  | "World3_03"
  | "World3_91";

export type WorldDynamicsOutputMapping = {
  model: WorldDynamicsModelLineage;
  sourceVariable: string;
  key: string;
  label: string;
  domain: FutureStateDomain;
  unit?: string;
  verified: boolean;
  notes?: string;
};

export type WorldDynamicsRunDescriptor = {
  lineage: WorldDynamicsModelLineage;
  targetYear: number;
  sourceRef?: string;
  modelVersion?: string;
  modelVintage?: string;
};

export function worldDynamicsProvenance(
  run: WorldDynamicsRunDescriptor,
): ModelRunProvenance {
  return {
    providerId: "worlddynamics-jl",
    modelId: `worlddynamics-jl:${run.lineage}`,
    modelVersion: run.modelVersion,
    modelVintage: run.modelVintage,
    sourceRepository: "mardukasoka/WorldDynamics.jl",
    sourceRef: run.sourceRef,
  };
}

export const WORLD_DYNAMICS_LINEAGES: readonly WorldDynamicsModelLineage[] = Object.freeze([
  "World1",
  "World1A",
  "World1B",
  "World2",
  "World3",
  "World3_03",
  "World3_91",
]);

// Verified directly against the World3 source tree. These are source-variable
// mappings only; numerical values must come from an actual Julia model run.
export const WORLD3_VERIFIED_OUTPUT_MAPPINGS: readonly WorldDynamicsOutputMapping[] =
  Object.freeze([
    Object.freeze({
      model: "World3",
      sourceVariable: "pop",
      key: "population.total",
      label: "Population",
      domain: "population",
      verified: true,
      notes: "World3 Pop4 population subsystem defines pop as p1 + p2 + p3 + p4.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "le",
      key: "population.lifeExpectancy",
      label: "Life expectancy",
      domain: "population",
      verified: true,
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "iopc",
      key: "economy.industrialOutputPerPerson",
      label: "Industrial output per person",
      domain: "economy",
      verified: true,
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "sopc",
      key: "economy.serviceOutputPerPerson",
      label: "Service output per person",
      domain: "economy",
      verified: true,
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "ppolx",
      key: "climate.persistentPollutionIndex",
      label: "Persistent pollution",
      domain: "climate",
      verified: true,
      notes: "Preserve the World3 model variable semantics; this is not a modern climate-emissions metric.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "fpc",
      key: "food-land.foodPerPerson",
      label: "Food per person",
      domain: "food-land",
      verified: true,
    }),
  ]);

export const WORLD_DYNAMICS_ADAPTER_POLICY = Object.freeze({
  preserveLineage: true,
  collapseAcrossLineages: false,
  execution: "remote-worker" as const,
  outputContract: "normalized-future-state-vector" as const,
  notes:
    "Mappings must be verified against each model lineage before publication. Historical World3 variants are not interchangeable with Earth4All outputs.",
});
