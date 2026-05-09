# Frontend Contract — Index

> UNIT/CAMPUS:ON Backend × React + Tailwind Frontend 연결 기준 문서.
> 백엔드 코드 기준으로 freeze된 API 계약이며, 본 폴더의 문서가 단일 출처이다.
> 본 문서를 읽고 작성된 모든 호출은 현재 `unit-backend-0.0.1-SNAPSHOT.jar` 기준으로 동작이 보장된다.

## 1. 문서 목적

- React + Tailwind 프론트가 어떤 REST API를 호출할 수 있는지, 어떤 RTDB 경로를 read subscription할 수 있는지를 한 곳에서 확정한다.
- 추측이 아니라 실제 구현된 Controller/DTO/Security Rules를 단일 출처로 한다.
- Reserved 기능, 미구현 기능, 알려진 제약을 명확히 분리하여 프론트가 잘못된 가정을 하지 않게 한다.

## 2. 프론트 연결 전 반드시 읽을 문서 순서

1. **이 문서 (`00_FRONTEND_CONTRACT_INDEX.md`)** — 전체 지도
2. [`05_AUTH_TOKEN_CONTRACT.md`](05_AUTH_TOKEN_CONTRACT.md) — 로그인/세션 발급/refresh 흐름. 모든 호출이 이걸 먼저 통과해야 함.
3. [`01_FRONTEND_API_CONTRACT.md`](01_FRONTEND_API_CONTRACT.md) — REST 호출 명세. 화면 ↔ endpoint 매핑.
4. [`06_PAGINATION_CONTRACT.md`](06_PAGINATION_CONTRACT.md) — cursor/limit 정책. 모든 목록 호출이 이걸 따른다.
5. [`03_ERROR_HANDLING_CONTRACT.md`](03_ERROR_HANDLING_CONTRACT.md) — 에러 코드별 UI 처리.
6. [`02_RTDATABASE_SUBSCRIPTION_CONTRACT.md`](02_RTDATABASE_SUBSCRIPTION_CONTRACT.md) — Firebase RTDB 직접 read subscription 경로.
7. [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md) — `501 FEATURE_RESERVED` endpoint 처리.
8. [`07_FRONTEND_INTEGRATION_CHECKLIST.md`](07_FRONTEND_INTEGRATION_CHECKLIST.md) — 연결 직전 가드레일.
9. [`08_MOCK_DATA_GUIDE.md`](08_MOCK_DATA_GUIDE.md) — 백엔드 없이 프론트 개발할 때 mock 데이터 시드.
10. [`09_KNOWN_LIMITATIONS.md`](09_KNOWN_LIMITATIONS.md) — 알려진 제약 + 후속 사이클 예정 항목.

## 3. 구현된 API 목록 (정상 동작)

| 도메인 | Endpoint | Method | 비고 |
|---|---|---|---|
| Health | `/v1/health` | GET | 인증 불필요 |
| Auth | `/v1/auth/session` | POST | Firebase ID Token → 세션 발급 |
| Auth | `/v1/auth/refresh` | POST | sessionToken 재발급 |
| Auth | `/v1/auth/logout` | POST | 인증 필요 |
| Users | `/v1/users/me` | GET | 본인 프로필 |
| Users | `/v1/users/me/stats` | GET | 활동 통계 (5개 카운터) |
| Users | `/v1/users/me/posts` | GET | 내가 쓴 글, cursor pagination |
| Users | `/v1/users/me/comments` | GET | 내가 쓴 댓글 |
| Users | `/v1/users/me/likes` | GET | 내가 추천한 글 |
| Users | `/v1/users/me/scraps` | GET | 내가 스크랩한 글 |
| Posts | `/v1/posts` | GET | 피드 (scope=all/school/department, sort=latest) |
| Posts | `/v1/posts` | POST | 게시글 작성 |
| Posts | `/v1/posts/{postId}` | GET | 상세 |
| Posts | `/v1/posts/{postId}/like` | POST | 좋아요 toggle |
| Posts | `/v1/posts/{postId}/scrap` | POST | 스크랩 toggle |
| Posts | `/v1/posts/{postId}/report` | POST | 신고 접수 (자동 jury 생성 없음) |
| Comments | `/v1/posts/{postId}/comments` | GET | 댓글 목록 |
| Comments | `/v1/posts/{postId}/comments` | POST | 댓글 작성 (depth ≤ 1) |
| Comments | `/v1/posts/{postId}/comments/{commentId}/like` | POST | 댓글 좋아요 toggle |
| Comments | `/v1/posts/{postId}/comments/{commentId}` | DELETE | 본인 댓글 soft delete |
| Courses | `/v1/courses` | GET | 강의 검색 (schoolId 필수) |
| Courses | `/v1/courses/{courseId}` | GET | 강의 상세 (REVIEW_QUOTA_REQUIRED) |
| Courses | `/v1/courses/{courseId}/reviews` | POST | 강의평 작성 |
| Notifications | `/v1/notifications` | GET | 알림 목록 |
| Notifications | `/v1/notifications/{notificationId}` | PATCH | 단건 읽음 |
| Notifications | `/v1/notifications/{notificationId}` | DELETE | 단건 삭제 |
| Notifications | `/v1/notifications/mark-all-read` | POST | 전체 읽음 |
| Notifications | `/v1/notifications/fcm-token` | POST | FCM 토큰 등록 |
| Jury | `/v1/jury/cases/{caseId}` | GET | 호출된 jury만 조회 |
| Jury | `/v1/jury/cases/{caseId}/vote` | POST | 투표 |

