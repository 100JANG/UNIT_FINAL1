# UNIT Backend — Implementation Plan

문서팩(`00_INDEX.md` ~ `claude/01_CLAUDE_CODE_BACKEND_RULES.md`, `testing/`, `harness/`, `domain/`, `api/`, `database/`, `decisions/`)을 모두 검토한 뒤 작성한 MVP 구현 계획서이다. 이 문서는 코드를 생성하기 전에 구현 대상과 Reserved 대상을 명확히 분리한다.

---

## 1. 기술 스택 (확정)

| 영역 | 결정 |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.x |
| Build | Gradle (Kotlin 미사용, Groovy DSL) |
| Auth | Firebase Authentication + Spring Security |
| Session | 자체 JWT sessionToken (`JwtTokenProvider`) |
| Realtime DB | Firebase Realtime Database |
| Firebase 접근 | Firebase Admin SDK (Adapter 계층 내부에서만) |
| Validation | Jakarta Bean Validation |
| Test | JUnit 5, AssertJ, Mockito, SpringBootTest |
| 베이스 패키지 | `kr.unit.backend` (문서팩 `backend/02_PACKAGE_STRUCTURE.md` 기준) |

---

## 2. 구현 대상 vs Reserved 대상

### 구현 대상 (MVP)

| 영역 | 구현 범위 |
|---|---|
| Global | ApiResponse, CursorPageResponse, ErrorCode, BusinessException, GlobalExceptionHandler |
| Security | SecurityConfig, AuthUser, JwtTokenProvider, FirebaseTokenVerifier, AuthenticationFilter |
| Firebase | FirebaseConfig, RealtimeDatabaseClient (interface + Admin SDK impl), FirebasePath |
| Auth | `POST /v1/auth/session`, `POST /v1/auth/refresh`, `POST /v1/auth/logout` |
| User | `GET /v1/users/me`, `GET /v1/users/me/stats`, `PATCH /v1/users/me/settings` |
| Post | `GET /v1/posts`, `POST /v1/posts`, `GET /v1/posts/{id}`, `PATCH/DELETE /v1/posts/{id}`, `POST /v1/posts/{id}/like`, `POST /v1/posts/{id}/scrap`, `POST /v1/posts/{id}/report` |
| Course | `GET /v1/courses`, `GET /v1/courses/{id}`, `POST /v1/courses/{id}/reviews` (REVIEW_QUOTA_REQUIRED 정책) |
| Notification | `GET /v1/notifications`, `PATCH /v1/notifications/{id}`, `DELETE /v1/notifications/{id}`, `POST /v1/notifications/mark-all-read`, `POST /v1/notifications/fcm-token` |
| Jury | `GET /v1/jury/cases/{id}` (수동 생성된 case 조회), `POST /v1/jury/cases/{id}/vote`, `GET /v1/jury/me/cases` — **자동 생성 없음** |
| Health | `GET /v1/health` |

### Reserved 대상 (구현 금지, 문서/계약만 보존)

| 기능 | 위치 | 응답 |
|---|---|---|
| Student Card OCR | `POST /v1/auth/student-card/verify` | `501 FEATURE_NOT_IMPLEMENTED` |
| AI Writing Refine | `POST /v1/ai/refine` | `501 FEATURE_NOT_IMPLEMENTED` |
| AI Recap | `GET /v1/recap/{semester}`, `GET /v1/recap/schools/{schoolId}/{semester}` | `501 FEATURE_NOT_IMPLEMENTED` |
| AI Report Judgment | endpoint 없음 (신고는 접수까지만) | — |

### 만들지 않는 항목 (강제)

- 패키지: `studentverification`, `ai`, `moderation`, `recap`, `ocr`, `gemma`
- 클래스: `RuleModerationService`, `StudentRegistryVerifier`, `RecapGenerator`, `Util.java`, `Helper.java`, `Manager.java`, `CommonService.java`, `TempService.java`
- DB 노드: `/student_registry`, `/ai_refine`, `/ai_judgments`, `/moderation_results`, `/recaps`, `/recap_jobs`, `/ocr_results`
- 에러 코드 발생: `OCR_FAILED`, `INVALID_STUDENT_CARD`, `TOXIC_CONTENT_DETECTED`, `POST_BLOCKED_FROM_FREE_BOARD`, `AI_UNAVAILABLE`
- 신고 → 자동 jury 생성 흐름
- 학교 이메일 검증으로 학생 인증 대체
- 금칙어 필터로 AI 다듬기 대체
- 통계 집계로 AI Recap 대체

---

## 3. 패키지 구조

```text
src/main/java/kr/unit/backend
  UnitBackendApplication.java

  common
    api/        ApiResponse, CursorPageResponse, Cursor
    error/      ErrorCode, BusinessException, GlobalExceptionHandler
    security/   AuthUser, AuthenticatedUser, JwtTokenProvider, FirebaseTokenVerifier,
                SecurityConfig, AuthenticationFilter, CurrentUserArgumentResolver
    config/     CorsConfig, JacksonConfig, WebMvcConfig
    time/       ClockProvider

  firebase
    FirebaseConfig
    RealtimeDatabaseClient (interface)
    FirebaseAdminRealtimeDatabaseClient (impl, @Profile("!test"))
    FirebasePath

  auth/{controller,service,dto,domain}
  users/{controller,service,repository,dto,domain}
  posts/{controller,service,repository,dto,domain,policy}
  courses/{controller,service,repository,dto,domain,policy}
  notifications/{controller,service,repository,dto,domain}
  jury/{controller,service,repository,dto,domain}
  reserved/{controller,dto}
  health/HealthController

src/test/java/kr/unit/backend
  support/
    FakeRealtimeDatabaseClient
    TestAuthUsers
    FixtureFactory
    FixedClockConfig
  common/
  auth/
  posts/
  courses/
  notifications/
  jury/
  reserved/
  firebase/
```

