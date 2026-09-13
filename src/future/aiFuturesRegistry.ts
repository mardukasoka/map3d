import type { FutureProviderId } from "./providerRegistry";

export type AIFutureLayer =
  | "anticipated-development"
  | "near-term-transition"
  | "conflict-transition"
  | "long-run-attractor";

export type AIFutureSourceDefinition = {
  providerId: Extract<
    FutureProviderId,
    "ai-development-stages" | "ai-cosmic-stages" | "ai-2027" | "artilect-war" | "life-3-0"
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

export const AI_COSMIC_DEVELOPMENT_STAGES: readonly AIDevelopmentStage[] = Object.freeze([
  Object.freeze({
    order: 1,
    id: "rule-based-ai-10",
    label: "Rule-Based AI",
    capability: "Executes explicit rules and pre-programmed procedures",
    interpretation: "Established baseline automation rather than a future threshold",
  }),
  Object.freeze({
    order: 2,
    id: "context-aware-ai",
    label: "Context-Aware AI",
    capability: "Adapts outputs using environmental context, history, and user state",
    interpretation: "Incremental adaptive capability; overlaps with existing machine-learning systems",
  }),
  Object.freeze({
    order: 3,
    id: "narrow-ai",
    label: "Narrow AI",
    capability: "Achieves strong performance in bounded task domains",
    interpretation: "Current and historical task-specialized systems; not necessarily a linear successor to context awareness",
  }),
  Object.freeze({
    order: 4,
    id: "reasoning-ai",
    label: "Reasoning AI",
    capability: "Performs multi-step inference, planning, abstraction, and tool-mediated problem solving",
    interpretation: "Useful observed-development marker, though definitions and benchmarks evolve",
  }),
  Object.freeze({
    order: 5,
    id: "agi-10",
    label: "Artificial General Intelligence",
    capability: "Matches or exceeds humans across a broad range of intellectual and software-mediated tasks",
    interpretation: "Contested threshold with no single accepted test or arrival criterion",
  }),
  Object.freeze({
    order: 6,
    id: "asi-10",
    label: "Artificial Superintelligence",
    capability: "Substantially surpasses human cognitive performance across most strategically important domains",
    interpretation: "Speculative high-impact threshold; timing and feasibility are unresolved",
  }),
  Object.freeze({
    order: 7,
    id: "self-aware-ai-10",
    label: "Self-Aware AI",
    capability: "Maintains a persistent self-model and, in the stronger interpretation, possesses consciousness or subjective experience",
    interpretation: "Highly speculative; self-modeling, metacognition, identity, emotion, and phenomenal consciousness must remain separate claims",
  }),
  Object.freeze({
    order: 8,
    id: "transcendent-ai",
    label: "Transcendent AI",
    capability: "Operates as a distributed intelligence across biological, digital, robotic, and potentially nanoscale substrates and can redesign complex living or engineered systems",
    interpretation: "Futurist horizon marker. Claims about collective consciousness, new lifeforms, or planetary-scale nanotechnology require separate scientific evidence.",
  }),
  Object.freeze({
    order: 9,
    id: "cosmic-ai",
    label: "Cosmic AI",
    capability: "Expands beyond Earth through autonomous space infrastructure, self-replicating or self-maintaining probes, and large-scale energy acquisition",
    interpretation: "Extreme long-horizon scenario. Evaluate against propulsion, replication, communication, thermodynamics, and Kardashev-scale energy constraints rather than treating it as inevitable.",
  }),
  Object.freeze({
    order: 10,
    id: "godlike-ai",
    label: "Godlike AI",
    capability: "Represents the limiting concept of intelligence with civilization-scale or universe-scale modelling and control capabilities",
    interpretation: "Metaphorical/speculative endpoint, not a physically established capability class. Omniscience, omnipotence, extra-dimensional operation, time manipulation, and parallel-reality control must not be represented as scientific predictions.",
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
    providerId: "ai-cosmic-stages",
    layer: "anticipated-development",
    role: "Speculative long-horizon development ladder extending from current AI through transcendent, cosmic, and godlike concepts",
    branchFunction: "Provide outer-horizon capability markers while forcing physics, engineering, and epistemic constraints to remain explicit",
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
  speculativeCosmicDevelopments: "ai-cosmic-stages" as const,
  nearTerm: "ai-2027" as const,
  transitionConflict: "artilect-war" as const,
  longRunAttractors: "life-3-0" as const,
});
