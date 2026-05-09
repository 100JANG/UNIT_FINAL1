import { StyleSheet, View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { C, F, R, SP } from '../../theme/tokens';

export type PillTone = 'plain' | 'navy' | 'mint' | 'coral' | 'gold' | 'mist';

type PillProps = {
  tone?: PillTone;
  children: ReactNode;
};

const TONE: Record<PillTone, { bg: string; fg: string }> = {
  plain: { bg: C.surface2, fg: C.textMeta },
  navy:  { bg: C.inkNavy,  fg: C.white },
  mint:  { bg: C.trust,    fg: C.white },
  coral: { bg: C.danger,   fg: C.white },
  gold:  { bg: C.warn,     fg: C.white },
  mist:  { bg: C.mist,     fg: C.inkNavy },
};

export function Pill({ tone = 'plain', children }: PillProps) {
  const t = TONE[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 20,
    paddingHorizontal: SP[2],
    borderRadius: R.sm,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: F.familySemiBold,
    fontSize: F.size.xs,
  },
});
