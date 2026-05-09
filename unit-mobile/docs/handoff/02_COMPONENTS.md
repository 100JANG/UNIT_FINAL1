# 02. 공통 컴포넌트 14개

`src/components/ui/`에 모두 위치. 화면은 이걸로만 조립한다.

---

## 1. `AppBar`
상단 헤더 바. 높이 44, 배경 white, optional 1px 하단 디바이더.

```ts
type AppBarProps = {
  title?: string;
  leading?: ReactNode;     // 보통 BackButton 또는 학교명 + chevron
  trailing?: ReactNode;    // 검색·알림·더보기 아이콘
  divider?: boolean;       // default true
};
```

- 좌측 leading 영역 16px 패딩, 우측도 동일
- title은 가운데 정렬 아닌 leading 옆 (iOS 스타일이지만 좌측 정렬)

---

## 2. `Pill`
작은 라벨 배지. 높이 18 또는 20, padding-x 8.

```ts
type PillProps = {
  tone: 'plain' | 'navy' | 'mint' | 'coral' | 'gold' | 'mist';
  children: ReactNode;
};
```

| tone | bg | text |
|---|---|---|
| plain | `C.surface2` | `C.textMeta` |
| navy | `C.inkNavy` | white |
| mint | `C.trust` | white |
| coral | `C.danger` | white |
| gold | `C.warn` | white |
| mist | `C.mist` | `C.inkNavy` |

---

## 3. `Avatar`
원형 아바타. 이미지 없으면 첫 글자 + 결정적 배경색.

```ts
type AvatarProps = { name: string; size?: number; uri?: string };
```

- 사이즈 24 / 28 / 36 / 56 / 80 사용중
- 이름 → 해시 → 5색 팔레트 중 1개

---

## 4. `BottomTab`
하단 5탭 + 중앙 FAB (글쓰기). 높이 56 + safe area inset.

```ts
type BottomTabProps = { active: 'home' | 'campus' | 'book' | 'bell' | 'me' };
```

탭: 피드 / 캠퍼스 / **+ FAB** / 알림 / 나
- FAB는 56×56, `C.inkNavy` 배경, 흰색 + 아이콘, -8px 위로 띄움

---

## 5. `Screen`
화면 셸. SafeArea + AppBar 슬롯 + 본문 스크롤 + BottomTab 슬롯.

```ts
type ScreenProps = {
  appBar?: ReactNode;
  bottomTab?: ReactNode;
  scrollable?: boolean;   // default true
  children: ReactNode;
  bg?: string;            // default white
};
```

키보드 열릴 때 `KeyboardAvoidingView` 자동 처리.

---

## 6. `Chip`
필터·태그 칩. 높이 28 또는 32, rounded-full.

```ts
type ChipProps = { active?: boolean; onPress?: () => void; children: ReactNode };
```

- active: bg `C.inkNavy`, text white, semibold
- inactive: bg `C.surface2`, text `C.textMeta`

---

## 7. `Hairline`
1px 디바이더. iOS는 0.5px (StyleSheet.hairlineWidth) 사용 권장.

```ts
type HairlineProps = { color?: string; mx?: number };
```

---

## 8. `Tabs` (언더라인형)
상단 세그먼트 탭. 활성 탭 아래 2px 검은 바.

```ts
type TabsProps = {
  items: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
};
```

---

## 9. `IconButton`
44×44 터치 영역 보장. 안에 SVG 아이콘.

```ts
type IconButtonProps = { icon: ReactNode; onPress: () => void; tone?: 'default' | 'primary' | 'danger' };
```

---

## 10. `ListRow`
설정·메뉴 행. 높이 56, 좌측 라벨, 우측 value + chevron.

```ts
type ListRowProps = {
  label: string;
  value?: string;
  trailing?: 'chev' | 'switch' | 'check' | ReactNode;
  onPress?: () => void;
  destructive?: boolean;  // 빨강
};
```

---

## 11. `Sheet`
바텀 시트. 모서리 16 rounded-top, drag handle 36×4.

```ts
type SheetProps = {
  visible: boolean;
  onClose: () => void;
  height?: number | 'auto';
  children: ReactNode;
};
```

`react-native-bottom-sheet` 또는 자체 Modal + Animated.Value.

---

## 12. `Switch`
iOS 스타일 토글. 44×26, 활성 `C.inkNavy`.

```ts
type SwitchProps = { value: boolean; onChange: (v: boolean) => void };
```

RN 기본 `Switch` 사용 + `trackColor`/`thumbColor` 주입.

---

## 13. `MannerBadge`
A+ ~ F 9단계 배지. 등급별 색은 `C.manner` 사용.

```ts
type MannerBadgeProps = { grade: 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F'; size?: 'sm' | 'md' | 'lg' };
```

- sm: 20×20 글자 11px
- md: 32×32 글자 14px
- lg: 96×96 글자 48px (프로필용)

---

## 14. `LogoMark`
학교 크레스트. `assets/logo-{inha|ajou|snu|korea|yonsei}.png` 매핑.

```ts
type LogoMarkProps = { domain: string; size?: number };
```

- 도메인 → 로고 매핑 테이블 내장
- 매칭 안 되면 첫 글자 모노그램

---

## 의존성

| 라이브러리 | 용도 |
|---|---|
| `react-native-svg` | 모든 아이콘 (custom inline) |
| `@react-navigation/native` + `native-stack` | 라우팅 |
| `react-native-bottom-sheet` | Sheet |
| `expo-linear-gradient` | (필요시) MannerBadge 골드 그라데이션 |
| `react-native-reanimated` | 카운트 애니메이션, mock 소켓 입장 |
| `expo-font` | Pretendard Variable, JetBrains Mono |
