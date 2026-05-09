# Firebase Realtime Database Model

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.  
> Reserved 기능은 구현/대체 구현하지 않고 문서상 자리만 남긴다.



## 1. 설계 원칙

Realtime Database는 정규화된 RDB처럼 쓰지 않는다. 화면과 구독 단위에 맞춰 반정규화한다.

## 2. 최상위 노드

```json
{
  "schools": {},
  "departments": {},
  "users": {},
  "sessions": {},
  "boards": {},
  "posts": {},
  "post_feeds": {},
  "post_stats": {},
  "post_likes": {},
  "post_scraps": {},
  "comments": {},
  "comment_stats": {},
  "courses": {},
  "course_reviews": {},
  "course_stats": {},
  "review_locks": {},
  "reports": {},
  "jury_cases": {},
  "jury_votes": {},
  "jury_case_stats": {},
  "notifications": {},
  "fcm_tokens": {},
  "user_activity": {}
}
```

## 3. 생성하지 않는 노드

```text
student_registry
ai_refine
ai_judgments
recaps
recap_jobs
ocr_results
moderation_results
```

위 노드는 Reserved 기능이므로 만들지 않는다.

## 4. User

```json
{
  "userId": "u_123",
  "email": "user@ajou.ac.kr",
  "displayName": "이동혁",
  "schoolId": null,
  "departmentId": null,
  "studentNumber": null,
  "studentVerificationStatus": "RESERVED",
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 5. Post

```json
{
  "postId": "p_123",
  "boardId": "free",
  "schoolId": "ajou",
  "departmentId": "ajou_csi",
  "authorId": "u_123",
  "anonymousId": "익명_a3f9",
  "title": "기숙사 식단의 질이 아쉽습니다",
  "content": "본문",
  "tags": ["기숙사", "학식"],
  "visibility": "PUBLIC",
  "status": "PUBLISHED",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## 6. Feed Item

```json
{
  "postId": "p_123",
  "boardId": "free",
  "boardName": "자유게시판",
  "title": "기숙사 식단의 질이 아쉽습니다",
  "preview": "이번 학기 식단...",
  "schoolId": "ajou",
  "departmentId": "ajou_csi",
  "anonymousId": "익명_a3f9",
  "createdAt": "...",
  "stats": {
    "likes": 24,
    "comments": 7,
    "scraps": 3
  }
}
```

## 7. 삭제 정책

초기 MVP는 hard delete 대신 status 변경을 기본으로 한다.

```text
PUBLISHED
DELETED_BY_AUTHOR
REMOVED_BY_ADMIN
```

`HIDDEN_BY_MODERATION`은 AI/Rule moderation 대체 구현을 암시할 수 있으므로 이번 MVP 상태값에서 제외한다.

## 8. Comment 모델 (확정)

댓글 RTDB 경로 기준은 다음과 같이 확정한다.

```text
/comments/{postId}/{commentId}              # 댓글 본체 (canonical)
/comments/{postId}                          # 게시글 단위 댓글 컬렉션 (list 조회용 부모)
/comment_stats/{commentId}/likes            # 댓글 좋아요 카운터 (transaction increment)
/comment_likes/{commentId}/{userId}         # 댓글 좋아요 표시
/user_comments/{userId}/{commentId}         # 사용자별 댓글 인덱스
/post_stats/{postId}/comments               # 게시글의 누적 댓글 수 (총 댓글 수 정의, 아래 §9 참고)
```

**Deprecated / 사용 금지 경로**

```text
/post_comments/...                          # 사용하지 않는다. /comments/{postId}/{commentId}로 통일한다.
```

`/post_comments`로 시작하는 경로는 만들지 않는다. 과거 후보 표기로 일부 산출물에 노출된 경우라도
실제 코드/문서/테스트 어디에서도 사용하지 않는다.

Comment 본체 필드:

```json
{
  "commentId": "c_xxxx",
  "postId": "p_xxxx",
  "userId": "u_xxxx",
  "anonymousId": "익명_xxxx",
  "content": "댓글 본문",
  "parentCommentId": null,
  "deleted": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

depth는 root(`parentCommentId=null`)와 1단계 reply(`parentCommentId=root.commentId`)만 허용한다.

## 9. Comment 삭제 정책 + post_stats.comments 정의 (확정)

댓글 삭제는 hard delete가 아니라 **soft delete**이다.

```text
DELETE /v1/posts/{postId}/comments/{commentId}
  → /comments/{postId}/{commentId}/deleted  = true
  → /comments/{postId}/{commentId}/content  = "삭제된 댓글입니다."
  → /comments/{postId}/{commentId}/updatedAt = <now>
  → /post_stats/{postId}/comments           는 감소시키지 않는다.
```

**`post_stats.comments`의 의미는 "총 작성된 댓글 수 (total comment count)"이다.**
- 댓글이 작성되면 +1
- 댓글이 soft delete되어도 **감소하지 않는다**
- "현재 활성 댓글 수"가 아니다. soft delete된 댓글도 thread 자리가 유지되므로 `post_stats.comments`는
  해당 게시글에서 일어난 총 토론 분량을 표현하는 누적 지표이다.

활성 댓글 수가 필요하면 화면 측에서 `/comments/{postId}` 자식 중 `deleted=false` 개수를 별도로 계산한다.

### 삭제된 댓글의 좋아요 정책 (TODO)

현재 MVP에서는 **삭제된 댓글에 대한 좋아요 토글을 허용**한다 (`PostCommentService.toggleLike`는 `deleted` 플래그를
검사하지 않는다). 이 정책은 운영 후 피드백에 따라 다음 중 하나로 재검토 대상이다:

- 삭제된 댓글은 `NOT_FOUND`처럼 처리 (좋아요 차단)
- 기존 좋아요만 유지하고 신규 추가만 차단
- 카운터를 동결(±0)하고 좋아요 표시도 무효화

결정되기 전까지는 위 동작이 그대로 유지된다.

## 10. Profile Activity 인덱스 (확정)

내 활동(Profile) 화면을 위해 사용자별 read-side 인덱스를 다음과 같이 운영한다.

```text
/user_posts/{userId}/{postId}              # 내가 쓴 글 인덱스. value: { postId, createdAt }
/user_comments/{userId}/{commentId}         # 내가 쓴 댓글 인덱스. value: { commentId, postId, createdAt }
/user_likes/{userId}/{postId}               # 내가 추천한 글 인덱스. value: { postId, likedAt }
/user_stats/{userId}                        # 활동 통계 read model (옵션)
```

### 쓰기 흐름

| 트리거 | 갱신되는 인덱스 |
|---|---|
| `POST /v1/posts` | `/user_posts/{authorId}/{postId}` 추가 (PostFirebaseRepository.save) |
| `POST /v1/posts/{id}/comments` | `/user_comments/{authorId}/{commentId}` 추가 (CommentFirebaseRepository.save) |
| `POST /v1/posts/{id}/like` (좋아요 ON) | `/post_likes/{postId}/{userId}=true` + `/user_likes/{userId}/{postId}={postId, likedAt}` 동시 set |
| `POST /v1/posts/{id}/like` (좋아요 OFF) | 위 두 노드를 동시 delete |

### 읽기 흐름

- `GET /v1/users/me/posts`: `/user_posts/{userId}` 자식 → 각 postId로 `/posts/{postId}` 조회 → status가 `PUBLISHED` 아닌 항목은 제외 (MVP 정책)
- `GET /v1/users/me/comments`: `/user_comments/{userId}` 자식 → 각 (postId, commentId)로 `/comments/{postId}/{commentId}` 조회 → 삭제된 댓글은 content="삭제된 댓글입니다."로 그대로 노출 (Comment 도메인 기존 정책)
- `GET /v1/users/me/likes`: `/user_likes/{userId}` 자식 → 각 postId로 `/posts/{postId}` 조회 → PUBLISHED 외 제외

모든 list 조회는 timestamp DESC (newest first) 정렬, base64url(`<ISO timestamp>|<id>`) cursor.
공통 cursor/limit 정책은 `kr.unit.backend.common.api.CursorCodec` + `PaginationLimits`로 통일된다 (기본 limit 20, 최대 50).

### `/user_stats/{userId}` 정의

선택적 read model. 구조:

```json
{
  "posts": 47,
  "comments": 312,
  "likesReceived": 89,
  "scraps": 12,
  "juryVotes": 4
}
```

- `posts`, `comments`: 누적 작성 수
- `likesReceived`: **내 글이 받은** 누적 좋아요 수 (스캔 비용이 큰 지표)
- `scraps`: 스크랩 누적 수 (`POST /v1/posts/{postId}/scrap` toggle 시 `/user_stats/{userId}/scraps`가 ±1로 갱신됨, 음수 floor 보호)
- `juryVotes`: 배심원 투표 참여 누적 수

이 노드가 없으면 `GET /v1/users/me/stats`는 `/user_posts`, `/user_comments` 자식 수로 posts/comments를 fallback 계산하고
`likesReceived`/`scraps`/`juryVotes`는 0으로 응답한다 (AI/Recap 기반 통계 보강 없음).

## 11. Scrap 인덱스 + 카운터 (확정)

게시글 스크랩(`POST /v1/posts/{postId}/scrap`) toggle 흐름 RTDB 경로:

```text
/post_scraps/{postId}/{userId}              # value: true (스크랩 표시)
/user_scraps/{userId}/{postId}              # value: { postId, scrappedAt }
/post_stats/{postId}/scraps                 # 게시글이 받은 스크랩 카운터 (transaction increment)
/user_stats/{userId}/scraps                 # 사용자가 누적 스크랩한 글 수 (transaction increment)
```

### 쓰기 흐름

| 트리거 | 갱신되는 노드 |
|---|---|
| toggle ON (첫 스크랩) | `/post_scraps`, `/user_scraps` 양방향 set + `/post_stats/.../scraps` +1 + `/user_stats/{userId}/scraps` +1 |
| toggle OFF (스크랩 취소) | `/post_scraps`, `/user_scraps` 양방향 delete + 두 카운터 -1 (음수면 0으로 floor) |

Repository(`PostScrapFirebaseRepository`)가 multi-location update + transaction increment를 묶어 처리한다.
카운터 -1 직후 결과가 음수면 즉시 0으로 다시 set한다 (데이터 불일치 방어 — `decrementWithFloor`).

### 읽기 흐름

- `POST /v1/posts/{postId}/scrap` 응답: `{ postId, scrapped, totalScraps }` (totalScraps는 `/post_stats/.../scraps`)
- `GET /v1/users/me/scraps`:
  - `/user_scraps/{userId}` 자식 → 각 postId로 `/posts/{postId}` 조회
  - status가 `PUBLISHED` 아닌 항목(`DELETED_BY_AUTHOR`, `REMOVED_BY_ADMIN`) 자동 제외
  - newest-first (scrappedAt DESC) 정렬, base64url(`<scrappedAt>|<postId>`) cursor + limit (기본 20 / 최대 50)
  - `boardName`은 `/boards/{boardId}/name`에서 lookup (없으면 null)
  - 응답 stats는 `/post_stats/{postId}` 의 likes/comments/scraps

## 12. Pagination 인덱스 + `.indexOn` 요건 (확정)

목록 API는 `RealtimeDatabaseClient.queryByChildDesc / queryByChildAsc` (메모리 fallback은 `RealtimeDatabaseQuerySupport`,
운영은 Firebase Admin SDK Query)로 RTDB의 `orderByChild` 인덱스 쿼리를 사용한다. 운영 RTDB Security Rules의 `.indexOn`을
다음과 같이 설정해야 효율적으로 동작한다 (미설정 시 RTDB가 client-side 정렬로 fallback해 비싸진다).

| API | RTDB 부모 path | orderByChild | 정렬 | 비고 |
|---|---|---|---|---|
| `GET /v1/posts` (scope=all, sort=latest) | `/post_feeds/all` | `createdAt` | DESC | 삭제된 글 제외는 service에서 `/posts/{postId}/status`로 후처리 |
| `GET /v1/posts/{postId}/comments` | `/comments/{postId}` | `createdAt` | ASC | 댓글 흐름은 작성순(ASC) |
| `GET /v1/courses` (schoolId 필수) | `/courses_by_school/{schoolId}` | `courseName` | ASC | `q`/`semester`는 in-memory 후처리 |
| `GET /v1/users/me/scraps` | `/user_scraps/{userId}` | `scrappedAt` | DESC | newest-first |

### 권장 `.indexOn` 명시 (database/03_SECURITY_RULES.md 부록 참고)

```json
{
  "rules": {
    "post_feeds": {
      "all":         { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
      "schools":     { "$schoolId":     { ".indexOn": ["createdAt", "hotScore", "commentCount"] } },
      "departments": { "$departmentId": { ".indexOn": ["createdAt", "hotScore", "commentCount"] } }
    },
    "comments": {
      "$postId": { ".indexOn": ["createdAt"] }
    },
    "courses_by_school": {
      "$schoolId": { ".indexOn": ["courseName", "professor", "semester"] }
    },
    "user_scraps": {
      "$userId": { ".indexOn": ["scrappedAt"] }
    },
    "user_posts": {
      "$userId": { ".indexOn": ["createdAt"] }
    },
    "user_comments": {
      "$userId": { ".indexOn": ["createdAt"] }
    },
    "user_likes": {
      "$userId": { ".indexOn": ["likedAt"] }
    },
    "notifications": {
      "$userId": { ".indexOn": ["createdAt", "isRead"] }
    }
  }
}
```

### 인덱스 기반으로 동작하는 목록 API (확정)

| API | RTDB 부모 path | orderByChild | 정렬 |
|---|---|---|---|
| `GET /v1/posts` (scope=all) | `/post_feeds/all` | `createdAt` | DESC |
| `GET /v1/posts` (scope=school) | `/post_feeds/schools/{viewer.schoolId}` | `createdAt` | DESC |
| `GET /v1/posts` (scope=department) | `/post_feeds/departments/{viewer.departmentId}` | `createdAt` | DESC |
| `GET /v1/posts/{postId}/comments` | `/comments/{postId}` | `createdAt` | ASC |
| `GET /v1/courses` (schoolId 필수) | `/courses_by_school/{schoolId}` | `courseName` | ASC |
| `GET /v1/users/me/posts` | `/user_posts/{userId}` | `createdAt` | DESC |
| `GET /v1/users/me/comments` | `/user_comments/{userId}` | `createdAt` | DESC |
| `GET /v1/users/me/likes` | `/user_likes/{userId}` | `likedAt` | DESC |
| `GET /v1/users/me/scraps` | `/user_scraps/{userId}` | `scrappedAt` | DESC |

scope=school/department는 인증 사용자의 RTDB 계정에서 schoolId/departmentId를 lookup하여 인덱스 path를 결정한다.
이 값이 미등록이면 `422 BUSINESS_RULE_VIOLATION`으로 응답한다.

게시글 작성 시 `PostFirebaseRepository.save`가 양방향 multi-location update로 다음 인덱스를 모두 기록한다:

```
/posts/{postId}
/post_feeds/all/{postId}
/post_feeds/schools/{authorSchoolId}/{postId}        # author.schoolId가 비어있으면 skip
/post_feeds/departments/{authorDeptId}/{postId}      # author.departmentId가 비어있으면 skip
/post_stats/{postId}
/user_posts/{authorId}/{postId}
```

작성자의 schoolId/departmentId는 `UserAccountRepository.findAccount(author.userId())`로 RTDB의 `/users/{userId}`에서
조회한다. 사용자 계정에 해당 값이 미등록이면 단순히 해당 인덱스 entry는 누락되고 게시글 자체는 정상 생성된다.

### 아직 메모리 pagination인 API (이번 사이클 외)

| API | 사유 |
|---|---|
| `GET /v1/jury/me/cases` | 인덱스 노드(`/jury_cases_by_department`)가 별도 흐름이고 `summonedJurors` 필터가 필요해 인덱스 설계 추가가 선행 필요. 후속 사이클로 분리. |

### 인덱스 미사용 sort

`GET /v1/posts`의 `sort=hot`, `sort=comments`는 별도 인덱스 필드(`hotScore`, `commentCount`)가 필요하므로 MVP에서는
빈 페이지로 응답한다. 인덱스를 추가하면 동일 패턴(`orderByChild=hotScore` 등)으로 확장 가능.
