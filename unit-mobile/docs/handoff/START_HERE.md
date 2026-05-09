# 🚀 시작 가이드 — 어디에 넣고, 무슨 명령을 칠까

> 한 번만 읽고 그대로 따라 하면 됩니다.

---

## 0. 준비물

- 기존 UNIT React Native 레포 (예: `~/dev/unit-app/` 같은 로컬 폴더)
- Claude Code 설치 (`brew install claude-code` 또는 공식 설치 가이드)
- 터미널

> "RN 레포"가 어디인지 모르겠다면, 본인 컴퓨터에서 `package.json`에 `react-native` 의존성이 있는 폴더가 그곳입니다. 보통 `~/dev/{프로젝트명}/` 또는 GitHub에 올려놓은 모바일 앱 레포.

---

## 1. 핸드오프 폴더를 RN 레포에 복사

이 프로젝트의 `handoff/` 폴더를 **다운로드 → 압축 풀기 → RN 레포의 `docs/` 안에 복사**합니다.

최종 모습:

```
my-rn-app/                    ← 기존 RN 레포
├── package.json
├── App.tsx (또는 index.js)
├── src/
├── ios/
├── android/
└── docs/
    └── handoff/              ← 여기에 통째로 복사
        ├── README.md
        ├── START_HERE.md     (이 파일)
        ├── 00_OVERVIEW.md
        ├── 01_TOKENS.md
        ├── 02_COMPONENTS.md
        ├── 03_SCREENS.md
        ├── 04_MIGRATION_MAP.md
        ├── 05_INTERACTIONS.md
        ├── 06_API_CONTRACT.md
        ├── 07_PR_PLAN.md
        └── 08_PROMPTS.md
```

> RN 레포가 아직 없다면 `npx create-expo-app unit-app` 또는 `npx @react-native-community/cli init UnitApp`로 빈 레포 먼저 생성.

---

## 2. 터미널에서 Claude Code 실행

```bash
cd ~/dev/my-rn-app          # ← 본인 RN 레포 경로로 이동
claude                       # Claude Code 실행
```

화면에 프롬프트(`>` 또는 입력창)가 뜨면 다음 단계로.

---

## 3. 첫 명령 — 부트스트랩 (한 번만)

아래를 **그대로 복사해서 Claude Code에 붙여넣기**:

```
docs/handoff/ 폴더의 모든 .md 파일을 먼저 읽어줘.
- README.md, 00_OVERVIEW.md, 01_TOKENS.md, 02_COMPONENTS.md,
  03_SCREENS.md, 04_MIGRATION_MAP.md, 05_INTERACTIONS.md,
  06_API_CONTRACT.md, 07_PR_PLAN.md, 08_PROMPTS.md

그 다음 이 레포의 현재 상태를 분석해줘:
1) 디렉토리 구조 (src/, components/, screens/, navigation/ 위치)
2) package.json의 react-native, react-navigation, reanimated 버전
3) 이미 정의된 토큰/테마 파일이 있는지
4) 이미 존재하는 화면 컴포넌트 목록과 라우트 이름

분석 결과를 토대로 PR-01 (디자인 토큰 + ui/ 14개 컴포넌트) 작업 계획을
파일별로 정리해줘. 코드 작성은 내 승인 후에만.
```

→ Claude Code가 레포를 읽고 작업 계획을 보여줍니다. **검토하고 OK 하면** 다음 단계.

---

## 4. PR-01부터 순서대로 진행

### PR-01 명령

```
PR-01을 진행해줘.

작업 범위:
1) src/theme/tokens.ts 생성 — docs/handoff/01_TOKENS.md 정의 그대로
2) src/components/ui/ 디렉토리에 14개 컴포넌트 빈 구현
   (AppBar, Pill, Avatar, BottomTab, Screen, Chip, Hairline, Tabs,
    IconButton, ListRow, Sheet, Switch, MannerBadge, LogoMark)
3) src/components/ui/icons.tsx — react-native-svg로 12개 아이콘
4) 기존 코드는 0줄 수정

완료 후 git diff로 변경사항 보여주고, 어떤 명령으로 검증할지 알려줘.
```

