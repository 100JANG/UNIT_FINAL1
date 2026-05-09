# Definition of Done

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 공통 완료 기준

- [ ] 관련 문서와 충돌하지 않는다.
- [ ] Controller/Service/Repository 책임이 분리되어 있다.
- [ ] DTO validation이 있다.
- [ ] ErrorCode가 통일되어 있다.
- [ ] RTDB 경로가 문서에 정의되어 있다.
- [ ] 테스트가 있다.
- [ ] Deprecated 기술을 사용하지 않는다.

## API 완료 기준

- [ ] 요청 예시가 있다.
- [ ] 응답 예시가 있다.
- [ ] 에러 케이스가 있다.
- [ ] 권한 규칙이 있다.
- [ ] 프론트 route와 연결된다.
