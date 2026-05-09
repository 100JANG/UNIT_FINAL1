import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  Tabs,
  IcSearch,
  IcBell,
  IcChevDn,
} from '../../components/ui';
import { C, F, R, SHADOW, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const POSTS = [
  { id: 1, board: '자유', title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?', body: '아침에 시리얼 코너 사라지고 토스트 추가됐는데, 점심은 그대로인 것 같음.', nick: '익명', time: '12분 전', up: 24, cmt: 18, scrap: 4 },
  { id: 2, board: '학사', title: '수강신청 서버 또 터질까요', body: '오늘 밤 12시 1차 수강신청인데 작년 기억이 떠올라서 미리 글 남깁니다…', nick: '익명', time: '32분 전', up: 56, cmt: 41, scrap: 12 },
  { id: 3, board: '시험', title: '중간고사 기간 도서관 자리 어디가 제일 낫나요', body: '중도 4층 자리 거의 다 차 있고, 공대 별관은 의외로 한산하더라고요.', nick: '익명', time: '1시간 전', up: 12, cmt: 9, scrap: 2 },
  { id: 4, board: '자취', title: '자취방 계약할 때 조심할 점 공유합니다', body: '관리비 항목, 옵션 가구 상태, 누수 흔적, 결로 자국 — 이 네 가지는 꼭 확인하세요.', nick: '익명', time: '2시간 전', up: 89, cmt: 23, scrap: 47 },
  { id: 5, board: '학과', title: '데이터분석개론 팀플 멤버 구합니다', body: '수금 강의 듣는 분 중에 마지막 발표 같이 하실 분 한 분만 더 구해요.', nick: '익명', time: '3시간 전', up: 5, cmt: 7, scrap: 0 },
];

export default function FeedV2() {
  const navigation = useNavigation<Nav>();
  const [board, setBoard] = useState('all');

  return (
    <Screen
      bg="#F4F5F7"
      scrollable={false}
      appBar={
        <AppBar
          title="아주대학교"
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />
              <IconButton icon={<IcBell />} onPress={() => navigation.navigate('Notifications')} />
            </View>
          }
        />
      }
    >
      <View style={styles.tabRow}>
        <Tabs
          items={[
            { id: 'all',  label: '통합' },
            { id: 'mine', label: '내학교' },
            { id: 'dept', label: '내학과' },
          ]}
          active={board}
          onChange={setBoard}
        />
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortText}>최신순</Text>
          <IcChevDn size={12} color={C.textMeta} />
        </Pressable>
      </View>

      <FlatList
        data={POSTS}
        keyExtractor={(p) => p.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
            style={({ pressed }) => [
              styles.card,
              SHADOW.card,
              pressed && { backgroundColor: C.surface },
            ]}
          >
            <View style={styles.cardHead}>
              <Pill>{item.board}</Pill>
              <Text style={styles.metaText}>{item.nick} · {item.time}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            <View style={styles.statRow}>
              <Text style={[styles.stat, { color: C.inkNavy, fontFamily: F.familySemiBold }]}>
                👍 {item.up}
              </Text>
              <Text style={styles.stat}>💬 {item.cmt}</Text>
              <Text style={styles.stat}>🔖 {item.scrap}</Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.divider2,
  },
  sortBtn: {
    marginLeft: 'auto',
    paddingHorizontal: SP[3],
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: { fontSize: F.size.sm, color: C.textMeta },

  card: {
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider2,
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    marginBottom: SP[2],
  },
  metaText: { fontSize: F.size.xs, color: C.hint },
  title: {
    fontSize: F.size.xl,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 4,
  },
  body: {
    fontSize: F.size.base,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: SP[3],
  },
  statRow: { flexDirection: 'row', gap: SP[4] },
  stat: { fontSize: F.size.sm, color: C.textMeta },
});
