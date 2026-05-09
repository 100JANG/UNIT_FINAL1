# 04 — Post Detail Connection Report

> Cycle 3 (2026-05-10). Post Detail API 연결 + 개발용 sessionToken bootstrap.
> 댓글/좋아요/스크랩 API 연결, 실제 로그인 화면 구현은 본 사이클 범위 외.

## 1. 연결한 API

```
GET /v1/posts/{postId}
Authorization: Bearer <sessionToken>
```

- 백엔드 컨트롤러: [`PostController.detail`](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/posts/controller/PostController.java#L71-L74)
- Contract 출처: [`docs/backend-contract/01_FRONTEND_API_CONTRACT.md` §5](../backend-contract/01_FRONTEND_API_CONTRACT.md)
- `postId`는 string opaque (`p_xxxx`). `Number()`/`parseInt` 사용 금지 — `encodeURIComponent`로만 path 삽입.

### Contract 응답과 Cycle 3 brief의 차이

Cycle 3 brief는 `result: { post, comments }` 구조를 가정했으나, 실제 contract는
**flat post 객체**이며 `comments`/`myActions`는 응답에 없다:

```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "postId": "p_xxxx",
    "boardId": "free",
    "title": "...",
    "content": "...",
    "tags": ["..."],
    "anonymousId": "익명_a3f9",
    "visibility": "PUBLIC",
    "status": "PUBLISHED",
    "createdAt": "2026-05-09T08:15:00Z",
    "updatedAt": "2026-05-09T08:15:00Z",
    "stats": { "likes": 24, "comments": 7, "scraps": 3 }
  }
}
```

Contract가 단일 출처이므로 contract를 따른다:
- 댓글은 별도 endpoint(`GET /v1/posts/{postId}/comments`)에서만 조회. 이번 사이클은 mock placeholder만 표시.
- `myActions`는 like/scrap toggle endpoint로만 알 수 있음 — 본 사이클은 로컬 토글만 유지.

## 2. 생성/수정 파일

신규:
- [src/types/post.ts](../../src/types/post.ts) — `PostDetailDto`, `PostStatus`, `CommentDto`(추후용 타입 only), UI `PostDetail`
- [src/services/api/postApi.ts](../../src/services/api/postApi.ts) — `getPostDetail(postId: string)`
- [src/services/api/mappers/postDetailMapper.ts](../../src/services/api/mappers/postDetailMapper.ts) — `mapPostDetail(dto)`
- [src/hooks/usePostDetail.ts](../../src/hooks/usePostDetail.ts) — 7-state machine + reqId race guard
- [src/components/dev/DevAuthPanel.tsx](../../src/components/dev/DevAuthPanel.tsx) — `__DEV__` 전용 sessionToken bootstrap

수정:
- [src/screens/v2/PostDetailScreen.tsx](../../src/screens/v2/PostDetailScreen.tsx) — 전체 mock 제거 → API 연결 + 상태 머신
- [src/screens/v2/FeedScreen.tsx](../../src/screens/v2/FeedScreen.tsx) — 탭 위에 DevAuthPanel 마운트

수정/생성 안 함:
- 백엔드 — 어떤 파일도 수정 안 함
- Comments / Like / Scrap / Profile / Notifications API — 손대지 않음
- RTDB / Firebase / AI / OCR / Recap — 코드 0건

## 3. PostDetail route param 구조

- `RootStackParamList.PostDetail`: `{ postId: string }` (Cycle 2에서 마이그레이션 완료)
- `UnitV2ParamList.PostDetail`: `{ postId: string }` (양 stack의 field 이름도 통일)
- 호출부: [`FeedScreen.tsx`](../../src/screens/v2/FeedScreen.tsx) `navigation.navigate('PostDetail', { postId: item.postId })` — string 그대로
- 화면 내 사용: [`PostDetailScreen.tsx`](../../src/screens/v2/PostDetailScreen.tsx) `useRoute<RouteProp<RootStackParamList, 'PostDetail'>>()` → `params.postId: string`

검증 항목 (모두 ✅):
- `item.postId`는 string
- `Number()`/`parseInt`/`isNaN` 가드 없음
- `as never` 캐스트 없음
- PostDetail route 타입과 호출 시 인자 타입 일치

## 4. DevAuthPanel 추가

[src/components/dev/DevAuthPanel.tsx](../../src/components/dev/DevAuthPanel.tsx):

- `__DEV__ === false`이면 `null` 반환 → production 빌드에 절대 렌더링되지 않음
- 마운트 위치: FeedScreen의 AppBar 아래, 탭 row 위 (`<DevAuthPanel />`)
- 기본은 collapsed 막대 (현재 토큰 상태 표시) → tap 시 패널 펼침
- 패널 내용:
  - 헤더 "개발용 세션 토큰" + "접기"
  - 안내 문구 ("Reserved 로그인 대신 API 테스트용으로만 사용. 프로덕션 빌드에서는 노출되지 않습니다.")
  - 현재 상태: `토큰 저장됨: <앞6자>…(len=N)` 또는 `토큰 없음`
  - `secureTextEntry` TextInput
  - 저장 / 삭제 버튼 → `setSessionToken` / `clearSessionToken`
- 토큰 보안 가드:
  - **전체값을 화면에 노출하지 않음** — 앞 6자 + 길이만 표시
  - `console.log` 호출 없음
  - clipboard 접근 없음
  - `.env`나 mock data에 토큰 작성하지 않음

토큰 입력 시 흐름:
1. Postman 등에서 `POST /v1/auth/session`으로 `sessionToken` 획득
2. Expo Go에서 FeedScreen 상단 노란색 DEV 막대 tap
3. TextInput에 붙여넣고 "저장" 버튼
4. `expo-secure-store`에 영속화 → 이후 모든 API 요청에 자동 부착 (apiClient의 async 헤더 인젝션)

## 5. 상태 처리

`usePostDetail` 훅은 7가지 상태를 정의한다 (Cycle 3 brief의 6개 + 기본 `idle`):

| status | 트리거 | UI |
|---|---|---|
| `idle` | 마운트 직후 | `loading`과 동일 (ActivityIndicator) |
| `loading` | API 호출 in-flight | ActivityIndicator |
| `success` | `code: SUCCESS` | PostBody 렌더링 |
| `not-found` | `NOT_FOUND` | "삭제되었거나 존재하지 않는 글입니다" + 뒤로가기 |
| `auth-required` | `AUTH_REQUIRED`/`AUTH_INVALID`/`AUTH_EXPIRED` | "로그인이 필요합니다" + DEV 패널 안내 |
| `forbidden` | `FORBIDDEN`/`USER_SUSPENDED` | "접근할 수 없는 게시글입니다" |
| `reserved` | `FEATURE_RESERVED` | "준비 중인 기능입니다" (방어적 — PostDetail은 Reserved가 아니지만 contract 진화 대비) |
| `error` | 그 외 모든 에러 (`INTERNAL_ERROR`, `NETWORK_ERROR` 등) | message + "다시 시도" 버튼 |

Auth 처리 메모:
- `AUTH_INVALID`/`AUTH_EXPIRED` 응답은 apiClient가 자동으로 `clearSessionToken()` 호출 (Cycle 2에서 정착됨)
- 재로그인 흐름은 본 사이클 범위 외 — 안내만 노출하고 사용자가 DEV 패널에서 토큰 갱신하도록 유도

## 6. mock fallback 정책

PostDetail 화면 자체:
- **API 성공 시 mock 사용 금지** ✅ — `status === 'success'`일 때만 `post: PostDetail` 객체로 렌더링, mock POST 객체 완전 제거

댓글 영역:
- 백엔드 PostDetail 응답에 댓글이 포함되지 않음 → 두 줄짜리 mock placeholder를 임시 노출
- 댓글 컴포넌트 자체에 "댓글 API 연결 전 임시 표시" 카피 삽입
- Comments API 연결(다음 사이클)에서 완전 교체 예정

좋아요/스크랩/공유:
- 로컬 toggle 상태만 유지 — API 호출 없음
- API stats(`post.stats.likes` 등)는 로컬 toggle 가산값으로 가시화 (`likes + (liked ? 1 : 0)`)

## 7. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

`package.json`에 lint/build 스크립트가 정의되어 있지 않음 → 추측 명령 실행하지 않음.
`npx expo install --check`은 Cycle 2에서 통과 — 이번 사이클은 새 native module을 추가하지 않아 재실행 불필요.

수동 E2E 점검(개발자 손으로):
1. Postman으로 `POST /v1/auth/session` → `sessionToken` 획득
2. `npx expo start` → Expo Go에서 앱 진입
3. FeedScreen 상단 DEV 패널 탭 → 토큰 입력 → 저장
4. 피드 카드 tap → PostDetailScreen 진입 → 본문/태그/통계 렌더링
5. 잘못된 postId 진입 → "삭제되었거나 존재하지 않는 글입니다" 안내

## 8. Feed 회귀 여부

| 확인 항목 | 결과 |
|---|---|
| FeedScreen typecheck | ✅ |
| Feed → PostDetail navigate | ✅ string postId 그대로 전달 |
| numeric 변환 / NaN guard / `as never` | ✅ 없음 |
| `EXPO_PUBLIC_API_BASE_URL` 사용 | ✅ |
| `cursor`+`limit`만 사용 | ✅ |
| BUSINESS_RULE_VIOLATION 안내 분기 | ✅ |
| mock fallback (status='success' 진입 전) | ✅ |

## 9. 남은 문제 / TODO

1. **Comments API 미연결**: PostDetail 화면 하단의 댓글 두 줄은 placeholder. `GET /v1/posts/{postId}/comments`로 교체 필요 (다음 사이클).
2. **Like/Scrap API 미연결**: 현재 화면 토글은 로컬 상태만 변경. 새로고침 시 사라짐.
3. **Like/Scrap toggle endpoint로 myActions 채우기 미구현**: 백엔드 GET /v1/posts/{postId}는 `myActions`를 주지 않으므로 toggle 응답으로만 viewer 상태를 구성 가능 — 후속 사이클.
4. **댓글 입력 IME**: TextInput 등록 버튼은 draft만 비우는 no-op. Comments POST 사이클에서 실 호출로 교체.
5. **AUTH_EXPIRED 자동 refresh 미구현**: `/v1/auth/refresh` 흐름은 별도 사이클로 이월.
6. **Login 화면 Reserved 유지**: 학생증 OCR / 이메일 인증 모두 Reserved. DevAuthPanel은 임시 우회 수단 — production에는 절대 노출되지 않도록 `__DEV__` 가드 유지.
7. **boardName lookup**: `boardName`은 여전히 null. 보드 id → 한글 라벨 정적 매핑은 후속 작업.

## 10. 다음 추천 작업

1. **Comments API 연결** — `GET /v1/posts/{postId}/comments?cursor=&limit=`, `useInfiniteQuery` 패턴(또는 useState 기반)으로 cursor 무한스크롤. `/post_comments` 경로 사용 금지.
2. **Like / Scrap toggle 연결** — `POST /v1/posts/{postId}/like`, `POST /v1/posts/{postId}/scrap` / `DELETE`. Optimistic update + 실패 롤백. 응답으로 `myActions` 부분 갱신.
3. **Courses API 연결** — `GET /v1/courses` / `GET /v1/courses/{id}`. `REVIEW_QUOTA_REQUIRED`(422)는 토스트가 아니라 `CourseReview` 화면으로 라우팅.
