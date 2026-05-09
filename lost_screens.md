# UNIT 빠진 화면 정리 (lost_screens.md)

> 현재 [unit-mobile/](unit-mobile/) 에는 23개 화면이 변환되어 있지만, 실제 앱 출시를 위해서는
> 인증·검색·내 활동·모더레이션·설정·심화 기능 화면들이 추가로 필요합니다.
> 이 문서는 빠진 화면 21개를 우선순위별로 정리하고, 각 화면마다
> (1) 화면 역할 (2) 필수 UI 요소 (3) Claude Design 프롬프트를 제공합니다.

---

## 0. 디자인 시스템 (모든 화면 공통)

> 아래 토큰은 모든 Claude Design 프롬프트에 reference로 포함됩니다.
> 기존 17개 웹 화면(`web-source/*.jsx`)의 시각 언어와 1:1 일치해야 합니다.

```
색상
  navy   #000080  primary, FAB, focus
  mint   #1F7A5C  trust 배지
  coral  #B73E37  warning, 신고 카운트, 비추천
  cream  #FAF8F4  alt background
  ink    #111111  본문 텍스트
  body   #374151  본문 보조
  meta   #6B7280  메타 텍스트
  hint   #9CA3AF  힌트, 비활성
  hair   #E5E7EB  hairline divider
  hair2  #F0F0F0  soft hairline
  surf   #F3F4F6  표면 강조
  surf2  #F9FAFB  active background

폰트   Pretendard Variable (Regular 400 / Medium 500 / SemiBold 600 / Bold 700)
간격   4pt 베이스 (Tailwind 기본)
라운드 rounded-md=6, lg=8, xl=12, full=9999
밀도   여백 적게, 헤어라인 디바이더 위주, 큰 카드 지양
톤     한국 대학생 익명 커뮤니티 — 정보 밀도 높고 차분, 장식 최소화
```

---

## 우선순위 / 카테고리 요약

| Tier | 카테고리 | 화면 수 |
|---|---|---|
| **A** 출시 필수 | 인증 & 온보딩 | 5 |
| **B** 핵심 기능 완성 | 검색 + 내 활동 | 4 |
| **C** 사회적 기능 | 소셜 + 모더레이션 | 5 |
| **D** 시스템 | 설정 & 계정 | 3 |
| **E** 캠퍼스 심화 | Market/Job/Contest 상세 | 4 |
| **합계** | | **21** |

---

# A. 인증 & 온보딩 (5)

## 1. SplashScreen — 앱 시작 스플래시

**화면 역할**
앱 첫 실행 시 1.2초 동안 보이는 로고 화면. 폰트/리소스 사전 로딩 동안 노출.

**진입 경로**
앱 cold start → 자동 표시 → SchoolSelectScreen (첫 진입) 또는 FeedScreen (로그인 상태 복원).

**필수 UI 요소**
- 화면 정중앙: `UNIT` 워드마크 (Pretendard Bold, 64px, letter-spacing -2px, navy)
- 워드마크 아래 12px 간격: 태그라인 `내 학교 안의 진짜 이야기` (13px, meta)
- 화면 하단 16% 위치: `© 2026 UNIT` (11px, hint)
- 배경 흰색, 그림자/이미지/그라데이션 없음

**상태 / 인터랙션**
- 1.2s fade-in 후 0.3s fade-out하며 다음 화면으로 전환
- 폰트 로딩 미완료 시 시스템 폰트로 fallback (이미 [App.tsx](unit-mobile/App.tsx) 처리됨)

**Claude Design 프롬프트**
```
Design a mobile splash screen for UNIT, a Korean university campus community app.

Visual style: minimalist, white background, no imagery or gradients. Match the
density and tone of the existing FeedScreen — calm, high information density,
no decoration.

Required elements:
- Centered "UNIT" wordmark, Pretendard Bold 64px, color #000080 (navy),
  letter-spacing -2px, no logo icon
- 12px below wordmark: tagline "내 학교 안의 진짜 이야기" in #6B7280 (meta), 13px Regular
- Bottom 16% area: "© 2026 UNIT" in #9CA3AF (hint), 11px
- iOS-first: respect safe area top (notch) and bottom (home indicator)

Behavior: 1.2s display, fade-out to SchoolSelectScreen.
Output 390×844 (iPhone 15) and 412×915 (Android) variants.
```

---

## 2. SchoolSelectScreen — 학교 선택

**화면 역할**
첫 진입 시 사용자가 자기 학교를 고른다. 4개 학교 (인하대/아주대/서울대/연세대) + 검색.

**진입 경로**
SplashScreen → 자동. 또는 ProfileEdit에서 학교 변경 시.

**필수 UI 요소**
- AppBar: 좌측 X (취소, 첫 진입 시는 숨김), 중앙 타이틀 `학교 선택`
- 검색 입력창 (`학교명 또는 도메인 검색`, h-10 surf 배경 rounded-lg)
- 인기 학교 4개 카드 — 이미지(Google s2 favicon) + 학교명 + 도메인
  - 인하대학교 inha.ac.kr
  - 아주대학교 ajou.ac.kr
  - 서울대학교 snu.ac.kr
  - 연세대학교 yonsei.ac.kr
- 카드 행: 56px 높이, 이미지 36×36 rounded-md + 학교명 SemiBold 15px + 도메인 meta 12px
- 안내 문구 하단: `학교 이메일로 인증한 학생만 가입할 수 있어요` (11.5px, hint)

**상태 / 인터랙션**
- 검색 입력 시 실시간 필터 (200ms debounce)
- 학교 카드 탭 → LoginScreen으로 이동 (선택한 학교 정보 props)
- 검색 결과 0건일 때: `다른 학교는 곧 추가될 예정이에요` 안내

**Claude Design 프롬프트**
```
Design a school-select screen for UNIT (Korean university community app, iOS-first).

Style: white background, hairline dividers, no large images. Match the visual
weight of existing CoursesScreen list rows.

Required:
- Top: AppBar with "학교 선택" title (Pretendard SemiBold 17px, ink #111),
  divider hairline #E5E7EB. No leading button on first launch.
- Search input below AppBar: 40px tall, bg #F3F4F6, rounded-lg, search icon left,
  placeholder "학교명 또는 도메인 검색" in #9CA3AF, 13.5px.
- Section label: "인기 학교" (11.5px Medium, #9CA3AF, uppercase letter-spacing 0.5).
- 4 school rows (인하대학교 inha.ac.kr, 아주대학교 ajou.ac.kr, 서울대학교 snu.ac.kr,
  연세대학교 yonsei.ac.kr): 56px tall each, 36×36 favicon left (rounded-md),
  school name SemiBold 15px ink, domain Regular 12px meta. Hairline #F0F0F0
  between rows. active:bg-#F9FAFB.
- Bottom hint: "학교 이메일로 인증한 학생만 가입할 수 있어요" (11.5px, #9CA3AF),
  centered, 24px from bottom safe area.

Tokens: navy #000080, ink #111, meta #6B7280, hint #9CA3AF, hair #E5E7EB,
hair2 #F0F0F0, surf #F3F4F6.
Font: Pretendard.

Output the layout and one filled state (search query "인하" with 1 match).
```

---

## 3. LoginScreen — 학교 이메일 로그인

