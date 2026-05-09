# Frontend Error Handling Contract

> 백엔드가 반환하는 모든 에러는 공통 envelope `{ code, message, result }`이다.
> `code`는 `ErrorCode` enum의 이름과 1:1 일치 (`src/main/java/kr/unit/backend/common/error/ErrorCode.java`).
> 본 문서는 모든 에러 코드 + HTTP status + 프론트 권장 처리를 정리한다.

## 0. 응답 구조

```json
{ "code": "VALIDATION_FAILED", "message": "입력값 검증에 실패했습니다", "result": { "fields": [...] } }
```

- `code`: 에러 코드 (영문 대문자 + 언더스코어). 프론트는 이 값으로 분기.
- `message`: 한국어 사용자용 메시지. 그대로 노출 가능 (단 일부는 generic이라 화면 별도 메시지로 덮어쓰는 게 권장).
- `result`: 추가 detail. 대부분 `null`. Validation은 `{ fields: [{field, reason}] }` 형식.

## 1. 공통 에러 코드 표

| HTTP | code | 의미 | 권장 UI |
|---:|---|---|---|
| 400 | `INVALID_REQUEST` | 잘못된 요청 형식 (JSON 파싱 실패, 잘못된 cursor 등) | "요청이 잘못되었습니다" 토스트, 디버그용 로그. 사용자 액션 무효화. |
| 400 | `VALIDATION_FAILED` | DTO/Policy 검증 실패. `result.fields[]`에 필드별 사유. | 폼 필드별 에러 메시지로 매핑. `result.fields`를 순회해 input 옆에 표시. |
| 401 | `AUTH_REQUIRED` | Authorization 헤더 없음 또는 인증 필요한 경로 | 로그인 화면으로 리다이렉트. sessionToken 폐기. |
| 401 | `AUTH_INVALID` | sessionToken 위조/포맷 오류/issuer 불일치 | 로그인 화면 리다이렉트. sessionToken 폐기 + 사용자 알림 ("다시 로그인해주세요"). |
| 401 | `AUTH_EXPIRED` | sessionToken 만료 | `POST /v1/auth/refresh` 1회 시도 → 실패 시 로그인 화면 리다이렉트. |
| 403 | `FORBIDDEN` | 권한 없음 (예: 타인 댓글 삭제 시도) | "권한이 없습니다" 토스트. 액션 차단. |
| 403 | `USER_SUSPENDED` | 정지된 사용자 | 정지 안내 화면 (사유 노출 정책은 백엔드 추후 결정). 모든 인터랙션 차단. |
| 404 | `NOT_FOUND` | 리소스 없음 (게시글/댓글/강의/알림) | 해당 리소스 화면이면 "찾을 수 없습니다" 빈 상태 + 뒤로가기. |
| 405 | `METHOD_NOT_ALLOWED` | 잘못된 HTTP method | 정상 흐름에서 발생하면 안 됨. 코드 버그 신호. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content-Type 잘못 | 정상 흐름에서 발생하면 안 됨. axios 인터셉터에서 application/json 강제 보장. |
| 422 | `BUSINESS_RULE_VIOLATION` | 일반 비즈니스 규칙 위반 (학교/학과 미등록, 중복 강의평 등) | 화면별 분기 — `message` 그대로 노출하거나 도메인별 메시지로 덮어쓰기. |
| 422 | `REVIEW_QUOTA_REQUIRED` | 강의평 미작성자가 강의 상세 진입 시 | `/courses/:id/review` 작성 화면으로 라우팅. **에러 토스트 노출 금지** — 정상 분기. |
| 422 | `JURY_NOT_AUTHORIZED` | 호출되지 않은 사용자가 jury case 접근 | "배심원 자격이 없습니다" 메시지 + 목록으로 돌아가기. |
| 422 | `JURY_ALREADY_VOTED` | 이미 투표함 | "이미 투표하셨습니다" 토스트 + 결과 화면 표시. |
| 422 | `JURY_WINDOW_CLOSED` | 투표 윈도우 종료 | "투표 기간이 종료되었습니다" + 결과 화면. |
| 422 | `REPORT_DUPLICATE` | 같은 글 중복 신고 | "이미 신고하셨습니다" 토스트 (성공처럼 처리해도 무방). |
| 429 | `RATE_LIMIT_EXCEEDED` | 호출 횟수 제한 초과 (현재 미적용 — 후속 사이클) | "잠시 후 다시 시도해주세요" 토스트. |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 | "일시적인 오류가 발생했습니다" 토스트 + sentry 등 보고. 사용자 재시도 버튼 노출 권장. |
| 501 | `FEATURE_RESERVED` | Reserved 기능 (학생증 OCR, AI Refine, AI Recap) | "준비 중인 기능입니다" placeholder. 자세한 정책은 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md). |
| 503 | `SERVICE_UNAVAILABLE` | 일시적 외부 의존 실패 (예: Firebase Custom Token 발급 실패) | "잠시 후 다시 시도해주세요" + 재시도 버튼. |

