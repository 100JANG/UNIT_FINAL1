package kr.unit.backend.users.service;

import kr.unit.backend.comments.domain.Comment;
import kr.unit.backend.comments.repository.CommentFirebaseRepository;
import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.api.PaginationLimits;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.posts.domain.Post;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.users.domain.UserStats;
import kr.unit.backend.users.dto.UserCommentActivityResponse;
import kr.unit.backend.users.dto.UserLikeActivityResponse;
import kr.unit.backend.users.dto.UserPostActivityResponse;
import kr.unit.backend.users.dto.UserScrapActivityResponse;
import kr.unit.backend.users.dto.UserStatsResponse;
import kr.unit.backend.users.repository.UserActivityRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 내 활동(통계/글/댓글/추천) 조회 서비스.
 *
 * 정책 요약:
 *  - 모든 list 조회는 timestamp DESC(newest first) 정렬, {@link CursorCodec} + {@link PaginationLimits} 공유
 *  - posts/likes 목록에서 삭제된 글(REMOVED_BY_ADMIN, DELETED_BY_AUTHOR)은 제외 (MVP 정책)
 *  - comments 목록은 삭제된 댓글도 포함하되 content가 "삭제된 댓글입니다."로 마스킹된다 (Comment 도메인 기존 정책)
 *  - 통계는 /user_stats/{userId}가 있으면 그대로 노출, 없으면 가능한 부분만 인덱스 카운트로 fallback
 *    (likesReceived/scraps/juryVotes는 fallback 시 0). AI/Recap 기반 보강 없음.
 */
@Service
public class UserActivityService {

    private final UserActivityRepository userActivityRepository;
    private final PostFirebaseRepository postFirebaseRepository;
    private final CommentFirebaseRepository commentFirebaseRepository;

    public UserActivityService(UserActivityRepository userActivityRepository,
                               PostFirebaseRepository postFirebaseRepository,
                               CommentFirebaseRepository commentFirebaseRepository) {
        this.userActivityRepository = userActivityRepository;
        this.postFirebaseRepository = postFirebaseRepository;
        this.commentFirebaseRepository = commentFirebaseRepository;
    }

    public UserStatsResponse getMyStats(String userId) {
        Optional<UserStats> stored = userActivityRepository.findStats(userId);
        if (stored.isPresent()) {
            return UserStatsResponse.from(stored.get());
        }
        // Fallback: posts/comments는 인덱스 자식 수로 계산, 그 외는 0.
        long posts = userActivityRepository.countUserPosts(userId);
        long comments = userActivityRepository.countUserComments(userId);
        return new UserStatsResponse(posts, comments, 0L, 0L, 0L);
    }

    public CursorPageResponse<UserPostActivityResponse> getMyPosts(String userId, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);

