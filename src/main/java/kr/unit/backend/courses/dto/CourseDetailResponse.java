package kr.unit.backend.courses.dto;

public record CourseDetailResponse(
        String courseId,
        String courseName,
        String professor,
        String semester,
        long recommend,
        long notRecommend,
        long skip,
        long total,
        double recommendRate
) {
}
