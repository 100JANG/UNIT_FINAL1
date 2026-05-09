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
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PostServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private PostService service;
    private UserAccountRepository userAccountRepository;
    private final AuthenticatedUser viewer =
            FixtureFactory.authenticated("u_viewer", "viewer@ajou.ac.kr");

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        PostFirebaseRepository repo = new PostFirebaseRepository(fakeDb);
        userAccountRepository = new UserAccountRepository(fakeDb);
        PostIdGenerator idGen = new PostIdGenerator();
        service = new PostService(
                new PostWritePolicy(), repo, userAccountRepository, idGen,
                FixedClockProvider.at("2026-05-09T00:00:00Z"));
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

        var page1 = service.feed(viewer, "all", null, "latest", null, 2);
        assertThat(page1.items()).extracting(r -> r.postId())
                .containsExactly("p_3", "p_2");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        var page2 = service.feed(viewer, "all", null, "latest", page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(r -> r.postId())
                .containsExactly("p_1");
        assertThat(page2.pagination().hasMore()).isFalse();
    }

    @Test
    void getPosts_latest_excludesDeletedPosts() {
        seedFeedPost("p_1", "2026-05-01T00:00:00Z", "PUBLISHED");
        seedFeedPost("p_2", "2026-05-02T00:00:00Z", "DELETED_BY_AUTHOR");
        seedFeedPost("p_3", "2026-05-03T00:00:00Z", "PUBLISHED");

        var page = service.feed(viewer, "all", null, "latest", null, 10);
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

        var page = service.feed(viewer, "all", null, "latest", null, 999);
        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void getPosts_schoolScope_usesSchoolFeedIndex() {
        // viewer는 ajou. all 인덱스에는 다른 학교 글도 있고, school 인덱스에는 ajou 글만 들어있음을 검증.
        userAccountRepository.save(account("u_viewer", "ajou", "ajou_csi"));
        // ajou 글 2건 — all + school 양쪽
        seedFeedPostWithScope("p_a1", "2026-05-01T00:00:00Z", "PUBLISHED", "ajou", null);
        seedFeedPostWithScope("p_a2", "2026-05-02T00:00:00Z", "PUBLISHED", "ajou", null);
        // 다른 학교(snu) 글 1건 — all에만 들어있게
        seedFeedPostWithScope("p_s1", "2026-05-03T00:00:00Z", "PUBLISHED", "snu", null);

        var page = service.feed(viewer, "school", null, "latest", null, 10);

        // school 인덱스에는 p_a1, p_a2만 등록되어 있으므로 p_s1은 안 보임.
        assertThat(page.items()).extracting(r -> r.postId())
                .containsExactly("p_a2", "p_a1");
        assertThat(page.pagination().hasMore()).isFalse();
    }

    @Test
    void getPosts_departmentScope_usesDepartmentFeedIndex() {
        userAccountRepository.save(account("u_viewer", "ajou", "ajou_csi"));
        seedFeedPostWithScope("p_d1", "2026-05-01T00:00:00Z", "PUBLISHED", "ajou", "ajou_csi");
        seedFeedPostWithScope("p_d2", "2026-05-02T00:00:00Z", "PUBLISHED", "ajou", "ajou_csi");
        // 다른 학과 글 — department 인덱스에 안 들어감
        seedFeedPostWithScope("p_other", "2026-05-03T00:00:00Z", "PUBLISHED", "ajou", "ajou_econ");

        var page = service.feed(viewer, "department", null, "latest", null, 10);

        assertThat(page.items()).extracting(r -> r.postId())
                .containsExactly("p_d2", "p_d1");
    }

    @Test
    void createPost_writesAllFeedIndexes() {
        // 사용자 계정에 학교/학과를 등록한 뒤 글을 작성하면 3개 feed 인덱스가 모두 기록되어야 한다.
        userAccountRepository.save(account("u_a", "ajou", "ajou_csi"));
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");

        PostCreatedResponse resp = service.createPost(user, new CreatePostRequest(
                "free", "테스트 제목", "본문은 충분히 길게 작성됩니다 진짜로요", List.of(), true));

        assertThat(fakeDb.get("/post_feeds/all/" + resp.postId(), java.util.Map.class)).isPresent();
        assertThat(fakeDb.get("/post_feeds/schools/ajou/" + resp.postId(), java.util.Map.class)).isPresent();
        assertThat(fakeDb.get("/post_feeds/departments/ajou_csi/" + resp.postId(), java.util.Map.class)).isPresent();
    }

    @Test
    void getPosts_schoolScope_missingSchoolId_throwsExpectedError() {
        // 사용자 계정이 schoolId 없이 저장되어 있으면 BUSINESS_RULE_VIOLATION.
        userAccountRepository.save(account("u_viewer", null, null));

        assertThatThrownBy(() -> service.feed(viewer, "school", null, "latest", null, 10))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.BUSINESS_RULE_VIOLATION);
    }

    @Test
    void getPosts_departmentScope_missingDepartmentId_throwsExpectedError() {
        userAccountRepository.save(account("u_viewer", "ajou", null));

        assertThatThrownBy(() -> service.feed(viewer, "department", null, "latest", null, 10))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.BUSINESS_RULE_VIOLATION);
    }

    private static UserAccount account(String userId, String schoolId, String departmentId) {
        java.time.Instant now = java.time.Instant.parse("2026-01-01T00:00:00Z");
        return new UserAccount(
                userId, userId + "@ajou.ac.kr", "유저",
                schoolId, departmentId, null,
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now, now);
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

    private void seedFeedPostWithScope(String postId,
                                        String createdAt,
                                        String status,
                                        String schoolId,
                                        String departmentId) {
        java.util.Map<String, Object> postData = new java.util.HashMap<>();
        postData.put("postId", postId);
        postData.put("boardId", "free");
        postData.put("title", "글 " + postId);
        postData.put("content", "본문 내용입니다");
        postData.put("status", status);
        postData.put("schoolId", schoolId);
        postData.put("departmentId", departmentId);
        postData.put("createdAt", createdAt);
        postData.put("updatedAt", createdAt);
        fakeDb.set("/posts/" + postId, postData);

        java.util.Map<String, Object> feedItem = new java.util.HashMap<>();
        feedItem.put("postId", postId);
        feedItem.put("boardId", "free");
        feedItem.put("title", "글 " + postId);
        feedItem.put("schoolId", schoolId);
        feedItem.put("departmentId", departmentId);
        feedItem.put("createdAt", createdAt);

        fakeDb.set("/post_feeds/all/" + postId, feedItem);
        if (schoolId != null) {
            fakeDb.set("/post_feeds/schools/" + schoolId + "/" + postId, feedItem);
        }
        if (departmentId != null) {
            fakeDb.set("/post_feeds/departments/" + departmentId + "/" + postId, feedItem);
        }
    }
}
