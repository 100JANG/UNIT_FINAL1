package kr.unit.backend.courses.controller;

import jakarta.validation.Valid;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.courses.dto.CourseDetailResponse;
import kr.unit.backend.courses.dto.CourseReviewCreatedResponse;
import kr.unit.backend.courses.dto.CourseSummaryResponse;
import kr.unit.backend.courses.dto.CreateCourseReviewRequest;
import kr.unit.backend.courses.service.CourseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    /**
     * 강의 검색. /courses_by_school/{schoolId} 인덱스를 courseName ASC로 조회한다.
     *
     * <p>Query parameters:
     * <ul>
     *   <li>{@code q}: 검색어 (courseName/professor 부분 일치, in-memory 후처리).</li>
     *   <li>{@code schoolId}: 필수. 없으면 빈 페이지.</li>
     *   <li>{@code semester}: 학기 필터 (정확 일치, in-memory 후처리).</li>
     *   <li>{@code cursor}: 다음 페이지 cursor.</li>
     *   <li>{@code limit}: 기본 20, 최대 50.</li>
     * </ul>
     */
    @GetMapping
    public ApiResponse<CursorPageResponse<CourseSummaryResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(courseService.search(q, schoolId, semester, cursor, limit));
    }

    @GetMapping("/{courseId}")
    public ApiResponse<CourseDetailResponse> detail(
            @PathVariable String courseId,
            @AuthUser AuthenticatedUser user) {
        return ApiResponse.success(courseService.getDetail(courseId, user));
    }

    @PostMapping("/{courseId}/reviews")
    public ApiResponse<CourseReviewCreatedResponse> createReview(
            @PathVariable String courseId,
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody CreateCourseReviewRequest request) {
        return ApiResponse.success("강의평이 등록되었습니다",
                courseService.createReview(courseId, user, request));
    }
}
