package kr.unit.backend.posts.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.posts.domain.ReportReason;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class PostReportFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public PostReportFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public boolean existsByReporterAndPost(String postId, String reporterId) {
        return realtimeDatabaseClient.get(
                FirebasePath.reportByPost(postId, "by_reporter_" + reporterId), Boolean.class)
                .orElse(false);
    }

    public void save(String reportId,
                     String postId,
                     String reporterId,
                     ReportReason reason,
                     String detail,
                     Instant createdAt) {
        Map<String, Object> reportData = new HashMap<>();
        reportData.put("reportId", reportId);
        reportData.put("postId", postId);
        reportData.put("reporterId", reporterId);
        reportData.put("reason", reason.name());
        reportData.put("detail", detail);
        reportData.put("status", "RECEIVED");
        reportData.put("createdAt", createdAt.toString());

        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put(FirebasePath.report(reportId), reportData);
        updates.put(FirebasePath.reportByPost(postId, reportId), Map.of(
                "reportId", reportId,
                "reporterId", reporterId,
                "createdAt", createdAt.toString()));
        updates.put(FirebasePath.reportByPost(postId, "by_reporter_" + reporterId), true);

        realtimeDatabaseClient.update(updates);
    }

    public Optional<Map<String, Object>> findById(String reportId) {
        return realtimeDatabaseClient.get(FirebasePath.report(reportId), Map.class)
                .map(raw -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> typed = (Map<String, Object>) raw;
                    return typed;
                });
    }
}
