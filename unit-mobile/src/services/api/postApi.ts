// Post Detail API.
// Endpoint: GET /v1/posts/{postId}
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5

import { apiClient } from './apiClient';
import { mapPostDetail } from './mappers/postDetailMapper';
import type { PostDetail, PostDetailDto } from '../../types/post';

export async function getPostDetail(postId: string): Promise<PostDetail> {
  // postId is opaque (e.g. "p_xxxx"). Do NOT parseInt / Number(...) — server treats
  // it as a string identifier.
  const dto = await apiClient.get<PostDetailDto>(`/posts/${encodeURIComponent(postId)}`);
  return mapPostDetail(dto);
}
