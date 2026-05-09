# 08. Claude Code 프롬프트

이 폴더(`docs/handoff/`)를 기존 RN 레포에 복사한 뒤, 아래 프롬프트를 PR 단위로 그대로 붙여넣어 사용한다.

---

## 🟦 부트스트랩 (가장 먼저 1회)

```
역할: 너는 이 React Native 레포의 시니어 모바일 엔지니어다.
컨텍스트: docs/handoff/ 아래 파일을 읽었다고 가정한다.
  - 00_OVERVIEW.md (원칙·순서)
  - 01_TOKENS.md (색·폰트·간격)
  - 02_COMPONENTS.md (ui/ 14개 사양)
  - 03_SCREENS.md (화면 36개 사양)
  - 04_MIGRATION_MAP.md (HTML→RN 치환 규칙)
  - 05_INTERACTIONS.md (마이크로 인터랙션)
  - 06_API_CONTRACT.md (REST + WS)
  - 07_PR_PLAN.md (16개 PR 순서)

작업 전 반드시 확인:
  1) 기존 레포의 디렉토리 구조 (src/, components/, screens/, navigation/)
  2) 이미 정의된 토큰/테마 파일 (있으면 그걸 베이스로 확장)
  3) 사용중인 라이브러리 (react-navigation 버전, reanimated 유무)
  4) 기존 화면 컴포넌트 이름·라우트 이름 (절대 바꾸지 않음)

작업 원칙:
  - 한 번에 한 PR만. 본 작업 외에는 절대 손대지 않는다.
  - 기존 코드 깨면 작업 중단하고 보고.
  - 새 화면은 src/components/v2/, src/screens/v2/ 네임스페이스 사용.
  - 토큰·ui/ 14개를 먼저 만들고, 그 다음 화면.

출력 형식:
  - 변경된 파일 트리
  - 핵심 코드 (긴 파일은 핵심만)
  - 검증 방법 (어떤 명령으로 테스트할지)
  - 다음 PR이 의존하는 약속

먼저 docs/handoff/00_OVERVIEW.md를 읽고, 작업 계획과 PR-01의 작업 범위를 요약해라.
```

---

## 🟦 PR-01 토큰 + ui/

```
PR-01 · feat: design tokens + ui/ scaffolding

해야 할 일:
1) src/theme/tokens.ts 생성 — 01_TOKENS.md 정의 그대로
2) src/components/ui/ 디렉토리에 14개 컴포넌트 빈 구현
   AppBar · Pill · Avatar · BottomTab · Screen · Chip · Hairline · Tabs ·
   IconButton · ListRow · Sheet · Switch · MannerBadge · LogoMark
3) src/components/ui/icons.tsx — 02_COMPONENTS.md의 Ic.* 12개 react-native-svg로
4) Storybook(또는 CRN preview)에 14개 스토리 1개씩
5) 기존 코드 0줄 수정

수용 기준:
  - tsc·eslint PASS
  - 기존 화면 빌드/렌더 영향 없음
  - Storybook 14개 컴포넌트 모두 표시

PR description에 변경 파일 목록과 스크린샷 첨부.
```

---

## 🟦 PR-02 라우트

```
PR-02 · feat: navigation routes for v2 screens

해야 할 일:
1) src/navigation/UnitV2Stack.tsx 생성
2) 03_SCREENS.md의 36개 라우트 등록 (placeholder = "준비중" 화면)
3) 기존 RootStack에 <Stack.Screen name="UnitV2" component={UnitV2Stack} /> 한 줄 추가
4) deep link prefix unit:// 매핑

라우트 이름은 03_SCREENS.md 헤더 그대로 (Splash, Feed, PostDetail ...).
type-safe하게 src/navigation/types.ts에 RootStackParamList 정의.
```

---

## 🟦 PR-03 ~ PR-10 신규 화면 템플릿

