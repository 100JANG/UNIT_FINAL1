import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  Screen,
  Tabs,
  IcSearch,
  IcPlus,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const CHATS = [
  { id: '1', name: '소프트웨어학과 22 단톡', sub: '민수: 내일 발표 자료 공유함', time: '오후 9:42', unread: 4, group: true,  members: 38 },
  { id: '2', name: '김민수',                 sub: '나도 그 강의 들었어ㅋㅋ',     time: '오후 7:18', unread: 1, group: false },
  { id: '3', name: '데이터분석개론 팀플',    sub: '서윤: 자료 정리 다 됐어요',   time: '오후 4:02', unread: 0, group: true,  members: 4 },
  { id: '4', name: '이서윤',                 sub: '내일 열람실 같이 갈래요?',    time: '어제',     unread: 0, group: false },
  { id: '5', name: '중고장터 · 박지호',      sub: '맥북 직거래 가능하신가요?',   time: '어제',     unread: 2, group: false },
  { id: '6', name: '경영학원론 스터디',      sub: '자료 업로드했습니다',        time: '5/10',     unread: 0, group: true,  members: 6, done: true },
  { id: '7', name: '중고장터 · 이하랜',      sub: '매너 칭찬 고마워요!',        time: '5/8',      unread: 0, group: false, done: true },
];

export default function ChatListV2() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'on' | 'done'>('on');

  const list = useMemo(
    () => CHATS.filter((c) => (tab === 'on' ? !c.done : c.done)),
    [tab],
  );

  return (
    <Screen
      appBar={
        <AppBar
          title="채팅"
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />
              <IconButton icon={<IcPlus color={C.inkNavy} />} onPress={() => undefined} />
            </View>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'on',   label: '진행중',     count: CHATS.filter((c) => !c.done).length },
          { id: 'done', label: '대화 완료',  count: CHATS.filter((c) =>  c.done).length },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'on' | 'done')}
      />

      {list.map((c, i) => (
        <View key={c.id}>
          <Pressable
            onPress={() => navigation.navigate('ChatRoom', { id: c.id })}
            style={({ pressed }) => [
              styles.row,
              c.done && { opacity: 0.7 },
              pressed && { backgroundColor: C.surface },
            ]}
          >
            <View>
              <Avatar name={c.name} size={46} />
              {c.group && c.members != null && (
                <View style={styles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{c.members}</Text>
                </View>
              )}
            </View>
            <View style={styles.rowText}>
              <View style={styles.rowHead}>
                <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.time}>{c.time}</Text>
              </View>
              <View style={styles.rowSub}>
                <Text style={styles.sub} numberOfLines={1}>{c.sub}</Text>
                {c.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{c.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
          {i < list.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: SP[4], paddingVertical: SP[3], flexDirection: 'row', alignItems: 'center', gap: SP[3] },
  groupBadge: {
    position: 'absolute',
    bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.inkNavy,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.white,
  },
  groupBadgeText: { color: C.white, fontSize: 9, fontFamily: F.familySemiBold },

  rowText: { flex: 1, minWidth: 0 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  name: { flex: 1, fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.2 },
  time: { fontSize: F.size.xs, color: C.hint },
  rowSub: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  sub: { flex: 1, fontSize: F.size.sm, color: C.textMeta },
  unreadBadge: {
    height: 18,
    minWidth: 18,
    paddingHorizontal: 6,
    borderRadius: R.full,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: C.white, fontSize: 10.5, fontFamily: F.familySemiBold },
});
