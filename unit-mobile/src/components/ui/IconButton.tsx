import { Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { C } from '../../theme/tokens';

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  hitSlop?: number;
};

const HIT = 8;

export function IconButton({
  icon,
  onPress,
  disabled = false,
  hitSlop = HIT,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: C.surface2,
    borderRadius: 22,
  },
  disabled: {
    opacity: 0.4,
  },
});
