import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  ListRow,
  MannerBadge,
  Screen,
  IcBack,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { MannerGrade as MannerGradeType } from '../../components/ui';

const SCORE = 82;
const GRADE: MannerGradeType = 'B0';

const AXES = [
  { l: '친절함',   v: 88 },
  { l: '진실성',   v: 92 },
  { l: '활동성',   v: 74 },
  { l: '신고이력', v: 76 },
];

const HISTORY: { d: string; delta: number; src: string }[] = [
  { d: '오늘', delta:  2, src: '강의평이 추천 12회 받음' },
  { d: '5/10', delta:  1, src: '댓글이 추천 5회 받음' },
  { d: '5/8',  delta: -3, src: '댓글이 신고 2회 받음' },
  { d: '5/5',  delta:  1, src: '거래 후기 "친절해요"' },
  { d: '5/2',  delta:  2, src: '게시글이 베스트 선정' },
];

export default function MannerGradeV2() {
  const navigation = useNavigation<any>();
  const next = 90;
  const toNext = next - SCORE;
  const fillPct = ((SCORE - 75) / (next - 75)) * 100;

  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>매너 학점</Text>
            </View>
          }
        />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>MY GRADE</Text>
        <View style={styles.heroRow}>
          <MannerBadge grade={GRADE} size="lg" />
          <View style={styles.heroMeta}>
            <Text style={styles.heroLevel}>기본</Text>
            <Text style={styles.heroDesc}>신규 가입 기본 등급</Text>
          </View>
          <View style={styles.heroScoreCol}>
            <Text style={styles.heroScoreLabel}>SCORE</Text>
            <Text style={styles.heroScoreValue}>
              {SCORE}
              <Text style={styles.heroScoreMax}> / 100</Text>
            </Text>
          </View>
        </View>

        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>
            다음 등급 <Text style={styles.bold}>B+</Text>까지
          </Text>
          <Text style={styles.progressValue}>
            <Text style={[styles.bold, { color: C.manner.b0 }]}>+{toNext}</Text>
            <Text style={styles.bold}>점</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPct}%`, backgroundColor: C.manner.b0 }]} />
        </View>
      </View>

      {/* 4축 */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>평가 항목</Text>
          <Text style={styles.sectionMeta}>최근 90일</Text>
        </View>
        {AXES.map((a) => (
          <View key={a.l} style={styles.axisRow}>
            <View style={styles.axisLabelRow}>
              <Text style={styles.axisLabel}>{a.l}</Text>
              <Text style={styles.axisValue}>{a.v}</Text>
            </View>
            <View style={styles.axisTrack}>
              <View style={[styles.axisFill, { width: `${a.v}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <Hairline />

      {/* 변동 내역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 변동</Text>
        {HISTORY.map((h, i) => (
          <View key={i} style={styles.historyRow}>
            <Text style={styles.historyDate}>{h.d}</Text>
            <Text
              style={[
                styles.historyDelta,
                { color: h.delta > 0 ? C.trust : C.danger },
              ]}
            >
              {h.delta > 0 ? `+${h.delta}` : h.delta}
            </Text>
            <Text style={styles.historySrc}>{h.src}</Text>
          </View>
        ))}
      </View>

      <Hairline />

      <ListRow
        label="9등급 사다리 · 혜택 보기"
        trailing="chev"
        onPress={() => navigation.navigate('MannerLadder' as never)}
      />

      <Hairline />

      <View style={[styles.section, { backgroundColor: C.cream }]}>
        <Text style={styles.sectionTitle}>점수는 이렇게 매겨져요</Text>
        {[
          '게시글·댓글 추천 / 비추',
          '강의평·후기의 추천 비율',
          '중고 거래 후 받은 매너 칭찬',
          '신고 누적 (검토 후 차감)',
          '배심원·신고 처리에 참여',
        ].map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>·</Text>
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
        <Text style={styles.footnote}>
          신규 가입 시 B0(80점)으로 시작합니다. 정지 처분을 받으면 기존 등급과
          무관하게 F로 초기화돼요.
        </Text>
      </View>
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

  hero: {
    paddingHorizontal: SP[5],
    paddingTop: SP[3],
    paddingBottom: SP[6],
    backgroundColor: C.cream,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  heroLabel: {
    fontSize: F.size.xs,
    color: C.hint,
    letterSpacing: F.ls.wide,
    marginBottom: SP[1],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SP[4],
  },
  heroMeta: { paddingBottom: SP[2] },
  heroLevel: {
    fontSize: F.size.md,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  heroDesc: {
    fontSize: F.size.sm,
    color: C.textMeta,
    marginTop: 2,
  },
  heroScoreCol: { marginLeft: 'auto', paddingBottom: SP[2], alignItems: 'flex-end' },
  heroScoreLabel: { fontSize: F.size.xs, color: C.hint },
  heroScoreValue: {
    fontSize: F.size.hero,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.6,
  },
  heroScoreMax: { fontSize: F.size.md, color: C.hint, fontFamily: F.family },

  progressMeta: {
    marginTop: SP[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SP[1],
  },
  progressLabel: { fontSize: F.size.xs, color: C.textMeta },
  progressValue: { fontSize: F.size.xs, color: C.text },
  bold: { fontFamily: F.familySemiBold },
  progressTrack: {
    height: 8,
    borderRadius: R.full,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.divider2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },

  section: {
    paddingHorizontal: SP[5],
    paddingVertical: SP[5],
    backgroundColor: C.white,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SP[3],
  },
  sectionTitle: {
    fontSize: F.size.md,
    fontFamily: F.familySemiBold,
    color: C.text,
    marginBottom: SP[2],
  },
  sectionMeta: { fontSize: F.size.xs, color: C.hint },

  axisRow: { marginBottom: SP[3] },
  axisLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SP[1],
  },
  axisLabel: { fontSize: F.size.base, fontFamily: F.familySemiBold, color: C.text },
  axisValue: { fontSize: F.size.base, color: C.text },
  axisTrack: {
    height: 6,
    borderRadius: R.full,
    backgroundColor: C.surface2,
    overflow: 'hidden',
  },
  axisFill: { height: '100%', backgroundColor: C.inkNavy },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SP[3],
    marginBottom: SP[3],
  },
  historyDate: { width: 50, fontSize: F.size.xs, color: C.hint, paddingTop: 2 },
  historyDelta: {
    width: 36,
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
  },
  historySrc: { flex: 1, fontSize: F.size.sm, color: C.textSub, lineHeight: 18 },

  bulletRow: { flexDirection: 'row', marginBottom: 2 },
  bulletDot: { color: C.hint, marginRight: SP[1], fontSize: F.size.sm },
  bulletText: { flex: 1, fontSize: F.size.sm, color: C.textMeta, lineHeight: 20 },
  footnote: {
    marginTop: SP[3],
    fontSize: F.size.xs,
    color: C.hint,
    lineHeight: 18,
  },
});
