import type { FutureStateDomain } from "./stateVector";

export type Earth4AllScenarioId = "too-little-too-late" | "giant-leap" | "custom";

export type Earth4AllVariableMapping = {
  sourceSubsystem: string;
  sourceVariable: string;
  key: string;
  label: string;
  domain: FutureStateDomain;
  unit?: string;
  verified: boolean;
  notes?: string;
};

export const EARTH4ALL_SCENARIOS = Object.freeze({
  tooLittleTooLate: Object.freeze({
    id: "too-little-too-late" as const,
    runner: "run_tltl_solution",
    label: "Too Little Too Late",
  }),
  giantLeap: Object.freeze({
    id: "giant-leap" as const,
    runner: "run_gl_solution",
    label: "Giant Leap",
  }),
  custom: Object.freeze({
    id: "custom" as const,
    runner: "run_e4a_solution",
    label: "Parameterized Earth4All run",
  }),
});

// Only variables verified directly in the Earth4All source are marked true here.
// Additional subsystem mappings should be promoted to verified only after source inspection.
export const EARTH4ALL_VARIABLE_MAPPINGS: readonly Earth4AllVariableMapping[] = Object.freeze([
  Object.freeze({
    sourceSubsystem: "Population",
    sourceVariable: "POP",
    key: "population.total",
    label: "Population",
    domain: "population",
    unit: "million people",
    verified: true,
  }),
  Object.freeze({
    sourceSubsystem: "Population",
    sourceVariable: "PGR",
    key: "population.growthRate",
    label: "Population growth rate",
    domain: "population",
    unit: "1/year",
    verified: true,
  }),
  Object.freeze({
    sourceSubsystem: "Population",
    sourceVariable: "LE",
    key: "population.lifeExpectancy",
    label: "Life expectancy",
    domain: "population",
    unit: "years",
    verified: true,
  }),
  Object.freeze({
    sourceSubsystem: "Population",
    sourceVariable: "GDPP",
    key: "economy.gdpPerPerson",
    label: "GDP per person",
    domain: "economy",
    unit: "thousand dollars/person/year",
    verified: true,
  }),
  Object.freeze({
    sourceSubsystem: "Climate",
    sourceVariable: "OW",
    key: "climate.observedWarmingModelVariable",
    label: "Model warming state",
    domain: "climate",
    unit: "deg C",
    verified: true,
    notes:
      "Earth4All names this internal modeled variable 'Observed Warming'. In Atlas output it remains a model variable and must not be relabeled as an external observation.",
  }),
  Object.freeze({
    sourceSubsystem: "Climate",
    sourceVariable: "CO2CA",
    key: "climate.co2Concentration",
    label: "Atmospheric CO2 concentration",
    domain: "climate",
    unit: "ppm",
    verified: true,
  }),
  Object.freeze({
    sourceSubsystem: "Climate",
    sourceVariable: "GHGE",
    key: "climate.ghgEmissions",
    label: "Greenhouse gas emissions",
    domain: "climate",
    unit: "GtCO2e/year",
    verified: true,
  }),
]);

export const EARTH4ALL_RUN_WINDOW = Object.freeze({
  startYear: 1980,
  endYear: 2100,
  solver: "Euler",
  dt: 0.015625,
});
