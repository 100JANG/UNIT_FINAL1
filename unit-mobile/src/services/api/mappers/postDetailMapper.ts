// Maps backend PostDetailDto -> UI PostDetail.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5 GET /v1/posts/{postId}.
//
// Notes on shape mismatches with the original cycle-3 spec:
// - The cycle-3 brief described `result: { post, comments }`. Actual contract is
//   a FLAT post object with no embedded comments. We follow the contract.
// - The brief's `myActions` field is NOT in the contract response. We expose it
//   as `undefined` here; populating it requires the dedicated like/scrap toggle
//   endpoints (out of scope this cycle).

import type { PostDetail, PostDetailDto } from '../../../types/post';

export function mapPostDetail(dto: PostDetailDto): PostDetail {
  return {
    postId: dto.postId,
    boardId: dto.boardId,
    boardName: null,
    title: dto.title,
    content: dto.content,
    tags: dto.tags ?? [],
    author: { anonymousId: dto.anonymousId },
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    stats: {
      likes: dto.stats?.likes ?? 0,
      comments: dto.stats?.comments ?? 0,
      scraps: dto.stats?.scraps ?? 0,
    },
    myActions: undefined,
  };
}
