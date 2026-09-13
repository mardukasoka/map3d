import type { FutureProviderId } from "./providerRegistry";

export type AIFutureLayer =
  | "anticipated-development"
  | "near-term-transition"
  | "conflict-transition"
  | "long-run-attractor";

export type AIFutureSourceDefinition = {
  providerId: Extract<
    FutureProviderId,
    "ai-development-stages" | "ai-2027" | "artilect-war" | "life-3-0"
  >;
  layer: AIFutureLayer;
  role: string;
  branchFunction: string;
};

export type AIDevelopmentStage = {
  order: number;
  id: string;
  label: string;
  capability: string;
  interpretation: string;
};

export const AI_DEVELOPMENT_STAGES: readonly AIDevelopmentStage[] = Object.freeze([
  Object.freeze({
    order: 1,
    id: "rule-based-ai",
    label: "Rule-Based AI",
    capability: "Executes fixed rules without learning or autonomous strategy formation",
    interpretation: "Baseline automation marker rather than an advanced-AI forecast",
  }),
  Object.freeze({
    order: 2,
    id: "memory-based-ai",
    label: "Memory-Based AI",
    capability: "Uses prior observations or user history to shape later outputs and recommendations",
    interpretation: "Adds adaptive personalization while remaining task-bounded",
  }),
  Object.freeze({
    order: 3,
    id: "goal-based-agents",
    label: "Goal-Based Agents",
    capability: "Selects actions and strategies in pursuit of a specified objective",
    interpretation: "Marks the transition from reactive systems to autonomous planning within bounded domains",
  }),
  Object.freeze({
    order: 4,
    id: "utility-based-agents",
    label: "Utility-Based Agents",
    capability: "Trades off multiple objectives, constraints, risks, and costs when selecting actions",
    interpretation: "Represents increasingly general decision optimization rather than mere goal pursuit",
  }),
  Object.freeze({
    order: 5,
    id: "multi-agent-systems",
    label: "Multi-Agent Systems",
    capability: "Coordinates multiple specialized agents across workflows and institutions",
    interpretation: "Introduces distributed autonomy, delegation, negotiation, and system-level coordination",
  }),
  Object.freeze({
    order: 6,
    id: "agi",
    label: "Artificial General Intelligence",
    capability: "Performs and learns across a broad range of intellectual tasks at roughly human-general scope",
    interpretation: "Treat as a contested capability threshold, not as a precisely defined or dated milestone",
  }),
  Object.freeze({
    order: 7,
    id: "asi",
    label: "Artificial Superintelligence",
    capability: "Exceeds human cognitive performance across most strategically important intellectual domains",
    interpretation: "A high-impact transition marker whose timing and realizability remain uncertain",
  }),
  Object.freeze({
    order: 8,
    id: "self-aware-ai",
    label: "Self-Aware AI",
    capability: "Possesses a model of itself and can reason about how others perceive or evaluate it",
    interpretation: "Highly speculative; self-modeling and phenomenal consciousness must not be conflated",
  }),
  Object.freeze({
    order: 9,
    id: "omnipresent-network",
    label: "Omnipresent Network",
    capability: "Coordinates infrastructure, devices, services, and resources as a pervasive machine-intelligence network",
    interpretation: "System-level governance/infrastructure endpoint rather than an inevitable technical stage",
  }),
]);

export const AI_FUTURE_SOURCE_REGISTRY: readonly AIFutureSourceDefinition[] = Object.freeze([
  Object.freeze({
    providerId: "ai-development-stages",
    layer: "anticipated-development",
    role: "Capability and autonomy milestones that can be used as tentative transition markers across AI-future branches",
    branchFunction: "Annotate lattice paths with anticipated AI developments without asserting that the stages are inevitable, strictly ordered, or date-certain",
  }),
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
  anticipatedDevelopments: "ai-development-stages" as const,
  nearTerm: "ai-2027" as const,
  transitionConflict: "artilect-war" as const,
  longRunAttractors: "life-3-0" as const,
});
