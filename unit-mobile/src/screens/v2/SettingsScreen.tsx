import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  ListRow,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

export default function SettingsV2() {
  const navigation = useNavigation<Nav>();
  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>설정</Text>
            </View>
          }
        />
      }
    >
      <Section label="알림">
        <ListRow
          label="푸시 알림"
          trailing="chev"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
      </Section>

      <Section label="계정">
        <ListRow
          label="이메일"
          value="22001@inha.ac.kr"
        />
        <ListRow
          label="비밀번호 변경"
          trailing="chev"
          onPress={() => navigation.navigate('AccountSettings')}
        />
        <ListRow label="로그아웃" />
        <ListRow
          label="회원 탈퇴"
          onPress={() => navigation.navigate('AccountSettings')}
        />
      </Section>

      <Section label="개인정보">
        <ListRow
          label="차단 목록"
          value="4명"
          trailing="chev"
          onPress={() => navigation.navigate('BlockList')}
        />
        <ListRow
          label="데이터 다운로드 요청"
          trailing="chev"
        />
      </Section>

      <Section label="앱 정보">
        <ListRow label="버전" value="0.4.2 · 최신" />
        <ListRow label="이용약관" trailing="chev" />
        <ListRow label="개인정보처리방침" trailing="chev" />
        <ListRow label="오픈소스 라이선스" trailing="chev" />
        <ListRow label="문의하기" trailing="chev" />
      </Section>

      <Text style={styles.footer}>UNIT v0.4.2 · 2026</Text>
    </Screen>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </>
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
  sectionLabel: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[1],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },
  card: {
    marginHorizontal: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },
  footer: {
    paddingVertical: SP[6],
    fontSize: F.size.xs,
    color: C.hint,
    textAlign: 'center',
  },
});
