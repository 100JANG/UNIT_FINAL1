# Reserved Features Domain

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 목적

Reserved 기능을 별도 도메인으로 분리해 구현 도메인 문서와 섞이지 않게 한다.

## 2. Reserved 목록

| 기능 | 현재 처리 | 금지 |
|---|---|---|
| Student Card OCR | API 자리만 예약 | 대체 검증 금지 |
| AI Writing Refine | API 자리만 예약 | Rule/금칙어 대체 금지 |
| AI Report Judgment | 기능 없음 | 자동 jury 생성/자동 처분 금지 |
| AI Recap | API 자리만 예약 | 임시 통계 집계 금지 |

## 3. API 응답 원칙

Reserved endpoint가 필요한 경우에만 아래 응답을 사용한다.

```json
{
  "code": "FEATURE_NOT_IMPLEMENTED",
  "message": "아직 구현되지 않은 기능입니다",
  "result": {
    "feature": "RESERVED_FEATURE_NAME",
    "status": "RESERVED"
  }
}
```

## 4. DB 원칙

Reserved 기능의 DB 노드는 만들지 않는다.

## 5. 테스트 원칙

Reserved 기능은 성공 테스트를 만들지 않는다. 필요 시 `501 FEATURE_NOT_IMPLEMENTED` 계약 테스트만 작성한다.
