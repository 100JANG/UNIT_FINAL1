package kr.unit.backend.courses.dto;

import kr.unit.backend.courses.domain.Course;

public record CourseSummaryResponse(
        String courseId,
        String schoolId,
        String courseName,
        String professor,
        String semester
) {
    public static CourseSummaryResponse from(Course course) {
        return new CourseSummaryResponse(
                course.courseId(),
                course.schoolId(),
                course.courseName(),
                course.professor(),
                course.semester());
    }
}
