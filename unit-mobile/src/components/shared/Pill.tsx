import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

export type PillTone =
  | 'plain'
  | 'navy'
  | 'navySolid'
  | 'line'
  | 'mint'
  | 'warn'
  | 'cream'
  | 'cobalt';

const TONE: Record<PillTone, { bg: string; fg: string; border?: string }> = {
  plain:     { bg: '#EEF0F3', fg: '#1F2937' },
  navy:      { bg: '#DDDDF1', fg: '#000080' },
  navySolid: { bg: '#000080', fg: '#FFFFFF' },
  line:      { bg: '#FFFFFF', fg: '#1F2937', border: '#D1D5DB' },
  mint:      { bg: '#D6EBE0', fg: '#155E45' },
  warn:      { bg: '#FADAD3', fg: '#992F26' },
  cream:     { bg: '#F4ECDC', fg: '#5A3F1E' },
  cobalt:    { bg: '#DDE4F8', fg: '#1F3A8A' },
};

type PillProps = {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
};

export function Pill({ children, tone = 'plain', className = '' }: PillProps) {
  const t = TONE[tone];
  return (
    <View
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: t.border ? 1 : 0,
      }}
      className={`h-[20px] px-2 rounded-md flex-row items-center self-start ${className}`}
    >
      <Text
        style={{ color: t.fg, fontFamily: 'Pretendard-SemiBold' }}
        className="text-[11px]"
      >
        {children}
      </Text>
    </View>
  );
}
