package kr.unit.backend.users.service;

import kr.unit.backend.comments.domain.Comment;
import kr.unit.backend.comments.repository.CommentFirebaseRepository;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.posts.domain.Post;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.users.dto.UserCommentActivityResponse;
import kr.unit.backend.users.dto.UserLikeActivityResponse;
import kr.unit.backend.users.dto.UserPostActivityResponse;
import kr.unit.backend.users.dto.UserScrapActivityResponse;
import kr.unit.backend.users.dto.UserStatsResponse;
import kr.unit.backend.users.repository.UserActivityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UserActivityServiceTest {

    private static final String USER_ID = "u_a";

    private FakeRealtimeDatabaseClient fakeDb;
    private PostFirebaseRepository postRepo;
    private CommentFirebaseRepository commentRepo;
    private UserActivityService service;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        postRepo = new PostFirebaseRepository(fakeDb);
        commentRepo = new CommentFirebaseRepository(fakeDb);
        service = new UserActivityService(
                new UserActivityRepository(fakeDb),
                postRepo,
                commentRepo);
    }

    @Test
    void getMyStats_success_returnsCounts() {
        fakeDb.set("/user_stats/" + USER_ID, Map.of(
                "posts", 47,
                "comments", 312,
                "likesReceived", 89,
                "scraps", 12,
                "juryVotes", 4));

        UserStatsResponse resp = service.getMyStats(USER_ID);

        assertThat(resp.posts()).isEqualTo(47L);
        assertThat(resp.comments()).isEqualTo(312L);
        assertThat(resp.likesReceived()).isEqualTo(89L);
        assertThat(resp.scraps()).isEqualTo(12L);
        assertThat(resp.juryVotes()).isEqualTo(4L);
    }

    @Test
    void getMyStats_missingStats_returnsZeroDefaults() {
        UserStatsResponse resp = service.getMyStats(USER_ID);

        assertThat(resp.posts()).isZero();
        assertThat(resp.comments()).isZero();
        assertThat(resp.likesReceived()).isZero();
        assertThat(resp.scraps()).isZero();
        assertThat(resp.juryVotes()).isZero();
    }

    @Test
    void getMyPosts_returnsCursorPage() {
        // 3 published posts + 1 deleted (제외되어야 함). 인덱스 쿼리는 limit+1을 가져온 뒤
        // service에서 status=PUBLISHED만 통과시키므로, deleted 항목이 포함된 query window는
        // 가시 항목이 limit보다 적게 나올 수 있다 (cursor는 query window 마지막 기준).
        savePost("p_1", USER_ID, "첫 글", Post.Status.PUBLISHED, Instant.parse("2026-05-01T00:00:00Z"));
        savePost("p_2", USER_ID, "두번째 글", Post.Status.PUBLISHED, Instant.parse("2026-05-02T00:00:00Z"));
        savePost("p_3", USER_ID, "세번째 글", Post.Status.PUBLISHED, Instant.parse("2026-05-03T00:00:00Z"));
        savePost("p_4", USER_ID, "삭제된 글", Post.Status.DELETED_BY_AUTHOR, Instant.parse("2026-05-04T00:00:00Z"));

        // page1: query window=[p_4, p_3, p_2] 에서 take(2)=[p_4, p_3] → p_4 제외 → 가시 [p_3].
        CursorPageResponse<UserPostActivityResponse> page1 = service.getMyPosts(USER_ID, null, 2);
        assertThat(page1.items()).extracting(UserPostActivityResponse::postId)
                .containsExactly("p_3");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        // page2: cursor가 p_3을 가리키므로 strictly older 항목 [p_2, p_1] (총 2건, limit+1=3 미만 → hasMore=false).
        CursorPageResponse<UserPostActivityResponse> page2 =
                service.getMyPosts(USER_ID, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(UserPostActivityResponse::postId)
                .containsExactly("p_2", "p_1");
        assertThat(page2.pagination().hasMore()).isFalse();
        assertThat(page2.pagination().cursor()).isNull();
    }

    @Test
    void getMyComments_returnsCursorPage() {
        // post 하나에 댓글 3개 다른 시간으로 저장
        savePost("p_x", USER_ID, "글", Post.Status.PUBLISHED, Instant.parse("2026-05-01T00:00:00Z"));
        saveComment("c_1", "p_x", USER_ID, null, Instant.parse("2026-05-01T01:00:00Z"), "안녕");
        saveComment("c_2", "p_x", USER_ID, null, Instant.parse("2026-05-02T01:00:00Z"), "또 안녕");
        saveComment("c_3", "p_x", USER_ID, null, Instant.parse("2026-05-03T01:00:00Z"), "마지막");

        CursorPageResponse<UserCommentActivityResponse> page1 =
                service.getMyComments(USER_ID, null, 2);

        assertThat(page1.items()).extracting(UserCommentActivityResponse::commentId)
                .containsExactly("c_3", "c_2");
        assertThat(page1.pagination().hasMore()).isTrue();

        CursorPageResponse<UserCommentActivityResponse> page2 =
                service.getMyComments(USER_ID, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(UserCommentActivityResponse::commentId)
                .containsExactly("c_1");
        assertThat(page2.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyLikes_returnsCursorPage() {
        // 좋아요한 글 3개를 직접 user_likes에 넣고, 각 post는 PUBLISHED로 저장
        savePost("p_1", "other", "글1", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_2", "other", "글2", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_3", "other", "삭제된 글", Post.Status.REMOVED_BY_ADMIN, Instant.parse("2026-04-30T00:00:00Z"));

        fakeDb.set("/user_likes/" + USER_ID + "/p_1", Map.of(
                "postId", "p_1", "likedAt", "2026-05-01T00:00:00Z"));
        fakeDb.set("/user_likes/" + USER_ID + "/p_2", Map.of(
                "postId", "p_2", "likedAt", "2026-05-02T00:00:00Z"));
        fakeDb.set("/user_likes/" + USER_ID + "/p_3", Map.of(
                "postId", "p_3", "likedAt", "2026-05-03T00:00:00Z"));

        CursorPageResponse<UserLikeActivityResponse> page1 =
                service.getMyLikes(USER_ID, null, 5);

        // p_3는 REMOVED_BY_ADMIN이라 제외 → newest first로 p_2, p_1만 반환
        assertThat(page1.items()).extracting(UserLikeActivityResponse::postId)
                .containsExactly("p_2", "p_1");
        assertThat(page1.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyScraps_returnsCursorPage() {
        savePost("p_1", "other", "글1", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_2", "other", "글2", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_3", "other", "글3", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        // boardName lookup 검증을 위해 /boards/free 메타데이터 저장
        fakeDb.set("/boards/free", Map.of("name", "자유게시판"));

        fakeDb.set("/user_scraps/" + USER_ID + "/p_1", Map.of(
                "postId", "p_1", "scrappedAt", "2026-05-01T00:00:00Z"));
        fakeDb.set("/user_scraps/" + USER_ID + "/p_2", Map.of(
                "postId", "p_2", "scrappedAt", "2026-05-02T00:00:00Z"));
        fakeDb.set("/user_scraps/" + USER_ID + "/p_3", Map.of(
                "postId", "p_3", "scrappedAt", "2026-05-03T00:00:00Z"));

        CursorPageResponse<UserScrapActivityResponse> page1 = service.getMyScraps(USER_ID, null, 2);
        assertThat(page1.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_3", "p_2");
        assertThat(page1.items().get(0).boardName()).isEqualTo("자유게시판");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        CursorPageResponse<UserScrapActivityResponse> page2 =
                service.getMyScraps(USER_ID, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_1");
        assertThat(page2.pagination().hasMore()).isFalse();
        assertThat(page2.pagination().cursor()).isNull();
    }

    @Test
    void getMyScraps_excludesDeletedPosts() {
        savePost("p_alive", "other", "활성", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_removed", "other", "관리자 삭제", Post.Status.REMOVED_BY_ADMIN, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_author_deleted", "other", "작성자 삭제", Post.Status.DELETED_BY_AUTHOR,
                Instant.parse("2026-04-30T00:00:00Z"));

        fakeDb.set("/user_scraps/" + USER_ID + "/p_alive", Map.of(
                "postId", "p_alive", "scrappedAt", "2026-05-01T00:00:00Z"));
        fakeDb.set("/user_scraps/" + USER_ID + "/p_removed", Map.of(
                "postId", "p_removed", "scrappedAt", "2026-05-02T00:00:00Z"));
        fakeDb.set("/user_scraps/" + USER_ID + "/p_author_deleted", Map.of(
                "postId", "p_author_deleted", "scrappedAt", "2026-05-03T00:00:00Z"));

        CursorPageResponse<UserScrapActivityResponse> resp = service.getMyScraps(USER_ID, null, 50);

        assertThat(resp.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_alive");
        assertThat(resp.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyScraps_clampsLimitToFifty() {
        for (int i = 0; i < 60; i++) {
            String postId = String.format("p_%03d", i);
            savePost(postId, "other", "post " + i, Post.Status.PUBLISHED,
                    Instant.parse("2026-04-30T00:00:00Z"));
            fakeDb.set("/user_scraps/" + USER_ID + "/" + postId, Map.of(
                    "postId", postId,
                    "scrappedAt", Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i).toString()));
        }

        CursorPageResponse<UserScrapActivityResponse> page = service.getMyScraps(USER_ID, null, 999);

        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void getMyScraps_usesIndexedQuery() {
        // 인덱스 기반 쿼리는 Repository.queryUserScrapsDesc → RealtimeDatabaseClient.queryByChildDesc 경로를 탄다.
        // postId 사전순과 scrappedAt 정렬이 다르도록 의도 배치하여 sort가 scrappedAt 기준임을 강제한다.
        savePost("p_x", "other", "오래된", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_y", "other", "최신", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));

        fakeDb.set("/user_scraps/" + USER_ID + "/p_x", Map.of(
                "postId", "p_x", "scrappedAt", "2026-05-02T00:00:00Z"));
        fakeDb.set("/user_scraps/" + USER_ID + "/p_y", Map.of(
                "postId", "p_y", "scrappedAt", "2026-05-01T00:00:00Z"));

        CursorPageResponse<UserScrapActivityResponse> page =
                service.getMyScraps(USER_ID, null, 10);

        // scrappedAt DESC: p_x (05-02) → p_y (05-01). postId ASC였다면 p_x → p_y가 우연히 같아짐 →
        // 진짜로 인덱스가 scrappedAt 기준인지 verify를 위해, postId 사전 역순(p_y가 더 큼)인데도
        // 시간이 더 오래된 p_y가 뒤로 가야 한다.
        assertThat(page.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_x", "p_y");
    }

    @Test
    void getMyScraps_cursorWorks() {
        for (int i = 0; i < 5; i++) {
            String postId = String.format("p_%02d", i);
            savePost(postId, "other", "글", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
            fakeDb.set("/user_scraps/" + USER_ID + "/" + postId, Map.of(
                    "postId", postId,
                    "scrappedAt", "2026-05-0" + (i + 1) + "T00:00:00Z"));
        }

        // newest first → page1: p_04, p_03
        CursorPageResponse<UserScrapActivityResponse> page1 = service.getMyScraps(USER_ID, null, 2);
        assertThat(page1.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_04", "p_03");
        assertThat(page1.pagination().hasMore()).isTrue();

        CursorPageResponse<UserScrapActivityResponse> page2 =
                service.getMyScraps(USER_ID, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_02", "p_01");
        assertThat(page2.pagination().hasMore()).isTrue();

        CursorPageResponse<UserScrapActivityResponse> page3 =
                service.getMyScraps(USER_ID, page2.pagination().cursor(), 2);
        assertThat(page3.items()).extracting(UserScrapActivityResponse::postId)
                .containsExactly("p_00");
        assertThat(page3.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyScraps_zeroOrNegativeLimitFallsBackToDefault() {
        for (int i = 0; i < 25; i++) {
            String postId = String.format("p_%03d", i);
            savePost(postId, "other", "post " + i, Post.Status.PUBLISHED,
                    Instant.parse("2026-04-30T00:00:00Z"));
            fakeDb.set("/user_scraps/" + USER_ID + "/" + postId, Map.of(
                    "postId", postId,
                    "scrappedAt", Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i).toString()));
        }

        CursorPageResponse<UserScrapActivityResponse> withZero = service.getMyScraps(USER_ID, null, 0);
        assertThat(withZero.items()).hasSize(20);
        assertThat(withZero.pagination().hasMore()).isTrue();

        CursorPageResponse<UserScrapActivityResponse> withNegative = service.getMyScraps(USER_ID, null, -10);
        assertThat(withNegative.items()).hasSize(20);
        assertThat(withNegative.pagination().hasMore()).isTrue();
    }

    @Test
    void getMyPosts_usesIndexedQuery() {
        // postId 사전순과 createdAt 정렬이 다르도록 의도 배치하여 sort가 createdAt 기준임을 강제.
        savePost("p_x", USER_ID, "오래된", Post.Status.PUBLISHED, Instant.parse("2026-05-01T00:00:00Z"));
        savePost("p_y", USER_ID, "최신",   Post.Status.PUBLISHED, Instant.parse("2026-05-02T00:00:00Z"));

        // savePost는 postRepo.save를 통해 /user_posts/{userId}/{postId}에 createdAt을 함께 기록한다.
        CursorPageResponse<UserPostActivityResponse> page = service.getMyPosts(USER_ID, null, 10);

        // newest first → p_y → p_x
        assertThat(page.items()).extracting(UserPostActivityResponse::postId)
                .containsExactly("p_y", "p_x");
        assertThat(page.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyComments_usesIndexedQuery() {
        // /comments/{postId}/{commentId}와 /user_comments/{userId}/{commentId} 둘 다 commentRepo.save로 기록됨.
        // postId 사전순과 createdAt이 다르게 배치.
        savePost("p_a", "other", "글", Post.Status.PUBLISHED, Instant.parse("2026-05-01T00:00:00Z"));
        saveComment("c_z", "p_a", USER_ID, null, Instant.parse("2026-05-01T00:00:00Z"), "오래된");
        saveComment("c_a", "p_a", USER_ID, null, Instant.parse("2026-05-02T00:00:00Z"), "최신");

        CursorPageResponse<UserCommentActivityResponse> page = service.getMyComments(USER_ID, null, 10);

        // newest first by createdAt → c_a (05-02) → c_z (05-01)
        assertThat(page.items()).extracting(UserCommentActivityResponse::commentId)
                .containsExactly("c_a", "c_z");
    }

    @Test
    void getMyLikes_usesIndexedQuery() {
        savePost("p_x", "other", "오래된", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        savePost("p_y", "other", "최신",   Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
        // user_likes 인덱스를 직접 시드 (likedAt 기준 sort 검증).
        fakeDb.set("/user_likes/" + USER_ID + "/p_x", Map.of(
                "postId", "p_x", "likedAt", "2026-05-02T00:00:00Z"));
        fakeDb.set("/user_likes/" + USER_ID + "/p_y", Map.of(
                "postId", "p_y", "likedAt", "2026-05-01T00:00:00Z"));

        CursorPageResponse<UserLikeActivityResponse> page = service.getMyLikes(USER_ID, null, 10);

        // likedAt DESC: p_x(05-02) → p_y(05-01)
        assertThat(page.items()).extracting(UserLikeActivityResponse::postId)
                .containsExactly("p_x", "p_y");
    }

    @Test
    void getMyLikes_cursorWorks() {
        for (int i = 0; i < 5; i++) {
            String postId = String.format("p_%02d", i);
            savePost(postId, "other", "글", Post.Status.PUBLISHED, Instant.parse("2026-04-30T00:00:00Z"));
            fakeDb.set("/user_likes/" + USER_ID + "/" + postId, Map.of(
                    "postId", postId,
                    "likedAt", "2026-05-0" + (i + 1) + "T00:00:00Z"));
        }

        CursorPageResponse<UserLikeActivityResponse> page1 = service.getMyLikes(USER_ID, null, 2);
        assertThat(page1.items()).extracting(UserLikeActivityResponse::postId)
                .containsExactly("p_04", "p_03");
        assertThat(page1.pagination().hasMore()).isTrue();

        CursorPageResponse<UserLikeActivityResponse> page2 =
                service.getMyLikes(USER_ID, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(UserLikeActivityResponse::postId)
                .containsExactly("p_02", "p_01");
        assertThat(page2.pagination().hasMore()).isTrue();

        CursorPageResponse<UserLikeActivityResponse> page3 =
                service.getMyLikes(USER_ID, page2.pagination().cursor(), 2);
        assertThat(page3.items()).extracting(UserLikeActivityResponse::postId)
                .containsExactly("p_00");
        assertThat(page3.pagination().hasMore()).isFalse();
    }

    @Test
    void getMyPosts_excludesDeletedPosts() {
        savePost("p_alive_1", USER_ID, "활성1", Post.Status.PUBLISHED,
                Instant.parse("2026-05-01T00:00:00Z"));
        savePost("p_removed", USER_ID, "관리자삭제", Post.Status.REMOVED_BY_ADMIN,
                Instant.parse("2026-05-02T00:00:00Z"));
        savePost("p_alive_2", USER_ID, "활성2", Post.Status.PUBLISHED,
                Instant.parse("2026-05-03T00:00:00Z"));
        savePost("p_self_deleted", USER_ID, "본인삭제", Post.Status.DELETED_BY_AUTHOR,
                Instant.parse("2026-05-04T00:00:00Z"));

        CursorPageResponse<UserPostActivityResponse> page = service.getMyPosts(USER_ID, null, 50);

        // newest first 활성만 남음: p_alive_2(05-03), p_alive_1(05-01)
        assertThat(page.items()).extracting(UserPostActivityResponse::postId)
                .containsExactly("p_alive_2", "p_alive_1");
    }

    @Test
    void getMyComments_keepsDeletedCommentsMasked() {
        // 삭제된 댓글은 list에서 제외하지 않고 content 마스킹된 상태로 포함된다 (Comment 도메인 정책).
        savePost("p_a", "other", "글", Post.Status.PUBLISHED, Instant.parse("2026-05-01T00:00:00Z"));

        // 활성 댓글
        saveComment("c_alive", "p_a", USER_ID, null, Instant.parse("2026-05-02T00:00:00Z"), "활성댓글");
        // 삭제된 댓글: 본 노드의 deleted 플래그를 직접 true로 마킹
        saveComment("c_dead", "p_a", USER_ID, null, Instant.parse("2026-05-03T00:00:00Z"), "원본");
        fakeDb.set("/comments/p_a/c_dead/deleted", true);
        fakeDb.set("/comments/p_a/c_dead/content", "삭제된 댓글입니다.");

        CursorPageResponse<UserCommentActivityResponse> page = service.getMyComments(USER_ID, null, 10);

        // newest first → c_dead(05-03), c_alive(05-02). 둘 다 결과에 포함되어야 한다.
        assertThat(page.items()).extracting(UserCommentActivityResponse::commentId)
                .containsExactly("c_dead", "c_alive");
        UserCommentActivityResponse dead = page.items().get(0);
        assertThat(dead.deleted()).isTrue();
        assertThat(dead.content()).isEqualTo("삭제된 댓글입니다.");
        UserCommentActivityResponse alive = page.items().get(1);
        assertThat(alive.deleted()).isFalse();
        assertThat(alive.content()).isEqualTo("활성댓글");
    }

    @Test
    void pagination_clampsLimitToFifty() {
        for (int i = 0; i < 60; i++) {
            String id = String.format("p_%03d", i);
            savePost(id, USER_ID, "post " + i, Post.Status.PUBLISHED,
                    Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i));
        }
        CursorPageResponse<UserPostActivityResponse> page = service.getMyPosts(USER_ID, null, 999);

        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void pagination_zeroOrNegativeLimitFallsBackToDefault() {
        for (int i = 0; i < 25; i++) {
            String id = String.format("p_%03d", i);
            savePost(id, USER_ID, "post " + i, Post.Status.PUBLISHED,
                    Instant.parse("2026-05-01T00:00:00Z").plusSeconds(i));
        }
        CursorPageResponse<UserPostActivityResponse> withZero = service.getMyPosts(USER_ID, null, 0);
        assertThat(withZero.items()).hasSize(20);
        assertThat(withZero.pagination().hasMore()).isTrue();

        CursorPageResponse<UserPostActivityResponse> withNegative = service.getMyPosts(USER_ID, null, -10);
        assertThat(withNegative.items()).hasSize(20);
        assertThat(withNegative.pagination().hasMore()).isTrue();
    }

    private void savePost(String postId, String authorId, String title, Post.Status status, Instant createdAt) {
        Post post = new Post(
                postId, "free", null, null,
                authorId, "익명_" + postId,
                title, "본문 내용 적당히 길게 작성됩니다.",
                List.of(),
                Post.Visibility.PUBLIC,
                status,
                createdAt, createdAt);
        postRepo.save(post);
        // status를 PUBLISHED 이외로 두려면 save 이후 직접 path를 덮어쓴다 (Repository.save는 PUBLISHED를 가정).
        if (status != Post.Status.PUBLISHED) {
            fakeDb.set("/posts/" + postId + "/status", status.name());
        }
    }

    private void saveComment(String commentId,
                              String postId,
                              String userId,
                              String parentCommentId,
                              Instant createdAt,
                              String content) {
        commentRepo.save(new Comment(
                commentId, postId, userId, "익명_" + commentId,
                content, parentCommentId, false,
                createdAt, createdAt));
    }
}
