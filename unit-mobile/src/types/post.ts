// Post-related DTOs and UI-shaped types.
// DTO names and shapes mirror the backend contract:
//   docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5.

// ---- Wire DTOs (must match the backend contract verbatim) -------------------

export type PostStatus = 'PUBLISHED' | 'DELETED_BY_AUTHOR' | 'REMOVED_BY_ADMIN';

/** Response of GET /v1/posts/{postId} — flat post object, NO embedded comments. */
export type PostDetailDto = {
  postId: string;
  boardId: string;
  title: string;
  content: string;
  tags: string[];
  anonymousId: string;
  visibility: 'PUBLIC';
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  stats: { likes: number; comments: number; scraps: number };
};

/** Response item of GET /v1/posts/{postId}/comments. Not wired this cycle —
 *  type-only, kept here so future consumers don't redeclare it. */
export type CommentDto = {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  anonymousId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  deleted?: boolean;
};

// ---- UI shape (what screens render) -----------------------------------------

export type PostDetail = {
  postId: string;
  boardId: string;
  /** Resolved board label (Korean). null when no local lookup is available. */
  boardName: string | null;
  title: string;
  content: string;
  tags: string[];
  author: { anonymousId: string };
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  stats: { likes: number; comments: number; scraps: number };
  /** Whether the current viewer has liked / scrapped / reported this post.
   *  Backend GET /v1/posts/{postId} does NOT include this; populated only after
   *  the viewer toggles like/scrap via the dedicated endpoints (future cycle). */
  myActions?: { liked?: boolean; scrapped?: boolean; reported?: boolean };
};
