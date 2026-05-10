// User APIs (profile + stats + 4 activity lists).
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §4

import { apiClient } from './apiClient';
import type { CursorPage } from './apiTypes';
import { buildCursorQuery } from './pagination';
import {
  mapMyProfile,
  mapMyStats,
  mapUserCommentActivity,
  mapUserLikeActivity,
  mapUserPostActivity,
  mapUserScrapActivity,
} from './mappers/userMapper';
import type {
  MyProfile,
  MyProfileDto,
  MyStats,
  MyStatsDto,
  UserCommentActivity,
  UserCommentActivityDto,
  UserLikeActivity,
  UserLikeActivityDto,
  UserPostActivity,
  UserPostActivityDto,
  UserScrapActivity,
  UserScrapActivityDto,
} from '../../types/user';

export async function getMyProfile(): Promise<MyProfile> {
  const dto = await apiClient.get<MyProfileDto>('/users/me');
  return mapMyProfile(dto);
}

export async function getMyStats(): Promise<MyStats> {
  const dto = await apiClient.get<MyStatsDto>('/users/me/stats');
  return mapMyStats(dto);
}

export type ListMyActivityParams = {
  cursor?: string | null;
  limit?: number;
};

export type ActivityPage<T> = {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
};

async function fetchActivity<DtoT, UiT>(
  path: string,
  params: ListMyActivityParams,
  mapper: (dto: DtoT) => UiT,
): Promise<ActivityPage<UiT>> {
  const { cursor, limit } = buildCursorQuery(params);
  const dto = await apiClient.get<CursorPage<DtoT>>(path, {
    query: { cursor, limit },
  });
  return {
    items: (dto.items ?? []).map(mapper),
    cursor: dto.pagination?.cursor ?? null,
    hasMore: dto.pagination?.hasMore ?? false,
  };
}

export function listMyPosts(
  params: ListMyActivityParams = {},
): Promise<ActivityPage<UserPostActivity>> {
  return fetchActivity<UserPostActivityDto, UserPostActivity>(
    '/users/me/posts',
    params,
    mapUserPostActivity,
  );
}

export function listMyComments(
  params: ListMyActivityParams = {},
): Promise<ActivityPage<UserCommentActivity>> {
  return fetchActivity<UserCommentActivityDto, UserCommentActivity>(
    '/users/me/comments',
    params,
    mapUserCommentActivity,
  );
}

export function listMyLikes(
  params: ListMyActivityParams = {},
): Promise<ActivityPage<UserLikeActivity>> {
  return fetchActivity<UserLikeActivityDto, UserLikeActivity>(
    '/users/me/likes',
    params,
    mapUserLikeActivity,
  );
}

export function listMyScraps(
  params: ListMyActivityParams = {},
): Promise<ActivityPage<UserScrapActivity>> {
  return fetchActivity<UserScrapActivityDto, UserScrapActivity>(
    '/users/me/scraps',
    params,
    mapUserScrapActivity,
  );
}
