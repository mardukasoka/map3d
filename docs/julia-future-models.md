# Julia future-model architecture

The Atlas future lattice keeps observation, simulation, scenario generation, and narrative interpretation separate.

## Execution boundary

The browser never runs the heavy Julia or Google Earth Engine stacks directly. Julia execution belongs on a remote worker/backend. The mobile client receives bounded normalized state vectors or observation records.

```text
EarthEngine.jl
  -> observed / reconstructed geospatial state
  -> calibration records

WorldDynamics.jl
  -> system-dynamics framework
  -> World1 / World2 / World3 model lineages

Earth4All.jl
  -> policy-conditioned integrated scenarios
  -> Too Little Too Late / Giant Leap / custom parameter runs

                 ↓
       normalized state vectors
                 ↓
       future-state lattice
                 ↓
 AI foresight branches + Council comparison
```

## EarthEngine.jl

EarthEngine.jl wraps the Google Earth Engine Python API through Julia/PyCall. It is an observation/reconstruction adapter, not a prediction engine. Authentication, raster processing, and large geospatial operations remain off-device.

Atlas outputs derived through this path must retain dataset identifiers, timestamps, spatial scope, and processing provenance. A later calibration layer can compare model claims against subsequent Earth observations.

## WorldDynamics.jl

WorldDynamics composes ModelingToolkit ODE systems and solves them through DifferentialEquations. The repository contains multiple model lineages, including World1, World2, World3, World3_91, and World3_03.

Model lineage is part of provenance. Atlas must not merge outputs from different historical World-model versions into a single anonymous trajectory.

## Earth4All.jl

Earth4All is built on WorldDynamics and currently exposes three useful run paths:

- `run_tltl_solution()` — Too Little Too Late
- `run_gl_solution()` — Giant Leap
- `run_e4a_solution(; kwargs...)` — parameterized custom run

The current solution helpers run from 1980 through 2100 using an Euler solver with `dt = 0.015625`.

Earth4All composes Climate, Demand, Energy, Finance, FoodLand, Inventory, LabourMarket, Other, Output, Population, Public, and Wellbeing subsystems.

## Normalization rules

1. A source variable is not promoted into the canonical state vector until its source subsystem, identifier, and unit have been inspected.
2. Internal variable names do not determine epistemic status. For example, Earth4All's climate variable `OW` is described in the model as "Observed Warming", but an Earth4All solution value remains a modeled value in Atlas.
3. Model scenario outputs remain `scenario`/`projection` claims; EarthEngine records remain observed/catalogued/derived observations.
4. No default probability is assigned to a scenario solely because the model can simulate it.
5. Every normalized vector carries model/scenario/vintage provenance.

## First verified Earth4All mappings

The first adapter scaffold contains only variables inspected directly in the source:

- Population `POP` — total population
- Population `PGR` — population growth rate
- Population `LE` — life expectancy
- Population `GDPP` — GDP per person
- Climate `OW` — model warming state
- Climate `CO2CA` — atmospheric CO2 concentration
- Climate `GHGE` — greenhouse-gas emissions

Energy, food/land, labour, finance, public-system, and wellbeing mappings remain intentionally unverified until their subsystem sources are inspected.
