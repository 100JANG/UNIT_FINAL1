import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

export default function AccountSettingsV2() {
  const navigation = useNavigation();
  const [step, setStep] = useState<'main' | 'withdraw1' | 'withdraw2'>('main');
  const [reason, setReason] = useState<string | null>(null);
  const [pw, setPw] = useState('');
  const [feedback, setFeedback] = useState('');

  if (step === 'withdraw1') {
    return (
      <Screen
        appBar={
          <AppBar
            leading={<IconButton icon={<IcBack />} onPress={() => setStep('main')} />}
            title="회원 탈퇴"
          />
        }
      >
        <View style={styles.warnBox}>
          <Text style={styles.warnTitle}>탈퇴하면 다음 데이터가 모두 삭제됩니다</Text>
          <Text style={styles.warnBody}>
            • 작성한 글·댓글·강의평{'\n'}
            • 매너 학점·친구 관계·스크랩{'\n'}
            • 채팅 기록 (상대방 화면에는 "(알 수 없음)"으로 표시){'\n\n'}
            탈퇴 후 30일 이내에는 동일한 학교 이메일로 다시 가입할 수 없어요.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>탈퇴 사유 (필수)</Text>
        {[
          '다른 앱을 사용해요',
          '익명성에 만족하지 못해요',
          '활동이 적어요',
          '매너 점수 회복이 어려워요',
          '기타',
        ].map((r) => {
          const on = reason === r;
          return (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              style={({ pressed }) => [styles.radioRow, pressed && styles.pressed]}
            >
              <View style={[styles.radio, on && { borderColor: C.inkNavy }]}>
                {on && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.radioText, on && { color: C.text, fontFamily: F.familyMedium }]}>
                {r}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          disabled={!reason}
          onPress={() => setStep('withdraw2')}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: reason ? C.danger : C.surface2 },
            pressed && reason && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: reason ? C.white : C.hint }]}>
            계속하기
          </Text>
        </Pressable>
      </Screen>
    );
  }

  if (step === 'withdraw2') {
    return (
      <Screen
        appBar={
          <AppBar
            leading={<IconButton icon={<IcBack />} onPress={() => setStep('withdraw1')} />}
            title="회원 탈퇴 확인"
          />
        }
      >
        <Text style={styles.confirmTitle}>마지막 확인</Text>
        <Text style={styles.confirmBody}>
          비밀번호를 입력하면 즉시 탈퇴 처리돼요. 되돌릴 수 없습니다.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            value={pw}
            onChangeText={setPw}
            secureTextEntry
            placeholder="현재 비밀번호"
            placeholderTextColor={C.hint}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>마지막으로 남기실 말씀이 있나요? (선택)</Text>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            multiline
            placeholder="앱이 더 나아지는 데 큰 도움이 됩니다"
            placeholderTextColor={C.hint}
            style={[styles.input, { minHeight: 100 }]}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          disabled={pw.length < 8}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: pw.length >= 8 ? C.danger : C.surface2 },
            pressed && pw.length >= 8 && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: pw.length >= 8 ? C.white : C.hint }]}>
            탈퇴하기
          </Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>계정</Text>
            </View>
          }
        />
      }
    >
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>이메일</Text>
          <Text style={styles.infoValue}>22001@inha.ac.kr</Text>
        </View>
        <Hairline />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>가입일</Text>
          <Text style={styles.infoValue}>2025-03-04</Text>
        </View>
        <Hairline />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>인증 상태</Text>
          <Text style={[styles.infoValue, { color: C.trust }]}>✓ 인증됨</Text>
        </View>
      </View>

      <Text style={styles.section}>비밀번호 변경</Text>
      <View style={styles.form}>
        <TextInput
          secureTextEntry
          placeholder="현재 비밀번호"
          placeholderTextColor={C.hint}
          style={styles.formInput}
        />
        <Hairline />
        <TextInput
          secureTextEntry
          placeholder="새 비밀번호 (8자 이상)"
          placeholderTextColor={C.hint}
          style={styles.formInput}
        />
        <Hairline />
        <TextInput
          secureTextEntry
          placeholder="새 비밀번호 확인"
          placeholderTextColor={C.hint}
          style={styles.formInput}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.changeBtn, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.changeText}>변경하기</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && { backgroundColor: C.surface2 }]}
      >
        <Text style={styles.logoutText}>로그아웃</Text>
      </Pressable>

      <Pressable
        onPress={() => setStep('withdraw1')}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.withdrawLink}>회원 탈퇴</Text>
      </Pressable>
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

  infoCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },
  infoRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: { fontSize: F.size.sm, color: C.hint },
  infoValue: { fontSize: F.size.md, color: C.text, fontFamily: F.familyMedium },

  section: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.base,
    fontFamily: F.familyMedium,
    color: C.text,
  },
  form: {
    marginHorizontal: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },
  formInput: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    fontSize: F.size.md,
    color: C.text,
    fontFamily: F.family,
  },

  changeBtn: {
    marginHorizontal: SP[4],
    marginTop: SP[4],
    height: 48,
    borderRadius: R.lg,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: { fontSize: F.size.lg, color: C.white, fontFamily: F.familySemiBold },

  logoutBtn: {
    marginHorizontal: SP[4],
    marginTop: SP[5],
    height: 48,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: F.size.md, color: C.textSub, fontFamily: F.familyMedium },

  withdrawLink: {
    marginTop: SP[7],
    marginBottom: SP[6],
    textAlign: 'center',
    fontSize: F.size.sm,
    color: C.hint,
    textDecorationLine: 'underline',
  },

  warnBox: {
    margin: SP[4],
    padding: SP[4],
    backgroundColor: '#FFF4EE',
    borderRadius: R.lg,
  },
  warnTitle: {
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
    color: '#9A3412',
    marginBottom: SP[2],
  },
  warnBody: {
    fontSize: F.size.sm,
    color: '#B45309',
    lineHeight: 20,
  },
  sectionLabel: {
    paddingHorizontal: SP[4],
    paddingTop: SP[2],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    letterSpacing: F.ls.wide,
  },
  radioRow: {
    height: 48,
    paddingHorizontal: SP[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  pressed: { backgroundColor: C.surface },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: C.hint,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.inkNavy },
  radioText: { fontSize: F.size.md, color: C.textSub },

  cta: {
    marginHorizontal: SP[4],
    marginTop: SP[5],
    marginBottom: SP[6],
    height: 48,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },

  confirmTitle: {
    paddingHorizontal: SP[5],
    paddingTop: SP[5],
    fontSize: F.size.h2,
    fontFamily: F.familyBold,
    color: C.text,
    marginBottom: SP[2],
  },
  confirmBody: {
    paddingHorizontal: SP[5],
    fontSize: F.size.md,
    color: C.textSub,
    lineHeight: 22,
    marginBottom: SP[5],
  },
  formGroup: { paddingHorizontal: SP[5], paddingTop: SP[3] },
  label: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    marginBottom: SP[2],
  },
  input: {
    backgroundColor: C.surface2,
    borderRadius: R.md,
    paddingHorizontal: SP[3],
    paddingVertical: SP[3],
    fontSize: F.size.md,
    color: C.text,
    fontFamily: F.family,
  },
});
