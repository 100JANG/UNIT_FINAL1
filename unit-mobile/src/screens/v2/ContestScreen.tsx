import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const ITEMS = [
  { id: 1, tag: '디자인', host: '한국디자인진흥원',   title: '청년 UX 디자인 공모전',     dday: 'D-12', prize: '대상 500만원', accent: C.inkNavy },
  { id: 2, tag: '개발',   host: '삼성SDS',            title: '대학생 SW 알고리즘 챌린지', dday: 'D-5',  prize: '대상 300만원', accent: C.trust },
  { id: 3, tag: '창업',   host: '인천창조경제센터',   title: '인천 대학생 창업 아이디어', dday: 'D-21', prize: '시상금 200만원', accent: C.warn },
  { id: 4, tag: '학술',   host: '한국정보과학회',     title: '학부 논문 경진대회',         dday: 'D-32', prize: '학회지 게재',     accent: '#6B4F2E' },
];

export default function ContestV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>공모전</Text>
            </View>
          }
          trailing={<IconButton icon={<IcSearch />} onPress={() => navigation.navigate('Search')} />}
        />
      }
    >
      <View style={styles.gridWrap}>
        {ITEMS.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => navigation.navigate('ContestDetail', { id: it.id })}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.cardHead}>
              <Text style={[styles.cardTag, { color: it.accent }]}>{it.tag}</Text>
              <Pill tone="coral">{it.dday}</Pill>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{it.title}</Text>
            <Text style={styles.cardHost} numberOfLines={1}>{it.host}</Text>
            <Text style={styles.cardPrize} numberOfLines={1}>{it.prize}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginLeft: SP[1] },

  gridWrap: { padding: SP[3], flexDirection: 'row', flexWrap: 'wrap', gap: SP[3] },
  card: {
    width: '47%',
    padding: SP[3],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SP[2],
  },
  cardTag: { fontSize: F.size.xs, fontFamily: F.familySemiBold },
  cardTitle: {
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.2,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: SP[1],
  },
  cardHost: { fontSize: F.size.xs, color: C.hint, marginTop: 2 },
  cardPrize: { marginTop: 2, fontSize: F.size.sm, color: C.textSub },
});
