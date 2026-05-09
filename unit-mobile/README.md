# UNIT Mobile (React Native)

UNIT 한국 대학 커뮤니티 모바일 앱.
**docs/handoff/** 16-PR 계획을 모두 완료한 v2 정식 빌드.

## 변환 완료 상태

| Tier | PR | 상태 |
|---|---|---|
| 토큰·UI | PR-01 design tokens + 14 ui components | ✅ |
| 라우팅 | PR-02 UnitV2Stack 36 routes | ✅ |
| 신규 화면 | PR-03~10 (매너/인증/검색/모더/설정/캠퍼스 허브/심화/학생생활) | ✅ |
| 교체 | PR-11~14 (자치-알림-나/강의평/채팅/피드 + 어댑터) | ✅ |
| 정리 | PR-15 v2 정식 승격 + NativeWind 인프라 제거 | ✅ |
| 테마 | PR-16 다크모드 토큰 + ThemeProvider | ✅ |

**총 화면 수**: 44 (UnitV2 36 + 기존 호환 라우트)
**총 컴포넌트**: 14 ui (StyleSheet) + 14+ icons
**의존성**: Expo SDK 52 + RN 0.76 + RN-SVG + Reanimated + Pretendard. NativeWind 제거됨.

## 디렉토리

```
unit-mobile/
├── App.tsx                  ThemeProvider + Pretendard 폰트
├── app.json                 Expo (image-picker plugin)
├── babel.config.js          babel-preset-expo + reanimated/plugin
├── metro.config.js          순수 Expo metro config
├── tsconfig.json            strict TS + @/* alias
├── assets/fonts/            Pretendard OTF 4종
└── src/
    ├── theme/
    │   ├── tokens.ts        C, F, SP, R, SHADOW + light/dark palettes
    │   └── ThemeProvider.tsx useTheme() 훅
    ├── components/ui/       14 컴포넌트 + icons (StyleSheet only)
    ├── navigation/
    │   ├── RootNavigator.tsx     legacy + UnitV2 mount
    │   ├── TabNavigator.tsx      5탭 (Home/Campus/[FAB]/Chat/Me)
    │   └── UnitV2Stack.tsx       36 routes nested
    ├── screens/v2/          모든 화면 (44 + PlaceholderScreen)
    └── types/
        ├── unit-v2.ts       UnitV2ParamList
        └── ../types.ts      RootStackParamList (호환)
```

## 설치 + 실행

```powershell
# 1. Pretendard OTF 4종을 assets/fonts/ 에 배치
#    https://github.com/orioncactus/pretendard/releases

# 2. 의존성 설치
cd unit-mobile
npm install

# 3. 타입 체크
npm run typecheck

# 4. 실행
npx expo start
# → Expo Go QR 스캔 또는 i (iOS) / a (Android)
```

## v2 라우트 진입

기존 호환 호출:
```ts
navigation.navigate('PostDetail', { postId: 1 })
navigation.navigate('CourseDetail', { courseId: 1 })
```
→ 인라인 어댑터가 v2 시그니처로 매핑.

UnitV2 nested 라우트 직접 진입:
```ts
navigation.navigate('UnitV2', { screen: 'Splash' })
navigation.navigate('UnitV2', { screen: 'PostDetail', params: { id: 1 } })
```

## 다크 모드 (PR-16)

```tsx
import { useTheme } from '@/theme/ThemeProvider';

function MyScreen() {
  const { palette, theme, mode, setMode } = useTheme();
  // mode: 'light' | 'dark' | 'system' (default)
  return (
    <View style={{ backgroundColor: palette.surface }}>
      <Text style={{ color: palette.text }}>Hello</Text>
      <Pressable onPress={() => setMode(theme === 'dark' ? 'light' : 'dark')}>
        <Text>토글</Text>
      </Pressable>
    </View>
  );
}
```

기존 모든 v2 화면은 토큰 `C.*` 정적 import — 다크 모드 지원이 필요한 화면만
점진적으로 `useTheme()` 으로 마이그레이션 (PR-17 이후).

## 핸드오프 문서

[docs/handoff/](docs/handoff/) 폴더에 16-PR 사양 전체 보존:
- 00_OVERVIEW · 01_TOKENS · 02_COMPONENTS · 03_SCREENS · 04_MIGRATION_MAP
- 05_INTERACTIONS · 06_API_CONTRACT · 07_PR_PLAN · 08_PROMPTS
- README · START_HERE
