# Frontend Auth & Token Contract

> 본 문서는 프론트가 인증을 처리하는 방법의 단일 출처이다.
> 모든 인증 필요 endpoint는 `Authorization: Bearer {sessionToken}` 헤더 필수.
> RTDB read subscription은 `firebaseCustomToken`으로 `signInWithCustomToken` 후 가능.

## 1. 인증 모델 한눈에

```
[Frontend Firebase Auth]                 [Backend Spring Boot]            [RTDB]
        │                                          │                        │
        │ 1. Firebase로 이메일/소셜 로그인        │                        │
        │   → Firebase ID Token 획득               │                        │
        │                                          │                        │
        │ 2. POST /v1/auth/session                 │                        │
        │   { firebaseIdToken }                    │                        │
        │ ──────────────────────────────────────►  │                        │
        │                                          │                        │
        │   3. Firebase Admin SDK로 ID Token 검증  │                        │
        │   4. /users/{uid} 없으면 최소 생성       │                        │
        │   5. JWT sessionToken 발급               │                        │
        │   6. Firebase Custom Token 발급          │                        │
        │                                          │                        │
        │ ◄──────────────────────────────────────  │                        │
        │   { sessionToken,                        │                        │
        │     firebaseCustomToken,                 │                        │
        │     expiresAt, ... }                     │                        │
        │                                          │                        │
        │ 7. signInWithCustomToken(customToken)    │                        │
        │   → Firebase Auth 클라이언트 세션 활성   │                        │
        │                                          │                        │
        │ 8. REST 호출:                            │                        │
        │   Authorization: Bearer {sessionToken}   │                        │
        │ ──────────────────────────────────────►  │                        │
        │                                          │                        │
        │ 9. RTDB read subscription:               │                        │
        │   onValue(ref(db, '/post_stats/...'))    │  ◄────────────────────│
        │   (Firebase 인증 세션으로 자동 권한 검사)│                        │
```

## 2. 토큰 종류와 책임

| 토큰 | 발급자 | 용도 | 저장 위치 (권장) |
|---|---|---|---|
| **Firebase ID Token** | Firebase Auth (클라이언트) | `POST /v1/auth/session` 요청 본문에만 사용. 1회용. | 즉시 폐기 (백엔드에 전달 후) |
| **sessionToken** (자체 JWT) | Spring Boot `JwtTokenProvider` | 모든 REST 호출의 `Authorization: Bearer` 헤더 | localStorage (`sessionToken` key) — XSS 위험 vs UX 트레이드오프, 메모리만 사용도 가능 |
| **firebaseCustomToken** | Spring Boot Admin SDK (`FirebaseCustomTokenIssuer`) | `signInWithCustomToken(auth, ...)` 한 번만 호출. RTDB read subscription 용. | 사용 직후 폐기 권장 (재사용 불필요) |

## 3. 로그인 플로우 (예시 코드)

```ts
// auth.ts
import { getAuth, signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { api } from './api';

interface AuthSessionResponse {
  userId: string;
  sessionToken: string;
  firebaseCustomToken: string;
  expiresAt: string;             // ISO-8601
  studentVerificationStatus: 'RESERVED' | 'VERIFIED';
}

export async function login(email: string, password: string) {
  const fbAuth = getAuth();

  // 1. Firebase Auth 클라이언트 로그인 (이메일/소셜 등)
  const cred = await signInWithEmailAndPassword(fbAuth, email, password);
  const firebaseIdToken = await cred.user.getIdToken();

  // 2. 백엔드 세션 발급
  const { data } = await api.post<{ result: AuthSessionResponse }>(
    '/v1/auth/session',
    { firebaseIdToken },
  );
  const { sessionToken, firebaseCustomToken, expiresAt, userId } = data.result;

  // 3. sessionToken을 모든 REST 호출에 사용
  localStorage.setItem('sessionToken', sessionToken);
  localStorage.setItem('sessionExpiresAt', expiresAt);
  localStorage.setItem('userId', userId);

  // 4. Custom Token으로 RTDB 인증 (signOut 한 뒤 다시 로그인하는 형태로 customToken 적용)
  await signInWithCustomToken(fbAuth, firebaseCustomToken);

  // 5. 이제 onValue(...) 같은 RTDB read subscription 가능
}

export async function logout() {
  const fbAuth = getAuth();

  try {
    await api.post('/v1/auth/logout');   // 서버는 stateless이라 no-op이지만 호출은 권장
  } catch {
    /* sessionToken 만료 등 무시 */
  }
  await fbAuth.signOut();
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('sessionExpiresAt');
  localStorage.removeItem('userId');
}
```

## 4. sessionToken 갱신 (refresh)

`sessionToken`은 발급 시점부터 백엔드 설정 (`unit.jwt.session-ttl-seconds`)만큼 유효. 만료되면 401 `AUTH_EXPIRED`. 그 시점에 1회 refresh 시도.

```ts
async function tryRefresh(): Promise<AuthSessionResponse | null> {
  const stale = localStorage.getItem('sessionToken');
  if (!stale) return null;
  try {
    const { data } = await api.post<{ result: AuthSessionResponse }>(
      '/v1/auth/refresh',
      { sessionToken: stale },
    );
    localStorage.setItem('sessionToken', data.result.sessionToken);
    localStorage.setItem('sessionExpiresAt', data.result.expiresAt);

    // 새로운 firebaseCustomToken으로 RTDB 세션도 갱신
    await signInWithCustomToken(getAuth(), data.result.firebaseCustomToken);

    return data.result;
  } catch {
    return null;
  }
}
```