**화면 역할**
선택한 학교의 이메일(`@<domain>` 강제)과 비밀번호로 로그인. 신규는 가입 플로우로 분기.

**진입 경로**
SchoolSelectScreen → 학교 선택 후 자동. 로그아웃 후에도 동일.

**필수 UI 요소**
- AppBar: 좌측 ← (SchoolSelectScreen으로), 타이틀 `로그인`
- 선택한 학교 hero (작은 favicon 24px + 학교명 14px Medium body, 학교 변경 hyperlink navy 12.5px)
- 이메일 input — placeholder `학번@inha.ac.kr` (도메인 자동 suffix), 글자색 ink, 라벨 위에 `학교 이메일` 11.5px hint
- 비밀번호 input — secure, 우측 눈 아이콘 표시/숨김 toggle
- 비밀번호 잊음 / 비밀번호 재설정 텍스트 버튼 (12.5px navy)
- CTA `로그인` — h-12 rounded-lg, navy 배경, 흰 글자 SemiBold 15px. disabled 시 surf 배경 + hint 글자
- 가입 안내 하단: `학교 이메일이 있는데 처음이세요? 회원가입` (회원가입 부분만 navy underline)

**상태 / 인터랙션**
- 이메일 도메인 자동 강제 — `@inha.ac.kr` 부분 회색 고정 텍스트로 표시
- 비밀번호 8자 미만 시 CTA disabled
- 인증 실패 시 input 아래 coral 11.5px 에러 메시지

**Claude Design 프롬프트**
```
Design a login screen for UNIT, restricted to verified university emails.

Style: form-focused, plenty of vertical padding (py-6), white surface, hairlines
between sections. Match the density of WriteScreen's form rows.

Required:
- AppBar with back arrow + "로그인" title.
- Selected school hero: 24×24 favicon + school name (Pretendard Medium 14px, ink),
  trailing "학교 변경" link (Regular 12.5px, navy #000080).
- Email field group:
  - Label "학교 이메일" (11.5px hint #9CA3AF) above input
  - Input row: editable username left + fixed grey "@inha.ac.kr" suffix right
    (suffix #9CA3AF, not editable, baseline aligned)
  - 1.5px bottom border #E5E7EB, focus state navy underline
  - 14.5px input text, ink color
- Password field group:
  - Label "비밀번호"
  - Secure input, eye-icon toggle right (20px, color #6B7280)
  - Same border style
- Below password: small "비밀번호를 잊으셨나요?" link, 12.5px navy, right-aligned
- CTA "로그인" button: full-width 48px, rounded-lg, bg navy / disabled bg #F3F4F6
  (text white SemiBold 15px / disabled hint #9CA3AF). Disabled when password < 8 chars.
- 24px gap, then footer text "학교 이메일이 있는데 처음이세요? 회원가입"
  ("회원가입" segment in navy underline). Centered, 13px.

Error state mock: under email input, "이미 가입된 이메일이에요" in #B73E37 (coral)
11.5px Medium with a small alert dot.

Tokens: navy #000080, ink #111, body #374151, meta #6B7280, hint #9CA3AF,
hair #E5E7EB, surf #F3F4F6, coral #B73E37. Font: Pretendard.
```

---

## 4. EmailVerifyScreen — 학교 이메일 코드 인증

**화면 역할**
회원가입 시 학교 이메일로 발송된 6자리 코드 입력. 5분 타이머 + 재발송.

**진입 경로**
LoginScreen 회원가입 링크 → 이메일 입력 → 코드 발송 → 이 화면.

**필수 UI 요소**
- AppBar: ← 닫기, 타이틀 `이메일 인증`
- 안내 hero (px-5 pt-6):
  - `<email>로 인증 코드를 보냈어요` (15px Medium ink)
  - `5분 안에 입력해주세요. 받은편지함과 스팸함을 확인해주세요.` (12.5px body)
- 6칸 코드 입력 (각 칸 44×52, gap-2, surf 배경 rounded-lg, focus 시 navy 1.5px border)
- 타이머: `04:32 남음` (12.5px meta, 코드 입력 영역 아래 16px 간격)
- 재발송 버튼: 텍스트 `이메일 다시 받기` (13px navy Medium), 30초 쿨다운 시 `30초 후 재발송 가능` (hint)
- 안내 하단: `이메일이 안 와요?` 펼침 영역 (FAQ 3-4개)

**상태 / 인터랙션**
- 6칸 자동 다음 칸 포커스 이동
- 6자리 모두 입력 시 자동 검증 trigger
- 검증 성공 → ProfileSetupScreen
- 검증 실패 → 코드 칸 전체 coral 1.5px border + `코드가 일치하지 않아요` 에러
- 5분 타이머 끝나면 코드 만료 안내 + 재발송 강조

**Claude Design 프롬프트**
```
Design an email verification screen for UNIT — 6-digit code entered in 6 separate
boxes, with timer and resend.

Style: focused single-task screen, generous vertical spacing, calm tone.

Required:
- AppBar: leading X (close), title "이메일 인증" SemiBold 17px ink.
- Hero block (px-5 pt-6, py-2 between lines):
  - Line 1: "<student@inha.ac.kr>로 인증 코드를 보냈어요" (Medium 15px ink)
  - Line 2: "5분 안에 입력해주세요. 받은편지함과 스팸함을 확인해주세요." (Regular 12.5px body #374151, leading-1.6)
- 6 OTP boxes, centered horizontally:
  - Each box 44×52, rounded-lg, bg #F3F4F6, focus-state border 1.5px navy
  - Number is Pretendard SemiBold 22px ink, font-mono
  - Gap between boxes: 8px
- Timer below boxes (mt-4): "04:32 남음" Pretendard Medium 12.5px meta #6B7280, font-mono
- "이메일 다시 받기" link button: 13px navy Medium, mt-3, centered. Disabled state
  shows "30초 후 재발송 가능" in hint.
- Bottom expandable section "이메일이 안 와요?" (chevron right) listing 3 FAQs:
  - 스팸/정크 메일함 확인
  - 이메일 주소 오타 확인
  - 다른 학교 도메인 사용 시 안내
  Each FAQ collapsed, tap to expand. Section: 13px Medium ink + 12px Regular meta
  for body when expanded.

Error state: all 6 boxes get coral #B73E37 1.5px border, label below
"코드가 일치하지 않아요. 다시 입력해주세요." (12.5px Medium coral).

Tokens: navy #000080, ink #111, body #374151, meta #6B7280, hint #9CA3AF,
surf #F3F4F6, coral #B73E37.
```

---

## 5. ProfileSetupScreen — 학번/학과/닉네임 등록

**화면 역할**
이메일 인증 후, 닉네임·학번·학과를 등록해 가입 완료.

**진입 경로**
EmailVerifyScreen 성공 → 자동.

**필수 UI 요소**
- AppBar: 타이틀 `프로필 설정` (← 없음, 가입 완료까지 강제)
- 진행 표시 인디케이터: 점 3개 — 인증/프로필/완료 (현재는 2번째)
- 닉네임 input + `중복확인` 인라인 버튼 (h-10 navy outline)
- 닉네임 유효성: 2~10자, 한글/영문/숫자만. 위반 시 coral 텍스트
- 학과 선택 (탭하면 BottomSheet으로 학과 리스트, 검색 가능)
- 학번 선택 (드롭다운 또는 휠 picker, 18~26 범위)
- 익명 기본 선언: `기본은 익명으로 표시돼요. 닉네임 노출은 선택 사항입니다.` (12px hint)
- 약관 체크리스트 (필수/선택 구분):
  - [필수] 만 14세 이상입니다
  - [필수] 이용약관 (링크)
  - [필수] 개인정보처리방침 (링크)
  - [선택] 마케팅 정보 수신
  - 전체동의 toggle 상단
