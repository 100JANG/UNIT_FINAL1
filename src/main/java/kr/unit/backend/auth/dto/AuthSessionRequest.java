package kr.unit.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthSessionRequest(
        @NotBlank String firebaseIdToken
) {
}
