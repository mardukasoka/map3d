import { css } from "@emotion/react";
import { LIVE_LAYER_REGISTRY, isLayerVisibleAtZoom } from "../../live/layerRegistry";
import { hasLiveLayerAdapter } from "../../live/runtime";
import { useLiveDataStore } from "../../state/liveDataStore";
import { useLiveLayerStore } from "../../state/liveLayerStore";

export function LiveLayerTray() {
  const viewport = useLiveLayerStore((state) => state.viewport);
  const enabled = useLiveLayerStore((state) => state.enabled);
  const toggleLayer = useLiveLayerStore((state) => state.toggleLayer);
  const layers = useLiveDataStore((state) => state.layers);

  if (!viewport) return null;

  const available = LIVE_LAYER_REGISTRY.filter((layer) =>
    isLayerVisibleAtZoom(layer, viewport.zoom)
  );

  if (available.length === 0) return null;

  return (
    <div
      css={css({
        position: "absolute",
        zIndex: 9998,
        left: "0.75rem",
        bottom: "0.75rem",
        display: "flex",
        gap: "0.35rem",
        maxWidth: "calc(100% - 1.5rem)",
        overflowX: "auto",
        padding: "0.35rem",
        borderRadius: "10px",
        background: "rgba(15, 23, 42, 0.74)",
        backdropFilter: "blur(8px)",
        WebkitOverflowScrolling: "touch",
      })}
      aria-label="Live map layers available at this zoom"
    >
      {available.map((layer) => {
        const supported = hasLiveLayerAdapter(layer.id);
        const runtime = layers[layer.id];
        const statusSuffix = runtime?.status === "loading"
          ? " · loading"
          : runtime?.status === "error"
            ? " · error"
            : runtime?.status === "ready"
              ? ` · ${runtime.features.length}`
              : "";

        return (
          <button
            key={layer.id}
            type="button"
            disabled={!supported}
            onClick={() => supported && toggleLayer(layer.id)}
            aria-pressed={supported ? enabled[layer.id] : false}
            title={supported
              ? `Available from zoom ${layer.minZoom}. Loads only for the visible region.`
              : `${layer.label} adapter is not wired yet.`}
            css={css({
              flex: "0 0 auto",
              minHeight: "32px",
              padding: "0.35rem 0.55rem",
              borderRadius: "8px",
              border: supported && enabled[layer.id]
                ? "1px solid rgba(147, 197, 253, 0.95)"
                : "1px solid rgba(255, 255, 255, 0.22)",
              background: supported && enabled[layer.id]
                ? "rgba(37, 99, 235, 0.88)"
                : "rgba(15, 23, 42, 0.82)",
              color: supported ? "white" : "rgba(255,255,255,0.48)",
              fontSize: "12px",
              lineHeight: 1,
              cursor: supported ? "pointer" : "default",
              whiteSpace: "nowrap",
              opacity: supported ? 1 : 0.72,
            })}
          >
            {layer.label}{supported ? statusSuffix : " · soon"}
          </button>
        );
      })}
    </div>
  );
}
