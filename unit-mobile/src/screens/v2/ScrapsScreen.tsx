import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useMyScraps } from '../../hooks/useMyActivity';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function ScrapsV2() {
  const navigation = useNavigation<Nav>();
  const { status, items, error, hasMore, isLoadingMore, loadMore, refetch } = useMyScraps();

  return (
    <Screen
      bg={C.surface}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>스크랩</Text>
              {status === 'success' && <Pill tone="mist">{items.length}{hasMore ? '+' : ''}</Pill>}
            </View>
          }
        />
      }
    >
      <ScrollView contentContainerStyle={{ padding: SP[3] }}>
        {status === 'loading' || status === 'idle' ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : status === 'auth-required' ? (
          <CenteredText title="로그인이 필요합니다" body="피드 상단의 DEV 패널에서 sessionToken을 입력해주세요." />
        ) : status === 'reserved' ? (
          <CenteredText title="준비 중인 기능입니다" body={error?.message ?? ''} />
        ) : status === 'error' ? (
          <View style={styles.center}>
            <Text style={styles.stateTitle}>스크랩을 불러오지 못했습니다</Text>
            <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
            <Pressable onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : status === 'empty' ? (
          <CenteredText title="스크랩한 글이 없어요" body="마음에 드는 글을 스크랩해보세요." />
        ) : (
          <>
            {items.map((s, i) => (
              <View key={s.postId}>
                <Pressable
                  onPress={() => navigation.navigate('PostDetail', { postId: s.postId })}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <View style={styles.cardHead}>
                    <Pill>{s.boardName ?? s.boardId}</Pill>
                    <Text style={styles.time}>{formatRelative(s.scrappedAt)}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{s.title}</Text>
                  <Text style={styles.preview} numberOfLines={2}>{s.preview}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>👍 {s.stats.likes}</Text>
                    <Text style={styles.meta}>💬 {s.stats.comments}</Text>
                    <Text style={styles.meta}>🔖 {s.stats.scraps}</Text>
                  </View>
                </Pressable>
                {i < items.length - 1 && <View style={{ height: 10 }} />}
              </View>
            ))}
            {hasMore && (
              <Pressable
                onPress={loadMore}
                disabled={isLoadingMore}
                style={({ pressed }) => [
                  styles.loadMoreBtn,
                  (pressed || isLoadingMore) && { opacity: 0.6 },
                ]}
              >
                {isLoadingMore ? <ActivityIndicator size="small" /> : <Text style={styles.loadMoreText}>더보기</Text>}
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function CenteredText({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={styles.stateBody}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },
  card: { backgroundColor: C.white, borderRadius: R.lg, padding: SP[4], borderWidth: 1, borderColor: C.divider2 },
  cardPressed: { backgroundColor: C.surface },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  time: { fontSize: F.size.sm, color: C.hint },
  cardTitle: { fontSize: F.size.xl, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.3, lineHeight: 22, marginBottom: SP[1] },
  preview: { fontSize: F.size.sm, color: C.textMeta, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: SP[4], marginTop: SP[2] },
  meta: { fontSize: F.size.sm, color: C.textMeta },

  center: { padding: SP[6], alignItems: 'center', gap: 6 },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: { marginTop: SP[3], paddingHorizontal: SP[4], paddingVertical: SP[2], backgroundColor: C.inkNavy, borderRadius: R.md },
  retryText: { color: C.white, fontSize: F.size.sm, fontFamily: F.familySemiBold },
  loadMoreBtn: { marginVertical: SP[3], paddingVertical: SP[2], alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.divider2 },
  loadMoreText: { color: C.text, fontSize: F.size.sm, fontFamily: F.familyMedium },
});
