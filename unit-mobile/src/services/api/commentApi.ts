// Comments API.
// This cycle wires only the GET (list) endpoint. POST / like / DELETE are out
// of scope (cycle 5+). Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §6.

import { apiClient } from './apiClient';
import { buildCursorQuery } from './pagination';
import { mapCommentItem } from './mappers/commentMapper';
import type { CursorPage } from './apiTypes';
import type { CommentDto, CommentItem } from '../../types/post';

export type GetPostCommentsParams = {
  postId: string;
  cursor?: string | null;
  limit?: number;
};

export type CommentsPage = {
  items: CommentItem[];
  cursor: string | null;
  hasMore: boolean;
};

/**
 * GET /v1/posts/{postId}/comments?cursor=&limit=
 *
 * postId is opaque (e.g. "p_xxxx"). Do NOT parseInt / Number(...).
 * Pagination uses cursor + limit only — `size` is rejected by the backend.
 */
export async function getPostComments(params: GetPostCommentsParams): Promise<CommentsPage> {
  const { cursor, limit } = buildCursorQuery(params);

  const dto = await apiClient.get<CursorPage<CommentDto>>(
    `/posts/${encodeURIComponent(params.postId)}/comments`,
    {
      query: { cursor, limit },
    },
  );

  return {
    items: (dto.items ?? []).map(mapCommentItem),
    cursor: dto.pagination?.cursor ?? null,
    hasMore: dto.pagination?.hasMore ?? false,
  };
}
