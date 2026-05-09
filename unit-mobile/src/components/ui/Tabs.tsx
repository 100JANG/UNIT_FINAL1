import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F, SP } from '../../theme/tokens';

type TabItem = {
  id: string;
  label: string;
  count?: number;
};

type TabsProps = {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
};

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <View style={styles.row}>
      {items.map((t) => {
        const on = t.id === active;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={styles.tab}
          >
            <Text style={[styles.label, on ? styles.labelActive : styles.labelInactive]}>
              {t.label}
            </Text>
            {t.count != null && (
              <Text style={styles.count}>{t.count}</Text>
            )}
            {on && <View style={styles.bar} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
    backgroundColor: C.white,
  },
  tab: {
    height: 44,
    paddingHorizontal: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[1],
    position: 'relative',
  },
  label: {
    fontSize: F.size.md,
  },
  labelActive: {
    color: C.text,
    fontFamily: F.familySemiBold,
  },
  labelInactive: {
    color: C.hint,
    fontFamily: F.family,
  },
  count: {
    fontSize: F.size.sm,
    color: C.hint,
    fontFamily: F.family,
  },
  bar: {
    position: 'absolute',
    left: SP[3],
    right: SP[3],
    bottom: 0,
    height: 2,
    backgroundColor: C.text,
  },
});
