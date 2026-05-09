# Frontend Reserved Feature Contract

> 본 문서는 백엔드가 의도적으로 **구현하지 않은** Reserved 기능의 프론트 처리 정책이다.
> Reserved 기능은 어떤 형태로든 대체 구현하지 않는다 (학교 이메일 검증으로 OCR 대체 금지, 룰 필터로 AI 다듬기 대체 금지 등).
> 프론트도 동일 원칙 — 자체 구현이나 다른 endpoint로 우회하지 말고 "준비 중" UI로 처리한다.

## 1. Reserved endpoint 4종

| Endpoint | Method | 백엔드 응답 |
|---|---|---|
| `/v1/auth/student-card/verify` | POST | 501 `FEATURE_RESERVED` |
| `/v1/ai/refine` | POST | 501 `FEATURE_RESERVED` |
| `/v1/recap/{semester}` | GET | 501 `FEATURE_RESERVED` |
| `/v1/recap/schools/{schoolId}/{semester}` | GET | 501 `FEATURE_RESERVED` |

응답 envelope (모든 4개 동일):

```json
{
  "code": "FEATURE_RESERVED",
  "message": "현재 버전에서 구현하지 않는 예약 기능입니다.",
  "result": null
}
```

HTTP Status: `501 Not Implemented`.

## 2. 기능별 상세 + UI 가이드

### 2.1 학생증 OCR (`/v1/auth/student-card/verify`)

**의미**: 학생증 사진 업로드 → OCR → 학적 정보 검증 → `studentVerificationStatus=VERIFIED`.

**현 상태**: 구현되지 않음. `studentVerificationStatus`는 항상 `RESERVED`.

**프론트 처리**:
- 학생 인증 화면(`/auth/student-card`)에 "학생증 인증 기능은 준비 중입니다" placeholder.
- "임시로 학교 이메일로 인증" 같은 대체 우회 버튼 만들지 말 것 — 백엔드도 이메일 검증을 학생 인증으로 받지 않음.
- `enrollmentStatus === "RESERVED"`인 사용자는 다음 화면을 자연스럽게 사용 가능해야 한다 (학생 인증 미완 상태가 정상 사용 흐름):
  - `/feed`, `/post/...`, `/courses/...`, `/notifications`, `/me/...`
- **차단되지 않는 화면**:
  - school/department scope 피드는 사용자 RTDB 계정의 `schoolId`/`departmentId`가 등록되어 있으면 정상 동작 (학생 인증과 무관).

### 2.2 AI 글다듬기 (`/v1/ai/refine`)

**의미**: 사용자가 작성한 글 본문을 AI가 매끄럽게 다듬어 반환.

**현 상태**: 구현되지 않음. 룰 기반 금칙어 필터 같은 대체도 만들지 않음.

**프론트 처리**:
- 글쓰기 화면에 "AI 다듬기" 버튼을 넣더라도 클릭 시 "준비 중" toast 또는 disabled 상태 유지.
- `POST /v1/posts`는 작성 본문을 그대로 받는다. 프론트가 자체적으로 본문을 수정/검열하지 말 것.

### 2.3 AI Recap (`/v1/recap/{semester}`, `/v1/recap/schools/{schoolId}/{semester}`)

**의미**: 학기말 자동 회고 콘텐츠 (AI 요약).

**현 상태**: 구현되지 않음. 통계 집계 기반 대체 회고도 만들지 않음.

**프론트 처리**:
- `/recap` 라우트가 있다면 "Recap은 준비 중입니다" 단일 placeholder 화면.
- "이번 학기 hot post TOP 10" 같은 임시 화면을 자체 RTDB 쿼리로 만들지 말 것 (정책 우회).

## 3. 프론트 호출 시 권장 흐름

### 3.1 호출 자체를 차단 (권장)

Reserved endpoint 4개는 라우터/API 클라이언트 레이어에서 호출 자체를 막는다.