axios interceptor에서 401 AUTH_EXPIRED → tryRefresh → 원 요청 재시도 로직은 [`03_ERROR_HANDLING_CONTRACT.md §3`](03_ERROR_HANDLING_CONTRACT.md#3) 참고.

**주의**: refresh도 실패하면 로그인 화면으로 리다이렉트. refresh-loop을 방지하기 위해 retry는 1회만.

## 5. sessionToken 만료 시각 활용

`POST /v1/auth/session` 응답의 `expiresAt`은 ISO-8601 UTC. 프론트는 이 시각의 N분 전부터 자동 refresh를 trigger할 수 있다.

```ts
const expiresAt = new Date(localStorage.getItem('sessionExpiresAt')!);
const remainingMs = expiresAt.getTime() - Date.now();

// 만료 5분 전부터 prefetch refresh
if (remainingMs < 5 * 60 * 1000 && remainingMs > 0) {
  tryRefresh();
}
```

`GET /v1/users/me` 응답의 `sessionExpiresAt` 필드도 동일한 값 (현재 토큰의 만료시각).

## 6. studentVerificationStatus 처리

`AuthSessionResponse.studentVerificationStatus`는 항상 `RESERVED` 또는 (실 구현 후) `VERIFIED`.

**현재 정책**: 학생증 OCR이 Reserved이므로 모든 사용자는 `RESERVED` 상태.

프론트는:
- `RESERVED` 사용자도 모든 정상 화면(피드, 글쓰기, 강의평, 알림, 내 활동)을 자유롭게 사용 가능해야 함.
- 학생 인증 화면(`/auth/student-card`)에 진입하면 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md) 정책 적용.
- **`RESERVED` 상태를 이유로 다른 기능을 차단하지 말 것** (예: "학생 인증 후 글쓰기 가능" 같은 정책은 백엔드에 없음).

## 7. 인증 헤더 정책

모든 REST 호출 (auth/session, refresh 제외) 헤더:

```
Authorization: Bearer <sessionToken>
Content-Type: application/json
```

`Authorization` 누락 시 → 401 `AUTH_REQUIRED`.
`Authorization` 위조/포맷 오류 → 401 `AUTH_INVALID`.
정지된 사용자 토큰 사용 시 → 403 `USER_SUSPENDED`.

## 8. 인증 불필요 endpoint

다음 5개만 인증 없이 호출 가능:
- `GET /v1/health`
- `POST /v1/auth/session`
- `POST /v1/auth/refresh`
- 4개 Reserved (`/v1/auth/student-card/verify`, `/v1/ai/refine`, `/v1/recap/{semester}`, `/v1/recap/schools/{schoolId}/{semester}`) — 토큰 검증 없이 즉시 501 응답
- `GET /actuator/health` (Spring Boot Actuator)

그 외 모든 endpoint는 Bearer 토큰 필수.

## 9. 보안 고려사항

| 위험 | 대응 |
|---|---|
| XSS로 sessionToken 탈취 | sessionToken은 가능하면 메모리(컨텍스트)만 사용 + 새로고침 시 refresh로 재발급. 또는 httpOnly cookie 도입 검토 (별도 ADR — 현재는 localStorage 권장만). |
| 토큰 노출된 URL | Bearer 토큰을 URL query에 절대 넣지 말 것. 헤더만 사용. |
| logout 후 잔존 RTDB 세션 | `auth.signOut()`을 반드시 호출. 잔존 세션이 있으면 RTDB read 권한이 유지됨. |
| 다중 디바이스 로그아웃 | 현재 stateless JWT라 한 디바이스의 logout이 다른 디바이스에 영향 없음. 향후 sessions 노드 기반 폐기 정책 추가 가능. |
| 토큰 시계 어긋남 | 백엔드 JJWT 파서는 ClockProvider를 사용 (현재 system clock). 클라이언트 시계가 크게 어긋나면 만료 판단이 빗나갈 수 있으므로 클라이언트 자체 시계 의존 최소화 — 백엔드 응답의 `expiresAt`을 신뢰. |

## 10. 자주 하는 실수

❌ **`firebaseCustomToken`을 `Authorization` 헤더에 사용**
   → 백엔드는 자체 발급한 sessionToken만 검증함. customToken은 RTDB 인증 전용.

❌ **`firebaseIdToken`을 매번 백엔드 호출에 사용**
   → ID Token은 `POST /v1/auth/session` 요청 본문에 1회만 사용. 일반 호출은 sessionToken.

❌ **로그아웃 시 Firebase signOut만 하고 sessionToken은 보존**
   → 다음 호출에서 401 또는 RTDB 권한 거부로 어색한 UX. logout은 양쪽 모두 정리.

❌ **`expiresAt`을 무시하고 401 AUTH_EXPIRED만 기다림**
   → 페이지 새로고침/포그라운드 복귀 시점에 즉시 만료된 토큰으로 호출하면 깜빡임. expiresAt 기반 prefetch refresh 권장.

❌ **두 디바이스에서 동시 로그인 후 한 쪽에서 logout**
   → 다른 디바이스 sessionToken은 만료될 때까지 유효 (stateless JWT). 이는 디자인 의도.
