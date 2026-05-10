# 14 — Frontend Integration Audit Report

> Cycle 9 (runbook). 전체 통합 점검: grep 기반 금지 패턴 검사 + 미연결 표면 정리.

## 1. 금지 패턴 grep 결과

### 1-1. `size` pagination 파라미터

```
Select-String -Path src\**\*.ts,src\**\*.tsx -Pattern "size"
```

총 매치 수십 건이지만 **모두 false-positive**:
- `F.size.*` — 폰트 토큰 (theme/tokens.ts)
- `<Icon size={N} />` — UI 컴포넌트 prop (Avatar/IcXxx/MannerBadge/LogoMark/...)
- 본문 주석에서 "`size` 사용 금지" 명시 — 의도적 메모

**API 호출에서 `size` query param 사용**: 0건. ✅

### 1-2. `/post_comments` 경로

0 hits. ✅ 모든 댓글 경로는 `/posts/{postId}/comments` 형태.

### 1-3. `parseInt(postId|commentId|courseId)` / `Number(postId|...)`

```
파턴: parseInt\s*\(\s*post|Number\s*\(\s*post|...
```

0 hits. ✅ 모든 ID는 string opaque으로 유지.

### 1-4. RTDB write helpers (`set`/`update`/`push`/`remove`)

```
파턴: \bset\s*\(|\bupdate\s*\(|\bpush\s*\(|\bremove\s*\(
```

0 hits. ✅

추가 검증: Firebase 패키지 import 검사
```
import ... from 'firebase/...'
```
- `firebase/app`: `getApps`, `initializeApp`, `FirebaseApp` (init only)
- `firebase/database`: `getDatabase`, `Database`, `off`, `onValue`, `ref`, `DataSnapshot`, `Unsubscribe` (read-only)

write 함수(`set`, `update`, `push`, `remove`, `child`, `runTransaction`) import 0건 ✅
`firebase/auth` import 0건 ✅
`firebase/messaging` import 0건 ✅
`firebase/firestore` import 0건 ✅

### 1-5. `: any` / `as any`

1 hit:
- `src/navigation/TabNavigator.tsx:115` — `function WriteFabButton(props: any)` — **사전 존재 코드** (cycles 2~9에서 추가/수정 0건). React Navigation의 custom tabBarButton prop이 매우 복잡한 타입이라 sentinel any로 표현된 기존 패턴.

**본 cycle audit 범위에서 새로 추가된 `any` 사용**: 0건 ✅

조치 권고: 사전 코드의 single `any`는 후속 typing 개선 cycle에서 해결. 본 audit에서 즉시 수정 불필요(scope 외).

## 2. API 연결 상태 매트릭스

