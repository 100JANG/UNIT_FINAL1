import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  Screen,
  Sheet,
  IcChev,
  IcCheck,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const DEPTS = [
  '소프트웨어학과', '컴퓨터공학과', '경영학과', '경제학과', '심리학과',
  '디자인학과', '국어국문학과', '수학과', '물리학과', '화학과',
  '기계공학과', '전자공학과', '화학공학과', '건축학과', '간호학과',
];

const YEARS = [18, 19, 20, 21, 22, 23, 24, 25, 26];

export default function ProfileSetupV2() {
  const navigation = useNavigation<Nav>();
  const [nickname, setNickname] = useState('');
  const [nickStatus, setNickStatus] = useState<'idle' | 'ok' | 'invalid'>('idle');
  const [dept, setDept] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [terms, setTerms] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const checkNick = () => {
    const n = nickname.trim();
    const ok = /^[가-힣a-zA-Z0-9]{2,10}$/.test(n);
    setNickStatus(ok ? 'ok' : 'invalid');
  };

  const valid = nickStatus === 'ok' && dept && year != null && terms;

  return (
    <Screen
      appBar={<AppBar title="프로필 설정" />}
    >
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === 1 && styles.dotActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.dotsLabel}>이메일 인증 · 프로필 · 완료</Text>

      <View style={styles.section}>
        <Text style={styles.label}>닉네임</Text>
        <View style={styles.row}>
          <TextInput
            value={nickname}
            onChangeText={(v) => {
              setNickname(v);
              setNickStatus('idle');
            }}
            placeholder="2~10자, 한글/영문/숫자"
            placeholderTextColor={C.hint}
            style={styles.input}
            maxLength={10}
          />
          <Pressable
            onPress={checkNick}
            style={({ pressed }) => [styles.checkBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.checkBtnText}>중복확인</Text>
          </Pressable>
        </View>
        <Text
          style={[
            styles.statusText,
            nickStatus === 'ok' && { color: C.trust },
            nickStatus === 'invalid' && { color: C.danger },
          ]}
        >
          {nickStatus === 'ok'
            ? '✓ 사용 가능한 닉네임이에요'
            : nickStatus === 'invalid'
              ? '2~10자, 한글/영문/숫자만 사용할 수 있어요'
              : '한 번 정하면 30일간 변경할 수 없어요'}
        </Text>
      </View>

      <Hairline mx={SP[5]} />

      <Pressable
        style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerPressed]}
        onPress={() => setDeptOpen(true)}
      >
        <Text style={styles.label}>학과</Text>
        <View style={styles.pickerValueRow}>
          <Text style={[styles.pickerValue, !dept && { color: C.hint }]}>
            {dept || '선택해주세요'}
          </Text>
          <IcChev size={16} color={C.hint} />
        </View>
      </Pressable>

      <Hairline mx={SP[5]} />

      <Pressable
        style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerPressed]}
        onPress={() => setYearOpen(true)}
      >
        <Text style={styles.label}>학번</Text>
        <View style={styles.pickerValueRow}>
          <Text style={[styles.pickerValue, year == null && { color: C.hint }]}>
            {year != null ? `${year}학번` : '선택해주세요'}
          </Text>
          <IcChev size={16} color={C.hint} />
        </View>
      </Pressable>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          기본은 익명으로 표시돼요. 닉네임 노출은 선택 사항입니다.
        </Text>
      </View>

      <View style={styles.termsBox}>
        <View style={styles.termsRow}>
          <Pressable onPress={() => setTerms((v) => !v)} style={styles.checkbox}>
            {terms && <IcCheck size={14} color={C.white} />}
            {terms && <View style={styles.checkboxFill} />}
          </Pressable>
          <Text style={styles.termsText}>
            <Text style={styles.required}>[필수]</Text> 만 14세 이상이며, 이용약관 및
            개인정보처리방침에 동의합니다
          </Text>
        </View>
        <View style={styles.termsRow}>
          <Pressable onPress={() => setMarketing((v) => !v)} style={styles.checkbox}>
            {marketing && <IcCheck size={14} color={C.white} />}
            {marketing && <View style={styles.checkboxFill} />}
          </Pressable>
          <Text style={styles.termsText}>
            <Text style={[styles.required, { color: C.hint }]}>[선택]</Text> 마케팅
            정보 수신 동의
          </Text>
        </View>
      </View>

      <Pressable
        disabled={!valid}
        onPress={() => navigation.replace('Feed')}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: valid ? C.inkNavy : C.surface2 },
          pressed && valid && { opacity: 0.9 },
        ]}
      >
        <Text style={[styles.ctaText, { color: valid ? C.white : C.hint }]}>
          가입 완료
        </Text>
      </Pressable>

      {/* Department picker sheet */}
      <Sheet visible={deptOpen} onClose={() => setDeptOpen(false)}>
        <Text style={styles.sheetTitle}>학과 선택</Text>
        {DEPTS.map((d) => (
          <Pressable
            key={d}
            style={({ pressed }) => [styles.sheetRow, pressed && styles.pickerPressed]}
            onPress={() => {
              setDept(d);
              setDeptOpen(false);
            }}
          >
            <Text style={styles.sheetRowText}>{d}</Text>
            {dept === d && <IcCheck size={18} color={C.inkNavy} />}
          </Pressable>
        ))}
      </Sheet>

      {/* Year picker sheet */}
      <Sheet visible={yearOpen} onClose={() => setYearOpen(false)}>
        <Text style={styles.sheetTitle}>학번 선택</Text>
        {YEARS.map((y) => (
          <Pressable
            key={y}
            style={({ pressed }) => [styles.sheetRow, pressed && styles.pickerPressed]}
            onPress={() => {
              setYear(y);
              setYearOpen(false);
            }}
          >
            <Text style={styles.sheetRowText}>{y}학번</Text>
            {year === y && <IcCheck size={18} color={C.inkNavy} />}
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SP[2],
    paddingTop: SP[5],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.divider2,
  },
  dotActive: {
    width: 24,
    backgroundColor: C.inkNavy,
  },
  dotsLabel: {
    paddingTop: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
    textAlign: 'center',
    marginBottom: SP[5],
  },
  section: { paddingHorizontal: SP[5], paddingVertical: SP[3] },
  label: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    marginBottom: SP[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: F.size.lg,
    color: C.text,
    fontFamily: F.family,
    paddingVertical: 0,
  },
  checkBtn: {
    height: 36,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnText: {
    fontSize: F.size.sm,
    color: C.inkNavy,
    fontFamily: F.familyMedium,
  },
  statusText: {
    marginTop: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
  },

  pickerRow: {
    paddingHorizontal: SP[5],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
  },
  pickerPressed: { backgroundColor: C.surface },
  pickerValueRow: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  pickerValue: {
    fontSize: F.size.md,
    color: C.text,
    fontFamily: F.family,
  },

  notice: {
    margin: SP[5],
    padding: SP[3],
    backgroundColor: C.cream,
    borderRadius: R.lg,
  },
  noticeText: {
    fontSize: F.size.sm,
    color: C.textSub,
    lineHeight: 20,
  },

  termsBox: {
    marginHorizontal: SP[5],
    marginTop: SP[2],
    paddingVertical: SP[2],
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SP[2],
    paddingVertical: SP[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: R.sm,
    borderWidth: 2,
    borderColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.inkNavy,
    borderRadius: 3,
    zIndex: -1,
  },
  termsText: {
    flex: 1,
    fontSize: F.size.base,
    color: C.text,
    lineHeight: 19,
  },
  required: {
    color: C.inkNavy,
    fontFamily: F.familySemiBold,
  },

  cta: {
    marginHorizontal: SP[5],
    marginTop: SP[5],
    marginBottom: SP[6],
    height: 48,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },

  sheetTitle: {
    fontSize: F.size.h3,
    fontFamily: F.familySemiBold,
    color: C.text,
    paddingHorizontal: SP[5],
    paddingBottom: SP[3],
  },
  sheetRow: {
    paddingHorizontal: SP[5],
    paddingVertical: SP[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetRowText: { fontSize: F.size.md, color: C.text },
});
