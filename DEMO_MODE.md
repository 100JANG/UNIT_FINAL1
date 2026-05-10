# DEMO MODE — 백엔드 시연 가이드

> 시연 안정성을 위해 추가한 격리된 시연 모드. **운영 환경에서는 절대 활성화하지 말 것.**

## 목적

- 회원가입 / 학생인증 / Firebase RTDB 실 연동을 거치지 않고 앱 전체를 시연한다.
- in-memory 인메모리 트리에 더미 데이터를 심어 Feed / PostDetail / Comments / Like-Scrap / Courses / Notifications 가 곧바로 동작하도록 한다.
- 기존 운영 코드는 그대로 유지된다 — demo 패키지의 빈들은 `app.demo.enabled=true` 일 때만 등록된다.

## 활성화 방법

```bash
# 방법 1 — profile (권장)
SPRING_PROFILES_ACTIVE=demo ./gradlew bootRun

# 방법 2 — 임시 토글
./gradlew bootRun --args='--app.demo.enabled=true'
```

`application-demo.yml` 가 함께 적용되어 다음을 강제한다:
- `unit.firebase.enabled=false` → InMemoryRealtimeDatabaseClient 활성화
- `unit.jwt.secret`/`issuer`/`session-ttl-seconds` 더미 값 (운영 secret 절대 두지 말 것)
- `app.demo.enabled=true`

## /v1/dev/demo-login

### Request

```http
POST /v1/dev/demo-login
```

본문 없음. 인증 헤더 불필요. (AuthenticationFilter PERMIT_PREFIXES 에 `/v1/dev/` 등재됨)

