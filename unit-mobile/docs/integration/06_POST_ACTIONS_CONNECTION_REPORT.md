# 06 — Post Like / Scrap Connection Report

> Cycle 5 (2026-05-10). PostDetail의 게시글 좋아요/스크랩 토글 API 연결.
> 댓글 작성/좋아요/삭제, Feed 카드 stats 동기화는 이번 사이클 범위 외.

## 1. 연결한 API

```
POST /v1/posts/{postId}/like     -> { postId, liked, likes }
POST /v1/posts/{postId}/scrap    -> { postId, scrapped, totalScraps }
```

- 두 endpoint 모두 **POST 토글**. `DELETE /scrap` 미사용 (contract 준수).
- 본 cycle은 `Authorization: Bearer ...` 자동 부착(apiClient).
- `postId`는 string opaque (`p_xxxx`). `Number()`/`parseInt` 사용 0건. `encodeURIComponent`로만 path 삽입.
- 응답 envelope unwrap은 기존 apiClient.

### Contract와 cycle 5 brief의 차이

Brief는 like 응답 예시를 `{ liked, totalLikes }`로 들었으나, **실제 contract는 `{ postId, liked, likes }`** (`totalLikes`가 아니라 `likes`):

```json
// POST /v1/posts/{postId}/like
{ "postId": "p_xxxx", "liked": true, "likes": 25 }

// POST /v1/posts/{postId}/scrap
{ "postId": "p_xxxx", "scrapped": true, "totalScraps": 7 }
```

Contract를 단일 출처로 따랐다. `PostLikeResponseDto.likes` 필드명은 백엔드 그대로 — 임의명(`totalLikes`/`likeTotal` 등) 사용 0건. UI 상태(`PostActionState.likeCount`)는 별도 명명으로 정리.

## 2. 생성/수정한 파일

신규:
- [src/hooks/usePostActions.ts](../../src/hooks/usePostActions.ts) — `usePostActions({ postId, initialLikeCount, initialScrapCount, initialLiked?, initialScrapped? })`
- [docs/integration/06_POST_ACTIONS_CONNECTION_REPORT.md](06_POST_ACTIONS_CONNECTION_REPORT.md)

수정:
- [src/types/post.ts](../../src/types/post.ts) — `PostLikeResponseDto`, `PostScrapResponseDto`, `PostActionState` 추가
- [src/services/api/postApi.ts](../../src/services/api/postApi.ts) — `likePost`, `togglePostScrap` 추가 (별도 파일 분리 없이 같은 파일에서 확장)
- [src/screens/v2/PostDetailScreen.tsx](../../src/screens/v2/PostDetailScreen.tsx) — 로컬 `liked`/`scrapped` `useState` 제거 → `usePostActions` 사용. ActionBtn에 `pending` prop 추가, 에러 메시지 inline 노출.
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Like/Scrap 완료 표시

수정 안 함:
- 백엔드 — 0건
- 댓글 작성/좋아요/삭제 API — 0건
- Profile / Courses / Notifications / RTDB / Firebase / AI — 0건

## 3. Like / Scrap 상태 설계

### Hook 입력

```ts
usePostActions({
  postId,
  initialLikeCount,    // post.stats.likes
  initialScrapCount,   // post.stats.scraps
  initialLiked?,       // post.myActions?.liked   (optional — see §6)
  initialScrapped?,    // post.myActions?.scrapped (optional — see §6)
})
```

### Hook 반환

```ts
{
  liked, scrapped,
  likeCount, scrapCount,
  isLikePending, isScrapPending,
  likeError, scrapError,         // ActionError | null
  toggleLike(), toggleScrap(),
}
```

`ActionError`는 `{ kind, message }` 형태로 분류된다:
- `auth-required` (AUTH_REQUIRED/AUTH_INVALID/AUTH_EXPIRED)
- `not-found` (NOT_FOUND)
- `forbidden` (FORBIDDEN/USER_SUSPENDED)
- `business-rule` (BUSINESS_RULE_VIOLATION) — 서버 message 그대로
- `reserved` (FEATURE_RESERVED — 방어적)
- `network` (NETWORK_ERROR)
- `unknown` (그 외)