        // RTDB의 orderByChild("createdAt") DESC 인덱스 쿼리. 운영에서는 .indexOn: ["createdAt"] 필요.
        List<UserActivityRepository.PostIndexEntry> queried;
        try {
            queried = userActivityRepository.queryUserPostsDesc(userId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<UserActivityRepository.PostIndexEntry> page = hasMore ? queried.subList(0, limit) : queried;

        List<UserPostActivityResponse> items = new ArrayList<>(page.size());
        for (UserActivityRepository.PostIndexEntry entry : page) {
            Optional<Post> postOpt = postFirebaseRepository.findById(entry.postId());
            if (postOpt.isEmpty()) {
                continue;
            }
            Post post = postOpt.get();
            if (post.status() != Post.Status.PUBLISHED) {
                continue;
            }
            Map<String, Long> stats = postFirebaseRepository.findStats(post.postId());
            items.add(new UserPostActivityResponse(
                    post.postId(),
                    post.boardId(),
                    post.title(),
                    buildPreview(post.content()),
                    post.createdAt(),
                    stats.getOrDefault("likes", 0L),
                    stats.getOrDefault("comments", 0L)));
        }

        // cursor advance: query window 마지막(가시 항목 아님) 기준으로 만든다 — deleted 항목 건너뛰어도 다음 페이지가 정확히 이어지도록.
        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            UserActivityRepository.PostIndexEntry last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.createdAt(), last.postId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    public CursorPageResponse<UserCommentActivityResponse> getMyComments(String userId, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);

        List<UserActivityRepository.CommentIndexEntry> queried;
        try {
            queried = userActivityRepository.queryUserCommentsDesc(userId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<UserActivityRepository.CommentIndexEntry> page = hasMore ? queried.subList(0, limit) : queried;

        List<UserCommentActivityResponse> items = new ArrayList<>(page.size());
        for (UserActivityRepository.CommentIndexEntry entry : page) {
            if (entry.postId() == null) {
                continue;
            }
            Optional<Comment> commentOpt = commentFirebaseRepository.findById(entry.postId(), entry.commentId());
            if (commentOpt.isEmpty()) {
                continue;
            }
            Comment c = commentOpt.get();
            // 삭제된 댓글은 마스킹된 채로 포함 (Comment 도메인 정책 — list에서 제외하지 않음).
            String content = c.deleted() ? "삭제된 댓글입니다." : c.content();
            items.add(new UserCommentActivityResponse(
                    c.commentId(),
                    c.postId(),
                    content,
                    c.parentCommentId(),
                    c.deleted(),
                    c.createdAt()));
        }

        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            UserActivityRepository.CommentIndexEntry last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.createdAt(), last.commentId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    public CursorPageResponse<UserLikeActivityResponse> getMyLikes(String userId, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);

        List<UserActivityRepository.LikeIndexEntry> queried;
        try {
            queried = userActivityRepository.queryUserLikesDesc(userId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<UserActivityRepository.LikeIndexEntry> page = hasMore ? queried.subList(0, limit) : queried;

        List<UserLikeActivityResponse> items = new ArrayList<>(page.size());
        for (UserActivityRepository.LikeIndexEntry entry : page) {
            Optional<Post> postOpt = postFirebaseRepository.findById(entry.postId());
            if (postOpt.isEmpty()) {
                continue;
            }
            Post post = postOpt.get();
            if (post.status() != Post.Status.PUBLISHED) {
                continue;
            }
            items.add(new UserLikeActivityResponse(
                    post.postId(),
                    post.boardId(),
                    post.title(),
                    buildPreview(post.content()),
                    entry.likedAt()));
        }

        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            UserActivityRepository.LikeIndexEntry last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.likedAt(), last.postId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    public CursorPageResponse<UserScrapActivityResponse> getMyScraps(String userId, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);

        // RTDB의 orderByChild("scrappedAt") DESC 인덱스 쿼리 (limit+1로 hasMore 판정).
        // 운영에서는 /user_scraps/{userId} 노드에 .indexOn: ["scrappedAt"] 필요.
        List<UserActivityRepository.ScrapIndexEntry> queried;
        try {
            queried = userActivityRepository.queryUserScrapsDesc(userId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<UserActivityRepository.ScrapIndexEntry> page = hasMore ? queried.subList(0, limit) : queried;

        List<UserScrapActivityResponse> items = new ArrayList<>(page.size());
        for (UserActivityRepository.ScrapIndexEntry entry : page) {
            Optional<Post> postOpt = postFirebaseRepository.findById(entry.postId());
            if (postOpt.isEmpty()) {
                continue;
            }
            Post post = postOpt.get();
            if (post.status() != Post.Status.PUBLISHED) {
                continue;
            }
            Map<String, Long> stats = postFirebaseRepository.findStats(post.postId());
            String boardName = userActivityRepository.findBoardName(post.boardId()).orElse(null);
            items.add(new UserScrapActivityResponse(
                    post.postId(),
                    post.boardId(),
                    boardName,
                    post.title(),
                    buildPreview(post.content()),
                    post.createdAt(),
                    entry.scrappedAt(),
                    new UserScrapActivityResponse.PostStatsView(
                            stats.getOrDefault("likes", 0L),
                            stats.getOrDefault("comments", 0L),
                            stats.getOrDefault("scraps", 0L))));
        }

        // cursor는 페이지의 마지막 인덱스 entry 기준으로 만든다 (가시 항목이 아니라 query window 마지막).
        // 그래야 deleted post로 필터된 항목을 건너뛰고 다음 페이지가 정확히 이어진다.
        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            UserActivityRepository.ScrapIndexEntry last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.scrappedAt(), last.postId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    private static String buildPreview(String content) {
        if (content == null) {
            return "";
        }
        String trimmed = content.replaceAll("\\s+", " ").trim();
        return trimmed.length() <= 60 ? trimmed : trimmed.substring(0, 60);
    }
}
