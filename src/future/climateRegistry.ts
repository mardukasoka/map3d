import type { FutureEpistemicClass, FutureSourceClass } from "./types";

export type ClimateFutureSourceId =
  | "anu-climate-2050"
  | "ipcc-assessment"
  | "cmip-ensemble"
  | "isimip-impact"
  | "destination-earth-climate"
  | "international-futures-climate"
  | "earth3-climate"
  | "government-climate-pathway"
  | "industry-climate-scenario"
  | "science-fiction-climate";

export type ClimateFutureSource = {
  id: ClimateFutureSourceId;
  label: string;
  sourceClass: FutureSourceClass;
  epistemicClass: FutureEpistemicClass;
  variables: readonly string[];
  targetYears: readonly number[];
  geography: readonly string[];
  modelVintage?: string;
  notes?: string;
};

export const CLIMATE_FUTURE_SOURCES: readonly ClimateFutureSource[] = Object.freeze([
  Object.freeze({
    id: "anu-climate-2050",
    label: "ANU Climate 2050 visualisation",
    sourceClass: "science",
    epistemicClass: "projection",
    variables: ["temperature", "days-above-30c", "days-above-40c", "seasonality"],
    targetYears: [2050],
    geography: ["Australia", "local"],
    modelVintage: "legacy scenario/model generation; preserve explicitly",
    notes: "Treat as a scenario-bound historical projection source, not a universal 2050 forecast.",
  }),
  Object.freeze({
    id: "ipcc-assessment",
    label: "IPCC assessed climate futures",
    sourceClass: "science",
    epistemicClass: "projection",
    variables: ["temperature", "precipitation", "sea-level", "extremes", "confidence"],
    targetYears: [2030, 2050, 2100],
    geography: ["global", "regional"],
  }),
  Object.freeze({
    id: "cmip-ensemble",
    label: "CMIP ensemble projections",
    sourceClass: "model",
    epistemicClass: "projection",
    variables: ["temperature", "precipitation", "circulation", "extremes"],
    targetYears: [2030, 2050, 2100],
    geography: ["global", "regional", "downscaled"],
  }),
  Object.freeze({
    id: "isimip-impact",
    label: "ISIMIP cross-sector impacts",
    sourceClass: "model",
    epistemicClass: "projection",
    variables: ["water", "agriculture", "ecosystems", "health", "infrastructure-risk"],
    targetYears: [2030, 2050, 2100],
    geography: ["global", "regional"],
  }),
  Object.freeze({
    id: "destination-earth-climate",
    label: "Destination Earth climate scenarios",
    sourceClass: "model",
    epistemicClass: "scenario",
    variables: ["high-resolution-climate", "extremes", "what-if"],
    targetYears: [2030, 2050],
    geography: ["global", "regional", "local"],
  }),
  Object.freeze({
    id: "international-futures-climate",
    label: "International Futures climate-linked development scenarios",
    sourceClass: "model",
    epistemicClass: "scenario",
    variables: ["population", "economy", "energy", "agriculture", "health", "governance", "environment"],
    targetYears: [2030, 2050, 2075, 2100],
    geography: ["global", "country", "regional"],
  }),
  Object.freeze({
    id: "earth3-climate",
    label: "Earth3 planetary scenarios",
    sourceClass: "model",
    epistemicClass: "scenario",
    variables: ["warming", "emissions", "energy", "land", "sdg", "planetary-boundaries", "wellbeing"],
    targetYears: [2030, 2050],
    geography: ["global", "macro-region"],
  }),
  Object.freeze({
    id: "government-climate-pathway",
    label: "Government climate pathways",
    sourceClass: "government",
    epistemicClass: "target",
    variables: ["emissions", "energy", "adaptation", "infrastructure", "policy"],
    targetYears: [2030, 2050, 2100],
    geography: ["country", "subnational", "city"],
  }),
  Object.freeze({
    id: "industry-climate-scenario",
    label: "Industry climate and energy scenarios",
    sourceClass: "industry",
    epistemicClass: "scenario",
    variables: ["energy-demand", "energy-mix", "emissions", "technology", "investment"],
    targetYears: [2030, 2050],
    geography: ["global", "regional", "sector"],
  }),
  Object.freeze({
    id: "science-fiction-climate",
    label: "Science-fiction climate futures",
    sourceClass: "fiction",
    epistemicClass: "fiction",
    variables: ["climate", "migration", "governance", "inequality", "adaptation", "culture"],
    targetYears: [],
    geography: ["global", "regional", "city", "site"],
    notes: "Cultural foresight only; never assign scientific probability unless supported by a separate source.",
  }),
]);
