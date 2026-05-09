# Domain Overview

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 구현 도메인

| Domain | 핵심 책임 | 주요 API | 상태 |
|---|---|---|---|
| Auth | Firebase ID Token 검증, 세션 발급 | `/auth/session` | 구현 |
| Users | 프로필, 활동 통계 | `/users/me` | 구현 |
| Schools | 학교/학과 메타데이터 | 내부 조회 | 구현 가능 |
| Boards | 게시판 메타 | 내부 조회 | 구현 가능 |
| Posts | 게시글 작성/조회/추천/스크랩 | `/posts` | 구현 |
| Comments | 댓글 작성/조회/추천 | `/posts/{id}/comments` | 구현 |
| Courses | 강의 검색/상세 | `/courses` | 구현 |
| Reviews | 강의평 작성/조회 | `/courses/{id}/reviews` | 구현 |
| Reports | 신고 접수/중복 방지 | `/posts/{id}/report` | 구현, 접수까지만 |
| Jury | 수동 생성 case 조회/투표 | `/jury/cases/{id}` | 제한 구현 |
| Notifications | 알림/FCM 토큰 | `/notifications` | 구현 |

## 2. Reserved 도메인

| Reserved Domain | 관련 API | 처리 |
|---|---|---|
| StudentVerification | `/auth/student-card/verify` | 구현하지 않음 |
| AIRefine | `/ai/refine` | 구현하지 않음 |
| AIReportJudgment | 없음 또는 후속 API | 구현하지 않음 |
| Recap | `/recap/{semester}` | 구현하지 않음 |

## 3. 핵심 비즈니스 규칙

1. 모든 write는 Spring Boot REST를 통과한다.
2. 프론트는 Firebase Realtime Database에 직접 write하지 않는다.
3. 신고는 접수까지만 구현한다.
4. 배심원 case는 신고로 자동 생성하지 않는다.
5. Reserved 기능은 후속 ADR 없이는 구현하지 않는다.
6. Reserved 기능을 다른 방식으로 대체하지 않는다.
