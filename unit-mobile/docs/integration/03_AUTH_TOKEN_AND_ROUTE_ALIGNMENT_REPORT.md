# 03 — Auth Token Persistence & Route Type Alignment

> Cycle 2 (2026-05-10). Auth token 저장 안정화 + PostDetail route 타입 정리만 수행.
> 새 화면 API 연결은 본 사이클 범위 외.

## 1. Expo 환경변수 변경 내용

이전 사이클에서 이미 `EXPO_PUBLIC_*` 컨벤션으로 작성됨. 본 사이클에서 검증만 수행.

- 코드(.ts/.tsx)에서 `VITE_*` / `import.meta.env` 사용 검색 → **0건** (코드에는 잔재 없음)
- docs에서 `VITE_*` mention은 의도적 매핑 설명(00_INTEGRATION_AUDIT §4 표). 그대로 유지.
- `.env.example`은 `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_ENABLE_RTDATABASE` 키 사용.
- 하드코딩 URL은 apiClient의 `BASE_URL` fallback 한 줄(`http://localhost:8080/v1`) 뿐이며,
  이는 환경변수 미설정 시에만 적용되는 dev 안전장치.

## 2. sessionToken 저장 방식

### 변경

| 이전 | 이후 |
|---|---|
| `src/services/api/sessionToken.ts` (in-memory let) | **`src/services/auth/sessionToken.ts`** (expo-secure-store 기반) |
| sync `getSessionToken(): string \| null` | **async `getSessionToken(): Promise<string \| null>`** |
| `setSessionToken(token \| null)` | `setSessionToken(token: string)` + `clearSessionToken()` 분리 |
| 영속화 없음 (앱 재시작 시 손실) | iOS Keychain / Android EncryptedSharedPreferences / Web localStorage |

### API

```ts
// src/services/auth/sessionToken.ts
getSessionToken(): Promise<string | null>
setSessionToken(token: string): Promise<void>
clearSessionToken(): Promise<void>
hasSessionToken(): Promise<boolean>
```

### 구현 핵심

- `expo-secure-store@14.0.1` 설치 (`npx expo install`)
- `app.json` plugins에 `"expo-secure-store"` 자동 추가
- 모듈-레벨 in-memory 캐시(`cached: string | null | undefined`) 사용 — 첫 read 후 후속 호출은 native I/O 미발생
- `setSessionToken` / `clearSessionToken` 시 캐시와 SecureStore 동시 갱신
- `clearSessionToken`의 SecureStore 호출은 try/catch로 감쌈 — 일부 플랫폼에서 키 미존재 시 throw

### 보안 주의(준수 확인)

- 토큰을 `console.log`로 출력하지 않음 ✅
- 토큰을 mock data에 넣지 않음 ✅
- 토큰을 git에 commit하지 않음 (SecureStore는 OS-level 저장) ✅

## 3. API client Authorization 처리

### 변경 핵심

[`src/services/api/apiClient.ts`](../../src/services/api/apiClient.ts):

1. `import { getSessionToken } from './sessionToken'` → `import { clearSessionToken, getSessionToken } from '../auth/sessionToken'`
2. 요청 직전 `const token = await getSessionToken()` (sync → async 전환)
3. token 존재 시 `Authorization: Bearer ${token}` 자동 부착, 없으면 헤더 생략
4. 응답 envelope unwrap 유지: `code !== 'SUCCESS'` → `ApiError` throw
5. **새로운 정책**: `AUTH_INVALID` / `AUTH_EXPIRED` 응답이 오면 `void clearSessionToken()` 호출
   (다음 요청부터는 stale 헤더가 더 이상 부착되지 않음)
6. `AUTH_REQUIRED`는 헤더 미부착 케이스이므로 토큰 클리어 불필요

### envelope unwrap 유지

- 화면/훅은 `result`만 받는다. `response.data` / `response.result` 접근 금지 원칙 그대로.
- HTTP `status`도 `ApiError`에 보존 → 디버깅 시 활용 가능.

## 4. ErrorCode 처리 방식

[`src/services/api/errorHandler.ts`](../../src/services/api/errorHandler.ts):

