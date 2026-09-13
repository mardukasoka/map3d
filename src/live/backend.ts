import { assertSameOriginApiPath } from "./apiTransport";

export async function fetchLiveApiJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  assertSameOriginApiPath(path);

  const response = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Live backend request failed (${response.status})`);
  }

  return await response.json() as T;
}
