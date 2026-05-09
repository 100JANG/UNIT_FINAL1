import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  MannerBadge,
  Pill,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { MannerGrade as MannerGradeType } from '../../components/ui';

const GRADES: { id: MannerGradeType; label: string; min: number; desc: string; benefits: string[] }[] = [
  { id: 'A+', label: '최우수', min: 95, desc: '학내 매너 모범 · 상위 1%', benefits: ['배심원 의견 우선 표시', '학점 배지 노출(선택)'] },
  { id: 'A0', label: '우수',   min: 90, desc: '꾸준히 도움되는 활동',     benefits: ['학점 배지 노출(선택)', '게시글 추천 우선 후보'] },
  { id: 'B+', label: '양호',   min: 85, desc: '평균 이상의 매너',         benefits: ['모든 기본 기능', '닉네임 변경 14일 단축'] },
  { id: 'B0', label: '기본',   min: 75, desc: '신규 가입 기본 등급',       benefits: ['모든 기본 기능 사용'] },
  { id: 'C+', label: '보통',   min: 65, desc: '주의 한두 건 누적',         benefits: ['이상 없음 · 등급 하락 안내'] },
  { id: 'C0', label: '주의',   min: 55, desc: '신고가 누적되고 있어요',     benefits: ['하루 게시글 5개 제한', '신고 1회 즉시 안내'] },
  { id: 'D+', label: '경고',   min: 45, desc: '일부 기능 제한 임박',       benefits: ['댓글 30초 쿨다운', '하루 게시글 3개 제한'] },
  { id: 'D0', label: '제한',   min: 35, desc: '댓글·채팅 제한',            benefits: ['댓글·채팅 7일 제한', '강의평 7일 제한'] },
  { id: 'F',  label: '제재',   min:  0, desc: '커뮤니티 활동 정지',        benefits: ['열람만 가능', '이의제기 후 학생회 검토'] },
];

const RULES = [
  { sign: '+', color: C.trust,  text: '추천 댓글 10개 받기',     pts: '+1' },
  { sign: '+', color: C.trust,  text: '강의평·정보글 작성',       pts: '+2' },
  { sign: '+', color: C.trust,  text: '배심원 판단 일치',         pts: '+1' },
  { sign: '−', color: C.danger, text: '신고 반영 (욕설·도배)',    pts: '−5' },
  { sign: '−', color: C.danger, text: '거래 약속 불이행',         pts: '−3' },
  { sign: '−', color: C.danger, text: '허위 정보',                pts: '−10' },
];

const MY_GRADE: MannerGradeType = 'B0';

export default function MannerLadderV2() {
  const navigation = useNavigation();
  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>매너 학점별 혜택</Text>
            </View>
          }
        />
      }
    >
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>점수 반영 기준</Text>
        <Text style={styles.rulesIntro}>
          모든 사용자는 <Text style={styles.bold}>B0 (80점)</Text>으로 시작해요.
          아래 활동에 따라 점수가 오르내리고, 점수에 따라{' '}
          <Text style={styles.bold}>실시간으로</Text> 등급이 바뀝니다.
        </Text>
        {RULES.map((r, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={[styles.ruleSign, { color: r.color }]}>{r.sign}</Text>
            <Text style={styles.ruleText}>{r.text}</Text>
            <Text style={[styles.rulePts, { color: r.color }]}>{r.pts}</Text>
          </View>
        ))}
        <View style={styles.rulesFooter}>
          <Text style={styles.rulesFooterText}>
            기준은 학생회·운영진이 함께 정하고, 분기마다 공개 검토해요. 모든 점수
            변동은{' '}
            <Text style={styles.bold}>내 매너 학점</Text> 페이지의 변동 내역에서
            확인할 수 있어요.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>등급별 혜택</Text>

      {GRADES.map((g) => {
        const isMe = g.id === MY_GRADE;
        return (
          <View
            key={g.id}
            style={[
              styles.gradeRow,
              isMe && { backgroundColor: C.surface },
            ]}
          >
            <View style={styles.gradeBadgeWrap}>
              <MannerBadge grade={g.id} size="md" />
              <Text style={styles.gradeMin}>≥{g.min}점</Text>
            </View>
            <View style={styles.gradeBody}>
              <View style={styles.gradeHead}>
                <Text style={styles.gradeLabel}>{g.label}</Text>
                {isMe && <Pill tone="navy">내 등급</Pill>}
              </View>
              <Text style={styles.gradeDesc}>{g.desc}</Text>
              {g.benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={styles.benefitDot}>·</Text>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
      <View style={{ height: SP[6] }} />
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

  rulesCard: {
    margin: SP[4],
    padding: SP[4],
    backgroundColor: '#F4F4FB',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: '#DDDDF1',
  },
  rulesTitle: {
    fontSize: F.size.sm,
    fontFamily: F.familySemiBold,
    color: C.inkNavy,
    marginBottom: SP[1],
  },
  rulesIntro: {
    fontSize: F.size.sm,
    color: C.textSub,
    lineHeight: 19,
    marginBottom: SP[3],
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ruleSign: {
    width: 16,
    fontSize: F.size.sm,
    fontFamily: F.familySemiBold,
  },
  ruleText: { flex: 1, fontSize: F.size.sm, color: C.textSub },
  rulePts: { fontSize: F.size.sm, fontFamily: F.familySemiBold },
  rulesFooter: {
    marginTop: SP[3],
    paddingTop: SP[2],
    borderTopWidth: 1,
    borderTopColor: '#DDDDF1',
  },
  rulesFooterText: { fontSize: F.size.xs, color: C.textMeta, lineHeight: 17 },

  sectionLabel: {
    paddingHorizontal: SP[4],
    paddingBottom: SP[1],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },

  gradeRow: {
    flexDirection: 'row',
    paddingHorizontal: SP[4],
    paddingVertical: SP[4],
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    gap: SP[4],
  },
  gradeBadgeWrap: { width: 64, alignItems: 'center' },
  gradeMin: { marginTop: SP[1], fontSize: 10, color: C.textMeta },
  gradeBody: { flex: 1, minWidth: 0 },
  gradeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    marginBottom: SP[1],
  },
  gradeLabel: {
    fontSize: F.size.md,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  gradeDesc: {
    fontSize: F.size.sm,
    color: C.textMeta,
    marginBottom: SP[2],
  },
  benefitRow: { flexDirection: 'row', marginBottom: 2 },
  benefitDot: { color: C.hint, marginRight: SP[1], fontSize: F.size.sm },
  benefitText: { flex: 1, fontSize: F.size.sm, color: C.textSub },
  bold: { fontFamily: F.familySemiBold },
});
