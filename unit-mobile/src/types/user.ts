// User-related DTOs and UI shapes.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §4.

// ---- Wire DTOs --------------------------------------------------------------

export type EnrollmentStatus = 'RESERVED' | 'VERIFIED';

export type MyProfileDto = {
  userId: string;
  name: string;
  schoolId: string | null;
  schoolName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  /** Front 4 chars only with `*` mask, or null if not registered. */
  studentNumberMasked: string | null;
  enrollmentStatus: EnrollmentStatus;
  sessionExpiresAt: string;
};

export type MyStatsDto = {
  posts: number;
  comments: number;
  likesReceived: number;
  scraps: number;
  juryVotes: number;
};

export type UserPostActivityDto = {
  postId: string;
  boardId: string;
  title: string;
  preview: string;
  createdAt: string;
  likes: number;
  comments: number;
};

export type UserCommentActivityDto = {
  commentId: string;
  postId: string;
  content: string;
  parentCommentId: string | null;
  deleted: boolean;
  createdAt: string;
};

export type UserLikeActivityDto = {
  postId: string;
  boardId: string;
  title: string;
  preview: string;
  likedAt: string;
};

export type UserScrapActivityDto = {
  postId: string;
  boardId: string;
  boardName: string | null;
  title: string;
  preview: string;
  createdAt: string;
  scrappedAt: string;
  stats: { likes: number; comments: number; scraps: number };
};

// ---- UI shapes --------------------------------------------------------------

export type MyProfile = {
  userId: string;
  name: string;
  schoolId: string | null;
  schoolLabel: string | null;     // resolved school name
  departmentId: string | null;
  departmentLabel: string | null; // resolved department name
  studentNumberMasked: string | null;
  /** True when student verification is RESERVED (current always-true state). */
  isStudentVerificationReserved: boolean;
  sessionExpiresAt: string;
};

export type MyStats = {
  posts: number;
  comments: number;
  likesReceived: number;
  scraps: number;
  juryVotes: number;
};

export type UserPostActivity = {
  postId: string;
  boardId: string;
  title: string;
  preview: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type UserCommentActivity = {
  commentId: string;
  postId: string;
  content: string;
  parentCommentId: string | null;
  deleted: boolean;
  createdAt: string;
};

export type UserLikeActivity = {
  postId: string;
  boardId: string;
  title: string;
  preview: string;
  likedAt: string;
};

export type UserScrapActivity = {
  postId: string;
  boardId: string;
  boardName: string | null;
  title: string;
  preview: string;
  createdAt: string;
  scrappedAt: string;
  stats: { likes: number; comments: number; scraps: number };
};
