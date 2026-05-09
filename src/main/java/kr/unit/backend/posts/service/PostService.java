package kr.unit.backend.posts.service;

import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.api.PaginationLimits;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.posts.domain.Post;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.dto.PostDetailResponse;
import kr.unit.backend.posts.dto.PostFeedItemResponse;
import kr.unit.backend.posts.dto.PostLikeResponse;
import kr.unit.backend.posts.policy.PostWritePolicy;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PostService {

    private final PostWritePolicy postWritePolicy;
    private final PostFirebaseRepository postFirebaseRepository;
    private final UserAccountRepository userAccountRepository;
    private final PostIdGenerator postIdGenerator;
    private final ClockProvider clockProvider;

    public PostService(PostWritePolicy postWritePolicy,
                       PostFirebaseRepository postFirebaseRepository,
                       UserAccountRepository userAccountRepository,
                       PostIdGenerator postIdGenerator,
                       ClockProvider clockProvider) {
        this.postWritePolicy = postWritePolicy;
        this.postFirebaseRepository = postFirebaseRepository;
        this.userAccountRepository = userAccountRepository;
        this.postIdGenerator = postIdGenerator;
        this.clockProvider = clockProvider;
    }

    public PostCreatedResponse createPost(AuthenticatedUser author, CreatePostRequest request) {
        postWritePolicy.validate(request);

        boolean anonymous = request.isAnonymous() == null || request.isAnonymous();
        Instant now = clockProvider.now();
        String postId = postIdGenerator.generatePostId();

        // 작성자의 학교/학과 정보를 RTDB에서 조회하여 post 본체와 feed snapshot에 반영한다.
        // 이 정보가 있어야 /post_feeds/schools/{schoolId}, /post_feeds/departments/{departmentId} 인덱스가
        // 자동으로 함께 기록되어 scope=school/department 피드가 동작한다.
        // 사용자 계정이 없거나 schoolId/departmentId가 미등록이면 해당 인덱스는 단순히 누락된다(post 자체는 정상 생성).
        Optional<UserAccount> accountOpt = userAccountRepository.findAccount(author.userId());
        String schoolId = accountOpt.map(UserAccount::schoolId).orElse(null);
        String departmentId = accountOpt.map(UserAccount::departmentId).orElse(null);

        Post post = new Post(
                postId,
                request.boardId(),
                schoolId,
                departmentId,
                author.userId(),
                anonymous ? postIdGenerator.generateAnonymousId() : null,
                request.title().trim(),
                request.content().trim(),
                request.tags() == null ? List.of() : List.copyOf(request.tags()),
                Post.Visibility.PUBLIC,
                Post.Status.PUBLISHED,
                now,
                now);

        postFirebaseRepository.save(post);

        return new PostCreatedResponse(post.postId(), post.boardId(), post.createdAt(), "/post/" + post.postId());
    }

    public PostDetailResponse getDetail(String postId) {
        Post post = postFirebaseRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (post.status() == Post.Status.DELETED_BY_AUTHOR || post.status() == Post.Status.REMOVED_BY_ADMIN) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        Map<String, Long> stats = postFirebaseRepository.findStats(postId);
        return new PostDetailResponse(
                post.postId(),
                post.boardId(),
                post.title(),
                post.content(),
                post.tags(),
                post.anonymousId(),
                post.visibility().name(),
                post.status().name(),
                post.createdAt(),
                post.updatedAt(),
                new PostDetailResponse.PostStatsView(
                        stats.getOrDefault("likes", 0L),
                        stats.getOrDefault("comments", 0L),
                        stats.getOrDefault("scraps", 0L)));
    }

    public PostLikeResponse toggleLike(String postId, AuthenticatedUser user) {
        if (postFirebaseRepository.findById(postId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        boolean wasLiked = postFirebaseRepository.isLiked(postId, user.userId());
        postFirebaseRepository.setLike(postId, user.userId(), !wasLiked, clockProvider.now());
        long updated = postFirebaseRepository.incrementLikes(postId, wasLiked ? -1L : 1L);
        return new PostLikeResponse(postId, !wasLiked, Math.max(0L, updated));
    }

    /**
     * 피드 조회 (newest-first).
     *
     * <p>구현 정책:
     * <ul>
     *   <li>{@code scope}: {@code all}/{@code school}/{@code department}. school/department는 사용자 RTDB 계정의
     *       schoolId/departmentId로 인덱스 path를 결정한다. 사용자 계정에 해당 값이 없으면
     *       {@link ErrorCode#BUSINESS_RULE_VIOLATION}으로 응답한다.</li>
     *   <li>{@code sort}는 {@code latest}만 인덱스 쿼리로 구현. {@code hot}/{@code comments}는 별도 인덱스/스코어가 필요하므로
     *       빈 페이지로 응답.</li>
     *   <li>{@code boardId} 필터는 in-memory 후처리(인덱스가 boardId로 split되어 있지 않으므로).</li>
     *   <li>삭제된 글({@link Post.Status#PUBLISHED} 외)은 제외.</li>
     * </ul>
     */
    public CursorPageResponse<PostFeedItemResponse> feed(
            AuthenticatedUser viewer,
            String scope,
            String boardId,
            String sort,
            String cursor,
            int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);
        String effectiveScope = scope == null || scope.isBlank() ? "all" : scope.toLowerCase();
        String effectiveSort = sort == null || sort.isBlank() ? "latest" : sort.toLowerCase();

        if (!"latest".equals(effectiveSort)) {
            return CursorPageResponse.empty();
        }

        List<QueryEntry<Map>> queried;
        try {
            queried = switch (effectiveScope) {
                case "all" -> postFirebaseRepository.queryFeedAllDesc(cursor, limit + 1);
                case "school" -> postFirebaseRepository.queryFeedSchoolDesc(
                        resolveViewerSchool(viewer), cursor, limit + 1);
                case "department" -> postFirebaseRepository.queryFeedDepartmentDesc(
                        resolveViewerDepartment(viewer), cursor, limit + 1);
                default -> List.<QueryEntry<Map>>of();
            };
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        return buildFeedPage(queried, boardId, limit);
    }

    private CursorPageResponse<PostFeedItemResponse> buildFeedPage(
            List<QueryEntry<Map>> queried, String boardId, int limit) {
        boolean hasMore = queried.size() > limit;
        List<QueryEntry<Map>> page = hasMore ? queried.subList(0, limit) : queried;

        List<PostFeedItemResponse> items = new ArrayList<>(page.size());
        for (QueryEntry<Map> entry : page) {
            if (boardId != null && !boardId.isBlank()) {
                Object entryBoard = entry.value() == null ? null : entry.value().get("boardId");
                if (entryBoard == null || !boardId.equals(entryBoard.toString())) {
                    continue;
                }
            }
            Optional<Post> postOpt = postFirebaseRepository.findById(entry.key());
            if (postOpt.isEmpty()) {
                continue;
            }
            Post post = postOpt.get();
            if (post.status() != Post.Status.PUBLISHED) {
                continue;
            }
            Map<String, Long> stats = postFirebaseRepository.findStats(entry.key());
            items.add(new PostFeedItemResponse(
                    post.postId(),
                    post.boardId(),
                    post.title(),
                    buildPreview(post.content()),
                    post.anonymousId(),
                    post.createdAt(),
                    new PostFeedItemResponse.PostStatsView(
                            stats.getOrDefault("likes", 0L),
                            stats.getOrDefault("comments", 0L),
                            stats.getOrDefault("scraps", 0L))));
        }

        // cursor는 query window 마지막(가시 항목 아님) 기준으로 만든다 — deleted/board-mismatch 항목을 건너뛰어도
        // 다음 페이지가 정확히 이어지도록.
        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            QueryEntry<Map> last = page.get(page.size() - 1);
            String createdAt = last.value() == null ? null : (String) last.value().get("createdAt");
            nextCursor = CursorCodec.encodeString(createdAt, last.key());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    private String resolveViewerSchool(AuthenticatedUser viewer) {
        String schoolId = userAccountRepository.findAccount(viewer.userId())
                .map(UserAccount::schoolId)
                .orElse(null);
        if (schoolId == null || schoolId.isBlank()) {
            throw new BusinessException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "학교 정보가 등록되지 않은 사용자는 school 피드를 조회할 수 없습니다");
        }
        return schoolId;
    }

    private String resolveViewerDepartment(AuthenticatedUser viewer) {
        String departmentId = userAccountRepository.findAccount(viewer.userId())
                .map(UserAccount::departmentId)
                .orElse(null);
        if (departmentId == null || departmentId.isBlank()) {
            throw new BusinessException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "학과 정보가 등록되지 않은 사용자는 department 피드를 조회할 수 없습니다");
        }
        return departmentId;
    }

    private static String buildPreview(String content) {
        if (content == null) {
            return "";
        }
        String trimmed = content.replaceAll("\\s+", " ").trim();
        return trimmed.length() <= 60 ? trimmed : trimmed.substring(0, 60);
    }
}
