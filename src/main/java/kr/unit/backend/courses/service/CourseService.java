package kr.unit.backend.courses.service;

import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.api.PaginationLimits;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.courses.domain.Course;
import kr.unit.backend.courses.domain.VoteType;
import kr.unit.backend.courses.dto.CourseDetailResponse;
import kr.unit.backend.courses.dto.CourseReviewCreatedResponse;
import kr.unit.backend.courses.dto.CourseSummaryResponse;
import kr.unit.backend.courses.dto.CreateCourseReviewRequest;
import kr.unit.backend.courses.repository.CourseFirebaseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 강의/강의평 도메인 서비스.
 *
 * 핵심 정책 (domain/04_COURSES_REVIEWS_DOMAIN.md):
 *  - 미작성자가 강의 상세를 열람하면 REVIEW_QUOTA_REQUIRED를 반환한다.
 *  - SKIP도 참여율(total) 집계에는 포함, 추천률 계산에는 포함하지 않는다.
 */
@Service
public class CourseService {

    private final CourseFirebaseRepository courseFirebaseRepository;
    private final ClockProvider clockProvider;

    public CourseService(CourseFirebaseRepository courseFirebaseRepository,
                         ClockProvider clockProvider) {
        this.courseFirebaseRepository = courseFirebaseRepository;
        this.clockProvider = clockProvider;
    }

    public CourseDetailResponse getDetail(String courseId, AuthenticatedUser user) {
        Course course = courseFirebaseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!courseFirebaseRepository.hasReviewed(user.userId(), courseId)) {
            throw new BusinessException(ErrorCode.REVIEW_QUOTA_REQUIRED);
        }

        Map<String, Long> stats = courseFirebaseRepository.findStats(courseId);
        long recommend = stats.getOrDefault("recommend", 0L);
        long notRecommend = stats.getOrDefault("notRecommend", 0L);
        long skip = stats.getOrDefault("skip", 0L);
        long total = stats.getOrDefault("total", 0L);
        double recommendRate = computeRecommendRate(recommend, notRecommend);

        return new CourseDetailResponse(
                course.courseId(),
                course.courseName(),
                course.professor(),
                course.semester(),
                recommend,
                notRecommend,
                skip,
                total,
                recommendRate);
    }

    public CourseReviewCreatedResponse createReview(String courseId,
                                                    AuthenticatedUser user,
                                                    CreateCourseReviewRequest request) {
        if (courseFirebaseRepository.findById(courseId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        if (courseFirebaseRepository.hasReviewed(user.userId(), courseId)) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "이미 강의평을 작성했습니다");
        }

        String reviewId = "rv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        courseFirebaseRepository.saveReview(reviewId, courseId, user.userId(),
                request.vote(), request.comment(), clockProvider.now());

        Map<String, Long> stats = courseFirebaseRepository.findStats(courseId);
        long recommend = stats.getOrDefault("recommend", 0L);
        long notRecommend = stats.getOrDefault("notRecommend", 0L);
        long skip = stats.getOrDefault("skip", 0L);
        long total = stats.getOrDefault("total", 0L);
        return new CourseReviewCreatedResponse(
                reviewId,
                courseId,
                new CourseReviewCreatedResponse.CourseStatsView(
                        recommend, notRecommend, skip, total,
                        computeRecommendRate(recommend, notRecommend)));
    }

    /**
     * 강의 검색.
     *
     * <p>MVP 인덱스 기반 구현 정책:
     * <ul>
     *   <li>{@code schoolId}는 필수. 없으면 빈 페이지로 응답한다 (전체 검색 엔진 미구현 — 후속 작업).</li>
     *   <li>정렬은 {@code courseName} ASC만 인덱스 쿼리로 구현. 운영에서는 /courses_by_school/{schoolId}에 .indexOn: ["courseName"] 필요.</li>
     *   <li>{@code semester}는 in-memory 후처리 필터.</li>
     *   <li>{@code q}는 in-memory contains 필터 (courseName 또는 professor 부분 일치).</li>
     * </ul>
     */
    public CursorPageResponse<CourseSummaryResponse> search(
            String q, String schoolId, String semester, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);
        if (schoolId == null || schoolId.isBlank()) {
            return CursorPageResponse.empty();
        }

        List<Course> queried;
        try {
            queried = courseFirebaseRepository.queryBySchoolAsc(schoolId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<Course> page = hasMore ? queried.subList(0, limit) : queried;

        String qLower = q == null || q.isBlank() ? null : q.toLowerCase();
        List<CourseSummaryResponse> items = new ArrayList<>(page.size());
        for (Course course : page) {
            if (semester != null && !semester.isBlank()
                    && (course.semester() == null || !semester.equals(course.semester()))) {
                continue;
            }
            if (qLower != null) {
                String name = course.courseName() == null ? "" : course.courseName().toLowerCase();
                String prof = course.professor() == null ? "" : course.professor().toLowerCase();
                if (!name.contains(qLower) && !prof.contains(qLower)) {
                    continue;
                }
            }
            items.add(CourseSummaryResponse.from(course));
        }

        // cursor advance: query window 마지막 기준(정렬키 = courseName, tie-breaker = courseId)
        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            Course last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encodeString(last.courseName(), last.courseId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    /**
     * 추천률 = recommend / (recommend + notRecommend). SKIP은 분모에 포함하지 않는다.
     * (domain/04: Skip은 참여율 계산에는 포함, 추천률 계산에는 포함하지 않는다.)
     */
    private static double computeRecommendRate(long recommend, long notRecommend) {
        long denom = recommend + notRecommend;
        if (denom == 0L) {
            return 0.0;
        }
        return ((double) recommend) / denom;
    }

    public boolean isSkipUsedForRecommendRate() {
        return false;
    }

    public boolean isSkipUsedForParticipation() {
        return true;
    }

    public VoteType[] supportedVotes() {
        return VoteType.values();
    }
}
