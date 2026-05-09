package kr.unit.backend.firebase;

/**
 * Firebase Realtime Database 경로 빌더.
 * 모든 RTDB 경로 문자열은 이 클래스에서만 조립한다. Service/Repository 등 다른 곳에서 직접 "/posts/" + id 같은
 * 조합을 만들지 않는다. (database/02_RTDATABASE_PATHS_AND_INDEXES.md 기준)
 *
 * Reserved 기능 경로(student_registry, ai_*, recap*, ocr_*)는 만들지 않는다.
 */
public final class FirebasePath {

    private FirebasePath() {
    }

    // Auth / Users
    public static String user(String userId) {
        return "/users/" + segment(userId);
    }

    public static String session(String userId, String sessionId) {
        return "/sessions/" + segment(userId) + "/" + segment(sessionId);
    }

    public static String userSessionsRoot(String userId) {
        return "/sessions/" + segment(userId);
    }

    public static String fcmToken(String userId, String deviceId) {
        return "/fcm_tokens/" + segment(userId) + "/" + segment(deviceId);
    }

    // Schools / Departments / Boards
    public static String school(String schoolId) {
        return "/schools/" + segment(schoolId);
    }

    public static String department(String departmentId) {
        return "/departments/" + segment(departmentId);
    }

    public static String board(String boardId) {
        return "/boards/" + segment(boardId);
    }

    // Posts
    public static String post(String postId) {
        return "/posts/" + segment(postId);
    }

    public static String postFeedAll(String postId) {
        return "/post_feeds/all/" + segment(postId);
    }

    public static String postFeedAllRoot() {
        return "/post_feeds/all";
    }

    public static String postFeedSchool(String schoolId, String postId) {
        return "/post_feeds/schools/" + segment(schoolId) + "/" + segment(postId);
    }

    public static String postFeedSchoolRoot(String schoolId) {
        return "/post_feeds/schools/" + segment(schoolId);
    }

    public static String postFeedDepartment(String departmentId, String postId) {
        return "/post_feeds/departments/" + segment(departmentId) + "/" + segment(postId);
    }

    public static String postFeedDepartmentRoot(String departmentId) {
        return "/post_feeds/departments/" + segment(departmentId);
    }

    public static String postStats(String postId) {
        return "/post_stats/" + segment(postId);
    }

    public static String postLike(String postId, String userId) {
        return "/post_likes/" + segment(postId) + "/" + segment(userId);
    }

    public static String postScrap(String postId, String userId) {
        return "/post_scraps/" + segment(postId) + "/" + segment(userId);
    }

    public static String userPost(String userId, String postId) {
        return "/user_posts/" + segment(userId) + "/" + segment(postId);
    }

    // Comments
    public static String comment(String postId, String commentId) {
        return "/comments/" + segment(postId) + "/" + segment(commentId);
    }

    public static String postCommentsRoot(String postId) {
        return "/comments/" + segment(postId);
    }

    public static String commentStats(String commentId) {
        return "/comment_stats/" + segment(commentId);
    }

    public static String commentLike(String commentId, String userId) {
        return "/comment_likes/" + segment(commentId) + "/" + segment(userId);
    }

    public static String userComment(String userId, String commentId) {
        return "/user_comments/" + segment(userId) + "/" + segment(commentId);
    }

    // Profile activity indexes
    public static String userPostsRoot(String userId) {
        return "/user_posts/" + segment(userId);
    }

    public static String userCommentsRoot(String userId) {
        return "/user_comments/" + segment(userId);
    }

    public static String userLike(String userId, String postId) {
        return "/user_likes/" + segment(userId) + "/" + segment(postId);
    }

    public static String userLikesRoot(String userId) {
        return "/user_likes/" + segment(userId);
    }

    public static String userStats(String userId) {
        return "/user_stats/" + segment(userId);
    }

    public static String userScrap(String userId, String postId) {
        return "/user_scraps/" + segment(userId) + "/" + segment(postId);
    }

    public static String userScrapsRoot(String userId) {
        return "/user_scraps/" + segment(userId);
    }

    // Counter leaves (transaction increment 대상)
    public static String postStatsScraps(String postId) {
        return postStats(postId) + "/scraps";
    }

    public static String userStatsScraps(String userId) {
        return userStats(userId) + "/scraps";
    }

    // Courses / Reviews
    public static String course(String courseId) {
        return "/courses/" + segment(courseId);
    }

    public static String courseBySchool(String schoolId, String courseId) {
        return "/courses_by_school/" + segment(schoolId) + "/" + segment(courseId);
    }

    public static String coursesBySchoolRoot(String schoolId) {
        return "/courses_by_school/" + segment(schoolId);
    }

    public static String courseReview(String courseId, String reviewId) {
        return "/course_reviews/" + segment(courseId) + "/" + segment(reviewId);
    }

    public static String courseStats(String courseId) {
        return "/course_stats/" + segment(courseId);
    }

    public static String reviewLock(String userId, String courseId) {
        return "/review_locks/" + segment(userId) + "/" + segment(courseId);
    }

    // Reports (접수까지만)
    public static String report(String reportId) {
        return "/reports/" + segment(reportId);
    }

    public static String reportByPost(String postId, String reportId) {
        return "/reports_by_post/" + segment(postId) + "/" + segment(reportId);
    }

    // Jury (수동 생성된 case 조회/투표만)
    public static String juryCase(String caseId) {
        return "/jury_cases/" + segment(caseId);
    }

    public static String juryVote(String caseId, String userId) {
        return "/jury_votes/" + segment(caseId) + "/" + segment(userId);
    }

    public static String juryCaseStats(String caseId) {
        return "/jury_case_stats/" + segment(caseId);
    }

    // Notifications
    public static String notification(String userId, String notificationId) {
        return "/notifications/" + segment(userId) + "/" + segment(notificationId);
    }

    public static String userNotificationsRoot(String userId) {
        return "/notifications/" + segment(userId);
    }

    private static String segment(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Firebase path segment must not be blank");
        }
        if (value.contains("/") || value.contains(".") || value.contains("#")
                || value.contains("$") || value.contains("[") || value.contains("]")) {
            throw new IllegalArgumentException("Firebase path segment contains forbidden chars: " + value);
        }
        return value;
    }
}
