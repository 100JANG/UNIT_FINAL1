# 07 — Comment Write Connection Report

> Cycle 6 (2026-05-10). 댓글 작성(POST) API만 연결. 댓글 좋아요/삭제, 답글 UI는 다음 사이클.

## 1. 연결한 API

```
POST /v1/posts/{postId}/comments
Authorization: Bearer <sessionToken>
Body: { "content": string, "parentCommentId": string | null }
```

- 백엔드 컨트롤러: [`PostCommentController`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/comments/controller/PostCommentController.java)
- Contract 출처: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §6](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- `postId`는 string opaque (`p_xxxx`). `Number()`/`parseInt` 사용 0건. `encodeURIComponent`로 path 삽입.
- envelope unwrap은 기존 apiClient 재사용.
- `parentCommentId`가 `undefined`이면 명시적 `null`로 직렬화하여 contract 그대로 전송 — `omit` 처리하지 않음(contract 모호성 회피).

### 응답 shape (실측)

```json
{
  "code": "SUCCESS",
  "message": "댓글이 작성되었습니다",
  "result": {
    "commentId": "c_xxxx",
    "postId": "p_xxxx",
    "parentCommentId": null,
    "createdAt": "2026-05-09T08:15:00Z"
  }
}
```

응답이 **최소 필드**라 `content`/`anonymousId`/`likes`가 없다. → 작성 직후 임시 `CommentItem`을 합성하지 않고 **GET 리스트 refetch**로 정착시키는 정책 채택 (§5).

## 2. 생성/수정 파일

신규:
- [src/hooks/useCreateComment.ts](../../src/hooks/useCreateComment.ts) — state + submit + clearDraft + 에러 분류 + 1000자 cap
- [docs/integration/07_COMMENT_WRITE_CONNECTION_REPORT.md](07_COMMENT_WRITE_CONNECTION_REPORT.md)

수정:
- [src/types/post.ts](../../src/types/post.ts) — `CreateCommentRequest`, `CreateCommentResponseDto` 추가
- [src/services/api/commentApi.ts](../../src/services/api/commentApi.ts) — `createPostComment({ postId, content, parentCommentId? })` 추가
- [src/screens/v2/PostDetailScreen.tsx](../../src/screens/v2/PostDetailScreen.tsx)
  - `usePostComments`를 PostBody로 lift → `commentsHook` 형태로 `CommentsSection`에 prop으로 주입
  - 새 `CommentInputBar` 컴포넌트로 입력바 분리 + `useCreateComment` 사용
  - `onCreated` 콜백으로 `commentsHook.refetch` 호출 → 작성 성공 시 첫 페이지부터 재조회
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Comment Write 완료 표시

수정 안 함:
- 백엔드 0건
- 댓글 좋아요/삭제, 게시글 Like/Scrap, Profile/Notifications/Courses, RTDB/Firebase/AI 0건
- `usePostComments` 내부 로직 0건 변경 (refetch는 cycle 4에서 이미 구현됨)
- `CommentThread` route 타입 마이그레이션 (다음 사이클 함께)
- 답글 UI (parentCommentId setter는 hook에 노출되어 있지만 화면 연결은 보류)

## 3. 댓글 작성 UI 구조

레이아웃:

```
[댓글 영역 (CommentsSection)]
[작성 에러 박스] (있을 때만, 빨강 배경)
[입력 바: TextInput multiline + 등록 버튼]
[글자 수 카운터] (입력 시작 후 1000/1000 / 빨강 표시 over-limit)
```

입력 동작:
- `TextInput`은 `multiline`로 변경 (이전 단일줄 → 여러 줄 가능)
- `editable`은 `!isSubmitting` — 제출 중 입력 잠금
- 등록 버튼 라벨: `등록` / 제출 중 `등록 중…`
- 등록 버튼 활성 조건: `canSubmit = !isSubmitting && trimmed.length > 0 && content.length <= 1000`
- 글자 수 카운터: 입력이 빈 상태(`length === 0`)에는 숨김. `over 1000`이면 빨강.

에러 표시 (입력바 위 박스):
- 메인 메시지(`error.message`)는 빨강 굵은 글씨
- `VALIDATION_FAILED`의 경우 `fieldErrors`가 있으면 항목별 줄바꿈으로 표시
- 입력 값은 **유지**(rollback 아님) — 유저가 수정 후 재시도 가능

답글 UI:
- `useCreateComment`는 `parentCommentId` setter를 노출하지만 본 사이클에서 화면에 연결하지 않음 (다음 사이클).
- 답글 UI 없이도 `parentCommentId` 구조는 type-safe하게 준비됨 — top-level 댓글 작성만 활성.

## 4. parentCommentId 처리

- 기본값: `null` (top-level 댓글)
- 다른 post로 이동 시: `useCreateComment`의 `useEffect([postId])`가 `setParentCommentId(null)` + `setContent('')`로 초기화
- `submitComment` body는 `{ content, parentCommentId: parentCommentId ?? null }` — 항상 `null` 또는 string. `undefined`로 보내지 않음.
- contract: depth ≤ 1 강제 — root 댓글에만 reply 가능, reply에 또 reply 시도 시 백엔드가 `BUSINESS_RULE_VIOLATION`(422) 반환 → §6 처리

## 5. 성공 후 반영 정책

**refetch 우선** (작성 직후 임시 item 합성하지 않음):

이유:
1. `CreateCommentResponseDto`에 `content` / `anonymousId` / `likes`가 없음 — 합성 시 빈 값으로 채우거나 로컬 추정해야 함
2. 합성 시 다른 사용자의 동시 작성과 ordering이 깨질 수 있음
3. cycle 4의 `usePostComments`가 이미 `refetch()`를 노출 → 첫 페이지부터 재조회로 cursor 초기화

흐름:
```
입력 → submitComment()
  ↓ POST /v1/posts/{postId}/comments
  ↓ 응답 도착 (성공)
clearDraft() (content="", parentCommentId=null)
onCreated() → commentsHook.refetch() → CommentsSection이 새 리스트 표시
```

cursor 안전성:
- `usePostComments.refetch === loadFirst` — 내부에서 `cursor=null`, `comments=[]`, `hasMore=false`로 reset 후 첫 페이지 재요청 (cycle 4 구현 그대로 사용)
- reqId 토큰으로 stale 응답 폐기 → 빠른 연속 작성에도 안전

## 6. ErrorCode 처리

| ApiError code | kind | UI |
|---|---|---|
| `AUTH_REQUIRED` / `AUTH_INVALID` / `AUTH_EXPIRED` | auth-required | "댓글을 작성하려면 로그인이 필요합니다" + DEV 패널 안내 (DevAuthPanel 별도) |
| `VALIDATION_FAILED` | validation | 서버 message + `fieldErrors[]` 표시 (필드/사유 목록) |
| `BUSINESS_RULE_VIOLATION` | business-rule | 서버 message 그대로 (예: depth 2 시도) |
| `NOT_FOUND` | not-found | "삭제되었거나 존재하지 않는 글입니다" |
| `FORBIDDEN` / `USER_SUSPENDED` | forbidden | "댓글을 작성할 권한이 없습니다" |
| `FEATURE_RESERVED` | reserved | "준비 중인 기능입니다" 방어적 |
| `NETWORK_ERROR` | network | "네트워크 연결을 확인해주세요" |
| 그 외 | unknown | message 또는 "댓글을 등록하지 못했습니다" |

토큰 클리어:
- `AUTH_INVALID` / `AUTH_EXPIRED` 응답이 오면 apiClient가 자동으로 `clearSessionToken()` 호출 (cycle 2 정책 그대로). 이번 hook은 별도로 토큰을 만지지 않음.

클라이언트 사이드 검증 (요청 전):
- `content.trim().length === 0` → no-op (요청 미발송)
- `content.length > 1000` → 로컬 `validation` 에러 세팅 후 요청 미발송
- `isSubmitting` → 중복 클릭 무시

## 7. 댓글 stats 반영 정책

**post.stats.comments는 refetch하지 않음** — 의도적 결정.

이유:
- `post.stats.comments`는 `usePostDetail`이 보유한 `PostDetail` 객체의 일부
- 작성 후 `usePostComments.refetch`만 호출하므로 PostDetail 카운트는 갱신되지 않음
- 작성 직후 댓글 수 라벨이 한 박자 늦거나 정확히 표시되지 않을 수 있음

대안 (다음 사이클 또는 후속):
1. `usePostDetail`도 같이 refetch (`PostDetailScreen` 레벨에서 두 hook 모두 새로고침)
2. 옵티미스틱 카운트 증가 (`+1`로 임시 표시) — 실패/race 시 risk
3. 댓글 영역 헤더는 `comments.length` 기반 표시(서버 total과 다를 수 있음)

본 사이클은 안전한 기본값(refetch만 호출, post stats 비변경) 선택. 화면이 깜빡거리지 않고 일관되도록 다음 cycle에서 `usePostDetail.refetch`도 호출하는 정책으로 격상 검토.

## 8. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`의 lint/build 스크립트 미정의 → 추측 명령 미실행. 새 native module 추가 0건 → `expo install --check` 재실행 불필요.

수동 E2E 점검 권장 흐름:
1. Postman으로 `POST /v1/auth/session` → sessionToken 획득 → DEV 패널에 저장
2. 피드 카드 tap → PostDetail 진입
3. 입력바에 댓글 작성 → "등록" tap
4. 등록 중 동안 버튼 비활성 + 라벨 "등록 중…" → 응답 도착 후 입력 비워짐 + 댓글 리스트 첫 페이지부터 재로딩 → 새 댓글 표시
5. 일부러 1001자 이상 입력 → 글자 수 빨강, 등록 비활성, 클라 검증으로 차단
6. 토큰을 잘못 입력 후 등록 → "댓글을 작성하려면 로그인이 필요합니다" 에러 박스 표시, 입력값 유지

## 9. PostDetail 회귀 여부

| 항목 | 결과 |
|---|---|
| PostDetail typecheck | ✅ |
| post 본문/태그/stats 렌더링 | ✅ 변경 없음 |
| 댓글 GET 리스트 (CommentsSection) | ✅ commentsHook prop 주입 형태로만 변경, 내부 로직 동일 |
| 게시글 Like/Scrap 토글 | ✅ usePostActions 변경 없음 |
| 공유 버튼 | ✅ 그대로 |
| route param `{ postId: string }` | ✅ 유지 |

## 10. Comments GET 회귀 여부

| 항목 | 결과 |
|---|---|
| `usePostComments` 내부 로직 | ✅ 변경 없음 |
| `getPostComments` API client | ✅ 변경 없음 |
| `mapCommentItem` mapper | ✅ 변경 없음 |
| cursor pagination ("댓글 더보기") | ✅ 동작 동일 |
| 5+ 상태 (loading/success/empty/auth/not-found/reserved/error) | ✅ 모두 유지 |

`CommentsSection`의 prop 형태만 `{ postId }` → `{ commentsHook: UsePostCommentsResult }`로 바뀜 (parent가 hook을 주입). 외부 동작은 동일.

## 11. 남은 문제 / TODO

1. **post.stats.comments 비동기**: 작성 직후 게시글 헤더의 "댓글 N" 카운트가 즉시 갱신되지 않음. 다음 사이클에서 `usePostDetail.refetch`도 함께 호출하도록 격상.
2. **답글 UI 비활성**: `parentCommentId` setter는 hook에 노출되어 있으나 화면 연결 미구현. CommentThread route 타입 string 마이그레이션과 함께 다음 사이클.
3. **본인 댓글 표시 / 삭제 진입 미구현** (의도적 — 본 cycle 범위 외)
4. **댓글 좋아요 미연결** (의도적 — 본 cycle 범위 외)
5. **다중 디바이스 race**: 다른 사용자가 동시에 댓글을 작성한 경우 refetch에 포함되어 자연 동기화 — 이는 정상 동작.
6. **AUTH_EXPIRED 자동 refresh**: 기존 정책 그대로 (apiClient는 토큰 클리어까지만).
7. **KeyboardAvoidingView 미도입**: 입력바가 화면 하단에 고정되지만 키보드가 올라올 때 가려질 수 있음. PostDetail 전체 레이아웃 작업과 함께 별도 cycle.

## 12. 다음 추천 작업

- **Cycle 3. Comment Like / Delete 연결**
  - `POST /v1/posts/{postId}/comments/{commentId}/like` (toggle)
  - `DELETE /v1/posts/{postId}/comments/{commentId}` (본인만, idempotent)
  - 선결: `isMyComment` 신호 — `/v1/users/me`의 anonymousId와 비교 또는 contract 추가
  - 선결: `CommentThread` route 타입 `commentId: number` → `string` 마이그레이션 + 답글 진입 흐름
  - 좋아요는 optimistic + rollback (`usePostActions` 패턴 재사용)