- 하단 CTA `가입 완료` — 모든 필수 충족 시 활성화

**상태 / 인터랙션**
- 닉네임 중복 검사: 통과 시 mint check + `사용 가능한 닉네임` 메시지
- 학과 BottomSheet — 검색 input + 스크롤 리스트 + 선택 시 닫힘
- 학번 picker — iOS는 wheel, Android는 dropdown
- 가입 완료 → FeedScreen으로 navigate, splash 짧게 환영 토스트

**Claude Design 프롬프트**
```
Design a profile-setup form screen for UNIT new user signup. After email
verification, user picks nickname, department, and student ID year.

Style: form with sections separated by hairlines (#F0F0F0). White surface.
Tone: helpful and clear, not overwhelming.

Required:
- AppBar: title "프로필 설정" centered, no back button (forced flow).
- Progress dots: 3 small dots, navy filled for current (2nd), hint outlined for others.
  Above the form, centered, with "이메일 인증 · 프로필 · 완료" labels in 11px hint
  beneath the dots.
- Section "닉네임":
  - Label 11.5px hint above input
  - Input row: editable text + inline button "중복확인" right (h-10 navy outline,
    rounded-md, 12.5px Medium navy text)
  - Helper line below: "2~10자, 한글/영문/숫자만 사용할 수 있어요"
    (11.5px hint normally; mint #1F7A5C with check icon when verified;
    coral #B73E37 when invalid)
- Section "학과" (tap to open bottom sheet picker):
  - Looks like a row with chevron right, 14px ink for selected, 12.5px hint
    "선택해주세요" when empty
- Section "학번":
  - Same chevron pattern, value shown like "22학번"
- Anonymous notice block (bg #FAF8F4, p-3, rounded-lg, mt-4):
  - 12px body, leading-1.7, "기본은 익명으로 표시돼요. 닉네임 노출은 선택 사항입니다."
- Terms checklist (mt-4, divide-y #F0F0F0):
  - Master "전체동의" row at top (Pretendard SemiBold 14px ink)
  - Then 5 rows: [필수] 만 14세 이상 / [필수] 이용약관 / [필수] 개인정보처리방침 /
    [선택] 마케팅 정보 수신. Each row: small navy box checkbox left, text 13.5px ink,
    링크인 경우 chevron right + tap → modal.
  - "필수" 태그: navy Pill h-[18px] px-1.5 text-[10px] SemiBold; "선택" tag: hint Pill same.
- Bottom CTA "가입 완료" (h-12 rounded-lg, navy bg / disabled #F3F4F6, white SemiBold 15.5px).
  px-4 pb-6.

BottomSheet for 학과 picker: top handle bar 36×4 hint rounded, search input,
scrollable list of 50+ departments, sectioned alphabetically. Selected row:
left navy check icon. Cancel button top-right, 13px navy.

Tokens: navy #000080, mint #1F7A5C, coral #B73E37, ink #111, body #374151,
meta #6B7280, hint #9CA3AF, hair #E5E7EB, hair2 #F0F0F0, surf #F3F4F6, cream #FAF8F4.
```

---

# B. 검색 + 내 활동 (4)

## 6. SearchScreen — 통합 검색

**화면 역할**
게시글/강의/장터/사용자 통합 검색. AppBar 검색 아이콘 탭 시 진입.

**진입 경로**
FeedScreen / CoursesScreen / MarketScreen / ContactsScreen 등 거의 모든 검색 아이콘.

**필수 UI 요소**
- AppBar: 좌측 ← / 검색 input (auto-focus, h-10 surf rounded-lg, X 클리어 버튼)
- 검색 전 상태:
  - 최근 검색어 (최대 8개) — 칩 가로 스크롤. 각 칩 우측 X로 개별 삭제. 우측 끝에 `전체 삭제`
  - 인기 검색어 (1~10위) — 1행 1단어, 순위 숫자 navy SemiBold 15px font-mono + 단어 + 변동 (↑3, ↓1, NEW)
- 검색 후 상태:
  - 가로 스크롤 필터 칩: `전체 / 게시글 / 강의 / 장터 / 사용자`
  - 결과 그룹: 각 그룹 헤더 (예: `게시글 234건`) + 상위 3개 + `더보기` 행
  - 각 그룹 결과는 해당 화면의 row 패턴 재사용 (PostCard, CourseRow 등)

**상태 / 인터랙션**
- 입력 200ms debounce → 검색 실행
- 빈 결과: "`{query}`에 대한 결과가 없어요" + 추천 검색어 3개
- 결과 행 탭 → 해당 detail 화면으로 navigate

**Claude Design 프롬프트**
```
Design a unified search screen for UNIT — searches posts/courses/market/users.

Style: minimal AppBar dominated by search input, white surface, results in
existing list patterns. Match how iOS Reddit/Naver Cafe search behaves.

Required:
- AppBar slot replaced by search bar:
  - Leading back arrow (22px ink)
  - Search input expands to fill: h-10 rounded-lg bg #F3F4F6, search icon left
    (18px #9CA3AF), placeholder "통합 검색" in #9CA3AF 13.5px, X clear icon right
    when input has text
  - Trailing optional cancel button "취소" 13px navy
- Empty state (no query):
  - Section "최근 검색어": horizontal scroll of chip pills, each pill is
    h-7 px-3 rounded-full bg-#F3F4F6 text-[12.5px] body, with X icon (10px hint)
    after the text. End of row: "전체 삭제" (12px hint) tap.
  - Section "인기 검색어": vertical list, 10 rows, each row 40px tall:
    rank number 15px SemiBold navy font-mono left (w-7), keyword 14px ink Medium,
    trend tag right ("↑3" mint / "↓1" coral / "NEW" navy Pill).
- Active state (with query):
  - Sticky filter chips row directly below search bar: 5 chips horizontally
    scrollable, selected chip navy bg + white text Bold; unselected #F3F4F6 bg + meta text.
  - Below: result groups (only those with matches), each:
    - Group header row: "게시글 234건" 13.5px ink SemiBold + "더보기" trailing 12.5px navy.
    - Up to 3 result rows, then divider.
    - Result row patterns reuse existing screen row designs:
      - 게시글: like FeedScreen post card, but one-line title only
      - 강의: like CoursesScreen list row
      - 장터: like MarketScreen item row
      - 사용자: avatar + nick + dept + 친구추가 button
  - Highlight matched substring in title with navy SemiBold (others ink Regular).
- Empty result state: "{query}에 대한 결과가 없어요" centered, 14px hint,
  with 3 suggested chips below ("추천 검색어").

Tokens: navy #000080, mint #1F7A5C, coral #B73E37, ink #111, meta #6B7280,
hint #9CA3AF, hair #E5E7EB, hair2 #F0F0F0, surf #F3F4F6.
```

---

## 7. MyPostsScreen — 내가 쓴 글

**화면 역할**
프로필에서 진입. 내가 작성한 게시글 목록.

