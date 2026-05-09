package kr.unit.backend.jury.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.jury.domain.JuryCase;
import kr.unit.backend.jury.domain.JuryCaseStatus;
import kr.unit.backend.jury.domain.JuryVerdict;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Jury 도메인 RTDB 어댑터.
 *
 * 명시적 금지 (domain/05): 신고 직후 자동 case 생성, AI 판정에 따른 자동 jury 호출.
 * 이 Repository는 수동/관리자가 만든 case의 조회와 투표 기록만 담당한다.
 */
@Repository
public class JuryFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public JuryFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public Optional<JuryCase> findCase(String caseId) {
        return realtimeDatabaseClient.get(FirebasePath.juryCase(caseId), Map.class)
                .map(raw -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) raw;
                    @SuppressWarnings("unchecked")
                    List<String> jurors = (List<String>) data.getOrDefault("summonedJurors", List.of());
                    return new JuryCase(
                            caseId,
                            str(data.get("departmentId")),
                            parseStatus(str(data.get("status"))),
                            jurors == null ? List.of() : jurors,
                            parseInstant(str(data.get("createdAt"))),
                            parseInstant(str(data.get("closesAt"))));
                });
    }

    public boolean hasVoted(String caseId, String userId) {
        return realtimeDatabaseClient.get(FirebasePath.juryVote(caseId, userId), Map.class).isPresent();
    }

    public long recordVote(String caseId, String userId, JuryVerdict verdict, Instant at) {
        Map<String, Object> vote = new HashMap<>();
        vote.put("userId", userId);
        vote.put("verdict", verdict.name());
        vote.put("createdAt", at.toString());
        realtimeDatabaseClient.set(FirebasePath.juryVote(caseId, userId), vote);

        String statsBase = FirebasePath.juryCaseStats(caseId);
        return realtimeDatabaseClient.increment(
                statsBase + "/" + (verdict == JuryVerdict.PROBLEMATIC ? "problematic" : "ok"),
                1L);
    }

    public Map<String, Long> findStats(String caseId) {
        return realtimeDatabaseClient.get(FirebasePath.juryCaseStats(caseId), Map.class)
                .map(raw -> {
                    Map<?, ?> data = (Map<?, ?>) raw;
                    return Map.of(
                            "problematic", asLong(data.get("problematic")),
                            "ok", asLong(data.get("ok")));
                })
                .orElse(Map.of("problematic", 0L, "ok", 0L));
    }

    private static JuryCaseStatus parseStatus(String raw) {
        if (raw == null) {
            return JuryCaseStatus.RESERVED;
        }
        try {
            return JuryCaseStatus.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return JuryCaseStatus.RESERVED;
        }
    }

    private static String str(Object v) {
        return v == null ? null : v.toString();
    }

    private static Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(raw);
        } catch (Exception ex) {
            return null;
        }
    }

    private static long asLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }
}