| 도메인 | endpoint | 상태 |
|---|---|---|
| Health | `GET /v1/health` | (미연결, 인증 불필요 ping용) |
| Auth | `POST /v1/auth/session` | DevAuthPanel만 사용 (실 로그인 화면 미연결) |
| Auth | `POST /v1/auth/refresh` | 미연결 (자동 refresh 미구현) |
| Auth | `POST /v1/auth/logout` | 미연결 (logout 흐름 미구현) |
| Reserved | OCR / AI Refine / Recap | **호출 안 함** (FEATURE_RESERVED 응답 시 hook이 'reserved' status로 매핑) |
| Users | `GET /v1/users/me` | ✅ Cycle 6 |
| Users | `GET /v1/users/me/stats` | ✅ Cycle 6 |
| Users | `GET /v1/users/me/posts` | ✅ Cycle 6 |
| Users | `GET /v1/users/me/comments` | ✅ Cycle 6 |
| Users | `GET /v1/users/me/likes` | ✅ Cycle 6 (hook만, 화면 없음) |
| Users | `GET /v1/users/me/scraps` | ✅ Cycle 6 |
| Users | `GET /v1/users/{userId}` | 미연결 (OtherProfileScreen) |
| Posts | `GET /v1/posts` | ✅ Cycle 1 |
| Posts | `POST /v1/posts` | 미연결 (WriteScreen) |
| Posts | `GET /v1/posts/{postId}` | ✅ Cycle 3 |
| Posts | `POST /v1/posts/{postId}/like` | ✅ Cycle 5 |
| Posts | `POST /v1/posts/{postId}/scrap` | ✅ Cycle 5 |
| Posts | `POST /v1/posts/{postId}/report` | 미연결 (ReportScreen) |
| Comments | `GET /v1/posts/{postId}/comments` | ✅ Cycle 4 |
| Comments | `POST /v1/posts/{postId}/comments` | ✅ Cycle 2 (runbook order) |
| Comments | `POST /v1/posts/{postId}/comments/{commentId}/like` | ✅ Cycle 3 |
| Comments | `DELETE /v1/posts/{postId}/comments/{commentId}` | ✅ API/hook (Cycle 3) — UI 보류(`isMyComment` 부재) |
| Courses | `GET /v1/courses` | ✅ Cycle 4 (runbook) |
| Courses | `GET /v1/courses/{courseId}` | ✅ Cycle 4 (runbook) |
| Courses | `POST /v1/courses/{courseId}/reviews` | ✅ Cycle 5 (runbook) |
| Notifications | `GET /v1/notifications` | ✅ Cycle 7 |
| Notifications | `PATCH /v1/notifications/{id}` (read) | ✅ Cycle 7 |
| Notifications | `POST /v1/notifications/mark-all-read` | ✅ Cycle 7 |
| Notifications | `DELETE /v1/notifications/{id}` | 미연결 (의도적) |
| Notifications | `POST /v1/notifications/fcm-token` | **연결 금지** (runbook §절대금지) |
| Jury | `GET /v1/jury/cases/{caseId}` | 미연결 (Jury 화면) |
| RTDB | `/notifications/{userId}` (read) | ✅ Cycle 8 (gated) |
| RTDB | other paths | 미연결 (후속 cycle) |

## 3. Reserved 기능 처리

`FEATURE_RESERVED` (501) handling 확인:
- 12개 hook이 일관되게 `reserved` status로 매핑 (방어적 — Reserved endpoint를 호출하지 않더라도 contract 진화 대비)
- `errorHandler.ts`의 `classifyError`도 `'reserved'` kind 반환
- UI는 모두 "준비 중인 기능입니다" 안내 노출
- **Reserved endpoint(`/v1/auth/student-card/verify`, `/v1/ai/refine`, `/v1/recap/...`) 호출 0건** ✅

## 4. RTDB direct write 검사

- `firebase/database` import 4종 (`getDatabase`/`Database`/`off`/`onValue`/`ref`/`DataSnapshot`/`Unsubscribe`) — 모두 read-only API
- `firebase/auth`, `firebase/messaging`, `firebase/firestore` import 0건
- `set`/`update`/`push`/`remove`/`child`/`runTransaction` 미사용
- 백엔드 RTDB 경로(`/posts`, `/post_feeds`, `/post_likes`, `/post_scraps`, `/comments`, `/notifications`, `/users`, `/user_*`)에 대한 direct write 0건

✅ 프론트는 RTDB read만, write는 모두 Spring Boot REST API 경유.

## 5. AI / OCR / Gemma / Recap

- AI 관련 코드 import 0건
- OCR 관련 코드 import 0건
- Gemma 관련 코드 import 0건
- Recap endpoint 호출 0건
- `expo-image-picker` 사용 — 사진 첨부용 plugin, OCR/AI와 무관

## 6. PWA / Service Worker

- React Native 환경이라 brower-only API(Service Worker, Workbox 등) 미사용
- `service-worker`, `workbox` import 0건

## 7. 남아있는 mock data

API 연결 완료된 화면에서의 잔존 mock:

