# 15 — Staging Verification Runbook & Result

> Cycle 10 (runbook). 실제 staging 환경에서 백엔드 + 프론트 happy path 검증.
>
> **이 cycle은 실 환경 액세스가 필요해 사용자 손이 필요한 수동 단계가 다수 포함된다.**
> Claude Code는 자동화 가능한 부분(문서화, typecheck, dependency check)만 수행하고, 실 환경 검증은 사용자가 본 문서를 따라 실행한다.

## 0. 자동화 부분 — 결과

| 검사 | 결과 |
|---|---|
| `tsc --noEmit` | ✅ exit 0 (Cycle 9에서 검증, 본 cycle에선 변경 없음) |
| `expo install --check` | ✅ "Dependencies are up to date" |
| 모든 cycle별 commit/tag | ✅ Cycle 9 §11 매트릭스 참조 |
| 금지 패턴 grep | ✅ Cycle 9 §1 결과 참조 |
| RTDB direct write | ✅ 0건 (Cycle 9 §4) |

## 1. 백엔드 Staging 실행

### 환경 변수 (서버측)

```yaml
# application.yml 또는 환경변수
SPRING_PROFILES_ACTIVE: local           # 또는 staging
SERVER_PORT: 8080
JWT_SECRET: <strong-random-32-bytes>    # 절대 git에 올리지 말 것
JWT_ISSUER: unit-api
JWT_SESSION_TTL_SECONDS: 2592000

UNIT_CURRENT_SEMESTER: 2026-1
UNIT_SEMESTER_EXPIRES_AT: 2026-08-31T23:59:59Z

# Firebase
FIREBASE_PROJECT_ID: <staging-project-id>
FIREBASE_DATABASE_URL: https://<project>-default-rtdb.firebaseio.com
FIREBASE_CREDENTIALS_PATH: /run/secrets/firebase-service-account.json
FIREBASE_ENABLED: true                  # staging은 true (local은 false 가능)
```

### 실행 (Windows PowerShell)

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd C:\Users\User\Downloads\UNIT_all\UNIT_BACKEND

# 빌드 + 테스트
.\gradlew.bat clean test bootJar

# 서버 기동 (foreground)
.\gradlew.bat bootRun
# 또는
java -jar build\libs\unit-backend-0.0.1-SNAPSHOT.jar
```

성공 신호:
```
Tomcat started on port 8080 (http) with context path '/'
Started UnitBackendApplication in N seconds
```

### 인증된 API ping (smoke test)

```powershell
# 기동 확인 (인증 불필요)
curl http://localhost:8080/v1/health
# 기대: { "code": "SUCCESS", "result": { "status": "OK", ... } }

# Firebase ID Token 발급 후 → sessionToken 받기
# (실제 토큰 발급은 Firebase Auth 클라이언트에서. 개발자 도구로 manual 가능.)
curl -X POST http://localhost:8080/v1/auth/session `
  -H "Content-Type: application/json" `
  -d '{ "firebaseIdToken": "<paste-real-id-token>" }'
# 응답에서 result.sessionToken 복사 → DEV 패널에 붙여넣기
```

## 2. 프론트 `.env` Staging

`.env` 파일 (gitignored — 실제 값은 절대 commit 금지):

```env
# 백엔드 base URL — 디바이스별 차이 주의
# Android emulator: http://10.0.2.2:8080/v1
# iOS simulator:    http://localhost:8080/v1
# 실 디바이스:      http://<LAN-IP>:8080/v1
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/v1

# RTDB read subscription — staging에서만 활성
EXPO_PUBLIC_ENABLE_RTDATABASE=true

# Firebase 설정값 (Firebase Console > 프로젝트 설정 > 일반 > 웹 앱 SDK 구성에서 복사)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=unit-staging.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://unit-staging-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=unit-staging
```

⚠️ **주의:**
- 위 `EXPO_PUBLIC_*` 값은 모두 클라이언트 번들에 노출됨 → secret 저장 금지. Firebase Web 설정값은 **public**으로 분류되며, RTDB Security Rules로 권한을 통제하는 것이 정석.
- service account JSON 파일은 절대 프론트에 넣지 말 것.

