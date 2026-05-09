# Error Handling Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 공통 에러 구조

```json
{
  "code": "VALIDATION_FAILED",
  "message": "입력값 검증에 실패했습니다",
  "result": {
    "fields": [
      { "field": "title", "reason": "최소 2자 이상이어야 합니다" }
    ]
  }
}
```

## 2. 구현 에러 코드

```text
INVALID_REQUEST
VALIDATION_FAILED
AUTH_REQUIRED
AUTH_INVALID
AUTH_EXPIRED
FORBIDDEN
NOT_FOUND
METHOD_NOT_ALLOWED
UNSUPPORTED_MEDIA_TYPE
BUSINESS_RULE_VIOLATION
RATE_LIMIT_EXCEEDED
INTERNAL_ERROR
SERVICE_UNAVAILABLE
FEATURE_NOT_IMPLEMENTED
REPORT_DUPLICATE
REVIEW_QUOTA_REQUIRED
JURY_NOT_AUTHORIZED
JURY_ALREADY_VOTED
JURY_WINDOW_CLOSED
```

## 3. Reserved 관련 처리

아래 기존 코드들은 이번 MVP에서 발생시키지 않는다.

```text
OCR_FAILED
INVALID_STUDENT_CARD
TOXIC_CONTENT_DETECTED
POST_BLOCKED_FROM_FREE_BOARD
AI_UNAVAILABLE
```

Reserved endpoint는 `501 FEATURE_NOT_IMPLEMENTED`를 반환한다.

## 4. 금지

- Reserved 기능을 흉내 내기 위한 새 에러 코드 생성 금지
- 에러를 catch 후 무시 금지
- 실패 테스트를 삭제해서 통과시키는 행위 금지
