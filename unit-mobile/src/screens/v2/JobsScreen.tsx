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
} from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const ITEMS = [
  { id: 1, tag: '캠퍼스내', title: '주말 바리스타', wage: '시급 12,000원', dist: '0.2km', days: '토일', hours: '09:00~18:00', hot: true },
  { id: 2, tag: '과외',     title: '중3 영어', wage: '회당 60,000원', dist: '3.4km', days: '월수', hours: '19:00~21:00', hot: false },
  { id: 3, tag: '단기',     title: '컨퍼런스 운영 보조', wage: '일급 110,000원', dist: '8.7km', days: '5/24~5/26', hours: '08:30~18:00', hot: true },
  { id: 4, tag: '재택',     title: '대학생 설문조사 검토', wage: '건당 8,000원', dist: '재택', days: '자유', hours: '자유', hot: false },
  { id: 5, tag: '캠퍼스내', title: '학생회관 카페 평일', wage: '시급 11,500원', dist: '0.3km', days: '월~금', hours: '12:00~17:00', hot: false },
];

export default function JobsV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>알바</Text>
            </View>
          }
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      {ITEMS.map((it, i) => (
        <View key={it.id}>
          <Pressable
            onPress={() => navigation.navigate('JobDetail', { id: it.id })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.tagRow}>
              <Pill tone="navy">{it.tag}</Pill>
              <Text style={styles.dist}>{it.dist}</Text>
              {it.hot && (
                <View style={{ marginLeft: 'auto' }}>
                  <Pill tone="coral">급구</Pill>
                </View>
              )}
            </View>
            <Text style={styles.title2}>{it.title}</Text>
            <Text style={styles.wage}>{it.wage}</Text>
            <Text style={styles.meta}>
              📅 {it.days} · {it.hours}
            </Text>
          </Pressable>
          {i < ITEMS.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[4] },
  pressed: { backgroundColor: C.surface },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  dist: { fontSize: F.size.sm, color: C.hint },
  title2: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, lineHeight: 20, marginBottom: SP[1] },
  wage: { fontSize: F.size.base, color: C.inkNavy, fontFamily: F.familySemiBold, marginBottom: SP[1] },
  meta: { fontSize: F.size.sm, color: C.textMeta },
});