## 2. Validation 실패 처리

```json
{
  "code": "VALIDATION_FAILED",
  "message": "입력값 검증에 실패했습니다",
  "result": {
    "fields": [
      { "field": "title", "reason": "최소 2자 이상이어야 합니다" },
      { "field": "content", "reason": "본문은 10~5000자여야 합니다" }
    ]
  }
}
```

권장 처리 (예: 글쓰기 화면):

```ts
if (resp.code === 'VALIDATION_FAILED') {
  for (const f of resp.result.fields) {
    formApi.setFieldError(f.field, f.reason);
  }
  // 토스트는 띄우지 않고 폼 인라인 에러로만 노출 (UX 권장)
  return;
}
```

`field` 이름은 DTO 필드명과 1:1 (예: `title`, `content`, `boardId`, `tags`, `parentCommentId`, `vote`, `verdict`, `reason`).

## 3. 글로벌 axios interceptor 권장 패턴

```ts
import axios, { AxiosError } from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const body = error.response?.data;
    if (!body) return Promise.reject(error);

    switch (body.code) {
      case 'AUTH_EXPIRED':
        // 1회 refresh 시도
        const refreshed = await tryRefresh();
        if (refreshed) {
          error.config!.headers.Authorization = `Bearer ${refreshed.sessionToken}`;
          return api.request(error.config!);
        }
        // 실패 시 로그아웃 처리
        await logout();
        location.href = '/login';
        return Promise.reject(error);

      case 'AUTH_REQUIRED':
      case 'AUTH_INVALID':
        await logout();
        location.href = '/login';
        return Promise.reject(error);

      case 'USER_SUSPENDED':
        location.href = '/account/suspended';
        return Promise.reject(error);

      case 'INTERNAL_ERROR':
      case 'SERVICE_UNAVAILABLE':
        toast.error('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        return Promise.reject(error);

      // 그 외는 호출 측이 직접 핸들링 (VALIDATION_FAILED, NOT_FOUND, REVIEW_QUOTA_REQUIRED 등)
      default:
        return Promise.reject(error);
    }
  }
);

interface ApiErrorBody {
  code: string;
  message: string;
  result: unknown;
}
```

## 4. 도메인별 분기 가이드

### 4.1 게시글 작성 (`POST /v1/posts`)
- `VALIDATION_FAILED` → 폼 인라인 에러
- 그 외는 일반 처리

### 4.2 게시글 신고 (`POST /v1/posts/{postId}/report`)
- `REPORT_DUPLICATE` → 무해. "이미 신고하셨습니다" 토스트 또는 silent 성공으로 처리해도 무방.
- `NOT_FOUND` → 글이 사라진 경우. 목록으로 돌아가기.

