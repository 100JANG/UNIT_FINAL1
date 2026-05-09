package kr.unit.backend.jury.dto;

import jakarta.validation.constraints.NotNull;
import kr.unit.backend.jury.domain.JuryVerdict;

public record JuryVoteRequest(
        @NotNull JuryVerdict verdict
) {
}
