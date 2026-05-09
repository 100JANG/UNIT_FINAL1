# Module Boundaries

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 도메인 경계

| Module | 책임 | 직접 접근 가능 | 직접 접근 금지 |
|---|---|---|---|
| auth | 로그인, 세션, 토큰 | users, schools | posts, jury 직접 변경 |
| users | 사용자 프로필, 학적 상태 | schools | posts 내부 상태 |
| posts | 게시글 작성/조회/추천/스크랩 | boards, users summary | jury 상태 변경 |
| comments | 댓글 작성/조회/추천 | posts summary | reports 직접 생성 |
| courses | 강의 검색/상세 | schools | reviews 내부 write |
| reviews | 강의평 작성/참여율 | courses | posts |
| reports | 신고 접수 | posts summary, users | jury vote 직접 집계 |
| jury | 배심원 케이스/투표/결정 | reports, users | posts 직접 삭제 |
| notifications | 알림 저장/읽음/삭제 | users | 핵심 도메인 규칙 판단 |
| recap | 학기 집계 | posts, courses, users read model | 핵심 write 트랜잭션 |

## 2. 모듈 간 통신 원칙

- 다른 모듈의 Repository를 직접 호출하지 않는다.
- 필요 시 해당 모듈의 Service Facade를 사용한다.
- 카운터나 상태 변경은 이벤트/서비스 메서드로만 수행한다.
- 순환 참조가 생기면 도메인 경계가 잘못된 것이다.

## 3. 이벤트 객체

```text
PostCreatedEvent
PostReportedEvent
JuryVoteSubmittedEvent
CourseReviewCreatedEvent
NotificationRequestedEvent
```
