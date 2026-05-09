# UNIT — React Native 병합 핸드오프

> 이 폴더는 HTML/React 프로토타입(현재 프로젝트)을 기존 RN 코드베이스에 충돌 없이 병합하기 위한 모든 사양을 담는다.
> Claude Code에 통째로 넘기면 PR 단위로 작업이 가능하도록 구조화돼 있다.

## 0. 핵심 원칙

1. **라우트 이름·컴포넌트 이름 보존** — 기존 RN에서 호출하던 시그니처는 절대 바꾸지 않는다.
2. **토큰·공통 컴포넌트부터** — 화면을 옮기기 전에 토큰(`tokens.ts`)과 ui/ 14개 컴포넌트를 먼저 만든다.
3. **신규 화면 → 기존 교체 순서** — 신규 라우트(인증/매너/검색/모더레이션/설정)는 즉시 추가, 기존 화면(피드/강의평/채팅)은 마지막에 어댑터를 두고 교체.
4. **PR 1개 = 화면 1개** — 디프 작게, 리뷰 가능하게.
5. **`src/components/v2/` 임시 네임스페이스** — 기존 컴포넌트와 같은 이름이면 v2/에 두고 한 화면씩 정식 승격.

## 1. 폴더 구조

```
docs/handoff/
├── 00_OVERVIEW.md            ← 이 파일
├── 01_TOKENS.md              ← 색상·타이포·간격·반경 토큰
├── 02_COMPONENTS.md          ← AppBar·Pill·Avatar 등 14개 공통 컴포넌트 사양
├── 03_SCREENS.md             ← 화면 36개 라우트·props·API·상호작용 사양
├── 04_MIGRATION_MAP.md       ← HTML→RN 1:1 치환 규칙
├── 05_INTERACTIONS.md        ← 토글·시트·키보드 등 상호작용 디테일
├── 06_API_CONTRACT.md        ← REST + 소켓 이벤트 스키마
├── 07_PR_PLAN.md             ← 16개 PR 순서·범위·체크리스트
└── 08_PROMPTS.md             ← Claude Code에 붙여넣을 프롬프트
```

## 2. 화면 인벤토리 (전체 36개)

| 섹션 | 화면 수 | 라우트 | 우선순위 |
|---|---|---|---|
| 인증/온보딩 | 5 | Splash, SchoolSelect, Login, EmailVerify, ProfileSetup | P0 |
| 피드 | 3 | Feed, PostDetail, Write | P0 |
| 캠퍼스 허브 | 6 | CampusHub, Timetable, Meal, Bus, Library, Contacts | P1 |
| 학생 생활 | 4 | Contest, Jobs, Market, Friends | P1 |
| 채팅 | 2 | ChatList, ChatRoom | P1 |
| 강의평 | 3 | Courses, CourseDetail, CourseReview | P0 |
| 자치/알림/나 | 3 | Jury, Notifications, Profile | P0 |
| 검색/내 활동 | 4 | Search, MyPosts, MyComments, Scraps | P1 |
| 소셜/모더레이션 | 5 | OtherProfile, FriendRequests, Report, Block, CommentThread | P1 |
| 설정 | 3 | Settings, NotificationSettings, AccountSettings | P2 |
| 캠퍼스 심화 | 4 | MarketWrite, MarketDetail, JobDetail, ContestDetail | P2 |
| 매너 학점 | 2 | MannerGrade, MannerLadder | P0 |
| **합계** | **36** | | |

## 3. 작업 순서 (요약)

```
PR-01  토큰 + ui/14개            ← 비파괴 (충돌 0)
PR-02  네비게이션 스택 추가      ← 라우트 등록만
PR-03  매너 학점 (2)             ← 신규
PR-04  인증/온보딩 (5)           ← 신규
PR-05  검색·내 활동 (4)          ← 신규
PR-06  모더레이션 (5)            ← 신규
PR-07  설정 (3)                  ← 신규
PR-08  캠퍼스 허브 (6)           ← 신규
PR-09  캠퍼스 심화 (4)           ← 신규
PR-10  학생 생활 (4)             ← 신규
─── 여기까지 신규만, 기존 코드 0줄 수정 ───
PR-11  배심원 + 알림 + 프로필    ← 기존이면 어댑터로 교체
PR-12  강의평 3종 교체            ← 어댑터 필요
PR-13  채팅 2종 교체              ← 소켓 어댑터
PR-14  피드 3종 교체              ← 마지막. 가장 위험
PR-15  v2/ 정식 승격
PR-16  레거시 정리 + 다크모드 토큰 적용
```

세부는 `07_PR_PLAN.md` 참조.

## 4. 안전망

- **Storybook(또는 Expo Router preview 화면)에 화면별 스토리** — 화면 1개 옮길 때마다 스토리 1개. 시각 회귀 확인용.
- **Feature flag** — `flags.unitV2.feed = true/false`로 신·구 화면 토글. 문제 생기면 즉시 롤백.
- **타입 우선** — 모든 props/api 응답은 `src/types/unit.ts`에 정의 후 화면에서 import.

## 5. 절대 하지 말 것

- ❌ 기존 컴포넌트 즉시 덮어쓰기 (반드시 v2/ 거쳐서 승격)
- ❌ HTML의 `text-[14.5px]` 같은 0.5단위 폰트 그대로 옮기기 → 정수화
- ❌ NativeWind 도입 (기존 StyleSheet과 섞이면 디버깅 지옥)
- ❌ ScrollView 안에 FlatList 넣기
- ❌ 한 PR에 화면 2개 이상 묶기
