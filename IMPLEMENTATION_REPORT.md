# UNIT Backend — Implementation Report

작성일: 2026-05-09 (1차 스캐폴딩 → 빌드 안정화 → Comments → 정합성 → Profile activity → Scrap → RTDB indexed pagination)
대상: UNIT/CAMPUS:ON Backend Spring Boot 3.x + Firebase Realtime Database MVP 스캐폴딩 + 핵심 API skeleton

---

## 0d. RTDB 인덱스 기반 pagination 고도화 (6번째 사이클)

이 사이클은 신규 도메인 기능 없이 **목록 API의 메모리 정렬·슬라이싱을 RTDB `orderByChild` 인덱스 쿼리로 교체**했다.
사용자 우선순위에 따라 우선순위 1+2 (Posts feed, Courses, Comments, Scraps)만 교체했고, 우선순위 3 (User activity
posts/comments/likes, Jury me cases)은 다음 사이클로 deferral 했다.

### 고도화한 Pagination API (6차 사이클)

| API | 인덱스 path | orderByChild | 정렬 | 비고 |
|---|---|---|---|---|
| `GET /v1/posts` (scope=all, sort=latest) | `/post_feeds/all` | `createdAt` | DESC | 빈 페이지 → 실제 cursor pagination 동작. scope=school/department, sort=hot/comments는 빈 페이지(후속) |
| `GET /v1/courses` (schoolId 필수) | `/courses_by_school/{schoolId}` | `courseName` | ASC | `q`/`semester`는 in-memory 후처리. schoolId 미지정 시 빈 페이지 |
| `GET /v1/posts/{postId}/comments` | `/comments/{postId}` | `createdAt` | ASC | 기존 메모리 정렬 → 인덱스 쿼리로 교체 |
| `GET /v1/users/me/scraps` | `/user_scraps/{userId}` | `scrappedAt` | DESC | 기존 메모리 정렬 → 인덱스 쿼리로 교체 |

### 추가/수정한 RTDB query 메서드

`RealtimeDatabaseClient` 인터페이스에 2개 메서드 추가 (모든 도메인이 공유):

```java
<T> List<QueryEntry<T>> queryByChildDesc(
    String path, String orderByChild, String cursor, int limit, Class<T> type);

<T> List<QueryEntry<T>> queryByChildAsc(
    String path, String orderByChild, String cursor, int limit, Class<T> type);
```

3개 구현체 모두 지원:
- `FakeRealtimeDatabaseClient` (테스트) — `RealtimeDatabaseQuerySupport.inMemoryQuery` 헬퍼 사용
- `InMemoryRealtimeDatabaseClient` (로컬 dev fallback) — 동일 헬퍼 사용
- `FirebaseAdminRealtimeDatabaseClient` (운영) — Firebase Admin SDK `Query.orderByChild + limitToLast/limitToFirst + startAt/endAt` 사용. cursor 항목 strict 제외를 위해 `endAt`/`startAt` 후 cursor key를 post-filter한다.

### 추가/수정한 RTDB 경로 및 .indexOn 요구사항

**FirebasePath 신규 빌더**:
- `postFeedAllRoot()`, `postFeedSchoolRoot(schoolId)`, `postFeedDepartmentRoot(departmentId)` — 피드 인덱스 루트
- `coursesBySchoolRoot(schoolId)` — courses_by_school 인덱스 루트

**`.indexOn` 요구사항** (database/03 §5에 전체 명시; 본 사이클에서는 운영 배포는 수행하지 않고 문서로만 보존):

```json
{
  "post_feeds/all":             { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
  "post_feeds/schools/$id":     { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
  "post_feeds/departments/$id": { ".indexOn": ["createdAt", "hotScore", "commentCount"] },
  "comments/$postId":           { ".indexOn": ["createdAt"] },
  "courses_by_school/$id":      { ".indexOn": ["courseName", "professor", "semester"] },
  "user_scraps/$userId":        { ".indexOn": ["scrappedAt"] },
  "user_posts/$userId":         { ".indexOn": ["createdAt"] },
  "user_comments/$userId":      { ".indexOn": ["createdAt"] },
  "user_likes/$userId":         { ".indexOn": ["likedAt"] },
  "notifications/$userId":      { ".indexOn": ["createdAt", "isRead"] }
}
```

미설정 시 RTDB가 client-side 정렬로 fallback해 비싸지므로, 운영 배포 전에 반드시 룰에 포함해야 한다.

### 공통 인프라 변경

- `common/api/CursorCodec` — String-opaque API 추가 (`encodeString`, `decodeString`, `compareString`, `OpaqueCursorKey`).
  Instant 기반 API는 backward-compat 유지. ISO-8601 timestamp 문자열도 lexicographic 비교가 일치하므로 query layer는
  항상 String-opaque 변환을 통해 cursor를 다룬다 ("중복 구현 금지" 정책 충족).
- `firebase/QueryEntry` — `(key, value)` record. query 결과 한 항목.
- `firebase/RealtimeDatabaseQuerySupport` — Fake + InMemory가 공유하는 in-memory query 헬퍼.

### 추가/수정된 파일

**main 신규**
- `common/api/CursorCodec.java` (String-opaque API 추가; record `OpaqueCursorKey` 추가)
- `firebase/QueryEntry.java`
- `firebase/RealtimeDatabaseQuerySupport.java`
- `courses/dto/CourseSummaryResponse.java`

**main 수정**
- `firebase/RealtimeDatabaseClient.java` — 인터페이스에 2개 query 메서드 추가
- `firebase/FakeRealtimeDatabaseClient.java` (test impl) — 2개 메서드 구현
- `firebase/InMemoryRealtimeDatabaseClient.java` — 2개 메서드 구현
- `firebase/FirebaseAdminRealtimeDatabaseClient.java` — Firebase Admin SDK Query API 기반 2개 메서드 구현
- `firebase/FirebasePath.java` — `postFeedAllRoot/postFeedSchoolRoot/postFeedDepartmentRoot/coursesBySchoolRoot` 4개 빌더 추가
- `posts/repository/PostFirebaseRepository.java` — `queryFeedAllDesc/queryFeedSchoolDesc/queryFeedDepartmentDesc` 메서드 추가
- `posts/service/PostService.java` — `feed(scope, boardId, sort, cursor, limit)` 메서드 추가 (인덱스 쿼리)
- `posts/controller/PostController.java` — feed endpoint 시그니처 확장 (scope/sort/limit), 빈 페이지 → 인덱스 쿼리
- `courses/repository/CourseFirebaseRepository.java` — `queryBySchoolAsc(schoolId, cursor, limit)` 메서드 추가
- `courses/service/CourseService.java` — `search(q, schoolId, semester, cursor, limit)` 메서드 추가
- `courses/controller/CourseController.java` — search endpoint 시그니처 확장 (semester/limit), 빈 페이지 → 인덱스 쿼리
- `comments/repository/CommentFirebaseRepository.java` — `queryByPostAsc(postId, cursor, limit)` 추가
- `comments/service/PostCommentService.java` — `list`를 인덱스 쿼리로 교체 (메모리 정렬·슬라이싱 제거)
- `users/repository/UserActivityRepository.java` — `queryUserScrapsDesc(userId, cursor, limit)` 추가
- `users/service/UserActivityService.java` — `getMyScraps`를 인덱스 쿼리로 교체

**test 신규**
- `firebase/RealtimeDatabaseClientQueryTest.java` — 6 cases (5 DESC + 1 ASC)

**test 수정**
- `posts/service/PostServiceTest.java` — feed 케이스 3건 추가 (`getPosts_latest_usesCursorPage`, `getPosts_latest_excludesDeletedPosts`, `getPosts_limitClampedToFifty`)
- `courses/service/CourseServiceTest.java` — search 케이스 2건 추가 (`getCourses_returnsCursorPage`, `getCourses_limitClampedToFifty`)
- `users/service/UserActivityServiceTest.java` — scrap 인덱스 케이스 2건 추가 (`getMyScraps_usesIndexedQuery`, `getMyScraps_cursorWorks`)

