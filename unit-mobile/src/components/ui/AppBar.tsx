import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { C, F, SP } from '../../theme/tokens';

type AppBarProps = {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
};

export function AppBar({ title, leading, trailing, divider = true }: AppBarProps) {
  return (
    <View style={[styles.container, divider && styles.divider]}>
      <View style={styles.leading}>
        {leading ?? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: SP[4],
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider2,
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[1],
    minWidth: 0,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[1],
  },
  title: {
    fontSize: F.size.h3,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
});
