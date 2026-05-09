import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Screen,
  Switch,
  IcBack,
  IcMore,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const DAYS = ['월', '화', '수', '목', '금'];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const ROW_H = 50;
const TIME_W = 36;

const BLOCKS: { d: number; s: number; e: number; name: string; room: string; color: string }[] = [
  { d: 0, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: C.inkNavy },
  { d: 1, s: 13, e: 15, name: '데이터분석개론', room: '하이텍 502', color: C.inkNavy },
  { d: 1, s: 10, e: 12, name: '경영학원론',     room: '인경 305',   color: '#6B4F2E' },
  { d: 2, s: 14, e: 16, name: '한국근현대사',   room: '문과대 401', color: C.trust },
  { d: 3, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: C.inkNavy },
  { d: 3, s: 13, e: 14, name: '체육 (배드민턴)', room: '체육관',     color: C.danger },
  { d: 4, s: 10, e: 12, name: '선형대수',       room: '자연대 207', color: C.warn },
];

export default function TimetableV2() {
  const navigation = useNavigation();
  const [overlay, setOverlay] = useState(false);

  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>시간표</Text>
            </View>
          }
          trailing={<IconButton icon={<IcMore />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>친구 시간표 겹쳐 보기</Text>
        <Switch value={overlay} onChange={setOverlay} />
      </View>

      <View style={styles.dayHeader}>
        <View style={{ width: TIME_W }} />
        {DAYS.map((d) => (
          <View key={d} style={styles.dayCell}>
            <Text style={styles.dayText}>{d}</Text>
          </View>
        ))}
      </View>

      <View>
        {HOURS.map((h) => (
          <View key={h} style={[styles.hourRow, { height: ROW_H }]}>
            <Text style={styles.hourLabel}>{h}</Text>
            {DAYS.map((_, di) => (
              <View key={di} style={styles.cell} />
            ))}
          </View>
        ))}
        {BLOCKS.map((b, idx) => (
          <Block key={idx} b={b} />
        ))}
      </View>

      <Text style={styles.footer}>공강: 월 13~17 · 수 9~14 · 금 13~17</Text>
    </Screen>
  );
}

function Block({ b }: { b: { d: number; s: number; e: number; name: string; room: string; color: string } }) {
  const dayCols = DAYS.length;
  const top = (b.s - 9) * ROW_H;
  const height = (b.e - b.s) * ROW_H;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.blockAbs,
        { top, height },
      ]}
    >
      {Array.from({ length: dayCols }).map((_, i) =>
        i === b.d ? (
          <View key={i} style={[styles.block, { backgroundColor: b.color }]}>
            <Text numberOfLines={1} style={styles.blockTitle}>{b.name}</Text>
            <Text numberOfLines={1} style={styles.blockRoom}>{b.room}</Text>
          </View>
        ) : (
          <View key={i} style={{ flex: 1 }} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: {
    fontSize: F.size.lg,
    fontFamily: F.familySemiBold,
    color: C.text,
    marginLeft: SP[1],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
  },
  toggleLabel: { fontSize: F.size.md, color: C.text, fontFamily: F.family },

  dayHeader: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.divider2,
  },
  dayCell: { flex: 1, paddingVertical: SP[2], alignItems: 'center' },
  dayText: { fontSize: F.size.sm, color: C.textMeta, fontFamily: F.familyMedium },

  hourRow: { flexDirection: 'row' },
  hourLabel: {
    width: TIME_W,
    paddingTop: 4,
    paddingRight: 6,
    textAlign: 'right',
    fontSize: 11,
    color: C.hint,
  },
  cell: {
    flex: 1,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: C.divider,
  },

  blockAbs: {
    position: 'absolute',
    left: TIME_W,
    right: 0,
    flexDirection: 'row',
  },
  block: {
    flex: 1,
    padding: SP[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
  },
  blockTitle: {
    fontSize: 11,
    color: C.white,
    fontFamily: F.familySemiBold,
    lineHeight: 14,
  },
  blockRoom: {
    marginTop: 2,
    fontSize: 10,
    color: C.white,
    opacity: 0.8,
  },

  footer: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[4],
    fontSize: F.size.sm,
    color: C.hint,
  },
});