**문서**
- `database/01_REALTIME_DATABASE_MODEL.md` — §12 Pagination 인덱스 + 권장 `.indexOn` + 아직 메모리 pagination인 API 명시
- `database/03_SECURITY_RULES.md` — §5 `.indexOn` 요건 (운영 배포 전 포함 필수)
- `IMPLEMENTATION_REPORT.md` — 본 §0d + §2 API 표 갱신

### 빌드/테스트 결과 (6차 사이클)

```
.\gradlew.bat clean test bootJar  →  BUILD SUCCESSFUL in 35s
97 tests, 0 failures, 0 errors    (5차 84 → 6차 97, +13)
```

테스트 카운트 변화:
- `RealtimeDatabaseClientQueryTest`: 신규 6
- `PostServiceTest`: 4 → 7 (+3 feed 케이스)
- `CourseServiceTest`: 4 → 6 (+2 search 케이스)
- `UserActivityServiceTest`: 11 → 13 (+2 scrap 인덱스 케이스)
- 그 외 클래스 무변동, **회귀 0건** (Comments/Scrap/Profile 등 기존 테스트 모두 통과)

### 아직 메모리 pagination인 API (다음 사이클 deferral — 우선순위 3)

| API | 인덱스 노드 | 후속 작업 메모 |
|---|---|---|
| `GET /v1/users/me/posts` | `/user_posts/{userId}` | createdAt 인덱스 이미 존재. `queryByChildDesc(... "createdAt" ...)`로 교체 가능 |
| `GET /v1/users/me/comments` | `/user_comments/{userId}` | createdAt 인덱스 이미 존재. 동일 패턴 |
| `GET /v1/users/me/likes` | `/user_likes/{userId}` | likedAt 인덱스 이미 존재. 동일 패턴 |
| `GET /v1/jury/me/cases` | `/jury_cases_by_department/{departmentId}` (별도 흐름) | summonedJurors 필터가 필요해 인덱스 노드 설계 추가 필요 |

이번 사이클에서 위 4개는 의도적으로 건드리지 않았다 (사용자 우선순위 3 deferral 명시). 현재 메모리 정렬 동작은 유지되며 기존 테스트도 그대로 통과한다.

### Reserved/금지 정책 준수 확인

- ✅ Course review report 미구현
- ✅ User settings 미구현
- ✅ AI/OCR/Gemma/Recap 코드 추가 없음
- ✅ Reserved 응답(`501 FEATURE_RESERVED`) 변경 없음
- ✅ 새로운 도메인 기능 추가 없음 (인프라/리팩토링만)
- ✅ 기존 테스트 삭제·우회 없음 (회귀 0건)
- ✅ `CursorCodec`/`PaginationLimits` 단일 출처 유지 — 새 utility 만들지 않음, 기존에 String-opaque API만 추가
- ✅ 모든 RTDB 경로는 `FirebasePath`에서만 조립
- ✅ Controller → Service → Repository → FirebasePath/Client 의존 방향 준수
- ✅ RTDB Security Rules 배포 미수행 (사용자 지시 — 문서로만 보존)

---

## 0c. Scrap toggle + 내 스크랩 목록 (5번째 사이클)

이 사이클은 Post Detail/Feed/Profile 화면 연결을 위해 **Scrap 도메인만** 추가했다. 다른 도메인은 변경 없음.

### 추가한 API

| Method | Path | 핸들러 | 정책 |
|---|---|---|---|
| POST | `/v1/posts/{postId}/scrap` | `PostScrapController#toggleScrap` | toggle, 본인 글 허용, 삭제된 글은 NOT_FOUND, 카운터 음수 floor(0) 방어 |
| GET | `/v1/users/me/scraps` | `UserActivityController#myScraps` | newest-first, cursor + limit (기본 20 / 최대 50), 삭제된 글 자동 제외, `boardName`은 `/boards/{id}/name` lookup |

### 추가한 RTDB 경로 / 빌더

```
/post_scraps/{postId}/{userId}              # 기존 FirebasePath.postScrap (재사용)
/user_scraps/{userId}/{postId}              # 신규 FirebasePath.userScrap — toggle 시 양방향 set/delete
/user_scraps/{userId}                       # 신규 FirebasePath.userScrapsRoot (read 인덱스 루트)
/post_stats/{postId}/scraps                 # 신규 FirebasePath.postStatsScraps (transaction increment leaf)
/user_stats/{userId}/scraps                 # 신규 FirebasePath.userStatsScraps (transaction increment leaf)
```

`database/01_REALTIME_DATABASE_MODEL.md §11`에 Scrap 인덱스/카운터 정의 + 쓰기/읽기 흐름 명시. §10의 `/user_stats.scraps` 설명도 토글 연동 사실을 반영해 갱신.

### 카운터 음수 방어

`PostScrapFirebaseRepository.decrementWithFloor(path)` — `-1` increment 결과가 음수면 즉시 `0`으로 set한다. 데이터 불일치(예: 인덱스 표시는 있으나 카운터가 0)에서도 노출/저장 모두 0으로 안전. `addScrap`은 노출 시 `Math.max(0, x)`로 보강. `PostScrapServiceTest.scrapPost_doesNotDecrementBelowZero`로 강제.

### 추가/수정된 파일

**main 신규**
- `posts/dto/PostScrapResponse.java`
- `posts/repository/PostScrapFirebaseRepository.java` (multi-location toggle + floor-protected decrement)
- `posts/service/PostScrapService.java`
- `posts/controller/PostScrapController.java`
- `users/dto/UserScrapActivityResponse.java`

**main 수정**
- `firebase/FirebasePath.java` — `userScrap`, `userScrapsRoot`, `postStatsScraps`, `userStatsScraps` 4개 빌더 추가 (postScrap은 기존)
- `users/repository/UserActivityRepository.java` — `findUserScraps(userId)`, `findBoardName(boardId)`, `ScrapIndexEntry` 레코드 추가
- `users/service/UserActivityService.java` — `getMyScraps(userId, cursor, limit)` 추가, `boardName` lookup 적용
- `users/controller/UserActivityController.java` — `GET /v1/users/me/scraps` 추가

**test 신규**
- `posts/service/PostScrapServiceTest.java` — 5 cases (사용자 요구 모두 포함)

**test 수정**
- `users/service/UserActivityServiceTest.java` — 4 cases 추가 (`getMyScraps_returnsCursorPage`, `getMyScraps_excludesDeletedPosts`, `getMyScraps_clampsLimitToFifty`, `getMyScraps_zeroOrNegativeLimitFallsBackToDefault`)
- `firebase/FirebasePathTest.java` — `scrapPaths` 케이스 추가 (5 path assert)

**문서**
- `database/01_REALTIME_DATABASE_MODEL.md` — §11 Scrap 인덱스/카운터 + §10 `scraps` 설명 갱신
- `IMPLEMENTATION_REPORT.md` — 본 §0c + §2 API 표 갱신

### 추가된 테스트 (10건)

