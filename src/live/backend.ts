import { assertSameOriginApiPath } from "./apiTransport";

export class LiveBackendError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Live backend request failed (${status})`);
    this.name = "LiveBackendError";
    this.status = status;
  }
}

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
    throw new LiveBackendError(response.status);
  }

  return await response.json() as T;
}
