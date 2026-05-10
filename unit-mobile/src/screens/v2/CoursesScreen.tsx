import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Chip,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COURSES = [
  { id: 'demo_course_1', name: '데이터분석개론', prof: '김지연', dept: '소프트웨어학과', credit: 3, rec: 78, n: 412, partic: 73, trust: true },
  { id: 'demo_course_2', name: '경영학원론',     prof: '박상우', dept: '경영학과',       credit: 3, rec: 64, n: 286, partic: 81, trust: true },
  { id: 'demo_course_3', name: '미시경제학',     prof: '이태형', dept: '경제학과',       credit: 3, rec: 41, n: 198, partic: 58, trust: false },
  { id: 'demo_course_4', name: '한국근현대사',   prof: '정민서', dept: '사학과',         credit: 2, rec: 89, n: 524, partic: 76, trust: true },
];

const FILTERS = ['2025-1학기', '아주대학교', '전체 학과', '추천순'];

type Vote = 'rec' | 'no' | null;

export default function CoursesV2() {
  const navigation = useNavigation<Nav>();
  const [voted, setVoted] = useState<Record<string, Vote>>({});
  const vote = (id: string, v: 'rec' | 'no') =>
    setVoted((p) => ({ ...p, [id]: p[id] === v ? null : v }));

  return (
    <Screen
      appBar={
        <AppBar
          title="강의평"
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('UnitV2', { screen: 'Search' })} />}
        />
      }
    >
      <Pressable
        onPress={() => navigation.navigate('UnitV2', { screen: 'Search' })}
        style={({ pressed }) => [styles.searchBox, pressed && { opacity: 0.85 }]}
      >
        <IcSearch size={18} color={C.hint} />
        <Text style={styles.searchText}>강의명, 교수명으로 검색</Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Chip key={f}>{f}</Chip>
        ))}
      </ScrollView>
      <Hairline />

      {COURSES.map((c, i) => (
        <View key={c.id}>
          <View style={styles.row}>
            <Pressable
              onPress={() => navigation.navigate('CourseDetail', { courseId: c.id })}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <View style={styles.titleRow}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.prof}>{c.prof}</Text>
                {c.trust && (
                  <View style={{ marginLeft: 'auto' }}>
                    <Pill tone="mint">신뢰</Pill>
                  </View>
                )}
              </View>
              <Text style={styles.meta}>{c.dept} · {c.credit}학점</Text>
              <View style={styles.statRow}>
                <Text style={styles.statRec}>
                  <Text style={{ color: C.inkNavy, fontFamily: F.familySemiBold }}>{c.rec}%</Text> 추천
                </Text>
                <Text style={styles.statSep}>·</Text>
                <Text style={styles.stat}>응답 {c.n}</Text>
                <Text style={styles.statSep}>·</Text>
                <Text style={styles.stat}>참여율 {c.partic}%</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${c.rec}%` }]} />
              </View>
            </Pressable>

            <View style={styles.voteRow}>
              <Pressable
                onPress={() => vote(c.id, 'rec')}
                style={({ pressed }) => [
                  styles.voteBtn,
                  voted[c.id] === 'rec' && styles.voteBtnRec,
                  pressed && voted[c.id] !== 'rec' && { backgroundColor: C.surface },
                ]}
              >
                <Text style={[styles.voteText, voted[c.id] === 'rec' && { color: C.white }]}>
                  👍 추천
                </Text>
              </Pressable>
              <Pressable
                onPress={() => vote(c.id, 'no')}
                style={({ pressed }) => [
                  styles.voteBtn,
                  voted[c.id] === 'no' && styles.voteBtnNo,
                  pressed && voted[c.id] !== 'no' && { backgroundColor: C.surface },
                ]}
              >
                <Text style={[styles.voteText, voted[c.id] === 'no' && { color: C.white }]}>
                  👎 비추천
                </Text>
              </Pressable>
            </View>
          </View>
          {i < COURSES.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    marginHorizontal: SP[4],
    marginTop: SP[2],
    marginBottom: SP[3],
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  searchText: { fontSize: F.size.base, color: C.hint },
  filterRow: { paddingHorizontal: SP[4], paddingBottom: SP[2], gap: SP[2] },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  pressed: { opacity: 0.85 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: SP[2], marginBottom: 4 },
  name: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.3 },
  prof: { fontSize: F.size.sm, color: C.textMeta },
  meta: { fontSize: F.size.xs, color: C.hint, marginBottom: SP[2] },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  statRec: { fontSize: F.size.sm, color: C.textMeta },
  stat: { fontSize: F.size.sm, color: C.textMeta },
  statSep: { color: C.divider2 },
  barTrack: { marginTop: SP[2], height: 3, borderRadius: R.full, backgroundColor: C.surface2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.inkNavy },

  voteRow: { marginTop: SP[3], flexDirection: 'row', gap: SP[2] },
  voteBtn: {
    flex: 1, height: 36, borderRadius: R.md,
    borderWidth: 1, borderColor: C.divider2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.white,
  },
  voteBtnRec: { backgroundColor: C.inkNavy, borderColor: C.inkNavy },
  voteBtnNo: { backgroundColor: C.danger, borderColor: C.danger },
  voteText: { fontSize: F.size.sm, color: C.textSub, fontFamily: F.familyMedium },
});
