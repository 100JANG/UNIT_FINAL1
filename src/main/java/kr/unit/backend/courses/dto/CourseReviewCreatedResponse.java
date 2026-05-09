package kr.unit.backend.courses.dto;

public record CourseReviewCreatedResponse(
        String reviewId,
        String courseId,
        CourseStatsView stats
) {
    public record CourseStatsView(long recommend, long notRecommend, long skip, long total, double recommendRate) {
    }
}
