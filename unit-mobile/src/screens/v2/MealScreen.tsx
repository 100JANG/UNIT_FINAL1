import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Chip,
  IconButton,
  Pill,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import { useState } from 'react';

const CARDS = [
  { time: '조식', range: '7:30~9:00',   cafe: '학생회관',   items: ['토스트', '계란프라이', '시리얼', '우유'], price: 3000, accent: C.warn },
  { time: '중식', range: '11:30~14:00', cafe: '학생회관',   items: ['제육덮밥', '미소된장국', '단무지', '깍두기'], price: 5500, accent: C.danger, hot: true },
  { time: '중식', range: '11:30~14:00', cafe: '교직원식당', items: ['치킨까스 정식', '카레라이스', '치킨샐러드'], price: 6500, accent: C.inkNavy },
  { time: '석식', range: '17:00~19:00', cafe: '학생회관',   items: ['김치찌개', '감자조림', '계란말이', '김'],     price: 5500, accent: C.trust },
];

const FILTERS = ['전체', '학생회관', '교직원식당', '기숙사'];

export default function MealV2() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('전체');
  return (
    <Screen
      bg={C.cream}
      scrollable={false}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>식단표</Text>
            </View>
          }
          trailing={<Pressable hitSlop={6}><Text style={styles.dateBtn}>5/12 (화)</Text></Pressable>}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>{f}</Chip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.gridWrap}>
        {CARDS.map((m, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.accent, { backgroundColor: m.accent }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTime}>{m.time}</Text>
                {m.hot && <Pill tone="coral">인기</Pill>}
              </View>
              <Text style={styles.cardRange}>{m.range}</Text>
              <Text style={styles.cardCafe}>{m.cafe}</Text>
              {m.items.map((it) => (
                <Text key={it} style={styles.itemText}>· {it}</Text>
              ))}
              <Text style={styles.cardPrice}>{m.price.toLocaleString()}원</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },
  dateBtn: { fontSize: F.size.sm, color: C.inkNavy, fontFamily: F.familyMedium, paddingHorizontal: SP[2] },
  filterRow: { paddingHorizontal: SP[4], paddingVertical: SP[3], gap: SP[2], backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.divider },
  gridWrap: { padding: SP[3], flexDirection: 'row', flexWrap: 'wrap', gap: SP[3] },
  card: { width: '47%', backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1, borderColor: C.divider, overflow: 'hidden' },
  accent: { height: 3 },
  cardBody: { padding: SP[3] },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  cardTime: { fontSize: F.size.base, fontFamily: F.familySemiBold, color: C.text },
  cardRange: { fontSize: 11, color: C.hint, marginTop: 2 },
  cardCafe: { fontSize: F.size.sm, color: C.textSub, marginTop: 2 },
  itemText: { fontSize: F.size.sm, color: C.textSub, lineHeight: 18, marginTop: 2 },
  cardPrice: { marginTop: SP[2], paddingTop: SP[2], borderTopWidth: 1, borderTopColor: C.divider, fontSize: F.size.sm, color: C.text, fontFamily: F.familySemiBold },
});
