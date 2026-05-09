package kr.unit.backend.courses.domain;

public record Course(
        String courseId,
        String schoolId,
        String courseName,
        String professor,
        String semester
) {
}
