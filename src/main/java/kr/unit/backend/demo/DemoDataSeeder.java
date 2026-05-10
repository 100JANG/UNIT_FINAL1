package kr.unit.backend.demo;

import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
//
// app.demo.enabled=true 일 때만 ApplicationRunner 빈이 등록된다. 운영 프로파일에서는
// 빈 자체가 만들어지지 않으므로 절대 데이터가 심어지지 않는다.
//
// Seeder는 RealtimeDatabaseClient 인터페이스를 통해서만 데이터를 쓴다 — 운영에서는
// FirebaseAdminRealtimeDatabaseClient (실 RTDB), 데모 기본값에서는 InMemoryRealtimeDatabaseClient
// (인메모리) 가 받아내므로 한 번만 작성하면 두 환경 모두 호환된다. 다만 운영에서 demo 활성을
// 켜는 일은 없어야 한다 (운영 모드 차단).
@Configuration
@ConditionalOnProperty(prefix = "app.demo", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(DemoProperties.class)
public class DemoDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    @Bean
    public ApplicationRunner demoDataSeederRunner(DemoProperties demo,
                                                  RealtimeDatabaseClient rtdb,
                                                  UserAccountRepository userAccountRepository,
                                                  ClockProvider clockProvider) {
        return args -> seed(demo, rtdb, userAccountRepository, clockProvider);
    }

    static void seed(DemoProperties demo,
                     RealtimeDatabaseClient rtdb,
                     UserAccountRepository userAccountRepository,
                     ClockProvider clockProvider) {
        Instant now = clockProvider.now();
        log.info("Seeding demo data: userId={} schoolId={} departmentId={}",
                demo.userId(), demo.schoolId(), demo.departmentId());

        seedSchoolMeta(rtdb, demo);
        seedDemoUser(userAccountRepository, demo, now);
        List<String> postIds = seedPosts(rtdb, demo, now);
        seedComments(rtdb, demo, postIds, now);
        seedNotifications(rtdb, demo, now);
        seedCourses(rtdb, demo);

        log.info("Seeding demo data: done. {} posts, {} courses, demo user={}",
                postIds.size(), 6, demo.userId());
    }

    // -----------------------------------------------------------------------

    private static void seedSchoolMeta(RealtimeDatabaseClient rtdb, DemoProperties demo) {
        rtdb.set(FirebasePath.school(demo.schoolId()),
                Map.of("schoolId", demo.schoolId(), "name", demo.schoolName()));
        rtdb.set(FirebasePath.department(demo.departmentId()),
                Map.of(
                        "departmentId", demo.departmentId(),
                        "schoolId", demo.schoolId(),
                        "name", demo.departmentName()));
    }

    private static void seedDemoUser(UserAccountRepository repo, DemoProperties demo, Instant now) {
        UserAccount account = new UserAccount(
                demo.userId(),
                demo.userEmail(),
                demo.userName(),
                demo.schoolId(),
                demo.departmentId(),
                demo.studentNumberMasked(),
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now,
                now);
        repo.save(account);
    }

    // -----------------------------------------------------------------------
    // 게시글 12개. 자유 7 + 학과 5 (학과 글은 /post_feeds/departments/test_sw 에도 등재).

    private static final List<String> FREE_BOARD_TITLES = List.of(
            "[시연] 기숙사 식단 어떻게 생각하세요?",
            "[시연] 중간고사 끝났는데 다들 어디 놀러가요",
            "[시연] 수강신청 팁 공유합니다",
            "[시연] 학교 근처 카페 추천 받습니다",
            "[시연] 동아리 가입 시기 다들 언제였나요",
            "[시연] 자취방 보일러 고장났을 때 대처법",
            "[시연] 요즘 공강시간에 뭐 하시나요"
    );

    private static final List<String> FREE_BOARD_PREVIEWS = List.of(
            "이번 학기 식단 개편이 있었는데 후기 공유해요.",
            "시험 끝나면 다들 어디로 떠나는지 궁금해서 글 남깁니다.",
            "수강신청 직전에 도움이 되는 작은 팁 몇 가지를 나눕니다.",
            "도서관 근처에 새로 생긴 곳 가본 분 계신가요.",
            "1학년 때 가입했는데 요즘 들어오는 분들 시기가 다른 것 같아서요.",
            "겨울에 보일러 고장나면 어디에 연락해야 하는지 정리합니다.",
            "공강에 카페 가서 책 보는 게 가장 흔한가요?"
    );

    private static final List<String> DEPT_BOARD_TITLES = List.of(
            "[시연] 데이터구조 과제 같이 풀어볼 사람",
            "[시연] 알고리즘 시험 범위 공지",
            "[시연] OS 프로젝트 팀원 구합니다",
            "[시연] 졸업프로젝트 주제 추천",
            "[시연] 컴퓨터구조 교수님 강의 후기"
    );

    private static final List<String> DEPT_BOARD_PREVIEWS = List.of(
            "동기 분 중에 같이 도서관에서 풀 분 계실까요?",
            "조교 공지에 따르면 7장까지라고 하네요. 정리한 자료 공유합니다.",
            "스터디 인원 외에 프로젝트 팀 더 필요해요. DM 주세요.",
            "선배들 추천 주제 모아봤습니다. 의견 환영합니다.",
            "이번 학기 들으면서 느낀 점을 짧게 남깁니다."
    );

    private static List<String> seedPosts(RealtimeDatabaseClient rtdb, DemoProperties demo, Instant now) {
        java.util.ArrayList<String> postIds = new java.util.ArrayList<>();

        for (int i = 0; i < FREE_BOARD_TITLES.size(); i++) {
            String postId = "demo_post_free_" + (i + 1);
            Instant createdAt = now.minus((long) (i + 1) * 30, ChronoUnit.MINUTES);
            writePost(rtdb, demo, postId, "free", "자유게시판",
                    FREE_BOARD_TITLES.get(i), FREE_BOARD_PREVIEWS.get(i),
                    /* postsToDept */ false, createdAt);
            postIds.add(postId);
        }

        for (int i = 0; i < DEPT_BOARD_TITLES.size(); i++) {
            String postId = "demo_post_dept_" + (i + 1);
            Instant createdAt = now.minus((long) (i + 1) * 45, ChronoUnit.MINUTES);
            writePost(rtdb, demo, postId, "dept_sw", "소프트웨어학과",
                    DEPT_BOARD_TITLES.get(i), DEPT_BOARD_PREVIEWS.get(i),
                    /* postsToDept */ true, createdAt);
            postIds.add(postId);
        }
        return postIds;
    }

    private static void writePost(RealtimeDatabaseClient rtdb,
                                  DemoProperties demo,
                                  String postId,
                                  String boardId,
                                  String boardName,
                                  String title,
                                  String preview,
                                  boolean postsToDept,
                                  Instant createdAt) {
        long createdAtMillis = createdAt.toEpochMilli();
        String iso = createdAt.toString();
        String anonymousId = "익명_" + postId.substring(postId.length() - 4);

        // 본문 노드
        Map<String, Object> postBody = new HashMap<>();
        postBody.put("postId", postId);
        postBody.put("boardId", boardId);
        postBody.put("boardName", boardName);
        postBody.put("title", title);
        postBody.put("content", preview + "\n\n— 시연용 더미 본문입니다.");
        postBody.put("preview", preview);
        postBody.put("tags", List.of("시연", boardId));
        postBody.put("anonymousId", anonymousId);
        postBody.put("authorId", demo.userId());
        postBody.put("schoolId", demo.schoolId());
        postBody.put("departmentId", demo.departmentId());
        postBody.put("visibility", "PUBLIC");
        postBody.put("status", "PUBLISHED");
        postBody.put("createdAt", iso);
        postBody.put("updatedAt", iso);
        postBody.put("createdAtMillis", createdAtMillis);
        rtdb.set(FirebasePath.post(postId), postBody);

        // Feed 인덱스 (createdAtMillis 로 DESC 정렬)
        Map<String, Object> feedEntry = Map.of(
                "postId", postId,
                "boardId", boardId,
                "boardName", boardName,
                "title", title,
                "preview", preview,
                "anonymousId", anonymousId,
                "createdAt", iso,
                "createdAtMillis", createdAtMillis);
        rtdb.set(FirebasePath.postFeedAll(postId), feedEntry);
        rtdb.set(FirebasePath.postFeedSchool(demo.schoolId(), postId), feedEntry);
        if (postsToDept) {
            rtdb.set(FirebasePath.postFeedDepartment(demo.departmentId(), postId), feedEntry);
        }

        // user_posts 인덱스
        rtdb.set(FirebasePath.userPost(demo.userId(), postId),
                Map.of("postId", postId, "createdAt", iso, "createdAtMillis", createdAtMillis));

        // 통계
        long likes = (postId.hashCode() & 0x1F);   // 0~31 더미 분포
        long comments = (postId.hashCode() & 0x07); // 0~7
        long scraps = (postId.hashCode() & 0x03);   // 0~3
        Map<String, Object> stats = new HashMap<>();
        stats.put("likes", likes);
        stats.put("comments", comments);
        stats.put("scraps", scraps);
        rtdb.set(FirebasePath.postStats(postId), stats);
    }

    // -----------------------------------------------------------------------

    private static final List<String> COMMENT_BODIES = List.of(
            "시연용 더미 댓글입니다 1.",
            "이번 글에 한마디 보탭니다 — 시연용 더미 2.",
            "공감합니다, 시연용 더미 댓글 3.",
            "정보 감사합니다 (시연용 더미 4).",
            "추가로 알려주실 분 계신가요? — 시연용 더미 5."
    );

    private static void seedComments(RealtimeDatabaseClient rtdb, DemoProperties demo,
                                     List<String> postIds, Instant now) {
        // 처음 4개 게시글에만 댓글을 단다 (시연 트래픽 충분).
        int targets = Math.min(4, postIds.size());
        for (int p = 0; p < targets; p++) {
            String postId = postIds.get(p);
            int count = 2 + (p % 3); // 2, 3, 4, 2 ...
            for (int i = 0; i < count; i++) {
                String commentId = "demo_cmt_" + postId + "_" + (i + 1);
                Instant createdAt = now.minus(i * 7L, ChronoUnit.MINUTES);
                String iso = createdAt.toString();
                long createdAtMillis = createdAt.toEpochMilli();
                String anonymousId = "익명_c" + (i + 1);

                Map<String, Object> body = new HashMap<>();
                body.put("commentId", commentId);
                body.put("postId", postId);
                body.put("anonymousId", anonymousId);
                body.put("authorId", demo.userId());
                body.put("content", COMMENT_BODIES.get(i % COMMENT_BODIES.size()));
                body.put("parentCommentId", null);
                body.put("deleted", false);
                body.put("likes", (commentId.hashCode() & 0x07));
                body.put("createdAt", iso);
                body.put("createdAtMillis", createdAtMillis);
                rtdb.set(FirebasePath.comment(postId, commentId), body);

                rtdb.set(FirebasePath.commentStats(commentId),
                        Map.of("likes", (long) (commentId.hashCode() & 0x07)));
                rtdb.set(FirebasePath.userComment(demo.userId(), commentId),
                        Map.of("commentId", commentId, "postId", postId,
                                "createdAt", iso, "createdAtMillis", createdAtMillis));
            }
        }
    }

    // -----------------------------------------------------------------------

    private static void seedNotifications(RealtimeDatabaseClient rtdb, DemoProperties demo, Instant now) {
        record Item(String id, String type, String title, String body, long minutesAgo) {}
        List<Item> items = List.of(
                new Item("demo_notif_1", "POST_COMMENT", "내 글에 댓글이 달렸어요", "익명1 · 시연용 더미 댓글입니다.", 3),
                new Item("demo_notif_2", "POST_LIKE", "내 댓글이 좋아요를 받았어요", "시연용 더미 알림입니다.", 18),
                new Item("demo_notif_3", "JURY_SUMMON", "배심원으로 호출되었어요", "24시간 안에 한 표 부탁드립니다 (시연용).", 65),
                new Item("demo_notif_4", "SYSTEM", "시연이 시작됐어요", "Demo Mode 환경에서 동작 중입니다.", 240)
        );

        for (Item it : items) {
            Instant createdAt = now.minus(it.minutesAgo(), ChronoUnit.MINUTES);
            String iso = createdAt.toString();
            long createdAtMillis = createdAt.toEpochMilli();
            Map<String, Object> body = new HashMap<>();
            body.put("notificationId", it.id());
            body.put("type", it.type());
            body.put("title", it.title());
            body.put("body", it.body());
            body.put("isRead", false);
            body.put("createdAt", iso);
            body.put("createdAtMillis", createdAtMillis);
            rtdb.set(FirebasePath.notification(demo.userId(), it.id()), body);
        }
    }

    // -----------------------------------------------------------------------

    private static final List<String[]> COURSE_ROWS = List.of(
            new String[]{"demo_course_1", "데이터구조", "김교수", "2026-1"},
            new String[]{"demo_course_2", "알고리즘", "이교수", "2026-1"},
            new String[]{"demo_course_3", "운영체제", "박교수", "2026-1"},
            new String[]{"demo_course_4", "컴퓨터구조", "정교수", "2026-1"},
            new String[]{"demo_course_5", "데이터베이스", "최교수", "2026-1"},
            new String[]{"demo_course_6", "소프트웨어공학", "한교수", "2026-1"}
    );

    private static void seedCourses(RealtimeDatabaseClient rtdb, DemoProperties demo) {
        for (int i = 0; i < COURSE_ROWS.size(); i++) {
            String[] row = COURSE_ROWS.get(i);
            String courseId = row[0];
            String courseName = row[1];
            String professor = row[2];
            String semester = row[3];

            long recommend = 8 + i * 2;
            long notRecommend = 1 + i;
            long skip = 1;
            long total = recommend + notRecommend + skip;
            double recommendRate = (double) recommend / Math.max(1L, recommend + notRecommend);

            Map<String, Object> course = new HashMap<>();
            course.put("courseId", courseId);
            course.put("schoolId", demo.schoolId());
            course.put("courseName", courseName);
            course.put("professor", professor);
            course.put("semester", semester);
            rtdb.set(FirebasePath.course(courseId), course);
            rtdb.set(FirebasePath.courseBySchool(demo.schoolId(), courseId), course);

            Map<String, Object> stats = new HashMap<>();
            stats.put("recommend", recommend);
            stats.put("notRecommend", notRecommend);
            stats.put("skip", skip);
            stats.put("total", total);
            stats.put("recommendRate", recommendRate);
            rtdb.set(FirebasePath.courseStats(courseId), stats);

            // demo 사용자가 첫 강의평을 작성한 상태로 둬서 미작성자 422 우회.
            // (CourseDetail 진입 시 REVIEW_QUOTA_REQUIRED 가 뜨면 시연 흐름이 끊김)
            rtdb.set(FirebasePath.reviewLock(demo.userId(), courseId),
                    Map.of("submittedAt", Instant.now().toString()));
        }
    }
}
// DEMO_MODE_END
