import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  MannerBadge,
  Pill,
  Screen,
  IcBack,
  IcMore,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const USER = {
  name: '민서연',
  dept: '소프트웨어학과',
  year: 22,
  manner: { grade: 'A0' as const, score: 88 },
  stats: { posts: 18, comments: 124, recv: 326 },
};

const RECENT_POSTS = [
  { board: '학사', title: '계절학기 신청 일정 정리' },
  { board: '자유', title: '수강신청 팁 공유합니다' },
  { board: '시험', title: '중간고사 정리본 공유' },
];

export default function OtherProfileV2() {
  const navigation = useNavigation();
  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          trailing={<IconButton icon={<IcMore />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <Avatar name={USER.name} size={56} />
          <View style={styles.heroMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{USER.name}</Text>
              <MannerBadge grade={USER.manner.grade} size="sm" />
            </View>
            <Text style={styles.dept}>
              {USER.dept} · {USER.year}학번
            </Text>
          </View>
          <Pressable style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.addBtnText}>친구추가</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          {[
            { l: '작성', v: USER.stats.posts },
            { l: '댓글', v: USER.stats.comments },
            { l: '받은 추천', v: USER.stats.recv },
          ].map((s, i) => (
            <View key={i} style={styles.statCol}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.hint}>익명으로 작성한 글은 표시되지 않아요</Text>

      <Text style={styles.sectionLabel}>최근 글</Text>
      {RECENT_POSTS.map((p, i) => (
        <View key={i}>
          <Pressable style={({ pressed }) => [styles.postRow, pressed && { backgroundColor: C.surface }]}>
            <Pill>{p.board}</Pill>
            <Text style={styles.postTitle} numberOfLines={1}>
              {p.title}
            </Text>
          </Pressable>
          {i < RECENT_POSTS.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}

      <View style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.dmBtn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.dmBtnText}>1:1 익명 메시지 보내기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[5],
    backgroundColor: C.cream,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SP[3] },
  heroMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SP[1] },
  name: {
    fontSize: F.size.h3,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.3,
  },
  dept: { fontSize: F.size.sm, color: C.textMeta, marginTop: 2 },
  addBtn: {
    height: 36,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: F.size.sm,
    color: C.white,
    fontFamily: F.familySemiBold,
  },
  stats: {
    marginTop: SP[5],
    paddingTop: SP[4],
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: F.size.xl,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  statLabel: { marginTop: 2, fontSize: F.size.xs, color: C.hint },

  hint: {
    paddingHorizontal: SP[5],
    paddingTop: SP[3],
    fontSize: F.size.sm,
    color: C.hint,
  },
  sectionLabel: {
    paddingHorizontal: SP[5],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },
  postRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    backgroundColor: C.white,
  },
  postTitle: { flex: 1, fontSize: F.size.md, color: C.text },

  bottomBar: {
    marginTop: SP[6],
    padding: SP[4],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.white,
  },
  dmBtn: {
    height: 48,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.inkNavy,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmBtnText: {
    fontSize: F.size.md,
    fontFamily: F.familySemiBold,
    color: C.inkNavy,
  },
});