| 클래스 | 케이스 | 검증 |
|---|---|---|
| `PostScrapServiceTest` | `scrapPost_firstTime_addsScrapAndIncrementsCounts` | 양방향 인덱스 set + 두 카운터 +1 |
| `PostScrapServiceTest` | `scrapPost_secondTime_removesScrapAndDecrementsCounts` | 양방향 delete + 두 카운터 -1 |
| `PostScrapServiceTest` | `scrapPost_deletedPost_notFoundOrBusinessRuleViolation` | DELETED_BY_AUTHOR 글 → NOT_FOUND or BUSINESS_RULE_VIOLATION (현재 NOT_FOUND) |
| `PostScrapServiceTest` | `scrapPost_missingPost_notFound` | 미존재 postId → NOT_FOUND |
| `PostScrapServiceTest` | `scrapPost_doesNotDecrementBelowZero` | 카운터=0인 상태에서 toggle OFF → 응답/저장 모두 0으로 floor |
| `UserActivityServiceTest` | `getMyScraps_returnsCursorPage` | newest-first, page1=[p_3,p_2] cursor → page2=[p_1] hasMore=false, boardName lookup 동작 |
| `UserActivityServiceTest` | `getMyScraps_excludesDeletedPosts` | DELETED_BY_AUTHOR + REMOVED_BY_ADMIN 두 종류 모두 제외, 활성 글만 응답 |
| `UserActivityServiceTest` | `getMyScraps_clampsLimitToFifty` | limit=999 → 50건 + hasMore=true |
| `UserActivityServiceTest` | `getMyScraps_zeroOrNegativeLimitFallsBackToDefault` | limit=0/-10 → 기본 20건 |
| `FirebasePathTest` | `scrapPaths` | 5개 path assert |

### 빌드/테스트 결과 (5차 사이클)

```
.\gradlew.bat clean test bootJar  →  BUILD SUCCESSFUL in 31s
84 tests, 0 failures, 0 errors    (4차 74 → 5차 84, +10)
```

테스트 카운트:
- `PostScrapServiceTest`: 신규 5
- `UserActivityServiceTest`: 7 → 11 (+4 my-scraps 케이스)
- `FirebasePathTest`: 9 → 10 (+1 `scrapPaths`)
- 그 외 클래스 무변동, **회귀 0건** (Profile activity / Comments / Like 모두 정상)

### Reserved/금지 정책 준수 확인

- ✅ Feed/Course/Jury pagination 고도화 무변경
- ✅ Course review report 미구현
- ✅ User settings 미구현
- ✅ AI/OCR/Gemma/Recap 코드 추가 없음
- ✅ Reserved 응답(`501 FEATURE_RESERVED`) 변경 없음
- ✅ 모든 RTDB 경로는 `FirebasePath`에서만 조립 (Service/Repository에 path 문자열 직접 작성 없음)
- ✅ Cursor/Limit 정책 재사용: 4차 사이클에서 추출한 `CursorCodec` + `PaginationLimits` 그대로 사용, 새 utility 만들지 않음
- ✅ Controller → Service → Repository → FirebasePath 의존 방향 준수
- ✅ 카운터 음수 floor(0) 보호 + 테스트로 강제

---

## 0b. Profile stats/activity 도메인 추가 (4번째 사이클)

이 사이클은 **Profile 화면 + 내 활동 화면 연결을 위한 5개 endpoint**를 추가했다. 신규 기능 외 다른 도메인은 변경하지 않았다.

### 추가/변경한 API

| Method | Path | 핸들러 | 주요 정책 |
|---|---|---|---|
| GET | `/v1/users/me` | `UserController#me` (기존, 응답 확장) | studentNumber masking (`2020****`), `schoolName`/`departmentName`을 `/schools/{id}`, `/departments/{id}`에서 read, `enrollmentStatus`는 RESERVED에서 자동 승격 없음, `sessionExpiresAt`는 JWT에서 추출 |
| GET | `/v1/users/me/stats` | `UserActivityController#stats` | `/user_stats/{userId}` 우선, 없으면 `/user_posts`/`/user_comments` 자식 수로 posts/comments fallback (그 외 0). AI/Recap 보강 없음 |
| GET | `/v1/users/me/posts` | `UserActivityController#myPosts` | newest-first, cursor + limit (기본 20 / 최대 50), 삭제된 글(REMOVED_BY_ADMIN/DELETED_BY_AUTHOR) 제외 |
| GET | `/v1/users/me/comments` | `UserActivityController#myComments` | newest-first, cursor + limit, 삭제된 댓글은 content="삭제된 댓글입니다." 마스킹된 채로 포함 |
| GET | `/v1/users/me/likes` | `UserActivityController#myLikes` | newest-first, cursor + limit, 삭제된 글은 자동 제외 |

### 추가한 RTDB 경로 / 빌더

```
/user_posts/{userId}/{postId}              # 기존 (PostFirebaseRepository.save에서 이미 write)
/user_posts/{userId}                       # 루트 (FirebasePath.userPostsRoot — read only 인덱스)
/user_comments/{userId}/{commentId}        # 기존 (CommentFirebaseRepository.save에서 이미 write)
/user_comments/{userId}                    # 루트 (FirebasePath.userCommentsRoot)
/user_likes/{userId}/{postId}              # 신규 (FirebasePath.userLike) — 좋아요 toggle 시 양방향 set/delete
/user_likes/{userId}                       # 루트 (FirebasePath.userLikesRoot)
/user_stats/{userId}                       # 신규 (FirebasePath.userStats) — 선택적 read model
```

좋아요 toggle 흐름이 `PostFirebaseRepository.setLike(postId, userId, liked, likedAt)`로 시그니처가 확장되어
`/post_likes/{postId}/{userId}`와 `/user_likes/{userId}/{postId}` 양쪽을 함께 갱신한다. 다른 도메인 정책은 무변경.

`database/01_REALTIME_DATABASE_MODEL.md §10`에 Profile activity 인덱스 정의/쓰기 흐름/읽기 흐름 명시.

### 공통 유틸 추출 (정합성)

`PostCommentService` 안에 있던 cursor 로직을 활동 API와 공유하기 위해 **추출**했다 (사용자 정합성 정리 요구: "중복 구현 금지").

| 신규 공통 클래스 | 책임 |
|---|---|
| `common/api/CursorCodec.java` | base64url(`<ISO timestamp>\|<id>`) 단일 인코딩, `compare(Instant,String,Instant,String)` ASC 비교. 정렬 방향(ASC/DESC)은 호출 측이 부호로 해석. |
| `common/api/PaginationLimits.java` | `DEFAULT_LIMIT=20`, `MAX_LIMIT=50`, `clamp(int)` (≤0 → DEFAULT, 50 초과 → 50) |

`PostCommentService`도 이 두 유틸로 교체되어 동일 정책을 공유 (회귀 0건).

### AuthenticatedUser 확장

`/v1/users/me`의 `sessionExpiresAt` 응답을 위해 `AuthenticatedUser`에 `sessionExpiresAt` 필드 추가.
`AuthenticationFilter`가 JWT의 `exp`를 추출해 principal에 주입한다. RTDB에서 로드된 사용자는 filter 단계에서
`withSessionExpiresAt(...)`로 세션 만료시각이 채워진다. `FixtureFactory.authenticated(...)`는 기본 null overload + Instant 인자 overload를 제공.

### 추가/수정된 파일

**main 신규**
- `common/api/CursorCodec.java`, `common/api/PaginationLimits.java`
- `users/domain/UserStats.java`
- `users/dto/UserStatsResponse.java`, `UserPostActivityResponse.java`, `UserCommentActivityResponse.java`, `UserLikeActivityResponse.java`
- `users/repository/UserActivityRepository.java`
- `users/service/UserActivityService.java`
- `users/controller/UserActivityController.java`

