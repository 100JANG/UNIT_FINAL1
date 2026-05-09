package kr.unit.backend.jury.dto;

public record JuryVoteResponse(
        String caseId,
        String userId,
        String verdict,
        long problematicVotes,
        long okVotes
) {
}
