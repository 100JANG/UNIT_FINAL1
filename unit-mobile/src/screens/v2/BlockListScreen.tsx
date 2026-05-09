import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  Screen,
  Tabs,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

type Blocked = { id: string; name: string; dept: string; date: string };

const INIT: Blocked[] = [
  { id: 'u1', name: '익명1', dept: '소프트웨어학과', date: '5/8' },
  { id: 'u2', name: '익명2', dept: '경영학과',       date: '5/3' },
  { id: 'u3', name: '익명3', dept: '디자인학과',     date: '4/28' },
  { id: 'u4', name: '익명4', dept: '경제학과',       date: '4/12' },
];

const WORDS_INIT = ['욕설', '광고', '도배', '스팸', '음란', '사기'];

export default function BlockListV2() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'users' | 'words'>('users');
  const [users, setUsers] = useState(INIT);
  const [words, setWords] = useState(WORDS_INIT);

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>차단 목록</Text>
            </View>
          }
        />
      }
    >
      <Tabs
        items={[
          { id: 'users', label: '사용자', count: users.length },
          { id: 'words', label: '단어', count: words.length },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'users' | 'words')}
      />

      {tab === 'users' &&
        users.map((u, i) => (
          <BlockedUserRow
            key={u.id}
            user={u}
            isLast={i === users.length - 1}
            onUnblock={() => setUsers((prev) => prev.filter((x) => x.id !== u.id))}
          />
        ))}

      {tab === 'users' && users.length === 0 && (
        <Text style={styles.empty}>차단한 사용자가 없어요</Text>
      )}

      {tab === 'words' && (
        <View style={styles.wordsWrap}>
          {words.map((w) => (
            <View key={w} style={styles.wordChip}>
              <Text style={styles.wordChipText}>{w}</Text>
              <Pressable
                hitSlop={6}
                onPress={() => setWords((prev) => prev.filter((x) => x !== w))}
              >
                <Text style={styles.wordChipX}>×</Text>
              </Pressable>
            </View>
          ))}
          {words.length === 0 && (
            <Text style={styles.empty}>차단한 단어가 없어요</Text>
          )}
        </View>
      )}

      {tab === 'words' && (
        <Text style={styles.wordsHelp}>
          차단한 단어가 포함된 글은 자동으로 가려져요
        </Text>
      )}
    </Screen>
  );
}

/**
 * 2-step unblock per docs/handoff/05_INTERACTIONS.md "Block 해제":
 *  Step 0 idle:  red "해제" button
 *  Step 1 confirm: red "정말 해제?" — auto-revert in 2.2s
 *  Step 2 done:  green "✓ 해제됨" (0.7s) → 0.3s fade-out → row removed
 */
function BlockedUserRow({
  user,
  isLast,
  onUnblock,
}: {
  user: Blocked;
  isLast: boolean;
  onUnblock: () => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revertTimer.current) clearTimeout(revertTimer.current);
      if (finishTimer.current) clearTimeout(finishTimer.current);
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };
  }, []);

  const onPressBtn = () => {
    if (step === 0) {
      setStep(1);
      revertTimer.current = setTimeout(() => setStep(0), 2200);
    } else if (step === 1) {
      if (revertTimer.current) clearTimeout(revertTimer.current);
      setStep(2);
      finishTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        removeTimer.current = setTimeout(onUnblock, 320);
      }, 700);
    }
  };

  const label = step === 0 ? '해제' : step === 1 ? '정말 해제?' : '✓ 해제됨';
  const tone =
    step === 2 ? { bg: '#E8F4EE', fg: C.trust } :
    { bg: 'transparent', fg: C.danger, border: C.danger };

  return (
    <Animated.View style={{ opacity }}>
      <View style={styles.row}>
        <Avatar name={user.name} size={36} />
        <View style={styles.rowText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>
            {user.dept} · 차단 {user.date}
          </Text>
        </View>
        <Pressable
          onPress={onPressBtn}
          disabled={step === 2}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: tone.bg,
              borderColor: tone.border ?? 'transparent',
              borderWidth: tone.border ? 1 : 0,
            },
            pressed && step !== 2 && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.btnText, { color: tone.fg }]}>{label}</Text>
        </Pressable>
      </View>
      {!isLast && <Hairline mx={SP[4]} />}
    </Animated.View>
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

  row: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
  },
  rowText: { flex: 1 },
  name: { fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text },
  meta: { fontSize: F.size.sm, color: C.textMeta, marginTop: 2 },
  btn: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  btnText: {
    fontSize: F.size.sm,
    fontFamily: F.familyMedium,
  },

  wordsWrap: {
    paddingHorizontal: SP[4],
    paddingTop: SP[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP[2],
  },
  wordChip: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.full,
    backgroundColor: C.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[1],
  },
  wordChipText: { fontSize: F.size.sm, color: C.textSub },
  wordChipX: { fontSize: 14, color: C.hint, paddingHorizontal: 2 },
  wordsHelp: {
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    fontSize: F.size.xs,
    color: C.hint,
  },
  empty: {
    paddingTop: SP[7],
    fontSize: F.size.md,
    color: C.hint,
    textAlign: 'center',
  },
});
