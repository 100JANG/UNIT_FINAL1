package kr.unit.backend.courses.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.unit.backend.courses.domain.VoteType;

public record CreateCourseReviewRequest(
        @NotNull VoteType vote,
        @Size(max = 200) String comment
) {
}
