# Error Codes

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. Common

| HTTP | Code | Message |
|---:|---|---|
| 400 | INVALID_REQUEST | 잘못된 요청 형식입니다 |
| 400 | VALIDATION_FAILED | 입력값 검증에 실패했습니다 |
| 401 | AUTH_REQUIRED | 로그인이 필요합니다 |
| 401 | AUTH_INVALID | 유효하지 않은 토큰입니다 |
| 401 | AUTH_EXPIRED | 세션이 만료되었습니다 |
| 403 | FORBIDDEN | 권한이 없습니다 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없습니다 |
| 405 | METHOD_NOT_ALLOWED | 허용되지 않은 메서드입니다 |
| 415 | UNSUPPORTED_MEDIA_TYPE | 지원하지 않는 미디어 형식입니다 |
| 422 | BUSINESS_RULE_VIOLATION | 비즈니스 규칙에 위배됩니다 |
| 429 | RATE_LIMIT_EXCEEDED | 요청 횟수를 초과했습니다 |
| 500 | INTERNAL_ERROR | 서버 오류가 발생했습니다 |
| 501 | FEATURE_NOT_IMPLEMENTED | 아직 구현되지 않은 기능입니다 |
| 503 | SERVICE_UNAVAILABLE | 일시적으로 사용할 수 없습니다 |

## 2. Domain

| HTTP | Code | Domain | 설명 |
|---:|---|---|---|
| 422 | REVIEW_QUOTA_REQUIRED | Courses | 강의평 작성 후 열람 가능 |
| 422 | JURY_NOT_AUTHORIZED | Jury | 배심원 자격 없음 |
| 422 | JURY_ALREADY_VOTED | Jury | 이미 투표함 |
| 422 | JURY_WINDOW_CLOSED | Jury | 24시간 응답 윈도우 종료 |
| 422 | REPORT_DUPLICATE | Reports | 같은 글 중복 신고 |

## 3. Reserved Feature Codes

| Code | 처리 |
|---|---|
| OCR_FAILED | 현재 사용하지 않음. OCR 기능 Reserved |
| INVALID_STUDENT_CARD | 현재 사용하지 않음. OCR 기능 Reserved |
| TOXIC_CONTENT_DETECTED | 현재 사용하지 않음. AI 판정 Reserved |
| POST_BLOCKED_FROM_FREE_BOARD | 현재 사용하지 않음. AI 판정 Reserved |
| AI_UNAVAILABLE | 현재 사용하지 않음. AI 기능 Reserved |
| FEATURE_NOT_IMPLEMENTED | Reserved endpoint 응답에 사용 |

## 4. 금지

- Reserved 기능을 흉내 내기 위해 새로운 임시 에러 코드를 만들지 않는다.
- Reserved 기능을 흉내 내는 별도 에러 코드를 만들지 않는다.
- student registry 대체 검증용 에러를 만들지 않는다.
