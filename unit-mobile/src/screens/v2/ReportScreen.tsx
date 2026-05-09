import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Screen,
  IcX,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';

type R$ = RouteProp<UnitV2ParamList, 'Report'>;

const REASONS_POST = [
  '욕설·비방',
  '광고·홍보',
  '음란물',
  '허위 정보',
  '도배',
  '기타',
];
const REASONS_USER = [
  '부적절한 닉네임',
  '사칭',
  '욕설·괴롭힘',
  '사기 의심',
  '기타',
];

export default function ReportV2() {
  const navigation = useNavigation();
  const route = useRoute<R$>();
  const targetType = route.params?.targetType ?? 'post';

  const [reason, setReason] = useState<string | null>(null);
  const [body, setBody] = useState('');

  const reasons =
    targetType === 'user' ? REASONS_USER : REASONS_POST;

  const targetLabel =
    targetType === 'post' ? '신고할 글' :
    targetType === 'comment' ? '신고할 댓글' :
    '신고할 사용자';

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
          title="신고하기"
        />
      }
    >
      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>{targetLabel}</Text>
        <Text style={styles.previewBody} numberOfLines={3}>
          중간고사 기간 도서관 운영시간 진짜 너무함. 매번 시험 기간만 되면 운영시간
          줄이는 거 진짜 이해가 안 갑니다…
        </Text>
      </View>

      <Text style={styles.sectionLabel}>신고 사유</Text>
      <Hairline />

      {reasons.map((r, i) => {
        const on = reason === r;
        return (
          <Pressable
            key={r}
            onPress={() => setReason(r)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={[styles.radio, on && styles.radioOn]}>
              {on && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.rowText, on && styles.rowTextOn]}>{r}</Text>
          </Pressable>
        );
      })}
      <Hairline />

      <View style={styles.descBox}>
        <Text style={styles.descLabel}>추가 설명 (선택)</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={200}
          placeholder="어떤 부분이 문제인지 알려주세요"
          placeholderTextColor="#C9CDD3"
          style={styles.textarea}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{body.length} / 200</Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          신고는 같은 학과 학생 30명에게 검토를 요청해요.{'\n'}
          무고 신고는 매너 점수가 차감돼요.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          disabled={!reason}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: reason ? C.inkNavy : C.surface2 },
            pressed && reason && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: reason ? C.white : C.hint }]}>
            신고하기
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewBox: {
    margin: SP[5],
    padding: SP[3],
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
  },
  previewLabel: { fontSize: F.size.xs, color: C.hint, marginBottom: SP[1] },
  previewBody: { fontSize: F.size.base, color: C.textSub, lineHeight: 19 },

  sectionLabel: {
    paddingHorizontal: SP[5],
    paddingTop: SP[3],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    letterSpacing: F.ls.wide,
  },
  row: {
    height: 48,
    paddingHorizontal: SP[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  rowPressed: { backgroundColor: C.surface },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: C.hint,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { borderColor: C.inkNavy },
  radioDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.inkNavy,
  },
  rowText: { fontSize: F.size.md, color: C.textSub },
  rowTextOn: { color: C.text, fontFamily: F.familyMedium },

  descBox: { padding: SP[5], paddingTop: SP[5] },
  descLabel: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    marginBottom: SP[2],
  },
  textarea: {
    minHeight: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
    padding: 14,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
  },
  counter: {
    marginTop: SP[1],
    textAlign: 'right',
    fontSize: F.size.xs,
    color: C.hint,
  },

  notice: {
    margin: SP[5],
    marginTop: 0,
    padding: SP[3],
    backgroundColor: '#FFF4EE',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: '#FBE9E0',
  },
  noticeText: {
    fontSize: F.size.sm,
    color: '#9A3412',
    lineHeight: 19,
  },

  bottom: {
    padding: SP[5],
    paddingTop: SP[3],
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  cta: {
    height: 48,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },
});
