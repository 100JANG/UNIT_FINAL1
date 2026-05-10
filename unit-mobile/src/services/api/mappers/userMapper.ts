// User DTO -> UI mappers.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §4.

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
} from '../../../types/user';

export function mapMyProfile(dto: MyProfileDto): MyProfile {
  return {
    userId: dto.userId,
    name: dto.name,
    schoolId: dto.schoolId ?? null,
    schoolLabel: dto.schoolName ?? null,
    departmentId: dto.departmentId ?? null,
    departmentLabel: dto.departmentName ?? null,
    studentNumberMasked: dto.studentNumberMasked ?? null,
    // Cycle 6 brief explicitly forbids representing RESERVED as completed
    // verification. We expose this as a positive boolean so screens never
    // accidentally render a verified-checkmark for a RESERVED user.
    isStudentVerificationReserved: dto.enrollmentStatus === 'RESERVED',
    sessionExpiresAt: dto.sessionExpiresAt,
  };
}

export function mapMyStats(dto: MyStatsDto): MyStats {
  return {
    posts: dto.posts ?? 0,
    comments: dto.comments ?? 0,
    likesReceived: dto.likesReceived ?? 0,
    scraps: dto.scraps ?? 0,
    juryVotes: dto.juryVotes ?? 0,
  };
}

export function mapUserPostActivity(dto: UserPostActivityDto): UserPostActivity {
  return {
    postId: dto.postId,
    boardId: dto.boardId,
    title: dto.title,
    preview: dto.preview,
    createdAt: dto.createdAt,
    likeCount: dto.likes ?? 0,
    commentCount: dto.comments ?? 0,
  };
}

export function mapUserCommentActivity(
  dto: UserCommentActivityDto,
): UserCommentActivity {
  return {
    commentId: dto.commentId,
    postId: dto.postId,
    content: dto.content,
    parentCommentId: dto.parentCommentId ?? null,
    deleted: dto.deleted === true,
    createdAt: dto.createdAt,
  };
}

export function mapUserLikeActivity(dto: UserLikeActivityDto): UserLikeActivity {
  return {
    postId: dto.postId,
    boardId: dto.boardId,
    title: dto.title,
    preview: dto.preview,
    likedAt: dto.likedAt,
  };
}

export function mapUserScrapActivity(dto: UserScrapActivityDto): UserScrapActivity {
  return {
    postId: dto.postId,
    boardId: dto.boardId,
    boardName: dto.boardName ?? null,
    title: dto.title,
    preview: dto.preview,
    createdAt: dto.createdAt,
    scrappedAt: dto.scrappedAt,
    stats: {
      likes: dto.stats?.likes ?? 0,
      comments: dto.stats?.comments ?? 0,
      scraps: dto.stats?.scraps ?? 0,
    },
  };
}
