# Backend Coding Harness

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> 제외된 기능은 대체 구현하지 않고 Reserved Placeholder로 비워둔다.


## 1. 작업 전 규칙

1. 관련 MD 문서를 먼저 읽는다.
2. 기능이 구현 대상인지 Reserved인지 확인한다.
3. Reserved 기능이면 구현하지 않는다.
4. 새 파일 생성 전 기존 패키지 구조를 확인한다.
5. Controller → Service → Policy/Domain → Repository 방향을 지킨다.

## 2. Reserved 기능 금지 규칙

Claude Code는 아래 기능을 만들면 안 된다.

- OCR 처리
- student registry 대체 검증
- RuleModerationService
- 금칙어 기반 AI 대체 처리
- AI refine token
- AI 신고 판정
- 신고 후 자동 jury case 생성
- Recap 정량 집계 job
- Recap read model
- Gemma/OCR/Compute Engine 관련 파일

## 3. 구현 중 규칙

- 모든 write는 Spring Boot REST를 통과한다.
- 프론트가 RTDB에 직접 write하는 구조를 만들지 않는다.
- Firebase 접근은 Repository/Adapter 계층으로만 한다.
- Controller에 비즈니스 로직을 넣지 않는다.
- `Util`, `Helper`, `Manager`, `Temp` 파일을 만들지 않는다.
- 테스트 없는 핵심 로직을 추가하지 않는다.

## 4. 완료 보고

모든 작업 후 다음을 보고한다.

1. 변경 파일
2. 변경 이유
3. Reserved 기능 침범 여부
4. 테스트 방법
5. 남은 위험
