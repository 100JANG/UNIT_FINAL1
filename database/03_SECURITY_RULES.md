# Firebase Realtime Database Security Rules

> UNIT Backend Architecture Harness  
> 기준 스택: Spring Boot + Firebase Auth + Firebase Admin SDK + Firebase Realtime Database  
> 제외: PWA, Gemma, Cloud CDN, Let's Encrypt, Compute Engine  
> 핵심 원칙: 모든 Write는 Spring Boot REST를 통과하고, 실시간 Read는 Firebase Realtime Database 읽기 구독으로 처리한다.


## 0. 본 문서의 위치

본 문서는 RTDB Security Rules의 **사양**을 기술한다. 실제 배포본은 프로젝트 루트의 [`database.rules.json`](../database.rules.json)이며, 본 문서와 1:1로 일치하도록 동기화한다.
배포 절차는 [04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md](04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md)를 따른다.

## 1. 원칙

1. 모든 write는 Spring Boot REST API를 통해서만 수행한다.
2. 프론트는 Firebase RTDB에 직접 write하지 않는다.
3. Firebase Admin SDK는 Security Rules를 우회하므로 백엔드 write는 영향을 받지 않는다.
4. 프론트는 Firebase Custom Token으로 로그인한 뒤 read subscription만 수행한다.
5. 인증되지 않은 사용자는 모든 데이터 read/write 금지 (`auth == null` → `false`).
6. Reserved 기능 경로(`/ai`, `/ocr`, `/gemma`, `/recap`, `/moderation`, `/student_registry`, `/pwa`, `/service_worker`)는 만들지 않는다 — 이 경로는 default-deny에 의해 자동으로 차단된다.

## 2. 기본 정책 (default-deny)

```json
{ ".read": false, ".write": false }
```

명시적으로 허용된 경로 외에는 root의 default-deny가 상속되어 모두 차단된다. Reserved 경로는 룰 자체를 만들지 않으므로 자동 deny된다.

## 3. 경로별 read/write 정책

| 경로 | read | write | 비고 |
|---|---|---|---|
| `/users/{userId}` | 본인만 (`auth.uid == $userId`) | false | 타인 프로필 read 금지. studentNumber 마스킹은 백엔드 응답 단계의 추가 보호. |
| `/sessions/{userId}` | 본인만 | false | 세션 메타. write는 백엔드 Admin SDK만. |
| `/fcm_tokens/{userId}` | 본인만 | false | FCM 토큰 등록은 REST `/v1/notifications/fcm-token` 경유. |
| `/schools` | 인증 사용자 | false | 학교/학과/보드 메타. write는 운영 시드만 Admin SDK. |
| `/departments` | 인증 사용자 | false | 동일. |
| `/boards` | 인증 사용자 | false | 동일. |
| `/posts/{postId}` | 인증 사용자 | false | 본문 read 허용. soft-delete 글 마스킹은 백엔드 응답 단계 책임. |
| `/post_stats/{postId}` | 인증 사용자 | false | likes/comments/scraps 카운터. write는 transaction increment via Admin SDK. |
| `/post_likes/{postId}` | 인증 사용자 | false | "이 글에 누가 좋아요했나" read. write 금지. |
| `/post_scraps/{postId}` | 인증 사용자 | false | "이 글을 누가 스크랩했나" read. write 금지. |
| `/post_feeds/all` | 인증 사용자 | false | 글로벌 피드 인덱스. `.indexOn: createdAt, hotScore, commentCount`. |
| `/post_feeds/schools/{schoolId}` | 인증 사용자 | false | 학교 피드. **TODO**: custom token claim에 schoolId 도입 시 `auth.token.schoolId == $schoolId`로 강화. 현재는 `auth != null`. |
| `/post_feeds/departments/{departmentId}` | 인증 사용자 | false | 학과 피드. 동일 TODO. |
| `/comments/{postId}` | 인증 사용자 | false | 댓글 list. `.indexOn: createdAt`. |
| `/comment_stats/{commentId}` | 인증 사용자 | false | 댓글 좋아요 카운터. |
| `/comment_likes/{commentId}` | 인증 사용자 | false | "이 댓글에 누가 좋아요했나" read. |
| `/courses/{courseId}` | 인증 사용자 | false | 강의 본체. |
| `/courses_by_school/{schoolId}` | 인증 사용자 | false | 학교별 강의 검색 인덱스. `.indexOn: courseName, professor, semester`. |
| `/course_reviews/{courseId}` | 인증 사용자 | false | 강의평. |
| `/course_stats/{courseId}` | 인증 사용자 | false | 강의평 통계. |
| `/review_locks/{userId}` | 본인만 | false | "내가 어떤 강의에 평을 남겼나"는 백엔드 정책(REVIEW_QUOTA_REQUIRED) 검증용. 타 사용자 read 금지. |
| `/reports/{reportId}` | **차단** | false | 신고는 백엔드만 read/write. 신고자/대상자 노출 차단. |
| `/reports_by_post/{postId}` | **차단** | false | 동일. |
| `/jury_cases/{caseId}` | 인증 사용자 | false | 수동 생성 case 조회 허용. **TODO**: summonedJurors 기반 read 제한은 인덱스 설계 후속 작업. |
| `/jury_votes/{caseId}` | 인증 사용자 | false | 투표 read는 결과 반영용. write 금지. |
| `/jury_case_stats/{caseId}` | 인증 사용자 | false | 투표 진척 카운터. |
| `/notifications/{userId}` | 본인만 | false | 알림 list. `.indexOn: createdAt, isRead`. write는 REST 경유. |
| `/user_posts/{userId}` | 본인만 | false | 내 작성 인덱스. `.indexOn: createdAt`. |
| `/user_comments/{userId}` | 본인만 | false | 내 댓글 인덱스. `.indexOn: createdAt`. |
| `/user_likes/{userId}` | 본인만 | false | 내 좋아요 인덱스. `.indexOn: likedAt`. |
| `/user_scraps/{userId}` | 본인만 | false | 내 스크랩 인덱스. `.indexOn: scrappedAt`. |
| `/user_stats/{userId}` | 본인만 | false | 내 활동 통계. |