### Expo 실행

```powershell
cd C:\Users\User\Downloads\UNIT_all\UNIT_FRONTEND\unit-mobile
npm run start
# 또는
npx expo start

# Android emulator
npx expo start --android

# iOS simulator (macOS only)
npx expo start --ios

# 실 디바이스 (Expo Go 앱 + QR)
npx expo start
```

성공 신호: Metro bundler가 QR을 출력 → Expo Go에서 스캔 → 앱 진입.

## 3. RTDB Security Rules Staging 배포 체크리스트

(백엔드 repo의 `database.rules.json` 참조)

- [ ] `database.rules.json` 최신 상태 확인 (`backend-integration-ready-v1` 태그 시점)
- [ ] `firebase deploy --only database --project <staging>` 으로 배포
- [ ] 배포 후 emulator suite 또는 console에서 read 권한 검증
  - `auth.uid !== null` 요구 시 → 프론트는 Custom Token 흐름이 없어 read가 거절될 수 있음 (Cycle 8 §9 한계 참고)
  - 임시: staging에서만 일부 path를 `".read": true`로 열어 개발 검증 가능 — production 배포 전 닫기

## 4. Happy Path 수동 검증 체크리스트

✅ = 통과, ❌ = 실패, ⏭ = skip

### 4-1. DevAuthPanel
- [ ] FeedScreen 진입 시 상단에 노란색 DEV 막대 표시
- [ ] tap → 패널 펼침
- [ ] sessionToken 붙여넣고 "저장" → 토큰 저장됨 표시 (앞 6자 + 길이만 마스킹)
- [ ] "삭제" → "토큰 없음" 상태 복귀
- [ ] (production 빌드에서는 막대가 보이지 않아야 함 — `__DEV__` 가드)

### 4-2. Feed (cycle 1)
- [ ] 토큰 저장 후 피드 카드 5+개 로드
- [ ] 탭 전환: 통합 ↔ 내학교 ↔ 내학과
- [ ] 내학교/내학과에서 schoolId/departmentId 미등록 사용자 → "학교/학과 정보가 등록되지 않았습니다" 안내
- [ ] 카드 tap → PostDetail 진입 (string postId 정상 전달)
- [ ] 무한스크롤 / cursor 페이지네이션
- [ ] 토큰 삭제 후 진입 → "로그인이 필요합니다" 안내

### 4-3. PostDetail (cycle 3)
- [ ] 본문 / 태그 / 통계 / 작성자 익명ID 정상 렌더링
- [ ] 잘못된 postId 진입 → "삭제되었거나 존재하지 않는 글입니다"
- [ ] AppBar 제목이 boardName ?? boardId

### 4-4. Comments GET (cycle 4)
- [ ] 댓글 영역 로드 (loading → success)
- [ ] 0건이면 "아직 댓글이 없어요"
- [ ] hasMore면 "댓글 더보기" 버튼 동작
- [ ] deleted 댓글은 italic + 회색

### 4-5. Comment Write (cycle 2 runbook)
- [ ] 입력 후 "등록" → 옵티미스틱 동작 + 댓글 리스트 첫 페이지 자동 갱신
- [ ] 1001자 이상 입력 → 글자 수 빨강, 등록 비활성
- [ ] 빈 본문 → 등록 비활성

### 4-6. Comment Like (cycle 3 runbook)
- [ ] 댓글 좋아요 tap → 즉시 +1 + active
- [ ] 다시 tap → -1 + inactive
- [ ] 빠른 연타에서 한 번씩만 호출
- [ ] 토큰 잘못됨 → 옵티미스틱 후 즉시 rollback + 에러 메시지

### 4-7. Post Like / Scrap (cycle 5 prior)
- [ ] 추천 / 스크랩 버튼 옵티미스틱
- [ ] 응답 후 서버 값으로 정착
- [ ] 실패 시 rollback + 에러

