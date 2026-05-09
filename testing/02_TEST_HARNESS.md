# Test Harness

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 구성

```text
support/
  FirebaseTestStub.java
  FakeRealtimeDatabaseClient.java
  TestAuthUsers.java
  FixtureFactory.java
  FixedClockConfig.java
  ApiTestClient.java
```

## 2. 필수 테스트 케이스

### Auth

- 학교 이메일이 아니면 실패
- 성공 응답에 `studentVerificationStatus=RESERVED` 포함
- 성공 시 sessionToken + firebaseCustomToken 반환
- 만료된 sessionToken은 AUTH_EXPIRED

### Posts

- 제목 2자 미만 실패
- 본문 10자 미만 실패
- 글 작성 시 posts + feed + stats + user_posts 모두 생성
- 좋아요 중복 클릭 시 카운터 정확

### Jury

- 같은 학과가 아니면 실패
- summoned 목록에 없으면 실패
- 이미 투표하면 실패
- 20명 이상 응답 시 결과 확정

### Courses

- 미작성 강의 상세 조회 시 REVIEW_QUOTA_REQUIRED
- 리뷰 작성 후 강의 상세 조회 성공
- Skip도 참여율에 포함
