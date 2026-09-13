# Map3D live backend boundary

Map3D remains a static/browser-first client. Live sources that require credentials or long-lived upstream connections must sit behind same-origin `/api/*` endpoints.

## Security rules

- Never embed upstream API keys, tokens, or WebSocket credentials in browser JavaScript.
- Browser code may call only same-origin `/api/*` live endpoints through `src/live/backend.ts`.
- The backend owns upstream credentials and source-specific connection logic.
- The browser sends only the current viewport and receives only data relevant to that viewport.
- Responses must be bounded and normalized before they reach the client.
- Runtime refresh/cache policy remains controlled by the live-layer registry.

## Deployment modes

### Static-only hosting

GitHub Pages and other static hosts do not provide Map3D's `/api/*` handlers. The browser attempts `/api/capabilities` once per page session, treats a missing or invalid response as `backend: false`, and continues with public browser-safe adapters. For the fire layer this means NASA EONET remains available without any backend configuration.

### Backend-enabled hosting

A host that exposes the files in `api/` as same-origin HTTP handlers can advertise configured providers through `GET /api/capabilities`. The client caches that response for the page session and uses protected providers only when the capability is explicitly true.

Current capability response shape:

```json
{
  "version": 1,
  "backend": true,
  "providers": {
    "firms": true,
    "ais": false,
    "cctv": false
  }
}
```

Capabilities reveal only availability booleans. Secret values are never serialized into the response.

## Shared bounds validation

`api/_liveBounds.mjs` is the common server-side guard for viewport-backed endpoints. It requires ordered finite `west/south/east/north` coordinates, rejects out-of-range coordinates, and caps a single request to a 30° longitude × 20° latitude span.

Run `npm run check:api` to verify the bounds, capability, and provider contracts independently of the browser build. Dateline-crossing viewports are split by the browser adapter into two ordinary non-crossing requests before they reach the server boundary.

## NASA FIRMS contract

`GET /api/firms?west=<lon>&south=<lat>&east=<lon>&north=<lat>`

The backend handler in `api/firms.mjs` requires a server-side `NASA_FIRMS_MAP_KEY`. No key is ever sent to or stored in browser JavaScript.

Optional environment variable:

- `NASA_FIRMS_SOURCE` — defaults to `VIIRS_NOAA21_NRT`.

The handler requests the most recent one-day FIRMS Area API CSV for the bounded viewport, normalizes it, and returns at most 500 hotspots. The default is NOAA-21 NRT rather than Suomi NPP so new work does not depend on the NPP product that NASA has announced will cease on November 1, 2026.

Example response:

```json
{
  "source": "NASA FIRMS VIIRS_NOAA21_NRT",
  "fetchedAt": 1789250000000,
  "bounds": {
    "west": 138,
    "south": -35.5,
    "east": 139.5,
    "north": -34
  },
  "hotspots": [
    {
      "lat": -34.9,
      "lon": 138.6,
      "timestamp": 1789250000000,
      "confidence": "n",
      "frp": 12.7,
      "brightTi4": 332.4,
      "satellite": "N21",
      "instrument": "VIIRS",
      "daynight": "D"
    }
  ]
}
```

The registered fire adapter is backend-aware: it uses FIRMS when `/api/capabilities` reports `providers.firms: true`; otherwise it goes directly to the public NASA EONET wildfire-event adapter. If a configured FIRMS backend later fails, the adapter temporarily backs off and uses EONET rather than breaking the layer.

## AIS contract

`GET /api/ais-live?west=<lon>&south=<lat>&east=<lon>&north=<lat>`

The server should reject invalid or unreasonably large bounds and return at most the configured vessel limit.

Example response:

```json
{
  "source": "AISStream",
  "fetchedAt": 1789250000000,
  "vessels": [
    {
      "mmsi": "503000000",
      "lon": 138.6,
      "lat": -34.9,
      "timestamp": 1789250000000,
      "headingDeg": 271.2,
      "speedMps": 6.4,
      "name": "Example Vessel",
      "shipType": "cargo"
    }
  ]
}
```

The current `aisProxyShipsAdapter` remains intentionally unregistered until a compatible backend endpoint is deployed. The capability manifest therefore reports `ais: false`. This keeps the static build truthful: the Ships control must not appear runnable when `/api/ais-live` does not exist.

The direct upstream AIS connection remains provider-side work; the browser contract and server request validation are deliberately independent of that implementation so a host-specific or persistent broker can be substituted without changing Map3D's client layer.

## Future keyed sources

The same boundary can host optional provider-specific endpoints such as:

- `/api/cctv/*` for camera source metadata, health, still frames, or explicitly selected media.
- other paid/BYO data providers where credentials must remain server-side.

Provider responses should be normalized server-side whenever doing so reduces browser work or avoids shipping provider-specific credentials/protocols to the client.