### 4-8. Courses (cycle 4 runbook)
- [ ] CoursesScreen 카드 리스트 (schoolId='ajou' hardcoded — 다른 학교 viewer는 빈 페이지)
- [ ] 카드 tap → CourseDetail
- [ ] 미작성자: 422 REVIEW_QUOTA_REQUIRED → 자동으로 CourseReview 진입
- [ ] CourseReview에서 추천 / 비추 / 건너뛰기 → 등록 → CourseDetail로 replace, 통계 정상 갱신

### 4-9. Profile / Activity (cycle 6 runbook)
- [ ] ProfileScreen 헤로 영역: 이름 / 학교 / 학과 / 학번(masked) / RESERVED 안내
- [ ] 통계 3칸: 작성 / 댓글 / 받은 추천
- [ ] MyPosts / MyComments / Scraps 화면 진입 → 7-state 정상 분기
- [ ] 빈 상태 / 더보기 / 카드 tap → PostDetail

### 4-10. Notifications (cycle 7 runbook)
- [ ] 알림 리스트 로드, 읽지 않음 dot 표시
- [ ] tab: all / unread 필터링
- [ ] 알림 tap → markRead 옵티미스틱 + 적절한 화면 라우팅 (JURY_SUMMON → Jury)
- [ ] "모두 읽음" → 일괄 읽음
- [ ] 더보기 cursor

### 4-11. RTDB Subscription (cycle 8 runbook)
- [ ] `EXPO_PUBLIC_ENABLE_RTDATABASE=true` + Firebase env 정상 설정
- [ ] NotificationsScreen 진입 → 백그라운드에서 새 알림이 RTDB에 push되면 자동 refetch (백엔드가 알림 작성하는 시나리오 트리거 필요 — 댓글 달기 등)
- [ ] `EXPO_PUBLIC_ENABLE_RTDATABASE=false`이면 subscription 비활성 (REST polling만)

## 5. ErrorCode 강제 테스트 체크리스트

| 시나리오 | 기대 동작 |
|---|---|
| sessionToken 없음 → 어떤 인증 필요 endpoint 호출 | 401 AUTH_REQUIRED → "로그인이 필요합니다" |
| 위조된 token (`Bearer xxx.yyy.zzz`) | 401 AUTH_INVALID → 토큰 자동 클리어 + "로그인이 필요합니다" |
| 만료된 token (TTL 만료) | 401 AUTH_EXPIRED → 토큰 자동 클리어 + "로그인이 필요합니다" |
| 존재하지 않는 postId | 404 NOT_FOUND → "삭제되었거나 존재하지 않는 글입니다" |
| 다른 사용자 댓글 삭제 시도 | 403 FORBIDDEN → "권한이 없습니다" (UI는 cycle 3 보류, hook에서만) |
| Reserved endpoint 직접 호출 (예: /v1/auth/student-card/verify) | 501 FEATURE_RESERVED → "준비 중인 기능입니다" |
| schoolId 미등록자가 scope=school 요청 | 422 BUSINESS_RULE_VIOLATION → "학교/학과 정보가 등록되지 않았습니다" |
| 댓글 1001자 작성 시도 | 클라이언트 사이드 검증으로 차단 (등록 비활성) |
| 강의평 이미 작성한 강의에 또 작성 | 422 BUSINESS_RULE_VIOLATION → server message 그대로 |
| `/v1/courses/{id}` 미작성자 호출 | 422 REVIEW_QUOTA_REQUIRED → CourseReview 자동 라우팅 |
| Network 끊김 | NETWORK_ERROR → "네트워크 연결을 확인해주세요" |
| 백엔드 down | 동일 ('NETWORK_ERROR' 합성) |

## 6. Reserved 기능 UI 검증

다음 endpoint는 **호출 자체가 금지** (hook에서 시도조차 안 함). UI는 placeholder만 노출:

- `/v1/auth/student-card/verify` (학생증 OCR)
- `/v1/ai/refine` (AI 글다듬기)
- `/v1/recap/{semester}` (Recap)
- `/v1/recap/schools/{schoolId}/{semester}`

