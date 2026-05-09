# Package Structure

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 권장 패키지 구조

```text
src/main/java/kr/unit/backend
  UnitBackendApplication.java

  common
    api
      ApiResponse.java
      PageResponse.java
      Cursor.java
    error
      ErrorCode.java
      BusinessException.java
      GlobalExceptionHandler.java
    security
      AuthUser.java
      JwtTokenProvider.java
      FirebaseTokenVerifier.java
      SecurityConfig.java
      AuthenticationFilter.java
    validation
    time

  firebase
    FirebaseConfig.java
    RealtimeDatabaseClient.java
    FirebasePath.java
    FirebaseTransactionRunner.java
    FirebaseCustomTokenService.java
    FcmNotificationSender.java

  auth
    controller
    service
    dto
    domain
    repository

  users
  schools
  boards
  posts
  comments
  courses
  reviews
  reports
  jury
  notifications
```

## 2. 의도적으로 만들지 않는 패키지

```text
studentverification
ai
moderation
recap
ocr
gemma
```

위 패키지는 후속 ADR 승인 전까지 생성하지 않는다.

## 3. 테스트 구조

```text
src/test/java/kr/unit/backend
  support
    FirebaseTestStub.java
    TestAuthUsers.java
    FixtureFactory.java
  auth
  posts
  comments
  courses
  reviews
  reports
  jury
  notifications
```

## 4. 네이밍 규칙

| 대상 | 형식 | 예 |
|---|---|---|
| Controller | `*Controller` | `PostController` |
| Service | `*Service` | `PostService` |
| Policy | `*Policy` | `PostWritePolicy` |
| Repository | `*Repository` | `PostFirebaseRepository` |
| DTO Request | `*Request` | `CreatePostRequest` |
| DTO Response | `*Response` | `PostDetailResponse` |
| Domain | 명사 | `Post`, `JuryCase` |

## 5. 금지 파일명

- `Util.java`
- `Helper.java`
- `Manager.java`
- `CommonService.java`
- `FirebaseUtils.java`
- `TempService.java`
- `NewPostService.java`
- `FinalService.java`
- `RuleModerationService.java`
- `RecapGenerator.java`
- `StudentRegistryVerifier.java`

## 6. 패키지 의존 방향

```text
controller → service → policy/domain → repository/firebase
```
