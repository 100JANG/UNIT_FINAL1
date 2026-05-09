# Test Strategy

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 테스트 대상 우선순위

1. Auth token 검증/발급
2. 권한 정책
3. 게시글 작성/피드 반정규화
4. 좋아요/댓글 카운터 transaction
5. 신고 중복 방지
6. 배심원 투표 중복 방지
7. 강의평 3초 의무
8. 공통 에러 응답

## 2. 실제 Firebase 연결

로컬 단위 테스트에서는 실제 Firebase에 연결하지 않는다. Firebase Gateway 인터페이스를 Stub으로 대체한다.

## 3. 금지

- 테스트에서 운영 Firebase 프로젝트 접근 금지
- flaky한 시간 테스트 금지. ClockProvider 사용
- 외부 네트워크 의존 테스트 금지