**진입 경로**
ProfileScreen → "내 활동" 메뉴 행 → MyActivityScreen에서 탭 또는 직접 진입.

**필수 UI 요소**
- AppBar: ← + `내가 쓴 글` + 카운트 뱃지 (예: 18)
- 정렬 토글 행: `최신순 / 인기순` (segmented control 또는 underline tab)
- FlatList — FeedScreen의 PostCard와 동일한 패턴
- 빈 상태: "아직 쓴 글이 없어요" + 글쓰기 CTA

**상태 / 인터랙션**
- Pull-to-refresh
- 카드 길게 누르기: `삭제` 액션 시트
- 삭제 확인 모달

**Claude Design 프롬프트**
```
Design "My posts" screen showing the user's own posts (Korean campus app).

Style: identical row pattern to FeedScreen post cards. White background with
#F4F5F7 list area between cards.

Required:
- AppBar: back arrow + "내가 쓴 글" title + count badge (e.g. "18") in cobalt
  Pill at right.
- Row of two segmented buttons: "최신순" | "인기순". Selected tab has navy
  underline 2.5px, ink SemiBold 14.5px text; unselected hint Regular text.
- FlatList of post cards (reuse FeedScreen card pattern: board pill + nick·time,
  title 16px SemiBold ink, body 13.5px body line-clamp-2, footer with thumb/cmt/scrap counts).
- Long-press a card → action sheet from bottom: "삭제" (coral) / "취소".
- Empty state: centered illustration-free message "아직 쓴 글이 없어요" 14px hint
  + a small "글쓰기" CTA button (h-10 rounded-md navy SemiBold 13.5px white).

Pull-to-refresh: standard iOS-style with spinner.

Tokens: navy #000080, ink #111, body #374151, meta #6B7280, hint #9CA3AF,
hair #E5E7EB, list-bg #F4F5F7, coral #B73E37 for destructive.
```

---

## 8. MyCommentsScreen — 내가 쓴 댓글

**화면 역할**
내가 단 댓글 목록 + 원본 글 컨텍스트로 점프.

**필수 UI 요소**
- AppBar: ← + `내가 쓴 댓글` + 카운트
- 행 구조: 상단 회색 영역(원본 글 board + 제목 한 줄, line-clamp-1, 12.5px meta), 하단 흰 영역(내 댓글 본문 13.5px body, 시각·추천수)
- 행 탭 → 해당 PostDetail 화면 + 댓글 위치로 자동 스크롤
- 빈 상태: "아직 쓴 댓글이 없어요"

**Claude Design 프롬프트**
```
Design "My comments" list screen.

Each row has two visual layers: a thin grey context band (the parent post
preview) and a white main band (my comment body).

Required:
- AppBar: back arrow + "내가 쓴 댓글" + count Pill.
- Each list row, 100~120px tall, separator hairline #F0F0F0 between rows:
  - Top context band (h-7 bg #F8F9FA px-4 flex-row items-center gap-1.5):
    - Pill tone="plain" with board name (e.g. "자유")
    - 11.5px meta one-line truncated parent post title
  - Bottom main band (px-4 py-3 bg white):
    - My comment body, 13.5px body, line-clamp-2, leading-1.55
    - Footer row (mt-1.5): time 11.5px hint + thumb icon + count meta + chevron right hint
  - active:bg-#F9FAFB
- Tap row → PostDetail with auto-scroll to comment.
- Empty state same pattern as MyPostsScreen.

Tokens: navy #000080, ink #111, body #374151, meta #6B7280, hint #9CA3AF,
hair2 #F0F0F0.
```

---

## 9. ScrapsScreen — 스크랩 / 북마크

**화면 역할**
스크랩한 게시글/강의/공모전/알바 통합 보기. 4탭.

**필수 UI 요소**
- AppBar: ← + `스크랩` + 우측 더보기(편집/일괄삭제)
- 탭 4개: `게시글 23` / `강의 6` / `공모전 4` / `알바 2`
- 각 탭은 해당 도메인의 row 패턴 재사용
- 편집 모드: 좌측 체크박스 + 하단 sticky `삭제 (3)` 빨간 바

**Claude Design 프롬프트**
```
Design "Scraps/Bookmarks" multi-tab screen for UNIT.

Required:
- AppBar: back + "스크랩" + trailing "편집" text button (12.5px navy).
- Tab row (sticky h-11): 4 underline tabs "게시글" "강의" "공모전" "알바", each
  shows a count next to label (12px hint). Selected: ink SemiBold + 2px navy bar at bottom.
- Tab content reuses existing list patterns:
  - 게시글: FeedScreen card style
  - 강의: CoursesScreen row (without quick vote buttons)
  - 공모전: ContestScreen card grid (2 cols)
  - 알바: JobsScreen list row
- Edit mode (toggled by AppBar "편집"):
  - Each row gains a 22px circle checkbox on the left (navy fill when selected)
  - Bottom sticky bar appears: full-width h-12 coral bg, white text "삭제 (3)" SemiBold 14.5px
  - AppBar trailing changes to "취소"
- Empty state per tab: "스크랩한 {x}이 없어요" 14px hint + small CTA "둘러보기" navy.

Tokens: navy #000080, coral #B73E37, ink #111, meta #6B7280, hint #9CA3AF.
```

---

# C. 소셜 + 모더레이션 (5)

## 10. OtherProfileScreen — 다른 학생 프로필

**화면 역할**
게시글/댓글/채팅에서 닉네임 탭 시 진입. 매너 학점, 작성글 수, 친구추가 버튼.

**진입 경로**
PostDetail 글쓴이 닉네임 탭, ChatRoom 헤더 탭, FriendsScreen 행 탭.

**필수 UI 요소**
- AppBar: ← + 우측 더보기(차단/신고)
- Hero (`ProfileScreen` 와 같은 톤이지만 본인이 아니라 줄임):
  - 56px 아바타 + 닉네임 SemiBold 17px + 매너 등급 배지 (작은 outline)
  - 학과 · 학번 (12.5px meta)
  - 우측: `친구추가` / `신청 중` / `친구 ✓` 상태별 button (h-9 rounded-md)
- 활동 통계 3분할: `작성 18 / 댓글 124 / 받은 추천 326` (font-mono)
- 매너 학점 카드 (간단판: A0 + score / 100 + 등급명)
- 익명으로 작성한 글은 표시되지 않음 안내 (12px hint)
- 작성한 공개 글 미리보기 (최근 5개) — 행 탭 시 PostDetail
- 1:1 익명 메시지 보내기 CTA (h-12 navy outline rounded-lg)

