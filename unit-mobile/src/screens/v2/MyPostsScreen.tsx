import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  Tabs,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import { useState } from 'react';

const POSTS = [
  { board: '자유', title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?', time: '12분 전', up: 24, cmt: 18, scrap: 4 },
  { board: '학사', title: '수강신청 서버 또 터질까요', time: '32분 전', up: 56, cmt: 41, scrap: 12 },
  { board: '시험', title: '중간고사 기간 도서관 자리 어디가 제일 낫나요', time: '1시간 전', up: 12, cmt: 9, scrap: 2 },
  { board: '자취', title: '자취방 계약할 때 조심할 점 공유합니다', time: '2시간 전', up: 89, cmt: 23, scrap: 47 },
];

export default function MyPostsV2() {
  const navigation = useNavigation();
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');

  return (
    <Screen
      bg={C.surface}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>내가 쓴 글</Text>
              <Pill tone="mist">{POSTS.length}</Pill>
            </View>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'recent', label: '최신순' },
          { id: 'popular', label: '인기순' },
        ]}
        active={sort}
        onChange={(id) => setSort(id as 'recent' | 'popular')}
      />

      <View style={{ padding: SP[3] }}>
        {POSTS.map((p, i) => (
          <View key={i}>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardHead}>
                <Pill>{p.board}</Pill>
                <Text style={styles.time}>{p.time}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {p.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: C.inkNavy, fontFamily: F.familySemiBold }]}>
                  추천 {p.up}
                </Text>
                <Text style={styles.meta}>댓글 {p.cmt}</Text>
                <Text style={styles.meta}>스크랩 {p.scrap}</Text>
              </View>
            </Pressable>
            {i < POSTS.length - 1 && <View style={{ height: 10 }} />}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  title: {
    fontSize: F.size.lg,
    fontFamily: F.familySemiBold,
    color: C.text,
    marginLeft: SP[1],
  },
  card: {
    backgroundColor: C.white,
    borderRadius: R.lg,
    padding: SP[4],
    borderWidth: 1,
    borderColor: C.divider2,
  },
  cardPressed: { backgroundColor: C.surface },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  time: { fontSize: F.size.sm, color: C.hint },
  cardTitle: {
    fontSize: F.size.xl,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: SP[1],
  },
  metaRow: { flexDirection: 'row', gap: SP[4], marginTop: SP[2] },
  meta: { fontSize: F.size.sm, color: C.textMeta },
});
