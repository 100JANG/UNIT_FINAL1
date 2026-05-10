// Course APIs (list + detail).
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §7

import { apiClient } from './apiClient';
import type { CursorPage } from './apiTypes';
import { buildCursorQuery } from './pagination';
import { mapCourseDetail, mapCourseSummary } from './mappers/courseMapper';
import type {
  CourseDetailDto,
  CourseDetailUi,
  CourseReviewCreatedResponseDto,
  CourseReviewVote,
  CourseSummary,
  CourseSummaryDto,
  CreateCourseReviewRequest,
} from '../../types/course';

export type GetCoursesParams = {
  /** Search term (contains-match on courseName/professor, in-memory). */
  q?: string;
  /** Required by backend; without it the response is an empty page.
   *  Currently sourced from a hardcoded value — should come from /v1/users/me
   *  once Profile cycle is wired. */
  schoolId?: string;
  /** Exact match (e.g. "2026-1"). */
  semester?: string;
  cursor?: string | null;
  limit?: number;
};

export type CoursesPage = {
  items: CourseSummary[];
  cursor: string | null;
  hasMore: boolean;
};

/**
 * GET /v1/courses?q=&schoolId=&semester=&cursor=&limit=
 *
 * NOTE: `size` is not accepted by the backend — only `limit`.
 */
export async function getCourses(params: GetCoursesParams = {}): Promise<CoursesPage> {
  const { q, schoolId, semester } = params;
  const { cursor, limit } = buildCursorQuery(params);

  const dto = await apiClient.get<CursorPage<CourseSummaryDto>>('/courses', {
    query: { q, schoolId, semester, cursor, limit },
  });

  return {
    items: (dto.items ?? []).map(mapCourseSummary),
    cursor: dto.pagination?.cursor ?? null,
    hasMore: dto.pagination?.hasMore ?? false,
  };
}

/**
 * GET /v1/courses/{courseId}
 *
 * Errors: NOT_FOUND, REVIEW_QUOTA_REQUIRED (422 — viewer must write a review
 * first; the screen should route to CourseReview rather than show a toast).
 */
export async function getCourseDetail(courseId: string): Promise<CourseDetailUi> {
  const dto = await apiClient.get<CourseDetailDto>(
    `/courses/${encodeURIComponent(courseId)}`,
  );
  return mapCourseDetail(dto);
}

export type CreateCourseReviewParams = {
  courseId: string;
  vote: CourseReviewVote;
  /** Optional ≤ 200 chars. */
  comment?: string;
};

/**
 * POST /v1/courses/{courseId}/reviews
 *
 * Errors:
 * - VALIDATION_FAILED — vote required, comment > 200 chars
 * - NOT_FOUND — course doesn't exist
 * - BUSINESS_RULE_VIOLATION — viewer has already submitted a review for this course
 */
export async function createCourseReview(
  params: CreateCourseReviewParams,
): Promise<CourseReviewCreatedResponseDto> {
  const body: CreateCourseReviewRequest = { vote: params.vote };
  if (params.comment !== undefined) body.comment = params.comment;
  return apiClient.post<CourseReviewCreatedResponseDto>(
    `/courses/${encodeURIComponent(params.courseId)}/reviews`,
    body,
  );
}
