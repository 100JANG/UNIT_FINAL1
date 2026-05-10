# 02 — Remaining Connection Plan

> Feed API 1차 연결 이후의 권장 연결 순서. 각 단계는 독립된 PR/사이클로 분리한다.

## 권장 순서

### Cycle A — Auth 토큰 흐름 정상화 (선결)
- 화면: LoginScreen / EmailVerifyScreen / ProfileSetupScreen
- API: `POST /v1/auth/session`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`
- 작업:
  - `expo-secure-store` 도입 → `sessionToken` 영속화
  - `apiClient`에 401 인터셉터 추가 → `AUTH_EXPIRED`면 1회 refresh 시도
  - 인증 컨텍스트(zustand 또는 Context API) 설계
- 참고: [05_AUTH_TOKEN_CONTRACT.md](../backend-contract/05_AUTH_TOKEN_CONTRACT.md)

### ~~Cycle B — Post Detail~~ → **완료 (Cycle 3)**
- 화면: `screens/v2/PostDetailScreen.tsx`
- API: `GET /v1/posts/{postId}` ✅
- 선행: PostDetail route 타입 string 마이그레이션 → Cycle 2 완료
- 매퍼: `PostDetailResponse → PostDetail` → [postDetailMapper.ts](../../src/services/api/mappers/postDetailMapper.ts)
- 상태: idle / loading / success / not-found / auth-required / forbidden / reserved / error
- 상세: [04_POST_DETAIL_CONNECTION_REPORT.md](04_POST_DETAIL_CONNECTION_REPORT.md)

### Cycle C — Comments
- 화면: `screens/v2/PostDetailScreen.tsx`(목록), `screens/v2/CommentThreadScreen.tsx`(스레드)
- API:
  - ✅ `GET /v1/posts/{postId}/comments?cursor=&limit=` — **Cycle 4 완료** ([05_COMMENTS_CONNECTION_REPORT.md](05_COMMENTS_CONNECTION_REPORT.md))
  - ✅ `POST /v1/posts/{postId}/comments` — **Cycle 6 완료** ([07_COMMENT_WRITE_CONNECTION_REPORT.md](07_COMMENT_WRITE_CONNECTION_REPORT.md))
  - ✅ `POST /v1/posts/{postId}/comments/{commentId}/like` — **Cycle 3 완료** ([08_COMMENT_ACTIONS_CONNECTION_REPORT.md](08_COMMENT_ACTIONS_CONNECTION_REPORT.md))
  - ✅ `DELETE /v1/posts/{postId}/comments/{commentId}` — **API/hook 완료**. UI 버튼은 `isMyComment` 신호 부재로 보류
- 주의: 경로는 `/v1/posts/{postId}/comments`이며 `/post_comments` 형태 사용 금지.
- ✅ `UnitV2ParamList.CommentThread.commentId` number → string 마이그레이션 완료 (Cycle 3).
- 이월: 답글 UI 연결 (parentCommentId 입력 흐름 + CommentThread 진입). 다음 사이클 후보.
- 이월: 댓글 삭제 UI는 `isMyComment` 합의 후 노출.
- 이월: 작성/삭제 후 `post.stats.comments` 동기화 격상.

### ~~Cycle D — Like / Scrap~~ → **완료 (Cycle 5)**
- API:
  - ✅ `POST /v1/posts/{postId}/like` (toggle)
  - ✅ `POST /v1/posts/{postId}/scrap` (toggle — DELETE는 사용 안 함, contract 준수)
- 옵티미스틱 업데이트 + 실패 rollback 적용. reqId 토큰 + pending 가드로 동시성 방어.
- `myActions` 부재: 초기 liked/scrapped는 false에서 시작, 토글 응답을 단일 출처로 정착.
- Feed의 `stats.likes`/`stats.scraps` 동기화는 별도 작업으로 이월 (focus refetch 또는 글로벌 캐시).
- 상세: [06_POST_ACTIONS_CONNECTION_REPORT.md](06_POST_ACTIONS_CONNECTION_REPORT.md)

### Cycle E — Courses / Course Review
- 화면: `CoursesScreen`, `CourseDetailScreen`, `CourseReviewScreen`
- API:
  - ✅ `GET /v1/courses` — **Cycle 4 완료** ([09_COURSES_CONNECTION_REPORT.md](09_COURSES_CONNECTION_REPORT.md))
  - ✅ `GET /v1/courses/{courseId}` — **Cycle 4 완료**
  - ✅ `POST /v1/courses/{courseId}/reviews` — **Cycle 5 완료** ([10_COURSE_REVIEW_WRITE_REPORT.md](10_COURSE_REVIEW_WRITE_REPORT.md))
- 주의: `REVIEW_QUOTA_REQUIRED` (422) → 토스트가 아니라 `CourseReview` 화면으로 라우팅 (Cycle 4에서 정착).
- ✅ Course route 타입 number → string 마이그레이션 완료 (Cycle 4).

### Cycle F — Profile / Users
- 화면: `ProfileScreen`, `OtherProfileScreen`, `MyPostsScreen`, `MyCommentsScreen`, `ScrapsScreen`
- API: `GET /v1/users/me`, `GET /v1/users/{userId}`, `GET /v1/users/me/posts`, `GET /v1/users/me/comments`, `GET /v1/users/me/scraps`
- `studentNumberMasked`, `enrollmentStatus: RESERVED` 처리.

### Cycle G — Notifications
- 화면: `NotificationsScreen`
- API: `GET /v1/notifications?cursor=&limit=`, `POST /v1/notifications/{id}/read`

### Cycle H — RTDB Read Subscription (READ-ONLY)
- 선결: `EXPO_PUBLIC_ENABLE_RTDATABASE=true` + Firebase 설정값 입력
- Firebase JS SDK 도입 (Expo 호환): `@react-native-firebase/database` 또는 `firebase/database` (web SDK)
- 구독 경로 contract: [02_RTDATABASE_SUBSCRIPTION_CONTRACT.md](../backend-contract/02_RTDATABASE_SUBSCRIPTION_CONTRACT.md)
- **WRITE는 절대 금지** — set/update/push/remove 사용 금지.
- 실시간 경량화 대상(예: 알림 뱃지 카운트, 채팅) 한정으로 도입.

### Cycle I — Reserved Screens
- 학생증 OCR(`/v1/auth/student-card/verify`), AI Refine(`/v1/ai/refine`), Recap(`/v1/recap/...`)
- 모두 501 `FEATURE_RESERVED` 반환. UI는 placeholder + "준비 중" 안내.
- contract: [04_RESERVED_FEATURE_CONTRACT.md](../backend-contract/04_RESERVED_FEATURE_CONTRACT.md)
- 호출하지 않는 것이 원칙. UI는 비활성/안내만.

## 횡단 작업 (어느 cycle에든 끼워넣을 수 있음)

- **TanStack Query 도입**: 모든 hook이 `useFeedPosts` 패턴을 그대로 따라가게 한 뒤,
  hook 내부 구현만 `useInfiniteQuery` / `useQuery`로 교체. 반환 shape은 유지.
- **Toast/Snackbar 시스템**: error 분류기(`errorHandler.ts`)와 결합하여 일관된 UX 제공.
- **board-id → label 매핑**: Pill에 한글 보드명을 노출하기 위한 정적 lookup. `/v1/boards`
  endpoint 도입 여부는 백엔드와 협의.
- **API 응답 캐싱 정책**: ETag/If-None-Match 또는 cache-key 정책. Feed는 short-TTL 정책 추천.

## 다음 추천 작업 (단기)

1. **Cycle A (Auth)** 먼저 — 다른 모든 cycle이 `Authorization: Bearer ...`에 의존.
2. **Cycle B (PostDetail)** — Feed → PostDetail 네비게이션이 현재 막혀 있음(라우트 타입 미스매치).
3. **Cycle D (Like/Scrap)** — Feed 카드의 stats를 의미있게 만들기 위함.
