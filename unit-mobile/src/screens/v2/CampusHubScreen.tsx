import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Screen,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const TILES: { id: keyof UnitV2ParamList; label: string; emoji: string; tone: string }[] = [
  { id: 'Timetable', label: '시간표',     emoji: '📅', tone: '#000080' },
  { id: 'Meal',      label: '식단',       emoji: '🍱', tone: '#1F7A5C' },
  { id: 'Bus',       label: '셔틀',       emoji: '🚌', tone: '#B5882B' },
  { id: 'Library',   label: '열람실',     emoji: '📚', tone: '#D97706' },
  { id: 'Contacts',  label: '교내 연락처', emoji: '📞', tone: '#3461C7' },
  { id: 'Courses',   label: '강의평',     emoji: '⭐', tone: '#B73E37' },
];

const QUICK = [
  { l: '오늘 학식', v: '제육덮밥', c: C.warn },
  { l: '셔틀',      v: '3분 후',  c: C.inkNavy },
  { l: '도서관',    v: '38석 남음', c: C.trust },
];

export default function CampusHubV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          title="캠퍼스"
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          오늘 · <Text style={styles.bold}>5월 12일 화요일</Text>
        </Text>
        <Text style={styles.greetingSub}>다음 수업까지 1시간 남았어요</Text>
      </View>

      <View style={styles.quickRow}>
        {QUICK.map((q, i) => (
          <View key={i} style={styles.quickCard}>
            <Text style={styles.quickLabel}>{q.l}</Text>
            <Text style={[styles.quickValue, { color: q.c }]}>{q.v}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tileGrid}>
        {TILES.map((t) => (
          <Pressable
            key={t.id}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate(t.id as never)}
          >
            <View style={[styles.tileBubble, { backgroundColor: t.tone + '15' }]}>
              <Text style={styles.tileEmoji}>{t.emoji}</Text>
            </View>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[3],
  },
  greetingText: { fontSize: F.size.xl, color: C.text, fontFamily: F.familyMedium },
  greetingSub: { marginTop: 4, fontSize: F.size.sm, color: C.textMeta },
  bold: { fontFamily: F.familySemiBold },

  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: SP[4],
    gap: SP[2],
  },
  quickCard: {
    flex: 1,
    paddingVertical: SP[3],
    paddingHorizontal: SP[3],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
  },
  quickLabel: { fontSize: F.size.xs, color: C.hint },
  quickValue: { marginTop: 4, fontSize: F.size.md, fontFamily: F.familySemiBold },

  tileGrid: {
    margin: SP[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP[2],
  },
  tile: {
    width: '32%',
    aspectRatio: 1,
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SP[2],
  },
  tileBubble: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  tileEmoji: { fontSize: 24 },
  tileLabel: { fontSize: F.size.sm, color: C.text, fontFamily: F.familyMedium },
});