```ts
// api/reserved.ts
export const RESERVED_ENDPOINTS = [
  /^\/v1\/auth\/student-card\/verify$/,
  /^\/v1\/ai\/refine$/,
  /^\/v1\/recap\/[^/]+$/,
  /^\/v1\/recap\/schools\/[^/]+\/[^/]+$/,
] as const;

export function isReservedEndpoint(path: string): boolean {
  return RESERVED_ENDPOINTS.some(re => re.test(path));
}

// axios 인터셉터에서:
api.interceptors.request.use(config => {
  if (isReservedEndpoint(config.url ?? '')) {
    return Promise.reject(new ReservedFeatureError(config.url ?? ''));
  }
  return config;
});
```

이렇게 하면 네트워크 호출 없이 즉시 reject되고, UI는 통일된 "준비 중" placeholder를 노출.

### 3.2 호출이 일어났을 때 (방어)

만약 호출이 실제로 일어났다면 응답을 다음과 같이 처리:

```ts
async function callReservedSafely(fn: () => Promise<unknown>) {
  try {
    return await fn();
  } catch (err) {
    if (err.response?.data?.code === 'FEATURE_RESERVED') {
      showReservedPlaceholder();   // toast가 아니라 placeholder 화면
      return null;
    }
    throw err;
  }
}
```

## 4. UI 텍스트 가이드

`message` 필드의 한국어를 그대로 노출해도 무방:

> "현재 버전에서 구현하지 않는 예약 기능입니다."

또는 화면별로 다음과 같이 도메인-특화 메시지를 사용:

| 화면 | 권장 문구 |
|---|---|
| 학생증 인증 | "학생증 인증은 준비 중입니다. 인증 없이도 게시판/강의평을 사용하실 수 있습니다." |
| AI 글다듬기 | "AI 글다듬기는 준비 중입니다." |
| Recap | "이번 학기 Recap은 학기 종료 후 공개될 예정입니다." (또는 generic "준비 중" 문구) |

## 5. 절대 만들지 말아야 할 것

- ❌ 학생 이메일 도메인 검증을 학생 인증으로 간주
- ❌ 학번 입력 폼만으로 `studentVerificationStatus`를 VERIFIED로 가정
- ❌ 금칙어 리스트 기반 클라이언트-side moderation (AI 글다듬기 우회)
- ❌ 게시글 통계를 AI Recap 대체로 노출 (`/me/stats`를 Recap UI로 재포장)
- ❌ Reserved endpoint를 polling/retry — 응답이 바뀌지 않음
- ❌ Reserved 기능에 대한 자체 RTDB 경로 사용 (`/ai/...`, `/ocr/...`, `/recap/...` — 룰이 없어 어차피 read 거부됨)

## 6. Reserved 기능이 활성화될 때의 시그널

다음 사이클 또는 후속 ADR 후 Reserved 기능이 진짜 구현된다면:
1. ErrorCode enum에서 `FEATURE_RESERVED`는 유지되나 해당 endpoint가 더 이상 그것을 emit하지 않게 됨.
2. `01_FRONTEND_API_CONTRACT.md`에서 해당 endpoint의 Status가 `Implemented`로 갱신됨.
3. 본 문서가 "활성화됨" 표시로 업데이트됨.

프론트는 위 3가지가 모두 갱신된 시점에만 호출을 활성화한다. 백엔드 README나 Slack 공지만으로 활성화하지 말 것 — 본 contract 문서가 단일 출처.

## 7. 참고

- 백엔드 정책: `IMPLEMENTATION_REPORT.md`, `04_RESERVED_FEATURE_POLICY.md`, `domain/08_RESERVED_FEATURES_DOMAIN.md`.
- 백엔드 contract test: `ReservedFeatureContractTest.java` — 4개 endpoint 모두가 `501 + code=FEATURE_RESERVED + result=null`을 반환함을 강제.
- ErrorCode 부재 강제: `ErrorCodeTest.unusedReservedFeatureCodesAreNotDefined` — `OCR_FAILED`/`INVALID_STUDENT_CARD`/`TOXIC_CONTENT_DETECTED`/`POST_BLOCKED_FROM_FREE_BOARD`/`AI_UNAVAILABLE`이 enum에 없음을 강제.