```
PR-{N} · feat: {섹션명} ({개수})

해야 할 일:
1) 03_SCREENS.md의 {섹션명} 항목을 모두 구현
2) 05_INTERACTIONS.md의 해당 섹션 인터랙션 모두 반영 (체크리스트로 표시)
3) 06_API_CONTRACT.md의 엔드포인트 hook 작성 (src/api/{도메인}.ts)
4) 화면별 Storybook 스토리

제약:
  - 기존 코드 0줄 수정
  - 토큰·ui/만 사용. 직접 색·사이즈 박지 말 것
  - HTML 프로토타입의 0.5단위 폰트는 정수화

검증:
  - iOS 시뮬, Android 에뮬 둘 다
  - 빈 상태 / 로딩 / 에러 3개 화면
  - 키보드 열림 상태에서 모든 액션 가능

작업 후 PR description에:
  - 변경 파일 트리
  - 화면별 스크린샷
  - 05_INTERACTIONS.md 체크리스트 (✅ 표시)
```

대입 예시:
- PR-03 = "매너 학점", "2"
- PR-04 = "인증·온보딩", "5"
- PR-05 = "검색·내 활동", "4"
- PR-06 = "모더레이션", "5"
- PR-07 = "설정", "3"
- PR-08 = "캠퍼스 허브", "6"
- PR-09 = "캠퍼스 심화", "4"
- PR-10 = "학생 생활", "4"

---

## 🟦 PR-11 ~ PR-14 기존 화면 교체 템플릿

```
PR-{N} · refactor: {섹션명} v2 교체

해야 할 일:
1) src/screens/v2/{화면}.tsx에 신규 구현 (03/04/05_*.md 사양)
2) src/utils/featureFlags.ts에 flags.unitV2.{도메인} 추가
3) 기존 라우트 컴포넌트를 wrapper로 교체:
   ```ts
   export default function FeedScreen(props) {
     return flags.unitV2.feed
       ? <FeedV2 {...adapt(props)} />
       : <LegacyFeed {...props} />;
   }
   ```
4) src/api/adapters/{도메인}.ts — 기존 API 응답 → 신규 props 어댑터
5) 모든 호출처 (navigate('Feed', ...)) 그대로 동작 확인

제약:
  - 라우트 이름·컴포넌트 이름 절대 변경 금지
  - 어댑터 없이 데이터 형태 강제 변경 금지
  - flag off 시 기존 화면 100% 동일 동작

검증:
  - flag on/off 토글로 두 버전 모두 정상
  - 기존 e2e 테스트 PASS
  - 신규 e2e 시나리오 추가
```

---

## 🟦 자주 쓸 추가 프롬프트

### 코드 리뷰 받기
```
방금 작성한 {파일} 코드를 검토해라.
체크 포인트:
  - 04_MIGRATION_MAP.md 규칙 위반 (raw 문자열, ScrollView+FlatList 중첩, 등)
  - 토큰 미사용 (직접 #000080 박은 곳)
  - 키보드 처리 누락
  - 빈 상태/에러 상태 누락
  - cleanup 누락 (useEffect, setTimeout, 소켓)
  - hitSlop 누락 (작은 아이콘 버튼)
```

### 막혔을 때
```
{화면명} 작업 중 {이슈}로 막혔다.
docs/handoff/03_SCREENS.md의 해당 화면 사양과
docs/handoff/05_INTERACTIONS.md의 디테일을 다시 읽고
원인과 해결책을 제시해라. 코드 변경은 내 승인 후.
```

### 화면 단독 검증
```
PR-{N}의 {화면명}을 단독 검증한다.
1) Storybook으로 띄워서 모든 상태 확인
2) 시나리오 (정상·빈·로딩·에러·키보드열림) 5가지
3) 위반 사항이 있으면 수정 PR을 별도 제안
```

---

## 🟦 절대 금지 (Claude Code에 포함)

```
다음은 절대 하지 마라:
  - HTML 프로토타입(claude.ai 프로젝트)에서 코드를 그대로 복붙
  - className= 속성을 RN 컴포넌트에 남기기
  - text-[14.5px] 같은 0.5단위 폰트 사이즈
  - 직접 hex 색상 박기 (반드시 C.* 토큰)
  - ScrollView 안에 FlatList 넣기
  - Pressable 안에 또 Pressable 넣기
  - 영어 placeholder/label로 임의 번역 (한글 그대로)
  - 한 PR에 화면 2개 이상 묶기
```
