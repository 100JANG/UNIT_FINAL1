# Denormalization Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 1. 목적

Realtime Database에서 화면을 빠르게 그리기 위해 반정규화한다. 단, 반정규화 지옥을 막기 위해 쓰기 위치와 갱신 책임을 명확히 둔다.

## 2. 반정규화 허용 대상

| 데이터 | 원본 | 복제 위치 | 이유 |
|---|---|---|---|
| 게시글 제목/preview | posts | post_feeds | 피드 빠른 렌더 |
| 게시판 이름 | boards | post_feeds | 카드 렌더 시 join 방지 |
| 작성자 익명닉 | posts | post_feeds, comments | 익명 일관성 |
| stats | post_stats | post_feeds 일부 | 카드 카운트 실시간 표시 |
| course stats | course_stats | courses_by_school | 강의 검색 카드 렌더 |

## 3. 갱신 책임

- 게시글 생성 시: `PostService`가 `posts`, `post_feeds`, `post_stats`, `user_posts`를 multi-location update한다.
- 댓글 생성 시: `CommentService`가 `comments`, `post_stats.comments`, `user_comments`를 갱신한다.
- 좋아요 토글 시: `PostReactionService`가 `post_likes`, `post_stats.likes`만 갱신한다.
- 강의평 작성 시: `ReviewService`가 `course_reviews`, `course_stats`, `review_locks`를 갱신한다.
- 배심원 투표 시: `JuryService`가 `jury_votes`, `jury_case_stats`, `jury_cases.status`를 갱신한다.

## 4. 금지

- 한 데이터를 5곳 이상 복제하지 않는다.
- 복제 위치를 문서화하지 않고 추가하지 않는다.
- UI 편의를 이유로 민감 데이터를 feed item에 복제하지 않는다.