**main 수정**
- `firebase/FirebasePath.java` — `userPostsRoot`, `userCommentsRoot`, `userLike`, `userLikesRoot`, `userStats` 빌더 추가
- `users/dto/UserProfileResponse.java` — 응답 필드 확장 (name, schoolName, departmentName, studentNumberMasked, enrollmentStatus, sessionExpiresAt)
- `users/service/UserProfileService.java` — masking + school/department name lookup + sessionExpiresAt 주입
- `users/controller/UserController.java` — service에 principal 전체를 전달 (userId만 → AuthenticatedUser)
- `users/domain/UserAccount.java` — `toAuthenticatedUser()`에 sessionExpiresAt=null 인자 추가
- `users/repository/UserAccountRepository.java` — `mapToAuthenticated`에 sessionExpiresAt=null 인자
- `common/security/AuthenticatedUser.java` — `sessionExpiresAt` 필드 추가, `withSessionExpiresAt` helper
- `common/security/AuthenticationFilter.java` — `withSessionExpiresAt(session.expiresAt())`로 principal 갱신
- `posts/repository/PostFirebaseRepository.java` — `setLike` 시그니처 확장 + `/user_likes/{userId}/{postId}` 양방향 set/delete
- `posts/service/PostService.java` — `setLike` 호출에 `clockProvider.now()` 전달
- `comments/service/PostCommentService.java` — 내부 cursor/limit 로직을 `CursorCodec`/`PaginationLimits`로 교체

**test 신규**
- `users/service/UserProfileServiceTest.java` — 2 cases
- `users/service/UserActivityServiceTest.java` — 7 cases

**test 수정**
- `firebase/FirebasePathTest.java` — `userActivityPaths` case 추가 (7개 path assert)
- `support/FixtureFactory.java` — `authenticated` overload 2개 (기본 + sessionExpiresAt 명시)

**문서**
- `database/01_REALTIME_DATABASE_MODEL.md` — §10 Profile activity 인덱스 (paths, write/read 흐름, `/user_stats` 정의)
- `IMPLEMENTATION_REPORT.md` — 본 §0b + §2 API 표 갱신

### 추가된 테스트 (9건)

| 클래스 | 케이스 | 검증 |
|---|---|---|
| `UserProfileServiceTest` | `getMyProfile_success_masksStudentNumber` | studentNumber `20201234` → `2020****`, schoolName/departmentName lookup, sessionExpiresAt 노출 |
| `UserProfileServiceTest` | `getMyProfile_doesNotPromoteReservedVerification` | 학교 이메일이라도 enrollmentStatus는 RESERVED 유지, /schools·/departments 부재 시 null 안전 |
| `UserActivityServiceTest` | `getMyStats_success_returnsCounts` | `/user_stats/{userId}`의 5개 필드를 그대로 노출 |
| `UserActivityServiceTest` | `getMyStats_missingStats_returnsZeroDefaults` | stats 노드 없으면 모든 필드 0 |
| `UserActivityServiceTest` | `getMyPosts_returnsCursorPage` | newest-first, hasMore + cursor 발급, 다음 페이지 정확, DELETED_BY_AUTHOR 제외 |
| `UserActivityServiceTest` | `getMyComments_returnsCursorPage` | newest-first cursor pagination, 댓글 3건 → page1=[c_3,c_2], page2=[c_1] |
| `UserActivityServiceTest` | `getMyLikes_returnsCursorPage` | REMOVED_BY_ADMIN 글 제외 후 newest-first 정렬 |
| `UserActivityServiceTest` | `pagination_clampsLimitToFifty` | limit=999 → 50건 + hasMore=true |
| `UserActivityServiceTest` | `pagination_zeroOrNegativeLimitFallsBackToDefault` | limit=0/-10 → 기본 20건 |
| `FirebasePathTest` | `userActivityPaths` | 7개 신규/기존 user_* path assert |

### 빌드/테스트 결과 (4차 사이클)

```
.\gradlew.bat clean test bootJar  →  BUILD SUCCESSFUL in 36s
74 tests, 0 failures, 0 errors    (3차 64 → 4차 74, +10)
```

테스트 카운트 변화:
- `UserProfileServiceTest`: 신규 2
- `UserActivityServiceTest`: 신규 7
- `FirebasePathTest`: 8 → 9 (`userActivityPaths` 추가)
- 그 외 클래스 무변동, **회귀 0건** (PostCommentService 리팩토링 후에도 `PostCommentServiceTest` 11건 모두 통과)

### Reserved/금지 정책 준수 확인

- ✅ Scrap toggle 미구현 (Scrap 도메인은 `/user_stats`의 0 fallback에서만 노출, 인터페이스 추가 없음)
- ✅ Feed/Course/Jury pagination 고도화 무변경 (사용자 활동 list만 신규 cursor 도입)
- ✅ AI/OCR/Gemma/Recap 관련 코드 추가 없음
- ✅ Reserved 응답(`501 FEATURE_RESERVED`) 변경 없음
- ✅ 학생 인증 자동 승격 없음 (`enrollmentStatus`는 RESERVED 유지, 테스트로 강제)
- ✅ studentNumber 원본 노출 없음 (4자 + `*` 마스킹, null/blank 안전)
- ✅ 모든 RTDB 경로는 `FirebasePath`에서만 조립
- ✅ Controller → Service → Repository → FirebasePath 의존 방향 준수

---

---

## 0a. API/문서 정합성 정리 (3번째 사이클)

이 사이클은 새 기능 추가 없이 Comments API 표준화와 문서 일관성만 정리했다.

| 항목 | 변경 |
|---|---|
| `GET /v1/posts/{postId}/comments` query parameter | `size` → **`limit`** 으로 통일. `size`는 더 이상 받지 않음(서버는 무시). 기본값 20, 최대 50 (이전 100 → 50으로 하향). 0 또는 음수가 들어오면 기본값 20으로 fallback. 컨트롤러 javadoc과 테스트 두 케이스(`getComments_clampsLimitToFiftyMax`, `getComments_zeroOrNegativeLimitFallsBackToDefault20`)로 계약 명시. |
| RTDB 댓글 경로 canonical 확정 | **`/comments/{postId}/{commentId}`** 가 단일 기준. 코드/테스트/문서 어디에도 `/post_comments` 잔재 없음(grep 확인). `database/01_REALTIME_DATABASE_MODEL.md §8`에 canonical 경로와 "Deprecated / 사용 금지: `/post_comments/...`" 명시. |
| `post_stats.comments` 정의 | **"총 작성된 댓글 수 (total comment count)"** — 작성 시 +1, soft delete 시 감소하지 않음. `database/01 §9`와 `PostCommentService#delete`의 코드 주석에 정의 명시. 활성 댓글 수가 필요하면 화면 측에서 `/comments/{postId}` 자식 중 `deleted=false` 개수를 별도 계산. |
| 삭제된 댓글에 대한 좋아요 정책 | 현재 MVP는 허용. `PostCommentService#toggleLike`에 `TODO(policy-review)` 주석 추가. 운영 후 (a) NOT_FOUND 처리, (b) 신규만 차단, (c) 카운터 동결 중 하나로 재검토. `database/01 §9` 끝에도 같은 TODO 항목 기록. |

### 추가/수정된 파일 (3차 사이클)

**main 수정**
- `comments/controller/PostCommentController.java` — `@RequestParam(... "size")` → `@RequestParam(... "limit")`, javadoc으로 query 계약 명시
- `comments/service/PostCommentService.java` — `DEFAULT_PAGE_SIZE/MAX_PAGE_SIZE` (20/100) → `DEFAULT_LIMIT/MAX_LIMIT` (20/50), `clampSize` → `clampLimit`, 파라미터명 `size` → `requestedLimit`, `toggleLike`에 `TODO(policy-review)`, `delete`에 `post_stats.comments` 정의 주석

**test 수정/추가**
- `comments/service/PostCommentServiceTest.java` — limit 표기 명시 + 두 신규 케이스:
  - `getComments_clampsLimitToFiftyMax` (limit=999 요청 → 50건만 반환, hasMore=true)
  - `getComments_zeroOrNegativeLimitFallsBackToDefault20` (limit=0 요청 → 기본 20건)