### 4.3 강의 상세 (`GET /v1/courses/{courseId}`)
- `REVIEW_QUOTA_REQUIRED` → **에러가 아니라 정상 분기**. `/courses/:id/review` 작성 화면으로 자동 라우팅. 사용자에게 "강의평을 먼저 작성해주세요" 안내 inline 표시.
- `NOT_FOUND` → 강의 없음.

### 4.4 댓글 삭제 (`DELETE /v1/posts/{postId}/comments/{commentId}`)
- `FORBIDDEN` → "본인 댓글만 삭제할 수 있습니다" (UI에서 본인 댓글에만 삭제 버튼이 떠야 정상이므로 발생 시 코드 버그 신호).
- 이미 삭제된 댓글 재삭제는 백엔드가 idempotent로 200 응답.

### 4.5 배심원 투표 (`POST /v1/jury/cases/{caseId}/vote`)
- `JURY_NOT_AUTHORIZED` → 자격 없음. 목록으로 이동.
- `JURY_ALREADY_VOTED` → 결과 화면으로 이동.
- `JURY_WINDOW_CLOSED` → 종료 안내 + 결과 화면.

### 4.6 피드 school/department scope (`GET /v1/posts?scope=school|department`)
- `BUSINESS_RULE_VIOLATION` (사용자 schoolId/departmentId 미등록) → "학교/학과 정보가 등록되지 않았습니다" 안내 + 학교 정보 등록 화면으로 라우팅 (학생 인증 화면은 Reserved이므로, 임시로는 scope=all로 fallback도 가능).

### 4.7 사용자 프로필 (`GET /v1/users/me`)
- `NOT_FOUND` → 정상 흐름에서는 발생하면 안 됨. 발생 시 sessionToken 폐기 + 로그인 화면.

## 5. 에러 코드 발생 시 코드 버그를 의심해야 하는 경우

다음 코드는 정상 클라이언트 동작에서는 발생하지 않아야 한다. 발생하면 프론트 코드 또는 인터셉터 설정 버그 신호.

- `INVALID_REQUEST`: 보통 cursor 형식 오류 또는 잘못된 JSON. cursor를 직접 조작/생성하지 말고 백엔드 응답 그대로 사용.
- `METHOD_NOT_ALLOWED`: 잘못된 method. 라우터/api 클라이언트 정의 점검.
- `UNSUPPORTED_MEDIA_TYPE`: Content-Type 누락. axios 기본값(`application/json`) 유지.
- `FORBIDDEN`: 본인 자원에만 보이는 액션 버튼이 정상이라면 발생 X. UI에 잘못된 버튼이 노출됐다는 신호.

## 6. 절대 발생하지 않아야 하는 코드

다음 코드는 ErrorCode enum에 의도적으로 정의되지 않았다. 만약 응답에 등장한다면 백엔드 회귀 — 즉시 보고.

- `OCR_FAILED`, `INVALID_STUDENT_CARD`: OCR 기능이 Reserved이므로 emit되지 않아야 함.
- `TOXIC_CONTENT_DETECTED`, `POST_BLOCKED_FROM_FREE_BOARD`: AI moderation이 Reserved.
- `AI_UNAVAILABLE`: AI 기능 자체가 Reserved.

`ErrorCodeTest.unusedReservedFeatureCodesAreNotDefined`로 강제됨.

## 7. 네트워크 레이어 에러 (백엔드 응답이 아닌 경우)

| 상황 | 처리 |
|---|---|
| 네트워크 연결 끊김 | offline 토스트 + retry 버튼 |
| CORS 거부 | 백엔드 CORS 설정 확인 (현재 `CorsConfig`가 `*` 허용) |
| 타임아웃 | "서버 응답이 늦습니다" 토스트 + retry |
| 5xx without envelope | 백엔드 INTERNAL_ERROR가 아니라 인프라 단의 504 등. generic 메시지 + sentry 보고 |
