# Future Lattice v0.1

The future lattice extends the Atlas state graph beyond the present without treating predictions as observations.

## Boundary at NOW

Past and present states are grounded in observed, catalogued, derived, or reconstructed evidence. Future states are model-conditioned claims.

```text
PAST / PRESENT                           FUTURE
observations -> reconstruction -> NOW || projections / scenarios
                                     ||
                                     +- scientific projections
                                     +- integrated models
                                     +- government pathways / targets
                                     +- industry scenarios
                                     +- science-fiction futures
```

No future node may be rendered as an observed fact.

## Epistemic classes

- `projection`: conditional model output under stated assumptions/scenario.
- `forecast`: an explicit prediction of what is expected to occur.
- `scenario`: a coherent possible future used for exploration; not necessarily a forecast.
- `target`: a desired or policy-committed future state.
- `fiction`: cultural/narrative foresight. It may inspire variables or scenarios but is never scientific evidence by itself.

These classes must remain visible in data and UI. A target must not be silently converted into a forecast, and a scenario must not be silently converted into a probability.

## Lattice, not tree

A future state may have multiple parents and multiple outgoing transitions. Alternative paths may converge on equivalent or similar states. The graph therefore represents a state lattice rather than a simple narrative tree.

Transitions are typed as events, decisions, trends, interventions, or model steps.

## State and story are separate

The state vector is authoritative for simulation. Narrative is downstream.

```text
Evidence / models
       |
       v
Future claims
       |
       v
State vectors + transitions
       |
       v
Future-state lattice
       |
       v
Lattice narrative
```

Narrative systems may interpret a state but must not invent hidden state variables as if they were model outputs.

## Prediction history and calibration

Claims retain publication date, target date, source/model identity, assumptions, ranges, and confidence where supplied. When the target date arrives, observations can be attached through `PredictionAssessment`.

This permits calibration by domain rather than declaring one source or Council member globally "best".

Examples:
- temperature error
- population forecast error
- energy-mix error
- interval coverage
- probabilistic calibration

## Climate pilot

Climate is the first worked domain because it naturally exposes the distinction between projections, policy targets, strategic scenarios, and fiction.

Initial provider families:
- IPCC assessments
- CMIP ensembles
- ISIMIP impact ensembles
- Destination Earth scenarios
- International Futures
- Earth3
- IEA pathways
- national government pathways and targets
- industry scenarios
- science-fiction futures

### First comparison slice

The first joined checkpoint keeps four model roles distinct:

- Earth4All supplies the branch-defining integrated scenario state.
- WorldDynamics/World3 supplies the preserved system-dynamics lineage comparator.
- Destination Earth supplies bounded Earth-system projections or forecasts.
- ISIMIP supplies bounded cross-sector impact projections with dataset-level provenance.

EarthEngine alone supplies observations for later calibration. Destination Earth and
ISIMIP outputs must never enter the observation slot, even when they describe the
present or use observation-constrained initial conditions. Comparisons use only shared
normalized metric keys and preserve the original units, scenario, model, extraction,
dataset, DOI, checksum, and source references. Incompatible outputs are not averaged.

The ANU Australia-2050 visualisation is retained as a scenario-bound historical projection source and should be compared with newer model generations rather than treated as a universal 2050 forecast.

## UI direction

The Atlas time control should expose a hard NOW boundary. Future states require an explicit future/scenario mode. At broad zoom the user sees scenario envelopes or aggregated state variables; richer local consequences load only when zoom and selected scenario require them.

The existing mobile invariant still applies: nothing expensive loads until the current view requires it.