## 4. 금지 경로

다음 경로는 룰 자체를 만들지 않는다. root의 default-deny에 의해 자동으로 read/write가 차단된다.

```text
/ai
/ocr
/gemma
/recap
/moderation
/moderation_results
/moderation_rules
/student_registry
/pwa
/service_worker
/ai_refine
/ai_judgments
/ocr_results
/recaps
/recap_jobs
```

`database.rules.json`에 위 경로의 룰이 추가되지 않도록 review 시점에 `SecurityRulesContractTest.bannedPathsAreNotPresent`로 강제한다.

## 5. `.indexOn` 요구사항 (코드 query field와 1:1 일치)

코드에서 사용하는 `RealtimeDatabaseClient.queryByChildAsc/Desc` 호출의 `orderByChild` 인자와 `database.rules.json`의 `.indexOn` 항목은 **1글자도 다르면 안 된다**. 다음 표가 단일 출처다.

| 코드 호출 위치 | path | orderByChild | `.indexOn` 등재 위치 |
|---|---|---|---|
| `PostFirebaseRepository.queryFeedAllDesc` | `/post_feeds/all` | `createdAt` | `post_feeds/all` |
| `PostFirebaseRepository.queryFeedSchoolDesc` | `/post_feeds/schools/{schoolId}` | `createdAt` | `post_feeds/schools/$schoolId` |
| `PostFirebaseRepository.queryFeedDepartmentDesc` | `/post_feeds/departments/{departmentId}` | `createdAt` | `post_feeds/departments/$departmentId` |
| `CommentFirebaseRepository.queryByPostAsc` | `/comments/{postId}` | `createdAt` | `comments/$postId` |
| `CourseFirebaseRepository.queryBySchoolAsc` | `/courses_by_school/{schoolId}` | `courseName` | `courses_by_school/$schoolId` |
| `UserActivityRepository.queryUserPostsDesc` | `/user_posts/{userId}` | `createdAt` | `user_posts/$userId` |
| `UserActivityRepository.queryUserCommentsDesc` | `/user_comments/{userId}` | `createdAt` | `user_comments/$userId` |
| `UserActivityRepository.queryUserLikesDesc` | `/user_likes/{userId}` | `likedAt` | `user_likes/$userId` |
| `UserActivityRepository.queryUserScrapsDesc` | `/user_scraps/{userId}` | `scrappedAt` | `user_scraps/$userId` |

추가 등재:
- `post_feeds/*`에는 `hotScore`, `commentCount`를 함께 등재 (향후 `sort=hot|comments` 활성화 대비)
- `courses_by_school/$schoolId`에는 `professor`, `semester`를 함께 등재 (검색 강화 대비)
- `notifications/$userId`에는 `isRead`를 함께 등재 (unread 필터 쿼리 대비)

위 정합성은 `SecurityRulesContractTest`로 강제된다 — 한 항목이라도 변경되면 테스트가 깨진다.

## 6. TODO

### custom token claim 도입 시 강화

현재 `post_feeds/schools/{schoolId}`와 `post_feeds/departments/{departmentId}`는 `auth != null`만 검사한다. 즉, 다른 학교/학과의 피드도 인증된 사용자라면 path를 알면 read할 수 있다.

백엔드 `PostService.feed`가 viewer의 `/users/{userId}/schoolId`를 lookup해 path를 결정하므로 REST 경유 호출에서는 안전하지만, 프론트가 RTDB 구독을 직접 시도할 경우 path 위조 가능성이 있다.

향후 `FirebaseCustomTokenIssuer.issue(userId)` 시 사용자 schoolId/departmentId를 custom claim으로 굽고, rules를 다음과 같이 강화한다:

```text
"post_feeds/schools/$schoolId": {
  ".read": "auth != null && auth.token.schoolId == $schoolId"
}
"post_feeds/departments/$departmentId": {
  ".read": "auth != null && auth.token.departmentId == $departmentId"
}
```

해당 강화는 별도 ADR 후 진행한다.

### Jury read 제한

현재 `jury_cases/{caseId}`, `jury_votes/{caseId}`는 인증 사용자 read 허용이다. summonedJurors 기반 제한이 필요해지면 `auth.uid` IN summonedJurors 검사를 추가한다. RTDB rules는 array contains 직접 지원이 없으므로 인덱스 노드 `/jury_cases_summoned/{userId}/{caseId}` 추가가 필요할 수 있음 — 후속 사이클.

## 7. 배포

본 사이클에서는 **실제 배포를 수행하지 않는다**. 운영 첫 배포 시 [04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md](04_SECURITY_RULES_DEPLOYMENT_CHECKLIST.md)의 체크리스트와 명령을 사용한다.

요약:

```bash
firebase login
firebase use <project-id>          # project id는 환경 변수/별칭으로 주입
firebase database:instances:list   # 대상 RTDB 인스턴스 확인
firebase deploy --only database    # database.rules.json + firebase.json 기반
```

`firebase.json`은 프로젝트 루트에 있으며 `database.rules.json`을 가리킨다. project id는 하드코딩하지 않는다.
