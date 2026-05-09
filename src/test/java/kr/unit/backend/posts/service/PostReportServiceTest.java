package kr.unit.backend.posts.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.domain.ReportReason;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.dto.ReportCreatedResponse;
import kr.unit.backend.posts.dto.ReportPostRequest;
import kr.unit.backend.posts.policy.PostWritePolicy;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.repository.PostReportFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PostReportServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private PostService postService;
    private PostReportService reportService;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        PostFirebaseRepository postRepo = new PostFirebaseRepository(fakeDb);
        PostReportFirebaseRepository reportRepo = new PostReportFirebaseRepository(fakeDb);
        PostIdGenerator idGen = new PostIdGenerator();
        postService = new PostService(new PostWritePolicy(), postRepo, idGen, clock);
        reportService = new PostReportService(postRepo, reportRepo, idGen, clock);
    }

    @Test
    void report_storesReportWithReceivedStatus() {
        AuthenticatedUser author = FixtureFactory.authenticated("u_author", "x@ajou.ac.kr");
        AuthenticatedUser reporter = FixtureFactory.authenticated("u_reporter", "y@ajou.ac.kr");
        PostCreatedResponse created = postService.createPost(author,
                new CreatePostRequest("free", "글 제목", "본문은 충분히 깁니다 정말로요", List.of(), true));

        ReportCreatedResponse resp = reportService.report(
                created.postId(), reporter,
                new ReportPostRequest(ReportReason.TOXIC, "심함"));

        assertThat(resp.status()).isEqualTo("RECEIVED");
        assertThat(fakeDb.get("/reports/" + resp.reportId(), java.util.Map.class)).isPresent();
    }

    @Test
    void report_rejectsDuplicateReportFromSameReporter() {
        AuthenticatedUser author = FixtureFactory.authenticated("u_author", "x@ajou.ac.kr");
        AuthenticatedUser reporter = FixtureFactory.authenticated("u_reporter", "y@ajou.ac.kr");
        PostCreatedResponse created = postService.createPost(author,
                new CreatePostRequest("free", "글 제목", "본문은 충분히 깁니다 정말로요", List.of(), true));

        reportService.report(created.postId(), reporter,
                new ReportPostRequest(ReportReason.SPAM, null));

        assertThatThrownBy(() -> reportService.report(created.postId(), reporter,
                new ReportPostRequest(ReportReason.SPAM, null)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.REPORT_DUPLICATE);
    }

    @Test
    void report_rejectsNonExistingPost() {
        AuthenticatedUser reporter = FixtureFactory.authenticated("u_reporter", "y@ajou.ac.kr");
        assertThatThrownBy(() -> reportService.report("p_unknown", reporter,
                new ReportPostRequest(ReportReason.OTHER, null)))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void report_doesNotCreateJuryCaseAutomatically() {
        // Reserved 흐름 검증: 신고가 들어와도 jury_cases 노드는 생성되지 않는다.
        AuthenticatedUser author = FixtureFactory.authenticated("u_author", "x@ajou.ac.kr");
        AuthenticatedUser reporter = FixtureFactory.authenticated("u_reporter", "y@ajou.ac.kr");
        PostCreatedResponse created = postService.createPost(author,
                new CreatePostRequest("free", "글 제목", "본문은 충분히 깁니다 정말로요", List.of(), true));

        reportService.report(created.postId(), reporter,
                new ReportPostRequest(ReportReason.TOXIC, null));

        boolean anyJuryCase = fakeDb.snapshot().keySet().stream().anyMatch(k -> k.startsWith("/jury_cases"));
        assertThat(anyJuryCase).isFalse();
    }
}
