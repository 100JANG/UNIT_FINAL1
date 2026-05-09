import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C, F } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

export default function SplashV2() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('SchoolSelect');
    }, 1200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.logo}>UNIT</Text>
        <Text style={styles.tagline}>내 학교 안의 진짜 이야기</Text>
      </View>
      <Text style={styles.copy}>© 2026 UNIT</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: F.size.jumbo,
    fontFamily: F.familyBold,
    color: C.inkNavy,
    letterSpacing: -2,
  },
  tagline: {
    marginTop: 12,
    fontSize: F.size.base,
    color: C.textMeta,
    fontFamily: F.family,
  },
  copy: {
    marginBottom: 32,
    fontSize: F.size.xs,
    color: C.hint,
  },
});
