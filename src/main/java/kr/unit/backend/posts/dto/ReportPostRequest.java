package kr.unit.backend.posts.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.unit.backend.posts.domain.ReportReason;

public record ReportPostRequest(
        @NotNull ReportReason reason,
        @Size(max = 200) String detail
) {
}