**문서**
- `database/01_REALTIME_DATABASE_MODEL.md` — §8 Comment 모델 + Deprecated `/post_comments` 명시, §9 삭제 정책 + `post_stats.comments` 정의 + 좋아요 정책 TODO
- `IMPLEMENTATION_REPORT.md` — 본 §0a 추가, §2 API 표 갱신

### 빌드/테스트 결과 (3차 사이클)

```
.\gradlew.bat clean test bootJar  →  BUILD SUCCESSFUL
64 tests, 0 failures, 0 errors    (이전 62 + 신규 2)
```

신규 테스트 카운트:
- `PostCommentServiceTest`: 9 → **11** (`getComments_clampsLimitToFiftyMax`, `getComments_zeroOrNegativeLimitFallsBackToDefault20` 추가)
- 그 외 클래스 변동 없음

---

## 0. Comments 도메인 추가 (2번째 사이클)

이 사이클은 Post Detail 화면 연결을 위한 **Comments 도메인만** 추가했다. 다른 미구현 항목(Profile stats, Scrap toggle, Feed/Course pagination 고도화 등)은 의도적으로 건드리지 않았다.

### 추가한 Comments API

| Method | Path | 핸들러 | 정책 |
|---|---|---|---|
| GET | `/v1/posts/{postId}/comments` | `PostCommentController#list` | flat list + parentCommentId, cursor 기반 pagination |
| POST | `/v1/posts/{postId}/comments` | `PostCommentController#create` | content 1~1000자, depth 1까지, post_stats.comments +1 |
| POST | `/v1/posts/{postId}/comments/{commentId}/like` | `PostCommentController#like` | toggle, comment_stats.likes ±1 |
| DELETE | `/v1/posts/{postId}/comments/{commentId}` | `PostCommentController#delete` | 본인 댓글만, soft delete (deleted=true + content="삭제된 댓글입니다."), 이미 삭제된 댓글은 idempotent success, post_stats.comments는 감소시키지 않음 |

### 추가한 RTDB 경로

| 경로 | 용도 |
|---|---|
| `/comments/{postId}/{commentId}` | 댓글 본체 (기존 FirebasePath.comment에 이미 존재) |
| `/comments/{postId}` | postId 단위 댓글 루트 (신규: `FirebasePath.postCommentsRoot`) |
| `/comment_stats/{commentId}/likes` | 댓글 좋아요 카운터 (transaction increment) |
| `/comment_likes/{commentId}/{userId}` | 댓글 좋아요 표시 (신규: `FirebasePath.commentLike`) |
| `/user_comments/{userId}/{commentId}` | 사용자별 댓글 인덱스 (신규: `FirebasePath.userComment`, database/02 명세 기준) |
| `/post_stats/{postId}/comments` | 게시글 댓글 개수 카운터 (기존 PostStats 트리에 leaf로 누적) |

### 추가/수정한 파일

**main 신규**
- `comments/domain/Comment.java`
- `comments/dto/CreateCommentRequest.java`, `CommentResponse.java`, `CommentCreatedResponse.java`, `CommentLikeResponse.java`
- `comments/policy/CommentWritePolicy.java` (1~1000자 무결성 검증, AI/룰 moderation 없음)
- `comments/repository/CommentFirebaseRepository.java`
- `comments/service/PostCommentService.java`
- `comments/controller/PostCommentController.java`

**main 수정**
- `firebase/FirebasePath.java` — `postCommentsRoot`, `commentLike`, `userComment` 빌더 3개 추가
- `posts/service/PostIdGenerator.java` — `generateCommentId()` 추가 (`c_` prefix)

**test 신규**
- `comments/service/PostCommentServiceTest.java` — 9개 케이스 (사용자 요구 전부 포함)

**test 수정**
- `firebase/FirebasePathTest.java` — `commentPaths` 케이스 추가 (5개 신규/기존 path assert)

### 추가된 테스트 (9건)

| 케이스 | 검증 내용 |
|---|---|
| `createComment_success_incrementsPostCommentCount` | 댓글 저장 + `/comments/{postId}/{commentId}`, `/user_comments/{userId}/{commentId}` write, `/post_stats/{postId}/comments == 1` |
| `createReply_success_depthOne` | 부모가 root일 때 reply 작성 성공, `parentCommentId` 저장, `post_stats.comments == 2` |
| `createReply_rejectsDepthTwo` | reply에 reply 시도 시 `BUSINESS_RULE_VIOLATION` |
| `createComment_rejectsBlankContent` | 공백/null 본문 시 `VALIDATION_FAILED` |
| `likeComment_firstTime_incrementsLikes` | toggle on → liked=true, totalLikes=1, `/comment_likes/...` 저장 |
| `likeComment_secondTime_unlikesAndDecrementsLikes` | 동일 사용자가 재호출 → liked=false, totalLikes=0, `/comment_likes/...` 삭제 |
| `deleteOwnComment_success_softDeletes` | 본인 댓글 삭제 → `deleted=true`, `content="삭제된 댓글입니다."`, `post_stats.comments`는 감소 없음 |
| `deleteOtherUserComment_forbidden` | 타인이 삭제 시도 → `FORBIDDEN`, 원본 보존 |
| `getComments_returnsCursorPage` | size=2 페이지에서 hasMore=true + cursor 발급, 다음 페이지에서 마지막 1건 + hasMore=false + cursor=null |

### 패키지 구조 결정

`02_PACKAGE_STRUCTURE.md`가 `comments`를 별도 top-level 모듈로 명시하므로 `kr.unit.backend.comments/`로 분리. 클래스명은 `PostCommentController` 등으로 의미적 관계를 표현하되 패키지 경계는 유지.

### Reserved/금지 정책 준수 확인

- ✅ AI moderation/룰 기반 검열 미구현 (`CommentWritePolicy`는 길이 검증만, 금칙어 필터/반복 문자/URL 감지 없음)
- ✅ Profile stats / Scrap toggle / Feed pagination / Jury pagination 고도화 미수행
- ✅ Reserved 응답 형식(`code:FEATURE_RESERVED`, `result:null`) 변경 없음
- ✅ Reserved 기능(`OCR`, `AI`, `Gemma`, `Recap`) 관련 코드/패키지 추가 없음
- ✅ 신고 → 자동 JuryCase 생성 흐름 추가 없음
- ✅ Controller → Service → Repository → FirebasePath 의존 방향 준수
- ✅ 모든 RTDB 경로는 `FirebasePath`에서만 조립 (Service/Repository에 path 문자열 직접 작성 없음)

### 빌드/테스트 결과

```
> Task :test
BUILD SUCCESSFUL in 34s

> Task :bootJar
BUILD SUCCESSFUL in 16s
```

| 메트릭 | 1차 사이클 | 2차 사이클 (Comments 추가 후) |
|---|---:|---:|
| 테스트 클래스 | 13 | **14** (+1 `PostCommentServiceTest`) |
| 총 테스트 수 | 52 | **62** (+9 댓글 + 1 FirebasePath) |
| 실패 / 에러 | 0 / 0 | **0 / 0** |
| bootJar 크기 | ~82.9 MB | ~82.9 MB |

테스트 클래스별 상세:

| Test Class | tests |
|---|---:|
| `UnitBackendApplicationTests` | 1 |
| `ApiResponseTest` | 3 |
| `ErrorCodeTest` | 5 |
| `JwtTokenProviderTest` | 4 |
| `FirebasePathTest` | 8 (`commentPaths` +1) |
| `FakeRealtimeDatabaseClientTest` | 4 |
| `AuthSessionServiceTest` | 3 |
| `PostServiceTest` | 4 |
| `PostReportServiceTest` | 4 |
| **`PostCommentServiceTest`** | **9 (신규)** |
| `CourseServiceTest` | 4 |
| `NotificationServiceTest` | 4 |
| `JuryServiceTest` | 5 |
| `ReservedFeatureContractTest` | 4 |
| **합계** | **62** |