**Claude Design 프롬프트**
```
Design "Other user profile" screen, viewed when tapping a nickname elsewhere
in the app.

Style: similar to ProfileScreen but compact (no settings, no menu list). Cream
background section for hero, white for content.

Required:
- AppBar: back + trailing more icon (3-dot, opens action sheet "차단" / "신고하기" / "취소").
- Hero block (px-5 pt-4 pb-5 bg #FAF8F4 border-b #F0F0F0):
  - Row: 56px avatar + name area (1-line: name SemiBold 17px ink + manner-grade
    badge 22×22 outline rounded with grade text inside) + dept·year line 12.5px meta
  - Bottom-right: friend-action button (h-9 rounded-md, three states):
    - "친구추가": navy bg, white SemiBold 12.5px
    - "신청 중": #F3F4F6 bg, meta text
    - "친구": white bg + #E5E7EB border + check icon + body text
- Stats row (3 cols, mt-5 pt-4 border-t #F0F0F0):
  - "작성 18 / 댓글 124 / 받은 추천 326", same pattern as ProfileScreen
- Manner score mini-card (mt-3 mx-4 p-4 white rounded-xl border #F0F0F0):
  - "매너 학점" label 11.5px hint
  - Big "A0" 28px Bold colored to grade accent + "82 / 100" meta + "우수" body
- Hint (mt-3 px-5 12px hint): "익명으로 작성한 글은 표시되지 않아요"
- "최근 글" section header (mt-5 px-5 11.5px hint Medium)
- Up to 5 post preview rows reusing PostCard pattern (single-line title only).
- Bottom sticky CTA inside ScrollView footer (px-4 pb-6 pt-3 border-t #F0F0F0):
  - "1:1 익명 메시지 보내기" h-12 rounded-lg, white bg + navy 1.5px border,
    navy SemiBold 14.5px text. Disabled when blocked.

Tokens: navy, mint, coral, cream, ink, meta, hint, hair, hair2.
```

---

## 11. FriendRequestsScreen — 친구 요청 받은/보낸

**화면 역할**
받은 요청 수락/거절, 보낸 요청 취소.

**필수 UI 요소**
- AppBar: ← + `친구 요청` + 받은/보낸 카운트 (예: `받은 3 · 보낸 2`)
- 탭 2개: `받은 3` / `보낸 2`
- 받은 행: 아바타 + 이름·학과 + `수락` (navy primary) + `거절` (outline)
- 보낸 행: 아바타 + 이름·학과 + `취소` (outline)
- 빈 상태별 메시지

**Claude Design 프롬프트**
```
Design "Friend requests" screen with received/sent tabs.

Required:
- AppBar: back + "친구 요청" + small count "3·2" hint right.
- Tabs row sticky: "받은 3" / "보낸 2" (underline pattern, count in 12px hint after label).
- Row pattern (px-4 py-3 border-b #F0F0F0):
  - 42px avatar
  - Middle: name SemiBold 14px ink + dept Pretendard Regular 12px meta
  - Trailing two-button group (received tab):
    - "수락" h-8 px-3 rounded-md navy bg white text 12.5px SemiBold
    - "거절" h-8 px-3 rounded-md outline #E5E7EB body text
  - Trailing single button (sent tab):
    - "취소" h-8 px-3 rounded-md #F3F4F6 bg meta text
- Empty states:
  - 받은 tab: "받은 친구 요청이 없어요" + small "친구찾기" link to FriendsScreen
  - 보낸 tab: "보낸 친구 요청이 없어요"

Tokens: navy, ink, meta, hint, hair2, surf.
```

---

## 12. ReportScreen — 게시글/댓글/사용자 신고

**화면 역할**
공통 신고 모달. 대상 종류별로 사유 옵션이 달라짐.

**진입 경로**
PostDetail 더보기 → 신고. CommentRow 더보기 → 신고. OtherProfile 더보기 → 신고.

**필수 UI 요소**
- AppBar: X (취소) + `신고하기`
- 대상 미리보기 (회색 박스, line-clamp-3): "신고할 글: ..." 또는 "신고할 댓글" / "신고할 사용자"
- 사유 라디오 리스트 (대상별 다름):
  - 게시글/댓글: 욕설·비방 / 광고·홍보 / 음란물 / 허위 정보 / 도배 / 기타
  - 사용자: 부적절한 닉네임 / 사칭 / 욕설·괴롭힘 / 사기 의심 / 기타
- 추가 설명 textarea (200자, 선택)
- 안내: `신고는 같은 학과 학생 30명에게 검토를 요청해요. 무고 신고는 매너 점수가 차감돼요.`
- 하단 CTA `신고하기` — 사유 선택 시 활성

**Claude Design 프롬프트**
```
Design a "Report" modal screen reused for posts/comments/users.

Style: form-focused, calm warning tone (mostly neutral, only the CTA hints at
seriousness). Modal full-height presentation.

Required:
- AppBar: X close + "신고하기" SemiBold 17px ink + trailing empty.
- Target preview block (mx-5 mt-4 p-3 bg #F8F9FA rounded-lg):
  - Small label "신고할 글" / "신고할 댓글" / "신고할 사용자" (11.5px hint)
  - Body preview line-clamp-3, 13px body
- Section title (mt-5 px-5 11.5px Medium hint): "신고 사유"
- Radio list (mx-4):
  - Each option row: h-12 px-3 flex-row items-center gap-3, border-b hair2 between rows
  - Left: 18px circle radio (navy fill when selected, hint outline otherwise)
  - Text: 14px ink Medium when selected, 14px body when unselected
- Optional textarea (mt-5 mx-5):
  - Label "추가 설명 (선택)" 11.5px hint
  - Multi-line input min-h-[100px] bg #F8F9FA rounded-lg p-3.5 13.5px,
    placeholder "어떤 부분이 문제인지 알려주세요" #C9CDD3
  - Counter "0 / 200" 11px hint right-aligned mt-1
- Notice block (mt-4 mx-5 p-3 bg #FFF4EE rounded-lg border #FBE9E0):
  - 12px text #9A3412 leading-1.7:
    "신고는 같은 학과 학생 30명에게 검토를 요청해요.
     무고 신고는 매너 점수가 차감돼요."
- Bottom CTA (px-5 pb-6 pt-3 border-t #F0F0F0):
  - "신고하기" h-12 rounded-lg, navy bg / disabled #F3F4F6, white SemiBold 15px /
    hint disabled

Tokens: navy, coral, ink, body, meta, hint, hair2, surf, "warning bg #FFF4EE,
warning text #9A3412, warning border #FBE9E0".
```

---

## 13. BlockListScreen — 차단 목록

**화면 역할**
차단한 사용자 + 차단한 단어 관리.

**필수 UI 요소**
- AppBar: ← + `차단 목록`
- 탭 2개: `사용자 4` / `단어 12`
- 사용자 탭: 아바타 + 이름·학과 + 차단일 + `해제` (h-8 outline)
- 단어 탭: 단어 칩 + 우측 X로 개별 해제. 상단 입력창 `차단할 단어 추가`

**Claude Design 프롬프트**
```
Design "Block list" screen with two tabs: blocked users and blocked words.

Required:
- AppBar: back + "차단 목록".
- Tabs sticky: "사용자 4" / "단어 12" underline pattern.
- 사용자 tab list:
  - Row: 36px avatar + name SemiBold 14px + dept 12px meta + block date 11.5px hint
  - Trailing "해제" h-8 px-3 outline button (#E5E7EB border, body text 12.5px)
  - Hairline #F0F0F0 between rows
  - Empty: "차단한 사용자가 없어요"
- 단어 tab:
  - Top input row (mx-4 mt-3): h-10 rounded-lg #F3F4F6 bg, placeholder
    "차단할 단어 추가 (Enter)" 13.5px hint, plus icon right (navy 18px)
  - Below: chip wrap (px-4 mt-3, gap 8 8): each chip h-8 px-3 rounded-full
    bg-#F3F4F6 + word text 12.5px body + X icon (10px hint)
  - Helper text "차단한 단어가 포함된 글은 자동으로 가려져요" 12px hint mt-3 px-4

Tokens: same as above.
```

