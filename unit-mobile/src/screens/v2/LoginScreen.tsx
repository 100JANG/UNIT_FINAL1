import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  LogoMark,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const SCHOOL = { name: '인하대학교', domain: 'inha.ac.kr' };

export default function LoginV2() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');

  const valid = email.trim().length >= 4;

  const submit = () => {
    if (!valid) return;
    navigation.navigate('EmailVerify', {
      email: `${email}@${SCHOOL.domain}`,
    });
  };

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title="로그인"
        />
      }
    >
      <View style={styles.heroRow}>
        <LogoMark domain={SCHOOL.domain} size={28} />
        <Text style={styles.schoolName}>{SCHOOL.name}</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.changeLink}>학교 변경</Text>
        </Pressable>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>학교 이메일</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="학번"
            placeholderTextColor={C.hint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.suffix}>@{SCHOOL.domain}</Text>
        </View>
        <View style={styles.underline} />
        <Text style={styles.hint}>인증 코드를 보내드릴 이메일이에요</Text>
      </View>

      <Pressable
        onPress={submit}
        disabled={!valid}
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: valid ? C.inkNavy : C.surface2 },
          pressed && valid && styles.ctaPressed,
        ]}
      >
        <Text style={[styles.ctaText, { color: valid ? C.white : C.hint }]}>
          인증 코드 받기
        </Text>
      </Pressable>

      <Text style={styles.terms}>
        가입 시 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[3],
  },
  schoolName: {
    flex: 1,
    fontSize: F.size.md,
    fontFamily: F.familyMedium,
    color: C.text,
  },
  changeLink: {
    fontSize: F.size.sm,
    color: C.inkNavy,
    fontFamily: F.familyMedium,
  },

  formGroup: { paddingHorizontal: SP[5], paddingTop: SP[4] },
  label: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    marginBottom: SP[1],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: SP[2],
  },
  input: {
    flex: 1,
    fontSize: F.size.lg,
    color: C.text,
    fontFamily: F.family,
    padding: 0,
  },
  suffix: {
    fontSize: F.size.lg,
    color: C.hint,
    fontFamily: F.family,
    marginLeft: SP[1],
  },
  underline: {
    height: 1.5,
    backgroundColor: C.divider2,
  },
  hint: {
    marginTop: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
  },

  cta: {
    marginHorizontal: SP[5],
    marginTop: SP[6],
    height: 48,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.9 },
  ctaText: {
    fontSize: F.size.lg,
    fontFamily: F.familySemiBold,
  },
  terms: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    fontSize: F.size.xs,
    color: C.hint,
    textAlign: 'center',
    lineHeight: 17,
  },
});
