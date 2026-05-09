import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcBookmark,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const JOB = {
  tag: '캠퍼스내',
  dist: '0.2km',
  hot: true,
  title: '주말 바리스타 (학생회관 카페)',
  wage: '시급 12,000원',
  info: [
    { l: '요일',     v: '토일' },
    { l: '시간',     v: '09:00~18:00' },
    { l: '근무 형태', v: '단기' },
    { l: '모집 인원', v: '1명' },
    { l: '거리',     v: '0.2km' },
    { l: '근무 시작', v: '즉시' },
  ],
  duties: ['에스프레소 추출', '주문 응대', '간단한 베이킹', '마감 정리'],
  prefer: ['바리스타 자격증 소지자', '주말 6주 이상 근무 가능자'],
  applicants: 12,
  dday: 'D-3',
};

export default function JobDetailV2() {
  const navigation = useNavigation();
  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          trailing={<IconButton icon={<IcBookmark />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.pillRow}>
          <Pill tone="navy">{JOB.tag}</Pill>
          <Text style={styles.distText}>{JOB.dist}</Text>
          {JOB.hot && (
            <View style={{ marginLeft: 'auto' }}>
              <Pill tone="coral">급구</Pill>
            </View>
          )}
        </View>
        <Text style={styles.title}>{JOB.title}</Text>
        <Text style={styles.wage}>{JOB.wage}</Text>
      </View>

      <View style={styles.infoCard}>
        {Array.from({ length: Math.ceil(JOB.info.length / 2) }).map((_, i) => (
          <View key={i} style={styles.infoRow}>
            {JOB.info.slice(i * 2, i * 2 + 2).map((it) => (
              <View key={it.l} style={styles.infoCell}>
                <Text style={styles.infoLabel}>{it.l}</Text>
                <Text style={styles.infoValue}>{it.v}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.placeCard}>
        <View style={styles.placeImg}>
          <Text style={{ fontSize: 32 }}>☕</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName}>학생회관 1층 카페</Text>
          <Text style={styles.placeAddr}>인하대학교 학생회관</Text>
          <Text style={styles.placePhone}>032-860-1234</Text>
        </View>
      </View>

      <Section title="근무 내용" items={JOB.duties} />
      <Section title="우대 사항" items={JOB.prefer} />

      <View style={styles.statsBox}>
        <Text style={styles.statsText}>
          이미 {JOB.applicants}명이 지원했어요 · 마감까지 {JOB.dday}
        </Text>
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaText}>지원하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionList}>
        {items.map((it, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>·</Text>
            <Text style={styles.bulletText}>{it}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: SP[4], paddingTop: SP[4], paddingBottom: SP[3] },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  distText: { fontSize: F.size.sm, color: C.hint },
  title: { fontSize: F.size.h3, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.3, lineHeight: 22 },
  wage: { marginTop: SP[1], fontSize: F.size.h2, fontFamily: F.familySemiBold, color: C.inkNavy },

  infoCard: {
    marginHorizontal: SP[4],
    marginTop: SP[2],
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

  placeCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    padding: SP[3],
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
  },
  placeImg: {
    width: 56, height: 56,
    borderRadius: R.md,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  placeName: { fontSize: F.size.base, fontFamily: F.familyMedium, color: C.text },
  placeAddr: { marginTop: 2, fontSize: F.size.sm, color: C.textMeta },
  placePhone: { marginTop: 2, fontSize: F.size.sm, color: C.inkNavy },

  sectionTitle: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  sectionList: { paddingHorizontal: SP[4] },
  bulletRow: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { color: C.hint, marginRight: SP[2], fontSize: F.size.sm },
  bulletText: { flex: 1, fontSize: F.size.base, color: C.textSub, lineHeight: 22 },

  statsBox: {
    marginHorizontal: SP[4],
    marginTop: SP[5],
    padding: SP[3],
    backgroundColor: '#F4F4FB',
    borderRadius: R.lg,
  },
  statsText: { fontSize: F.size.sm, color: C.inkNavy, fontFamily: F.familyMedium },

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
