import type { GeoBounds } from "./viewport";

export type SameOriginApiTransport = Readonly<{
  id: string;
  path: `/api/${string}`;
  sourceLabel: string;
}>;

export function buildBoundedApiPath(path: `/api/${string}`, bounds: GeoBounds): string {
  const params = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  });
  return `${path}?${params.toString()}`;
}

export function assertSameOriginApiPath(path: string): asserts path is `/api/${string}` {
  if (!path.startsWith("/api/")) {
    throw new Error("Live backend transport must use a same-origin /api/ path");
  }
}
