package kr.unit.backend.courses.repository;

import kr.unit.backend.courses.domain.Course;
import kr.unit.backend.courses.domain.VoteType;
import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CourseFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public CourseFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public Optional<Course> findById(String courseId) {
        return realtimeDatabaseClient.get(FirebasePath.course(courseId), Map.class)
                .map(raw -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) raw;
                    return new Course(
                            courseId,
                            str(data.get("schoolId")),
                            str(data.get("courseName")),
                            str(data.get("professor")),
                            str(data.get("semester")));
                });
    }

    public boolean hasReviewed(String userId, String courseId) {
        return realtimeDatabaseClient.get(FirebasePath.reviewLock(userId, courseId), Boolean.class)
                .orElse(false);
    }

    /**
     * /courses_by_school/{schoolId}를 courseName ASC 인덱스로 페이지 조회한다.
     * 운영 RTDB에서는 .indexOn: ["courseName"] 필요. 호출 측은 limit+1 패턴으로 hasMore 판정.
     *
     * 인덱스 노드 entry 구조 (예시): { courseId, courseName, professor, semester }
     */
    public List<Course> queryBySchoolAsc(String schoolId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildAsc(
                FirebasePath.coursesBySchoolRoot(schoolId), "courseName", cursor, limitPlusOne, Map.class);
        List<Course> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(new Course(
                    str(data.getOrDefault("courseId", entry.key())),
                    schoolId,
                    str(data.get("courseName")),
                    str(data.get("professor")),
                    str(data.get("semester"))));
        }
        return result;
    }

    public void saveReview(String reviewId,
                           String courseId,
                           String userId,
                           VoteType vote,
                           String comment,
                           Instant createdAt) {
        Map<String, Object> review = new HashMap<>();
        review.put("reviewId", reviewId);
        review.put("courseId", courseId);
        review.put("userId", userId);
        review.put("vote", vote.name());
        review.put("comment", comment);
        review.put("createdAt", createdAt.toString());

        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put(FirebasePath.courseReview(courseId, reviewId), review);
        updates.put(FirebasePath.reviewLock(userId, courseId), true);
        realtimeDatabaseClient.update(updates);

        String statsBase = FirebasePath.courseStats(courseId);
        switch (vote) {
            case RECOMMEND -> realtimeDatabaseClient.increment(statsBase + "/recommend", 1L);
            case NOT_RECOMMEND -> realtimeDatabaseClient.increment(statsBase + "/notRecommend", 1L);
            case SKIP -> realtimeDatabaseClient.increment(statsBase + "/skip", 1L);
        }
        realtimeDatabaseClient.increment(statsBase + "/total", 1L);
    }

    public Map<String, Long> findStats(String courseId) {
        return realtimeDatabaseClient.get(FirebasePath.courseStats(courseId), Map.class)
                .map(raw -> {
                    Map<?, ?> data = (Map<?, ?>) raw;
                    return Map.of(
                            "recommend", asLong(data.get("recommend")),
                            "notRecommend", asLong(data.get("notRecommend")),
                            "skip", asLong(data.get("skip")),
                            "total", asLong(data.get("total")));
                })
                .orElse(Map.of("recommend", 0L, "notRecommend", 0L, "skip", 0L, "total", 0L));
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

    private static String str(Object v) {
        return v == null ? null : v.toString();
    }
}
