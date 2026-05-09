# Controller / Service / Repository Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. Controller 규칙

Controller는 다음만 한다.

1. URL 매핑
2. Request DTO 수신
3. `@Valid` 검증 트리거
4. 인증 사용자 주입
5. Service 호출
6. `ApiResponse` 반환

Controller에서 금지하는 것:

- RTDB 접근
- Firebase Admin SDK 접근
- 비즈니스 if문
- 카운터 계산
- 권한 정책 판단
- DTO를 `Map`으로 풀어서 처리

## 2. Service 규칙

Service는 유스케이스를 실행한다.

예시 흐름:

```text
PostService.createPost
→ PostWritePolicy.validate
→ BoardQueryService.getRequiredBoard
→ Post.create
→ PostFirebaseRepository.save
→ FeedFirebaseRepository.addToFeeds
→ PostCreateResponse 반환
```

Service에서 금지하는 것:

- HTTP Request/Response 의존
- `DatabaseReference` 직접 사용
- 거대한 메서드
- 여러 도메인 로직 혼합

## 3. Repository 규칙

Repository는 Firebase Realtime Database 접근만 담당한다.

허용:

- save
- findById
- update
- delete
- query by path
- transaction increment

금지:

- 권한 판단
- 검열 판단
- 배심원 결과 판단
- DTO 검증

## 4. Policy 규칙

Policy는 비즈니스 규칙을 담당한다.

예:

- 게시글 제목 2~80자
- 본문 10~5000자
- 같은 글 중복 신고 금지
- 배심원은 같은 학과 학생이어야 함
- 강의평 미작성자는 강의 상세 열람 제한
