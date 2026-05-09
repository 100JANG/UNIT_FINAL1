# UNIT Mobile (React Native)

UNIT 한국 대학 커뮤니티 모바일 앱. `../web-source/*.jsx` 의 React 웹 데모(17화면)를
Expo + React Native + NativeWind + React Navigation으로 1:1 변환한 결과물.

## 변환 완료 상태

- §1 프로젝트 셋업 ✅
- §4 shared 컴포넌트 — Icons(30개) + AppBar + Pill(8 tone) + Avatar + Hairline + Screen ✅
- §5 네비게이션 — RootNavigator + TabNavigator ✅
- §6~§7 화면 변환 — 17개 화면 1:1 변환 ✅
  - **§7.1 FeedScreen** — FlatList, scope tabs, 포스트 카드 + grayscale shadow
  - **§7.2 PostDetailScreen** — KeyboardAvoidingView, sticky comment input, action row
  - **§7.3 WriteScreen** — expo-image-picker, Reanimated 익명 토글, KeyboardAvoidingView
  - **§7.4 CoursesScreen / CourseDetailScreen / CourseReviewScreen** — 추천% bar, sticky review tabs, 비추천 thumb 180° 회전
  - **§7.5 ChatListScreen / ChatRoomScreen** — KeyboardAvoidingView, 자동 스크롤, Reanimated 타이핑 도트, 그룹 멤버 배지
  - **§7.6 NotificationsScreen / ProfileScreen** — unread dot, 매너 카드, Reanimated 토글, divide-y → border-b 변환
  - **§7.7 JuryScreen** — Reanimated bounce count + width 애니메이션, setInterval mock
  - **§7.8 MannerGradeScreen / MannerLadderScreen** — 88px Hero (Android includeFontPadding), 9등급 사다리, 점수 산정 기준
  - **§7.9 Campus 화면들** — Hub + Timetable / Meal / Bus(pulse) / Library / Contacts / Contest / Jobs / Market / Friends

## 설치 (전제조건 — 두 단계 모두 필수)

### 1. Pretendard OTF 4종을 먼저 배치 ⚠️

`assets/fonts/` 에 다음 4개 파일이 **반드시** 있어야 Metro 번들러가 동작합니다.
릴리스: https://github.com/orioncactus/pretendard/releases

```
assets/fonts/
  Pretendard-Regular.otf
  Pretendard-Medium.otf
  Pretendard-SemiBold.otf
  Pretendard-Bold.otf
```

[App.tsx](App.tsx) 가 이 파일들을 `require()` 로 정적 참조하므로, 파일이 없으면
`npx expo start` 가 "Unable to resolve module" 에러로 즉시 실패합니다.

폰트 로드 자체가 런타임에 실패하더라도 앱은 시스템 폰트로 계속 동작하도록
`useFonts` 의 `fontError` 핸들링을 추가해 두었습니다 ([App.tsx](App.tsx)).

### 2. 의존성 설치

```powershell
cd unit-mobile
npm install
```

## 실행

```powershell
npx expo start
```

- iOS: `i`
- Android: `a`

## 타입체크

```powershell
npm run typecheck
```

## 디렉토리 구조

```
unit-mobile/
├── App.tsx                         # 폰트 로딩 + Providers
├── app.json                        # Expo 설정 (image-picker plugin 포함)
├── babel.config.js                 # NativeWind v4 + Reanimated
├── metro.config.js                 # NativeWind metro
├── tailwind.config.js              # navy/mint/coral/cream + Pretendard
├── global.css                      # @tailwind directives
├── tsconfig.json                   # strict, @/* path alias
├── nativewind-env.d.ts
├── assets/fonts/                   # Pretendard OTF 4종
└── src/
    ├── types.ts                    # RootStackParamList, TabParamList
    ├── lib/
    │   └── typo.ts                 # fontWeight(400|500|600|700) 헬퍼
    ├── data/
    │   ├── posts.ts                # POSTS, COMMENTS
    │   ├── courses.ts              # COURSES, REVIEWS
    │   ├── chats.ts                # CHATS, INITIAL_MSGS
    │   ├── notifs.ts               # NOTIFS, KIND_LABEL
    │   ├── manner.ts               # GRADES, gradeFromScore, BENEFITS
    │   └── schools.ts              # SCHOOLS, schoolIcon
    ├── components/shared/
    │   ├── Icons.tsx               # 30개 아이콘 (react-native-svg)
    │   ├── AppBar.tsx
    │   ├── Pill.tsx                # 8 tone (cobalt 추가)
    │   ├── Avatar.tsx
    │   ├── Hairline.tsx            # StyleSheet.hairlineWidth
    │   ├── Screen.tsx              # Screen + FullScreen
    │   └── index.ts
    ├── navigation/
    │   ├── RootNavigator.tsx       # Stack: Tabs + 18 push (modal: Write/CourseReview/Jury)
    │   └── TabNavigator.tsx        # Tabs: Home/Campus/[FAB]/Chat/Me
    └── screens/                    # 17개 화면 + Campus 9개 = 21개 .tsx
        ├── FeedScreen.tsx
        ├── PostDetailScreen.tsx
        ├── WriteScreen.tsx
        ├── CoursesScreen.tsx
        ├── CourseDetailScreen.tsx
        ├── CourseReviewScreen.tsx
        ├── ChatListScreen.tsx
        ├── ChatRoomScreen.tsx
        ├── NotificationsScreen.tsx
        ├── ProfileScreen.tsx
        ├── JuryScreen.tsx
        ├── MannerGradeScreen.tsx
        ├── MannerLadderScreen.tsx
        ├── CampusHubScreen.tsx
        ├── TimetableScreen.tsx
        ├── MealScreen.tsx
        ├── BusScreen.tsx
        ├── LibraryScreen.tsx
        ├── ContactsScreen.tsx
        ├── ContestScreen.tsx
        ├── JobsScreen.tsx
        ├── MarketScreen.tsx
        └── FriendsScreen.tsx
```