---

---

## 1. 생성한 핵심 파일

### 빌드 / 환경
- `build.gradle`, `settings.gradle`, `.gitignore`
- `gradlew`, `gradlew.bat` (Gradle 8.10.2 wrapper 스크립트)
- `gradle/wrapper/gradle-wrapper.jar`, `gradle-wrapper.properties`
- `src/main/resources/application.yml`, `application-local.yml`, `application-test.yml`

### Application
- `src/main/java/kr/unit/backend/UnitBackendApplication.java`

### Global / Common
- `common/api/ApiResponse.java`, `Cursor.java`, `CursorPageResponse.java`
- `common/error/ErrorCode.java`, `BusinessException.java`, `ValidationFailureDetail.java`, `GlobalExceptionHandler.java`
- `common/security/AuthUser.java`, `AuthenticatedUser.java`, `JwtTokenProvider.java`, `FirebaseTokenVerifier.java`, `AuthenticationFilter.java`, `CurrentUserArgumentResolver.java`, `SecurityConfig.java`
- `common/config/CorsConfig.java`, `JacksonConfig.java`, `WebMvcConfig.java`
- `common/time/ClockProvider.java`

### Firebase Adapter
- `firebase/RealtimeDatabaseClient.java` (interface — 도메인 레이어가 의존하는 유일한 RTDB 추상화)
- `firebase/FirebasePath.java` (모든 RTDB 경로 빌더의 단일 출처)
- `firebase/FirebaseProperties.java`
- `firebase/FirebaseConfig.java` (`unit.firebase.enabled=true`일 때만 활성화)
- `firebase/FirebaseAdminRealtimeDatabaseClient.java`
- `firebase/FirebaseAdminTokenVerifier.java`
- `firebase/FirebaseAdminCustomTokenIssuer.java`
- `firebase/InMemoryRealtimeDatabaseClient.java` (로컬/테스트 fallback, RTDB tree 의미 모방)
- `firebase/StubFirebaseTokenVerifier.java`
- `firebase/StubFirebaseCustomTokenIssuer.java`

### Auth
- `auth/controller/AuthController.java`
- `auth/service/AuthSessionService.java`, `FirebaseCustomTokenIssuer.java`
- `auth/dto/AuthSessionRequest.java`, `AuthSessionResponse.java`, `AuthRefreshRequest.java`

### Users
- `users/domain/UserAccount.java`
- `users/repository/UserAccountRepository.java`
- `users/service/UserProfileService.java`
- `users/dto/UserProfileResponse.java`
- `users/controller/UserController.java`

### Posts
- `posts/domain/Post.java`, `ReportReason.java`
- `posts/dto/CreatePostRequest.java`, `PostCreatedResponse.java`, `PostFeedItemResponse.java`, `PostDetailResponse.java`, `PostLikeResponse.java`, `ReportPostRequest.java`, `ReportCreatedResponse.java`
- `posts/policy/PostWritePolicy.java`
- `posts/repository/PostFirebaseRepository.java`, `PostReportFirebaseRepository.java`
- `posts/service/PostService.java`, `PostReportService.java`, `PostIdGenerator.java`
- `posts/controller/PostController.java`

### Courses
- `courses/domain/Course.java`, `VoteType.java`
- `courses/dto/CreateCourseReviewRequest.java`, `CourseReviewCreatedResponse.java`, `CourseDetailResponse.java`
- `courses/repository/CourseFirebaseRepository.java`
- `courses/service/CourseService.java`
- `courses/controller/CourseController.java`

### Notifications
- `notifications/domain/Notification.java`, `NotificationType.java`
- `notifications/dto/NotificationResponse.java`, `FcmTokenRegisterRequest.java`
- `notifications/repository/NotificationFirebaseRepository.java`
- `notifications/service/NotificationService.java`
- `notifications/controller/NotificationController.java`

### Jury
- `jury/domain/JuryCase.java`, `JuryCaseStatus.java`, `JuryVerdict.java`
- `jury/dto/JuryVoteRequest.java`, `JuryCaseResponse.java`, `JuryVoteResponse.java`
- `jury/repository/JuryFirebaseRepository.java`
- `jury/service/JuryService.java`
- `jury/controller/JuryController.java`

### Reserved
- `reserved/controller/ReservedFeatureController.java` (모든 Reserved endpoint가 `501 FEATURE_RESERVED` + `result=null` 반환)

### Health
- `health/HealthController.java`

### Test Harness
- `test/.../support/FakeRealtimeDatabaseClient.java` (RTDB tree 의미 모방: set(Map) 분해, get 자식 집계)
- `test/.../support/FixtureFactory.java`
- `test/.../support/FixedClockProvider.java`
- `test/.../UnitBackendApplicationTests.java` (Spring 컨텍스트 부트 검증)
- `test/.../common/api/ApiResponseTest.java`
- `test/.../common/error/ErrorCodeTest.java`
- `test/.../common/security/JwtTokenProviderTest.java`
- `test/.../firebase/FirebasePathTest.java`
- `test/.../support/FakeRealtimeDatabaseClientTest.java`
- `test/.../auth/service/AuthSessionServiceTest.java`
- `test/.../posts/service/PostServiceTest.java`
- `test/.../posts/service/PostReportServiceTest.java`
- `test/.../courses/service/CourseServiceTest.java`
- `test/.../notifications/service/NotificationServiceTest.java`
- `test/.../jury/service/JuryServiceTest.java`
- `test/.../reserved/ReservedFeatureContractTest.java`

### 문서
- `IMPLEMENTATION_PLAN.md`
- `IMPLEMENTATION_REPORT.md` (본 문서)

---

## 2. 구현한 API

| Method | Path | 핸들러 |
|---|---|---|
| GET | `/v1/health` | `HealthController#health` |
| POST | `/v1/auth/session` | `AuthController#session` |
| POST | `/v1/auth/refresh` | `AuthController#refresh` |
| POST | `/v1/auth/logout` | `AuthController#logout` |
| GET | `/v1/users/me` | `UserController#me` (학번 마스킹, school/dept name lookup, sessionExpiresAt 포함) |
| GET | `/v1/users/me/stats` | `UserActivityController#stats` (`/user_stats` 우선, fallback 인덱스 카운트) |
| GET | `/v1/users/me/posts` | `UserActivityController#myPosts` (newest-first, cursor + limit 20/50) |
| GET | `/v1/users/me/comments` | `UserActivityController#myComments` |
| GET | `/v1/users/me/likes` | `UserActivityController#myLikes` |
| GET | `/v1/users/me/scraps` | `UserActivityController#myScraps` (newest-first, boardName lookup) |
| GET | `/v1/posts` | `PostController#feed` (RTDB `/post_feeds/all` createdAt DESC 인덱스 쿼리, scope=all + sort=latest만 구현) |
| POST | `/v1/posts` | `PostController#create` |
| GET | `/v1/posts/{postId}` | `PostController#detail` |
| POST | `/v1/posts/{postId}/like` | `PostController#like` (toggle) |
| POST | `/v1/posts/{postId}/scrap` | `PostScrapController#toggleScrap` (toggle, floor-protected counters) |
| POST | `/v1/posts/{postId}/report` | `PostController#report` (접수까지만) |
| GET | `/v1/posts/{postId}/comments` | `PostCommentController#list` (cursor pagination, `limit` 기본 20 / 최대 50; `size`는 받지 않음) |
| POST | `/v1/posts/{postId}/comments` | `PostCommentController#create` (depth ≤ 1) |
| POST | `/v1/posts/{postId}/comments/{commentId}/like` | `PostCommentController#like` (toggle) |
| DELETE | `/v1/posts/{postId}/comments/{commentId}` | `PostCommentController#delete` (soft delete, 본인만) |
| GET | `/v1/courses` | `CourseController#search` (RTDB `/courses_by_school/{schoolId}` courseName ASC 인덱스 쿼리; q/semester는 in-memory 후처리) |
| GET | `/v1/courses/{courseId}` | `CourseController#detail` (REVIEW_QUOTA_REQUIRED 적용) |
| POST | `/v1/courses/{courseId}/reviews` | `CourseController#createReview` |
| GET | `/v1/notifications` | `NotificationController#list` |
| PATCH | `/v1/notifications/{id}` | `NotificationController#markRead` |
| DELETE | `/v1/notifications/{id}` | `NotificationController#delete` |
| POST | `/v1/notifications/mark-all-read` | `NotificationController#markAllRead` |
| POST | `/v1/notifications/fcm-token` | `NotificationController#registerFcmToken` |
| GET | `/v1/jury/cases/{caseId}` | `JuryController#getCase` (수동 생성된 case 한정) |
| POST | `/v1/jury/cases/{caseId}/vote` | `JuryController#vote` |
| GET | `/v1/jury/me/cases` | `JuryController#listMyCases` |
| POST | `/v1/auth/student-card/verify` | **Reserved → 501 FEATURE_RESERVED** |
| POST | `/v1/ai/refine` | **Reserved → 501 FEATURE_RESERVED** |
| GET | `/v1/recap/{semester}` | **Reserved → 501 FEATURE_RESERVED** |
| GET | `/v1/recap/schools/{schoolId}/{semester}` | **Reserved → 501 FEATURE_RESERVED** |