### Response (성공)

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {
    "sessionToken": "<JWT>",
    "expiresAt": "2026-05-10T...",
    "user": {
      "userId": "demo_user_001",
      "schoolId": "test",
      "schoolName": "테스트대학교",
      "departmentId": "test_sw",
      "departmentName": "소프트웨어학과",
      "studentVerificationStatus": "RESERVED"
    }
  }
}
```

### 차단 (운영)

`app.demo.enabled` 가 false 또는 미지정이면 `DemoAuthController` 빈 자체가 등록되지 않는다.
요청 시 Spring 디스패처가 핸들러를 찾지 못하므로 **404** 가 응답된다.

`UnitBackendApplicationTests.demoController_isNotRegistered_whenDemoModeDisabled` 가 이를 검증한다.

## In-Memory DB

운영 — `unit.firebase.enabled=true` → `FirebaseAdminRealtimeDatabaseClient` (실 RTDB)
시연 — `unit.firebase.enabled=false` → `InMemoryRealtimeDatabaseClient` (인메모리)

InMemoryRealtimeDatabaseClient 는 본 cycle 이전부터 존재하던 fallback 구현체이며 본 작업으로 코드 변경 0건. demo 빈들은 `RealtimeDatabaseClient` 인터페이스로만 데이터를 쓰므로 양쪽 환경에서 동일하게 동작한다 (단, 운영에서 demo 활성은 정책 위반).

## Demo Seed Data

`DemoDataSeeder` (ApplicationRunner 빈) 가 부팅 직후 실행:

- 학교: `/schools/test` (테스트대학교)
- 학과: `/departments/test_sw` (소프트웨어학과)
- 사용자: `/users/demo_user_001` — `RESERVED`, `ACTIVE`, `2024****` masked 학번
- 게시글: 12건
  - 자유 7건 (`/post_feeds/all` + `/post_feeds/schools/test`)
  - 학과 5건 (`/post_feeds/departments/test_sw` 추가)
  - 본문/preview/tags 모두 `[시연]` prefix + "시연용 더미" 명시
  - `/post_stats/{postId}` 에 likes/comments/scraps 더미 분포
- 댓글: 처음 4개 게시글에 2~4개씩 (총 11+개)
- 알림: `/notifications/demo_user_001/` 4건 (POST_COMMENT / POST_LIKE / JURY_SUMMON / SYSTEM)
- 강의: 6건 (데이터구조 / 알고리즘 / 운영체제 / 컴퓨터구조 / 데이터베이스 / 소프트웨어공학)
  - `/courses_by_school/test/` 인덱스
  - `/course_stats/{courseId}` recommend/notRecommend/skip/total/recommendRate
  - `/review_locks/demo_user_001/{courseId}` — 미작성자 422 차단을 우회 (시연 흐름 끊김 방지)

학생인증을 통과한 척 표시하는 데이터 0건 — `studentVerificationStatus` 는 항상 `RESERVED`.

## 보존 규칙 (DEMO_MODE_PRESERVE / DEMO_MODE_START·END)

본 작업에서 **삭제한 운영 코드 0건**. 변경점은 다음과 같이 표시:

| 파일 | 변경 |
|---|---|
| `common/security/AuthenticationFilter.java` | `PERMIT_PREFIXES` 에 `/v1/dev/` 추가 (DEMO_MODE_START·END 주석으로 감쌈). 운영에선 매핑된 컨트롤러가 없어 404. |

신규 (모두 demo 패키지):
- `demo/DemoProperties.java` — `@ConfigurationProperties("app.demo")`
- `demo/DemoAuthController.java` — `@ConditionalOnProperty("app.demo.enabled=true")`
- `demo/DemoDataSeeder.java` — 동일 게이트 + `@EnableConfigurationProperties(DemoProperties.class)`
- `application-demo.yml`

## 테스트

| 테스트 | 검증 |
|---|---|
| `DemoDataSeederTest` (6) | school/department/user/feed/stats/comments/notifications/courses 모두 시드됨 |
| `DemoAuthControllerTest` (3) | sessionToken 발급 / userId/schoolId/RESERVED / seeder 미실행 시 IllegalStateException |
| `DemoModeEnabledContextTest` (2) | `app.demo.enabled=true` 일 때 컨트롤러/properties 빈 등록 + demoLogin() 정상 |
| `UnitBackendApplicationTests.demoController_isNotRegistered_whenDemoModeDisabled` | 기본 프로파일에서 컨트롤러 빈 부재 |

```
./gradlew clean test bootJar  # 모두 통과 (BUILD SUCCESSFUL)
```

## 운영 모드 차단 — 4중 안전장치

1. `application-demo.yml` 로만 `app.demo.enabled=true` 이 등장. `application.yml`/`application-local.yml`/`application-test.yml` 에는 설정 0건.
2. `DemoAuthController` / `DemoDataSeeder` 모두 `@ConditionalOnProperty(prefix="app.demo", name="enabled", havingValue="true")` — false 또는 미지정 시 빈 미등록.
3. `AuthenticationFilter` 가 `/v1/dev/` 를 permit 하지만, 컨트롤러가 없으면 Spring 이 404 로 응답.
4. `DemoModeEnabledContextTest` 와 `UnitBackendApplicationTests` 가 활성/비활성 양 쪽을 모두 검증 — 회귀 시 CI 가 즉시 실패.

## 학생인증/회원가입 우회 정책

- 백엔드 코드는 회원가입/학생인증을 "통과시키지" 않는다.
- 그 대신 데모 모드는 **회원가입/학생인증 흐름 자체를 시연 동안 건너뛴다**.
- `studentVerificationStatus` 는 RESERVED — `enrollmentStatus` 도 그대로.
- OCR / 학교 이메일 인증 / AI / Recap / Gemma 코드 0건.

## 운영 배포 시 점검

- [ ] `SPRING_PROFILES_ACTIVE` 에 `demo` 가 포함되지 않았는가?
- [ ] 환경변수에 `APP_DEMO_ENABLED=true` 가 설정되지 않았는가?
- [ ] `application-prod.yml` (있다면) 에 `app.demo.enabled=true` 가 들어가지 않았는가?
- [ ] CI 의 `UnitBackendApplicationTests.demoController_isNotRegistered_whenDemoModeDisabled` 가 통과했는가?
