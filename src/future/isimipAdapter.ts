import type { NormalizedFutureStateVector, NormalizedStateMetric } from "./stateVector";
import type { FutureEpistemicClass, FutureSpatialScope } from "./types";

export type IsimipDatasetMetadata = {
  datasetId: string;
  simulationRound: string;
  product: string;
  sector: string;
  impactModel: string;
  climateForcing?: string;
  climateScenario: string;
  socioeconomicScenario?: string;
  variable: string;
  temporalResolution?: string;
  spatialScope: FutureSpatialScope;
  startYear: number;
  endYear: number;
  modelVersion?: string;
  publicationVersion?: string;
  datasetPath?: string;
  doi?: string;
  checksum?: string;
  sourceRef?: string;
};

export type IsimipExtractedValue = {
  key: string;
  label: string;
  value: number | null;
  unit?: string;
  sourceVariable: string;
  domain: NormalizedStateMetric["domain"];
  aggregation?: string;
  notes?: string;
};

export type IsimipExtractionResult = {
  metadata: IsimipDatasetMetadata;
  targetYear: number;
  epistemicClass?: Extract<FutureEpistemicClass, "projection" | "scenario">;
  values: readonly IsimipExtractedValue[];
  extractedAt?: string;
  assumptions?: readonly string[];
};

function requireText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`ISIMIP ${label} is required`);
}

function validateMetadata(metadata: IsimipDatasetMetadata, targetYear: number): void {
  requireText(metadata.datasetId, "datasetId");
  requireText(metadata.simulationRound, "simulationRound");
  requireText(metadata.product, "product");
  requireText(metadata.sector, "sector");
  requireText(metadata.impactModel, "impactModel");
  requireText(metadata.climateScenario, "climateScenario");
  requireText(metadata.variable, "variable");

  if (!Number.isInteger(metadata.startYear) || !Number.isInteger(metadata.endYear)) {
    throw new Error("ISIMIP startYear and endYear must be integers");
  }
  if (metadata.startYear > metadata.endYear) {
    throw new Error("ISIMIP startYear must not exceed endYear");
  }
  if (targetYear < metadata.startYear || targetYear > metadata.endYear) {
    throw new Error("ISIMIP targetYear falls outside the dataset time range");
  }
}

export function normalizeIsimipExtraction(
  result: IsimipExtractionResult,
): NormalizedFutureStateVector {
  validateMetadata(result.metadata, result.targetYear);

  return {
    targetDate: `${result.targetYear}-01-01`,
    spatialScope: result.metadata.spatialScope,
    metrics: result.values.map((item) => ({
      key: item.key,
      label: item.label,
      domain: item.domain,
      value: item.value,
      unit: item.unit,
      sourceVariable: item.sourceVariable,
      sourceSubsystem: result.metadata.sector,
      notes: [item.aggregation ? `aggregation=${item.aggregation}` : undefined, item.notes]
        .filter((note): note is string => Boolean(note))
        .join("; ") || undefined,
    })),
    provenance: {
      providerId: "isimip",
      modelId: `isimip:${result.metadata.impactModel}`,
      sourceClass: "model",
      epistemicClass: result.epistemicClass ?? "projection",
      modelVersion: result.metadata.modelVersion,
      modelVintage: result.metadata.simulationRound,
      scenarioId: result.metadata.climateScenario,
      scenarioLabel: result.metadata.climateScenario,
      runAt: result.extractedAt,
      sourceRepository: "mardukasoka/isimip-publisher",
      sourceRef: result.metadata.sourceRef ?? result.metadata.datasetPath,
      datasetId: result.metadata.datasetId,
      doi: result.metadata.doi,
      checksum: result.metadata.checksum,
    },
    assumptions: Object.freeze([
      `simulation-round=${result.metadata.simulationRound}`,
      `product=${result.metadata.product}`,
      `sector=${result.metadata.sector}`,
      `variable=${result.metadata.variable}`,
      ...(result.metadata.climateForcing
        ? [`climate-forcing=${result.metadata.climateForcing}`]
        : []),
      ...(result.metadata.socioeconomicScenario
        ? [`socioeconomic-scenario=${result.metadata.socioeconomicScenario}`]
        : []),
      ...(result.metadata.temporalResolution
        ? [`temporal-resolution=${result.metadata.temporalResolution}`]
        : []),
      ...(result.metadata.publicationVersion
        ? [`publication-version=${result.metadata.publicationVersion}`]
        : []),
      ...(result.assumptions ?? []),
    ]),
  };
}

export const ISIMIP_ADAPTER_POLICY = Object.freeze({
  execution: "backend-only" as const,
  clientPayload: "bounded-normalized-impact-values" as const,
  preserveDatasetIdentity: true,
  preserveImpactModel: true,
  preserveClimateForcing: true,
  calibrationRole: "model-comparator" as const,
  notes: Object.freeze([
    "Retain simulation round, product, sector, impact model, forcing, scenario, variable, time range, and dataset identity.",
    "ISIMIP impact outputs are model-derived projections or scenarios, never Earth observations.",
    "Use isimip-publisher metadata and file checksums as provenance; do not send full NetCDF datasets to the mobile client.",
  ]),
});
