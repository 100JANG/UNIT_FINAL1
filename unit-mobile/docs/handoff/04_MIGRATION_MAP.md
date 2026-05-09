# 04. HTML → React Native 치환 규칙

| HTML / Tailwind | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>` | `<Text>` (인라인 텍스트) |
| `<button>` | `<Pressable>` (또는 `<TouchableOpacity>`) |
| `<img src>` | `<Image source={{uri}}>` |
| `<input>` | `<TextInput>` |
| `<ul><li>` | `<FlatList>` 또는 `<View>` + map |
| `className="flex"` | `style={{ flexDirection: 'row' }}` |
| `flex-col` | `flexDirection: 'column'` (default) |
| `gap-2` | `gap: 8` (RN 0.71+) |
| `items-center` | `alignItems: 'center'` |
| `justify-between` | `justifyContent: 'space-between'` |
| `px-4` | `paddingHorizontal: 16` |
| `py-3` | `paddingVertical: 12` |
| `mt-2` | `marginTop: 8` |
| `text-[14px]` | `fontSize: 14` |
| `text-[14.5px]` | `fontSize: 14` (정수화) |
| `font-semibold` | `fontWeight: '600'` |
| `tracking-[-0.3px]` | `letterSpacing: -0.3` |
| `leading-[1.5]` | `lineHeight: 21` (size × 1.5 직접 계산) |
| `text-[#111]` | `color: C.text` |
| `bg-[#F9FAFB]` | `backgroundColor: C.surface` |
| `rounded-xl` | `borderRadius: 12` |
| `rounded-full` | `borderRadius: 9999` |
| `border border-[#E5E7EB]` | `borderWidth: 1, borderColor: C.divider2` |
| `border-t` | `borderTopWidth: 1` |
| `shadow-[0_1px_2px_rgba(0,0,0,0.04)]` | `SHADOW.card` (스프레드) |
| `active:bg-[#F3F4F6]` | `<Pressable style={({pressed}) => pressed && {backgroundColor: C.surface2}}>` |
| `hover:` | (없음 — 무시) |
| `transition` | `LayoutAnimation` 또는 `Reanimated` |
| `truncate` | `numberOfLines={1}` (Text) |
| `line-clamp-2` | `numberOfLines={2}` |
| `whitespace-pre-line` | (Text는 기본 \\n 인식) |
| `font-mono` | `fontFamily: F.mono` 또는 `fontVariant: ['tabular-nums']` |
| `overflow-y-auto scroll` | `<ScrollView>` |
| `position: sticky` | `<SectionList stickySectionHeadersEnabled>` 또는 별도 absolute |
| `z-10` | `zIndex: 10, elevation: 10` |
| `disabled` | `disabled` prop on Pressable + opacity 0.5 |
| SVG inline | `react-native-svg` 컴포넌트 |
| `useState` / `useEffect` | 동일 |
| `placeholder` | `placeholder` (TextInput) + `placeholderTextColor` |
| `outline-none` | (RN 기본 없음 — 불필요) |
| `focus-within:border-...` | `onFocus`/`onBlur` 상태로 borderColor 토글 |

## 자주 빠뜨리는 것

1. **Text는 항상 `<Text>`로 감싸기.** RN은 raw 문자열을 View 안에 못 둠.
2. **flex 1 먹이기.** ScrollView 자식이 안 펴지면 `contentContainerStyle={{ flexGrow: 1 }}`
3. **이미지 사이즈 명시.** `<Image>`는 width/height 없으면 안 보임
4. **터치 영역.** 16x16 아이콘 버튼은 `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` 추가
5. **키보드.** 입력 화면은 `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
6. **SafeArea.** Screen 컴포넌트가 처리. 직접 `useSafeAreaInsets`로 보조

## 아이콘 변환

`shared.jsx`의 inline SVG → `react-native-svg`로 1:1 변환. 컴포넌트화:

```ts
// src/components/ui/icons.tsx
import Svg, { Path, Circle } from 'react-native-svg';
export const IcSearch = ({ size = 22, color = '#111' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.6} fill="none" />
    <Path d="m20 20-3-3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);
```

`Ic.search`, `Ic.bell`, `Ic.thumb`, `Ic.bookmark`, `Ic.chev`, `Ic.back`, `Ic.x`, `Ic.more`, `Ic.msg`, `Ic.share`, `Ic.check`, `Ic.chevDn` 모두 동일 패턴.
