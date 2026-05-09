import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Pill,
  Screen,
  IcX,
  IcCheck,
} from '../../components/ui';
import { C, F, R, SP, SHADOW } from '../../theme/tokens';

type Voted = 'ok' | 'issue' | null;

export default function JuryV2() {
  const navigation = useNavigation();
  const [responded, setResponded] = useState(17);
  const [voted, setVoted] = useState<Voted>(null);
  const fill = useRef(new Animated.Value(17 / 30)).current;

  useEffect(() => {
    if (voted) return;
    const id = setInterval(() => {
      setResponded((r) => Math.min(30, r + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [voted]);

  useEffect(() => {
    Animated.timing(fill, {
      toValue: responded / 30,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [responded, fill]);

  const widthPercent = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
        />
      }
    >
      <Text style={styles.tag}>배심원 호출</Text>
      <Text style={styles.title}>이 글, 같은 학과 학생들의{'\n'}판단이 필요합니다</Text>
      <Text style={styles.body}>
        신고가 누적되어 같은 학과 학생 30명에게 검토를 요청했어요.{'\n'}24시간 안에 한 표 부탁드려요.
      </Text>

      <View style={[styles.previewCard, SHADOW.card]}>
        <View style={styles.previewHead}>
          <Pill>자유</Pill>
          <Text style={styles.previewMeta}>익명 · 1시간 전</Text>
          <View style={styles.warnPill}>
            <Text style={styles.warnPillText}>신고 5</Text>
          </View>
        </View>
        <Text style={styles.previewTitle}>
          중간고사 기간 도서관 운영시간 진짜 너무함
        </Text>
        <Text style={styles.previewBody} numberOfLines={4}>
          매번 시험 기간만 되면 운영시간 줄이는 거 진짜 이해가 안 갑니다. 학생회는 뭐 하나요?
          지금까지 별다른 입장도 없고, 이런 식이면 학생회비 왜 내는지 모르겠어요.
        </Text>
      </View>

      <View style={styles.counter}>
        <View style={styles.counterRow}>
          <Text style={styles.bigNum}>{responded}</Text>
          <Text style={styles.smNum}>/ 30명 응답</Text>
          <Text style={styles.timeRemain}>남은 시간 18시간</Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: widthPercent }]} />
        </View>
      </View>

      <View style={styles.ruleBox}>
        <Text style={styles.ruleText}>
          판단 기준은 학과별로 정한 자치 규정을 따릅니다.{'\n'}
          기록은 내 프로필 → 배심원 기록에서 확인할 수 있어요.
        </Text>
      </View>

      {voted && (
        <View style={styles.confirmBox}>
          <IcCheck size={16} color={C.inkNavy} />
          <Text style={styles.confirmText}>
            의견을 등록했어요. 결과는 응답이 모이면 알려드릴게요.
          </Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => setVoted('ok')}
          disabled={!!voted}
          style={({ pressed }) => [
            styles.btn,
            voted === 'ok'
              ? styles.btnPrimary
              : voted
                ? styles.btnDisabled
                : styles.btnOutline,
            pressed && voted !== 'ok' && !voted && { backgroundColor: C.surface },
          ]}
        >
          <Text style={[
            styles.btnText,
            voted === 'ok'
              ? { color: C.white }
              : voted
                ? { color: C.hint }
                : { color: C.text },
          ]}>
            문제 없음
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setVoted('issue')}
          disabled={!!voted}
          style={({ pressed }) => [
            styles.btn,
            voted === 'issue'
              ? styles.btnPrimary
              : voted
                ? styles.btnDisabled
                : styles.btnPrimary,
            pressed && !voted && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.btnText, { color: voted && voted !== 'issue' ? C.hint : C.white }]}>
            문제 있음
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: SP[5],
    paddingTop: SP[2],
    fontSize: F.size.sm,
    color: C.inkNavy,
    fontFamily: F.familySemiBold,
    letterSpacing: F.ls.wide,
    marginBottom: 6,
  },
  title: {
    paddingHorizontal: SP[5],
    fontSize: F.size.h1,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.5,
    lineHeight: 29,
  },
  body: {
    paddingHorizontal: SP[5],
    paddingTop: SP[2],
    fontSize: F.size.base,
    color: C.textMeta,
    lineHeight: 21,
  },

  previewCard: {
    margin: SP[5],
    padding: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider2,
  },
  previewHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  previewMeta: { flex: 1, fontSize: F.size.xs, color: C.hint },
  warnPill: { paddingHorizontal: SP[2], paddingVertical: 2, backgroundColor: '#FFF4EE', borderRadius: R.sm },
  warnPillText: { fontSize: F.size.xs, color: '#9A3412' },
  previewTitle: {
    fontSize: F.size.md,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.2,
    lineHeight: 19,
    marginBottom: 4,
  },
  previewBody: { fontSize: F.size.base, color: C.textSub, lineHeight: 21 },

  counter: { paddingHorizontal: SP[5], marginTop: SP[3] },
  counterRow: { flexDirection: 'row', alignItems: 'baseline', gap: SP[2] },
  bigNum: { fontSize: F.size.hero, fontFamily: F.familyBold, color: C.inkNavy, letterSpacing: -0.5 },
  smNum: { fontSize: F.size.md, color: C.textMeta },
  timeRemain: { marginLeft: 'auto', fontSize: F.size.sm, color: C.hint },
  barTrack: { marginTop: SP[2], height: 6, borderRadius: R.full, backgroundColor: C.surface2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.inkNavy },

  ruleBox: { margin: SP[5], padding: SP[3], backgroundColor: '#F8F9FA', borderRadius: R.lg },
  ruleText: { fontSize: F.size.sm, color: C.textMeta, lineHeight: 19 },

  confirmBox: {
    marginHorizontal: SP[5],
    marginTop: SP[3],
    padding: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    backgroundColor: '#E8E8F2',
    borderRadius: R.lg,
  },
  confirmText: { flex: 1, fontSize: F.size.base, color: C.inkNavy },

  bottomBar: {
    marginTop: SP[5],
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[5],
    flexDirection: 'row',
    gap: SP[2],
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnOutline: { backgroundColor: C.white, borderColor: C.divider2 },
  btnPrimary: { backgroundColor: C.inkNavy, borderColor: C.inkNavy },
  btnDisabled: { backgroundColor: C.surface2, borderColor: C.surface2 },
  btnText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },
});