---

## 14. CommentThreadScreen — 대댓글 (답글)

**화면 역할**
PostDetail의 댓글 행에서 `답글` 탭 시 진입. 단일 댓글 + 그 아래 답글 트리.

**필수 UI 요소**
- AppBar: ← + `답글 12`
- 부모 댓글 카드 (회색 헤더 영역에 원본 글 컨텍스트 한 줄 + 본문 댓글 카드)
- 답글 리스트 (들여쓰기 16px, 좌측 vertical line hint 1px)
- 하단 sticky 답글 입력창 (PostDetail과 동일 패턴 + `@닉네임` 자동 mention 토큰)

**Claude Design 프롬프트**
```
Design "Comment thread" screen — a single parent comment with its replies in a
flat indented list. Korean chat/forum tone.

Required:
- AppBar: back + "답글 12" (count from data) SemiBold 17px.
- Parent comment card (mx-3 mt-3 p-3.5 bg-#F8F9FA rounded-xl):
  - Top context line (12px hint): "자유 · 기숙사 식단..." (link to parent post,
    truncated 1 line)
  - Avatar 24px + nick SemiBold 12.5px + time 11px hint, gap 8
  - Body 13.5px body leading-1.55 mt-1.5
  - Footer mt-2: thumb icon count meta · 답글 (count) + scroll-to-input link
- Replies list (px-4 mt-3, each reply mt-3):
  - Indented 24px from left with a 1px hair vertical line
  - Avatar 22px + nick 12.5px Medium + time 11px hint
  - Body 13px body leading-1.55
  - Footer thumb count + 답글 (allowing nested 1 level deeper)
- Sticky bottom input (border-t #F0F0F0 px-3 py-2 flex-row items-center gap-2):
  - Same comment input as PostDetail: rounded-full bg-#F3F4F6 input
  - When user taps "답글" on a reply, input prepends a removable token "@닉네임"
    in navy Pill at the start of input text
  - "등록" trailing text button 13px navy SemiBold

Tokens: navy, ink, body, meta, hint, hair2, surf2 #F8F9FA.
```

---

# D. 설정 & 계정 (3)

## 15. SettingsScreen — 설정 메인

**화면 역할**
ProfileScreen → "설정" 탭 시 진입. 알림/계정/차단/약관/버전.

**필수 UI 요소**
- AppBar: ← + `설정`
- 그룹 카드 4개 (border + divide-y border-b 패턴):
  1. **알림**: 푸시 알림(스위치 행) → 세부 설정으로 chevron
  2. **계정**: 이메일 (보기) / 비밀번호 변경 / 로그아웃 / 회원 탈퇴 (회색)
  3. **개인정보**: 차단 목록 / 데이터 다운로드 / 광고 추적 (스위치)
  4. **앱 정보**: 버전 (text) / 약관 / 개인정보처리방침 / 오픈소스 / 문의하기
- 하단 `UNIT v0.4.2 · 2026` 작게 hint center

**Claude Design 프롬프트**
```
Design Settings screen — list of grouped option cards.

Style: cream-tinted background between cards (#FAF8F4), white cards, hairline
dividers within cards. Match the menu card style of ProfileScreen.

Required:
- AppBar: back + "설정" SemiBold 17px.
- Background bg-#FAF8F4 for the scroll surface.
- Group card pattern: bg-white rounded-xl border #F0F0F0 mx-4 mb-3, internal
  divide-y #F0F0F0. Each row h-12 px-4 flex-row items-center justify-between.
- Group A "알림" (single header + 1 row):
  - Header (mx-4 mt-3 mb-1.5 11.5px hint Medium uppercase tracking-wide): "알림"
  - Row "푸시 알림": label 14px ink + chevron right hint
- Group B "계정":
  - Header "계정"
  - Row "이메일" → trailing show email 12.5px hint truncated
  - Row "비밀번호 변경" → chevron
  - Row "로그아웃" → no trailing, text body
  - Row "회원 탈퇴" → text 14px hint
- Group C "개인정보":
  - Header "개인정보"
  - Row "차단 목록" → chevron + count "4명"
  - Row "데이터 다운로드 요청" → chevron
  - Row "광고 맞춤 설정" → switch (navy on / hint off)
- Group D "앱 정보":
  - Header "앱 정보"
  - Row "버전" → "0.4.2 · 최신" trailing 12.5px mint
  - Row "이용약관" → chevron
  - Row "개인정보처리방침" → chevron
  - Row "오픈소스 라이선스" → chevron
  - Row "문의하기" → chevron
- Footer (centered, py-6 11px hint): "UNIT v0.4.2 · 2026"

Tokens: navy, mint, ink, meta, hint, hair, hair2, cream.
```

---

## 16. NotificationSettingsScreen — 알림 세부 설정

**필수 UI 요소**
- AppBar: ← + `알림 설정`
- 마스터 스위치: `푸시 알림 받기` (off면 아래 모두 disabled)
- 그룹 1 — 활동: 댓글, 답글, 추천, 스크랩, 멘션
- 그룹 2 — 배심원: 호출 / 결과 / 의견 일치
- 그룹 3 — 시간: 야간 방해금지 (22:00 ~ 08:00 시간 picker)
- 그룹 4 — 미리보기: 잠금 화면에 내용 표시 (스위치)

**Claude Design 프롬프트**
```
Design notification settings screen — per-category switches.

Required:
- AppBar: back + "알림 설정".
- Master row (mx-4 mt-3 px-4 py-3.5 bg-white rounded-xl border #F0F0F0):
  - Label "푸시 알림 받기" Medium 14px ink + sub-label 11.5px hint
    "꺼두면 아래 항목 모두 작동하지 않아요"
  - Trailing switch (44×26 navy on / #D1D5DB off)
  - When master is off, the entire screen below shows opacity 0.4, switches all visible
    but non-interactive.
- Section "활동" (header 11.5px hint Medium uppercase):
  - Row each: label 14px ink + small description 11.5px hint + switch right
  - 5 rows: 댓글 / 답글 / 추천 / 스크랩 / 멘션
- Section "배심원":
  - 3 rows: 호출 / 결과 / 의견 일치 알림
- Section "방해금지":
  - Row "야간 방해금지" + switch
  - When on, two rows below: "시작" 22:00 / "종료" 08:00 (chevron, tap → time picker)
- Section "잠금화면":
  - Row "내용 미리보기" + switch + sub "끄면 'UNIT 알림' 만 표시돼요"

Tokens: navy, ink, meta, hint, hair2.
```

---

## 17. AccountSettingsScreen — 계정 + 탈퇴

**필수 UI 요소**
- AppBar: ← + `계정`
- 정보 카드: 이메일 (변경 불가, 학교 이메일 강제) / 가입일 / 인증 상태
- 비밀번호 변경 (현재/새/확인 3 input)
- 로그아웃 (full-width outline button)
- 회원 탈퇴 (마지막, 작은 텍스트 링크 hint)
  - 탈퇴 화면: 사유 라디오 + 비밀번호 재확인 + 탈퇴 시 데이터 안내 + 최종 CTA coral

