package kr.unit.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRefreshRequest(
        @NotBlank String sessionToken
) {
}
