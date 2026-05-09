package kr.unit.backend.jury.dto;

import kr.unit.backend.jury.domain.JuryCase;

import java.time.Instant;
import java.util.List;

public record JuryCaseResponse(
        String caseId,
        String departmentId,
        String status,
        List<String> summonedJurors,
        Instant createdAt,
        Instant closesAt
) {
    public static JuryCaseResponse from(JuryCase juryCase) {
        return new JuryCaseResponse(
                juryCase.caseId(),
                juryCase.departmentId(),
                juryCase.status().name(),
                juryCase.summonedJurors(),
                juryCase.createdAt(),
                juryCase.closesAt());
    }
}
