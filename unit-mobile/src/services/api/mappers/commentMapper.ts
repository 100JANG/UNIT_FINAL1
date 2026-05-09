// Maps backend CommentDto -> UI CommentItem.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §6.

import type { CommentDto, CommentItem } from '../../../types/post';

export function mapCommentItem(dto: CommentDto): CommentItem {
  return {
    id: dto.commentId,
    postId: dto.postId,
    parentCommentId: dto.parentCommentId ?? null,
    anonymousId: dto.anonymousId,
    content: dto.content,
    createdAt: dto.createdAt,
    likeCount: dto.likes ?? 0,
    deleted: dto.deleted === true,
    isMyComment: undefined,
  };
}