---

## 4. 레이어 의존 방향 (강제)

```text
Controller → Service → Policy/Domain → Repository → FirebaseAdapter
```

- Controller: HTTP 매핑, DTO 검증 트리거, ApiResponse 반환
- Service: 유스케이스 흐름, Policy 호출, Repository 호출
- Policy: 도메인 규칙 검증 (예: PostWritePolicy)
- Repository: FirebasePath + RealtimeDatabaseClient 조합
- FirebaseAdapter: Admin SDK 직접 호출 (여기에만 허용)

금지:
- Controller → RealtimeDatabaseClient
- Service → FirebaseDatabase / DatabaseReference
- Repository → 권한 판단
- 어디서든 `"/posts/" + id` 같은 path 문자열 직접 조립 (FirebasePath만 허용)

---

## 5. Firebase Realtime Database 경로 (확정)

문서팩 `database/02_RTDATABASE_PATHS_AND_INDEXES.md` 기준.

```text
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
/comments/{postId}/{commentId}
/comment_stats/{commentId}
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

**만들지 않는 경로**: `/student_registry`, `/ai_refine`, `/ai_judgments`, `/moderation_results`, `/recaps`, `/recap_jobs`, `/ocr_results`

---

## 6. 응답/에러 계약

### 성공
```json
{ "code": "SUCCESS", "message": "Success", "result": { ... } }
```

### 페이지
```json
{
  "code": "SUCCESS", "message": "Success",
  "result": {
    "items": [],
    "pagination": { "cursor": "...", "hasMore": true, "total": 0 }
  }
}
```

### Reserved
```json
{
  "code": "FEATURE_NOT_IMPLEMENTED",
  "message": "아직 구현되지 않은 기능입니다",
  "result": { "feature": "STUDENT_CARD_OCR", "status": "RESERVED" }
}
```

### 에러 코드 (구현)
`INVALID_REQUEST`, `VALIDATION_FAILED`, `AUTH_REQUIRED`, `AUTH_INVALID`, `AUTH_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`, `UNSUPPORTED_MEDIA_TYPE`, `BUSINESS_RULE_VIOLATION`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `FEATURE_NOT_IMPLEMENTED`, `REVIEW_QUOTA_REQUIRED`, `JURY_NOT_AUTHORIZED`, `JURY_ALREADY_VOTED`, `JURY_WINDOW_CLOSED`, `REPORT_DUPLICATE`

### 에러 코드 (만들지 않음 / Reserved)
`OCR_FAILED`, `INVALID_STUDENT_CARD`, `TOXIC_CONTENT_DETECTED`, `POST_BLOCKED_FROM_FREE_BOARD`, `AI_UNAVAILABLE`

---

## 7. 테스트 계획

| 대상 | 테스트 |
|---|---|
| 공통 | `ApiResponseTest`, `ErrorCodeTest`, `GlobalExceptionHandlerTest` |
| Firebase | `FirebasePathTest` (모든 경로 빌더), `FakeRealtimeDatabaseClientTest` |
| Auth | `AuthSessionServiceTest` (Firebase ID Token 검증/세션 발급) |
| Posts | `PostCreateServiceTest`, `PostLikeServiceTest`, `PostReportServiceTest` (중복 방지) |
| Courses | `CourseDetailServiceTest` (REVIEW_QUOTA_REQUIRED), `CourseReviewServiceTest` |
| Notifications | `NotificationServiceTest` |
| Reserved | `ReservedFeatureContractTest` (501 FEATURE_NOT_IMPLEMENTED 보장) |

테스트는 실제 Firebase 연결을 만들지 않고 `FakeRealtimeDatabaseClient` Stub을 사용한다.

---

## 8. 실행 명령

```text
.\gradlew.bat clean test
.\gradlew.bat bootJar
```

> 현재 호스트에 `java`/`gradle`이 설치되어 있지 않다. 본 작업에서는 Gradle Wrapper를 동봉하되, 빌드 검증은 Java 21 설치 후 사용자가 실행한다. 실행 결과는 `IMPLEMENTATION_REPORT.md`에 기록한다.

---

## 9. 보안/비밀값 원칙

- `firebase-credentials.json`은 저장소에 절대 커밋하지 않는다.
- `application.yml`은 환경 변수만 참조한다 (`${FIREBASE_PROJECT_ID}` 등).
- `.env`, `serviceAccountKey.json`을 만들지 않는다.
- 운영 비밀값은 호스트 환경변수로 주입한다.

---

## 10. 작업 순서

1. `IMPLEMENTATION_PLAN.md` 작성 ← 본 문서
2. Gradle 프로젝트 초기화 (`build.gradle`, `settings.gradle`, `application.yml`, Gradle Wrapper)
3. Global 레이어 (ApiResponse, ErrorCode, GlobalExceptionHandler 등)
4. Security 레이어 (JwtTokenProvider, FirebaseTokenVerifier, AuthenticationFilter, SecurityConfig)
5. Firebase Adapter 레이어 (RealtimeDatabaseClient interface + Admin impl, FirebasePath)
6. Auth → User → Post → Course → Notification → Jury → Reserved 도메인 skeleton
7. Test 하네스(FakeRealtimeDatabaseClient, FixtureFactory) + 핵심 테스트
8. (옵션) 빌드 검증 — Java 미설치 시 사용자에게 안내
9. `IMPLEMENTATION_REPORT.md` 작성
