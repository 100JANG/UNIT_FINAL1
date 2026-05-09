import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcBookmark,
  IcShare,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const CONTEST = {
  cat: '디자인',
  catColor: C.inkNavy,
  host: '한국디자인진흥원',
  title: '청년 UX 디자인 공모전',
  dday: 'D-12',
  fit: 92,
  info: [
    { l: '상금',      v: '대상 500만원' },
    { l: '분야',      v: 'UX 디자인' },
    { l: '참가 자격', v: '대학(원)생' },
    { l: '접수 기간', v: '5/12 - 5/24' },
    { l: '결과 발표', v: '6/18' },
    { l: '주최',      v: '한국디자인진흥원' },
  ],
  topic: '청년 세대의 디지털 라이프 향상에 기여하는 UX/UI 디자인 솔루션을 제안하는\n공모전입니다. 모든 분야의 디지털 서비스를 대상으로 합니다.',
  judges: [
    '문제 정의의 명확성',
    '사용자 리서치의 깊이',
    '디자인 시스템 완성도',
    '프로토타입 완결성',
  ],
  schedule: [
    { date: '5/24', label: '접수 마감' },
    { date: '6/2',  label: '1차 결과 발표' },
    { date: '6/14', label: '본선 발표' },
    { date: '6/18', label: '시상식' },
  ],
};

export default function ContestDetailV2() {
  const navigation = useNavigation();
  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcBookmark />} onPress={() => undefined} />
              <IconButton icon={<IcShare />} onPress={() => undefined} />
            </View>
          }
        />
      }
    >
      <View style={[styles.accentLine, { backgroundColor: CONTEST.catColor }]} />

      <View style={styles.hero}>
        <Text style={[styles.cat, { color: CONTEST.catColor }]}>
          {CONTEST.cat}
        </Text>
        <Text style={styles.host}>{CONTEST.host}</Text>
        <Text style={styles.title}>{CONTEST.title}</Text>
        <View style={styles.deadlineRow}>
          <Pill tone="coral">{CONTEST.dday}</Pill>
          <Text style={styles.deadlineText}>접수 마감 5/24</Text>
        </View>
      </View>

      <View style={styles.fitCard}>
        <Text style={styles.fitLabel}>내 학과 기준 적합도</Text>
        <Text style={styles.fitValue}>{CONTEST.fit}%</Text>
        <Text style={styles.fitSub}>디자인 전공 학생 53명이 스크랩했어요</Text>
      </View>

      <View style={styles.infoCard}>
        {Array.from({ length: Math.ceil(CONTEST.info.length / 2) }).map((_, i) => (
          <View key={i} style={styles.infoRow}>
            {CONTEST.info.slice(i * 2, i * 2 + 2).map((it) => (
              <View key={it.l} style={styles.infoCell}>
                <Text style={styles.infoLabel}>{it.l}</Text>
                <Text style={styles.infoValue}>{it.v}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>공모 주제</Text>
      <Text style={styles.bodyText}>{CONTEST.topic}</Text>

      <Text style={styles.sectionTitle}>심사 기준</Text>
      <View style={styles.numList}>
        {CONTEST.judges.map((j, i) => (
          <View key={i} style={styles.numRow}>
            <Text style={styles.numText}>{i + 1}.</Text>
            <Text style={styles.numBody}>{j}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>일정</Text>
      <View style={styles.timeline}>
        {CONTEST.schedule.map((s, i) => (
          <View key={i} style={styles.tlRow}>
            <Text style={styles.tlDate}>{s.date}</Text>
            <View style={styles.tlDot} />
            <Text style={styles.tlLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaText}>사이트로 가기 ↗</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  accentLine: { height: 4 },

  hero: { paddingHorizontal: SP[4], paddingTop: SP[4] },
  cat: { fontSize: F.size.xs, fontFamily: F.familySemiBold },
  host: { marginTop: 2, fontSize: F.size.sm, color: C.hint },
  title: {
    marginTop: 4,
    fontSize: F.size.h2,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  deadlineRow: { marginTop: SP[2], flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  deadlineText: { fontSize: F.size.sm, color: C.textMeta },

  fitCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    padding: SP[3],
    backgroundColor: '#F4F4FB',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: '#DDDDF1',
  },
  fitLabel: { fontSize: F.size.sm, color: C.inkNavy, fontFamily: F.familyMedium },
  fitValue: { marginTop: 2, fontSize: F.size.h2, fontFamily: F.familyBold, color: C.inkNavy },
  fitSub: { marginTop: 2, fontSize: F.size.xs, color: C.textSub },

  infoCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    padding: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
  },
  infoRow: { flexDirection: 'row', marginBottom: SP[3] },
  infoCell: { flex: 1 },
  infoLabel: { fontSize: F.size.xs, color: C.hint },
  infoValue: { marginTop: 4, fontSize: F.size.base, color: C.text, fontFamily: F.familyMedium },

  sectionTitle: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  bodyText: {
    paddingHorizontal: SP[4],
    fontSize: F.size.lg,
    color: C.textSub,
    lineHeight: 25,
  },
  numList: { paddingHorizontal: SP[4] },
  numRow: { flexDirection: 'row', marginBottom: SP[1] },
  numText: { width: 20, fontSize: F.size.base, color: C.inkNavy, fontFamily: F.familySemiBold },
  numBody: { flex: 1, fontSize: F.size.base, color: C.textSub, lineHeight: 22 },

  timeline: { paddingHorizontal: SP[4], gap: SP[2] },
  tlRow: { flexDirection: 'row', alignItems: 'center', gap: SP[3] },
  tlDate: { width: 40, fontSize: F.size.sm, color: C.hint, fontFamily: F.familyMedium },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.inkNavy },
  tlLabel: { fontSize: F.size.md, color: C.text },

  bottomBar: {
    marginTop: SP[5],
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
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
