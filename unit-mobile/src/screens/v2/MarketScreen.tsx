import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcSearch,
  IcCheck,
} from '../../components/ui';
import type { PillTone } from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const ALL = [
  { id: 1, title: '맥북 에어 M2 13인치 (스페이스그레이)', price: 1180000, time: '15분 전', loc: '용현동', tag: '거래중'   as const, emoji: '💻' },
  { id: 2, title: '경영학원론 박상우 교재',                price: 12000,    time: '1시간 전', loc: '주안동', tag: '거래중'   as const, emoji: '📘' },
  { id: 3, title: '아이패드 미니 6세대 (퍼플)',           price: 580000,   time: '3시간 전', loc: '학익동', tag: '예약중'   as const, emoji: '📱' },
  { id: 4, title: '자전거 (출퇴근용)',                     price: 95000,    time: '어제',     loc: '용현동', tag: '거래중'   as const, emoji: '🚲' },
  { id: 5, title: '데이터분석개론 솔루션',                 price: 8000,     time: '2일 전',   loc: '도화동', tag: '거래완료' as const, emoji: '📚' },
];

const TONE_MAP: Record<typeof ALL[number]['tag'], PillTone> = {
  '거래중':   'mint',
  '예약중':   'gold',
  '거래완료': 'plain',
};

export default function MarketV2() {
  const navigation = useNavigation<Nav>();
  const [hideDone, setHideDone] = useState(true);

  const items = useMemo(
    () => (hideDone ? ALL.filter((i) => i.tag !== '거래완료') : ALL),
    [hideDone],
  );

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>중고장터</Text>
            </View>
          }
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      <View style={styles.filterBar}>
        <Pressable
          onPress={() => setHideDone((v) => !v)}
          style={({ pressed }) => [
            styles.filterChip,
            hideDone && { backgroundColor: C.inkNavy, borderColor: C.inkNavy },
            pressed && { opacity: 0.85 },
          ]}
        >
          {hideDone && <IcCheck size={12} color={C.white} />}
          <Text style={[styles.filterText, hideDone && { color: C.white }]}>
            거래완료 제외
          </Text>
        </Pressable>
        <Text style={styles.count}>{items.length}건</Text>
      </View>

      {items.map((it, i) => (
        <View key={it.id}>
          <Pressable
            onPress={() => navigation.navigate('MarketDetail', { id: it.id })}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surface }]}
          >
            <View style={styles.thumb}>
              <Text style={{ fontSize: 28 }}>{it.emoji}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>{it.title}</Text>
              <Text style={styles.meta}>{it.loc} · {it.time}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{it.price.toLocaleString()}원</Text>
                <Pill tone={TONE_MAP[it.tag]}>{it.tag}</Pill>
              </View>
            </View>
          </Pressable>
          {i < items.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  filterBar: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  filterChip: {
    height: 28,
    paddingHorizontal: SP[3],
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.divider2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: { fontSize: F.size.sm, color: C.textSub },
  count: { marginLeft: 'auto', fontSize: F.size.xs, color: C.hint },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[3], flexDirection: 'row', gap: SP[3] },
  thumb: {
    width: 78, height: 78, borderRadius: R.md,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: {
    fontSize: F.size.md,
    color: C.text,
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  meta: { marginTop: 2, fontSize: F.size.xs, color: C.hint },
  priceRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  price: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.3 },
});
