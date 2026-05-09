/**
 * UNIT Design Tokens
 *
 * Single source of truth for colors, typography, spacing, radius, shadow.
 * Defined per docs/handoff/01_TOKENS.md.
 *
 * Rule: never inline #hex or px values in components — always import from here.
 */

// ─── Colors ────────────────────────────────────────────────────
export const C = {
  // Brand
  inkNavy:    '#000080', // primary
  cobalt:     '#3461C7',
  sky:        '#7BA7DC',
  mist:       '#DCE7F5',

  // Semantic
  trust:      '#1F7A5C', // 추천·성공·신뢰
  trustSoft:  '#4F9E7E',
  warn:       '#B5882B', // 주의·골드
  warnAlt:    '#D97706', // 오렌지
  danger:     '#B73E37', // 비추·실패
  dangerSoft: '#C84427',

  // Neutrals
  text:       '#111111',
  textSub:    '#374151',
  textMeta:   '#6B7280',
  hint:       '#9CA3AF',
  divider:    '#F0F0F0',
  divider2:   '#E5E7EB',
  surface:    '#F9FAFB',
  surface2:   '#F3F4F6',
  cream:      '#FAF8F4',
  white:      '#FFFFFF',
  black:      '#000000',

  // Manner Grade (9 단계)
  manner: {
    aPlus: '#000080', a0: '#3461C7',
    bPlus: '#1F7A5C', b0: '#4F9E7E',
    cPlus: '#B5882B', c0: '#D97706',
    dPlus: '#C84427', d0: '#B73E37',
    f:     '#7C1D1D',
  },
} as const;

// ─── Typography ────────────────────────────────────────────────
export const F = {
  family: 'Pretendard',
  familyMedium: 'Pretendard-Medium',
  familySemiBold: 'Pretendard-SemiBold',
  familyBold: 'Pretendard-Bold',
  mono: 'JetBrainsMono-Regular', // optional; falls back via fontVariant tabular-nums

  size: {
    xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 16,
    h3: 17, h2: 18, h1: 22, hero: 28, big: 40, jumbo: 64,
  },

  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },

  lh: { tight: 1.2, normal: 1.45, comfy: 1.6 },

  ls: { tight: -0.4, normal: -0.2, wide: 0.5 },
} as const;

// ─── Spacing (4pt baseline) ────────────────────────────────────
export const SP = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40,
} as const;

// ─── Radius ────────────────────────────────────────────────────
export const R = {
  sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
} as const;

// ─── Shadows (iOS + Android elevation) ─────────────────────────
export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pop: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export type ColorKey = keyof typeof C;
export type FontSize = keyof typeof F.size;
export type Spacing = keyof typeof SP;
export type Radius = keyof typeof R;
export type MannerGradeColor = keyof typeof C.manner;
