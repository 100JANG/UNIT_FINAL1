package kr.unit.backend.jury.domain;

import java.time.Instant;
import java.util.List;

public record JuryCase(
        String caseId,
        String departmentId,
        JuryCaseStatus status,
        List<String> summonedJurors,
        Instant createdAt,
        Instant closesAt
) {
}
