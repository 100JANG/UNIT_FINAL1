import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { C, F, R, SP } from '../../theme/tokens';

type ChipProps = {
  active?: boolean;
  onPress?: () => void;
  children: ReactNode;
};

export function Chip({ active = false, onPress, children }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: C.inkNavy,
  },
  inactive: {
    backgroundColor: C.surface2,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: F.size.sm,
  },
  textActive: {
    color: C.white,
    fontFamily: F.familySemiBold,
  },
  textInactive: {
    color: C.textMeta,
    fontFamily: F.family,
  },
});
