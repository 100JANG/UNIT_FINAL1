import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  Screen,
  IcBack,
  IcSearch,
  IcCheck,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const LIST = [
  { id: 'u1', name: '김민수', dept: '소프트웨어학과 22', mut: 4, st: 'add'    as const },
  { id: 'u2', name: '이서윤', dept: '경영학과 23',       mut: 2, st: 'add'    as const },
  { id: 'u3', name: '박지호', dept: '소프트웨어학과 22', mut: 7, st: 'sent'   as const },
  { id: 'u4', name: '정유진', dept: '디자인학과 24',     mut: 1, st: 'add'    as const },
  { id: 'u5', name: '최도윤', dept: '전자공학과 21',     mut: 3, st: 'friend' as const },
];

export default function FriendsV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>친구찾기</Text>
            </View>
          }
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <IcSearch size={18} color={C.hint} />
          <Text style={styles.searchPlaceholder}>학번, 이름, 학과로 검색</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>같은 학과 · 알 수도 있는 친구</Text>

      {LIST.map((p, i) => (
        <View key={p.id}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => navigation.navigate('OtherProfile', { userId: p.id })}
          >
            <Avatar name={p.name} size={42} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>
                {p.dept} · 함께 아는 친구 {p.mut}
              </Text>
            </View>
            {p.st === 'add' && (
              <Pressable style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}>
                <Text style={styles.addText}>친구추가</Text>
              </Pressable>
            )}
            {p.st === 'sent' && (
              <View style={styles.sentBtn}>
                <Text style={styles.sentText}>신청 중</Text>
              </View>
            )}
            {p.st === 'friend' && (
              <View style={styles.friendBtn}>
                <IcCheck size={13} color={C.textSub} />
                <Text style={styles.friendText}>친구</Text>
              </View>
            )}
          </Pressable>
          {i < LIST.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  searchWrap: { paddingHorizontal: SP[4], paddingTop: SP[3], paddingBottom: SP[2] },
  searchBox: {
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  searchPlaceholder: { fontSize: F.size.base, color: C.hint },

  sectionLabel: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[2],
    fontSize: F.size.sm,
    color: C.hint,
  },

  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
  },
  pressed: { backgroundColor: C.surface },
  name: { fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text },
  meta: { marginTop: 2, fontSize: F.size.sm, color: C.textMeta },

  addBtn: {
    height: 32, paddingHorizontal: SP[3],
    borderRadius: R.md, backgroundColor: C.inkNavy,
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { fontSize: F.size.sm, color: C.white, fontFamily: F.familySemiBold },
  sentBtn: {
    height: 32, paddingHorizontal: SP[3],
    borderRadius: R.md, backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  sentText: { fontSize: F.size.sm, color: C.textMeta },
  friendBtn: {
    height: 32, paddingHorizontal: SP[3],
    borderRadius: R.md, borderWidth: 1, borderColor: C.divider2,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  friendText: { fontSize: F.size.sm, color: C.textSub },
});
