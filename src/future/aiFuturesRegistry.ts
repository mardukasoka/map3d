import type { FutureProviderId } from "./providerRegistry";

export type AIFutureLayer = "near-term-transition" | "conflict-transition" | "long-run-attractor";

export type AIFutureSourceDefinition = {
  providerId: Extract<FutureProviderId, "ai-2027" | "artilect-war" | "life-3-0">;
  layer: AIFutureLayer;
  role: string;
  branchFunction: string;
};

export const AI_FUTURE_SOURCE_REGISTRY: readonly AIFutureSourceDefinition[] = Object.freeze([
  Object.freeze({
    providerId: "ai-2027",
    layer: "near-term-transition",
    role: "Near-term capability growth, race dynamics, governance pressure, and transition timing",
    branchFunction: "Generate short-horizon candidate transition paths from the present into advanced-AI regimes",
  }),
  Object.freeze({
    providerId: "artilect-war",
    layer: "conflict-transition",
    role: "Human-artilect polarization, political conflict, and social responses to advanced machine intelligence",
    branchFunction: "Generate conflict and accommodation branches during the transition from human-dominant to advanced-AI societies",
  }),
  Object.freeze({
    providerId: "life-3-0",
    layer: "long-run-attractor",
    role: "Long-run post-superintelligence social and civilizational end states",
    branchFunction: "Provide qualitative attractor states that later lattice branches may converge toward without assigning default probabilities",
  }),
]);

export const AI_FUTURE_SPINE = Object.freeze({
  nearTerm: "ai-2027" as const,
  transitionConflict: "artilect-war" as const,
  longRunAttractors: "life-3-0" as const,
});
