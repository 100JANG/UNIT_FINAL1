// Course-related DTOs and UI-shaped types.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §7.

// ---- Wire DTOs (must match the backend contract verbatim) -------------------

/** Item in GET /v1/courses cursor page. */
export type CourseSummaryDto = {
  courseId: string;
  schoolId: string;
  courseName: string;
  professor: string;
  semester: string;
};

/** Result body of GET /v1/courses/{courseId}. */
export type CourseDetailDto = {
  courseId: string;
  courseName: string;
  professor: string;
  semester: string;
  recommend: number;
  notRecommend: number;
  skip: number;
  total: number;
  /** recommend / (recommend + notRecommend). SKIP is excluded from the
   *  denominator but included in `total`. Backend returns 0..1. */
  recommendRate: number;
};

/** Request body for POST /v1/courses/{courseId}/reviews. */
export type CourseReviewVote = 'RECOMMEND' | 'NOT_RECOMMEND' | 'SKIP';

export type CreateCourseReviewRequest = {
  vote: CourseReviewVote;
  /** Optional, ≤ 200 chars (backend validation). */
  comment?: string;
};

/** Response of POST /v1/courses/{courseId}/reviews. */
export type CourseReviewCreatedResponseDto = {
  reviewId: string;
  courseId: string;
  stats: {
    recommend: number;
    notRecommend: number;
    skip: number;
    total: number;
    /** 0..1 — multiply by 100 for percent display. */
    recommendRate: number;
  };
};

// ---- UI shapes --------------------------------------------------------------

export type CourseSummary = {
  courseId: string;
  schoolId: string;
  name: string;       // = courseName
  professor: string;
  semester: string;
};

export type CourseDetailUi = {
  courseId: string;
  name: string;
  professor: string;
  semester: string;
  stats: {
    recommend: number;
    notRecommend: number;
    skip: number;
    total: number;
    /** Percentage 0..100 (rounded). Source: backend `recommendRate` * 100. */
    recommendPct: number;
  };
};
