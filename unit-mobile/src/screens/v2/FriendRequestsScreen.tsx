import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  Screen,
  Tabs,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const RECEIVED = [
  { name: '김민수', dept: '소프트웨어학과 22', mut: 4 },
  { name: '이서윤', dept: '경영학과 23',       mut: 2 },
  { name: '정유진', dept: '디자인학과 24',     mut: 1 },
];

const SENT = [
  { name: '박지호', dept: '소프트웨어학과 22', mut: 7 },
  { name: '최도윤', dept: '전자공학과 21',     mut: 3 },
];

export default function FriendRequestsV2() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'in' | 'out'>('in');

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>친구 요청</Text>
            </View>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'in', label: '받은', count: RECEIVED.length },
          { id: 'out', label: '보낸', count: SENT.length },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'in' | 'out')}
      />

      {tab === 'in' &&
        RECEIVED.map((p, i) => (
          <View key={i}>
            <View style={styles.row}>
              <Avatar name={p.name} size={42} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>
                  {p.dept} · 함께 아는 친구 {p.mut}
                </Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.acceptText}>수락</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.rejectText}>거절</Text>
                </Pressable>
              </View>
            </View>
            {i < RECEIVED.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}

      {tab === 'out' &&
        SENT.map((p, i) => (
          <View key={i}>
            <View style={styles.row}>
              <Avatar name={p.name} size={42} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>
                  {p.dept} · 함께 아는 친구 {p.mut}
                </Text>
              </View>
              <Pressable style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.85 }]}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
            </View>
            {i < SENT.length - 1 && <Hairline mx={SP[4]} />}
          </View>
        ))}

      {(tab === 'in' && RECEIVED.length === 0) && (
        <Text style={styles.empty}>받은 친구 요청이 없어요</Text>
      )}
      {(tab === 'out' && SENT.length === 0) && (
        <Text style={styles.empty}>보낸 친구 요청이 없어요</Text>
      )}
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

  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
  },
  rowText: { flex: 1 },
  name: { fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text },
  meta: { fontSize: F.size.sm, color: C.textMeta, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: SP[2] },
  acceptBtn: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    fontSize: F.size.sm,
    color: C.white,
    fontFamily: F.familySemiBold,
  },
  rejectBtn: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.divider2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontSize: F.size.sm,
    color: C.textSub,
    fontFamily: F.familyMedium,
  },
  cancelBtn: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: F.size.sm,
    color: C.textMeta,
  },
  empty: {
    paddingTop: SP[7],
    fontSize: F.size.md,
    color: C.hint,
    textAlign: 'center',
  },
});
