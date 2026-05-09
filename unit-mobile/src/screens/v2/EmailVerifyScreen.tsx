import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Screen,
  IcBack,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;
type R$ = RouteProp<UnitV2ParamList, 'EmailVerify'>;

const FAQ = [
  { q: '이메일이 안 와요', a: '스팸함을 확인해보세요. 학교 메일 시스템에 따라 1~2분 지연될 수 있어요.' },
  { q: '학교가 목록에 없어요', a: '4개 학교(인하/아주/서울/연세) 외에는 순차적으로 추가될 예정이에요.' },
  { q: '졸업생도 가입할 수 있나요', a: '재학생 한정입니다. 학교 이메일이 비활성화되면 자동 휴면돼요.' },
  { q: '본인이 아닌데 가입했어요', a: '계정 설정 → 회원 탈퇴에서 즉시 삭제할 수 있어요.' },
  { q: '닉네임은 어떻게 정해지나요', a: '랜덤으로 생성되고, 30일에 한 번 변경 가능해요.' },
];

export default function EmailVerifyV2() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R$>();
  const email = route.params.email;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(300);
  const [error, setError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const onChange = (i: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, '').slice(0, 1);
    setError(false);
    setCode((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyPress = (i: number, key: string) => {
    if (key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  useEffect(() => {
    if (code.every((c) => c.length === 1)) {
      // mock verify: 123456 통과
      const ok = code.join('') === '123456';
      if (ok) {
        navigation.replace('ProfileSetup');
      } else {
        setError(true);
      }
    }
  }, [code, navigation]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title="이메일 인증"
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.title}>{email}</Text>
        <Text style={styles.body}>
          위 이메일로 인증 코드를 보냈어요. 5분 안에 입력해주세요.
        </Text>
      </View>

      <View style={styles.otpRow}>
        {code.map((c, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              if (el) inputs.current[i] = el;
            }}
            value={c}
            onChangeText={(v) => onChange(i, v)}
            onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpBox,
              error && styles.otpBoxError,
              c && styles.otpBoxFilled,
            ]}
          />
        ))}
      </View>

      {error && (
        <Text style={styles.errorText}>코드가 일치하지 않아요. 다시 입력해주세요.</Text>
      )}

      <Text style={styles.timer}>
        {seconds > 0 ? `${mm}:${ss} 남음` : '코드가 만료되었어요'}
      </Text>

      <Pressable
        onPress={() => setSeconds(300)}
        style={styles.resend}
      >
        <Text style={styles.resendText}>
          {seconds === 0 ? '이메일 다시 받기' : '코드를 못 받으셨나요?'}
        </Text>
      </Pressable>

      <Hairline mx={SP[5]} />

      <Text style={styles.faqLabel}>자주 묻는 질문</Text>
      {FAQ.map((f, i) => (
        <View key={i}>
          <Pressable
            style={({ pressed }) => [styles.faqRow, pressed && styles.faqPressed]}
            onPress={() => setOpenFaq((cur) => (cur === i ? null : i))}
          >
            <Text style={styles.faqQ}>{f.q}</Text>
            <View style={openFaq === i ? styles.chevDn : undefined}>
              <IcChev size={16} color={C.hint} />
            </View>
          </Pressable>
          {openFaq === i && <Text style={styles.faqA}>{f.a}</Text>}
          <Hairline mx={SP[5]} />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: SP[5],
    paddingTop: SP[5],
    paddingBottom: SP[4],
  },
  title: {
    fontSize: F.size.lg,
    color: C.text,
    fontFamily: F.familyMedium,
    marginBottom: SP[1],
  },
  body: { fontSize: F.size.sm, color: C.textSub, lineHeight: 20 },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SP[2],
    marginTop: SP[2],
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: R.lg,
    backgroundColor: C.surface2,
    fontSize: 22,
    fontFamily: F.familySemiBold,
    color: C.text,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 0,
  },
  otpBoxFilled: { borderColor: C.inkNavy },
  otpBoxError: { borderColor: C.danger },
  errorText: {
    marginTop: SP[2],
    textAlign: 'center',
    fontSize: F.size.xs,
    color: C.danger,
    fontFamily: F.familyMedium,
  },
  timer: {
    marginTop: SP[4],
    textAlign: 'center',
    fontSize: F.size.sm,
    color: C.textMeta,
  },
  resend: {
    marginTop: SP[2],
    paddingVertical: SP[2],
    alignSelf: 'center',
  },
  resendText: {
    fontSize: F.size.base,
    color: C.inkNavy,
    fontFamily: F.familyMedium,
  },

  faqLabel: {
    paddingHorizontal: SP[5],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },
  faqRow: {
    height: 48,
    paddingHorizontal: SP[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
  },
  faqPressed: { backgroundColor: C.surface },
  faqQ: { fontSize: F.size.md, color: C.text, fontFamily: F.family },
  chevDn: { transform: [{ rotate: '90deg' }] },
  faqA: {
    paddingHorizontal: SP[5],
    paddingBottom: SP[3],
    fontSize: F.size.sm,
    color: C.textMeta,
    lineHeight: 19,
  },
});
