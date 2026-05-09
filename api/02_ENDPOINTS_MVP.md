# MVP Endpoints

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. Auth

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/v1/auth/session` | Firebase ID Token으로 백엔드 세션 발급 |
| POST | `/v1/auth/refresh` | 세션 토큰 갱신 |
| POST | `/v1/auth/logout` | 세션 폐기 |

## 2. Reserved Auth

| Method | Endpoint | 상태 |
|---|---|---|
| POST | `/v1/auth/student-card/verify` | Reserved. 구현하지 않음 |

## 3. Users / Profile

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/v1/users/me` | 내 프로필 |
| GET | `/v1/users/me/stats` | 내 활동 통계 |
| PATCH | `/v1/users/me/settings` | 설정 변경 |
| GET | `/v1/users/me/posts` | 내가 쓴 글 |
| GET | `/v1/users/me/comments` | 내가 쓴 댓글 |
| GET | `/v1/users/me/likes` | 추천한 글 |

## 4. Posts

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/v1/posts` | 피드 조회 |
| POST | `/v1/posts` | 게시글 작성 |
| GET | `/v1/posts/{postId}` | 게시글 상세 + 댓글 |
| PATCH | `/v1/posts/{postId}` | 게시글 수정 |
| DELETE | `/v1/posts/{postId}` | 게시글 삭제 처리 |
| POST | `/v1/posts/{postId}/like` | 추천 토글 |
| POST | `/v1/posts/{postId}/scrap` | 스크랩 토글 |
| POST | `/v1/posts/{postId}/report` | 신고 접수. 자동 판정/자동 배심원 생성 없음 |

## 5. Comments

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/v1/posts/{postId}/comments` | 댓글 작성 |
| PATCH | `/v1/posts/{postId}/comments/{commentId}` | 댓글 수정 |
| DELETE | `/v1/posts/{postId}/comments/{commentId}` | 댓글 삭제 |
| POST | `/v1/posts/{postId}/comments/{commentId}/like` | 댓글 추천 토글 |

## 6. Courses / Reviews

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/v1/courses` | 강의 검색 |
| GET | `/v1/courses/{courseId}` | 강의 상세 + 리뷰 |
| POST | `/v1/courses/{courseId}/reviews` | 강의평 작성 |
| POST | `/v1/courses/{courseId}/reviews/{reviewId}/report` | 강의평 신고 |

## 7. Reports / Jury

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/v1/reports/me` | 내가 신고한 항목 조회 |
| GET | `/v1/jury/cases/{caseId}` | 수동 생성 case 조회만 허용 |
| POST | `/v1/jury/cases/{caseId}/vote` | 수동 생성 case 투표만 허용 |
| GET | `/v1/jury/me/cases` | 내가 호출된 배심원 사건 목록 |

## 8. Notifications

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/v1/notifications` | 알림 목록 |
| PATCH | `/v1/notifications/{notificationId}` | 읽음 처리 |
| DELETE | `/v1/notifications/{notificationId}` | 알림 삭제 |
| POST | `/v1/notifications/mark-all-read` | 전체 읽음 |
| POST | `/v1/notifications/fcm-token` | FCM 토큰 등록 |

## 9. Reserved AI / Recap

| Method | Endpoint | 상태 |
|---|---|---|
| POST | `/v1/ai/refine` | Reserved. 구현하지 않음 |
| GET | `/v1/recap/{semester}` | Reserved. 구현하지 않음 |
| GET | `/v1/recap/schools/{schoolId}/{semester}` | Reserved. 구현하지 않음 |

## 10. 금지 Endpoint

| Endpoint | 처리 |
|---|---|
| `/v1/auth/verify` | 만들지 않음 |
| `/v1/moderation/*` | 만들지 않음 |
| `/v1/ai/judgment/*` | 만들지 않음 |
| `/v1/recap/jobs/*` | 만들지 않음 |
