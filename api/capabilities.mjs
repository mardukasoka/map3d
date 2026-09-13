import { writeLiveJson } from "./_liveBounds.mjs";

export function liveCapabilitiesFromEnv(env = process.env) {
  return Object.freeze({
    version: 1,
    backend: true,
    providers: Object.freeze({
      firms: Boolean(String(env.NASA_FIRMS_MAP_KEY ?? "").trim()),
      ais: false,
      cctv: false,
    }),
  });
}

export default function handler(request, response) {
  if (request.method && request.method !== "GET") {
    writeLiveJson(response, 405, { error: "method not allowed" });
    return;
  }

  writeLiveJson(response, 200, liveCapabilitiesFromEnv());
}
