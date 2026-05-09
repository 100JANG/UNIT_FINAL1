# DTO Validation Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 원칙

외부 입력 검증은 DTO에서 1차로 수행하고, 비즈니스 규칙은 Policy에서 2차로 수행한다.

## 2. 주요 DTO

### CreatePostRequest

```java
public record CreatePostRequest(
    @NotBlank String boardId,
    @NotBlank @Size(min = 2, max = 80) String title,
    @NotBlank @Size(min = 10, max = 5000) String content,
    @Size(max = 5) List<@Size(max = 20) String> tags,
    Boolean isAnonymous
) {}
```

### CreateCommentRequest

```java
public record CreateCommentRequest(
    @NotBlank @Size(min = 1, max = 1000) String content,
    String parentCommentId
) {}
```

### CreateCourseReviewRequest

```java
public record CreateCourseReviewRequest(
    @NotNull VoteType vote,
    @Size(max = 200) String comment
) {}
```

`VoteType`: `RECOMMEND`, `NOT_RECOMMEND`, `SKIP`

### ReportPostRequest

```java
public record ReportPostRequest(
    @NotNull ReportReason reason,
    @Size(max = 200) String detail
) {}
```

`ReportReason`: `TOXIC`, `SPAM`, `IMPERSONATION`, `OTHER`

### JuryVoteRequest

```java
public record JuryVoteRequest(
    @NotNull JuryVerdict verdict
) {}
```

`JuryVerdict`: `PROBLEMATIC`, `OK`

## 3. 금지

- Request DTO를 Domain Entity로 재사용하지 않는다.
- `Map<String, Object>`로 request body를 받지 않는다.
- Validation annotation 없이 Service에서만 검증하지 않는다.
