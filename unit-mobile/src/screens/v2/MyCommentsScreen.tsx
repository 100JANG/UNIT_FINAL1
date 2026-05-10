import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useMyComments } from '../../hooks/useMyActivity';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function MyCommentsV2() {
  const navigation = useNavigation<Nav>();
  const { status, items, error, hasMore, isLoadingMore, loadMore, refetch } = useMyComments();

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>내가 쓴 댓글</Text>
              {status === 'success' && <Pill tone="mist">{items.length}{hasMore ? '+' : ''}</Pill>}
            </View>
          }
        />
      }
    >
      {status === 'loading' || status === 'idle' ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : status === 'auth-required' ? (
        <CenteredText title="로그인이 필요합니다" body="피드 상단의 DEV 패널에서 sessionToken을 입력해주세요." />
      ) : status === 'reserved' ? (
        <CenteredText title="준비 중인 기능입니다" body={error?.message ?? ''} />
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>댓글을 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : status === 'empty' ? (
        <CenteredText title="작성한 댓글이 없어요" body="" />
      ) : (
        <ScrollView>
          {items.map((c, i) => (
            <View key={c.commentId}>
              <Pressable
                onPress={() => navigation.navigate('PostDetail', { postId: c.postId })}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.surface }]}
              >
                <View style={styles.rowHead}>
                  <Text style={styles.time}>{formatRelative(c.createdAt)}</Text>
                </View>
                <Text
                  style={[styles.body, c.deleted && { color: C.hint, fontStyle: 'italic' }]}
                  numberOfLines={3}
                >
                  {c.content}
                </Text>
              </Pressable>
              {i < items.length - 1 && <Hairline mx={SP[4]} />}
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
        </ScrollView>
      )}
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
  row: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: 4 },
  time: { fontSize: F.size.xs, color: C.hint },
  body: { fontSize: F.size.base, color: C.textSub, lineHeight: 21 },

  center: { padding: SP[6], alignItems: 'center', gap: 6 },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: { marginTop: SP[3], paddingHorizontal: SP[4], paddingVertical: SP[2], backgroundColor: C.inkNavy, borderRadius: R.md },
  retryText: { color: C.white, fontSize: F.size.sm, fontFamily: F.familySemiBold },
  loadMoreBtn: { marginHorizontal: SP[4], marginVertical: SP[3], paddingVertical: SP[2], alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.divider2 },
  loadMoreText: { color: C.text, fontSize: F.size.sm, fontFamily: F.familyMedium },
});
