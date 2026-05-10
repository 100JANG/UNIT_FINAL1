import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  Screen,
  Tabs,
} from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;
type Kind = 'cmt' | 'rec' | 'jury' | 'sys';

type Notif = { kind: Kind; read: boolean; ago: string; title: string; body: string };

const INIT: Notif[] = [
  { kind: 'cmt',  read: false, ago: '방금',     title: '내 글에 댓글이 달렸어요',                    body: '익명3 · 식단표 학사정보 사이트에 올라와 있어요…' },
  { kind: 'jury', read: false, ago: '5분 전',  title: '같은 학과 학생들의 판단을 기다리고 있어요',  body: '신고된 글 1건 · 24시간 안에 한 표 부탁드려요' },
  { kind: 'rec',  read: false, ago: '32분 전', title: '내 댓글이 12명에게 추천받았어요',            body: '"중도 4층 자리 거의 다 차 있고…"' },
  { kind: 'cmt',  read: true,  ago: '2시간 전', title: '내가 쓴 글에 새 댓글 4개',                  body: '자취방 계약할 때 조심할 점 공유합니다' },
  { kind: 'sys',  read: true,  ago: '어제',     title: '강의평 시즌이 열렸어요',                    body: '한 줄 평가 후 다른 강의평을 볼 수 있어요' },
];

const KIND_LABEL: Record<Kind, string> = { cmt: '댓글', rec: '추천', jury: '배심원', sys: '시스템' };

export default function NotificationsV2() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState(INIT);

  const list = useMemo(
    () => (tab === 'all' ? items : items.filter((n) => !n.read)),
    [tab, items],
  );

  const unreadCount = items.filter((n) => !n.read).length;

  const onItemPress = (idx: number) => {
    const real = items.findIndex((it, i) => it === list[idx]);
    if (real >= 0) {
      setItems((prev) =>
        prev.map((it, i) => (i === real ? { ...it, read: true } : it)),
      );
    }
    if (list[idx].kind === 'jury') {
      navigation.navigate('Jury');
    }
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((it) => ({ ...it, read: true })));
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

      {list.map((n, i) => (
        <View key={i}>
          <Pressable
            onPress={() => onItemPress(i)}
            style={({ pressed }) => [
              styles.row,
              !n.read && styles.unread,
              pressed && { backgroundColor: C.surface },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: n.read ? 'transparent' : C.inkNavy },
              ]}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.metaRow}>
                <Text style={styles.kind}>{KIND_LABEL[n.kind]}</Text>
                <Text style={styles.dotSep}>·</Text>
                <Text style={styles.ago}>{n.ago}</Text>
              </View>
              <Text style={[styles.title, !n.read && { fontFamily: F.familyMedium }]}>
                {n.title}
              </Text>
              <Text style={styles.body} numberOfLines={1}>{n.body}</Text>
            </View>
          </Pressable>
          <Hairline mx={SP[4]} />
        </View>
      ))}

      {list.length === 0 && (
        <Text style={styles.empty}>
          {tab === 'unread' ? '안 읽은 알림이 없어요' : '알림이 없어요'}
        </Text>
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
});
