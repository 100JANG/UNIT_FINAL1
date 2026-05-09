import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const HALLS = [
  { name: '중앙도서관 4층 제1열람실', total: 280, used: 242 },
  { name: '중앙도서관 4층 제2열람실', total: 180, used: 142 },
  { name: '중앙도서관 5층 제3열람실', total: 200, used: 88  },
  { name: '공대 별관 열람실',         total: 120, used: 31  },
  { name: '경영대 열람실',            total: 80,  used: 64  },
  { name: '기숙사 학습실 A',          total: 60,  used: 18  },
];

function statusOf(used: number, total: number) {
  const pct = used / total;
  if (pct > 0.85) return { color: C.danger, label: '혼잡' };
  if (pct > 0.55) return { color: C.warn,   label: '보통' };
  return { color: C.trust, label: '여유' };
}

export default function LibraryV2() {
  const navigation = useNavigation();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);
  void tick;

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>열람실</Text>
            </View>
          }
          trailing={<Text style={styles.refreshText}>2분 전 갱신</Text>}
        />
      }
    >
      {HALLS.map((h, i) => {
        const remain = h.total - h.used;
        const pct = (h.used / h.total) * 100;
        const st = statusOf(h.used, h.total);
        return (
          <View key={i}>
            <View style={styles.row}>
              <View style={styles.rowHead}>
                <Text style={styles.name} numberOfLines={1}>{h.name}</Text>
                <View style={styles.numCol}>
                  <Text style={[styles.bigNum, { color: st.color }]}>{remain}</Text>
                  <Text style={styles.totalText}>/ {h.total}석</Text>
                </View>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: st.color }]} />
              </View>
              <Text style={styles.statusLabel}>
                {st.label} · 잔여 {remain}석
              </Text>
            </View>
            {i < HALLS.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },
  refreshText: { fontSize: F.size.sm, color: C.textMeta, paddingHorizontal: SP[2] },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  rowHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SP[2], gap: SP[2] },
  name: { flex: 1, fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text },
  numCol: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  bigNum: { fontSize: F.size.xl, fontFamily: F.familyBold, letterSpacing: -0.5 },
  totalText: { fontSize: F.size.sm, color: C.hint },

  barTrack: { height: 6, borderRadius: R.full, backgroundColor: C.surface2, overflow: 'hidden' },
  barFill: { height: '100%' },
  statusLabel: { marginTop: 6, fontSize: F.size.xs, color: C.hint },
});
