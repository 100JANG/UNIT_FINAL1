import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  LogoMark,
  Screen,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DemoSchoolEntry from '../../components/dev/DemoSchoolEntry';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

const SCHOOLS = [
  { name: '인하대학교', short: '인하대', domain: 'inha.ac.kr',   loc: '인천 미추홀구' },
  { name: '아주대학교', short: '아주대', domain: 'ajou.ac.kr',   loc: '경기 수원시'   },
  { name: '서울대학교', short: '서울대', domain: 'snu.ac.kr',    loc: '서울 관악구'   },
  { name: '고려대학교', short: '고려대', domain: 'korea.ac.kr',  loc: '서울 성북구'   },
  { name: '연세대학교', short: '연세대', domain: 'yonsei.ac.kr', loc: '서울 서대문구' },
];

export default function SchoolSelectV2() {
  const [q, setQ] = useState('');
  const navigation = useNavigation<Nav>();

  const list = useMemo(() => {
    const k = q.trim();
    if (!k) return SCHOOLS;
    return SCHOOLS.filter(
      (s) =>
        s.name.includes(k) ||
        s.short.includes(k) ||
        s.domain.includes(k.toLowerCase()),
    );
  }, [q]);

  // DEMO_MODE_START
  // 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
  // demo 진입 성공 시 학교선택 → 로그인 화면으로 가지 않고 곧장 Tabs(Feed)로 reset 한다.
  // 부모 navigator(Root stack)에 reset 액션을 dispatch 한다.
  const onDemoEntered = () => {
    const root = navigation.getParent();
    if (root) {
      root.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Tabs' }] }));
    }
  };
  // DEMO_MODE_END

  return (
    <Screen
      appBar={<AppBar title="학교 선택" />}
    >
      {/* DEMO_MODE_START — 운영 모드에선 컴포넌트가 null 을 반환해 자동으로 숨겨진다. */}
      <DemoSchoolEntry onEntered={onDemoEntered} />
      {/* DEMO_MODE_END */}

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <IcSearch size={18} color={C.hint} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="학교명 또는 도메인 검색"
            placeholderTextColor={C.hint}
            style={styles.searchInput}
          />
        </View>
      </View>

      <Text style={styles.section}>인기 학교</Text>
      <Hairline />

      {list.map((s, i) => (
        <View key={s.domain}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigation.navigate('Login')}
          >
            <LogoMark domain={s.domain} size={36} />
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{s.name}</Text>
              <Text style={styles.rowMeta}>
                {s.domain} · {s.loc}
              </Text>
            </View>
          </Pressable>
          {i < list.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}

      {list.length === 0 && (
        <Text style={styles.empty}>다른 학교는 곧 추가될 예정이에요</Text>
      )}

      <Text style={styles.footer}>학교 이메일로 인증한 학생만 가입할 수 있어요</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: SP[4], paddingTop: SP[3] },
  searchBox: {
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  searchInput: {
    flex: 1,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
    padding: 0,
  },
  section: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },
  row: {
    height: 56,
    paddingHorizontal: SP[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
  },
  rowPressed: { backgroundColor: C.surface },
  rowText: { flex: 1 },
  rowName: {
    fontSize: F.size.lg,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  rowMeta: { fontSize: F.size.sm, color: C.textMeta, marginTop: 2 },
  empty: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    fontSize: F.size.md,
    color: C.hint,
    textAlign: 'center',
  },
  footer: {
    marginTop: SP[6],
    marginBottom: SP[4],
    fontSize: F.size.xs,
    color: C.hint,
    textAlign: 'center',
  },
});
