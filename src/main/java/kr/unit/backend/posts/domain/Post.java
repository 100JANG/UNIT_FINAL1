package kr.unit.backend.posts.domain;

import java.time.Instant;
import java.util.List;

public record Post(
        String postId,
        String boardId,
        String schoolId,
        String departmentId,
        String authorId,
        String anonymousId,
        String title,
        String content,
        List<String> tags,
        Visibility visibility,
        Status status,
        Instant createdAt,
        Instant updatedAt
) {
    public enum Visibility {
        PUBLIC,
        SCHOOL,
        DEPARTMENT
    }

    public enum Status {
        PUBLISHED,
        DELETED_BY_AUTHOR,
        REMOVED_BY_ADMIN
    }
}
