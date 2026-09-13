import type { FutureProviderId } from "./providerRegistry";
import type { Earth4AllScenarioId } from "./earth4AllAdapter";
import type { WorldDynamicsModelLineage } from "./worldDynamicsAdapter";

export type JoinedLatticeYear = 2030 | 2050 | 2100;

export type JoinedLatticeCheckpoint = {
  targetYear: JoinedLatticeYear;
  earth4AllScenarios: readonly Earth4AllScenarioId[];
  worldDynamicsComparators: readonly WorldDynamicsModelLineage[];
  aiScenarioSources: readonly FutureProviderId[];
  status: "structural-only";
  notes: readonly string[];
};

const PHYSICAL_SCENARIOS: readonly Earth4AllScenarioId[] = Object.freeze([
  "too-little-too-late",
  "giant-leap",
]);

const WORLD_DYNAMICS_COMPARATORS: readonly WorldDynamicsModelLineage[] = Object.freeze([
  "World3",
  "World3_03",
  "World3_91",
]);

const AI_SCENARIO_SOURCES: readonly FutureProviderId[] = Object.freeze([
  "ai-development-stages",
  "ai-cosmic-stages",
  "ai-2027",
  "artilect-war",
  "life-3-0",
]);

function checkpoint(targetYear: JoinedLatticeYear): JoinedLatticeCheckpoint {
  return Object.freeze({
    targetYear,
    earth4AllScenarios: PHYSICAL_SCENARIOS,
    worldDynamicsComparators: WORLD_DYNAMICS_COMPARATORS,
    aiScenarioSources: AI_SCENARIO_SOURCES,
    status: "structural-only" as const,
    notes: Object.freeze([
      "No numeric values, probabilities, or confidence scores are assigned by this scaffold.",
      "Earth4All outputs must be populated from verified Julia solution snapshots before a state vector is considered model-derived.",
      "WorldDynamics lineages are comparison sources and must retain their individual model identity.",
      "AI foresight sources annotate or branch the lattice; they do not overwrite physical model state.",
      "Observation-based calibration remains separate and is attached only when later observations exist for the target date.",
    ]),
  });
}

export const JOINED_LATTICE_CHECKPOINTS: readonly JoinedLatticeCheckpoint[] = Object.freeze([
  checkpoint(2030),
  checkpoint(2050),
  checkpoint(2100),
]);

export const JOINED_LATTICE_POLICY = Object.freeze({
  physicalStateSource: "earth4all-jl" as const,
  historicalSystemComparators: "worlddynamics-jl" as const,
  observationCalibrationSource: "earthengine-jl" as const,
  numericPopulationPolicy: "model-output-only" as const,
  probabilityPolicy: "source-supplied-only" as const,
  councilPolicy: "compare-not-vote" as const,
});
