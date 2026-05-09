# 00 — Integration Audit

> 통합 작업 직전, 백엔드 / 프론트엔드 두 repo의 현재 상태를 한 번 정리한 감사 문서.
> 본 문서는 Feed API 1차 연결 사이클의 시작 시점(2026-05-10)을 기준으로 작성되었다.

## 1. 폴더 구조

```
UNIT_all/                         (git repo X)
├── UNIT_BACKEND/                 (git repo O)  ← Spring Boot 3.3.5 / Java 21
└── UNIT_FRONTEND/                (git repo O)
    ├── unit-mobile/              ← 실제 프로젝트 (Expo SDK 52 + React Native 0.76 + TS 5)
    └── web-source/               ← 참조용 정적 jsx (디자인 소스, 빌드 대상 아님)
```

- `UNIT_all` 자체는 git repo가 아니다 — 신규 git init 금지(이번 작업에서 준수).
- 백엔드/프론트는 각각 독립 repo. 한 repo로 합치지 않는다.

## 2. 백엔드 감사

| 항목 | 결과 |
|---|---|
| 빌드 시스템 | `build.gradle` (Gradle 8.10.2) |
| 소스 루트 | `src/main/java/kr/unit/backend/` |
| `frontend-contract/` | 존재 (10개 문서 모두 확인) |
| `database.rules.json` | 존재 |
| `IMPLEMENTATION_REPORT.md` | 존재 |
| Controllers | Auth, Health, Posts, PostScrap, PostComment, Users, UserActivity, Courses, Jury, Notifications, ReservedFeature |
| 서버 포트 | `8080` (`application.yml` `server.port: 8080`, `context-path: /`) |
| API base path | `/v1` (각 컨트롤러가 `@RequestMapping("/v1/...")`로 prefix) |
| CORS | `allowedOriginPatterns: [*]` — `localhost:5173` / Expo dev server / Expo Go 모두 통과 |
| 빌드 결과 | `./gradlew.bat clean test bootJar` → **BUILD SUCCESSFUL in 10s** |
| jar | `build/libs/unit-backend-0.0.1-SNAPSHOT.jar` 생성 확인 |

### 핵심 파일 좌표

