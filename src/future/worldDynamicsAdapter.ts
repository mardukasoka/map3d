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
      sourceVariable: "ic",
      key: "economy.industrialCapital",
      label: "Industrial capital",
      domain: "economy",
      verified: true,
      notes: "Industrial capital stock from the World3 capital subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "sc",
      key: "economy.serviceCapital",
      label: "Service capital",
      domain: "economy",
      verified: true,
      notes: "Service capital stock from the World3 capital subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "luf",
      key: "labour.laborUtilizationFraction",
      label: "Labor utilization fraction",
      domain: "labour",
      verified: true,
      notes: "World3 job subsystem defines luf as jobs divided by labour force.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "ppolx",
      key: "climate.persistentPollutionIndex",
      label: "Persistent pollution index",
      domain: "climate",
      verified: true,
      notes: "World3 defines ppolx as persistent pollution divided by the 1970 reference level; preserve model semantics and do not relabel as a modern emissions metric.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "ppol",
      key: "climate.persistentPollutionStock",
      label: "Persistent pollution stock",
      domain: "climate",
      verified: true,
      notes: "Model stock variable from the historical World3 pollution subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "fpc",
      key: "food-land.foodPerPerson",
      label: "Food per person",
      domain: "food-land",
      verified: true,
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "al",
      key: "food-land.arableLand",
      label: "Arable land",
      domain: "food-land",
      verified: true,
      notes: "Arable land stock from the World3 land-development subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "pal",
      key: "food-land.potentialArableLand",
      label: "Potential arable land",
      domain: "food-land",
      verified: true,
      notes: "Potential arable land stock from the World3 land-development subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "lfert",
      key: "food-land.landFertility",
      label: "Land fertility",
      domain: "food-land",
      verified: true,
      notes: "Historical World3 land-fertility state; retain model-specific meaning.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "nr",
      key: "resources.nonRenewableResourceStock",
      label: "Non-renewable resource stock",
      domain: "resources",
      verified: true,
      notes: "Non-renewable resource stock from the World3 resource subsystem.",
    }),
    Object.freeze({
      model: "World3",
      sourceVariable: "nrfr",
      key: "resources.nonRenewableResourceFractionRemaining",
      label: "Non-renewable resource fraction remaining",
      domain: "resources",
      verified: true,
      notes: "World3 defines nrfr as the remaining non-renewable stock divided by the initial stock.",
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