**Claude Design 프롬프트**
```
Design Account settings screen.

Two states in one screen: account info + password change. Withdraw is a
separate detail page accessed at the bottom.

Required:
- AppBar: back + "계정".
- Info card (mx-4 mt-3 p-4 bg white rounded-xl border #F0F0F0):
  - 11.5px hint label "이메일"
  - 14px Medium body email value (truncated)
  - 11.5px hint label "가입일", value 14px
  - 11.5px hint "인증 상태", "✓ 인증됨" 13px mint
- Password change section:
  - Header "비밀번호 변경" 13px Medium ink mx-4 mt-5 mb-2
  - 3 inputs in a card: 현재 비밀번호 / 새 비밀번호 / 새 비밀번호 확인
  - Each input row h-12 px-4 border-b #F0F0F0
  - CTA "변경하기" h-12 rounded-lg navy bg white SemiBold disabled when invalid
- Logout button (mx-4 mt-5):
  - h-12 rounded-lg white bg + #E5E7EB border + body Medium "로그아웃" 14px center
- Withdraw link (mt-8 mb-6 centered):
  - 12px hint underline "회원 탈퇴" (navigates to dedicated withdraw page)

Withdraw page (separate Stack screen):
- AppBar back + "회원 탈퇴"
- Warning banner (mx-4 mt-4 p-4 bg #FFF4EE rounded-xl):
  - 13px Medium #9A3412 "탈퇴하면 다음 데이터가 모두 삭제됩니다"
  - Bullet list 12px #B45309: 작성한 글·댓글·강의평·매너 학점·친구 관계
  - "탈퇴 후 30일 이내 동일 이메일로 재가입할 수 없어요"
- 사유 radio (필수): 다른 앱을 사용해요 / 익명성에 만족 못함 / 활동이 적어요 /
  매너 점수 회복이 어려워요 / 기타
- 비밀번호 재확인 input
- Bottom CTA "탈퇴하기" h-12 rounded-lg coral bg white SemiBold

Tokens: navy, mint, coral, ink, meta, hint, hair2, warning #FFF4EE/#9A3412.
```

---

# E. 캠퍼스 심화 (4)

## 18. MarketWriteScreen — 중고장터 글쓰기

**진입 경로**
MarketScreen 우측 + 버튼.

**필수 UI 요소**
- AppBar: X + `상품 등록` + 우측 `등록` (조건 충족 시 navy 활성)
- 사진 첨부 (가로 스크롤, 최대 10장, 첫 장은 대표 표시 navy badge)
- 제목 input
- 카테고리 chip 선택 (디지털/도서/생활/패션/티켓/기타)
- 가격 input (원 suffix, 천 단위 콤마, `나눔` toggle 시 0)
- 거래 방식: 직거래 / 택배 (체크 복수)
- 거래 동네 선택 (`용현동` 등 picker)
- 본문 textarea (10자 이상)
- 안내: 거래 금지 품목 안내 carousel

**Claude Design 프롬프트**
```
Design "Market write" — used to list a marketplace item for sale.

Style: same form pattern as WriteScreen (글쓰기) but with image gallery,
category chips, and price field.

Required:
- AppBar: X + "상품 등록" + trailing "등록" button (h-8 px-3 rounded-md, navy bg
  white SemiBold 13.5px when valid; #F3F4F6 bg hint when not).
- Photos strip (px-4 py-3 horizontal scroll, gap 8):
  - First slot: camera button 64×64 rounded-lg outline #E5E7EB, camera icon center,
    counter "0/10" 10.5px below
  - Each photo 64×64 rounded-lg, top-left 16×16 navy "대표" badge on first photo,
    top-right X delete circle bg-black/60
- Title input row (px-4 h-14 border-b #F0F0F0): placeholder "제목 (필수)" #C9CDD3
  18px SemiBold ink
- Category chips row (px-4 py-3 horizontal scroll, gap 6):
  - Chips: 디지털 / 도서 / 생활 / 패션 / 티켓 / 기타
  - h-7 px-3 rounded-full, selected navy bg white text SemiBold 12px,
    unselected outline #E5E7EB body text Regular
- Price row (px-4 h-14 border-b #F0F0F0):
  - Right-aligned input "₩ 0" 16px SemiBold ink, with thousands comma
  - Trailing "나눔" toggle small switch 36×20 (navy on)
- Trade method (px-4 py-3 border-b #F0F0F0):
  - Two checkbox rows: "직거래" (selectable) + "택배" (selectable, both can be on)
  - Sub-text 11.5px hint per row
- Region picker row (px-4 h-12 border-b #F0F0F0):
  - "거래 동네" label 14px ink, value 13px body right + chevron
- Body textarea (px-4 pt-4 pb-2): multiline 14.5px body leading-1.7,
  placeholder "상품 상태와 거래 방식을 알려주세요. (10자 이상)" #C9CDD3, min-h 9 lines
- Info notice (px-4 py-4 bg #FAF8F4 mx-4 rounded-lg my-3):
  - 12px body leading-1.6 "거래 금지 품목 (담배·주류·동물·계정 등)을 등록하면 매너 점수가 차감돼요"
  - "자세히 보기" 11.5px navy underline

Tokens: navy, mint, ink, body, meta, hint, hair2, cream, surf.
```

---

## 19. MarketDetailScreen — 중고장터 상품 상세

**필수 UI 요소**
- AppBar: ← + 우측 스크랩(북마크), 더보기, 공유
- 사진 캐러셀 (가로 스와이프, 인디케이터 점, 1/N 우상단)
- 제목 18px SemiBold + 가격 24px Bold navy
- 판매자 행 (아바타 32 + 닉 + 매너 등급 outline + 거래 횟수)
- 카테고리 / 동네 / 시간 (12.5px meta)
- 본문 텍스트 (whitespace 보존, 14.5px body leading-1.7)
- 거래 방식 박스 (직거래/택배 표시)
- 안전 거래 안내 (법인 X, 직접 거래 권장)
- Sticky 하단: `채팅하기` (navy primary) + 가격 표시 + 스크랩 카운트

**Claude Design 프롬프트**
```
Design Market item detail screen.

Required:
- Photo carousel (full width, 4:3 aspect ratio): horizontal swipe, 1-of-N indicator
  (top-right small pill bg-black/60 text-white 11px), bottom dot indicator (8 dots,
  active navy, inactive #FFFFFF80 with shadow).
- Below carousel content area:
  - Seller row (px-4 py-3 border-b #F0F0F0): 32 avatar + nick SemiBold 14px ink +
    manner badge outline 18×18 + dept 12.5px meta one line. Trailing tiny "거래 횟수 12"
    Pill cobalt + chevron right (tap → seller's profile).
  - Title block (px-4 pt-4):
    - Title 18px SemiBold ink letter-spacing -0.4
    - Category · 동네 · 시간 row: "디지털 · 용현동 · 15분 전" 12.5px meta
    - Price 24px Bold navy mt-2 with "거래 가능" Pill mint mt-1
  - Body (px-4 pt-3 pb-5): 14.5px body leading-1.7, multi-paragraph
- Trade options card (mx-4 my-3 p-4 bg-#F8F9FA rounded-xl):
  - "거래 방식" label 11.5px hint
  - List "직거래 가능 · 택배 가능 (착불)" 13.5px body
- Safety notice (mx-4 mb-3 p-3 bg-cream rounded-lg):
  - shield icon 16 + 12px body leading-1.6
    "법인 거래는 금지돼요. 직접 만나서 거래하세요. 사기 의심 시 신고해주세요."
- Sticky bottom bar (px-4 py-3 border-t #F0F0F0 bg-white flex-row items-center gap-3):
  - Bookmark icon w-9 h-9 outline rounded-md (filled navy when scraped)
  - Price (left of CTA) 14.5px SemiBold ink "12,000원"
  - CTA "채팅하기" flex-1 h-12 rounded-lg navy bg white SemiBold 15px

Tokens: navy, mint, coral, cream, ink, body, meta, hint, hair, hair2, cobalt #DDE4F8/#1F3A8A.
```