상세 명세는 [`01_FRONTEND_API_CONTRACT.md`](01_FRONTEND_API_CONTRACT.md).

## 4. Reserved API 목록 (501 FEATURE_RESERVED 응답)

| Endpoint | Method | feature key (응답에 포함되지 않음, 정책 식별용) |
|---|---|---|
| `/v1/auth/student-card/verify` | POST | STUDENT_CARD_OCR |
| `/v1/ai/refine` | POST | AI_WRITING_REFINE |
| `/v1/recap/{semester}` | GET | AI_RECAP |
| `/v1/recap/schools/{schoolId}/{semester}` | GET | AI_RECAP |

**프론트는 이 endpoint들을 호출해서는 안 된다.** 호출하면 `HTTP 501` + `{ code:"FEATURE_RESERVED", result:null }`가 일관되게 반환된다. 상세는 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md).

## 5. RTDB read subscription 가능 경로

Firebase Custom Token으로 로그인한 프론트가 직접 read 가능한 경로 (Security Rules로 강제됨):

| 경로 | 권한 | 용도 |
|---|---|---|
| `/users/{userId}` | 본인만 | 내 프로필 실시간 동기화 |
| `/posts/{postId}` | 인증 사용자 | 게시글 본문 실시간 |
| `/post_stats/{postId}` | 인증 사용자 | likes/comments/scraps 카운터 실시간 |
| `/post_likes/{postId}`, `/post_scraps/{postId}` | 인증 사용자 | 좋아요/스크랩 표시 동기화 |
| `/post_feeds/all` | 인증 사용자 | 글로벌 피드 신규 글 알림 |
| `/post_feeds/schools/{schoolId}` | 인증 사용자 | 학교 피드 |
| `/post_feeds/departments/{departmentId}` | 인증 사용자 | 학과 피드 |
| `/comments/{postId}` | 인증 사용자 | 댓글 실시간 |
| `/comment_stats/{commentId}`, `/comment_likes/{commentId}` | 인증 사용자 | 댓글 좋아요 동기화 |
| `/courses/{courseId}`, `/courses_by_school/{schoolId}` | 인증 사용자 | 강의 메타 |
| `/course_reviews/{courseId}`, `/course_stats/{courseId}` | 인증 사용자 | 강의평 실시간 |
| `/notifications/{userId}` | 본인만 | 알림 push 실시간 |
| `/user_posts/{userId}` ~ `/user_stats/{userId}` | 본인만 | 활동 인덱스 실시간 |
| `/jury_cases/{caseId}`, `/jury_votes/{caseId}`, `/jury_case_stats/{caseId}` | 인증 사용자 | 배심원 결과 실시간 |

**완전 차단** (백엔드 전용): `/reports`, `/reports_by_post`, `/sessions`, `/fcm_tokens`(타인), `/review_locks`(타인) — 신고자/세션 정보 노출 차단. 상세는 [`02_RTDATABASE_SUBSCRIPTION_CONTRACT.md`](02_RTDATABASE_SUBSCRIPTION_CONTRACT.md).

## 6. 프론트 direct write 금지 원칙

**프론트는 어떤 RTDB 경로에도 write하지 않는다.** Firebase Security Rules에서 모든 경로의 `.write`가 `false`로 강제되어 있다. 모든 변경은 반드시 Spring Boot REST API를 통해 백엔드 Admin SDK가 수행한다.

