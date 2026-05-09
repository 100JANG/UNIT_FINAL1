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

/** Response item of GET /v1/posts/{postId}/comments.
 *  Flat shape — backend does NOT nest under `author` and there is no
 *  `updatedAt` / `isMyComment`. Sort is chronological (createdAt ASC). */
export type CommentDto = {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  anonymousId: string;
  content: string;
  createdAt: string;
  likes: number;
  /** Soft-delete flag. Backend already replaces `content` with the localized
   *  marker ("삭제된 댓글입니다.") server-side; the UI only needs to dim. */
  deleted: boolean;
};

/** UI-shaped comment used by PostDetail's comment list. */
export type CommentItem = {
  id: string;
  postId: string;
  parentCommentId: string | null;
  anonymousId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  deleted: boolean;
  /** Reserved for the future like/delete cycle. Backend GET does not return
   *  ownership info, so this is always undefined for now. */
  isMyComment?: boolean;
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