| ErrorCode | ErrorKind | 권장 UI | 토큰 클리어 |
|---|---|---|---|
| `AUTH_REQUIRED` | `auth-required` | 로그인 화면 안내 | ❌ 헤더 미부착 케이스 |
| `AUTH_INVALID` | `auth-required` | 로그인 화면 안내 | ✅ apiClient가 자동 |
| `AUTH_EXPIRED` | `auth-expired` | 인증 재진입 안내 | ✅ apiClient가 자동 |
| `FEATURE_RESERVED` | `reserved` | "준비 중" placeholder | — |
| `BUSINESS_RULE_VIOLATION` 등 | `business-rule` | guided empty state | — |
| `VALIDATION_FAILED` | `validation` | form-field error (`ApiError.validationFields`) | — |
| `FORBIDDEN` / `USER_SUSPENDED` | `forbidden` | 접근 불가 안내 | — |
| `NOT_FOUND` | `not-found` | 삭제/없음 안내 | — |
| `RATE_LIMIT_EXCEEDED` | `rate-limit` | retry-later toast | — |
| `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE` | `server` | retry toast | — |
| `NETWORK_ERROR` | `network` | retry toast | — |

`requiresLoginRedirect(kind)` 헬퍼 추가 — `auth-required` / `auth-expired`에 대해 true.

### 알려진 한계 (이번 사이클 범위 외)

- AUTH_EXPIRED 시 자동 refresh-token 호출 흐름은 아직 미구현 (`/v1/auth/refresh`).
  본 사이클에서는 클리어 → 사용자에게 재로그인 유도 정도까지만.
- 학생증/OCR 인증은 백엔드에서 Reserved이므로 verify flow 구현 금지(준수).
- 실제 LoginScreen → API 연결은 본 사이클 범위 외.

## 5. PostDetail route postId string 변경 내용

### 타입 정의

| 파일 | 라인 | 이전 | 이후 |
|---|---|---|---|
| [`src/types.ts`](../../src/types.ts) | 9 | `PostDetail: { postId: number }` | `PostDetail: { postId: string }` |
| [`src/types/unit-v2.ts`](../../src/types/unit-v2.ts) | 21 | `PostDetail: { id: number }` | **`PostDetail: { postId: string }`** |
| [`src/types/unit-v2.ts`](../../src/types/unit-v2.ts) | 88 | `PostDetail: { postId: number }` | `PostDetail: { postId: string }` |

UnitV2 stack의 PostDetail은 원래 `id`였으나, **두 stack의 param 모양이 다르면(`id` vs `postId`)
TS의 CompositeNavigation overload resolver가 union을 좁히지 못해 `never`로 떨어진다**.
백엔드 contract(`postId`)에 맞춰 양쪽 모두 `postId: string`으로 통일.

### 호출부 변경

`src/screens/v2/FeedScreen.tsx`:
- numeric coercion (`Number(item.postId)`) 제거
- `Number.isNaN` 가드 제거
- `as never` 캐스트 제거
- 직접 `navigation.navigate('PostDetail', { postId: item.postId })` 호출 (string 그대로)
- Nav 타입을 `NativeStackNavigationProp<UnitV2ParamList>` → `NativeStackNavigationProp<RootStackParamList>`로 좁힘
  (FeedScreen은 Tabs → Root stack에서 렌더되므로 실제 매칭되는 navigator는 Root)
- 부수: `navigation.navigate('Search')`는 Root에 없어서 깨져 있던 호출 → `navigation.navigate('UnitV2', { screen: 'Search' })`로 정상 경로화

`src/navigation/RootNavigator.tsx`:
- PostDetailAdapter 제거 (양쪽 stack이 `postId`로 통일되어 rename adapter 불필요)
- `<Stack.Screen name="PostDetail" component={PostDetailAdapter} />` → `component={PostDetailV2}`
- CourseDetailAdapter / CourseReviewAdapter는 그대로 유지 (`courseId` ↔ `id` 분리는 후속 cycle)

`src/screens/v2/PostDetailScreen.tsx`: route.params를 실제로 소비하지 않으므로 변경 불필요.

## 6. 변경/생성/삭제한 파일