이 원칙을 어기면 (예: 프론트에서 `set(ref(db, '/posts/p1'), {...})`):
- Firebase가 즉시 `PERMISSION_DENIED`로 거부
- 어떤 데이터도 갱신되지 않음
- 백엔드 transaction/multi-location update 일관성도 보장되지 않음

대신 다음 패턴을 사용한다:

```ts
// ❌ 금지: 직접 RTDB write
await set(ref(db, `/posts/p_xxx`), { title: "..." });

// ✅ 정상: REST 호출 → 백엔드가 RTDB write → 프론트는 RTDB read subscription으로 결과 동기화
const created = await api.post('/v1/posts', { boardId, title, content });
// /post_feeds/all/{postId}가 백엔드에 의해 자동 생성되어 구독 중인 피드에 반영됨
```

## 7. 아직 구현하지 않은 API 목록

| Endpoint | 상태 | 메모 |
|---|---|---|
| `GET /v1/jury/me/cases` | **빈 페이지 응답** (200 OK + items=[]) | summonedJurors 인덱스 설계 미완 — 다음 사이클 |
| `POST /v1/courses/{id}/reviews/{rid}/report` | 미구현 | 후속 사이클 |
| `GET /v1/reports/me` | 미구현 | 후속 사이클 |
| `PATCH /v1/users/me/settings` | 미구현 | 후속 사이클 |
| `GET /v1/posts?sort=hot` | **빈 페이지 응답** | hotScore 인덱스 미사용 — 인덱스 등재만 됨 |
| `GET /v1/posts?sort=comments` | **빈 페이지 응답** | commentCount 인덱스 미사용 |
| `PATCH/DELETE /v1/posts/{postId}` | 미구현 | 게시글 수정/삭제는 향후 |
| `PATCH/DELETE /v1/posts/{id}/comments/{cid}` 중 PATCH | 미구현 | DELETE는 구현됨 |

자세한 제약은 [`09_KNOWN_LIMITATIONS.md`](09_KNOWN_LIMITATIONS.md).

## 8. Claude Design 프론트 연결 순서

1. **세션 부트스트랩 화면**
   - Firebase Auth로 로그인 → ID Token 획득 → `POST /v1/auth/session` 호출 → `sessionToken` + `firebaseCustomToken` 저장
   - `firebaseCustomToken`으로 `signInWithCustomToken(auth, ...)` → 이후 RTDB read subscription 가능
2. **홈/피드 (`/feed`)**
   - 초기 로드: `GET /v1/posts?scope=all&sort=latest&limit=20`
   - 실시간: `onValue(ref(db, '/post_feeds/all'))` 구독해 새 postId 도착 알림
3. **게시글 상세 (`/post/:postId`)**
   - 본문: `GET /v1/posts/{postId}` (단발)
   - 댓글: `GET /v1/posts/{postId}/comments?limit=20` (페이지네이션)
   - 좋아요/스크랩 카운터 실시간: `onValue(ref(db, '/post_stats/{postId}'))`
4. **글쓰기 (`/write`)**
   - `POST /v1/posts` — body에 `{ boardId, title, content, tags, isAnonymous }`
5. **강의평 (`/courses`, `/courses/:id`)**
   - 검색: `GET /v1/courses?schoolId=...&q=...&limit=20`
   - 상세 첫 진입 시 `REVIEW_QUOTA_REQUIRED` (422)면 `/courses/:id/review` 작성 화면으로 이동
   - 작성: `POST /v1/courses/{courseId}/reviews`
6. **알림 (`/notifications`)**
   - 초기: `GET /v1/notifications?size=50`
   - 실시간: `onValue(ref(db, '/notifications/{userId}'))` 구독
7. **내 프로필 / 활동 (`/me`, `/me/posts`, `/me/comments`, `/me/likes`, `/me/scraps`)**
   - `GET /v1/users/me`, `/me/stats`, `/me/posts|comments|likes|scraps?limit=20`
8. **배심원 (`/jury/:caseId`)**
   - `GET /v1/jury/cases/{caseId}`, `POST /v1/jury/cases/{caseId}/vote`
   - 진척 실시간: `onValue(ref(db, '/jury_case_stats/{caseId}'))`
9. **Reserved 영역**
   - `/auth/student-card`, `/ai/refine`, `/recap/...` 호출 시 `501 FEATURE_RESERVED` UI는 "준비 중" placeholder로 표시. 자세한 처리는 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md).
