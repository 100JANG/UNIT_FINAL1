# 12 — Notifications Connection Report

> Cycle 7 (runbook). 알림 목록 + 읽음 처리만 연결. RTDB subscription / FCM / Push 0건.

## 1. 연결한 API

```
GET   /v1/notifications?cursor=&limit=
PATCH /v1/notifications/{notificationId}        (mark read)
POST  /v1/notifications/mark-all-read
```

**연결 안 함** (runbook §"Cycle 7 주의" 준수):
- `POST /v1/notifications/fcm-token` — FCM/Push 구현 금지
- `DELETE /v1/notifications/{id}` — cycle 범위 외
- RTDB subscription — Cycle 8

- 백엔드 컨트롤러: [`NotificationController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/notifications/controller/NotificationController.java)
- Contract: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §8](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- envelope unwrap apiClient 재사용. `Authorization: Bearer ...` 자동 부착.
- 페이지네이션: `cursor` + `limit` (기본 20, 최대 50). `size` 사용 0건.
- 백엔드 정렬: createdAt DESC (newest-first).

## 2. 생성/수정 파일

신규:
- [src/types/notification.ts](../../src/types/notification.ts) — `NotificationDto`, `NotificationItem`, mark-read response DTOs
- [src/services/api/notificationApi.ts](../../src/services/api/notificationApi.ts) — `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- [src/services/api/mappers/notificationMapper.ts](../../src/services/api/mappers/notificationMapper.ts)
- [src/hooks/useNotifications.ts](../../src/hooks/useNotifications.ts) — cursor pagination + optimistic mark read/markAllRead
- [docs/integration/12_NOTIFICATIONS_REPORT.md](12_NOTIFICATIONS_REPORT.md)

수정:
- [src/screens/v2/NotificationsScreen.tsx](../../src/screens/v2/NotificationsScreen.tsx) — 전체 재작성. mock INIT 제거 → `useNotifications`. all/unread 탭 + 읽음 dot + 모두 읽음 + 더보기. Jury type 알림 tap 시 `navigate('Jury', {})`로 진입.
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Cycle G 완료 표시

수정 안 함:
- 백엔드 0건
- 다른 hook/screen 0건
- FCM / Push / Firebase Native Messaging 0건 (runbook 절대금지 준수)

## 3. UX

| status | UI |
|---|---|
| `idle`/`loading` | ActivityIndicator (탭 아래 중앙) |
| `success` (items > 0) | 알림 카드 리스트, 읽지 않음은 dot + 옅은 배경 |
| `success` (items = 0) / `empty` | "안 읽은 알림이 없어요" / "알림이 없어요" (탭에 따라) |
| `auth-required` | 로그인 안내 + DEV 패널 안내 |
| `reserved` | "준비 중인 기능입니다" 방어 |
| `error` | message + "다시 시도" 버튼 |

탭:
- `all` — 모든 알림 (자체 카운트)
- `unread` — `isRead === false`만 필터 (unreadCount 카운트)

상호작용:
- 알림 tap → `markRead(id)` (이미 읽음이면 no-op) + JURY_SUMMON 타입은 `navigate('Jury', {})` 동시 호출
- AppBar trailing "모두 읽음" → `markAllRead()` (unreadCount === 0이면 disabled)
- 더보기 버튼 → cursor pagination

## 4. Optimistic + Failure 정책

Mark read / markAllRead는 옵티미스틱:
1. UI를 즉시 read 상태로 전환
2. API 호출
3. 실패 시 → `loadFirst()` 호출하여 첫 페이지부터 refetch (백엔드 truth로 재정렬)

개별 rollback 대신 refetch로 정렬하는 이유:
- 동시에 다른 알림이 도착했을 수 있어 단순 rollback이 정확하지 않음
- 백엔드가 mark read를 idempotent로 처리하므로 재호출 안전
- 사용자 입장에서 "방금 읽음 표시한 게 실패하면 자동으로 한 번 더 시도"하는 경험

## 5. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

새 native module 0건 → expo install --check 재실행 불필요. lint/build 미정의.

## 6. 회귀 여부

| 항목 | 결과 |
|---|---|
| 모든 기존 hook (Feed/PostDetail/Comments/Post-actions/Comment-write/Comment-actions/Courses/CourseDetail/CourseReview/Profile/Activity) | ✅ 0건 변경 |
| apiClient envelope unwrap / Auth 정책 | ✅ 0건 변경 |
| route param 마이그레이션 | ✅ 변경 없음 |

## 7. 남은 문제 / TODO

1. **JURY_SUMMON 알림에 caseId 부재**: 현재 구조에서는 알림 tap 시 jury entry로만 진입. caseId가 알림 payload에 추가되면 `navigate('Jury', { caseId })`로 정확히 라우팅 가능. 백엔드 협의 필요.
2. **개별 알림 삭제 미연결** (의도적 — runbook 범위 외).
3. **FCM 토큰 등록 미연결** (의도적 — runbook §절대금지).
4. **RTDB realtime subscription 미연결** (Cycle 8에서 연결 예정 — REST polling으로 대체 중).
5. **unreadOnly query 필터 미지원**: 백엔드가 query param을 받지 않음 → 클라이언트가 in-memory 필터로 처리 (탭). 페이지네이션이 끝날 때까지 unread 알림이 다음 페이지에 있을 수 있음. 정확한 unread-only 필터는 백엔드 필요.

## 8. 다음 Cycle (runbook)

- **Cycle 8. RTDB Read Subscription**
  - Firebase JS SDK 도입, env placeholder 정리
  - read-only `onValue` / `off` helper
  - write helper 0건 (set/update/push/remove 절대 금지)
  - `EXPO_PUBLIC_ENABLE_RTDATABASE=false`이면 비활성화
  - 최소 1개 path만 시범 연결 (예: notifications 카운터 또는 post stats)
