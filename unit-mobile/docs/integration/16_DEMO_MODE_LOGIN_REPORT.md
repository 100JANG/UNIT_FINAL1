# 16 — Demo Mode Login Connection Report

> 시연 안정성 작업. 학교 선택 / Feed 화면에 "테스트 학교로 시연 시작" 버튼을 추가.
> 운영 모드(EXPO_PUBLIC_APP_MODE 미설정 / 다른 값)에서는 컴포넌트가 null 을 반환해
> 자동으로 숨겨진다. 기존 코드는 삭제하지 않는다.

## 1. Demo Mode 목적

- 회원가입 / 학생인증 / Firebase 실 연동 없이 시연을 진행
- 백엔드 demo profile + 인메모리 시드 데이터 + `/v1/dev/demo-login` 으로 즉시 sessionToken 발급
- 프론트는 SecureStore 에 토큰을 저장하고 Tabs(Feed) 로 진입

## 2. 테스트 학교 진입 흐름

```
앱 실행 → (어디서든)
  - Feed 화면 상단의 노란색 "DEMO" 박스
    또는
  - 학교 선택 화면 진입 후 상단의 노란색 "DEMO" 박스
→ "테스트 학교로 시연 시작" 탭
  → POST /v1/dev/demo-login (인증 헤더 없음)
  → setSessionToken(result.sessionToken) (SecureStore 영속화)
  → onEntered 콜백
    - SchoolSelectScreen: 부모 stack reset → Tabs
    - FeedScreen: useFeedPosts.refetch() (이미 Tabs에 있음)
```

운영 빌드(`EXPO_PUBLIC_APP_MODE` 미설정 또는 `production`)에서는 `DemoSchoolEntry`
컴포넌트가 시작 시 `null` 을 반환해 어떤 화면에도 노출되지 않는다.

## 3. 생성/수정 파일

신규:
- [src/services/api/demoApi.ts](../../src/services/api/demoApi.ts) — `demoLogin()`. 인증 헤더 미부착 (`auth: false`)
- [src/hooks/useDemoLogin.ts](../../src/hooks/useDemoLogin.ts) — submit + error 분류 + `setSessionToken` 호출 + onSuccess 콜백
- [src/components/dev/DemoSchoolEntry.tsx](../../src/components/dev/DemoSchoolEntry.tsx) — 시연 진입 박스. `EXPO_PUBLIC_APP_MODE === 'demo'` 가 아니면 null 반환
- [docs/integration/16_DEMO_MODE_LOGIN_REPORT.md](16_DEMO_MODE_LOGIN_REPORT.md)

수정 (기존 코드 삭제 0건):
- [.env.example](../../.env.example) — `EXPO_PUBLIC_APP_MODE=` 키 추가 (DEMO_MODE 주석 포함)
- [src/screens/v2/SchoolSelectScreen.tsx](../../src/screens/v2/SchoolSelectScreen.tsx)
  - 상단에 `<DemoSchoolEntry onEntered={onDemoEntered} />` 1줄
  - `onDemoEntered` 핸들러로 root navigator reset → Tabs
  - 기존 학교 리스트/검색/Login navigate 모두 그대로 보존 (DEMO_MODE_PRESERVE 처리 불필요 — 추가만 함)
- [src/screens/v2/FeedScreen.tsx](../../src/screens/v2/FeedScreen.tsx)
  - DevAuthPanel 위에 `<DemoSchoolEntry onEntered={refetch} />` 1줄 추가

수정 안 함:
- 기존 LoginScreen / EmailVerifyScreen / ProfileSetupScreen 모두 그대로 유지
- DevAuthPanel 그대로 유지 (개발자가 sessionToken 을 직접 붙여넣는 흐름은 별도 도구로 보존)
- 다른 hook/screen/api 0건 변경

## 4. sessionToken 저장 방식

- demoLogin 성공 → `setSessionToken(result.sessionToken)` 호출 (기존 SecureStore 기반 함수 재사용)
- 어떤 새 저장 메커니즘도 추가하지 않음 — DevAuthPanel 이 사용하는 동일 함수
- token 전체값을 화면에 노출하지 않음 (Pressable 라벨에 안 보임). console.log 0건.

## 5. 회원가입 / 학생인증 우회 방식

회원가입/학생인증 코드는 **0건 삭제 / 0건 비활성화**. demo 흐름이 단순히 그 화면들을
거치지 않고 곧장 Tabs 로 진입할 뿐.

- LoginScreen: 그대로
- EmailVerifyScreen: 그대로
- ProfileSetupScreen: 그대로
- SchoolSelectScreen: 기존 학교 리스트도 그대로. 데모 박스가 추가됐을 뿐.

학생인증 완료 표시 없음 — 백엔드 `studentVerificationStatus` 는 항상 `RESERVED`,
프론트 `MyProfile.isStudentVerificationReserved` 는 true 로 surfaced.

