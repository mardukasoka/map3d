import type { FutureStateDomain } from "./stateVector";

export type JuliaModelId = "earthengine-jl" | "worlddynamics-jl" | "earth4all-jl";

export type JuliaModelRole = "observation" | "simulation-framework" | "scenario-engine";

export type JuliaExecutionBoundary = "remote-worker";

export type JuliaModelDefinition = {
  id: JuliaModelId;
  label: string;
  role: JuliaModelRole;
  repository: string;
  defaultBranch: string;
  executionBoundary: JuliaExecutionBoundary;
  domains: readonly FutureStateDomain[];
  timeHorizon?: string;
  notes: string;
};

export const JULIA_MODEL_REGISTRY: readonly JuliaModelDefinition[] = Object.freeze([
  Object.freeze({
    id: "earthengine-jl",
    label: "EarthEngine.jl",
    role: "observation",
    repository: "mardukasoka/EarthEngine.jl",
    defaultBranch: "main",
    executionBoundary: "remote-worker",
    domains: ["climate", "food-land", "resources", "public-systems"],
    notes:
      "Julia wrapper around the Google Earth Engine Python API. Use for observed/reconstructed geospatial state and later calibration, not as a future prediction engine. Keep Earth Engine authentication and raster processing off-device.",
  }),
  Object.freeze({
    id: "worlddynamics-jl",
    label: "WorldDynamics.jl",
    role: "simulation-framework",
    repository: "mardukasoka/WorldDynamics.jl",
    defaultBranch: "main",
    executionBoundary: "remote-worker",
    domains: ["population", "economy", "energy", "food-land", "resources", "climate"],
    notes:
      "ModelingToolkit/DifferentialEquations framework containing World1/2/3 model lineages. Preserve model version and lineage; do not collapse historical World3 outputs into Earth4All outputs.",
  }),
  Object.freeze({
    id: "earth4all-jl",
    label: "Earth4All.jl",
    role: "scenario-engine",
    repository: "mardukasoka/Earth4All.jl",
    defaultBranch: "master",
    executionBoundary: "remote-worker",
    domains: [
      "population",
      "economy",
      "finance",
      "labour",
      "energy",
      "climate",
      "food-land",
      "public-systems",
      "wellbeing",
    ],
    timeHorizon: "1980-2100 in current scenario solution helpers",
    notes:
      "Integrated Earth4All system built on WorldDynamics. Supports Too Little Too Late, Giant Leap, and parameterized custom runs. Treat outputs as model/scenario states, never observations.",
  }),
]);

export function getJuliaModel(id: JuliaModelId): JuliaModelDefinition {
  const model = JULIA_MODEL_REGISTRY.find((candidate) => candidate.id === id);
  if (!model) throw new Error(`Unknown Julia model: ${id}`);
  return model;
}
