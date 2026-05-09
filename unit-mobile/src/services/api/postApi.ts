// Post APIs (detail + toggle actions).
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5

import { apiClient } from './apiClient';
import { mapPostDetail } from './mappers/postDetailMapper';
import type {
  PostDetail,
  PostDetailDto,
  PostLikeResponseDto,
  PostScrapResponseDto,
} from '../../types/post';

export async function getPostDetail(postId: string): Promise<PostDetail> {
  // postId is opaque (e.g. "p_xxxx"). Do NOT parseInt / Number(...) — server treats
  // it as a string identifier.
  const dto = await apiClient.get<PostDetailDto>(`/posts/${encodeURIComponent(postId)}`);
  return mapPostDetail(dto);
}

/** POST /v1/posts/{postId}/like — toggle. Body unused. */
export async function likePost(postId: string): Promise<PostLikeResponseDto> {
  return apiClient.post<PostLikeResponseDto>(
    `/posts/${encodeURIComponent(postId)}/like`,
  );
}

/** POST /v1/posts/{postId}/scrap — toggle. NOT a DELETE flow. Body unused. */
export async function togglePostScrap(postId: string): Promise<PostScrapResponseDto> {
  return apiClient.post<PostScrapResponseDto>(
    `/posts/${encodeURIComponent(postId)}/scrap`,
  );
}