- Feed endpoint 정의: [PostController.java:52](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/posts/controller/PostController.java#L52)
- Base path: `@RequestMapping("/v1/posts")`
- CORS: [CorsConfig.java](../../../UNIT_BACKEND/src/main/java/kr/unit/backend/common/config/CorsConfig.java) — `allowedOriginPatterns(*)`, `allowCredentials(true)`, `exposedHeaders([Authorization])`
- 응답 envelope: `ApiResponse<T> { code, message, result }` — 단일 출처는 contract `01_FRONTEND_API_CONTRACT.md §0`

## 3. 프론트엔드 감사

| 항목 | 결과 |
|---|---|
| 프레임워크 | **Expo SDK 52 + React Native 0.76.9** (Vite/React-web 아님) |
| TypeScript | strict, `paths: { "@/*": ["./src/*"] }` |
| Router | `@react-navigation/native` (RootNavigator + UnitV2Stack + TabNavigator) |
| FeedPage 위치 | [src/screens/v2/FeedScreen.tsx](../../src/screens/v2/FeedScreen.tsx) |
| Mock data | FeedScreen 내부에 inline `POSTS` 배열만 존재. 별도 mock 모듈 없음 |
| API client | **존재하지 않았음** (이번 작업에서 신규 생성) |
| Firebase | 코드/의존성 모두 없음. RTDB write 코드 없음 ✅ |
| RTDB write 코드 | 없음 ✅ |
| PWA / Service Worker | 해당 없음 (RN 환경) ✅ |
| AI / Gemma / OCR / Recap | 코드/의존성 모두 없음 ✅ |
| `.env*` 파일 | 없었음 (이번 작업에서 `.env.example` 신규 생성) |
| Tailwind | 미사용 (RN StyleSheet 사용) |
| React Query / TanStack | **미설치** — 이번 사이클은 `useState/useEffect` 기반으로 1차 연결 |

### 사용 가능한 npm scripts

```jsonc
// package.json
"scripts": {
  "start":     "expo start",
  "android":   "expo start --android",
  "ios":       "expo start --ios",
  "web":       "expo start --web",
  "typecheck": "tsc --noEmit"
}
```

- **`npm run build` 스크립트는 정의되어 있지 않다**. Expo는 `eas build`(클라우드 네이티브 빌드) 또는 `expo export`를 사용한다.
  로컬에서 검증 가능한 가장 가까운 명령은 `npm run typecheck`.
- 검증 실행 결과: `tsc --noEmit` → exit 0 (clean).

## 4. 통합 명세와의 차이 — Vite/Expo 불일치

원본 통합 지시문은 Vite + React-web 환경을 가정 (`VITE_API_BASE_URL`, `localhost:5173`,
`npm run build`, `localStorage`). 실제 프로젝트는 Expo + React Native이므로 다음과 같이 매핑·치환했다.

| 명세 (Vite) | 실제 (Expo) | 비고 |
|---|---|---|
| `VITE_API_BASE_URL` | `EXPO_PUBLIC_API_BASE_URL` | Expo는 `EXPO_PUBLIC_*` 접두사를 자동 노출 |
| `VITE_ENABLE_RTDATABASE` | `EXPO_PUBLIC_ENABLE_RTDATABASE` | 기본값 `false` 유지 |
| `.env.local.example` | `.env.example` | RN 컨벤션 |
| `localhost:5173` (CORS) | 모든 origin (`*`) — 기존 정책으로 RN/웹/Expo Go 모두 커버 |
| `npm run build` | `npm run typecheck` (`tsc --noEmit`) | Expo는 로컬 web build 스크립트 미정의 |
| `localStorage` | 모듈 in-memory holder ([sessionToken.ts](../../src/services/api/sessionToken.ts)) | 차후 `expo-secure-store`로 교체 예정 |

CORS는 백엔드가 이미 모든 origin을 허용하고 있으므로 `localhost:5173` 별도 화이트리스트는 불필요.

## 5. Contract 필드 ↔ 명세 필드 차이

명세 §8에서 PostCard 필수 필드로 `boardName`, `tags`, `author.anonymousId`를 요구했으나,
실제 contract `01_FRONTEND_API_CONTRACT.md §5` `PostFeedItemResponse` shape는:

```json
{ "postId", "boardId", "title", "preview", "anonymousId", "createdAt", "stats": { "likes", "comments", "scraps" } }
```

이며 `boardName`/`tags` 키가 없고 `anonymousId`는 flat이다. **Contract가 단일 출처**이므로
contract를 따르고, mapper에서 다음과 같이 normalize했다 ([postMapper.ts](../../src/services/api/mappers/postMapper.ts)):

- `boardName` → `null` (프론트에서 board-id → label lookup 필요. 후속 작업)
- `tags` → `undefined` (응답에 없음)
- `author.anonymousId` ← flat `anonymousId`에서 파생

차이는 [01_FEED_API_CONNECTION_REPORT.md](01_FEED_API_CONNECTION_REPORT.md)에 재기록.

## 6. 금지 코드 발견 여부 (현 상태)

| 항목 | 발견? |
|---|---|
| RTDB direct write | ❌ 없음 |
| Firebase set/update/push/remove | ❌ 없음 |
| `.env`/serviceAccountKey 등 비밀 파일 | ❌ 없음 |
| 하드코딩된 API URL | ❌ 없음 (이번에 추가한 코드는 모두 `EXPO_PUBLIC_API_BASE_URL` 경유) |
| `size` pagination 파라미터 사용 | ❌ 없음 |
| `/post_comments` 경로 사용 | ❌ 없음 |
| `response.data` unwrap 없이 사용 | ❌ 없음 (envelope unwrap은 apiClient에서만) |
| AI / Gemma / OCR / Recap 실제 구현 | ❌ 없음 |
| PWA / Service Worker | ❌ 없음 (RN 환경) |
| 백엔드+프론트 단일 repo 시도 | ❌ 없음 |

## 7. 실행 명령 요약 (재현용)

```powershell
# 백엔드
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd C:\Users\User\Downloads\UNIT_all\UNIT_BACKEND
.\gradlew.bat clean test bootJar
.\gradlew.bat bootRun        # 서버는 :8080 에서 기동

# 프론트
cd C:\Users\User\Downloads\UNIT_all\UNIT_FRONTEND\unit-mobile
npm run typecheck            # 또는: ./node_modules/.bin/tsc --noEmit
# 기기/시뮬레이터 실행:
# npx expo start
```