---

## 20. JobDetailScreen — 알바 상세 + 신청

**필수 UI 요소**
- AppBar: ← + 스크랩
- 헤더: tag Pill + 제목 17px + 시급 18px navy SemiBold + 급구 Pill (warn) 조건부
- 정보 그리드 2열: 거리 / 요일 / 시간 / 근무 형태 / 모집 인원 / 근무 시작
- 사업장 카드 (지도 작은 썸네일 + 주소 + 연락처 클릭)
- 본문 (역할/우대/조건)
- 지원자 통계 (이미 N명 지원)
- Sticky 하단: `지원하기` CTA

**Claude Design 프롬프트**
```
Design Job (part-time) detail screen.

Required:
- AppBar: back + bookmark icon trailing.
- Hero (px-4 pt-4 pb-3):
  - Pill row: navy Pill "캠퍼스내" + meta "0.2km" + (optional warn Pill "급구" right)
  - Title h1 17px SemiBold ink letter-spacing -0.3 leading-tight (1-2 lines)
  - Wage 18px SemiBold navy mt-1 "시급 12,000원"
- Info grid (mx-4 mt-2 p-4 bg-white rounded-xl border #F0F0F0):
  - 2 columns × 3 rows of label / value pairs:
    "요일 / 토일", "시간 / 09:00~18:00", "근무 형태 / 단기",
    "모집 인원 / 1명", "거리 / 0.2km", "근무 시작 / 즉시"
  - Each cell: 11.5px hint label, 13.5px Medium ink value, gap 12 between cells
- Place card (mx-4 mt-3 p-3 bg-#F8F9FA rounded-xl flex-row items-center gap-3):
  - 56×56 rounded-md grey image placeholder
  - Vertical: place name 13.5px Medium ink + address 12px meta + phone 12px navy
- Section "근무 내용" (mx-4 mt-5 13px Medium ink mb-2):
  - Body bullet list 13.5px body leading-1.7
- Section "우대 사항" (mt-4):
  - Same body list
- Stats row (mx-4 mt-5 p-3 bg-#F4F4FB rounded-lg):
  - "이미 12명이 지원했어요 · 마감까지 D-3" 12px navy
- Bottom sticky CTA (px-4 py-3 border-t #F0F0F0):
  - "지원하기" h-12 rounded-lg navy white SemiBold 15px

Tokens: navy, ink, body, meta, hint, hair2, surf2 #F8F9FA, navy bg-soft #F4F4FB.
```

---

## 21. ContestDetailScreen — 공모전 상세

**필수 UI 요소**
- AppBar: ← + 스크랩 + 공유
- 헤더: 카테고리 색상 라인 (3px 위) + 주최 + 제목 + 마감 D-12 (coral)
- 정보 그리드: 상금 / 주최 / 분야 / 참가 자격 / 접수 기간 / 결과 발표
- 본문 (개요 / 일정 / 심사 기준)
- 첨부 파일 다운로드 (PDF 등)
- 적합도 카드 (`내 학과 기준 92% 적합`) — recommend 탭에서만
- Sticky 하단: `사이트로 가기` (외부 링크) + 스크랩

**Claude Design 프롬프트**
```
Design Contest detail screen.

Required:
- AppBar: back + bookmark + share trailing.
- Top color line h-1 navy/mint/cream depending on category (matches list card
  accent).
- Hero (px-4 pt-4):
  - Category badge text 11px SemiBold (color matches accent)
  - Host 12px hint "한국디자인진흥원"
  - Title h1 18px SemiBold ink letter-spacing -0.4 leading-1.35
  - Mt-2 row: deadline Pill warn "D-12" + "접수 마감 5/24" 12px meta
- Fit card (only if reached via "추천" tab) (mx-4 mt-3 p-3 bg-#F4F4FB rounded-xl
  border #DDDDF1):
  - flex-row items-center: shield icon navy + "내 학과 기준 적합도" 12.5px navy +
    big "92%" 18px Bold navy (right-aligned, font-mono)
  - Sub 11.5px body "디자인 전공 학생 53명이 스크랩했어요"
- Info grid card (mx-4 mt-3 p-4 bg-white rounded-xl border #F0F0F0):
  - 2 col × 3 row label/value pairs:
    "상금 / 대상 500만원", "분야 / UX 디자인", "참가 자격 / 대학(원)생",
    "접수 기간 / 5/12 - 5/24", "결과 발표 / 6/18", "주최 / 한국디자인진흥원"
- Sections:
  - "공모 주제" (markdown-like body 14.5px)
  - "심사 기준" (numbered list)
  - "일정" (timeline: 접수 마감 → 1차 발표 → 본선 → 시상)
- Attachments (if any): file row with icon + filename + size + download icon
- Bottom sticky CTA:
  - Bookmark icon outline (filled when scraped)
  - "사이트로 가기 ↗" h-12 rounded-lg navy bg white SemiBold 15px (external link)

Tokens: navy #000080, mint, coral, cream, ink, body, meta, hint, hair2, navy-bg-soft #F4F4FB.
```

---

# 부록: 변환 후 통합 작업

위 21개 화면을 만든 뒤 추가로 필요한 wiring:

1. **RootStackParamList 확장** — [src/types.ts](unit-mobile/src/types.ts) 에 21개 라우트 추가
2. **RootNavigator** — Stack.Screen 21개 추가, modal/fullScreen presentation 결정
3. **진입 경로 wiring**:
   - FeedScreen 검색 아이콘 → `Search`
   - PostDetail 댓글 답글 → `CommentThread`
   - PostDetail/Comment/Profile 더보기 → `Report` (action sheet 경유)
   - ProfileScreen "내 활동" → `MyPosts/Comments/Scraps`
   - ProfileScreen "설정" → `Settings`
   - Settings → `NotificationSettings/AccountSettings/BlockList`
   - MarketScreen + → `MarketWrite`, 행 탭 → `MarketDetail`
   - JobsScreen 행 탭 → `JobDetail`
   - ContestScreen 카드 탭 → `ContestDetail`
   - ChatRoom 헤더 탭 → `OtherProfile`
   - 닉네임 탭 → `OtherProfile` (글/댓글 어디서든)
4. **AuthGate** — 앱 시작 시 토큰 체크해 미인증이면 Splash → SchoolSelect → Login → ... 강제
5. **데이터 모델 확장** — Post에 author userId, OtherProfile lookup 등

---

**문서 버전**: v1.0 (2026-05-09)
**총 화면 수**: 21개 (Tier A: 5, B: 4, C: 5, D: 3, E: 4)
**기존 화면**: 23개 ([unit-mobile/src/screens/](unit-mobile/src/screens/) 참조)
**최종 합계**: 44개 (출시 가능 수준)
