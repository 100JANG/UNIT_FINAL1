import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcBell,
} from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';

const ROUTES = [
  { n: '101', name: '캠퍼스 ↔ 인천역', baseEta: 180, after: '23분' },
  { n: '202', name: '캠퍼스 ↔ 송도',   baseEta: 720, after: '32분' },
  { n: '303', name: '캠퍼스 ↔ 부평역', baseEta: 0,   after: '내일 07:30' },
  { n: '순환', name: '교내 순환',       baseEta: 300, after: '15분' },
];

export default function BusV2() {
  const navigation = useNavigation();
  const [tick, setTick] = useState(0);

  // 5-second poll
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const fmt = (sec: number) => {
    if (sec <= 0) return '운행종료';
    const adj = Math.max(0, sec - tick * 5);
    if (adj === 0) return '곧 도착';
    const m = Math.floor(adj / 60);
    return m < 1 ? `${adj}초 후` : `${m}분 후`;
  };

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>셔틀버스</Text>
            </View>
          }
          trailing={<IconButton icon={<IcBell />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.locBox}>
        <Text style={styles.locLabel}>현재 위치</Text>
        <Text style={styles.locValue}>인하대학교 정문 · 09:45</Text>
      </View>

      {ROUTES.map((r, i) => (
        <View key={i}>
          <View style={styles.row}>
            <View style={styles.rowHead}>
              <Pill tone="navy">{r.n}</Pill>
              <Text style={styles.rowName}>{r.name}</Text>
            </View>
            <View style={styles.rowGrid}>
              <View style={styles.col}>
                <Text style={styles.colLabel}>다음 도착</Text>
                <Text style={styles.colMain}>{fmt(r.baseEta)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.colLabel}>그 다음</Text>
                <Text style={styles.colSub}>{r.after}</Text>
              </View>
              <View style={[styles.col, { alignItems: 'flex-end' }]}>
                <Text style={styles.colLabel}>실시간</Text>
                <View style={styles.liveRow}>
                  <View style={styles.dot} />
                  <Text style={styles.liveText}>
                    {r.baseEta === 0 ? '운행 종료' : 'ETA 09:48'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {i < ROUTES.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  locBox: { paddingHorizontal: SP[4], paddingTop: SP[3], paddingBottom: SP[2] },
  locLabel: { fontSize: F.size.xs, color: C.hint },
  locValue: { fontSize: F.size.md, fontFamily: F.familyMedium, color: C.text, marginTop: 2 },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[4] },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  rowName: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.2 },
  rowGrid: { flexDirection: 'row', gap: SP[3] },
  col: { flex: 1 },
  colLabel: { fontSize: F.size.xs, color: C.hint },
  colMain: { marginTop: 2, fontSize: F.size.h1, fontFamily: F.familySemiBold, color: C.inkNavy, letterSpacing: -0.5 },
  colSub: { marginTop: 2, fontSize: F.size.md, color: C.textSub },
  liveRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.trust },
  liveText: { fontSize: F.size.sm, color: C.trust },
});
