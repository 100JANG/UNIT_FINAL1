# Frontend / Backend Contract

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 계약 원칙

프론트는 React + Tailwind UI를 나중에 연결한다. 백엔드는 프론트가 필요한 화면 상태를 고려하여 API 응답을 고정한다.

## 2. 프론트 라우트별 필요한 API

| Route | Initial REST | Realtime Subscribe |
|---|---|---|
| `/feed` | `GET /v1/posts?scope=all` | `/post_feeds/all`, `/post_stats` |
| `/feed/school` | `GET /v1/posts?scope=school` | `/post_feeds/schools/{schoolId}` |
| `/feed/department` | `GET /v1/posts?scope=department` | `/post_feeds/departments/{departmentId}` |
| `/post/:id` | `GET /v1/posts/{postId}` | `/comments/{postId}`, `/post_stats/{postId}` |
| `/courses` | `GET /v1/courses` | 없음 |
| `/courses/:id` | `GET /v1/courses/{courseId}` | `/course_stats/{courseId}` |
| `/jury/:caseId` | `GET /v1/jury/cases/{caseId}` | `/jury_cases/{caseId}`, `/jury_case_stats/{caseId}` |
| `/notifications` | `GET /v1/notifications` | `/notifications/{userId}` |
| `/profile` | `GET /v1/users/me` | 선택 없음 |
| `/recap/:semester` | `GET /v1/recap/{semester}` | 없음 |

## 3. Write Contract

모든 write는 Spring Boot REST로만 한다.

| Action | Endpoint |
|---|---|
| 글 작성 | `POST /v1/posts` |
| 댓글 작성 | `POST /v1/posts/{postId}/comments` |
| 추천 | `POST /v1/posts/{postId}/like` |
| 신고 | `POST /v1/posts/{postId}/report` |
| 배심원 투표 | `POST /v1/jury/cases/{caseId}/vote` |
| 강의평 작성 | `POST /v1/courses/{courseId}/reviews` |
| 알림 읽음 | `PATCH /v1/notifications/{notificationId}` |
