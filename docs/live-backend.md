# Map3D live backend boundary

Map3D remains a static/browser-first client. Live sources that require credentials or long-lived upstream connections must sit behind same-origin `/api/*` endpoints.

## Security rules

- Never embed upstream API keys, tokens, or WebSocket credentials in browser JavaScript.
- Browser code may call only same-origin `/api/*` live endpoints through `src/live/backend.ts`.
- The backend owns upstream credentials and source-specific connection logic.
- The browser sends only the current viewport and receives only data relevant to that viewport.
- Responses must be bounded and normalized before they reach the client.
- Runtime refresh/cache policy remains controlled by the live-layer registry.

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

The current `aisProxyShipsAdapter` is intentionally **not registered** until a compatible backend endpoint is deployed. This keeps the static build truthful: the Ships control must not appear runnable when `/api/ais-live` does not exist.

## Future keyed sources

The same boundary can host optional provider-specific endpoints such as:

- `/api/firms` for NASA FIRMS hotspot queries using a server-held MAP_KEY.
- `/api/cctv/*` for camera source metadata, health, still frames, or explicitly selected media.
- other paid/BYO data providers where credentials must remain server-side.

Provider responses should be normalized server-side whenever doing so reduces browser work or avoids shipping provider-specific credentials/protocols to the client.