| 화면 | mock 잔존 위치 | 정책 |
|---|---|---|
| FeedScreen | `FALLBACK_POSTS` (2건) | success 진입 전까지만 표시 — fallback (cycle 1 보고서 정책) |
| PostDetailScreen | 없음 | mock 완전 제거됨 (cycle 3) |
| CourseDetailScreen | `REVIEWS_PLACEHOLDER` (1건) | 강의평 list endpoint 미존재 — placeholder 라벨 명시 |

API 연결 안 된 화면 (전체 mock):
- WriteScreen, ChatListScreen, ChatRoomScreen, FriendsScreen, FriendRequestsScreen, OtherProfileScreen
- MarketScreen, MarketDetailScreen, MarketWriteScreen, JobsScreen, JobDetailScreen, ContestScreen, ContestDetailScreen
- ContactsScreen, LibraryScreen, BusScreen, MealScreen, TimetableScreen, CampusHubScreen
- BlockListScreen, ReportScreen, JuryScreen
- AccountSettingsScreen, NotificationSettingsScreen
- LoginScreen, EmailVerifyScreen, SchoolSelectScreen, ProfileSetupScreen, SplashScreen
- MannerGradeScreen, MannerLadderScreen
- CommentThreadScreen, SearchScreen, PlaceholderScreen

이들은 runbook cycles 2~8에서 명시적으로 다루지 않은 화면이며 mock UI 그대로. 후속 cycle에서 endpoint 매핑 후 연결 예정.

## 8. ErrorCode 처리 누락 검사

각 hook이 처리하는 ErrorKind 분기:

| code | hook 매핑 | UI 처리 |
|---|---|---|
| `AUTH_REQUIRED` | 12 hooks `auth-required` | 로그인 안내 + DEV 패널 안내 |
| `AUTH_INVALID` | 12 hooks `auth-required` (apiClient 자동 토큰 클리어) | 로그인 안내 |
| `AUTH_EXPIRED` | 12 hooks `auth-required`/`auth-expired` (토큰 클리어 + 자동 refresh 미구현) | 로그인 안내 |
| `FORBIDDEN` | 5 hooks `forbidden` | "접근할 수 없습니다" |
| `USER_SUSPENDED` | 일부 hook `forbidden` 매핑 — 정지 안내 별도 화면은 미구현 |
| `NOT_FOUND` | 4 hooks `not-found` | "찾을 수 없습니다" |
| `VALIDATION_FAILED` | createComment / createCourseReview에서 `validation` kind + fieldErrors 표시 |
| `BUSINESS_RULE_VIOLATION` | 4 hooks `business-rule` (Feed scope, course write, etc.) |
| `REVIEW_QUOTA_REQUIRED` | useCourseDetail의 `review-required` status — 자동 review 화면 라우팅 |
| `REPORT_DUPLICATE` | 일반 BUSINESS_RULE_VIOLATION으로 처리됨 (ReportScreen 미연결이라 미사용) |
| `JURY_*` | Jury cycle 미진행 |
| `RATE_LIMIT_EXCEEDED` | errorHandler 분류 있음. 개별 hook은 'error'로 fallthrough |
| `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE` | 'error'/`server` 매핑 |
| `FEATURE_RESERVED` | 12 hooks 모두 방어 처리 |
| `NETWORK_ERROR` | apiClient가 합성하여 throw |

자동 토큰 클리어 정책 (apiClient): `AUTH_INVALID` / `AUTH_EXPIRED` 응답 시 `void clearSessionToken()` 호출.

검증: 위 매트릭스에서 빠진 critical code 없음 ✅

## 9. 의존성 audit

```
npm audit (Cycle 8 firebase 설치 후)
8 vulnerabilities (2 moderate, 6 high)
```

- 모두 firebase의 transitive deps에서 발생
- 본 cycle에서 `npm audit fix` 실행 안 함 — risk: breaking change
- 후속: 정기 dep 업데이트 cycle에서 해결

## 10. typecheck 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

## 11. 전체 사이클별 commit/tag 매트릭스

