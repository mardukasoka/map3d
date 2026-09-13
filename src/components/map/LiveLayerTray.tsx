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

function formatAge(timestamp: number | undefined, now: number): string | null {
  if (!timestamp || !Number.isFinite(timestamp)) return null;
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

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
  const showOsmAttribution = enabled.cameras || enabled.infrastructure;
  const now = Date.now();

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
        const isStale = Boolean(runtime?.staleAt && runtime.staleAt <= now);
        const deliveryLabel = runtime?.delivery === "cached"
          ? "cached"
          : runtime?.delivery === "fallback"
            ? "fallback"
            : null;
        const healthLabel = runtime?.status === "error"
          ? "error"
          : isStale
            ? "stale"
            : deliveryLabel;
        const statusSuffix = runtime?.status === "loading"
          ? " · loading"
          : runtime?.status === "ready" || runtime?.status === "error"
            ? ` · ${healthLabel ?? runtime.features.length}`
            : "";
        const lastSuccess = formatAge(runtime?.lastSuccessAt, now);
        const healthTitle = [
          `Available from zoom ${layer.minZoom}. Loads only for the visible region.`,
          runtime?.source ? `Source: ${runtime.source}.` : null,
          lastSuccess ? `Last success: ${lastSuccess}.` : null,
          runtime?.delivery === "cached" ? "Serving a valid viewport cache entry." : null,
          runtime?.delivery === "fallback" ? "Preferred source unavailable or not configured; fallback source in use." : null,
          isStale ? "Data has exceeded its freshness deadline." : null,
          runtime?.error ? `Latest refresh error: ${runtime.error}` : null,
        ].filter((value): value is string => Boolean(value)).join(" ");

        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => toggleLayer(layer.id)}
            aria-pressed={isEnabled}
            title={healthTitle}
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

      {showOsmAttribution ? (
        <span
          title="Live overlay data © OpenStreetMap contributors"
          aria-label="Live overlay data © OpenStreetMap contributors"
          css={css({
            flex: "0 0 auto",
            alignSelf: "center",
            color: "rgba(255, 255, 255, 0.72)",
            fontSize: "11px",
            whiteSpace: "nowrap",
          })}
        >
          © OSM contributors
        </span>
      ) : null}

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
