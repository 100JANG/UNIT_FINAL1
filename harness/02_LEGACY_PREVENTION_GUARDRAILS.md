# Legacy Prevention Guardrails

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 구조 Guardrail

- 도메인별 패키지 경계를 유지한다.
- 공통화는 3회 이상 반복될 때만 검토한다.
- 공통 폴더에는 진짜 공통만 둔다.
- `common`에 도메인 규칙을 넣지 않는다.

## 2. Firebase Guardrail

- 경로는 `FirebasePath`에서만 만든다.
- RTDB write는 Repository/Gateway에서만 한다.
- multi-location update는 문서화한다.
- 카운터는 transaction으로만 바꾼다.

## 3. API Guardrail

- 모든 응답은 `ApiResponse`.
- 모든 목록은 cursor 기반.
- enum 값은 영어 대문자.
- deprecated AI/OCR 에러를 되살리지 않는다.

## 4. 테스트 Guardrail

- Auth, Posts, Jury, Courses는 테스트 없으면 완료 불가.
- 권한 테스트는 happy path보다 중요하다.
- Firebase Stub을 사용한다.
