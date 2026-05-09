// Feed API. Single endpoint connected in this cycle:
//   GET /v1/posts?scope=...&sort=latest&cursor=...&limit=...
//
// Backend contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5

import { apiClient } from './apiClient';
import type { CursorPage } from './apiTypes';
import { buildCursorQuery } from './pagination';
import { mapPostSummary, type PostFeedItemDto, type PostSummary } from './mappers/postMapper';

export type FeedScope = 'all' | 'school' | 'department';
export type FeedSort = 'latest' | 'hot' | 'comments';

export type GetPostsParams = {
  scope?: FeedScope;
  sort?: FeedSort;
  cursor?: string | null;
  limit?: number;
  boardId?: string;
};

export type FeedPage = {
  items: PostSummary[];
  cursor: string | null;
  hasMore: boolean;
};

export async function getPosts(params: GetPostsParams = {}): Promise<FeedPage> {
  const { scope = 'all', sort = 'latest', boardId } = params;
  const { cursor, limit } = buildCursorQuery(params);

  const dto = await apiClient.get<CursorPage<PostFeedItemDto>>('/posts', {
    query: {
      scope,
      sort,
      cursor,
      limit,
      boardId,
    },
  });

  return {
    items: (dto.items ?? []).map(mapPostSummary),
    cursor: dto.pagination?.cursor ?? null,
    hasMore: dto.pagination?.hasMore ?? false,
  };
}
