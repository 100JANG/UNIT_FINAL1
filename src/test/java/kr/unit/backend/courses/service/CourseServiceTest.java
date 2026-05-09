package kr.unit.backend.courses.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.courses.domain.VoteType;
import kr.unit.backend.courses.dto.CourseDetailResponse;
import kr.unit.backend.courses.dto.CourseReviewCreatedResponse;
import kr.unit.backend.courses.dto.CreateCourseReviewRequest;
import kr.unit.backend.courses.repository.CourseFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CourseServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private CourseService service;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        CourseFirebaseRepository repo = new CourseFirebaseRepository(fakeDb);
        service = new CourseService(repo, FixedClockProvider.at("2026-05-09T00:00:00Z"));

        fakeDb.set("/courses/c_1", Map.of(
                "courseId", "c_1",
                "schoolId", "ajou",
                "courseName", "데이터구조",
                "professor", "김교수",
                "semester", "2026-1"));
    }

    @Test
    void detail_throwsReviewQuotaRequiredForUserWhoHasNotReviewed() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");

        assertThatThrownBy(() -> service.getDetail("c_1", user))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.REVIEW_QUOTA_REQUIRED);
    }

    @Test
    void detail_succeedsAfterReviewSubmission() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        service.createReview("c_1", user, new CreateCourseReviewRequest(VoteType.RECOMMEND, "좋음"));

        CourseDetailResponse detail = service.getDetail("c_1", user);

        assertThat(detail.courseId()).isEqualTo("c_1");
        assertThat(detail.recommend()).isEqualTo(1L);
        assertThat(detail.total()).isEqualTo(1L);
    }

    @Test
    void skipIsCountedInTotalButNotInRecommendRate() {
        AuthenticatedUser a = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        AuthenticatedUser b = FixtureFactory.authenticated("u_b", "b@ajou.ac.kr");
        AuthenticatedUser c = FixtureFactory.authenticated("u_c", "c@ajou.ac.kr");

        service.createReview("c_1", a, new CreateCourseReviewRequest(VoteType.RECOMMEND, null));
        service.createReview("c_1", b, new CreateCourseReviewRequest(VoteType.NOT_RECOMMEND, null));
        CourseReviewCreatedResponse last =
                service.createReview("c_1", c, new CreateCourseReviewRequest(VoteType.SKIP, null));

        assertThat(last.stats().total()).isEqualTo(3L);
        assertThat(last.stats().skip()).isEqualTo(1L);
        // Skip은 추천률 분모에서 제외됨: 1 / (1+1) = 0.5
        assertThat(last.stats().recommendRate()).isEqualTo(0.5);
    }

    @Test
    void duplicateReviewIsRejected() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        service.createReview("c_1", user, new CreateCourseReviewRequest(VoteType.RECOMMEND, null));
        assertThatThrownBy(() -> service.createReview("c_1", user,
                new CreateCourseReviewRequest(VoteType.NOT_RECOMMEND, null)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getCourses_returnsCursorPage() {
        // /courses_by_school/{schoolId}/{courseId} 인덱스에 직접 시드. courseName ASC 정렬.
        fakeDb.set("/courses_by_school/ajou/c_ds", Map.of(
                "courseId", "c_ds", "courseName", "데이터구조", "professor", "김교수", "semester", "2026-1"));
        fakeDb.set("/courses_by_school/ajou/c_alg", Map.of(
                "courseId", "c_alg", "courseName", "알고리즘", "professor", "박교수", "semester", "2026-1"));
        fakeDb.set("/courses_by_school/ajou/c_os", Map.of(
                "courseId", "c_os", "courseName", "운영체제", "professor", "이교수", "semester", "2026-1"));

        // ASC by courseName: 데이터구조 < 알고리즘 < 운영체제
        var page1 = service.search(null, "ajou", null, null, 2);
        assertThat(page1.items()).extracting(r -> r.courseId())
                .containsExactly("c_ds", "c_alg");
        assertThat(page1.pagination().hasMore()).isTrue();
        assertThat(page1.pagination().cursor()).isNotBlank();

        var page2 = service.search(null, "ajou", null, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(r -> r.courseId())
                .containsExactly("c_os");
        assertThat(page2.pagination().hasMore()).isFalse();
    }

    @Test
    void getCourses_limitClampedToFifty() {
        for (int i = 0; i < 60; i++) {
            String courseId = String.format("c_%03d", i);
            // courseName을 zero-padded로 만들어 안정 정렬되게 한다 (lexicographic ASC).
            String name = String.format("강의-%03d", i);
            fakeDb.set("/courses_by_school/ajou/" + courseId, Map.of(
                    "courseId", courseId, "courseName", name, "professor", "교수",
                    "semester", "2026-1"));
        }

        var page = service.search(null, "ajou", null, null, 999);
        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }
}