### PR-02 명령

```
PR-01이 머지됐다고 가정. 이제 PR-02를 진행해줘.

작업 범위:
1) src/navigation/UnitV2Stack.tsx 생성
2) docs/handoff/03_SCREENS.md의 36개 라우트를 placeholder로 등록
3) 기존 RootStack에 UnitV2 한 줄만 추가
4) src/navigation/types.ts에 RootStackParamList 정의

완료 후 git diff와 검증 방법.
```

### PR-03 ~ PR-14 명령 패턴

PR마다 동일한 형식:

```
PR-{번호}를 진행해줘.

해야 할 일은 docs/handoff/07_PR_PLAN.md의 PR-{번호} 항목 그대로.
화면 사양은 docs/handoff/03_SCREENS.md,
인터랙션은 docs/handoff/05_INTERACTIONS.md,
API는 docs/handoff/06_API_CONTRACT.md,
HTML→RN 변환 규칙은 docs/handoff/04_MIGRATION_MAP.md를 따라줘.

제약:
- 기존 코드 0줄 수정 (PR-11 이상이면 어댑터 패턴 사용)
- 토큰·ui/ 컴포넌트만 사용. 직접 hex나 px값 박지 말 것
- 라우트 이름·컴포넌트 이름 절대 변경 금지

완료 후 git diff, 변경 파일 트리, 검증 방법, 다음 PR과의 약속을 정리해줘.
```

각 PR마다 `{번호}`만 바꿔서 14번 반복.

---

## 5. 작업 중 자주 쓰는 명령

### 막혔을 때

```
{화면명} 작업 중 {이슈} 때문에 막혔어.
docs/handoff/03_SCREENS.md의 해당 화면 사양과
docs/handoff/05_INTERACTIONS.md의 디테일을 다시 읽고
원인과 해결책 3가지를 제시해줘. 코드 변경은 내 승인 후.
```

### 코드 리뷰

```
방금 작성한 src/screens/v2/{파일} 코드를 리뷰해줘.
체크 포인트:
- docs/handoff/04_MIGRATION_MAP.md의 "자주 빠뜨리는 것" 7개 항목
- 토큰 미사용 (직접 #xxx 박은 곳)
- 키보드 처리 / 빈 상태 / 에러 상태 누락
- useEffect cleanup 누락
- hitSlop 누락
```

### 전체 진행 상황

```
docs/handoff/07_PR_PLAN.md의 16개 PR 중 지금까지 완료된 게 어디까지고,
다음에 뭘 해야 하는지 한 줄 요약으로 알려줘.
```

### 화면 1개 다시 만들기 (디자인 변경 시)

```
{화면명}의 디자인을 다음과 같이 변경하고 싶어:
- {변경사항 1}
- {변경사항 2}

docs/handoff/03_SCREENS.md의 해당 화면 사양을 먼저 업데이트한 뒤,
src/screens/v2/{파일}을 수정해줘.
```

---

## 6. 막히지 않게 하는 팁

1. **한 번에 하나의 PR만** — Claude Code에 "PR-03이랑 PR-04 같이 해줘" 금지
2. **항상 git diff 먼저** — 코드를 보고 머지 결정
3. **feature flag 토글로 검증** — PR-11 이후는 `flags.unitV2.{도메인}` 켜고 끄면서 둘 다 정상인지 확인
4. **막히면 사양으로 돌아가기** — md 파일을 다시 읽으라고 명령
5. **"기존 코드 건드리지 마"** — PR-01~10에서는 절대 통하는 마법의 문구

---

## 7. 5초 요약

```
1. handoff/ 폴더를 RN 레포의 docs/ 안에 복사
2. cd <RN레포> && claude
3. 부트스트랩 프롬프트 붙여넣기 (위 3번)
4. PR-01부터 순서대로 14번 반복 (위 4번 패턴)
```

끝.
