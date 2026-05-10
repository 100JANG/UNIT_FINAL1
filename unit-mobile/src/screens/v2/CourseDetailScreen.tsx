import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  Tabs,
  IcBack,
  IcBookmark,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;
type R$ = RouteProp<UnitV2ParamList, 'CourseDetail'>;

const COURSES = [
  { id: 1, name: '데이터분석개론', prof: '김지연', dept: '소프트웨어학과', credit: 3, rec: 78, n: 412, partic: 73 },
];

const REVIEWS = [
  { vote: 'rec' as const, body: '실무 위주 과제가 많아서 처음엔 부담이지만, 끝나고 나면 포트폴리오에 그대로 넣을 수 있어요. 시험은 오픈북.', nick: '카페인러버', sem: '24-2', up: 23 },
  { vote: 'rec' as const, body: '교수님이 질문에 진지하게 답해주시는 게 좋았어요.', nick: '데이터덕후', sem: '24-1', up: 18 },
  { vote: 'no'  as const, body: '과제량이 진짜 많습니다. 다른 전공 듣는 학기에 같이 들으면 후회해요.', nick: '졸린토끼', sem: '23-2', up: 12 },
];

export default function CourseDetailV2() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R$>();
  const paramId = route.params?.courseId;
  const c = COURSES.find((x) => String(x.id) === paramId) ?? COURSES[0];
  const [tab, setTab] = useState<'rec' | 'no' | 'all'>('rec');
  const [scrap, setScrap] = useState(false);

  const filtered =
    tab === 'rec' ? REVIEWS.filter((r) => r.vote === 'rec') :
    tab === 'no'  ? REVIEWS.filter((r) => r.vote === 'no') :
    REVIEWS;

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title={c.name}
          trailing={
            <Pressable
              hitSlop={6}
              onPress={() => setScrap((v) => !v)}
              style={({ pressed }) => [styles.scrapBtn, pressed && { opacity: 0.7 }]}
            >
              <IcBookmark size={22} color={scrap ? C.warn : C.text} />
            </Pressable>
          }
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.name}>{c.name}</Text>
        <Text style={styles.meta}>{c.prof} · {c.dept} · {c.credit}학점</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.recRow}>
          <Text style={styles.recBig}>{c.rec}%</Text>
          <Text style={styles.recLabel}>추천</Text>
          <Text style={styles.recCount}>응답 {c.n}명</Text>
        </View>
        <View style={styles.distRow}>
          <View style={[styles.distFill, { flex: c.rec, backgroundColor: C.inkNavy }]} />
          <View style={[styles.distFill, { flex: 100 - c.rec, backgroundColor: C.divider2 }]} />
        </View>
        <View style={styles.trustRow}>
          <Text style={styles.trustText}>
            🛡  참여율 <Text style={{ color: C.inkNavy, fontFamily: F.familySemiBold }}>{c.partic}%</Text>
          </Text>
          <Pill tone="mist">70% 이상이라 신뢰할 수 있어요</Pill>
        </View>
      </View>

      <Tabs
        items={[
          { id: 'rec', label: `추천 ${REVIEWS.filter((r) => r.vote === 'rec').length}` },
          { id: 'no',  label: `비추천 ${REVIEWS.filter((r) => r.vote === 'no').length}` },
          { id: 'all', label: '의견' },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'rec' | 'no' | 'all')}
      />

      {filtered.map((r, i) => (
        <View key={i}>
          <View style={styles.reviewRow}>
            <View style={styles.reviewHead}>
              <Pill tone={r.vote === 'rec' ? 'mist' : 'coral'}>
                {r.vote === 'rec' ? '추천' : '비추천'}
              </Pill>
              <Text style={styles.reviewMeta}>{r.sem}학기 · {r.nick}</Text>
              <Text style={styles.reviewUp}>👍 {r.up}</Text>
            </View>
            <Text style={styles.reviewBody}>{r.body}</Text>
          </View>
          {i < filtered.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => navigation.navigate('CourseReview', { courseId: String(c.id) })}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaText}>평가하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrapBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  hero: { paddingHorizontal: SP[4], paddingTop: SP[4], paddingBottom: SP[3] },
  name: { fontSize: F.size.h2, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.4 },
  meta: { marginTop: 4, fontSize: F.size.base, color: C.textMeta },

  statCard: {
    marginHorizontal: SP[4],
    marginBottom: SP[2],
    padding: SP[4],
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: R.lg,
  },
  recRow: { flexDirection: 'row', alignItems: 'baseline', gap: SP[2], marginBottom: SP[3] },
  recBig: { fontSize: F.size.hero, fontFamily: F.familyBold, color: C.inkNavy, letterSpacing: -0.5 },
  recLabel: { fontSize: F.size.base, color: C.textMeta },
  recCount: { marginLeft: 'auto', fontSize: F.size.sm, color: C.hint },
  distRow: { height: 6, borderRadius: R.full, overflow: 'hidden', flexDirection: 'row' },
  distFill: { height: '100%' },
  trustRow: {
    marginTop: SP[3],
    paddingTop: SP[3],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustText: { fontSize: F.size.sm, color: C.textSub },

  reviewRow: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: 6 },
  reviewMeta: { fontSize: F.size.xs, color: C.hint },
  reviewUp: { marginLeft: 'auto', fontSize: F.size.xs, color: C.hint },
  reviewBody: { fontSize: F.size.base, color: C.textSub, lineHeight: 22 },

  bottomBar: {
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[5],
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  cta: {
    height: 48,
    borderRadius: R.lg,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, color: C.white, fontFamily: F.familySemiBold },
});
