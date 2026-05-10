import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Hairline,
  Screen,
  Tabs,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';
import { useRtdbValue } from '../../hooks/useRtdbValue';
import { useMyUserId } from '../../hooks/useMyUserId';
import type { NotificationItem, NotificationType } from '../../types/notification';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPE_LABEL: Record<NotificationType, string> = {
  POST_COMMENT: '댓글',
  POST_LIKE: '추천',
  JURY_SUMMON: '배심원',
  RECAP_READY: '리캡',
  REPORT_RESULT: '신고',
  SYSTEM: '시스템',
};

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function NotificationsV2() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const {
    status,
    items,
    error,
    hasMore,
    isLoadingMore,
    unreadCount,
    loadMore,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();

  // RTDB realtime subscription: when EXPO_PUBLIC_ENABLE_RTDATABASE=true and
  // Firebase env is configured, subscribe to /notifications/{userId}. Any
  // change (new notification arriving, marked read elsewhere) triggers a
  // single REST refetch so the list stays the source of truth. When disabled,
  // useRtdbValue is a no-op and this whole chain stays inert.
  const userId = useMyUserId();
  const rtdbPath = userId ? `/notifications/${userId}` : null;
  const rtdbValue = useRtdbValue<unknown>(rtdbPath);
  const lastRtdbRef = useRef<unknown>(rtdbValue);
  useEffect(() => {
    if (rtdbValue !== lastRtdbRef.current) {
      lastRtdbRef.current = rtdbValue;
      // Skip the first emission (initial subscription value) to avoid a
      // duplicate refetch right after mount.
      if (rtdbValue !== null) refetch();
    }
  }, [rtdbValue, refetch]);

  const visible = useMemo(
    () => (tab === 'all' ? items : items.filter(n => !n.isRead)),
    [tab, items],
  );

  const onItemPress = (n: NotificationItem) => {
    markRead(n.id);
    if (n.type === 'JURY_SUMMON') {
      // Jury caseId is not in the notification payload — backend currently links
      // via deep RTDB structure. Until a payload field is added we just open
      // the Jury entry screen.
      navigation.navigate('Jury', {});
    }
  };

  return (
    <Screen
      appBar={
        <AppBar
          title="알림"
          trailing={
            <Pressable
              hitSlop={6}
              disabled={unreadCount === 0}
              onPress={markAllRead}
            >
              <Text style={[
                styles.allRead,
                unreadCount === 0 && { color: C.divider2 },
              ]}>
                모두 읽음
              </Text>
            </Pressable>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'all', label: '전체', count: items.length },
          { id: 'unread', label: '읽지 않음', count: unreadCount },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'all' | 'unread')}
      />

      {status === 'loading' || status === 'idle' ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : status === 'auth-required' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>로그인이 필요합니다</Text>
          <Text style={styles.stateBody}>피드 상단의 DEV 패널에서 sessionToken을 입력해주세요.</Text>
        </View>
      ) : status === 'reserved' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>준비 중인 기능입니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
        </View>
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>알림을 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : status === 'empty' || visible.length === 0 ? (
        <Text style={styles.empty}>
          {tab === 'unread' ? '안 읽은 알림이 없어요' : '알림이 없어요'}
        </Text>
      ) : (
        <ScrollView>
          {visible.map(n => (
            <View key={n.id}>
              <Pressable
                onPress={() => onItemPress(n)}
                style={({ pressed }) => [
                  styles.row,
                  !n.isRead && styles.unread,
                  pressed && { backgroundColor: C.surface },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: n.isRead ? 'transparent' : C.inkNavy },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.metaRow}>
                    <Text style={styles.kind}>{TYPE_LABEL[n.type] ?? n.type}</Text>
                    <Text style={styles.dotSep}>·</Text>
                    <Text style={styles.ago}>{formatRelative(n.createdAt)}</Text>
                  </View>
                  <Text style={[styles.title, !n.isRead && { fontFamily: F.familyMedium }]}>
                    {n.title}
                  </Text>
                  <Text style={styles.body} numberOfLines={1}>{n.body}</Text>
                </View>
              </Pressable>
              <Hairline mx={SP[4]} />
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

const styles = StyleSheet.create({
  allRead: {
    fontSize: F.size.sm, color: C.hint,
    paddingHorizontal: SP[2], paddingVertical: SP[1],
  },

  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    gap: SP[3],
    backgroundColor: C.white,
  },
  unread: { backgroundColor: C.surface },
  dot: { marginTop: 6, width: 6, height: 6, borderRadius: 3 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SP[1], marginBottom: 2 },
  kind: { fontSize: F.size.xs, color: C.hint },
  dotSep: { fontSize: F.size.xs, color: C.hint },
  ago: { fontSize: F.size.xs, color: C.hint },

  title: {
    fontSize: F.size.md,
    color: C.text,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  body: {
    marginTop: 4,
    fontSize: F.size.sm,
    color: C.textMeta,
    lineHeight: 17,
  },

  empty: {
    paddingTop: SP[7],
    fontSize: F.size.md,
    color: C.hint,
    textAlign: 'center',
  },

  center: { padding: SP[6], alignItems: 'center', gap: 6 },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: { marginTop: SP[3], paddingHorizontal: SP[4], paddingVertical: SP[2], backgroundColor: C.inkNavy, borderRadius: R.md },
  retryText: { color: C.white, fontSize: F.size.sm, fontFamily: F.familySemiBold },
  loadMoreBtn: { marginHorizontal: SP[4], marginVertical: SP[3], paddingVertical: SP[2], alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.divider2 },
  loadMoreText: { color: C.text, fontSize: F.size.sm, fontFamily: F.familyMedium },
});
