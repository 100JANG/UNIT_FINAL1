# Frontend API Contract — REST Endpoints

> 본 문서는 실제 구현된 Spring Boot Controller 기준의 단일 출처이다.
> 모든 응답은 공통 envelope `{ code, message, result }`를 따른다. envelope 형식은 §0 참조.
> 모든 인증 필요 endpoint는 `Authorization: Bearer {sessionToken}` 헤더 필수.

## 0. 공통 envelope

성공:
```json
{ "code": "SUCCESS", "message": "Success", "result": <T> }
```

목록:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "items": [...],
    "pagination": { "cursor": "base64...", "hasMore": true, "total": null }
  }
}
```
- `total`은 항상 `null`로 응답된다 (비용이 큰 지표라 미사용). 없는 셈 치고 무시.

실패:
```json
{ "code": "ERROR_CODE", "message": "한국어 메시지", "result": null | {...detail} }
```

Validation 실패:
```json
{
  "code": "VALIDATION_FAILED",
  "message": "입력값 검증에 실패했습니다",
  "result": { "fields": [{ "field": "title", "reason": "..." }] }
}
```

전체 에러 코드는 [`03_ERROR_HANDLING_CONTRACT.md`](03_ERROR_HANDLING_CONTRACT.md).

---

## 1. Health

### GET /v1/health

| | |
|---|---|
| Status | Implemented |
| Purpose | 가동 여부 ping |
| Auth | 불필요 |

성공 응답:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": { "status": "OK", "service": "unit-backend", "timestamp": "2026-05-10T..." }
}
```

---

## 2. Auth

### POST /v1/auth/session

| | |
|---|---|
| Status | Implemented |
| Purpose | Firebase ID Token으로 백엔드 세션 발급 |
| Auth | 불필요 (Firebase ID Token을 본문으로 받음) |

Request:
```json
{ "firebaseIdToken": "<Firebase Auth ID Token>" }
```

Success Response:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "userId": "u_xxxx",
    "sessionToken": "<JWT — Authorization 헤더에 사용>",
    "firebaseCustomToken": "<RTDB read subscription용>",
    "expiresAt": "2026-08-31T23:59:59Z",
    "studentVerificationStatus": "RESERVED"
  }
}
```

Error: `AUTH_REQUIRED`(401), `AUTH_INVALID`(401), `USER_SUSPENDED`(403), `VALIDATION_FAILED`(400)

Frontend Usage: 로그인 직후 1회. `sessionToken`은 이후 모든 호출의 `Authorization: Bearer`. `firebaseCustomToken`은 `signInWithCustomToken` 호출에 사용.

Notes: `studentVerificationStatus`는 항상 `RESERVED` (학생증 OCR이 Reserved 기능). 어떤 흐름으로도 `VERIFIED`로 자동 승격되지 않는다.

---

### POST /v1/auth/refresh

| | |
|---|---|
| Status | Implemented |
| Auth | 불필요 (sessionToken을 본문으로 받음) |

Request:
```json
{ "sessionToken": "<현재 sessionToken>" }
```

Success Response: `POST /v1/auth/session`과 동일 구조 (새 `sessionToken` + `firebaseCustomToken` 발급).

Error: `AUTH_INVALID`, `AUTH_EXPIRED`, `USER_SUSPENDED`

Frontend Usage: `sessionToken` 만료가 임박했을 때 (또는 401 AUTH_EXPIRED 응답 시) 호출.

---

### POST /v1/auth/logout

| | |
|---|---|
| Status | Implemented (no-op stateless) |
| Auth | **필요** (`Authorization: Bearer ...`) |

Request: 없음

Success Response:
```json
{
  "code": "SUCCESS",
  "message": "로그아웃되었습니다",
  "result": { "userId": "u_xxxx" }
}
```

Notes: 현재 stateless JWT라 서버측에서 토큰 폐기 처리는 없다. 프론트가 sessionToken을 로컬스토리지에서 지우는 것이 실제 로그아웃 효과.

---

## 3. Reserved (501 FEATURE_RESERVED)

### POST /v1/auth/student-card/verify  /  POST /v1/ai/refine  /  GET /v1/recap/{semester}  /  GET /v1/recap/schools/{schoolId}/{semester}

| | |
|---|---|
| Status | **Reserved** |
| Purpose | 학생증 OCR / AI 글다듬기 / AI Recap — 구현되지 않음 |
| Auth | 토큰 검증 없이 항상 501 |

Response (모든 4개 endpoint 동일):
```json
{
  "code": "FEATURE_RESERVED",
  "message": "현재 버전에서 구현하지 않는 예약 기능입니다.",
  "result": null
}
```
HTTP Status: `501 Not Implemented`

Frontend Usage: 호출하지 말 것. 별도 처리는 [`04_RESERVED_FEATURE_CONTRACT.md`](04_RESERVED_FEATURE_CONTRACT.md).

---

## 4. Users

### GET /v1/users/me

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Success Response:
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "userId": "u_xxxx",
    "name": "이동혁",
    "schoolId": "ajou",
    "schoolName": "아주대학교",
    "departmentId": "ajou_csi",
    "departmentName": "융합시스템공학과",
    "studentNumberMasked": "2020****",
    "enrollmentStatus": "RESERVED",
    "sessionExpiresAt": "2026-08-31T23:59:59Z"
  }
}
```

