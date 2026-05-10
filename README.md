[README.md](https://github.com/user-attachments/files/27560868/README.md)
# UNIT

UNIT은 학교와 학과를 기준으로 게시글, 댓글, 강의평, 알림, 활동 기록을 한 곳에서 사용할 수 있도록 만든 모바일 커뮤니티 서비스입니다.

현재 목표는 기능을 무리하게 많이 붙이는 것이 아니라, 시연에서 핵심 흐름이 안정적으로 동작하도록 만드는 것입니다. 백엔드는 Spring Boot로 API를 제공하고, 프론트엔드는 Expo React Native 앱으로 구성되어 있습니다.

---

## 프로젝트 구조

권장 로컬 구조는 다음과 같습니다.

```text
UNIT_all/
  UNIT_BACKEND/
  UNIT_FRONTEND/
    unit-mobile/
    web-source/
```

`UNIT_BACKEND`와 `UNIT_FRONTEND/unit-mobile`은 각각 독립된 Git 저장소입니다.  
`UNIT_all`은 두 프로젝트를 함께 열어두기 위한 작업 폴더입니다.

`UNIT_FRONTEND/web-source`는 디자인 참고용 정적 소스이며, 실제 앱 빌드 대상은 `UNIT_FRONTEND/unit-mobile`입니다.

---

## 기술 스택

### Backend

```text
Java 21
Spring Boot 3.3.x
Gradle
Spring Web
Spring Security
Spring Validation
Firebase Admin SDK
Firebase Realtime Database 구조
JUnit 5
Mockito
AssertJ
```

### Frontend

```text
Expo SDK 52
React Native 0.76
TypeScript strict
Expo SecureStore
React Navigation
Custom API Client
```

### Database

기본 설계는 Firebase Realtime Database 기준입니다.

시연 환경에서는 Firebase 설정과 학생 인증 과정이 앱 흐름을 방해할 수 있으므로, Demo Mode에서는 인메모리 데이터 저장 방식을 사용할 수 있습니다.

```text
기본 구조:
Spring Boot → Firebase Realtime Database

시연 구조:
Spring Boot → InMemory Realtime Database Client
```

---

## 현재 구현 상태

### Backend

백엔드는 프론트 통합이 가능한 수준까지 구현되어 있습니다.

```text
공통 응답 포맷
공통 ErrorCode
sessionToken 기반 인증 구조
Reserved 기능 응답
게시글
댓글
게시글 좋아요
게시글 스크랩
강의 목록/상세
강의평 작성 기본 구조
알림
프로필
내 활동 목록
학교/학과별 피드
RTDB 인덱스 기반 pagination
RTDB Security Rules preflight
Frontend API Contract 문서
```

검증 명령:

```powershell
.\gradlew.bat clean test bootJar
```

최근 기준으로 백엔드 테스트와 bootJar 빌드는 통과한 상태입니다.

### Frontend

프론트는 Expo React Native 앱입니다.

현재 연결된 기능은 다음과 같습니다.

```text
Feed API
DevAuthPanel
SecureStore 기반 sessionToken 저장
PostDetail route postId string 정리
Post Detail API
Comments GET API
Post Like / Scrap API
```

검증 명령:

```powershell
npm run typecheck
```

최근 기준으로 TypeScript 검증은 통과한 상태입니다.

---

## 실행 방법

### Backend 실행

```powershell
cd UNIT_all\UNIT_BACKEND
.\gradlew.bat clean test bootJar
.\gradlew.bat bootRun
```

기본 서버 주소:

```text
http://localhost:8080
```

API Base URL:

```text
http://localhost:8080/v1
```

### Frontend 실행

```powershell
cd UNIT_all\UNIT_FRONTEND\unit-mobile
npm install
npm run typecheck
npx expo start
```

---

## Frontend 환경변수

Expo 앱은 `EXPO_PUBLIC_` prefix를 사용합니다.

`.env.example` 예시:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
EXPO_PUBLIC_ENABLE_RTDATABASE=false
EXPO_PUBLIC_APP_MODE=demo

EXPO_PUBLIC_FIREBASE_API_KEY=replace-me
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=replace-me
EXPO_PUBLIC_FIREBASE_DATABASE_URL=replace-me
EXPO_PUBLIC_FIREBASE_PROJECT_ID=replace-me
```

주의:

```text
Expo public env는 클라이언트에 노출됩니다.
service account, private key, 실제 secret은 절대 넣지 않습니다.
```

---

## API 응답 규칙

모든 REST API는 동일한 응답 구조를 사용합니다.

### 성공

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "result": {}
}
```

### 실패

```json
{
  "code": "ERROR_CODE",
  "message": "에러 메시지",
  "result": null
}
```

프론트에서는 `response.data`를 직접 사용하지 않고, API client에서 `result`만 꺼내 사용합니다.

---

## Pagination 규칙

목록 API는 모두 같은 방식을 사용합니다.

```text
cursor
limit
기본 limit = 20
최대 limit = 50
cursor는 프론트에서 해석하지 않는 opaque string
size 파라미터 사용 금지
```

예시:

```http
GET /v1/posts?scope=all&sort=latest&cursor=&limit=20
GET /v1/posts/{postId}/comments?cursor=&limit=20
GET /v1/notifications?cursor=&limit=20
```

---

## 주요 API

### Posts

```http
GET /v1/posts
POST /v1/posts
GET /v1/posts/{postId}
POST /v1/posts/{postId}/like
POST /v1/posts/{postId}/scrap
POST /v1/posts/{postId}/report
```

### Comments

```http
GET /v1/posts/{postId}/comments
POST /v1/posts/{postId}/comments
POST /v1/posts/{postId}/comments/{commentId}/like
DELETE /v1/posts/{postId}/comments/{commentId}
```

### Courses

```http
GET /v1/courses
GET /v1/courses/{courseId}
POST /v1/courses/{courseId}/reviews
```

### Notifications

```http
GET /v1/notifications
PATCH /v1/notifications/{notificationId}
POST /v1/notifications/mark-all-read
```

### Users

```http
GET /v1/users/me
GET /v1/users/me/stats
GET /v1/users/me/posts
GET /v1/users/me/comments
GET /v1/users/me/likes
GET /v1/users/me/scraps
```

### Demo Mode

```http
POST /v1/dev/demo-login
```

Demo Mode API는 시연용입니다. 운영 환경에서는 비활성화되어야 합니다.

---

## Demo Mode

시연에서는 실제 학생 인증, Firebase 설정, 회원가입 플로우가 앱 흐름을 방해할 수 있습니다.  
그래서 Demo Mode에서는 테스트 학교를 선택하면 시연용 계정으로 바로 앱에 들어갈 수 있도록 구성합니다.

권장 흐름:

```text
앱 실행
→ 테스트 학교로 시연 시작
→ POST /v1/dev/demo-login
→ sessionToken 저장
→ Feed 화면 이동
```

Demo Mode 원칙:

```text
기존 운영 코드 삭제 금지
Firebase 구조 삭제 금지
Demo Mode에서만 인메모리 DB 사용
테스트 학교는 production에서 숨김
학생 인증 완료처럼 표현하지 않음
studentVerificationStatus는 RESERVED 유지
```

화면 문구는 다음처럼 사용합니다.

```text
테스트 학교로 시연 시작
시연용 Demo Mode입니다
```

사용하지 말아야 할 문구:

```text
학생 인증 완료
실제 인증 성공
학생증 인증 완료
```

---

## Reserved 기능

아래 기능은 현재 구현하지 않습니다.

```text
학생증 OCR 인증
학교 이메일 인증
AI 글쓰기 다듬기
AI 신고 판정
AI Recap
Gemma
PWA
Offline-first
```

Reserved 기능 응답은 다음과 같습니다.

```json
{
  "code": "FEATURE_RESERVED",
  "message": "현재 버전에서 구현하지 않는 예약 기능입니다.",
  "result": null
}
```

Reserved 기능은 다른 방식으로 대체 구현하지 않습니다.

---

## 개발 원칙

기능을 한 번에 모두 붙이는 방식이 아니라, 작은 단위로 연결하고 검증하는 방식을 사용합니다.

각 작업 단위는 다음 순서를 따릅니다.

```text
1. 현재 코드 상태 확인
2. 연결할 API contract 확인
3. 해당 기능만 연결
4. typecheck 또는 test 실행
5. 문서 업데이트
6. 커밋
7. 태그 생성
8. 다음 작업 진행
```

---

## 금지 사항

아래 작업은 프로젝트 전반에서 금지합니다.

```text
백엔드 API contract 임의 변경
프론트에서 Firebase RTDB 직접 write
Firebase set/update/push/remove 직접 사용
response.data 직접 사용
size pagination 파라미터 사용
/post_comments 경로 사용
postId/commentId/courseId 숫자 변환
any 타입 사용
토큰 console.log
실제 secret을 .env 또는 문서에 저장
Reserved 기능 대체 구현
```

백엔드 ID는 opaque string으로 취급합니다.

금지 예시:

```ts
Number(postId)
parseInt(postId)
Number(commentId)
parseInt(commentId)
Number(courseId)
parseInt(courseId)
```

---

## RTDB 사용 원칙

프론트에서는 RTDB를 읽기 구독 용도로만 사용할 수 있습니다.

허용:

```text
onValue
onChildAdded
off
read subscription
```

금지:

```text
set
update
push
remove
client write helper
```

모든 write는 Spring Boot REST API를 통해서만 처리합니다.

---

## 현재 통합 진행 상태

| 영역 | 상태 |
|---|---|
| Feed API | 완료 |
| Post Detail API | 완료 |
| Comments GET | 완료 |
| Post Like | 완료 |
| Post Scrap | 완료 |
| Comment Write | 예정 |
| Comment Like/Delete | 예정 |
| Courses Read | 예정 |
| Course Review Write | 예정 |
| Profile/Activity | 예정 |
| Notifications | 예정 |
| RTDB Read Subscription | 예정 |
| Demo Mode | 예정 |
| Staging 검증 | 예정 |

---

## 남은 작업

남은 작업은 아래 순서로 진행합니다.

```text
Cycle 2. Comment Write 연결
Cycle 3. Comment Like / Delete 연결
Cycle 4. Courses 목록 / 상세 연결
Cycle 5. Course Review 작성 연결
Cycle 6. Profile / Activity 연결
Cycle 7. Notifications 연결
Cycle 8. RTDB Read Subscription 연결
Cycle 9. 전체 통합 점검
Cycle 10. Staging 실행 검증
```

각 Cycle은 완료 후 커밋과 태그를 남깁니다.

권장 태그:

```text
frontend-comment-write-v1
frontend-comment-actions-v1
frontend-courses-read-v1
frontend-course-review-v1
frontend-profile-activity-v1
frontend-notifications-v1
frontend-rtdb-subscriptions-v1
frontend-integration-check-v1
frontend-staging-verified-v1
backend-demo-mode-v1
frontend-demo-login-v1
```

---

## 시연 Happy Path

최종 시연 흐름은 다음을 목표로 합니다.

```text
1. 앱 실행
2. 테스트 학교로 시연 시작
3. Feed 진입
4. 통합 / 내학교 / 내학과 피드 확인
5. 게시글 상세 진입
6. 댓글 확인
7. 좋아요 / 스크랩
8. 댓글 작성
9. 강의 목록 확인
10. 강의 상세 확인
11. 강의평 작성
12. 프로필 활동 확인
13. 알림 확인
```

---

## 문서 관리

다음 변경이 생기면 README도 함께 갱신합니다.

```text
새 API 연결
Demo Mode 구현
인증 구조 변경
Firebase RTDB rules 변경
Reserved 기능 활성화
프론트 라우트 구조 변경
백엔드 API contract 변경
```

README는 실제 구현 상태와 다르게 유지하지 않습니다.
