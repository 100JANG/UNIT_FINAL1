package kr.unit.backend.demo;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class DemoDataSeederTest {

    private FakeRealtimeDatabaseClient db;
    private UserAccountRepository userRepo;
    private DemoProperties props;
    private FixedClockProvider clock;

    @BeforeEach
    void setUp() {
        db = new FakeRealtimeDatabaseClient();
        userRepo = new UserAccountRepository(db);
        clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        // Use defaults defined in DemoProperties record (passes blank, gets fallback values).
        props = new DemoProperties(true, null, null, null, null, null, null, null, null);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readMap(String path) {
        Optional<Map> raw = db.get(path, Map.class);
        return raw.map(m -> (Map<String, Object>) m).orElseThrow();
    }

    @SuppressWarnings("unchecked")
    private Optional<Map<String, Object>> readMapOpt(String path) {
        return db.get(path, Map.class).map(m -> (Map<String, Object>) m);
    }

    @Test
    void seed_persistsDemoUserSchoolAndDepartment() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        Map<String, Object> user = readMap(FirebasePath.user("demo_user_001"));
        assertThat(user).containsEntry("schoolId", "test");
        assertThat(user).containsEntry("departmentId", "test_sw");
        assertThat(user).containsEntry("studentVerificationStatus", "RESERVED");
        assertThat(user).containsEntry("status", "ACTIVE");

        assertThat(readMap(FirebasePath.school("test"))).containsEntry("name", "테스트대학교");

        Map<String, Object> dept = readMap(FirebasePath.department("test_sw"));
        assertThat(dept).containsEntry("name", "소프트웨어학과");
        assertThat(dept).containsEntry("schoolId", "test");
    }

    @Test
    void seed_populatesFeedIndexes() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        // 12 posts seeded (7 free + 5 dept).
        assertThat(readMap(FirebasePath.postFeedAllRoot())).hasSize(12);
        assertThat(readMap(FirebasePath.postFeedSchoolRoot("test"))).hasSize(12);
        // Only the 5 department posts land here.
        assertThat(readMap(FirebasePath.postFeedDepartmentRoot("test_sw"))).hasSize(5);
    }

    @Test
    void seed_writesPostStatsForEverySeededPost() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        Map<String, Object> feedAll = readMap(FirebasePath.postFeedAllRoot());
        for (String postId : feedAll.keySet()) {
            Map<String, Object> stats = readMap(FirebasePath.postStats(postId));
            assertThat(stats).containsKeys("likes", "comments", "scraps");
        }
    }

    @Test
    void seed_addsCommentsToFirstFewPosts() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        Map<String, Object> feedAll = readMap(FirebasePath.postFeedAllRoot());
        int totalComments = 0;
        for (String postId : feedAll.keySet()) {
            Optional<Map<String, Object>> commentRoot = readMapOpt(FirebasePath.postCommentsRoot(postId));
            if (commentRoot.isPresent()) totalComments += commentRoot.get().size();
        }
        assertThat(totalComments).isGreaterThanOrEqualTo(8); // 2+3+4+2 minimum across 4 seeded posts
    }

    @Test
    void seed_addsNotificationsForDemoUser() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        Map<String, Object> notifs = readMap(FirebasePath.userNotificationsRoot("demo_user_001"));
        assertThat(notifs).hasSize(4);
    }

    @Test
    void seed_populatesCoursesAndUnlocksReviews() {
        DemoDataSeeder.seed(props, db, userRepo, clock);

        Map<String, Object> bySchool = readMap(FirebasePath.coursesBySchoolRoot("test"));
        assertThat(bySchool).hasSize(6);

        // The demo user already has a review submitted for every course so CourseDetail
        // doesn't bounce viewers to REVIEW_QUOTA_REQUIRED during the demo.
        for (String courseId : bySchool.keySet()) {
            Map<String, Object> course = readMap(FirebasePath.course(courseId));
            assertThat(course).containsEntry("schoolId", "test");

            Map<String, Object> stats = readMap(FirebasePath.courseStats(courseId));
            assertThat(stats).containsKeys("recommend", "notRecommend", "skip", "total", "recommendRate");

            assertThat(readMapOpt(FirebasePath.reviewLock("demo_user_001", courseId))).isPresent();
        }
    }
}