Notes:
- `studentNumberMasked`: 앞 4자만 노출, 나머지 `*`. 미등록이면 `null`.
- `schoolName`/`departmentName`: `/schools/{id}/name`, `/departments/{id}/name` lookup. 메타가 없으면 `null`.
- `enrollmentStatus`: 항상 `RESERVED` 또는 (실 구현 후) `VERIFIED`.
- `sessionExpiresAt`: 현재 sessionToken의 exp.

---

### GET /v1/users/me/stats

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Success Response:
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "posts": 47,
    "comments": 312,
    "likesReceived": 89,
    "scraps": 12,
    "juryVotes": 4
  }
}
```

Notes:
- `/user_stats/{userId}` read model이 있으면 그대로, 없으면 인덱스 자식 수로 fallback (posts/comments만 채우고 나머지는 0).
- `likesReceived`는 fallback 시 0. read model이 운영 중에 백필되면 정확값.

---

### GET /v1/users/me/posts  |  /comments  |  /likes  |  /scraps

| | |
|---|---|
| Status | Implemented (4 endpoints, 동일 구조) |
| Auth | 필요 |

Query: `cursor` (선택), `limit` (기본 20, 최대 50, 0/음수 → 기본 20)

Success Response 공통 envelope:
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "items": [...],
    "pagination": { "cursor": "...", "hasMore": true, "total": null }
  }
}
```

`items` 요소 형식:

`/posts` (`UserPostActivityResponse`):
```json
{ "postId": "p_x", "boardId": "free", "title": "...", "preview": "...",
  "createdAt": "2026-05-09T08:15:00Z", "likes": 24, "comments": 7 }
```

`/comments` (`UserCommentActivityResponse`):
```json
{ "commentId": "c_x", "postId": "p_x", "content": "...", "parentCommentId": null,
  "deleted": false, "createdAt": "2026-05-09T08:15:00Z" }
```
- `deleted=true`인 댓글도 list에 포함되며 `content`는 `"삭제된 댓글입니다."`로 마스킹.

`/likes` (`UserLikeActivityResponse`):
```json
{ "postId": "p_x", "boardId": "free", "title": "...", "preview": "...",
  "likedAt": "2026-05-09T09:00:00Z" }
```

`/scraps` (`UserScrapActivityResponse`):
```json
{ "postId": "p_x", "boardId": "free", "boardName": "자유게시판",
  "title": "...", "preview": "...",
  "createdAt": "2026-05-09T08:15:00Z",
  "scrappedAt": "2026-05-10T09:00:00Z",
  "stats": { "likes": 24, "comments": 7, "scraps": 3 } }
```