검증: 위 endpoint를 직접 curl로 호출하면 501 FEATURE_RESERVED 반환되는지 백엔드 단독 확인 가능. 프론트는 호출 코드 0건이어야 함 (Cycle 9 audit 결과).

## 7. 안전 점검

- [ ] **service account JSON / API key secret을 프론트 .env 또는 git에 절대 넣지 않음** — Firebase Web 설정값(API_KEY 등)은 public이지만 backend의 service account는 secret
- [ ] **token을 console.log하지 않음** (DevAuthPanel의 마스킹 표시는 안전)
- [ ] **prod 배포 금지** — 본 cycle은 staging 전용
- [ ] **Firebase RTDB Security Rules**가 적절히 설정됐는지 확인 (auth.uid 기반 제한)

## 8. 프론트 Auto-verify 명령어 (사용자 실행)

```powershell
cd C:\Users\User\Downloads\UNIT_all\UNIT_FRONTEND\unit-mobile

# Type check
npm run typecheck

# Expo dependencies sanity
npx expo install --check

# Static audit (Cycle 9 grep 재실행)
Select-String -Path src\**\*.ts,src\**\*.tsx -Pattern "post_comments"  # 0 hits 기대
Select-String -Path src\**\*.ts,src\**\*.tsx -Pattern "parseInt\(postId|Number\(postId"  # 0 hits 기대
```

## 9. 검증 결과 기록 (사용자 작성)

체크리스트(§4, §5, §6) 진행 후 아래에 결과 기록:

```
검증 일시: ____________
백엔드: ____________ (commit hash)
프론트: 2a1e221 chore: complete frontend integration audit (frontend-integration-check-v1 태그)
환경: ____________ (staging URL / IP)

§4 Happy Path: __ / 11 통과
§5 ErrorCode: __ / 12 통과
§6 Reserved: __ / 4 검증

블로커:
- ...

다음 작업 권고:
- ...
```

## 10. 검증 완료 후 commit / tag (사용자 액션)

체크리스트가 모두 ✅로 마킹되면 본 문서 끝에 결과 섹션 추가하여 commit:

```powershell
git add unit-mobile/docs/integration/15_STAGING_VERIFICATION_REPORT.md
git commit -m "test: verify frontend staging integration"
git tag frontend-staging-verified-v1
```

본 문서 자체의 commit (이번 자동화 부분만):

```
chore: add staging verification runbook
```

(자동/수동 분리 commit 정책)

## 11. 다음 단계 (cycle 1차 완료 이후)

runbook §"최종 통합 완료 기준"의 모든 항목을 충족하면 1차 통합 완료. 추가 작업:

1. **Login flow 정상화** — 학생증 OCR 또는 학교 이메일 인증 endpoint 활성 후 LoginScreen 와이어링
2. **WriteScreen** — `POST /v1/posts` 연결
3. **OtherProfileScreen** — `GET /v1/users/{userId}` 연결
4. **ReportScreen** — `POST /v1/posts/{postId}/report` 연결
5. **JuryScreen** — `GET /v1/jury/cases/{caseId}` 연결
6. **AUTH_EXPIRED 자동 refresh** interceptor
7. **post.stats 동기화** — comment write/delete + post like/scrap 후 detail/feed 카운트 갱신
8. **myActions / isMyComment 백엔드 협의** — viewer 컨텍스트 노출
9. **board-id → 한글 라벨** 정적 매핑 또는 `/v1/boards` endpoint
10. **Comment delete UI** 활성 (isMyComment 합의 후)
11. **무한스크롤** (PostDetail 전체 FlatList 재구성)
12. **TanStack Query** 도입
13. **Custom Token RTDB 인증** — Firebase signInWithCustomToken 흐름
14. **추가 RTDB read paths** — feed stats / post stats / comment stats
15. **Course list stats** — 백엔드 contract 확장 협의
16. **Push notifications / FCM** — 별도 cycle (현재 절대금지)
17. **dependency audit fix** — firebase transitive vulns