| Cycle (runbook) | Commit | Tag |
|---|---|---|
| 1. Feed (이전) | `55ed7ee feat: connect feed API to backend contract` | `frontend-feed-api-v1` |
| (보강) Auth + route | `06b5763` (백엔드 cycle) / `78b69b2` (auth/route) | `backend-integration-ready-v1` / `frontend-post-detail-v1` |
| 2. Comment Write | `0452b5c feat: connect comment write API` | `frontend-comment-write-v1` |
| 3. Comment Like/Delete | `b7e122d feat: connect comment like and delete actions` | `frontend-comment-actions-v1` |
| 4. Courses Read | `ded5159 feat: connect courses read APIs` | `frontend-courses-read-v1` |
| 5. Course Review Write | `066ef59 feat: connect course review write API` | `frontend-course-review-v1` |
| 6. Profile / Activity | `ad03e9f feat: connect profile and activity APIs` | `frontend-profile-activity-v1` |
| 7. Notifications | `84fca43 feat: connect notifications APIs` | `frontend-notifications-v1` |
| 8. RTDB Read Subscription | `3ee5af4 feat: connect RTDB read subscriptions` | `frontend-rtdb-subscriptions-v1` |
| 9. Audit | (이번 cycle) | `frontend-integration-check-v1` |

(중간 commits: `frontend-comments-read-v1` (cycle 4 prior), `frontend-post-actions-v1` (cycle 5 prior))

## 12. 다음 Cycle (runbook)

- **Cycle 10. Staging 실행 검증** — 실 환경 wiring + happy path 검증.
  - 백엔드 staging 실행 문서화
  - 프론트 `.env` staging 값 정리
  - DevAuthPanel로 token 주입
  - Feed/PostDetail/Comments/Like-Scrap/Courses/Profile/Notifications 각 happy path 검증
  - ErrorCode 강제 테스트
  - 본 cycle은 실제 환경 액세스가 필요해 Claude Code가 단독 진행 불가 — 사용자 손이 필요한 수동 단계가 다수 포함됨

## 13. 알려진 한계 / 후속 작업

1. **AUTH_EXPIRED 자동 refresh 미구현** — 토큰 클리어까지만. `/v1/auth/refresh` 자동 1회 시도 패턴은 별도 cycle.
2. **Login / EmailVerify / SchoolSelect / ProfileSetup 화면 미연결** — 학생증 OCR / 학교 이메일 인증이 Reserved이라 실 로그인 흐름 없음. DevAuthPanel이 임시 우회.
3. **isMyComment 부재로 댓글 삭제 UI 비노출** — backend 합의 후 활성.
4. **`myActions` 부재** — 게시글 진입 시 viewer의 like/scrap 상태 모름. 토글 후에만 정확.
5. **post.stats.comments 비동기** — 댓글 작성/삭제 후 게시글 헤더 카운트 즉시 갱신 안 됨.
6. **board-id → 한글 라벨 매핑 부재** — Pill에 boardId 그대로 노출.
7. **Feed stats 갱신 안 됨** — PostDetail에서 like/scrap 토글 후 Feed 카드 stats 미반영.
8. **OtherProfileScreen / ReportScreen / WriteScreen 미연결**.
9. **Jury / Recap / OCR / AI / FCM 미연결** (Reserved 또는 의도적 미연결).
10. **Course list에 stats 부재** — 카드에 추천% 표시 못함 (백엔드 contract).
11. **CourseReview 작성 시 강의명 부재** — 미작성자에게 detail 422라 이름 fetch 못함.
12. **무한스크롤 미적용 / 더보기 버튼 사용** — PostDetail이 ScrollView, 다른 화면들도 일관성 위해 버튼 방식.
13. **TanStack Query 미도입** — race-condition 방어는 reqId로. 후속 도입 시 hook 반환 shape 보존.
14. **firebase 8개 audit 경고** — transitive deps. 별도 cycle.
15. **Custom Token 인증 흐름 미구현** — RTDB rules가 auth.uid 요구 시 read 권한 거절될 수 있음.
