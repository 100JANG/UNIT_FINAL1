# 13 — RTDB Read Subscription Report

> Cycle 8 (runbook). Firebase JS SDK 도입 + RTDB **read-only** subscription 인프라.
> 1개 path만 시범 연결: `/notifications/{userId}`.

## 1. 절대 금지 사항 준수

Runbook §"Cycle 8 절대 금지" 100% 준수:

- ❌ `set` — 사용 0건
- ❌ `update` — 사용 0건
- ❌ `push` — 사용 0건
- ❌ `remove` — 사용 0건
- ❌ client write helper — 노출 0건. `rtdbRead.ts`는 `onValue`/`off`만 import.
- ❌ FCM — 미설치. `firebase/messaging` import 0건.
- ❌ Firebase Auth 전체 로그인 플로우 — 미사용. `firebase/auth` import 0건.
- ❌ custom token claim — 미구현.

`rtdbRead.ts`의 import는 다음 4개만:
```ts
import { off, onValue, ref, type DataSnapshot, type Unsubscribe } from 'firebase/database';
```

## 2. 활성화 게이트

기본 OFF. 다음 **모두** 충족 시에만 RTDB 활성:

```
EXPO_PUBLIC_ENABLE_RTDATABASE === 'true'
&& EXPO_PUBLIC_FIREBASE_API_KEY != "" / placeholder
&& EXPO_PUBLIC_FIREBASE_DATABASE_URL != "" / placeholder
&& EXPO_PUBLIC_FIREBASE_PROJECT_ID != "" / placeholder
```

placeholder는 `.env.example`의 `replace-me` 문자열로 정의.

게이트가 false이면:
- `getRtdb()` → `null` (캐시됨)
- `subscribeRtdbValue()` → `queueMicrotask(() => onChange(null))` + no-op unsubscribe
- `useRtdbValue()` → 항상 `null`을 반환
- 컴포넌트는 RTDB 코드 경로에 영향받지 않음. REST API가 단일 출처로 동작.

## 3. 연결한 API / Path

**REST**:
- 별도 추가 없음. 기존 `useNotifications` (cycle 7)이 단일 출처.

**RTDB read subscription** (gated):
- `/notifications/{userId}` — 변화 감지 시 `useNotifications.refetch()` 트리거 → 단일 REST 페이지가 갱신됨

이 패턴의 의도:
- RTDB는 "뭔가 바뀌었다"는 신호로만 사용
- 실제 데이터는 REST API가 단일 출처
- 백엔드 RTDB 구조에 의존성 최소화 — payload shape이 바뀌어도 프론트는 신호만 받고 REST로 재조회

## 4. 생성/수정 파일

신규:
- [src/services/firebase/firebaseClient.ts](../../src/services/firebase/firebaseClient.ts) — lazy `getRtdb()`, `isRtdbEnabled()` 게이트
- [src/services/firebase/rtdbRead.ts](../../src/services/firebase/rtdbRead.ts) — `subscribeRtdbValue<T>(path, onChange): Unsubscribe`. **write 함수 없음**.
- [src/hooks/useRtdbValue.ts](../../src/hooks/useRtdbValue.ts) — React hook (path 변경/언마운트 시 자동 unsubscribe)
- [src/hooks/useMyUserId.ts](../../src/hooks/useMyUserId.ts) — `/me`에서 userId만 가져와 모듈 캐시 (전체 profile fetch 회피)
- [docs/integration/13_RTDB_SUBSCRIPTION_REPORT.md](13_RTDB_SUBSCRIPTION_REPORT.md)

수정:
- `package.json` / `package-lock.json` — `firebase@^12.13.0` 추가 (Web SDK, JS-only — Expo Managed에서 config plugin 없이 동작)
- [src/screens/v2/NotificationsScreen.tsx](../../src/screens/v2/NotificationsScreen.tsx) — `useMyUserId` + `useRtdbValue('/notifications/{userId}')` + 첫 emission 스킵 후 변경 시 `refetch()` 호출
- [docs/integration/02_REMAINING_CONNECTION_PLAN.md](02_REMAINING_CONNECTION_PLAN.md) — Cycle H 완료 표시

