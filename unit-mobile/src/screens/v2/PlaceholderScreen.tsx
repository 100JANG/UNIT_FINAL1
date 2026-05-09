import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, AppBar, IconButton, IcBack } from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';

type PlaceholderScreenProps = {
  routeName: string;
  spec?: string;
};

/**
 * Generic v2 placeholder. PR-02 wires every UnitV2 route to this component.
 * Subsequent PRs (PR-03~PR-10) replace per-route entries with real screens.
 */
export function PlaceholderScreen({ routeName, spec }: PlaceholderScreenProps) {
  const navigation = useNavigation();
  return (
    <Screen
      appBar={
        <AppBar
          leading={
            navigation.canGoBack() ? (
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
            ) : undefined
          }
          title={routeName}
        />
      }
    >
      <View style={styles.body}>
        <Text style={styles.tag}>UNIT v2 · placeholder</Text>
        <Text style={styles.title}>{routeName}</Text>
        <Text style={styles.spec}>
          {spec ?? '이 화면은 PR-03 이후 단계에서 채워집니다.'}
        </Text>
        <Text style={styles.hint}>
          docs/handoff/03_SCREENS.md 의 “{routeName}” 항목 참조
        </Text>
        {navigation.canGoBack() && (
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
          >
            <Text style={styles.backText}>← 뒤로</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
export default PlaceholderScreen;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: SP[5],
    paddingTop: SP[7],
    alignItems: 'center',
  },
  tag: {
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.inkNavy,
    letterSpacing: 0.5,
    marginBottom: SP[1],
  },
  title: {
    fontSize: F.size.h1,
    fontFamily: F.familyBold,
    color: C.text,
    letterSpacing: -0.4,
    marginBottom: SP[2],
  },
  spec: {
    fontSize: F.size.base,
    fontFamily: F.family,
    color: C.textMeta,
    textAlign: 'center',
    lineHeight: F.size.base * F.lh.comfy,
    marginBottom: SP[3],
  },
  hint: {
    fontSize: F.size.xs,
    fontFamily: F.family,
    color: C.hint,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: SP[6],
    paddingHorizontal: SP[4],
    paddingVertical: SP[2],
    borderRadius: 8,
    backgroundColor: C.surface2,
  },
  backPressed: { opacity: 0.8 },
  backText: {
    fontSize: F.size.md,
    fontFamily: F.familyMedium,
    color: C.inkNavy,
  },
});
