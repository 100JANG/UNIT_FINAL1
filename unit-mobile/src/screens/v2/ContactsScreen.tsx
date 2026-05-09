import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Screen,
  IcBack,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const GROUPS = [
  {
    name: '학사 · 행정',
    items: [
      { l: '교무처', tel: '032-860-7000', ext: '7000' },
      { l: '학생지원처', tel: '032-860-7100', ext: '7100' },
      { l: '국제처', tel: '032-860-7250', ext: '7250' },
    ],
  },
  {
    name: '학과 사무실',
    items: [
      { l: '소프트웨어학과', tel: '032-860-7390', ext: '7390' },
      { l: '경영학과', tel: '032-860-7710', ext: '7710' },
      { l: '사학과', tel: '032-860-8030', ext: '8030' },
    ],
  },
  {
    name: '시설 · 안전',
    items: [
      { l: '도서관 안내', tel: '032-860-7610', ext: '7610' },
      { l: '캠퍼스 보안', tel: '032-860-9112', ext: '9112' },
      { l: '보건진료소', tel: '032-860-7800', ext: '7800' },
    ],
  },
];

export default function ContactsV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>교내 연락처</Text>
            </View>
          }
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      {GROUPS.map((g) => (
        <View key={g.name} style={styles.groupWrap}>
          <Text style={styles.groupLabel}>{g.name.toUpperCase()}</Text>
          <View style={styles.card}>
            {g.items.map((it, j) => (
              <View
                key={j}
                style={[
                  styles.row,
                  j < g.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: C.divider,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{it.l}</Text>
                  <Text style={styles.rowTel}>{it.tel} · 내선 {it.ext}</Text>
                </View>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${it.tel.replace(/-/g, '')}`)}
                  style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.callBtnText}>📞</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: SP[6] }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  groupWrap: { paddingHorizontal: SP[5], paddingTop: SP[5] },
  groupLabel: {
    fontSize: F.size.xs,
    color: C.hint,
    letterSpacing: F.ls.wide,
    marginBottom: SP[2],
    fontFamily: F.familyMedium,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
  },
  rowName: { fontSize: F.size.md, color: C.text, fontFamily: F.family },
  rowTel: { marginTop: 2, fontSize: F.size.sm, color: C.textMeta },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2F1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: { fontSize: 16 },
});