### UI

- 좋아요 활성: 아이콘 + 라벨이 `C.inkNavy`로 강조
- 스크랩 활성: 아이콘 + 라벨이 `C.warn`(노랑)로 강조
- Pending: 버튼 `disabled` + opacity 0.5
- 에러: action row 바로 아래에 작은 빨강 텍스트 (likeError ?? scrapError 우선)

## 4. Optimistic UI 정책

토글 흐름:
1. **즉시** 다음 상태 반영 (liked toggle, count `+1`/`-1`, count는 `Math.max(0, ...)`로 floor 보호)
2. `isXxxPending = true`, `xxxError = null`
3. POST 호출
4. 응답 도착 → 서버가 단일 진실: `setLiked(res.liked)`, `setLikeCount(Math.max(0, res.likes))`. 옵티미스틱과 다르면 자동 정정됨.
5. `isXxxPending = false`

요청이 in-flight인 동안에는 같은 버튼 클릭이 무시된다 (`if (isLikePending) return;`).

## 5. Rollback 정책

응답이 ApiError 등 실패면:
- prevLiked/prevCount로 **즉시 복원**
- `setXxxError(toActionError(e))` — UI에서 inline 메시지 노출
- pending=false

reqId 토큰(`likeReqRef` / `scrapReqRef`)은 stale 응답 차단:
- postId가 바뀌면 `ref.current++` → 이전 fetch의 then/catch는 commit 시점에 `myReq !== current`로 폐기
- 같은 postId에서도 이론적으로 동일 — 다만 위에서 pending 가드가 이미 동시 실행을 막음

count 음수 방어:
- 옵티미스틱 적용 시 `Math.max(0, count + delta)`
- 서버 응답 적용 시 `Math.max(0, res.likes)` / `Math.max(0, res.totalScraps)` (백엔드는 이미 floor 0 보호하지만 이중 안전망)

## 6. myActions 부재 처리

`GET /v1/posts/{postId}` contract에는 `myActions`가 없다. 따라서:

- `usePostActions`는 `initialLiked` / `initialScrapped`를 `optional`로 받음 — 빠지면 `false`로 시작
- `PostDetail.myActions`는 `undefined`로 채워짐 (mapper에서 명시적으로 `undefined`)
- 사용자가 토글하기 전에는 화면상 항상 "비활성" 상태로 보임 → 실제로 이전에 좋아요/스크랩한 적이 있어도 표시되지 않음
- 토글 후에는 백엔드 응답이 단일 진실 — `liked: true` 응답을 받으면 그 시점부터 활성으로 정착

후속 옵션 (다음 사이클 또는 백엔드 협의):
1. `GET /v1/posts/{postId}` 응답에 `myActions: { liked, scrapped, reported }` 추가 요청 (백엔드 수정 필요)
2. 별도 endpoint로 `GET /v1/posts/{postId}/my` 같은 viewer 상태 조회
3. `/v1/users/me/likes` 등 사용자 활동 목록을 한 번에 받아 in-memory join

## 7. Feed stats 동기화 정책

**이번 사이클은 Feed 동기화를 시도하지 않는다.** 이유:
- PostDetail에서 토글한 결과를 Feed의 카드(stats.likes/scraps)에 반영하려면 글로벌 캐시(or zustand/jotai/TanStack Query) 필요 → 본 cycle 범위 초과
- 무리한 동기화는 race condition / 부정확한 카운트의 원천

대안:
1. 사용자가 PostDetail에서 빠져나와 Feed로 돌아오면 자동으로 한 번 refetch (FlatList focus 이벤트 활용 — 후속 작업)
2. TanStack Query 도입 후 query key(`['posts', scope, sort]`)를 invalidate
3. 그냥 다음 cursor fetch 시 자연 재동기화 (최신순 피드라 보통 재진입 시 최신 데이터)

