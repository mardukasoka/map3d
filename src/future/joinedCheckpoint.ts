import type { NormalizedFutureStateVector } from "./stateVector";
import type { JoinedTestBranch, JoinedTestHorizon } from "./joinedTestLattice";

export type JoinedFutureCheckpoint = {
  branchId: string;
  targetYear: JoinedTestHorizon;
  earth4AllState: NormalizedFutureStateVector;
  worldDynamicsComparator: NormalizedFutureStateVector;
  sharedMetricKeys: readonly string[];
  comparisonRule: string;
};

function targetYearOf(vector: NormalizedFutureStateVector): number {
  return Number.parseInt(vector.targetDate.slice(0, 4), 10);
}

function scopeIdentity(vector: NormalizedFutureStateVector): string {
  return `${vector.spatialScope.level}:${vector.spatialScope.id}`;
}

export function assembleJoinedFutureCheckpoint(
  branch: JoinedTestBranch,
  targetYear: JoinedTestHorizon,
  earth4AllState: NormalizedFutureStateVector,
  worldDynamicsComparator: NormalizedFutureStateVector,
): JoinedFutureCheckpoint {
  if (!branch.targetYears.includes(targetYear)) {
    throw new Error(`Target year ${targetYear} is not enabled for branch ${branch.id}`);
  }

  if (targetYearOf(earth4AllState) !== targetYear) {
    throw new Error("Earth4All state target year does not match joined checkpoint target year");
  }

  if (targetYearOf(worldDynamicsComparator) !== targetYear) {
    throw new Error("WorldDynamics comparator target year does not match joined checkpoint target year");
  }

  if (scopeIdentity(earth4AllState) !== scopeIdentity(worldDynamicsComparator)) {
    throw new Error("Joined model states must use the same spatial scope");
  }

  if (earth4AllState.provenance.providerId !== "earth4all-jl") {
    throw new Error("Joined physical state must originate from Earth4All.jl");
  }

  if (earth4AllState.provenance.scenarioId !== branch.earth4AllScenarioId) {
    throw new Error("Earth4All scenario does not match joined branch definition");
  }

  if (worldDynamicsComparator.provenance.providerId !== "worlddynamics-jl") {
    throw new Error("Joined comparator state must originate from WorldDynamics.jl");
  }

  if (!worldDynamicsComparator.provenance.modelId.endsWith(`:${branch.worldDynamicsLineage}`)) {
    throw new Error("WorldDynamics lineage does not match joined branch definition");
  }

  const comparatorKeys = new Set(
    worldDynamicsComparator.metrics.map((metric) => metric.key),
  );
  const sharedMetricKeys = earth4AllState.metrics
    .map((metric) => metric.key)
    .filter((key) => comparatorKeys.has(key));

  return Object.freeze({
    branchId: branch.id,
    targetYear,
    earth4AllState,
    worldDynamicsComparator,
    sharedMetricKeys: Object.freeze(sharedMetricKeys),
    comparisonRule:
      "Compare only semantically compatible normalized metrics. Preserve each model's provenance, assumptions, units, and lineage; do not average incompatible model outputs.",
  });
}