## 변환 시 적용한 핵심 패턴 (§3, §6)

- 모든 텍스트는 `<Text>` 안 — RN 런타임 에러 방지
- View는 `flex-row` 또는 기본 `flex-col` (column)
- `transform`은 배열: `[{ rotate: '180deg' }]`
- `divide-y` → 자식마다 `border-b`, 마지막만 제외
- `line-clamp-N` → `<Text numberOfLines={N}>`
- `placeholder:text-...` → `placeholderTextColor` prop
- `grid grid-cols-N` → `flex-row` + 자식 `flex-1` (또는 `flex-wrap` + `width: '25%'`)
- `sticky top-0` → `ScrollView stickyHeaderIndices={[N]}`
- 그림자 → `shadowColor/Opacity/Radius` + Android `elevation`
- 애니메이션 → `react-native-reanimated v3` (Jury bounce, Chat typing dots, Toggle slide, Bus pulse)
- 키보드 회피 → `KeyboardAvoidingView` (Write, PostDetail, ChatRoom, CourseReview)
- FullScreen 페이지 (Write, Jury, CourseReview, ChatRoom) — `edges={['top','bottom']}`
- Android 큰 텍스트 잘림 방지 — `includeFontPadding: false` (MannerGrade Hero 88px)

## 변환에서 의도적으로 단순화한 부분

- 시간표(TimetableScreen): 원본의 `calc()` 기반 정확한 column 위치 계산을 RN의 `position: 'absolute'` + flex 1/N 구조로 바꿨습니다. 5개 column이 균등 분배되므로 시각적 결과는 동일합니다.
- Bus 실시간 dot의 `animate-pulse`는 Reanimated `withRepeat`로 직접 구현.
- write.jsx의 placeholder 그라데이션 사진(`linear-gradient(...)`)은 단순 단색 배경으로 대체 — ImagePicker 결과는 실제 `<Image source={{uri}}>` 로 렌더.

## 폰트 weight

NativeWind의 `font-bold/semibold/medium`은 자동으로 다른 OTF로 매핑되지 않을 수 있습니다.
변환된 파일들은 중요한 곳에서 `style={{ fontFamily: 'Pretendard-SemiBold' }}` 를 직접 지정합니다.
공유 헬퍼는 `src/lib/typo.ts` 의 `fontWeight(600)` 으로 호출 가능.

```tsx
import { fontWeight } from '@/lib/typo';

<Text style={fontWeight(600)} className="text-[15px]">제목</Text>
```

## §8 검증 — 다음 단계

`npx expo start` 후 실 디바이스/시뮬레이터에서:

- [ ] 5탭 (피드/캠퍼스/[FAB]/채팅/나) 전환 시각적으로 일치
- [ ] FAB 탭 → Write modal 슬라이드업
- [ ] FeedScreen 포스트 카드 → PostDetail 진입, postId 전달
- [ ] PostDetail 키보드 호출 시 댓글 입력창 가려지지 않음
- [ ] WriteScreen 카메라 버튼 → 이미지 라이브러리 권한 요청 + 다중 선택 추가
- [ ] WriteScreen 익명 토글 슬라이드 애니메이션 부드러움
- [ ] CoursesScreen 추천/비추천 토글 색 전환 (navy/coral)
- [ ] CourseReview 모달 — 비추천 버튼 thumb 180° 회전
- [ ] ChatRoom 메시지 추가 시 자동 하단 스크롤
- [ ] ChatRoom 타이핑 도트 3개 ease alternate
- [ ] Jury 카운트 +1 시 0.22s bounce, 진행률 바 부드러운 폭 변화
- [ ] MannerGrade Hero 88px 등급 글자 잘리지 않음 (Android 포함)
- [ ] MannerLadder 9개 등급 행, B0(내 등급) tone 배경
- [ ] Profile divide-y → border-b 시각적 일치
- [ ] Campus 4-col 그리드 (10개 서비스)
- [ ] Bus 실시간 dot 펄스 애니메이션
