# 05 — Comments (GET) Connection Report

> Cycle 4 (2026-05-10). 댓글 목록 조회 API만 연결. 작성/좋아요/삭제는 다음 사이클.

## 1. 연결한 API

```
GET /v1/posts/{postId}/comments?cursor={cursor}&limit={limit}
Authorization: Bearer <sessionToken>
```

- 백엔드 컨트롤러: [`PostCommentController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/comments/controller/PostCommentController.java)
- Contract 출처: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §6](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- `postId`는 string opaque (`p_xxxx`). `Number()` / `parseInt` 사용 0건. `encodeURIComponent`로 path 삽입.
- Pagination: `cursor` + `limit`만 사용. `size` 파라미터 사용 0건. limit 기본 20, 최대 50.
- 응답 정렬은 `createdAt` ASC (작성 순) — 클라 측에서 재정렬하지 않음.

### Contract와 cycle 4 brief 사이의 차이

Brief는 `author: { anonymousId, isMyComment }` 중첩 구조를 예시로 들었으나, 실제 contract는
**flat shape**:

```json
{
  "commentId": "c_xxxx",
  "postId": "p_xxxx",
  "anonymousId": "익명_a3f9",
  "content": "댓글 본문",
  "parentCommentId": null,
  "deleted": false,
  "likes": 3,
  "createdAt": "2026-05-09T08:15:00Z"
}
```

- `author` wrapper 없음 → `anonymousId`는 flat
- `isMyComment` 응답에 없음 → `CommentItem.isMyComment`는 항상 `undefined` (다음 사이클에서 like/delete 응답으로만 채울 수 있음)
- `updatedAt` 응답에 없음 → 타입에서도 제거
- 삭제된 댓글은 백엔드가 `content`를 `"삭제된 댓글입니다."`로 마스킹 + `deleted=true`로 반환 → 프론트는 dim 처리만

Contract를 단일 출처로 따랐으며 brief의 차이는 본 문서에 기록.

## 2. 생성/수정한 파일

신규:
- [src/services/api/commentApi.ts](../../src/services/api/commentApi.ts) — `getPostComments({ postId, cursor, limit })`
- [src/services/api/mappers/commentMapper.ts](../../src/services/api/mappers/commentMapper.ts) — `mapCommentItem(dto)`
- [src/hooks/usePostComments.ts](../../src/hooks/usePostComments.ts) — state machine + cursor + race guard
- [docs/integration/05_COMMENTS_CONNECTION_REPORT.md](05_COMMENTS_CONNECTION_REPORT.md)

수정:
- [src/types/post.ts](../../src/types/post.ts) — `CommentDto` 정정(`updatedAt` 제거, `deleted` 필수), `CommentItem` UI 타입 추가
- [src/screens/v2/PostDetailScreen.tsx](../../src/screens/v2/PostDetailScreen.tsx) — `MOCK_COMMENTS` 완전 제거 → `<CommentsSection postId={post.postId} />`로 교체. reply/답글 navigate는 본 사이클에서 비활성(다음 cycle에서 CommentThread 라우트 string 마이그레이션과 함께)
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Comments GET 완료 표시

수정 안 함:
- 백엔드 — 0건 변경
- Like/Scrap, Comment write, Comment like, Comment delete API — 손대지 않음
- RTDB / Firebase / AI / OCR / Recap — 0건

## 3. 댓글 타입 구조

### Wire DTO ([src/types/post.ts](../../src/types/post.ts))

```ts
type CommentDto = {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  anonymousId: string;
  content: string;
  createdAt: string;
  likes: number;
  deleted: boolean;
};
```

### UI shape

```ts
type CommentItem = {
  id: string;                       // commentId
  postId: string;
  parentCommentId: string | null;
  anonymousId: string;
  content: string;
  createdAt: string;
  likeCount: number;                // dto.likes
  deleted: boolean;
  isMyComment?: boolean;            // reserved — undefined until like/delete cycle
};
```

`mapCommentItem` (단방향 DTO → UI). `any` 타입 0건. PostDetailScreen은 `CommentItem`만 소비 — DTO에 직접 접근하지 않음.

## 4. cursor / limit 처리

- query 빌더는 기존 [`pagination.ts`](../../src/services/api/pagination.ts)의 `buildCursorQuery` 재사용 — `clampLimit(<=50)`, default 20, `size` 미생성 보장.
- cursor는 hook 내부 `useState`에만 보관, **컴포넌트로 노출하지 않음**. cursor 파싱 0건.
- `loadMore()`는 `hasMore && !isLoadingMore && status === 'success'`일 때만 동작.
- postId / limit 변경 시 reqId 토큰으로 stale 응답 폐기.

## 5. PostDetail 화면 상태 처리

`CommentsSection` 컴포넌트는 다음을 처리:

| status | UI |
|---|---|
| `idle` / `loading` | 작은 ActivityIndicator (게시글 본문 로딩과 분리됨 — PostBody가 이미 success일 때만 렌더) |
| `success` (items > 0) | 댓글 리스트. `parentCommentId !== null`이면 들여쓰기 + 옅은 배경. `deleted`면 italic + 흐린 텍스트. `likeCount` 표시 |
| `success` (items = 0) | "아직 댓글이 없어요" |
| `auth-required` | "댓글을 보려면 로그인이 필요합니다" + DEV 패널 안내 |
| `not-found` | "댓글을 불러올 수 없습니다" + 메시지 (게시글 자체 not-found와 분리됨) |
| `reserved` | "준비 중인 기능입니다" (방어적 — Comments는 Reserved 아님) |
| `error` | message + "댓글 다시 불러오기" 버튼 |
| `hasMore` | 리스트 끝에 "댓글 더보기" 버튼 (탭 → loadMore. 로딩 중은 spinner). 무한스크롤은 PostDetail이 ScrollView 기반이라 후속 사이클로 이월 |

게시글 stats:
- 헤더 라벨은 `post.stats.comments`(전체 카운트) 그대로 — pagination 후에도 정확
- 댓글 수와 reply 표시는 dto의 `parentCommentId`만으로 결정 (백엔드가 depth ≤ 1 보장)

## 6. 댓글 작성 / 좋아요 / 삭제 — 미연결 명시

본 사이클에서 **연결하지 않음**:

| 항목 | 상태 |
|---|---|
| 댓글 입력바 (`<TextInput>` + 등록) | UI 유지, `onPress`는 draft만 비우는 no-op (cycle 5에서 `POST /v1/posts/{postId}/comments` 연결 예정) |
| 댓글 좋아요 버튼 | 좋아요 카운트만 표시. 탭 핸들러 없음 (cycle 5에서 `POST /v1/posts/{postId}/comments/{commentId}/like` 연결) |
| 댓글 삭제 | UI 0건 (작성자 본인 댓글만 가능 — `isMyComment` 신호 부재로 cycle 5와 같이 진행) |
| "답글" / CommentThread navigate | 본 사이클에서 비활성. 다음 사이클에서 `RootStackParamList.CommentThread` 또는 `UnitV2ParamList.CommentThread`의 `commentId`를 number → string으로 마이그레이션 필요 |

## 7. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`에 lint/build 스크립트 미정의 → 추측 명령 미실행. 새 native module 추가 없으므로 `expo install --check` 재실행 불필요.

수동 E2E 점검 권장 흐름:
1. `POST /v1/auth/session` (Postman) → sessionToken 획득
2. Expo Go에서 FeedScreen DEV 패널에 토큰 저장
3. 피드 카드 tap → PostDetail 진입
4. 댓글 영역에서 loading → success/empty 확인
5. (있다면) "댓글 더보기" 탭 → cursor pagination 동작 확인
6. 토큰 잘못 입력 → "댓글을 보려면 로그인이 필요합니다" 안내 확인

## 8. PostDetail 회귀 여부

| 항목 | 결과 |
|---|---|
| PostDetail typecheck | ✅ |
| post 본문 / 태그 / stats 렌더링 | ✅ 변경 없음 |
| 게시글 like/scrap 로컬 토글 | ✅ 변경 없음 |
| route param `{ postId: string }` | ✅ 유지 |
| Feed → PostDetail navigate | ✅ string postId 그대로 |
| AppBar 제목 (boardName ?? boardId) | ✅ 유지 |

## 9. 남은 문제 / TODO

1. **댓글 답글(reply) 네비게이션 비활성**: `UnitV2ParamList.CommentThread.commentId`가 여전히 `number`. 백엔드 commentId는 string(`c_xxxx`). cycle 5에서 string으로 마이그레이션 + reply 흐름 재활성.
2. **댓글 작성 / 좋아요 / 삭제 미연결** (의도적 — 본 사이클 범위 외).
3. **무한 스크롤 미적용**: PostDetail은 ScrollView 기반(`Screen scrollable`)이라 FlatList의 `onEndReached`를 직접 못 씀. 현재는 "댓글 더보기" 버튼 방식. 무한스크롤은 PostDetail 전체를 FlatList의 `ListHeaderComponent`로 재구성하는 별도 작업 필요.
4. **`isMyComment` 신호 부재**: 현재 응답으로는 viewer 소유 여부 판단 불가 → 삭제 버튼을 어디에 노출할지 cycle 5에서 backend와 협의 또는 `/v1/users/me` 응답의 `userId`/`anonymousId`와 비교 로직 도입.
5. **AUTH_EXPIRED 자동 refresh 미구현**: 기존 정책 그대로 (apiClient는 토큰 클리어까지만).
6. **댓글 정렬 UI**: "최신순" Pressable은 라벨만 노출. 백엔드는 `createdAt` ASC 고정 — 정렬 옵션 도입은 contract 변경 필요.

## 10. 다음 추천 작업

1. **Comment write API 연결** (`POST /v1/posts/{postId}/comments`) — `parentCommentId`로 reply도 같은 endpoint. depth 2 시도 시 422 처리.
2. **Comment like / delete 연결** — `POST /v1/posts/{postId}/comments/{commentId}/like` (toggle), `DELETE /v1/posts/{postId}/comments/{commentId}` (본인만, 502 idempotent). `isMyComment` 신호 합의 후 진행.
3. **게시글 Like / Scrap 연결** — `POST /v1/posts/{postId}/like`, `POST/DELETE /v1/posts/{postId}/scrap`. Optimistic update + 실패 롤백, 응답으로 `myActions` 채움.
4. **CommentThread route 타입 string 마이그레이션** — Comment write 사이클과 함께.