Notes:
- 모두 newest-first DESC 정렬 (createdAt 또는 likedAt/scrappedAt 기준).
- `/posts`, `/likes`, `/scraps`는 삭제된 글(`DELETED_BY_AUTHOR`/`REMOVED_BY_ADMIN`) 자동 제외.
- 페이지네이션 cursor advance는 query window 마지막 인덱스 기준 — deleted 항목으로 가시 페이지가 `limit`보다 작아질 수 있다. 자세한 동작은 [`06_PAGINATION_CONTRACT.md`](06_PAGINATION_CONTRACT.md).

---

## 5. Posts

### GET /v1/posts

| | |
|---|---|
| Status | Implemented (`scope=all` + `sort=latest`만). school/department도 동작하나 현재 사용자 schoolId/departmentId 미등록 시 422. hot/comments는 빈 페이지. |
| Auth | 필요 |

Query parameters:

| 이름 | 타입 | 기본 | 설명 |
|---|---|---|---|
| scope | `all`\|`school`\|`department` | `all` | school/department는 viewer의 학교/학과 기준 |
| boardId | string | (없음) | 보드 필터 (in-memory 후처리) |
| sort | `latest`\|`hot`\|`comments` | `latest` | hot/comments는 빈 페이지 응답 (인덱스 미사용) |
| cursor | string | (없음) | 다음 페이지 |
| limit | int | 20 | 최대 50 |

Success Response: `CursorPageResponse<PostFeedItemResponse>`

`PostFeedItemResponse`:
```json
{
  "postId": "p_xxxx",
  "boardId": "free",
  "title": "기숙사 식단의 질이 아쉽습니다",
  "preview": "이번 학기 식단 개편 후 만족도가...",
  "anonymousId": "익명_a3f9",
  "createdAt": "2026-05-09T08:15:00Z",
  "stats": { "likes": 24, "comments": 7, "scraps": 3 }
}
```

Errors:
- `BUSINESS_RULE_VIOLATION`(422): scope=school/department인데 사용자 schoolId/departmentId 미등록
- `INVALID_REQUEST`(400): cursor 형식 오류

---

### POST /v1/posts

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Request (`CreatePostRequest`):
```json
{
  "boardId": "free",
  "title": "기숙사 식단의 질이 아쉽습니다",
  "content": "이번 학기 식단 개편 후 만족도가 떨어진 것 같습니다.",
  "tags": ["기숙사", "학식"],
  "isAnonymous": true
}
```

Validation:
- `boardId`: NotBlank
- `title`: NotBlank, 2~80자
- `content`: NotBlank, 10~5000자
- `tags`: 최대 5개, 각 태그 최대 20자
- `isAnonymous`: Boolean (null이면 true로 처리)

Success Response (`PostCreatedResponse`):
```json
{
  "code": "SUCCESS",
  "message": "게시글이 작성되었습니다",
  "result": {
    "postId": "p_x9y8z7",
    "boardId": "free",
    "createdAt": "2026-05-09T08:15:00Z",
    "url": "/post/p_x9y8z7"
  }
}
```

Notes:
- 작성 시 `/post_feeds/all`, `/post_feeds/schools/{userSchoolId}` (있으면), `/post_feeds/departments/{userDeptId}` (있으면), `/user_posts/{userId}` 모두 자동 갱신.

Errors: `VALIDATION_FAILED`, `AUTH_REQUIRED`

---