수정 안 함:
- 백엔드 0건
- `app.json` 0건 변경 (web SDK는 config plugin 없음 — `@react-native-firebase`와 다름)
- 다른 hook / screen 0건

## 5. 첫 emission 처리

`onValue`는 구독 직후 현재 값을 한 번 emit한다. 이를 `refetch` 트리거로 그대로 쓰면 마운트 직후 중복 fetch가 발생.

NotificationsScreen은 `useRef`로 마지막 값을 추적하고 첫 emission(처음 `null`이 아닌 값) 이후의 변화만 refetch에 반영. 결과적으로:
- 마운트 → useNotifications가 첫 페이지 로드
- (유저가 화면에 머무는 중) RTDB 변화 → refetch
- (다른 화면으로 이동 → 돌아옴) 마운트 → 다시 첫 페이지 로드 (RTDB는 별개 흐름)

## 6. 페이지네이션 안전성

`refetch()`는 `loadFirst`를 호출 — cursor와 hasMore을 reset. 사용자가 더보기 페이지로 내려간 상태에서 refetch가 발생하면 첫 페이지로 돌아간다는 의미.

선택된 트레이드오프:
- 일반적인 알림 사용 패턴: 새 알림 도착 → 사용자는 맨 위에서 확인
- 더보기로 깊이 들어간 상태에서 refetch가 일어나면 다소 불편하지만 흔치 않은 케이스
- 더 정교한 정책(e.g. 새 알림이 있다는 배너만 노출하고 사용자 탭 시 첫 페이지로 이동)은 후속 cycle 작업

## 7. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

설치된 firebase: `^12.13.0`. `expo install` 사용으로 SDK 호환 버전 자동 선정.
새 native module 0건 → `expo install --check`는 cycle 7과 동일하게 통과 가능.

⚠️ npm audit 경고 8건 (firebase의 transitive deps에서 옴) — 본 cycle에서 처리하지 않음. Cycle 9 audit에서 검토 또는 `npm audit fix` 별도 작업.

## 8. 회귀 여부

| 항목 | 결과 |
|---|---|
| 모든 기존 hook (Feed/Post/Comment/Course/Profile/Activity/Notifications) | ✅ 0건 변경 |
| apiClient envelope unwrap / Auth 정책 | ✅ 0건 변경 |
| route param | ✅ 변경 없음 |
| `app.json` plugins | ✅ 변경 없음 (firebase web SDK는 plugin 없음) |
| `EXPO_PUBLIC_ENABLE_RTDATABASE=false` 기본값 | ✅ subscription 비활성. NotificationsScreen은 REST만 사용. |

## 9. 남은 문제 / TODO

1. **시범 연결 1개만**: `/notifications/{userId}`만 subscribe. Feed stats / post stats / comment stats 등 다른 path는 후속 cycle.
2. **userId 의존성 주입**: 현재 `useMyUserId`가 모듈 글로벌 캐시 사용. logout 시 `resetMyUserIdCache()` 호출이 필요하나 logout 흐름이 아직 미구현. Auth refresh cycle에서 함께 정리.
3. **Security Rules에서 read 권한 부여**: RTDB rules가 `auth.uid !== null`을 요구하면 sessionToken만으로는 RTDB read를 통과 못함. 백엔드의 Custom Token 흐름(`POST /v1/auth/session.firebaseCustomToken` + 클라이언트의 `signInWithCustomToken`)이 필요. 현재 미구현 — 환경에 따라 read 권한이 거절될 수 있고, 그 경우 `subscribeRtdbValue`는 callback에 `null`을 넘기고 UI는 REST에 의존. 안전한 fallback이지만 realtime의 이점은 사라짐. Auth/Firebase Custom Token cycle에서 격상.
4. **firebase 패키지 audit 경고 8건**: deferred to cycle 9.

## 10. 다음 Cycle (runbook)

- **Cycle 9. 전체 통합 점검** — grep 기반 audit:
  - `size` pagination
  - `/post_comments`
  - `parseInt(postId|commentId|courseId)` / `Number(postId|...)`
  - RTDB write (`set(`, `update(`, `push(`, `remove(`)
  - `: any` / `as any`
  - 보고서 작성, 커밋/태그
