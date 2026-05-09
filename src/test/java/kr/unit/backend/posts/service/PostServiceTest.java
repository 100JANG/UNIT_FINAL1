package kr.unit.backend.posts.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.dto.PostLikeResponse;
import kr.unit.backend.posts.policy.PostWritePolicy;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PostServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private PostService service;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        PostFirebaseRepository repo = new PostFirebaseRepository(fakeDb);
        PostIdGenerator idGen = new PostIdGenerator();
        service = new PostService(new PostWritePolicy(), repo, idGen, FixedClockProvider.at("2026-05-09T00:00:00Z"));
    }

    @Test
    void createPost_savesPostAndFeedAndStatsAndUserPosts() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        CreatePostRequest req = new CreatePostRequest(
                "free",
                "테스트 제목",
                "본문은 적어도 10자 이상이다 정말로",
                List.of("기숙사"),
                true);

        PostCreatedResponse resp = service.createPost(user, req);

        assertThat(resp.postId()).startsWith("p_");
        assertThat(fakeDb.get("/posts/" + resp.postId(), java.util.Map.class)).isPresent();
        assertThat(fakeDb.get("/post_feeds/all/" + resp.postId(), java.util.Map.class)).isPresent();
        assertThat(fakeDb.get("/post_stats/" + resp.postId(), java.util.Map.class)).isPresent();
        assertThat(fakeDb.get("/user_posts/u_a/" + resp.postId(), java.util.Map.class)).isPresent();
    }

    @Test
    void createPost_rejectsTooShortTitle() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        CreatePostRequest req = new CreatePostRequest(
                "free",
                "x",
                "본문은 충분히 길어야 한다 어쩌고저쩌고",
                List.of(),
                true);

        assertThatThrownBy(() -> service.createPost(user, req))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.VALIDATION_FAILED);
    }

    @Test
    void createPost_rejectsTooShortContent() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        CreatePostRequest req = new CreatePostRequest(
                "free",
                "정상 제목",
                "짧음",
                List.of(),
                true);

        assertThatThrownBy(() -> service.createPost(user, req))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.VALIDATION_FAILED);
    }

    @Test
    void toggleLike_alternatesLikedFlagAndCount() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        PostCreatedResponse created = service.createPost(user, new CreatePostRequest(
                "free", "제목입니다", "본문은 충분히 길게 작성됩니다 진짜로요", List.of(), true));

        PostLikeResponse first = service.toggleLike(created.postId(), user);
        PostLikeResponse second = service.toggleLike(created.postId(), user);

        assertThat(first.liked()).isTrue();
        assertThat(first.likes()).isEqualTo(1L);
        assertThat(second.liked()).isFalse();
        assertThat(second.likes()).isEqualTo(0L);
    }

    @Test
    void getPosts_latest_usesCursorPage() {
        for (int i = 1; i <= 3; i++) {
            seedFeedPost("p_" + i, "2026-05-0" + i + "T00:00:00Z", "PUBLISHED");
        }

        var page1 = service.feed("all", null, "latest", null, 2);
        assertThat(page1.items()).extracting(r -> r.postId())
                .containsExactly("p_3", "p_2");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        var page2 = service.feed("all", null, "latest", page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(r -> r.postId())
                .containsExactly("p_1");
        assertThat(page2.pagination().hasMore()).isFalse();
    }

    @Test
    void getPosts_latest_excludesDeletedPosts() {
        seedFeedPost("p_1", "2026-05-01T00:00:00Z", "PUBLISHED");
        seedFeedPost("p_2", "2026-05-02T00:00:00Z", "DELETED_BY_AUTHOR");
        seedFeedPost("p_3", "2026-05-03T00:00:00Z", "PUBLISHED");

        var page = service.feed("all", null, "latest", null, 10);
        assertThat(page.items()).extracting(r -> r.postId())
                .containsExactly("p_3", "p_1");
        assertThat(page.pagination().hasMore()).isFalse();
    }

    @Test
    void getPosts_limitClampedToFifty() {
        for (int i = 0; i < 60; i++) {
            String postId = String.format("p_%03d", i);
            String createdAt = "2026-05-01T00:00:" + String.format("%02d", i) + "Z";
            seedFeedPost(postId, createdAt, "PUBLISHED");
        }

        var page = service.feed("all", null, "latest", null, 999);
        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    private void seedFeedPost(String postId, String createdAt, String status) {
        fakeDb.set("/posts/" + postId, java.util.Map.of(
                "postId", postId,
                "boardId", "free",
                "title", "글 " + postId,
                "content", "본문 내용입니다",
                "status", status,
                "createdAt", createdAt,
                "updatedAt", createdAt));
        fakeDb.set("/post_feeds/all/" + postId, java.util.Map.of(
                "postId", postId,
                "boardId", "free",
                "title", "글 " + postId,
                "createdAt", createdAt));
    }
}
