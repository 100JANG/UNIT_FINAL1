import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { ColorValue } from 'react-native';

type IconProps = { size?: number; color?: ColorValue };
type IconToggleProps = IconProps & { filled?: boolean };

export function IconSearch({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.6} />
      <Path d="m20 20-3.5-3.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconBell({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3a6 6 0 0 0-6 6v3.5L4.5 16.5h15L18 12.5V9a6 6 0 0 0-6-6Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconBack({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m15 18-6-6 6-6" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconMore({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="1.4" fill={color} />
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      <Circle cx="12" cy="19" r="1.4" fill={color} />
    </Svg>
  );
}

export function IconHome({ size = 22, color = '#333', filled = false }: IconToggleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconGrid({ size = 22, color = '#333', filled = false }: IconToggleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Rect x="4" y="4" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.6} />
      <Rect x="13" y="4" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.6} />
      <Rect x="4" y="13" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.6} />
      <Rect x="13" y="13" width="7" height="7" rx="1.5" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconChatTab({ size = 22, color = '#333', filled = false }: IconToggleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3l-4 4-4-4H6a2 2 0 0 1-2-2V6Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconUser({ size = 22, color = '#333', filled = false }: IconToggleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.6} />
      <Path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconPencil({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4l11-11-4-4L4 16v4Z"
        stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="m13 6 4 4" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function IconThumb({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 11v9H4v-9h3Zm0 0 4-7c1.5 0 2 1 2 2v3h5a2 2 0 0 1 2 2.4l-1.4 6.6a2 2 0 0 1-2 1.6H7"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconMsg({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V5Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBookmark({ size = 18, color = '#333', filled = false }: IconToggleProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path d="M6 4h12v17l-6-4-6 4V4Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconShare({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v11M8 8l4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChev({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m9 6 6 6-6 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function IconChevDn({ size = 14, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 9 6 6 6-6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m5 12 5 5 9-11"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconX({ size = 20, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function IconShield({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 4 6v6c0 4.5 3.5 8 8 9 4.5-1 8-4.5 8-9V6l-8-3Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCamera({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconPlus({ size = 18, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function IconSend({ size = 20, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12 20 4l-7 16-2-7-7-1Z"
        stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBus({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="4" width="14" height="13" rx="2" stroke={color} strokeWidth={1.6} />
      <Path d="M5 12h14M8 17v2M16 17v2"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx="9" cy="14.5" r="0.8" fill={color} />
      <Circle cx="15" cy="14.5" r="0.8" fill={color} />
    </Svg>
  );
}

export function IconFork({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4v8a2 2 0 0 0 2 2v6M9 4v6M5 4v6M15 4c-1 3-1 7 1 8v8"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconCal({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="6" width="16" height="14" rx="2" stroke={color} strokeWidth={1.6} />
      <Path d="M4 10h16M9 4v3M15 4v3"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconChair({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12v9H6V4Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M5 13h14M8 13v7M16 13v7"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconPhone({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 4h4l2 5-2.5 2a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconTrophy({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M9 14h6v3l1 4H8l1-4v-3Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBriefcase({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth={1.6} />
      <Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"
        stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconTag({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h7l9 9-7 7-9-9V4Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx="8.5" cy="8.5" r="1.2" fill={color} />
    </Svg>
  );
}

export function IconFriend({ size = 22, color = '#333' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth={1.6} />
      <Path d="M3 19c1-3 3-4.5 6-4.5s5 1.5 6 4.5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M17 11h4M19 9v4"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
