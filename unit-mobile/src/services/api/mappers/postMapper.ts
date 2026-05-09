// Maps backend PostFeedItemResponse -> a UI-friendly PostSummary.
// Backend shape (docs/backend-contract/01_FRONTEND_API_CONTRACT.md §5):
//   { postId, boardId, title, preview, anonymousId, createdAt, stats: { likes, comments, scraps } }
//
// NOTE on the spec mismatch:
// The integration brief listed `boardName`, `tags`, and `author.anonymousId` as required.
// The current backend contract does NOT include `boardName` or `tags` on the feed item,
// and `anonymousId` is flat (not nested under `author`). The contract is the single source
// of truth, so this mapper exposes:
//   - boardName: null (frontend may resolve via a board-id -> label map locally)
//   - tags: undefined
//   - author.anonymousId: derived from the flat anonymousId
// See docs/integration/01_FEED_API_CONNECTION_REPORT.md for details.

export type PostFeedItemDto = {
  postId: string;
  boardId: string;
  title: string;
  preview: string;
  anonymousId: string;
  createdAt: string;
  stats: { likes: number; comments: number; scraps: number };
};

export type PostSummary = {
  postId: string;
  boardId: string;
  boardName: string | null;
  title: string;
  preview: string;
  author: { anonymousId: string };
  createdAt: string;
  stats: { likes: number; comments: number; scraps: number };
  tags?: string[];
};

export function mapPostSummary(dto: PostFeedItemDto): PostSummary {
  return {
    postId: dto.postId,
    boardId: dto.boardId,
    boardName: null,
    title: dto.title,
    preview: dto.preview,
    author: { anonymousId: dto.anonymousId },
    createdAt: dto.createdAt,
    stats: {
      likes: dto.stats?.likes ?? 0,
      comments: dto.stats?.comments ?? 0,
      scraps: dto.stats?.scraps ?? 0,
    },
  };
}
