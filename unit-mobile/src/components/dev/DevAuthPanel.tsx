// Dev-only session-token bootstrap.
//
// Login UI is Reserved in this build, so there is no production path for storing
// a sessionToken yet. To allow API-connection testing during development, this
// panel lets the developer paste a JWT from Postman / Spring Boot logs, persist
// it via expo-secure-store, and clear it.
//
// HARD GUARANTEES:
// - Renders nothing when `__DEV__` is false (i.e. in production builds).
// - Never prints the full token. Display is masked to the first 6 characters
//   plus length. The clipboard / TextInput value is never logged.
// - Not a substitute for a real login flow. Labelled clearly as "개발용".

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  clearSessionToken,
  getSessionToken,
  setSessionToken,
} from '../../services/auth/sessionToken';

function maskToken(token: string): string {
  const head = token.slice(0, 6);
  return `${head}…(len=${token.length})`;
}

export default function DevAuthPanel() {
  if (!__DEV__) return null;

  const [draft, setDraft] = useState('');
  const [current, setCurrent] = useState<string | null | undefined>(undefined);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    let mounted = true;
    void getSessionToken().then(t => {
      if (mounted) setCurrent(t);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await setSessionToken(trimmed);
    setCurrent(trimmed);
    setDraft('');
  };

  const onClear = async () => {
    await clearSessionToken();
    setCurrent(null);
    setDraft('');
  };

  const status =
    current === undefined ? '확인 중…' : current ? `토큰 저장됨: ${maskToken(current)}` : '토큰 없음';

  if (collapsed) {
    return (
      <Pressable onPress={() => setCollapsed(false)} style={[styles.bar, styles.barCollapsed]}>
        <Text style={styles.barLabel}>DEV · {status}</Text>
        <Text style={styles.barHint}>탭해서 펼치기</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>개발용 세션 토큰</Text>
        <Pressable onPress={() => setCollapsed(true)} hitSlop={8}>
          <Text style={styles.collapseBtn}>접기</Text>
        </Pressable>
      </View>
      <Text style={styles.subtle}>
        Reserved 로그인 대신 API 테스트용으로만 사용. 프로덕션 빌드에서는 노출되지 않습니다.
      </Text>
      <Text style={styles.status}>{status}</Text>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="sessionToken 붙여넣기"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.actions}>
        <Pressable
          onPress={onSave}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            !draft.trim() && styles.btnDisabled,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.btnPrimaryText}>저장</Text>
        </Pressable>
        <Pressable
          onPress={onClear}
          style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.btnSecondaryText}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF6E7',
    borderBottomWidth: 1,
    borderBottomColor: '#F5D78E',
  },
  barCollapsed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: { fontSize: 11, color: '#8A6D17' },
  barHint: { fontSize: 11, color: '#B79235' },

  panel: {
    padding: 12,
    backgroundColor: '#FEF6E7',
    borderBottomWidth: 1,
    borderBottomColor: '#F5D78E',
    gap: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '600', color: '#5C4A0E' },
  collapseBtn: { fontSize: 12, color: '#8A6D17' },
  subtle: { fontSize: 11, color: '#8A6D17', lineHeight: 15 },
  status: { fontSize: 12, color: '#5C4A0E' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5D78E',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1F2937',
  },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnPrimary: { backgroundColor: '#1F2937' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  btnSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  btnSecondaryText: { color: '#374151', fontSize: 13, fontWeight: '500' },
  btnDisabled: { opacity: 0.5 },
});
