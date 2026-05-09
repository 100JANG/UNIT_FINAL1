# Recommended Next Steps

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 개발 전 확정

1. 서비스명 통일
2. 학교/학과 seed 데이터 확정
3. Auth verify 방식 확정
4. FCM 사용 여부 확정
5. MVP endpoint 범위 확정

## 2. 백엔드 구현 순서

```text
1. Spring Boot 프로젝트 생성
2. common ApiResponse/ErrorCode/ExceptionHandler
3. FirebaseConfig + RealtimeDatabaseClient
4. SecurityConfig + FirebaseTokenVerifier + JwtTokenProvider
5. Auth verify/refresh
6. Users me
7. Boards seed
8. Posts feed/create/detail
9. Comments
10. Likes/Scraps
11. Courses search/detail
12. Reviews quota/write
13. Reports
14. Jury case/vote
15. Notifications
16. Security Rules 작성
17. Security Rules 작성
18. 통합 테스트
```

## 3. Claude Code 첫 작업 추천

첫 작업은 바로 기능 구현이 아니라 스캐폴딩이다.

```text
common
firebase
security
auth
users
posts
```

까지만 먼저 생성하고 테스트를 붙인다.
