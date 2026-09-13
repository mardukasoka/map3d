export type JoinedTestHorizon = 2030 | 2050 | 2100;

export type JoinedTestBranch = {
  id: string;
  label: string;
  aiSourceIds: readonly string[];
  earth4AllScenarioId: "too-little-too-late" | "giant-leap";
  worldDynamicsLineage: "World3";
  targetYears: readonly JoinedTestHorizon[];
  notes: string;
};

export type JoinedTestLattice = {
  id: string;
  status: "structural-test";
  spatialScope: "global";
  branches: readonly JoinedTestBranch[];
  observationCalibration: {
    enabled: true;
    source: "earthengine-jl";
    rule: string;
  };
  epistemicRule: string;
};

export const FIRST_JOINED_TEST_LATTICE: JoinedTestLattice = Object.freeze({
  id: "future-lattice-2030-2050-2100-v0.1",
  status: "structural-test",
  spatialScope: "global",
  branches: Object.freeze([
    Object.freeze({
      id: "ai-transition-tltl",
      label: "AI transition + Too Little Too Late",
      aiSourceIds: Object.freeze(["ai-development-stages", "ai-2027"]),
      earth4AllScenarioId: "too-little-too-late",
      worldDynamicsLineage: "World3",
      targetYears: Object.freeze([2030, 2050, 2100] as const),
      notes:
        "Near-term AI-transition branch constrained by Earth4All TLTL and compared with the preserved World3 lineage. No numeric state values are embedded in this structural fixture.",
    }),
    Object.freeze({
      id: "ai-transition-giant-leap",
      label: "AI transition + Giant Leap",
      aiSourceIds: Object.freeze(["ai-development-stages", "ai-2027"]),
      earth4AllScenarioId: "giant-leap",
      worldDynamicsLineage: "World3",
      targetYears: Object.freeze([2030, 2050, 2100] as const),
      notes:
        "Near-term AI-transition branch constrained by Earth4All Giant Leap and compared with the preserved World3 lineage. No numeric state values are embedded in this structural fixture.",
    }),
  ]),
  observationCalibration: Object.freeze({
    enabled: true,
    source: "earthengine-jl",
    rule:
      "When a target date becomes observable, compare compatible normalized model metrics with later Earth observations; never overwrite the original forecast/scenario state.",
  }),
  epistemicRule:
    "This fixture joins scenario/model layers structurally only. It must not fabricate numerical model output, assign probabilities, or relabel scenario values as observations.",
});
