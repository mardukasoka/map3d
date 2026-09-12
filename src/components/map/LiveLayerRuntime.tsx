import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { LIVE_LAYER_REGISTRY } from "../../live/layerRegistry";
import { fetchLiveLayer, hasLiveLayerAdapter } from "../../live/runtime";
import { viewportCanActivateLayer } from "../../live/viewport";
import { useLiveDataStore } from "../../state/liveDataStore";
import { useLiveLayerStore } from "../../state/liveLayerStore";

export function LiveLayerRuntime() {
  const viewport = useLiveLayerStore((state) => state.viewport);
  const enabled = useLiveLayerStore((state) => state.enabled);
  const layers = useLiveDataStore((state) => state.layers);
  const setLoading = useLiveDataStore((state) => state.setLoading);
  const setResponse = useLiveDataStore((state) => state.setResponse);
  const setError = useLiveDataStore((state) => state.setError);
  const clearLayer = useLiveDataStore((state) => state.clearLayer);
  const controllersRef = useRef(new Map<string, AbortController>());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const activeIds = useMemo(() => {
    if (!viewport) return [];
    return LIVE_LAYER_REGISTRY
      .filter(
        (layer) =>
          hasLiveLayerAdapter(layer.id) &&
          viewportCanActivateLayer(layer, viewport, enabled[layer.id]),
      )
      .map((layer) => layer.id);
  }, [enabled, viewport]);

  useEffect(() => {
    const cancelLayer = (id: string) => {
      controllersRef.current.get(id)?.abort();
      controllersRef.current.delete(id);
      const timer = timersRef.current.get(id);
      if (timer) clearTimeout(timer);
      timersRef.current.delete(id);
    };

    if (!viewport) {
      for (const id of new Set([
        ...controllersRef.current.keys(),
        ...timersRef.current.keys(),
      ])) cancelLayer(id);
      return;
    }

    const activeSet = new Set(activeIds);
    for (const id of new Set([
      ...controllersRef.current.keys(),
      ...timersRef.current.keys(),
    ])) {
      if (!activeSet.has(id)) cancelLayer(id);
    }

    for (const layer of LIVE_LAYER_REGISTRY) {
      if (!activeSet.has(layer.id)) {
        if (!enabled[layer.id]) clearLayer(layer.id);
        continue;
      }

      const run = () => {
        cancelLayer(layer.id);
        const controller = new AbortController();
        controllersRef.current.set(layer.id, controller);
        setLoading(layer.id);

        void fetchLiveLayer(layer.id, viewport, controller.signal)
          .then((response) => {
            if (!controller.signal.aborted) setResponse(response);
          })
          .catch((error: unknown) => {
            if (controller.signal.aborted) return;
            setError(layer.id, error instanceof Error ? error.message : String(error));
          })
          .finally(() => {
            if (controllersRef.current.get(layer.id) === controller) {
              controllersRef.current.delete(layer.id);
            }
            if (!controller.signal.aborted) {
              const timer = setTimeout(run, layer.refreshMs);
              timersRef.current.set(layer.id, timer);
            }
          });
      };

      run();
    }

    return () => {
      for (const id of new Set([
        ...controllersRef.current.keys(),
        ...timersRef.current.keys(),
      ])) cancelLayer(id);
    };
  }, [activeIds, clearLayer, enabled, setError, setLoading, setResponse, viewport]);

  const earthquakeFeatures = layers.earthquakes?.features ?? [];

  return (
    <>
      {earthquakeFeatures.map((feature) => {
        const magnitude = Number(feature.properties?.magnitude ?? 0);
        const radius = Math.max(3, Math.min(12, 3 + magnitude));
        return (
          <CircleMarker
            key={feature.id}
            center={[feature.lat, feature.lon]}
            radius={radius}
            pathOptions={{ weight: 1, fillOpacity: 0.65 }}
          >
            <Tooltip direction="top">
              <div>
                <strong>{feature.label ?? "Earthquake"}</strong>
                <br />M {Number.isFinite(magnitude) ? magnitude.toFixed(1) : "?"}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
