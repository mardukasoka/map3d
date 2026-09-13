import type { FutureEpistemicClass } from "./types";
import type { DestinationEarthFeatureType } from "./destinationEarthAdapter";

export type DestinationEarthProductId =
  | "climate-dt"
  | "extremes-dt"
  | "on-demand-extremes-dt"
  | "nextgems";

export type DestinationEarthProductDefinition = {
  id: DestinationEarthProductId;
  label: string;
  epistemicClasses: readonly FutureEpistemicClass[];
  supportedFeatures: readonly DestinationEarthFeatureType[];
  role: string;
  notes?: string;
};

const STANDARD_FEATURES: readonly DestinationEarthFeatureType[] = Object.freeze([
  "timeseries",
  "boundingbox",
  "polygon",
  "trajectory",
  "verticalprofile",
]);

export const DESTINATION_EARTH_PRODUCTS: readonly DestinationEarthProductDefinition[] =
  Object.freeze([
    Object.freeze({
      id: "climate-dt",
      label: "Destination Earth Climate Digital Twin",
      epistemicClasses: Object.freeze(["projection", "scenario"] as const),
      supportedFeatures: STANDARD_FEATURES,
      role:
        "High-resolution climate projections and scenario-conditioned fields accessed through bounded Polytope feature extraction.",
      notes:
        "Preserve experiment, model, realization, generation, date, parameter, and extraction geometry in provenance.",
    }),
    Object.freeze({
      id: "extremes-dt",
      label: "Destination Earth Weather-Induced Extremes Digital Twin",
      epistemicClasses: Object.freeze(["forecast", "scenario"] as const),
      supportedFeatures: STANDARD_FEATURES,
      role:
        "Weather-extreme fields and event-scale model outputs for bounded regional and local extraction.",
    }),
    Object.freeze({
      id: "on-demand-extremes-dt",
      label: "Destination Earth On-Demand Extremes Digital Twin",
      epistemicClasses: Object.freeze(["forecast", "scenario"] as const),
      supportedFeatures: Object.freeze([
        "timeseries",
        "trajectory",
        "verticalprofile",
      ] as const),
      role:
        "On-demand extreme-event simulations requested for a specific event, location, trajectory, or profile.",
    }),
    Object.freeze({
      id: "nextgems",
      label: "NextGEMS",
      epistemicClasses: Object.freeze(["projection", "scenario"] as const),
      supportedFeatures: STANDARD_FEATURES,
      role:
        "Historical and scenario climate-model output exposed through the same bounded extraction architecture.",
      notes:
        "Historical model output and future scenario output must remain distinguishable in downstream epistemic metadata.",
    }),
  ]);

export function getDestinationEarthProduct(
  id: DestinationEarthProductId,
): DestinationEarthProductDefinition {
  const product = DESTINATION_EARTH_PRODUCTS.find((candidate) => candidate.id === id);
  if (!product) throw new Error(`Unknown Destination Earth product: ${id}`);
  return product;
}