신규:
- [src/services/auth/sessionToken.ts](../../src/services/auth/sessionToken.ts) — SecureStore 기반 async 토큰 저장
- [docs/integration/03_AUTH_TOKEN_AND_ROUTE_ALIGNMENT_REPORT.md](03_AUTH_TOKEN_AND_ROUTE_ALIGNMENT_REPORT.md)

수정:
- [.env.example](../../.env.example) — 검증만 (수정 없음)
- [src/services/api/apiClient.ts](../../src/services/api/apiClient.ts) — async 토큰, 401 자동 클리어
- [src/services/api/errorHandler.ts](../../src/services/api/errorHandler.ts) — 정책 주석 보강 + `requiresLoginRedirect` 헬퍼
- [src/types.ts](../../src/types.ts) — PostDetail postId number → string
- [src/types/unit-v2.ts](../../src/types/unit-v2.ts) — PostDetail 양쪽 entries postId/id 통일 (string)
- [src/screens/v2/FeedScreen.tsx](../../src/screens/v2/FeedScreen.tsx) — numeric coercion 제거, Nav 타입 좁힘, Search 경로 수정
- [src/navigation/RootNavigator.tsx](../../src/navigation/RootNavigator.tsx) — PostDetailAdapter 제거
- `app.json` — `expo-secure-store` plugin 자동 추가
- `package.json` / `package-lock.json` — `expo-secure-store@14.0.1` 추가

삭제:
- ~~`src/services/api/sessionToken.ts`~~ — `src/services/auth/sessionToken.ts`로 이동

## 7. 실행한 검증

```
npm run typecheck         (= ./node_modules/.bin/tsc --noEmit)  → exit 0 ✅
npx expo install --check                                         → "Dependencies are up to date" ✅
```

기타 lint/build 스크립트는 `package.json`에 정의되지 않았으므로 실행하지 않음
(추측 명령 실행 금지 원칙 준수).

## 8. Feed 회귀 여부

| 확인 항목 | 결과 |
|---|---|
| FeedScreen typecheck | ✅ |
| useFeedPosts hook typecheck | ✅ |
| getPosts가 EXPO_PUBLIC_API_BASE_URL 사용 | ✅ (apiClient의 `BASE_URL` 경유) |
| `cursor` + `limit` 사용 | ✅ |
| `size` 사용 없음 | ✅ |
| `BUSINESS_RULE_VIOLATION` 처리 | ✅ (status='business-rule' 분기 유지) |
| mock fallback | ✅ (status='success' 진입 전까지만 표시) |

## 9. 남은 문제 / TODO

1. **AUTH_EXPIRED 자동 refresh 미구현** — `POST /v1/auth/refresh`로 토큰 갱신 후 원 요청 재시도하는 axios-style interceptor 패턴이 필요. 별도 사이클.
2. **Login flow 미연결** — sessionToken을 set하는 화면이 아직 API에 연결되지 않음.
   현재는 디버그 목적으로 `setSessionToken('...')`을 호출해야만 인증 헤더가 부착됨.
3. **Web 빌드 시 SecureStore fallback 경고** — Expo web에서 expo-secure-store는 localStorage로 fallback. dev 단계에서는 무시 가능.
4. **navigation.navigate('Search') 같은 nested-route 호출 패턴 정리 필요** — 본 사이클에서 Search만 정상화. 다른 화면에서 비슷한 패턴이 있을 수 있음(예: NotificationsScreen 내부, ProfileScreen 등). PostDetail 사이클에서 함께 점검.
5. **TanStack Query 미도입** — Feed 등 hook들의 race-condition 방어는 reqId 토큰으로 충분하지만, 캐싱/리페치 정책은 별도 사이클에서.

## 10. 다음 추천 작업

1. **Post Detail API 연결** — `GET /v1/posts/{postId}` (string 그대로 사용 가능). PostDetailScreen에서 mock 분리 → useFeedPosts 패턴과 동일한 useState/useEffect로 1차 연결.
2. **Comments API 연결** — `GET /v1/posts/{postId}/comments?parentId=&cursor=&limit=` (`/post_comments` 경로 사용 금지).
3. **Like / Scrap API 연결** — `POST /v1/posts/{postId}/like` (toggle), `POST /v1/posts/{postId}/scrap` / `DELETE`. Optimistic update는 도입 가능, 실패 시 롤백 필수.
