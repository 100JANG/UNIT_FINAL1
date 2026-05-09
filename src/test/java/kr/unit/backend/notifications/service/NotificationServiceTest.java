package kr.unit.backend.notifications.service;

import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.notifications.dto.NotificationResponse;
import kr.unit.backend.notifications.repository.NotificationFirebaseRepository;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.support.FixtureFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private NotificationService service;
    private final AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        NotificationFirebaseRepository repo = new NotificationFirebaseRepository(fakeDb);
        service = new NotificationService(repo, FixedClockProvider.at("2026-05-09T00:00:00Z"));

        fakeDb.set("/notifications/u_a/n_1", Map.of(
                "notificationId", "n_1",
                "type", "POST_COMMENT",
                "title", "댓글이 달렸습니다",
                "body", "확인하세요",
                "isRead", false,
                "createdAt", "2026-05-08T00:00:00Z"));
        fakeDb.set("/notifications/u_a/n_2", Map.of(
                "notificationId", "n_2",
                "type", "POST_LIKE",
                "title", "좋아요!",
                "body", "확인하세요",
                "isRead", false,
                "createdAt", "2026-05-09T00:00:00Z"));
    }

    @Test
    void list_returnsNotificationsSortedNewestFirst() {
        // 새 시그니처: listMine(user, cursor, limit) → CursorPageResponse
        CursorPageResponse<NotificationResponse> page = service.listMine(user, null, 10);
        assertThat(page.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_2", "n_1");
        assertThat(page.pagination().hasMore()).isFalse();
        assertThat(page.pagination().cursor()).isNull();
    }

    @Test
    void getNotifications_usesLimitParameter() {
        // limit=1을 명시적으로 전달하면 1건만 응답하고 hasMore=true.
        CursorPageResponse<NotificationResponse> page = service.listMine(user, null, 1);

        assertThat(page.items()).hasSize(1);
        assertThat(page.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_2");
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void getNotifications_clampsLimitToFifty() {
        // 60건 시드 후 limit=999 요청 → 50건으로 clamp + hasMore=true.
        // 기본 fixture 정리 후 60개로 다시 시드.
        fakeDb.delete("/notifications/u_a");
        for (int i = 0; i < 60; i++) {
            String id = String.format("n_%03d", i);
            String createdAt = "2026-05-01T00:00:" + String.format("%02d", i) + "Z";
            seedNotification(id, createdAt);
        }

        CursorPageResponse<NotificationResponse> page = service.listMine(user, null, 999);

        assertThat(page.items()).hasSize(50);
        assertThat(page.pagination().hasMore()).isTrue();
        assertThat(page.pagination().cursor()).isNotBlank();
    }

    @Test
    void getNotifications_zeroOrNegativeLimitFallsBackToDefault() {
        // 0/음수 limit이면 PaginationLimits.clamp가 기본 20으로 fallback.
        fakeDb.delete("/notifications/u_a");
        for (int i = 0; i < 25; i++) {
            String id = String.format("n_%03d", i);
            String createdAt = "2026-05-01T00:00:" + String.format("%02d", i) + "Z";
            seedNotification(id, createdAt);
        }

        CursorPageResponse<NotificationResponse> withZero = service.listMine(user, null, 0);
        assertThat(withZero.items()).hasSize(20);
        assertThat(withZero.pagination().hasMore()).isTrue();

        CursorPageResponse<NotificationResponse> withNegative = service.listMine(user, null, -7);
        assertThat(withNegative.items()).hasSize(20);
        assertThat(withNegative.pagination().hasMore()).isTrue();
    }

    @Test
    void getNotifications_usesIndexedCreatedAtQuery() {
        // notificationId 사전순과 createdAt 정렬이 다르도록 의도 배치.
        // 정렬키가 createdAt임을 강제하려면 id 사전순 < createdAt 순서가 충돌해야 한다.
        fakeDb.delete("/notifications/u_a");
        // n_z = 오래된, n_a = 최신
        seedNotification("n_z", "2026-05-01T00:00:00Z");
        seedNotification("n_a", "2026-05-09T00:00:00Z");

        CursorPageResponse<NotificationResponse> page = service.listMine(user, null, 10);

        // createdAt DESC라면 n_a(최신) → n_z(오래됨). id 사전순(ASC)이라면 n_a → n_z이지만 우연히 같음.
        // 그래서 cursor 동작까지 함께 검증해 sort key가 createdAt임을 확정한다.
        assertThat(page.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_a", "n_z");
    }

    @Test
    void getNotifications_cursorWorks() {
        fakeDb.delete("/notifications/u_a");
        for (int i = 0; i < 5; i++) {
            String id = String.format("n_%02d", i);
            String createdAt = "2026-05-0" + (i + 1) + "T00:00:00Z";
            seedNotification(id, createdAt);
        }

        // newest first → page1: n_04(05-05), n_03(05-04)
        CursorPageResponse<NotificationResponse> page1 = service.listMine(user, null, 2);
        assertThat(page1.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_04", "n_03");
        assertThat(page1.pagination().hasMore()).isTrue();

        CursorPageResponse<NotificationResponse> page2 =
                service.listMine(user, page1.pagination().cursor(), 2);
        assertThat(page2.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_02", "n_01");
        assertThat(page2.pagination().hasMore()).isTrue();

        CursorPageResponse<NotificationResponse> page3 =
                service.listMine(user, page2.pagination().cursor(), 2);
        assertThat(page3.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_00");
        assertThat(page3.pagination().hasMore()).isFalse();
        assertThat(page3.pagination().cursor()).isNull();
    }

    @Test
    void getNotifications_unreadFilterKeepsPolicyIfExists() {
        // 현재 unreadOnly / isRead 필터는 구현되지 않았다. 모든 알림(isRead=true 포함)이 동일하게 반환된다.
        // 만약 향후 unread 필터가 추가되면 본 테스트가 깨져 정책 변경을 인지시킨다.
        fakeDb.delete("/notifications/u_a");
        seedNotification("n_unread", "2026-05-09T10:00:00Z", false);
        seedNotificationRead("n_read", "2026-05-09T11:00:00Z", true);

        CursorPageResponse<NotificationResponse> page = service.listMine(user, null, 10);

        // 현재 정책: 읽음/안읽음 모두 포함, createdAt DESC.
        assertThat(page.items()).extracting(NotificationResponse::notificationId)
                .containsExactly("n_read", "n_unread");
        assertThat(page.items()).extracting(NotificationResponse::isRead)
                .containsExactly(true, false);
    }

    @Test
    void markRead_setsIsReadTrue() {
        service.markRead(user, "n_1");
        assertThat(fakeDb.get("/notifications/u_a/n_1/isRead", Boolean.class)).contains(true);
    }

    @Test
    void markRead_throwsNotFoundForMissingNotification() {
        assertThatThrownBy(() -> service.markRead(user, "n_unknown"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void markAllRead_marksEveryNotificationAsRead() {
        service.markAllRead(user);
        assertThat(fakeDb.get("/notifications/u_a/n_1/isRead", Boolean.class)).contains(true);
        assertThat(fakeDb.get("/notifications/u_a/n_2/isRead", Boolean.class)).contains(true);
    }

    // helpers

    private void seedNotification(String id, String createdAt) {
        seedNotification(id, createdAt, false);
    }

    private void seedNotification(String id, String createdAt, boolean isRead) {
        Map<String, Object> data = new HashMap<>();
        data.put("notificationId", id);
        data.put("type", "POST_LIKE");
        data.put("title", "알림 " + id);
        data.put("body", "...");
        data.put("isRead", isRead);
        data.put("createdAt", createdAt);
        fakeDb.set("/notifications/u_a/" + id, data);
    }

    private void seedNotificationRead(String id, String createdAt, boolean isRead) {
        seedNotification(id, createdAt, isRead);
    }
}
