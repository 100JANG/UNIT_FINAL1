/**
 * UI Icons (12) — react-native-svg
 *
 * Per docs/handoff/04_MIGRATION_MAP.md icon section.
 * All icons accept { size?: number; color?: string } props.
 */
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { C } from '../../theme/tokens';

type IconProps = { size?: number; color?: string };

export const IcSearch = ({ size = 22, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.6} />
    <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const IcBell = ({ size = 22, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16.5h15L18 12.5V9a6 6 0 0 0-6-6Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const IcThumb = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 11v9H4v-9h3Zm0 0 4-7c1.5 0 2 1 2 2v3h5a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.6H7"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IcBookmark = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4h12v17l-6-4-6 4V4Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IcChev = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m9 6 6 6-6 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

export const IcChevDn = ({ size = 14, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m6 9 6 6 6-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const IcBack = ({ size = 22, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m15 18-6-6 6-6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IcX = ({ size = 20, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

export const IcMore = ({ size = 22, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={1.4} fill={color} />
    <Circle cx={12} cy={12} r={1.4} fill={color} />
    <Circle cx={12} cy={19} r={1.4} fill={color} />
  </Svg>
);

export const IcMsg = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

export const IcShare = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4v11M8 8l4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IcCheck = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 5 5 9-11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bonus: pencil for FAB, plus for + button — referenced by BottomTab etc.
export const IcPencil = ({ size = 22, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 20h4l11-11-4-4L4 16v4Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path d="m13 6 4 4" stroke={color} strokeWidth={1.7} />
  </Svg>
);

export const IcPlus = ({ size = 18, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const IcSend = ({ size = 20, color = C.text }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12 20 4l-7 16-2-7-7-1Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

// Aggregate for convenient `Ic.search(...)` style call sites
export const Ic = {
  search:   IcSearch,
  bell:     IcBell,
  thumb:    IcThumb,
  bookmark: IcBookmark,
  chev:     IcChev,
  chevDn:   IcChevDn,
  back:     IcBack,
  x:        IcX,
  more:     IcMore,
  msg:      IcMsg,
  share:    IcShare,
  check:    IcCheck,
  pencil:   IcPencil,
  plus:     IcPlus,
  send:     IcSend,
};
