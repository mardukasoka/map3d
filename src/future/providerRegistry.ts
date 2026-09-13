import type { FutureSourceClass } from "./types";

export type FutureProviderId =
  | "ipcc"
  | "cmip"
  | "isimip"
  | "destination-earth"
  | "international-futures"
  | "earth3"
  | "iea"
  | "national-government"
  | "industry-scenario"
  | "artilect-war"
  | "ai-2027"
  | "life-3-0"
  | "ai-development-stages"
  | "ai-cosmic-stages"
  | "science-fiction";

export type FutureProviderDefinition = {
  id: FutureProviderId;
  label: string;
  sourceClass: FutureSourceClass;
  role: string;
  defaultEpistemicClass: "projection" | "forecast" | "scenario" | "target" | "fiction";
  spatialScale: readonly string[];
  timeHorizon?: string;
  notes?: string;
};

export const FUTURE_PROVIDER_REGISTRY: readonly FutureProviderDefinition[] = Object.freeze([
  Object.freeze({
    id: "ipcc",
    label: "IPCC assessments",
    sourceClass: "science",
    role: "Assessed climate projections, scenario ranges, confidence language and synthesis",
    defaultEpistemicClass: "projection",
    spatialScale: ["global", "regional"],
    timeHorizon: "multi-decadal to 2100+",
  }),
  Object.freeze({
    id: "cmip",
    label: "CMIP climate-model ensembles",
    sourceClass: "model",
    role: "Physical climate model ensembles and scenario-conditioned projections",
    defaultEpistemicClass: "projection",
    spatialScale: ["global", "regional", "downscaled"],
    timeHorizon: "multi-decadal to 2100+",
  }),
  Object.freeze({
    id: "isimip",
    label: "ISIMIP",
    sourceClass: "model",
    role: "Cross-sector climate-impact model ensembles",
    defaultEpistemicClass: "projection",
    spatialScale: ["global", "regional"],
    timeHorizon: "multi-decadal",
  }),
  Object.freeze({
    id: "destination-earth",
    label: "Destination Earth",
    sourceClass: "model",
    role: "High-resolution Earth-system digital-twin and what-if scenario outputs",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "regional", "local"],
    timeHorizon: "near- to mid-term scenario analysis",
  }),
  Object.freeze({
    id: "international-futures",
    label: "International Futures",
    sourceClass: "model",
    role: "Integrated demographic, economic, energy, health, governance and development scenarios",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "country", "regional"],
    timeHorizon: "to 2100",
  }),
  Object.freeze({
    id: "earth3",
    label: "Earth3",
    sourceClass: "model",
    role: "Planetary-system, SDG, wellbeing and boundary-constrained scenario modelling",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "macro-region"],
    timeHorizon: "to 2050",
  }),
  Object.freeze({
    id: "iea",
    label: "IEA pathways",
    sourceClass: "science",
    role: "Energy-system pathways and policy-conditioned scenarios",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "region", "country"],
    timeHorizon: "mid-century",
  }),
  Object.freeze({
    id: "national-government",
    label: "Government pathways and targets",
    sourceClass: "government",
    role: "Official policy pathways, targets, adaptation plans and national projections",
    defaultEpistemicClass: "target",
    spatialScale: ["country", "subnational", "city"],
  }),
  Object.freeze({
    id: "industry-scenario",
    label: "Industry scenarios",
    sourceClass: "industry",
    role: "Strategic scenarios and sector outlooks from industry participants",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "region", "sector"],
  }),
  Object.freeze({
    id: "artilect-war",
    label: "The Coming War of the Artilects",
    sourceClass: "foresight",
    role: "Conflict-oriented AI-transition framing centered on polarization between humans, AI advocates, and advanced machine intelligence",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global"],
    timeHorizon: "AI transition and post-human conflict horizon",
    notes: "Use as a branch-generating conflict scenario source, not as an empirical forecast.",
  }),
  Object.freeze({
    id: "ai-2027",
    label: "AI 2027",
    sourceClass: "foresight",
    role: "Near-term AI capability-race and transition scenario used to generate candidate short-horizon lattice branches",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global"],
    timeHorizon: "near term",
    notes: "Preserve scenario assumptions and branch structure; do not present the scenario timeline as observed fact.",
  }),
  Object.freeze({
    id: "life-3-0",
    label: "Life 3.0 aftermath scenarios",
    sourceClass: "foresight",
    role: "Long-run AI aftermath attractor states derived from Max Tegmark's scenario set",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global"],
    timeHorizon: "long-run post-superintelligence",
    notes: "Treat named aftermath outcomes as qualitative attractor states, not probability-weighted forecasts unless probabilities are supplied separately.",
  }),
  Object.freeze({
    id: "ai-development-stages",
    label: "Nine stages of future AI",
    sourceClass: "foresight",
    role: "Heuristic capability-and-autonomy development ladder from rule-based systems through global-network coordination",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global"],
    timeHorizon: "open-ended capability progression",
    notes: "Use as anticipated-development markers, not as a validated or inevitable sequence. Stages may overlap, stall, reorder, or never occur.",
  }),
  Object.freeze({
    id: "ai-cosmic-stages",
    label: "Ten stages of AI",
    sourceClass: "foresight",
    role: "Speculative capability ladder extending beyond AGI and ASI into transcendent, cosmic, and godlike machine-intelligence concepts",
    defaultEpistemicClass: "scenario",
    spatialScale: ["global", "interplanetary", "interstellar"],
    timeHorizon: "open-ended and highly speculative",
    notes: "Internet/futurist taxonomy rather than a peer-reviewed forecast. Use upper stages as speculative horizon markers and physics-constrained thought experiments, not expected outcomes.",
  }),
  Object.freeze({
    id: "science-fiction",
    label: "Science-fiction futures",
    sourceClass: "fiction",
    role: "Cultural foresight and narrative exploration; never treated as measured prediction",
    defaultEpistemicClass: "fiction",
    spatialScale: ["global", "region", "city", "site"],
  }),
]);

export function getFutureProvider(id: FutureProviderId): FutureProviderDefinition {
  const provider = FUTURE_PROVIDER_REGISTRY.find((candidate) => candidate.id === id);
  if (!provider) throw new Error(`Unknown future provider: ${id}`);
  return provider;
}