---

## 3. Firebase Realtime Database 경로

`FirebasePath`에서만 조립한다. 도메인 레이어는 절대 경로 문자열을 직접 만들지 않는다.

```
/users/{userId}
/sessions/{userId}/{sessionId}
/schools/{schoolId}
/departments/{departmentId}
/boards/{boardId}
/posts/{postId}
/post_feeds/all/{postId}
/post_feeds/schools/{schoolId}/{postId}
/post_feeds/departments/{departmentId}/{postId}
/post_stats/{postId}
/post_likes/{postId}/{userId}
/post_scraps/{postId}/{userId}
/user_posts/{userId}/{postId}
/comments/{postId}                                  (postCommentsRoot, 댓글 list 집계)
/comments/{postId}/{commentId}
/comment_stats/{commentId}/likes                    (transaction increment)
/comment_likes/{commentId}/{userId}
/user_comments/{userId}/{commentId}
/courses/{courseId}
/courses_by_school/{schoolId}/{courseId}
/course_reviews/{courseId}/{reviewId}
/course_stats/{courseId}
/review_locks/{userId}/{courseId}
/reports/{reportId}
/reports_by_post/{postId}/{reportId}
/jury_cases/{caseId}
/jury_votes/{caseId}/{userId}
/jury_case_stats/{caseId}
/notifications/{userId}/{notificationId}
/fcm_tokens/{userId}/{deviceId}
```

**의도적으로 만들지 않은 경로**: `/student_registry`, `/ai_refine`, `/ai_judgments`, `/moderation_results`, `/recaps`, `/recap_jobs`, `/ocr_results`. (`FirebasePath`에 빌더가 없으므로 조립 자체가 불가)

---

## 4. Build Verification

| 항목 | 결과 |
|---|---|
| Java 감지 | ✅ `C:\Program Files\Java\jdk-21.0.10` (Java 21.0.10 LTS) — PATH에는 없어 절대 경로로 호출 |
| Gradle 감지 | ❌ 시스템에 미설치 → Gradle Wrapper로 부트스트랩 |
| Gradle Wrapper 존재 | ✅ `gradle-wrapper.jar` (43,583 bytes), `gradlew`, `gradlew.bat` 모두 GitHub `gradle/gradle@v8.10.2`에서 다운로드 후 동봉 |
| Gradle 버전 | `gradle-wrapper.properties` → Gradle 8.10.2-bin (자동 다운로드 완료) |
| 실행 환경 변수 | `$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.10'`, `$env:Path = "$env:JAVA_HOME\bin;$env:Path"` |

### 실행한 명령어 (Windows PowerShell)

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.10'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat --no-daemon clean test
.\gradlew.bat --no-daemon bootJar
```

### `gradlew clean test` 결과

```
> Task :compileJava                BUILD SUCCESSFUL (note: 1 unchecked warning in test source)
> Task :compileTestJava             BUILD SUCCESSFUL
> Task :test                        52 tests, 0 failures, 0 errors

BUILD SUCCESSFUL in 29s
4 actionable tasks: 3 executed, 1 up-to-date
```

테스트 클래스별 상세:

| Test Class | tests | failures | errors |
|---|---:|---:|---:|
| `UnitBackendApplicationTests` (contextLoads) | 1 | 0 | 0 |
| `ApiResponseTest` | 3 | 0 | 0 |
| `ErrorCodeTest` | 5 | 0 | 0 |
| `JwtTokenProviderTest` | 4 | 0 | 0 |
| `FirebasePathTest` | 7 | 0 | 0 |
| `FakeRealtimeDatabaseClientTest` | 4 | 0 | 0 |
| `AuthSessionServiceTest` | 3 | 0 | 0 |
| `PostServiceTest` | 4 | 0 | 0 |
| `PostReportServiceTest` | 4 | 0 | 0 |
| `CourseServiceTest` | 4 | 0 | 0 |
| `NotificationServiceTest` | 4 | 0 | 0 |
| `JuryServiceTest` | 5 | 0 | 0 |
| `ReservedFeatureContractTest` | 4 | 0 | 0 |
| **합계** | **52** | **0** | **0** |

### `gradlew bootJar` 결과

```
> Task :bootJar                     BUILD SUCCESSFUL

BUILD SUCCESSFUL in 15s
```

생성 산출물: `build/libs/unit-backend-0.0.1-SNAPSHOT.jar` (82,893,162 bytes ≈ 82.9 MB; Spring Boot fat jar)

### 1차 실행 시 발견된 실패 → 수정 내역

| 실패 | 근본 원인 | 수정 |
|---|---|---|
| `JwtTokenProviderTest.issueAndParseRoundTrip`, `AuthSessionServiceTest.issueSession_returnsValidJwtThatJwtTokenProviderCanParse` | JJWT 파서가 시스템 클럭으로 `exp`를 검증 → `FixedClockProvider`로 발급한 토큰이 호스트 실시간 기준 만료로 판정 | `JwtTokenProvider#parse`에 `.clock(() -> Date.from(clockProvider.now()))` 추가 |
| `CourseServiceTest.detail_succeedsAfterReviewSubmission`, `skipIsCountedInTotalButNotInRecommendRate`, `NotificationServiceTest.list_returnsNotificationsSortedNewestFirst`, `markAllRead_marksEveryNotificationAsRead` | Fake/InMemory가 단순 path-keyed 저장소라 RTDB tree 의미를 모방하지 못해 `increment("/path/leaf")`와 `set("/path", Map)`이 어우러지지 않음 → 부모 path 조회 시 자식 집계가 안 됨 | `FakeRealtimeDatabaseClient` + `InMemoryRealtimeDatabaseClient`에 RTDB tree 의미 적용: `set(path, Map)`은 leaf로 분해 저장, `get(path)`는 exact가 없으면 자식 path를 재귀적으로 집계해 nested Map 반환, `delete(path)`는 자식까지 재귀 삭제 |

---

## 5. Reserved Feature Contract

