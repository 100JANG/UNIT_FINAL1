package kr.unit.backend.comments.service;

import kr.unit.backend.comments.domain.Comment;
import kr.unit.backend.comments.dto.CommentCreatedResponse;
import kr.unit.backend.comments.dto.CommentLikeResponse;
import kr.unit.backend.comments.dto.CommentResponse;
import kr.unit.backend.comments.dto.CreateCommentRequest;
import kr.unit.backend.comments.policy.CommentWritePolicy;
import kr.unit.backend.comments.repository.CommentFirebaseRepository;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.policy.PostWritePolicy;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.service.PostIdGenerator;
import kr.unit.backend.posts.service.PostService;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PostCommentServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private CommentFirebaseRepository commentRepo;
    private PostService postService;
    private PostCommentService service;
    private AuthenticatedUser author;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        PostFirebaseRepository postRepo = new PostFirebaseRepository(fakeDb);
        commentRepo = new CommentFirebaseRepository(fakeDb);
        PostIdGenerator idGen = new PostIdGenerator();

        postService = new PostService(new PostWritePolicy(), postRepo, idGen, clock);
        service = new PostCommentService(
                postRepo, commentRepo, new CommentWritePolicy(), idGen, clock);

        author = FixtureFactory.authenticated("u_author", "author@ajou.ac.kr");
    }

    @Test
    void createComment_success_incrementsPostCommentCount() {
        String postId = newPost().postId();

        CommentCreatedResponse resp = service.create(postId, author,
                new CreateCommentRequest("좋은 글이네요", null));

        assertThat(resp.postId()).isEqualTo(postId);
        assertThat(resp.commentId()).startsWith("c_");
        assertThat(resp.parentCommentId()).isNull();
        assertThat(fakeDb.get("/comments/" + postId + "/" + resp.commentId(), java.util.Map.class))
                .isPresent();
        assertThat(fakeDb.get("/post_stats/" + postId + "/comments", Long.class))
                .contains(1L);
        assertThat(fakeDb.get("/user_comments/u_author/" + resp.commentId(), java.util.Map.class))
                .isPresent();
    }

    @Test
    void createReply_success_depthOne() {
        String postId = newPost().postId();
        CommentCreatedResponse root = service.create(postId, author,
                new CreateCommentRequest("부모 댓글", null));

        CommentCreatedResponse reply = service.create(postId, author,
                new CreateCommentRequest("대댓글", root.commentId()));

        assertThat(reply.parentCommentId()).isEqualTo(root.commentId());
        Comment stored = commentRepo.findById(postId, reply.commentId()).orElseThrow();
        assertThat(stored.parentCommentId()).isEqualTo(root.commentId());
        assertThat(stored.isReply()).isTrue();
        // 두 댓글 다 작성되었으므로 post_stats.comments == 2
        assertThat(fakeDb.get("/post_stats/" + postId + "/comments", Long.class))
                .contains(2L);
    }

    @Test
    void createReply_rejectsDepthTwo() {
        String postId = newPost().postId();
        CommentCreatedResponse root = service.create(postId, author,
                new CreateCommentRequest("부모 댓글", null));
        CommentCreatedResponse reply = service.create(postId, author,
                new CreateCommentRequest("대댓글", root.commentId()));

        assertThatThrownBy(() -> service.create(postId, author,
                new CreateCommentRequest("대대댓글 시도", reply.commentId())))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.BUSINESS_RULE_VIOLATION);
    }

    @Test
    void createComment_rejectsBlankContent() {
        String postId = newPost().postId();
        assertThatThrownBy(() -> service.create(postId, author,
                new CreateCommentRequest("   ", null)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.VALIDATION_FAILED);

        assertThatThrownBy(() -> service.create(postId, author,
                new CreateCommentRequest(null, null)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.VALIDATION_FAILED);
    }

    @Test
    void likeComment_firstTime_incrementsLikes() {
        String postId = newPost().postId();
        CommentCreatedResponse created = service.create(postId, author,
                new CreateCommentRequest("댓글", null));

        AuthenticatedUser liker = FixtureFactory.authenticated("u_liker", "liker@ajou.ac.kr");
        CommentLikeResponse resp = service.toggleLike(postId, created.commentId(), liker);

        assertThat(resp.liked()).isTrue();
        assertThat(resp.totalLikes()).isEqualTo(1L);
        assertThat(fakeDb.get("/comment_likes/" + created.commentId() + "/u_liker", Boolean.class))
                .contains(true);
        assertThat(fakeDb.get("/comment_stats/" + created.commentId() + "/likes", Long.class))
                .contains(1L);
    }

    @Test
    void likeComment_secondTime_unlikesAndDecrementsLikes() {
        String postId = newPost().postId();
        CommentCreatedResponse created = service.create(postId, author,
                new CreateCommentRequest("댓글", null));

        AuthenticatedUser liker = FixtureFactory.authenticated("u_liker", "liker@ajou.ac.kr");
        service.toggleLike(postId, created.commentId(), liker);
        CommentLikeResponse second = service.toggleLike(postId, created.commentId(), liker);

        assertThat(second.liked()).isFalse();
        assertThat(second.totalLikes()).isEqualTo(0L);
        assertThat(fakeDb.get("/comment_likes/" + created.commentId() + "/u_liker", Boolean.class))
                .isEmpty();
    }

    @Test
    void deleteOwnComment_success_softDeletes() {
        String postId = newPost().postId();
        CommentCreatedResponse created = service.create(postId, author,
                new CreateCommentRequest("내가 쓴 댓글", null));

        service.delete(postId, created.commentId(), author);

        Comment stored = commentRepo.findById(postId, created.commentId()).orElseThrow();
        assertThat(stored.deleted()).isTrue();
        assertThat(stored.content()).isEqualTo("삭제된 댓글입니다.");
        // post_stats.comments는 감소시키지 않는다 (총 댓글 흔적 유지, MVP 정책)
        assertThat(fakeDb.get("/post_stats/" + postId + "/comments", Long.class))
                .contains(1L);
    }

    @Test
    void deleteOtherUserComment_forbidden() {
        String postId = newPost().postId();
        CommentCreatedResponse created = service.create(postId, author,
                new CreateCommentRequest("내 댓글", null));

        AuthenticatedUser stranger = FixtureFactory.authenticated("u_stranger", "x@ajou.ac.kr");
        assertThatThrownBy(() -> service.delete(postId, created.commentId(), stranger))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.FORBIDDEN);

        // 원본 댓글은 그대로 유지되어야 한다
        Comment stored = commentRepo.findById(postId, created.commentId()).orElseThrow();
        assertThat(stored.deleted()).isFalse();
    }

    @Test
    void getComments_returnsCursorPage() {
        // 동일한 FixedClock에서는 createdAt이 같아 cursor pagination 안정성 검증을 위해
        // Repository에 명시적 timestamp의 댓글을 직접 저장한다.
        // 두 번째 인자는 limit (size 아님) — 정합성 정리에 따라 limit으로 통일.
        String postId = newPost().postId();
        commentRepo.save(buildComment("c_a", postId, "u_author", null,
                Instant.parse("2026-05-01T00:00:00Z"), "첫번째"));
        commentRepo.save(buildComment("c_b", postId, "u_author", null,
                Instant.parse("2026-05-02T00:00:00Z"), "두번째"));
        commentRepo.save(buildComment("c_c", postId, "u_author", null,
                Instant.parse("2026-05-03T00:00:00Z"), "세번째"));

        CursorPageResponse<CommentResponse> page1 = service.list(postId, null, 2);
        assertThat(page1.items()).extracting(CommentResponse::commentId)
                .containsExactly("c_a", "c_b");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        CursorPageResponse<CommentResponse> page2 = service.list(postId, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(CommentResponse::commentId)
                .containsExactly("c_c");
        assertThat(page2.pagination().hasMore()).isFalse();
        assertThat(page2.pagination().cursor()).isNull();
    }

    @Test
    void getComments_clampsLimitToFiftyMax() {
        // 사용자 정합성 정리: limit 최대값은 50. 50 초과로 요청해도 50으로 잘려서 처리된다.
        String postId = newPost().postId();
        for (int i = 0; i < 60; i++) {
            String id = String.format("c_%03d", i);
            commentRepo.save(buildComment(
                    id, postId, "u_author", null,
                    Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i),
                    "comment " + i));
        }

        CursorPageResponse<CommentResponse> page = service.list(postId, null, 999);

        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void getComments_zeroOrNegativeLimitFallsBackToDefault20() {
        // limit=0 또는 음수일 때는 기본값 20으로 fallback.
        String postId = newPost().postId();
        for (int i = 0; i < 25; i++) {
            String id = String.format("c_%03d", i);
            commentRepo.save(buildComment(
                    id, postId, "u_author", null,
                    Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i),
                    "comment " + i));
        }

        CursorPageResponse<CommentResponse> page = service.list(postId, null, 0);

        assertThat(page.items()).hasSize(20);
        assertThat(page.pagination().hasMore()).isTrue();
    }

    private PostCreatedResponse newPost() {
        return postService.createPost(author, new CreatePostRequest(
                "free", "테스트 제목", "본문은 충분히 길게 작성되었습니다 진짜로요", List.of(), true));
    }

    private static Comment buildComment(String commentId,
                                         String postId,
                                         String userId,
                                         String parentCommentId,
                                         Instant createdAt,
                                         String content) {
        return new Comment(
                commentId, postId, userId, "익명_" + commentId,
                content, parentCommentId, false,
                createdAt, createdAt);
    }
}
