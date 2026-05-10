import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import type { RootStackParamList } from '../../types';
import { useFeedPosts } from '../../hooks/useFeedPosts';
import type { FeedScope } from '../../services/api/feedApi';
import type { PostSummary } from '../../services/api/mappers/postMapper';
import DevAuthPanel from '../../components/dev/DevAuthPanel';
import DemoSchoolEntry from '../../components/dev/DemoSchoolEntry';

// FeedScreen renders inside Tabs -> Root stack at runtime. PostDetail and
// Notifications live directly on Root; Search lives in the nested UnitV2 stack
// (reach it via navigate('UnitV2', { screen: 'Search' })).
type Nav = NativeStackNavigationProp<RootStackParamList>;

// Mock fallback. Used only when the live API has not yet returned a successful
// response for the current scope. Do NOT use in production once auth is wired —
// see docs/integration/01_FEED_API_CONNECTION_REPORT.md.
const FALLBACK_POSTS: PostSummary[] = [
  { postId: 'mock_1', boardId: 'free',  boardName: '자유', title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?', preview: '아침에 시리얼 코너 사라지고 토스트 추가됐는데, 점심은 그대로인 것 같음.', author: { anonymousId: '익명' }, createdAt: '2026-05-10T07:30:00Z', stats: { likes: 24, comments: 18, scraps: 4 } },
  { postId: 'mock_2', boardId: 'study', boardName: '학사', title: '수강신청 서버 또 터질까요',                  preview: '오늘 밤 12시 1차 수강신청인데 작년 기억이 떠올라서 미리 글 남깁니다…',           author: { anonymousId: '익명' }, createdAt: '2026-05-10T07:00:00Z', stats: { likes: 56, comments: 41, scraps: 12 } },
];

const TAB_TO_SCOPE: Record<string, FeedScope> = {
  all: 'all',
  mine: 'school',
  dept: 'department',
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function FeedV2() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<keyof typeof TAB_TO_SCOPE>('all');
  const scope = TAB_TO_SCOPE[tab];

  const { status, posts, error, hasMore, isLoadingMore, loadMore, refetch } = useFeedPosts({ scope });

  // mock fallback only while we have no API success yet for this scope.
  const data = useMemo(() => (status === 'success' ? posts : FALLBACK_POSTS), [status, posts]);

  return (
    <Screen
      bg="#F4F5F7"
      scrollable={false}
      appBar={
        <AppBar
          title="아주대학교"
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcSearch />} onPress={() => navigation.navigate('UnitV2', { screen: 'Search' })} />
              <IconButton icon={<IcBell />} onPress={() => navigation.navigate('Notifications')} />
            </View>
          }
        />
      }
    >
      {/* DEMO_MODE_START — 운영 모드에선 컴포넌트가 null 을 반환해 자동으로 숨겨진다. */}
      <DemoSchoolEntry onEntered={() => refetch()} />
      {/* DEMO_MODE_END */}

      <DevAuthPanel />

      <View style={styles.tabRow}>
        <Tabs
          items={[
            { id: 'all',  label: '통합' },
            { id: 'mine', label: '내학교' },
            { id: 'dept', label: '내학과' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as keyof typeof TAB_TO_SCOPE)}
        />
        <Pressable style={styles.sortBtn}>
          <Text style={styles.sortText}>최신순</Text>
          <IcChevDn size={12} color={C.textMeta} />
        </Pressable>
      </View>

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}

      {status === 'business-rule' && (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>학교/학과 정보가 등록되지 않았습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '프로필에서 학교와 학과를 먼저 설정해주세요.'}</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>피드를 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      )}

      {status === 'empty' && (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>아직 글이 없어요</Text>
          <Text style={styles.stateBody}>첫 번째 글을 작성해보세요.</Text>
        </View>
      )}

      {(status === 'success' || status === 'idle') && (
          <FlatList
            data={data}
            keyExtractor={(p) => p.postId}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate('PostDetail', { postId: item.postId })}
                style={({ pressed }) => [
                  styles.card,
                  SHADOW.card,
                  pressed && { backgroundColor: C.surface },
                ]}
              >
                <View style={styles.cardHead}>
                  <Pill>{item.boardName ?? item.boardId}</Pill>
                  <Text style={styles.metaText}>
                    {item.author.anonymousId} · {formatRelative(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{item.preview}</Text>
                <View style={styles.statRow}>
                  <Text style={[styles.stat, { color: C.inkNavy, fontFamily: F.familySemiBold }]}>
                    👍 {item.stats.likes}
                  </Text>
                  <Text style={styles.stat}>💬 {item.stats.comments}</Text>
                  <Text style={styles.stat}>🔖 {item.stats.scraps}</Text>
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
            onEndReachedThreshold={0.4}
            onEndReached={() => { if (status === 'success' && hasMore) loadMore(); }}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={{ paddingVertical: 16 }}><ActivityIndicator /></View>
              ) : null
            }
          />
        )}
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

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SP[6],
    paddingVertical: SP[8],
    gap: 6,
  },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: {
    marginTop: SP[3],
    paddingHorizontal: SP[4],
    paddingVertical: SP[2],
    backgroundColor: C.inkNavy,
    borderRadius: R.md,
  },
  retryText: { color: C.white, fontFamily: F.familySemiBold, fontSize: F.size.sm },
});
