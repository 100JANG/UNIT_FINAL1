# 01 — Feed API Connection Report

## 1. 연결한 API

```
GET /v1/posts?scope=<all|school|department>&sort=latest&cursor=<opaque>&limit=20
Authorization: Bearer <sessionToken>   (없으면 헤더 미부착 → 백엔드는 AUTH_REQUIRED 반환)
```

- 백엔드 컨트롤러: [`PostController.feed`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/posts/controller/PostController.java#L52-L61)
- Contract 출처: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §5](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- Pagination 규칙: [`docs/backend-contract/06_PAGINATION_CONTRACT.md`](../backend-contract/06_PAGINATION_CONTRACT.md)
- Error 분류: [`docs/backend-contract/03_ERROR_HANDLING_CONTRACT.md`](../backend-contract/03_ERROR_HANDLING_CONTRACT.md)

탭 매핑(FeedScreen ↔ scope):

| 탭 id | 라벨 | scope |
|---|---|---|
| `all`  | 통합   | `all` |
| `mine` | 내학교 | `school` |
| `dept` | 내학과 | `department` |

`school` / `department`에서 사용자 프로필에 학교·학과가 미등록이면 백엔드는
`422 BUSINESS_RULE_VIOLATION`을 반환한다. 프론트는 빈 화면 대신 안내 상태를 노출한다 (§4 참조).

`sort`는 contract상 `latest` / `hot` / `comments` 중 latest만 인덱스 쿼리. hot/comments는
빈 페이지 응답이라 이번 사이클은 **`latest` 고정**으로만 호출한다.

## 2. 생성/수정 파일

신규:
- [src/services/api/apiTypes.ts](../../src/services/api/apiTypes.ts) — `ApiResponse`, `CursorPage`, `ApiError`
- [src/services/api/apiClient.ts](../../src/services/api/apiClient.ts) — fetch 래퍼, envelope unwrap, Auth 헤더 자동 주입
- [src/services/api/sessionToken.ts](../../src/services/api/sessionToken.ts) — 세션 토큰 in-memory holder (임시)
- [src/services/api/errorHandler.ts](../../src/services/api/errorHandler.ts) — `ErrorKind` 분류, `describeError`
- [src/services/api/pagination.ts](../../src/services/api/pagination.ts) — `cursor`/`limit` (size 금지), `clampLimit(<=50)`
- [src/services/api/feedApi.ts](../../src/services/api/feedApi.ts) — `getPosts({ scope, sort, cursor, limit })`
- [src/services/api/mappers/postMapper.ts](../../src/services/api/mappers/postMapper.ts) — `PostFeedItemDto → PostSummary`
- [src/hooks/useFeedPosts.ts](../../src/hooks/useFeedPosts.ts) — 5-state machine + cursor pagination
- [.env.example](../../.env.example) — `EXPO_PUBLIC_*` 키 안내
- [docs/backend-contract/](../backend-contract/) — 백엔드 contract 10개 문서 1차 복사

수정:
- [src/screens/v2/FeedScreen.tsx](../../src/screens/v2/FeedScreen.tsx) — inline mock 의존 → `useFeedPosts` 사용. mock은 fallback으로 보존.

수정/생성 안 한 것 (의도적):
- 백엔드 어떤 파일도 수정하지 않았다 (controller/service/repo/config 모두 read-only).
- TanStack Query / axios / firebase / async-storage / expo-secure-store는 **설치하지 않았다**.

## 3. FeedPage 상태 처리

`useFeedPosts.status`가 다음 5가지 중 하나로 정착한다:

| status | UI |
|---|---|
| `loading` | 중앙 ActivityIndicator |
| `success` | FlatList (cursor 기반 무한스크롤, `onEndReached` → `loadMore`) |
| `empty`   | "아직 글이 없어요" + "첫 번째 글을 작성해보세요" |
| `error`   | 에러 메시지 + "다시 시도" 버튼 (`refetch`) |
| `business-rule` | "학교/학과 정보가 등록되지 않았습니다" + 백엔드 메시지 |

상태가 `success`로 정착하기 전에는 inline `FALLBACK_POSTS` 두 건이 보이도록 fallback을
유지했다 (mock data complete 삭제 금지 지시 준수). 실제 API 성공 응답이 들어오면 즉시
fallback은 사용되지 않는다.

`BUSINESS_RULE_VIOLATION` 분기는 `useFeedPosts` 내부에서 `ApiError.code` 기준으로
별도 status로 매핑되어 빈 화면이 아니라 안내가 노출된다.

## 4. 사용한 query 방식

- **TanStack Query 미사용** (미설치). `useState` + `useEffect`로 1차 연결.
- 동일 `(scope, sort, limit)` 키 변경 시 race-condition 방지를 위해 `requestId` 토큰을
  사용해 stale 응답을 폐기한다 (`useFeedPosts.ts` `reqIdRef`).
- 후속 사이클에서 TanStack Query 도입 시 `useInfiniteQuery`로 교체할 수 있도록 hook의
  반환 shape (`{ status, posts, error, hasMore, isLoadingMore, loadMore, refetch }`) 를
  안정화했다. FeedScreen은 hook의 반환만 의존하므로 내부 구현 교체에 영향 없음.

## 5. 인증 처리

- `apiClient`는 매 요청마다 `getSessionToken()`을 읽어 `Authorization: Bearer ...`를 붙인다.
- 현재 token holder는 module-level in-memory ([sessionToken.ts](../../src/services/api/sessionToken.ts)).
  앱 시작 시 토큰을 set 하는 화면(LoginScreen 등)이 아직 API에 연결되지 않았으므로,
  로컬 수동 테스트 시에는 `setSessionToken('...')`을 디버그 화면에서 호출하거나
  `App.tsx` 부트 시퀀스에 임시로 끼워넣어 검증 가능.
- 401(`AUTH_REQUIRED` / `AUTH_INVALID`) 응답이 오면 hook은 `error` 상태로 진입한다.
  자동 로그아웃 / 재로그인 라우팅은 본 사이클에서 구현하지 않음 (auth 화면 통합 시 추가).

## 6. 금지 사항 준수 확인

| 항목 | 결과 |
|---|---|
| 백엔드 코드 변경 | 없음 |
| 백엔드 API 변경 | 없음 |
| RTDB write 코드 추가 | 없음 |
| Firebase SDK 사용 | 없음 |
| AI / Gemma / OCR / Recap 구현 | 없음 |
| PWA / Service Worker | 해당 없음(RN) |
| `size` 파라미터 | 없음 (`limit`만 사용) |
| `/post_comments` 경로 | 없음 |
| 하드코딩 API URL | 없음 — 모두 `EXPO_PUBLIC_API_BASE_URL` 경유. fallback도 `localhost:8080/v1`로 환경변수 미설정 시에만 사용. |
| `response.data` unwrap 없이 사용 | 없음 — apiClient만이 envelope을 풀고 `result`를 반환 |
| `.env`/credentials 파일 생성 | 없음 — `.env.example`만 placeholder로 작성 |
| 백엔드+프론트 합본 | 없음 |

## 7. Contract 필드와 명세 필드의 차이

원본 명세에서 PostCard 필수 필드로 `boardName`, `tags`, `author.anonymousId`를 요구했다.
실제 contract `PostFeedItemResponse`는:

```json
{ "postId", "boardId", "title", "preview", "anonymousId", "createdAt",
  "stats": { "likes", "comments", "scraps" } }
```

이며 `boardName`/`tags`가 없고 `anonymousId`는 flat이다. **Contract가 단일 출처**이므로
mapper에서 다음과 같이 normalize:

- `boardName` → `null`  (board-id → label lookup은 후속 작업)
- `tags` → `undefined`  (응답에 없음)
- `author.anonymousId` ← flat `anonymousId`에서 파생

UI 렌더링은 일단 `boardName ?? boardId`로 fallback해 board id를 뱃지로 노출한다.
보드 라벨 매핑은 Reserved 작업으로 분리.

## 8. 남은 문제 / 알려진 한계

1. **PostDetail 라우트 타입 불일치**:
   `RootStackParamList.PostDetail`은 `{ postId: number }`인데 백엔드 `postId`는 string(`p_xxxx`).
   현재 FeedScreen은 mock id가 `mock_1` 형태라 numeric 변환이 실패하면 navigate를 막는 가드만
   둔 상태. 실제 API 응답에서도 navigate가 동작하지 않는다. → PostDetail 연결 사이클에서
   라우트 타입을 string으로 마이그레이션해야 함.
2. **세션 토큰 영속화 부재**: 앱 재시작 시 토큰이 사라진다. `expo-secure-store` 도입은 별도 사이클.
3. **TanStack Query 미설치**: race-condition은 reqId 토큰으로 방어 중. 후속 사이클에서 도입.
4. **Sort UI 미연결**: "최신순" Pressable은 노출만 되어 있고 핸들러 없음 (이번 사이클 범위 외).
5. **board-id → label 매핑 미구현**: Pill에 `boardId`가 그대로 노출됨.
6. **AUTH_EXPIRED 자동 refresh 미구현**: 401 시 retry 흐름 없음 — auth 화면 통합 사이클로 이월.

## 9. 실행 결과

- 백엔드: `./gradlew.bat clean test bootJar` → **BUILD SUCCESSFUL in 10s** (테스트 전부 통과)
- 프론트: `tsc --noEmit` → **exit 0** (clean)
- E2E 수동 테스트는 본 사이클 범위 외(인증 토큰 발급 흐름 미연결). Postman 등으로
  `POST /v1/auth/session` → sessionToken 획득 → `setSessionToken(...)` 후 `GET /v1/posts`
  검증 가능.
