package kr.unit.backend.notifications.service;

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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private NotificationService service;

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
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        List<NotificationResponse> result = service.listMine(user, 10);
        assertThat(result).extracting(NotificationResponse::notificationId)
                .containsExactly("n_2", "n_1");
    }

    @Test
    void markRead_setsIsReadTrue() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        service.markRead(user, "n_1");
        assertThat(fakeDb.get("/notifications/u_a/n_1/isRead", Boolean.class)).contains(true);
    }

    @Test
    void markRead_throwsNotFoundForMissingNotification() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        assertThatThrownBy(() -> service.markRead(user, "n_unknown"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }

    @Test
    void markAllRead_marksEveryNotificationAsRead() {
        AuthenticatedUser user = FixtureFactory.authenticated("u_a", "a@ajou.ac.kr");
        service.markAllRead(user);
        assertThat(fakeDb.get("/notifications/u_a/n_1/isRead", Boolean.class)).contains(true);
        assertThat(fakeDb.get("/notifications/u_a/n_2/isRead", Boolean.class)).contains(true);
    }
}
