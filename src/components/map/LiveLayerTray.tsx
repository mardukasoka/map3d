import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import {
  getLiveBackendCapabilities,
  type LiveBackendCapabilities,
} from "../../live/backendCapabilities";
import { LIVE_LAYER_REGISTRY, isLayerVisibleAtZoom } from "../../live/layerRegistry";
import { hasLiveLayerAdapter } from "../../live/runtime";
import { useLiveDataStore } from "../../state/liveDataStore";
import { useLiveLayerStore } from "../../state/liveLayerStore";

export function LiveLayerTray() {
  const viewport = useLiveLayerStore((state) => state.viewport);
  const enabled = useLiveLayerStore((state) => state.enabled);
  const toggleLayer = useLiveLayerStore((state) => state.toggleLayer);
  const layers = useLiveDataStore((state) => state.layers);
  const [capabilities, setCapabilities] = useState<LiveBackendCapabilities | null>(null);

  useEffect(() => {
    let mounted = true;
    void getLiveBackendCapabilities().then((next) => {
      if (mounted) setCapabilities(next);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!viewport) return null;

  const available = LIVE_LAYER_REGISTRY.filter(
    (layer) => hasLiveLayerAdapter(layer.id) && isLayerVisibleAtZoom(layer, viewport.zoom),
  );

  if (available.length === 0) return null;

  const providerLabels = capabilities
    ? [
        capabilities.providers.firms ? "FIRMS" : null,
        capabilities.providers.ais ? "AIS" : null,
        capabilities.providers.cctv ? "CCTV" : null,
      ].filter((value): value is string => Boolean(value))
    : [];
  const backendLabel = capabilities?.backend ? "Backend" : "Public";
  const backendTitle = capabilities?.backend
    ? providerLabels.length > 0
      ? `Backend live providers: ${providerLabels.join(", ")}`
      : "Backend available; no protected live providers configured"
    : "Public/static mode; protected live providers are unavailable";

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
        scrollbarWidth: "none",
      })}
      aria-label="Live map layers available at this zoom"
    >
      {available.map((layer) => {
        const runtime = layers[layer.id];
        const isEnabled = enabled[layer.id];
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
            onClick={() => toggleLayer(layer.id)}
            aria-pressed={isEnabled}
            title={`Available from zoom ${layer.minZoom}. Loads only for the visible region.`}
            css={css({
              flex: "0 0 auto",
              minHeight: "32px",
              padding: "0.35rem 0.55rem",
              borderRadius: "8px",
              border: isEnabled
                ? "1px solid rgba(147, 197, 253, 0.95)"
                : "1px solid rgba(255, 255, 255, 0.22)",
              background: isEnabled
                ? "rgba(37, 99, 235, 0.88)"
                : "rgba(15, 23, 42, 0.82)",
              color: "white",
              fontSize: "12px",
              lineHeight: 1,
              cursor: "pointer",
              whiteSpace: "nowrap",
            })}
          >
            {layer.label}{statusSuffix}
          </button>
        );
      })}

      <span
        title={backendTitle}
        aria-label={backendTitle}
        css={css({
          flex: "0 0 auto",
          alignSelf: "center",
          padding: "0.35rem 0.5rem",
          borderRadius: "999px",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          background: "rgba(15, 23, 42, 0.55)",
          color: "rgba(255, 255, 255, 0.72)",
          fontSize: "11px",
          lineHeight: 1,
          whiteSpace: "nowrap",
          cursor: "help",
        })}
      >
        {capabilities ? backendLabel : "Checking…"}
      </span>
    </div>
  );
}
