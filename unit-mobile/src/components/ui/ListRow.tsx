import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { C, F, SP } from '../../theme/tokens';
import { IcChev, IcCheck } from './icons';
import { Switch } from './Switch';

type Trailing = 'chev' | 'switch' | 'check' | ReactNode;

type ListRowProps = {
  label: string;
  value?: string;
  trailing?: Trailing;
  onPress?: () => void;
  destructive?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
  disabled?: boolean;
};

export function ListRow({
  label,
  value,
  trailing,
  onPress,
  destructive = false,
  switchValue,
  onSwitchChange,
  disabled = false,
}: ListRowProps) {
  const inner = (
    <>
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
      <View style={styles.trailing}>
        {value != null && <Text style={styles.value}>{value}</Text>}
        {trailing === 'chev' && <IcChev size={16} color={C.hint} />}
        {trailing === 'check' && <IcCheck size={18} color={C.inkNavy} />}
        {trailing === 'switch' && (
          <Switch
            value={switchValue ?? false}
            onChange={onSwitchChange ?? (() => undefined)}
            disabled={disabled}
          />
        )}
        {trailing != null && typeof trailing !== 'string' && trailing}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.row, disabled && styles.disabled]}>{inner}</View>;
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    paddingHorizontal: SP[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
  },
  pressed: {
    backgroundColor: C.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: F.size.md,
    color: C.text,
    fontFamily: F.family,
    flexShrink: 1,
  },
  labelDestructive: {
    color: C.danger,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  value: {
    fontSize: F.size.base,
    color: C.textMeta,
    fontFamily: F.family,
  },
});
