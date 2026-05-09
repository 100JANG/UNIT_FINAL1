package kr.unit.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * RTDB Security Rules 정합성 정적 검증.
 *
 * 본 테스트는 프로젝트 루트의 {@code database.rules.json}을 파싱해 다음을 강제한다:
 *  - root default-deny (read/write false)
 *  - 본인-소유 경로의 read 조건 (auth.uid == $userId)
 *  - 코드의 queryByChild 호출 field와 .indexOn 일치 (database/03 §5 단일 출처)
 *  - 어떤 경로도 client write를 허용하지 않음
 *  - 금지 경로(ai/ocr/gemma/recap/moderation/student_registry/pwa/service_worker)가 룰에 등장하지 않음
 *
 * 운영 배포 전 review 단계의 last-line guardrail이다. 한 항목이라도 어긋나면 빌드가 깨진다.
 */
class SecurityRulesContractTest {

    private static final Path RULES_FILE = Paths.get("database.rules.json");
    private static JsonNode root;
    private static JsonNode rules;
    private static String rawJson;

    @BeforeAll
    static void loadRules() throws IOException {
        assertThat(Files.exists(RULES_FILE))
                .as("database.rules.json must exist at project root")
                .isTrue();
        rawJson = Files.readString(RULES_FILE);
        root = new ObjectMapper().readTree(rawJson);
        rules = root.path("rules");
        assertThat(rules.isObject())
                .as("rules.json must contain a top-level 'rules' object")
                .isTrue();
    }

    @Test
    void rootDefaultsAreDeny() {
        assertThat(rules.path(".read").asText("")).isEqualTo("false");
        assertThat(rules.path(".write").asText("")).isEqualTo("false");
    }

    @Test
    void selfOwnedPathsRequireAuthUidMatch() {
        Set<String> selfOwnedRoots = Set.of(
                "users", "sessions", "fcm_tokens",
                "review_locks",
                "notifications",
                "user_posts", "user_comments", "user_likes", "user_scraps", "user_stats");

        for (String name : selfOwnedRoots) {
            JsonNode node = rules.path(name).path("$userId");
            assertThat(node.isObject())
                    .as("rules.%s.$userId must be defined", name)
                    .isTrue();
            String readRule = node.path(".read").asText("");
            assertThat(readRule)
                    .as("rules.%s.$userId .read must require auth.uid == $userId", name)
                    .isEqualTo("auth != null && auth.uid == $userId");
        }
    }

    @Test
    void postFeedsAreReadableByAuthenticatedUsers() {
        // /post_feeds/all
        JsonNode all = rules.path("post_feeds").path("all");
        assertThat(all.path(".read").asText("")).isEqualTo("auth != null");
        assertThat(all.path(".write").asText("")).isEqualTo("false");

        // /post_feeds/schools/$schoolId
        JsonNode schools = rules.path("post_feeds").path("schools").path("$schoolId");
        assertThat(schools.path(".read").asText("")).isEqualTo("auth != null");
        assertThat(schools.path(".write").asText("")).isEqualTo("false");

        // /post_feeds/departments/$departmentId
        JsonNode depts = rules.path("post_feeds").path("departments").path("$departmentId");
        assertThat(depts.path(".read").asText("")).isEqualTo("auth != null");
        assertThat(depts.path(".write").asText("")).isEqualTo("false");
    }

    @Test
    void reportsAreNotClientReadable() {
        // /reports/{reportId}, /reports_by_post/{postId} 모두 read=false
        assertThat(rules.path("reports").path("$reportId").path(".read").asText(""))
                .isEqualTo("false");
        assertThat(rules.path("reports_by_post").path("$postId").path(".read").asText(""))
                .isEqualTo("false");
    }

    @Test
    void noClientWriteIsEverPermitted() {
        // 트리 전체를 순회하며 ".write" 키가 "false"가 아닌 값이면 실패.
        List<String> violations = new ArrayList<>();
        collectWriteViolations(rules, "/", violations);
        assertThat(violations)
                .as("no path may set client write to anything other than \"false\"")
                .isEmpty();
    }

    @Test
    void indexOnMatchesCodeQueryFields() {
        // database/03 §5와 일치해야 한다. 코드의 queryByChild 호출 field와 1:1.
        assertIndexOnContains(rules.path("post_feeds").path("all"),
                "createdAt", "hotScore", "commentCount");
        assertIndexOnContains(rules.path("post_feeds").path("schools").path("$schoolId"),
                "createdAt", "hotScore", "commentCount");
        assertIndexOnContains(rules.path("post_feeds").path("departments").path("$departmentId"),
                "createdAt", "hotScore", "commentCount");

        assertIndexOnContains(rules.path("comments").path("$postId"), "createdAt");

        assertIndexOnContains(rules.path("courses_by_school").path("$schoolId"),
                "courseName", "professor", "semester");

        assertIndexOnContains(rules.path("user_posts").path("$userId"), "createdAt");
        assertIndexOnContains(rules.path("user_comments").path("$userId"), "createdAt");
        assertIndexOnContains(rules.path("user_likes").path("$userId"), "likedAt");
        assertIndexOnContains(rules.path("user_scraps").path("$userId"), "scrappedAt");
        assertIndexOnContains(rules.path("notifications").path("$userId"), "createdAt", "isRead");
    }

    @Test
    void bannedPathsAreNotPresent() {
        // Reserved 기능 root 경로가 룰에 등장하면 안 된다 (default-deny 유지).
        Set<String> banned = Set.of(
                "ai", "ocr", "gemma", "recap", "recaps", "recap_jobs",
                "moderation", "moderation_results", "moderation_rules",
                "student_registry", "pwa", "service_worker",
                "ai_refine", "ai_judgments", "ocr_results");
        for (String name : banned) {
            assertThat(rules.has(name))
                    .as("rules.%s must NOT be defined (Reserved/banned path)", name)
                    .isFalse();
        }
    }

    @Test
    void rawJsonHasNoTrueLiteralForReadOrWrite() {
        // 추가 안전망: ".read": true / ".write": true 가 텍스트 단계에서도 없어야 한다.
        // (auth-conditional read는 string 형태이므로 true 리터럴은 절대 의도된 것이 아니다.)
        assertThat(rawJson).doesNotContain("\".read\": true");
        assertThat(rawJson).doesNotContain("\".write\": true");
    }

    private static void assertIndexOnContains(JsonNode node, String... requiredFields) {
        JsonNode indexOn = node.path(".indexOn");
        assertThat(indexOn.isArray())
                .as("'.indexOn' must be an array at path %s", node)
                .isTrue();
        List<String> fields = new ArrayList<>();
        indexOn.forEach(f -> fields.add(f.asText()));
        for (String required : requiredFields) {
            assertThat(fields)
                    .as("'.indexOn' must include %s", required)
                    .contains(required);
        }
    }

    private static void collectWriteViolations(JsonNode node, String prefix, List<String> out) {
        if (!node.isObject()) {
            return;
        }
        node.fields().forEachRemaining(entry -> {
            String key = entry.getKey();
            JsonNode value = entry.getValue();
            String childPath = prefix + key;
            if (".write".equals(key)) {
                String text = value.asText("");
                if (!"false".equals(text)) {
                    out.add(childPath + " = " + text);
                }
            } else if (value.isObject()) {
                collectWriteViolations(value, childPath + "/", out);
            }
        });
    }
}