문서화 외 코드 변경은 0건.

## 8. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`에 lint/build 스크립트 미정의 → 추측 명령 미실행. 새 native module 추가 0건 → `expo install --check` 재실행 불필요.

수동 E2E 점검 권장:
1. Postman으로 `POST /v1/auth/session` → `sessionToken` 획득
2. Expo Go에서 FeedScreen DEV 패널로 토큰 저장
3. 카드 tap → PostDetail 진입
4. 추천 버튼 tap → 즉시 활성 + count `+1`, 잠시 후 서버 응답으로 정착
5. 한 번 더 tap → `likes: false` + count `-1` (서버에서 floor 0 보호)
6. 스크랩 버튼 tap → 동일 패턴
7. 토큰을 일부러 망가뜨린 뒤 tap → 옵티미스틱 적용 후 즉시 rollback + "로그인이 필요합니다" inline

## 9. PostDetail 회귀 여부

| 항목 | 결과 |
|---|---|
| PostDetail typecheck | ✅ |
| post 본문/태그/stats 렌더링 | ✅ 변경 없음 |
| 댓글 GET section | ✅ 변경 없음 |
| 게시글 like 카운트 표시 | ✅ usePostActions의 likeCount로 단일 출처화 |
| 게시글 scrap 카운트 표시 | ✅ usePostActions의 scrapCount로 단일 출처화 |
| 공유 버튼 | ✅ 로컬 toast 그대로 |
| route param `{ postId: string }` | ✅ 유지 |
| Feed → PostDetail navigate | ✅ string postId 그대로 |

## 10. Feed 회귀 여부

Feed 코드 0건 변경. Feed의 stats(likes/scraps)는 PostDetail에서 토글해도 동기화되지 않음 — §7 참고. 회귀 자체는 없음.

## 11. 남은 문제 / TODO

1. **myActions 신호 부재**: 진입 시 viewer 상태가 항상 false로 시작 — 이전에 좋아요/스크랩한 글에 대해서도 빈 상태로 보임. backend 합의 필요.
2. **Feed → PostDetail 토글 → Feed 복귀 시 stats 미반영**: focus 시 재조회 또는 글로벌 캐시 도입 후 해결.
3. **이중 옵티미스틱 동시성**: like와 scrap을 동시에 누르는 케이스는 둘 다 별도 reqId로 안전 처리됨. 그러나 like를 빠르게 두 번 (toggle on → off) 누르면 첫 요청 응답이 늦게 와서 옵티미스틱과 잠깐 깜박일 수 있음 — 현 정책은 in-flight 동안 클릭 무시이므로 첫 응답 도착까지 사용자는 한 번만 누를 수 있음.
4. **댓글 좋아요 / 댓글 작성 / 댓글 삭제** 미연결 (의도적 — 본 사이클 범위 외).
5. **AUTH_EXPIRED 자동 refresh**: 기존 정책 그대로 (apiClient는 토큰 클리어까지만, 자동 재시도 미구현).
6. **공유 버튼은 여전히 로컬 toast** — 실제 sharesheet 연동은 별도 cycle.

## 12. 다음 추천 작업

1. **Comment write API** — `POST /v1/posts/{postId}/comments`. parentCommentId로 reply, depth 2는 422.
2. **Comment like / delete** — `POST /v1/posts/{postId}/comments/{commentId}/like` (toggle), `DELETE /v1/posts/{postId}/comments/{commentId}` (본인 only). `isMyComment` 신호 부재 → `/v1/users/me`로 anonymousId/userId 비교 또는 contract 추가 필요. `CommentThread` route 타입 string 마이그레이션도 함께.
3. **Courses API** — `GET /v1/courses`, `GET /v1/courses/{id}`. `REVIEW_QUOTA_REQUIRED`(422)는 toast가 아니라 `CourseReview` 화면으로 라우팅.
