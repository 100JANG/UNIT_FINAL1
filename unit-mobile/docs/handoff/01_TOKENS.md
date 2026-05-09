# 01. 디자인 토큰

`src/theme/tokens.ts`에 한 번만 정의하고 모든 화면이 여기서 import. 직접 색·폰트 박지 말 것.

## 색상

```ts
export const C = {
  // Brand
  inkNavy:   '#000080',  // primary
  cobalt:    '#3461C7',
  sky:       '#7BA7DC',
  mist:      '#DCE7F5',

  // Semantic
  trust:     '#1F7A5C',  // 추천·성공·신뢰
  trustSoft: '#4F9E7E',
  warn:      '#B5882B',  // 주의·골드
  warnAlt:   '#D97706',  // 오렌지
  danger:    '#B73E37',  // 비추·실패
  dangerSoft:'#C84427',

  // Neutrals
  text:      '#111111',
  textSub:   '#374151',
  textMeta:  '#6B7280',
  hint:      '#9CA3AF',
  divider:   '#F0F0F0',
  divider2:  '#E5E7EB',
  surface:   '#F9FAFB',
  surface2:  '#F3F4F6',
  cream:     '#FAF8F4',
  white:     '#FFFFFF',

  // Manner Grade (9단계)
  manner: {
    aPlus: '#000080', a0: '#3461C7',  // 네이비 패밀리
    bPlus: '#1F7A5C', b0: '#4F9E7E',  // 에메랄드
    cPlus: '#B5882B', c0: '#D97706',  // 골드/오렌지
    dPlus: '#C84427', d0: '#B73E37',  // 코랄
    f:     '#7C1D1D',                  // 다크 레드
  },
};
```

## 타이포

Pretendard Variable (이미 RN에서 expo-font로 로드 중이면 재사용).

```ts
export const F = {
  family: 'Pretendard Variable',
  mono:   'JetBrains Mono',  // 숫자 강조용 (없으면 fontVariant: ['tabular-nums'])

  // Sizes (정수)
  size: {
    xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 16,
    h3: 17, h2: 18, h1: 22, hero: 28, big: 40, jumbo: 64,
  },

  // Weights
  weight: {
    regular:  '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },

  // Line heights (배수)
  lh: { tight: 1.2, normal: 1.45, comfy: 1.6 },

  // Letter spacing
  ls: { tight: -0.4, normal: -0.2, wide: 0.5 },
};
```

## 간격·반경·그림자

```ts
export const SP = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40 };

export const R = { sm: 6, md: 8, lg: 12, xl: 16, full: 9999 };

export const SHADOW = {
  card: { // iOS
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1, // Android
  },
  pop: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
};
```

## 매핑 — Tailwind → 토큰

| HTML Tailwind | 토큰 |
|---|---|
| `text-[#000080]` | `C.inkNavy` |
| `text-[#111]` | `C.text` |
| `text-[#6B7280]` | `C.textMeta` |
| `text-[#9CA3AF]` | `C.hint` |
| `bg-[#F9FAFB]` | `C.surface` |
| `bg-[#F3F4F6]` | `C.surface2` |
| `border-[#F0F0F0]` | `C.divider` |
| `border-[#E5E7EB]` | `C.divider2` |
| `text-[14px]` | `F.size.md` |
| `text-[14.5px]` | `F.size.md` (정수화) |
| `font-semibold` | `F.weight.semibold` |
| `tracking-[-0.3px]` | `letterSpacing: -0.3` |
| `rounded-xl` | `R.lg` (12) |
| `rounded-full` | `R.full` |

## 다크모드

토큰을 `light` / `dark`로 한 번 더 감싸기. 1차 PR에서는 light만, PR-16에서 dark 추가.
