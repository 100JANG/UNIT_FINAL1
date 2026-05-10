// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
//
// "테스트 학교로 시연 시작" Pressable. EXPO_PUBLIC_APP_MODE === 'demo' 가 아니면
// 컴포넌트가 null 을 반환해 어떤 화면에도 노출되지 않는다.
//
// 호출자는 onEntered 콜백으로 후속 네비게이션(예: Tabs 리셋, Feed refetch)을 정의한다.

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDemoLogin } from '../../hooks/useDemoLogin';

export function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_APP_MODE === 'demo';
}

type Props = {
  onEntered?: () => void;
};

export default function DemoSchoolEntry({ onEntered }: Props) {
  if (!isDemoMode()) return null;

  const demo = useDemoLogin({ onSuccess: () => onEntered?.() });

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>DEMO</Text>
        <Text style={styles.title}>테스트 학교로 시연 시작</Text>
      </View>
      <Text style={styles.subtitle}>
        시연용 Demo Mode 입니다. 회원가입과 학생인증 없이 임시 계정으로 입장합니다.
      </Text>
      <Pressable
        onPress={demo.start}
        disabled={demo.isSubmitting}
        style={({ pressed }) => [
          styles.cta,
          demo.isSubmitting && { opacity: 0.6 },
          pressed && !demo.isSubmitting && { opacity: 0.85 },
        ]}
      >
        {demo.isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.ctaText}>테스트 학교로 시연 시작</Text>
        )}
      </Pressable>
      {demo.error && (
        <Text style={styles.error}>{demo.error.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FEF6E7',
    borderColor: '#F5D78E',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    margin: 12,
    gap: 8,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#B79235',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#5C4A0E' },
  subtitle: { fontSize: 12, color: '#8A6D17', lineHeight: 16 },
  cta: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  error: { fontSize: 12, color: '#B91C1C', marginTop: 4 },
});
// DEMO_MODE_END
