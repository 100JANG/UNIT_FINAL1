package kr.unit.backend.firebase;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FirebasePathTest {

    @Test
    void userPath() {
        assertThat(FirebasePath.user("u_1")).isEqualTo("/users/u_1");
    }

    @Test
    void postPathsCoverFeedAndStats() {
        assertThat(FirebasePath.post("p_1")).isEqualTo("/posts/p_1");
        assertThat(FirebasePath.postFeedAll("p_1")).isEqualTo("/post_feeds/all/p_1");
        assertThat(FirebasePath.postFeedSchool("ajou", "p_1"))
                .isEqualTo("/post_feeds/schools/ajou/p_1");
        assertThat(FirebasePath.postFeedDepartment("ajou_csi", "p_1"))
                .isEqualTo("/post_feeds/departments/ajou_csi/p_1");
        assertThat(FirebasePath.postStats("p_1")).isEqualTo("/post_stats/p_1");
        assertThat(FirebasePath.postLike("p_1", "u_1")).isEqualTo("/post_likes/p_1/u_1");
        assertThat(FirebasePath.postScrap("p_1", "u_1")).isEqualTo("/post_scraps/p_1/u_1");
        assertThat(FirebasePath.userPost("u_1", "p_1")).isEqualTo("/user_posts/u_1/p_1");
    }

    @Test
    void coursePaths() {
        assertThat(FirebasePath.course("c_1")).isEqualTo("/courses/c_1");
        assertThat(FirebasePath.courseBySchool("ajou", "c_1"))
                .isEqualTo("/courses_by_school/ajou/c_1");
        assertThat(FirebasePath.courseReview("c_1", "rv_1"))
                .isEqualTo("/course_reviews/c_1/rv_1");
        assertThat(FirebasePath.reviewLock("u_1", "c_1"))
                .isEqualTo("/review_locks/u_1/c_1");
    }

    @Test
    void notificationPaths() {
        assertThat(FirebasePath.notification("u_1", "n_1"))
                .isEqualTo("/notifications/u_1/n_1");
        assertThat(FirebasePath.fcmToken("u_1", "device-1"))
                .isEqualTo("/fcm_tokens/u_1/device-1");
    }

    @Test
    void juryPaths() {
        assertThat(FirebasePath.juryCase("case_1")).isEqualTo("/jury_cases/case_1");
        assertThat(FirebasePath.juryVote("case_1", "u_1")).isEqualTo("/jury_votes/case_1/u_1");
        assertThat(FirebasePath.juryCaseStats("case_1")).isEqualTo("/jury_case_stats/case_1");
    }

    @Test
    void userActivityPaths() {
        assertThat(FirebasePath.userPost("u_1", "p_1")).isEqualTo("/user_posts/u_1/p_1");
        assertThat(FirebasePath.userPostsRoot("u_1")).isEqualTo("/user_posts/u_1");
        assertThat(FirebasePath.userComment("u_1", "c_1")).isEqualTo("/user_comments/u_1/c_1");
        assertThat(FirebasePath.userCommentsRoot("u_1")).isEqualTo("/user_comments/u_1");
        assertThat(FirebasePath.userLike("u_1", "p_1")).isEqualTo("/user_likes/u_1/p_1");
        assertThat(FirebasePath.userLikesRoot("u_1")).isEqualTo("/user_likes/u_1");
        assertThat(FirebasePath.userStats("u_1")).isEqualTo("/user_stats/u_1");
    }

    @Test
    void scrapPaths() {
        assertThat(FirebasePath.postScrap("p_1", "u_1"))
                .isEqualTo("/post_scraps/p_1/u_1");
        assertThat(FirebasePath.userScrap("u_1", "p_1"))
                .isEqualTo("/user_scraps/u_1/p_1");
        assertThat(FirebasePath.userScrapsRoot("u_1"))
                .isEqualTo("/user_scraps/u_1");
        assertThat(FirebasePath.postStatsScraps("p_1"))
                .isEqualTo("/post_stats/p_1/scraps");
        assertThat(FirebasePath.userStatsScraps("u_1"))
                .isEqualTo("/user_stats/u_1/scraps");
    }

    @Test
    void commentPaths() {
        assertThat(FirebasePath.comment("p_1", "c_1"))
                .isEqualTo("/comments/p_1/c_1");
        assertThat(FirebasePath.postCommentsRoot("p_1"))
                .isEqualTo("/comments/p_1");
        assertThat(FirebasePath.commentStats("c_1"))
                .isEqualTo("/comment_stats/c_1");
        assertThat(FirebasePath.commentLike("c_1", "u_1"))
                .isEqualTo("/comment_likes/c_1/u_1");
        assertThat(FirebasePath.userComment("u_1", "c_1"))
                .isEqualTo("/user_comments/u_1/c_1");
    }

    @Test
    void rejectsForbiddenSegmentChars() {
        assertThatThrownBy(() -> FirebasePath.user("u/1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user("u.1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user("u#1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user("u$1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user("u[1")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user("u]1")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsBlankSegment() {
        assertThatThrownBy(() -> FirebasePath.user(""))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> FirebasePath.user(null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
