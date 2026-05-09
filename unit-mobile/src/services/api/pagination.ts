// Cursor-pagination helpers.
// Backend contract (docs/backend-contract/06_PAGINATION_CONTRACT.md):
//   - Param names: `cursor`, `limit` (NEVER `size`/`page`/`offset`)
//   - Default limit: 20, max: 50
//   - `cursor` is opaque base64 — frontend MUST NOT parse it.

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

export function clampLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

export type CursorPaginationParams = {
  cursor?: string | null;
  limit?: number;
};

export function buildCursorQuery(p: CursorPaginationParams): {
  cursor?: string;
  limit: number;
} {
  const out: { cursor?: string; limit: number } = { limit: clampLimit(p.limit) };
  if (p.cursor) out.cursor = p.cursor;
  return out;
}