| 검증 항목 | 결과 |
|---|---|
| `ErrorCode` enum에 `FEATURE_RESERVED`가 존재하는가 | ✅ `FEATURE_RESERVED(HttpStatus.NOT_IMPLEMENTED, "현재 버전에서 구현하지 않는 예약 기능입니다.")` |
| Reserved HTTP Status가 501 (Not Implemented)인가 | ✅ `ReservedFeatureContractTest`가 `response.getStatusCode().value() == 501` 검증 |
| Reserved 응답 body가 `{ code: "FEATURE_RESERVED", message: "현재 버전에서 구현하지 않는 예약 기능입니다.", result: null }`인가 | ✅ `ReservedFeatureContractTest`가 4개 endpoint(student-card-verify, ai/refine, recap/{semester}, recap/schools/{schoolId}/{semester})에서 동일 형식 검증 |
| Reserved 기능에 실제 Service/Repository/Job/스케줄러가 없는가 | ✅ `kr/unit/backend/reserved/`는 controller만 존재. ai/, ocr/, gemma/, recap/, studentverification/, moderation/ 패키지는 생성하지 않음 |
| OCR/Gemma/AI Refine/AI Recap 대체 구현 부재 확인 | ✅ `PostReportServiceTest.report_doesNotCreateJuryCaseAutomatically`로 신고 → 자동 jury 생성 흐름이 없음을 검증. `ErrorCodeTest.unusedReservedFeatureCodesAreNotDefined`로 `OCR_FAILED`, `INVALID_STUDENT_CARD`, `TOXIC_CONTENT_DETECTED`, `POST_BLOCKED_FROM_FREE_BOARD`, `AI_UNAVAILABLE`이 enum에 없음 검증 |
| 학생 인증 대체 검증 부재 | ✅ `AuthSessionServiceTest.issueSession_createsAccountWithReservedVerification`이 신규 사용자에 `studentVerificationStatus=RESERVED`로 저장되며 학교 이메일 검증으로 VERIFIED 승격하지 않음을 검증 |

### Reserved 응답 예시 (실제 컨트롤러 출력)

```json
{
  "code": "FEATURE_RESERVED",
  "message": "현재 버전에서 구현하지 않는 예약 기능입니다.",
  "result": null
}
```

---

## 6. 아키텍처 검증 체크리스트

### 아키텍처 의존 방향
- ✅ Controller → Service만 호출 (Firebase SDK / `RealtimeDatabaseClient` 미주입)
- ✅ Service → Repository / Policy만 호출 (Firebase SDK 미주입)
- ✅ Repository → `RealtimeDatabaseClient`만 호출 (Firebase Admin SDK 직접 호출 없음)
- ✅ Firebase Admin SDK 직접 호출은 `FirebaseAdminRealtimeDatabaseClient`, `FirebaseAdminTokenVerifier`, `FirebaseAdminCustomTokenIssuer` 내부 한정
- ✅ `FirebasePath` 외부에서 RTDB 경로 문자열 조립 없음

### Reserved 정책
- ✅ OCR / student registry 검증 구현 없음
- ✅ Gemma / 온디바이스 AI 구현 없음
- ✅ AI refine / RuleModeration 구현 없음
- ✅ 신고 → 자동 jury case 생성 흐름 없음
- ✅ AI Recap 구현 없음
- ✅ 모든 Reserved endpoint는 `501 FEATURE_RESERVED` + `result=null`

### API 응답 계약
- ✅ 모든 응답이 `{ code, message, result }`
- ✅ Validation 실패 → `VALIDATION_FAILED` + `result.fields[]`
- ✅ 인증 실패 → `AUTH_REQUIRED`/`AUTH_INVALID`/`AUTH_EXPIRED` 분리
- ✅ 목록 응답은 `CursorPageResponse` (`items` + `pagination{cursor, hasMore, total}`)

### 테스트
- ✅ `gradlew clean test` 통과 (52/52)
- ✅ Reserved 기능 contract test 존재 및 통과
- ✅ FirebasePath test 존재 및 통과 (모든 도메인 경로 + 금지 문자 거부)
- ✅ Post / Course / Notification / Jury 핵심 service test 존재 및 통과

### 보안
- ✅ Firebase service account JSON 파일 생성하지 않음
- ✅ `.env` 파일 생성하지 않음
- ✅ 비밀값은 `application.yml`에서 `${...}` 환경변수만 참조
- ✅ `.gitignore`에 `firebase-credentials.json`, `serviceAccountKey.json`, `.env*`, `src/main/resources/firebase/*.json` 등재
- ✅ 프론트가 RTDB에 직접 write하는 구조 없음 (모든 write는 Spring Boot REST 통과)

---

## 7. Remaining Work

이번 사이클에서 **의도적으로 미구현**한 항목 (사용자 지시: 안정화만 수행, 신규 기능 금지):

| 항목 | 상태 | 메모 |
|---|---|---|
| Comments 도메인 (`/v1/posts/{id}/comments` 4개) | ✅ **구현 완료 (2차 사이클)** | flat list + parentCommentId, depth ≤ 1, soft delete, 9개 테스트 통과 |
| Profile stats (`/v1/users/me/stats`, `/posts`, `/comments`, `/likes`) | ✅ **구현 완료 (4차 사이클)** | newest-first cursor + limit(20/50), `/user_likes` 양방향 갱신, `/user_stats` read model 지원 |
| `PATCH /v1/users/me/settings` | 미구현 | 후속 사이클 (이번 작업 범위 외) |
| Scrap toggle (`POST /v1/posts/{id}/scrap`) + `GET /v1/users/me/scraps` | ✅ **구현 완료 (5차 사이클)** | toggle (양방향 인덱스 + 두 카운터 ±1, 음수 floor 보호), 내 스크랩 목록 cursor pagination, boardName lookup |
| Course review report (`POST /v1/courses/{id}/reviews/{rid}/report`) | 미구현 | |
| `GET /v1/reports/me` | 미구현 | |
| Feed/Course/Comment/Scrap pagination 고도화 | ✅ **구현 완료 (6차 사이클)** | `RealtimeDatabaseClient.queryByChildDesc/Asc` 추가, `/v1/posts`, `/v1/courses`, `/v1/posts/{id}/comments`, `/v1/users/me/scraps`를 RTDB `orderByChild` 인덱스 쿼리로 교체. `/v1/users/me/posts`/`/comments`/`/likes` + `/v1/jury/me/cases`는 다음 사이클로 deferral |
| RTDB Security Rules 배포 | 미구현 | `database/03_SECURITY_RULES.md` 기준 룰을 Firebase 콘솔/CLI로 배포해야 프론트의 직접 write를 차단할 수 있음. 코드 외부 작업 |
| Auth `/sessions/{userId}/{sessionId}` RTDB 노드 정책 | 미구현 | 현재 stateless JWT만. 디바이스별 세션 추적이 필요해지면 후속 ADR |
| FCM 실제 발송 | 미구현 | `/fcm_tokens/...` 등록만 받고 실제 push 발송은 미구현 |
| Request id / audit log | 미구현 | 후속 사이클 |

---

## 8. 사용자 측 재현 절차

```powershell
# 1) JDK 21 PATH 설정 (이미 설치되어 있는 경우)
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.10'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 2) 테스트
.\gradlew.bat clean test

# 3) Spring Boot fat jar
.\gradlew.bat bootJar

# 4) 로컬 실행 (Firebase 자격증명 없이도 InMemory fallback으로 부팅됨)
.\gradlew.bat bootRun
# 다른 셸에서:
curl http://localhost:8080/v1/health
# 응답: {"code":"SUCCESS","message":"Success","result":{"status":"OK", ...}}
```

```bash
# macOS / Linux
export JAVA_HOME=/path/to/jdk-21
export PATH="$JAVA_HOME/bin:$PATH"
./gradlew clean test
./gradlew bootJar
```

테스트는 `application-test.yml`의 `unit.firebase.enabled=false`로 동작하며, `InMemoryRealtimeDatabaseClient`/`StubFirebaseTokenVerifier`/`StubFirebaseCustomTokenIssuer`가 활성화된다. 실제 Firebase 연결이 필요 없다.
