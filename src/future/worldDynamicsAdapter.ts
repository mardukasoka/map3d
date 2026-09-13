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

export const WORLD_DYNAMICS_ADAPTER_POLICY = Object.freeze({
  preserveLineage: true,
  collapseAcrossLineages: false,
  execution: "remote-worker" as const,
  outputContract: "normalized-future-state-vector" as const,
  notes:
    "Mappings must be verified against each model lineage before publication. Historical World3 variants are not interchangeable with Earth4All outputs.",
});
