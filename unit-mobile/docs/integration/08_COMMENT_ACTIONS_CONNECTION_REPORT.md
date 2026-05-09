# 08 — Comment Like / Delete Connection Report

> Cycle 3 (runbook). 댓글 좋아요 토글 연결 + 댓글 삭제 API/hook 준비(UI는 보류).
> CommentThread route 타입 string 마이그레이션 함께.

## 1. 연결한 API

```
POST   /v1/posts/{postId}/comments/{commentId}/like   -> { commentId, liked, totalLikes }
DELETE /v1/posts/{postId}/comments/{commentId}        -> { commentId }   (soft delete, idempotent)
```

- 백엔드 컨트롤러: [`PostCommentController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/comments/controller/PostCommentController.java)
- Contract: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §6](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- 두 endpoint 모두 `Authorization: Bearer ...` 자동 부착 (apiClient).
- `postId`, `commentId` 모두 string opaque. `Number()`/`parseInt` 사용 0건. `encodeURIComponent`로만 path 삽입.
- envelope unwrap은 기존 apiClient.

### 응답 필드 명명 차이 (주의)

같은 "like" 도메인이지만 응답 필드가 endpoint별로 다르다:

| Endpoint | 카운트 필드명 |
|---|---|
| `POST /v1/posts/{postId}/like` | `likes` |
| `POST /v1/posts/{postId}/comments/{commentId}/like` | **`totalLikes`** |

Contract를 단일 출처로 따랐다. UI 상태(`CommentItem.likeCount`)는 양쪽 모두 `likeCount`로 통일된 명명.

## 2. 생성/수정 파일

신규:
- [src/hooks/useCommentActions.ts](../../src/hooks/useCommentActions.ts) — per-comment 토글/삭제 hook (optimistic + rollback + per-comment reqId 가드)
- [docs/integration/08_COMMENT_ACTIONS_CONNECTION_REPORT.md](08_COMMENT_ACTIONS_CONNECTION_REPORT.md)

수정:
- [src/types/post.ts](../../src/types/post.ts) — `CommentLikeResponseDto`, `CommentDeleteResponseDto` 추가, `CommentItem`에 `likedByMe?: boolean` 추가
- [src/types/unit-v2.ts](../../src/types/unit-v2.ts) — `CommentThread.commentId: number` → **`string`** 마이그레이션
- [src/services/api/commentApi.ts](../../src/services/api/commentApi.ts) — `likeComment`, `deleteComment` 추가
- [src/hooks/usePostComments.ts](../../src/hooks/usePostComments.ts) — `patchCommentLocally(commentId, patch)` 노출 (단일 출처를 유지하며 optimistic write를 가능하게)
- [src/screens/v2/PostDetailScreen.tsx](../../src/screens/v2/PostDetailScreen.tsx) — `CommentRow`에 좋아요 Pressable 활성, `useCommentActions`를 PostBody에서 생성해 prop 주입
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Comment Like/Delete 완료 표시

수정 안 함:
- 백엔드 0건
- `getPostComments` / `mapCommentItem` 0건 변경
- `usePostActions` (게시글 토글) 0건 변경
- Comment Write hook 0건 변경
- Profile/Notifications/Courses 0건
- Firebase / RTDB / AI 0건

## 3. 댓글 좋아요 UX

- 좋아요 아이콘은 `Pressable`로 변경, `onPress={() => commentActions.toggleCommentLike(comment)}`
- `liked = comment.likedByMe ?? false`
  - 진입 시 `likedByMe`는 contract상 응답에 없음 → `undefined` → 화면에서 false로 시작
  - 토글 후에는 서버 응답이 단일 출처
- pending: 아이콘/카운트 opacity 0.5 + Pressable disabled
- liked: 아이콘 색상 강조(C.inkNavy) + 카운트 폰트 medium
- 에러: 카운트 옆에 작은 빨강 텍스트(`error.message`). 토큰 만료 등 발생 시 표시.

## 4. 댓글 삭제 UI 보류 정책

Runbook §"Cycle 3 주의"의 **안전안** 채택:

- 백엔드 GET `/comments` 응답에 `isMyComment` 신호가 **없음** → viewer가 본인 댓글인지 클라이언트가 알 수 없음
- 따라서 삭제 버튼은 **UI에 노출하지 않음**
- API 함수(`deleteComment`)와 hook 메서드(`commentActions.removeComment`)는 정상 구현 — 다음 Cycle에서 `isMyComment` 신호가 합의되면 즉시 UI 추가 가능

대안 (다음 Cycle 또는 백엔드 합의):
1. backend GET `/comments`에 `isMyComment` 추가
2. `/v1/users/me`의 `userId`/`anonymousId`와 `comment.anonymousId` 비교 (단, anonymousId는 닉네임-스러워 신뢰성 낮음)
3. dev-only 노출 (`__DEV__` 가드)

## 5. patchCommentLocally — 단일 출처 유지

`useCommentActions`는 자체 댓글 상태를 보유하지 않는다. 대신:

- 옵티미스틱 적용 시 `patchCommentLocally(id, { likedByMe, likeCount })`로 list에 직접 patch
- 서버 응답 도착 시 `patchCommentLocally(id, { likedByMe: res.liked, likeCount: Math.max(0, res.totalLikes) })`로 정착
- 실패 시 `patchCommentLocally(id, { likedByMe: prevLiked, likeCount: prevCount })`로 rollback

장점:
- 댓글 list가 항상 단일 출처
- CommentRow는 평소처럼 `comment.likedByMe`/`comment.likeCount`만 읽음 — overlay/병합 로직 없음
- refetch 시 자연스럽게 서버 값으로 reset

`useCommentActions`는 별도로 per-comment `pending`/`error` Map을 보유한다 (UI display용 — list DTO에는 들어가지 않음).

## 6. CommentThread route 마이그레이션

| 파일 | 이전 | 이후 |
|---|---|---|
| [src/types/unit-v2.ts](../../src/types/unit-v2.ts) | `CommentThread: { commentId: number }` | `{ commentId: string }` |

영향 범위:
- `CommentThreadScreen` — `useRoute<...>` 가져오지 않고 mock data만 렌더링 → 변경 영향 0
- 호출부 — cycle 4 이후 `navigate('CommentThread', ...)` 호출 0건 (이전 cycle에서 비활성)

다음 Cycle에서 답글 진입 흐름 재활성 시 `commentId: string` 그대로 사용 가능 (`isReply`인 댓글의 `id`를 그대로 전달).

## 7. 동시성 / Race condition

- per-(commentId, action) reqId 카운터: 같은 댓글에서 like를 빠르게 두 번 누르면 두 번째는 in-flight 가드(`if (likePending[id]) return`)로 무시
- postId 변경 시: useEffect로 모든 per-comment 상태 + reqId Map 초기화 → 다른 게시글로 이동해도 stale 응답 차단
- 다중 댓글 동시 like: 각 댓글이 독립된 reqId를 가지므로 서로 간섭 없음

## 8. ErrorCode 처리

| ApiError code | UI |
|---|---|
| `AUTH_REQUIRED`/`AUTH_INVALID`/`AUTH_EXPIRED` | "로그인이 필요합니다" inline. 토큰 클리어는 apiClient 자동. |
| `NOT_FOUND` | "이미 삭제된 댓글이거나 존재하지 않습니다" |
| `FORBIDDEN`/`USER_SUSPENDED` | "권한이 없습니다" |
| `FEATURE_RESERVED` | "준비 중인 기능입니다" 방어 |
| `NETWORK_ERROR` | "네트워크 연결을 확인해주세요" |
| 그 외 | message 또는 "요청을 처리하지 못했습니다" |

## 9. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`에 lint/build 스크립트 미정의 → 추측 명령 미실행. 새 native module 0건 → `expo install --check` 재실행 불필요.

## 10. PostDetail / Comments GET / Comment Write 회귀 여부

| 항목 | 결과 |
|---|---|
| `usePostComments` 내부 | ✅ patchCommentLocally **추가만**. 기존 5+ 상태/cursor/refetch 로직 0건 변경 |
| `getPostComments` / `mapCommentItem` | ✅ 0건 변경 |
| `usePostActions` (게시글 토글) | ✅ 0건 변경 |
| `useCreateComment` (댓글 작성) | ✅ 0건 변경. 작성 후 refetch 정책 그대로 |
| 댓글 더보기 / 빈 상태 / 에러 / 인증 안내 | ✅ 그대로 |
| `usePostDetail` | ✅ 0건 변경 |
| route param `{ postId: string }` | ✅ 유지 |

## 11. 남은 문제 / TODO

1. **`isMyComment` 신호 부재** → 삭제 버튼 미노출. 다음 사이클 또는 백엔드 협의 필요.
2. **`likedByMe` 초기값 부재**: 진입 시 viewer의 사전 좋아요 여부 모름. 토글 후에만 정확. 위 §3 참고.
3. **답글 UI 미연결**: `parentCommentId` 입력 흐름은 `useCreateComment.setParentCommentId`로 노출되어 있으나 UI 미연결. CommentThread route 마이그레이션은 완료 — 다음 Cycle에서 답글 진입 흐름 재활성 가능.
4. **삭제 UI 추가 시 rollback**: `removeComment`는 현재 prev 상태를 보존하지 않음 (ApiError가 와도 optimistic 상태 유지 + 에러만 노출). 실제 UI 추가 시 prev content/deleted를 인자로 받거나 refetch 트리거를 함께 호출하도록 격상 권장.
5. **post.stats.comments 동기화**: 댓글 작성/삭제 후 게시글 헤더 카운트 즉시 갱신은 별도 사이클 (이전 Cycle 보고서 §7과 동일 정책).

## 12. 다음 Cycle (runbook)

- **Cycle 4. Courses 목록/상세 연결** (`GET /v1/courses`, `GET /v1/courses/{courseId}`)
  - `REVIEW_QUOTA_REQUIRED`(422)는 toast가 아니라 review 화면 라우팅
  - `q`/`schoolId`/`semester`/`cursor`/`limit` 처리, `size` 금지