### GET /v1/posts/{postId}

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Success Response (`PostDetailResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "postId": "p_xxxx",
    "boardId": "free",
    "title": "...",
    "content": "...",
    "tags": ["..."],
    "anonymousId": "익명_a3f9",
    "visibility": "PUBLIC",
    "status": "PUBLISHED",
    "createdAt": "2026-05-09T08:15:00Z",
    "updatedAt": "2026-05-09T08:15:00Z",
    "stats": { "likes": 24, "comments": 7, "scraps": 3 }
  }
}
```

Errors: `NOT_FOUND` — 글이 없거나 soft-delete됨 (`DELETED_BY_AUTHOR`/`REMOVED_BY_ADMIN`).

---

### POST /v1/posts/{postId}/like

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Request: 없음

Success Response (`PostLikeResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": { "postId": "p_xxxx", "liked": true, "likes": 25 }
}
```

Notes: toggle. 좋아요 OFF시 `/user_likes/{userId}/{postId}` 양방향 삭제. 카운터는 음수 floor(0) 보호.

Errors: `NOT_FOUND`

---

### POST /v1/posts/{postId}/scrap

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Success Response (`PostScrapResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": { "postId": "p_xxxx", "scrapped": true, "totalScraps": 7 }
}
```

Notes: toggle. `/user_scraps/{userId}/{postId}` + `/post_stats/{postId}/scraps` + `/user_stats/{userId}/scraps` 모두 양방향 동기화. 카운터 음수 floor 보호.

Errors: `NOT_FOUND`

---

### POST /v1/posts/{postId}/report

| | |
|---|---|
| Status | Implemented (접수까지만 — 자동 jury 생성 없음) |
| Auth | 필요 |

Request (`ReportPostRequest`):
```json
{ "reason": "TOXIC", "detail": "부가 설명 (선택)" }
```

`reason`: `TOXIC` \| `SPAM` \| `IMPERSONATION` \| `OTHER`. NotNull.
`detail`: 선택, 최대 200자.

Success Response (`ReportCreatedResponse`):
```json
{
  "code": "SUCCESS",
  "message": "신고가 접수되었습니다",
  "result": { "reportId": "r_8a7b6c", "status": "RECEIVED" }
}
```

Notes: 신고 즉시 자동 배심원 생성/AI 판정 **없음**. 접수만 저장.

Errors: `NOT_FOUND`(글 없음), `REPORT_DUPLICATE`(422 — 같은 글 중복 신고)

---

## 6. Comments

### GET /v1/posts/{postId}/comments

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Query: `cursor` (선택), `limit` (기본 20, 최대 50). `size` 파라미터는 더 이상 받지 않음.

Success Response: `CursorPageResponse<CommentResponse>`

`CommentResponse`:
```json
{
  "commentId": "c_xxxx",
  "postId": "p_xxxx",
  "anonymousId": "익명_a3f9",
  "content": "댓글 본문",
  "parentCommentId": null,
  "deleted": false,
  "likes": 3,
  "createdAt": "2026-05-09T08:15:00Z"
}
```

Notes:
- 정렬: `createdAt` ASC (작성 순). 댓글 흐름이 자연스럽게 보이도록.
- 삭제된 댓글도 list에 포함되며 `content`가 `"삭제된 댓글입니다."`로 마스킹, `deleted=true`.
- `parentCommentId`로 root 댓글과 1단계 reply 구분 (depth ≤ 1).

Errors: `NOT_FOUND`(post 없음)

---

### POST /v1/posts/{postId}/comments

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Request (`CreateCommentRequest`):
```json
{ "content": "댓글 내용", "parentCommentId": null }
```

Validation:
- `content`: NotBlank, 1~1000자
- `parentCommentId`: 선택. 있으면 root 댓글이어야 함 (그 부모는 null).

Success Response (`CommentCreatedResponse`):
```json
{
  "code": "SUCCESS",
  "message": "댓글이 작성되었습니다",
  "result": {
    "commentId": "c_xxxx",
    "postId": "p_xxxx",
    "parentCommentId": null,
    "createdAt": "2026-05-09T08:15:00Z"
  }
}
```

Errors: `VALIDATION_FAILED`, `NOT_FOUND`(post or parent 없음), `BUSINESS_RULE_VIOLATION`(422 — depth 2 시도)

---

### POST /v1/posts/{postId}/comments/{commentId}/like

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Success Response (`CommentLikeResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": { "commentId": "c_xxxx", "liked": true, "totalLikes": 3 }
}
```

Notes: toggle. 삭제된 댓글에도 좋아요 허용 (TODO: 정책 재검토 — `09_KNOWN_LIMITATIONS.md` 참고).

Errors: `NOT_FOUND`

---

### DELETE /v1/posts/{postId}/comments/{commentId}

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 (본인 댓글만) |

Success Response:
```json
{
  "code": "SUCCESS",
  "message": "댓글이 삭제되었습니다",
  "result": { "commentId": "c_xxxx" }
}
```

Notes:
- soft delete: `deleted=true`, `content="삭제된 댓글입니다."`로 변경.
- 이미 삭제된 댓글에 재호출하면 idempotent로 200 응답.
- `post_stats.comments` 카운터는 감소시키지 않음 (총 작성 흔적 유지).

Errors: `NOT_FOUND`, `FORBIDDEN`(타인 댓글)

---

## 7. Courses

### GET /v1/courses

| | |
|---|---|
| Status | Implemented (schoolId 필수) |
| Auth | 필요 |

Query parameters:

| 이름 | 타입 | 기본 | 설명 |
|---|---|---|---|
| q | string | (없음) | 검색어 (courseName/professor 부분 일치, in-memory 후처리) |
| schoolId | string | (없음) | **필수** — 없으면 빈 페이지 응답 |
| semester | string | (없음) | 학기 정확 일치 (예: `2026-1`) |
| cursor | string | (없음) | 다음 페이지 |
| limit | int | 20 | 최대 50 |

Success Response: `CursorPageResponse<CourseSummaryResponse>`

`CourseSummaryResponse`:
```json
{
  "courseId": "c_xxxx",
  "schoolId": "ajou",
  "courseName": "데이터구조",
  "professor": "김교수",
  "semester": "2026-1"
}
```

Notes: 정렬 `courseName` ASC. q는 contains, semester는 정확 일치.

---

### GET /v1/courses/{courseId}

| | |
|---|---|
| Status | Implemented (REVIEW_QUOTA_REQUIRED 정책) |
| Auth | 필요 |

Success Response (`CourseDetailResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "courseId": "c_xxxx",
    "courseName": "데이터구조",
    "professor": "김교수",
    "semester": "2026-1",
    "recommend": 12,
    "notRecommend": 3,
    "skip": 2,
    "total": 17,
    "recommendRate": 0.8
  }
}
```

Notes:
- `recommendRate` = recommend / (recommend + notRecommend). SKIP은 분모 제외, total에는 포함.
- 미작성자는 `REVIEW_QUOTA_REQUIRED`(422). 프론트는 작성 화면으로 라우팅.

Errors: `NOT_FOUND`, `REVIEW_QUOTA_REQUIRED`(422)

---

### POST /v1/courses/{courseId}/reviews

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Request (`CreateCourseReviewRequest`):
```json
{ "vote": "RECOMMEND", "comment": "유익했습니다" }
```

Validation:
- `vote`: `RECOMMEND` \| `NOT_RECOMMEND` \| `SKIP`. NotNull.
- `comment`: 선택, 최대 200자.

Success Response (`CourseReviewCreatedResponse`):
```json
{
  "code": "SUCCESS",
  "message": "강의평이 등록되었습니다",
  "result": {
    "reviewId": "rv_xxxx",
    "courseId": "c_xxxx",
    "stats": {
      "recommend": 13, "notRecommend": 3, "skip": 2,
      "total": 18, "recommendRate": 0.8125
    }
  }
}
```

Errors: `NOT_FOUND`, `BUSINESS_RULE_VIOLATION`(이미 작성)

---

## 8. Notifications

### GET /v1/notifications

| | |
|---|---|
| Status | Implemented |
| Auth | 필요 |

Query: `size` (기본 50, 1~100).

> ⚠️ 다른 list endpoint는 `limit` 파라미터를 사용하지만 이 endpoint는 역사적으로 `size`. 다음 사이클에 통일 예정 ([`09_KNOWN_LIMITATIONS.md`](09_KNOWN_LIMITATIONS.md)).

Success Response: `CursorPageResponse<NotificationResponse>` (현재 cursor는 항상 null로 응답, hasMore만 동작)

`NotificationResponse`:
```json
{
  "notificationId": "n_xxxx",
  "type": "POST_COMMENT",
  "title": "댓글이 달렸습니다",
  "body": "...",
  "isRead": false,
  "createdAt": "2026-05-09T08:15:00Z"
}
```

`type`: `JURY_SUMMON` \| `POST_COMMENT` \| `POST_LIKE` \| `RECAP_READY` \| `REPORT_RESULT` \| `SYSTEM`.

---

### PATCH /v1/notifications/{notificationId}

읽음 처리.

Success: `result: { notificationId, isRead: true }`. Errors: `NOT_FOUND`.

### DELETE /v1/notifications/{notificationId}

단건 삭제.

Success: `result: { notificationId }`. Errors: `NOT_FOUND`.

### POST /v1/notifications/mark-all-read

전체 읽음.

Success: `result: { userId }`.

### POST /v1/notifications/fcm-token

FCM 토큰 등록.

Request (`FcmTokenRegisterRequest`):
```json
{ "deviceId": "android-abc123", "fcmToken": "FcmRegistrationToken..." }
```
Validation: `deviceId` NotBlank max100, `fcmToken` NotBlank max4096.

Success: `result: { deviceId }`.

Notes: 실제 FCM 발송은 미구현. 토큰 등록만 동작.

---

## 9. Jury

### GET /v1/jury/cases/{caseId}

| | |
|---|---|
| Status | Implemented (수동 생성된 case만) |
| Auth | 필요 — 호출된 jury(summonedJurors에 포함된 사용자)만 |

Success Response (`JuryCaseResponse`):
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "caseId": "case_xxxx",
    "departmentId": "ajou_csi",
    "status": "OPEN",
    "summonedJurors": ["u_a", "u_b", "..."],
    "createdAt": "2026-05-08T00:00:00Z",
    "closesAt": "2026-05-10T00:00:00Z"
  }
}
```
`status`: `RESERVED` \| `OPEN` \| `RESOLVED` \| `NEEDS_ADMIN_REVIEW` \| `CLOSED_EXPIRED` \| `CANCELLED`.

Errors: `NOT_FOUND`, `JURY_NOT_AUTHORIZED`(호출되지 않은 사용자)

---

### POST /v1/jury/cases/{caseId}/vote

Request (`JuryVoteRequest`):
```json
{ "verdict": "PROBLEMATIC" }
```
`verdict`: `PROBLEMATIC` \| `OK`. NotNull.

Success Response (`JuryVoteResponse`):
```json
{
  "code": "SUCCESS",
  "message": "투표가 등록되었습니다",
  "result": {
    "caseId": "case_xxxx",
    "userId": "u_a",
    "verdict": "PROBLEMATIC",
    "problematicVotes": 5,
    "okVotes": 2
  }
}
```

Errors: `NOT_FOUND`, `JURY_NOT_AUTHORIZED`, `JURY_ALREADY_VOTED`(422), `JURY_WINDOW_CLOSED`(422)

---

### GET /v1/jury/me/cases

| | |
|---|---|
| Status | **Partial — 빈 페이지 응답 (200 OK + items=[])** |
| Auth | 필요 |

현재 `summonedJurors` 인덱스 노드 설계가 미완 → 항상 빈 페이지. 다음 사이클에서 `/jury_cases_summoned/{userId}` 인덱스 추가 후 활성화 예정.

응답 envelope만 정확히 옴 (`items=[]`, `pagination={cursor:null, hasMore:false, total:0}`). 프론트는 빈 상태 UI를 노출.