## 6. 운영 모드 차단

| 차단 지점 | 메커니즘 |
|---|---|
| 컴포넌트 조기 반환 | `isDemoMode()` (`process.env.EXPO_PUBLIC_APP_MODE === 'demo'`) 가 false 면 즉시 `null` 반환 |
| API 404 | 백엔드 `app.demo.enabled` 가 false 면 `DemoAuthController` 빈 미등록 → 404. 프론트는 `not-available` 에러로 매핑하여 안내 |
| 환경변수 누설 방지 | `.env.example` 의 `EXPO_PUBLIC_APP_MODE=` 는 빈 값 (production safe) |

운영 빌드에서 실수로 demo 박스가 노출될 가능성:
- `.env` 에 `EXPO_PUBLIC_APP_MODE=demo` 를 직접 적은 경우. 이는 사용자(빌드 담당)의 책임.
- CI 차단 권장: build 스크립트에서 `EXPO_PUBLIC_APP_MODE` 가 `production` 빌드에서 `demo` 가 아닌지 검증.

## 7. ErrorCode 처리

| 시나리오 | UI |
|---|---|
| 백엔드 demo 비활성 (404) | `not-available` kind — "백엔드 Demo Mode 가 꺼져 있습니다. SPRING_PROFILES_ACTIVE=demo 또는 app.demo.enabled=true 로 실행한 뒤 다시 시도해주세요." |
| 네트워크 끊김 | `network` kind — "네트워크 연결을 확인해주세요" |
| 그 외 | `unknown` kind — message 또는 "시연 진입에 실패했습니다" |

## 8. 검증 결과

```
./node_modules/.bin/tsc --noEmit  → exit 0 ✅
```

새 native module 0건 → `expo install --check` 재실행 불필요.
기존 통합 작업(Cycles 1~10) 의 회귀 0건 — Feed/PostDetail/Comments/CourseDetail/Profile/Notifications/RTDB 코드 모두 그대로.

## 9. 회귀 여부

| 항목 | 결과 |
|---|---|
| Feed / PostDetail / Comments / Like-Scrap / Comment Write/Like/Delete / Courses / Course Review / Profile / Activity / Notifications | ✅ 0건 변경 |
| `apiClient` envelope unwrap / Auth 정책 | ✅ 0건 변경 |
| route param 마이그레이션 | ✅ 변경 없음 |
| RTDB read subscription | ✅ 변경 없음 (별도 게이트) |
| DevAuthPanel | ✅ 그대로 — token 직접 붙여넣기 흐름 유지 |
| 기존 LoginScreen 등 auth flow 화면 | ✅ 0건 변경 |

## 10. 남은 문제 / TODO

1. **demo 진입 후 logout**: 현재 logout 흐름이 미구현이라 demo 사용자에서 빠져나오려면 DEV 패널의 "삭제" 또는 앱 데이터 삭제 필요. logout cycle 진행 시 함께 정리.
2. **UnitV2Stack 직접 진입**: 앱 시작 시 RootNavigator 의 initial route 가 `Tabs` 이라 SchoolSelect 까지 도달하려면 명시적 navigate 가 필요. demo 박스를 Feed 에도 두어 데모 진입 가능하게 했으나, 더 자연스러운 onboarding 진입 흐름은 별도 cycle.
3. **demo 사용자 시드 안정성**: 백엔드 InMemory store 는 프로세스 메모리. 백엔드 재기동 시 데이터 사라짐 → demo 첫 진입 시 자동 reseed (ApplicationRunner). 시연 도중 세션이 살아있는 한 문제 없음.
4. **production 빌드 가드**: `EXPO_PUBLIC_APP_MODE=demo` 가 production 환경변수에 새어들어가지 않도록 CI 검증 권장 (CI 스크립트 변경은 본 cycle 외).
5. **demo seed 의 더미 댓글/리뷰가 너무 적게 보일 수 있음**: 시연 시 더 풍성하게 보이도록 seed 양을 늘리는 것은 별도 작업.

## 11. 다음 추천 작업

1. **시연용 happy path 점검** — DEMO_MODE.md(백엔드) + 본 문서를 따라 `SPRING_PROFILES_ACTIVE=demo` + `EXPO_PUBLIC_APP_MODE=demo` 로 둘 다 켠 상태에서 모든 화면을 한 번씩 통과
2. **Feed/PostDetail/Comments/Like/Scrap/Course/Notifications 데모 흐름 확인** — 각 화면이 시연용 더미 데이터로 정상 렌더링되는지 (Cycle 10 staging 체크리스트 §4 재사용)
3. **Demo seed 보강** — 댓글/리뷰/알림을 시연 시 풍성해 보이도록 5~10개로 증량
