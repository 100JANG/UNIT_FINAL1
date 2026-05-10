import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  Tabs,
  IcBack,
} from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';

const POSTS = [
  { board: '학사', title: '계절학기 신청 일정 정리', time: '5시간 전' },
  { board: '자취', title: '자취방 계약할 때 조심할 점 공유합니다', time: '2시간 전' },
];
const COURSES = [
  { name: '데이터분석개론', prof: '김지연', rec: 78 },
  { name: '한국근현대사',   prof: '정민서', rec: 89 },
];
const CONTESTS = [
  { tag: '디자인', title: '청년 UX 디자인 공모전', dday: 'D-12' },
  { tag: '개발',   title: 'SW 알고리즘 챌린지',   dday: 'D-5' },
];
const JOBS = [
  { tag: '캠퍼스내', title: '주말 바리스타', wage: '시급 12,000원' },
];

export default function ScrapsV2() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('post');

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>스크랩</Text>
            </View>
          }
          trailing={
            <Pressable hitSlop={6}>
              <Text style={styles.editBtn}>편집</Text>
            </Pressable>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'post', label: '게시글', count: POSTS.length },
          { id: 'course', label: '강의', count: COURSES.length },
          { id: 'contest', label: '공모전', count: CONTESTS.length },
          { id: 'job', label: '알바', count: JOBS.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'post' &&
        POSTS.map((p, i) => (
          <View key={i}>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={styles.rowHead}>
                <Pill>{p.board}</Pill>
                <Text style={styles.metaText}>{p.time}</Text>
              </View>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {p.title}
              </Text>
            </Pressable>
            {i < POSTS.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}

      {tab === 'course' &&
        COURSES.map((c, i) => (
          <View key={i}>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowTitle}>{c.name}</Text>
              <Text style={styles.metaText}>
                {c.prof} ·{' '}
                <Text style={{ color: C.inkNavy, fontFamily: F.familySemiBold }}>
                  {c.rec}%
                </Text>{' '}
                추천
              </Text>
            </Pressable>
            {i < COURSES.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}

      {tab === 'contest' &&
        CONTESTS.map((c, i) => (
          <View key={i}>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={styles.rowHead}>
                <Pill tone="mist">{c.tag}</Pill>
                <Text style={[styles.metaText, { color: C.danger, fontFamily: F.familySemiBold }]}>
                  {c.dday}
                </Text>
              </View>
              <Text style={styles.rowTitle}>{c.title}</Text>
            </Pressable>
            {i < CONTESTS.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}

      {tab === 'job' &&
        JOBS.map((j, i) => (
          <View key={i}>
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={styles.rowHead}>
                <Pill tone="navy">{j.tag}</Pill>
              </View>
              <Text style={styles.rowTitle}>{j.title}</Text>
              <Text style={[styles.metaText, { color: C.inkNavy, fontFamily: F.familySemiBold }]}>
                {j.wage}
              </Text>
            </Pressable>
            {i < JOBS.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}
    </Screen>
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
  editBtn: {
    fontSize: F.size.sm,
    color: C.inkNavy,
    fontFamily: F.familyMedium,
    paddingHorizontal: SP[2],
    paddingVertical: SP[1],
  },
  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    gap: SP[1],
    backgroundColor: C.white,
  },
  pressed: { backgroundColor: C.surface },
  rowHead: { flexDirection: 'row', gap: SP[2], alignItems: 'center' },
  rowTitle: {
    fontSize: F.size.md,
    color: C.text,
    fontFamily: F.familyMedium,
    lineHeight: 19,
  },
  metaText: { fontSize: F.size.sm, color: C.textMeta },
});
