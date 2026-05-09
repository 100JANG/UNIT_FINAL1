package kr.unit.backend.posts.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.dto.PostScrapResponse;
import kr.unit.backend.posts.policy.PostWritePolicy;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.repository.PostScrapFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PostScrapServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private PostService postService;
    private PostScrapService scrapService;
    private AuthenticatedUser author;
    private AuthenticatedUser scrapper;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        PostFirebaseRepository postRepo = new PostFirebaseRepository(fakeDb);
        PostScrapFirebaseRepository scrapRepo = new PostScrapFirebaseRepository(fakeDb);
        PostIdGenerator idGen = new PostIdGenerator();

        postService = new PostService(new PostWritePolicy(), postRepo, idGen, clock);
        scrapService = new PostScrapService(postRepo, scrapRepo, clock);

        author = FixtureFactory.authenticated("u_author", "author@ajou.ac.kr");
        scrapper = FixtureFactory.authenticated("u_scrapper", "scrapper@ajou.ac.kr");
    }

    @Test
    void scrapPost_firstTime_addsScrapAndIncrementsCounts() {
        String postId = newPost().postId();

        PostScrapResponse resp = scrapService.toggleScrap(postId, scrapper);

        assertThat(resp.postId()).isEqualTo(postId);
        assertThat(resp.scrapped()).isTrue();
        assertThat(resp.totalScraps()).isEqualTo(1L);
        assertThat(fakeDb.get("/post_scraps/" + postId + "/u_scrapper", Boolean.class))
                .contains(true);
        assertThat(fakeDb.get("/user_scraps/u_scrapper/" + postId, Map.class)).isPresent();
        assertThat(fakeDb.get("/post_stats/" + postId + "/scraps", Long.class))
                .contains(1L);
        assertThat(fakeDb.get("/user_stats/u_scrapper/scraps", Long.class))
                .contains(1L);
    }

    @Test
    void scrapPost_secondTime_removesScrapAndDecrementsCounts() {
        String postId = newPost().postId();
        scrapService.toggleScrap(postId, scrapper);

        PostScrapResponse second = scrapService.toggleScrap(postId, scrapper);

        assertThat(second.scrapped()).isFalse();
        assertThat(second.totalScraps()).isEqualTo(0L);
        assertThat(fakeDb.get("/post_scraps/" + postId + "/u_scrapper", Boolean.class))
                .isEmpty();
        assertThat(fakeDb.get("/user_scraps/u_scrapper/" + postId, Map.class))
                .isEmpty();
        assertThat(fakeDb.get("/post_stats/" + postId + "/scraps", Long.class))
                .contains(0L);
        assertThat(fakeDb.get("/user_stats/u_scrapper/scraps", Long.class))
                .contains(0L);
    }

    @Test
    void scrapPost_deletedPost_notFoundOrBusinessRuleViolation() {
        String postId = newPost().postId();
        // soft delete: status를 DELETED_BY_AUTHOR로 변경
        fakeDb.set("/posts/" + postId + "/status", "DELETED_BY_AUTHOR");

        assertThatThrownBy(() -> scrapService.toggleScrap(postId, scrapper))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .satisfies(code -> assertThat(code)
                        .isIn(ErrorCode.NOT_FOUND, ErrorCode.BUSINESS_RULE_VIOLATION));
    }

    @Test
    void scrapPost_missingPost_notFound() {
        assertThatThrownBy(() -> scrapService.toggleScrap("p_does_not_exist", scrapper))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void scrapPost_doesNotDecrementBelowZero() {
        // 데이터 불일치 시뮬레이션: post_scraps에는 사용자 표시가 있지만 카운터는 0인 상태에서 toggle.
        // toggle은 isScrapped=true로 보고 -1 increment를 시도하지만 floor(0) 보호가 동작해야 한다.
        String postId = newPost().postId();
        fakeDb.set("/post_scraps/" + postId + "/u_scrapper", true);
        fakeDb.set("/user_scraps/u_scrapper/" + postId,
                Map.of("postId", postId, "scrappedAt", "2026-05-09T00:00:00Z"));
        // /post_stats/{postId}/scraps와 /user_stats/u_scrapper/scraps는 newPost() 시점의 0 (또는 미설정).

        PostScrapResponse resp = scrapService.toggleScrap(postId, scrapper);

        assertThat(resp.scrapped()).isFalse();
        assertThat(resp.totalScraps()).isEqualTo(0L);
        assertThat(fakeDb.get("/post_stats/" + postId + "/scraps", Long.class))
                .contains(0L);
        assertThat(fakeDb.get("/user_stats/u_scrapper/scraps", Long.class))
                .contains(0L);
    }

    private PostCreatedResponse newPost() {
        return postService.createPost(author, new CreatePostRequest(
                "free", "테스트 제목", "본문은 충분히 길게 작성됩니다 진짜로요", List.of(), true));
    }
}
