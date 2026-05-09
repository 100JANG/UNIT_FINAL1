import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  IconButton,
  Screen,
  IcBack,
  IcBell,
  IcMore,
  IcPlus,
  IcSend,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

type Msg =
  | { id: string; from: 'me';   body: string; t: string }
  | { id: string; from: 'them'; body: string; t: string; name: string }
  | { id: string; from: 'sys';  body: string; t: string };

const INIT: Msg[] = [
  { id: '1', from: 'them', name: '서윤', body: '발표 자료 정리 다 됐어요!', t: '오후 4:01' },
  { id: '2', from: 'them', name: '서윤', body: '근데 결론 부분에 그래프 하나 더 들어가야 할 것 같아', t: '오후 4:01' },
  { id: '3', from: 'me',                 body: '오 좋아요. 어떤 그래프?', t: '오후 4:03' },
  { id: '4', from: 'them', name: '민수', body: '참여율 70% 이상 강의 vs 미만 강의 비교', t: '오후 4:04' },
  { id: '5', from: 'me',                 body: '그럼 제가 데이터 뽑아서 차트 만들게요', t: '오후 4:05' },
  { id: '6', from: 'sys',                body: '지호님이 들어왔어요', t: '오후 4:06' },
];

export default function ChatRoomV2() {
  const navigation = useNavigation();
  const [msgs, setMsgs] = useState<Msg[]>(INIT);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // mock socket
  useEffect(() => {
    const t1 = setTimeout(() => {
      setTyping(true);
      const t2 = setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [
          ...m,
          { id: 'mock1', from: 'them', name: '지호', body: '저도 도와드릴게요', t: '오후 4:07' },
        ]);
      }, 2000);
      return () => clearTimeout(t2);
    }, 5000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [
      ...m,
      { id: `me-${Date.now()}`, from: 'me', body: draft, t: '오후 4:08' },
    ]);
    setDraft('');
  };

  return (
    <Screen
      bg={C.cream}
      scrollable={false}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <View style={{ marginLeft: 4 }}>
                <Text style={styles.titleName}>데이터분석개론 팀플</Text>
                <Text style={styles.titleSub}>참여 4명 · 활성</Text>
              </View>
            </View>
          }
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcBell />} onPress={() => undefined} />
              <IconButton icon={<IcMore />} onPress={() => undefined} />
            </View>
          }
        />
      }
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.dateChip}>2025년 5월 12일 화요일</Text>

        {msgs.map((m, i) => {
          if (m.from === 'sys') {
            return (
              <Text key={m.id} style={styles.sysMsg}>{m.body}</Text>
            );
          }
          if (m.from === 'me') {
            return (
              <View key={m.id} style={styles.meRow}>
                <Text style={styles.timeMe}>{m.t}</Text>
                <View style={styles.meBubble}>
                  <Text style={styles.meText}>{m.body}</Text>
                </View>
              </View>
            );
          }
          const prev = msgs[i - 1];
          const showName = i === 0 || prev?.from !== 'them' || prev?.name !== m.name;
          return (
            <View key={m.id} style={styles.themRow}>
              <View style={{ width: 28 }}>
                {showName && <Avatar name={m.name} size={28} />}
              </View>
              <View style={{ maxWidth: '75%' }}>
                {showName && <Text style={styles.themName}>{m.name}</Text>}
                <View style={styles.themRowInner}>
                  <View style={styles.themBubble}>
                    <Text style={styles.themText}>{m.body}</Text>
                  </View>
                  <Text style={styles.timeThem}>{m.t}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {typing && <TypingDots />}
      </ScrollView>

      <View style={styles.inputBar}>
        <Pressable style={styles.plusBtn}>
          <IcPlus size={18} color={C.textMeta} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          placeholder="메시지 입력"
          placeholderTextColor={C.hint}
          style={styles.input}
        />
        <Pressable
          onPress={send}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: !draft.trim() ? 0.4 : pressed ? 0.85 : 1 },
          ]}
        >
          <IcSend size={16} color={C.white} />
        </Pressable>
      </View>
    </Screen>
  );
}

function TypingDots() {
  const dots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View style={styles.typingRow}>
      <View style={{ width: 28 }} />
      <View style={styles.typingBubble}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { opacity: d }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center' },
  titleName: { fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text },
  titleSub: { fontSize: F.size.xs, color: C.hint, marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: SP[3], gap: SP[2] },

  dateChip: { textAlign: 'center', fontSize: F.size.xs, color: C.hint, paddingVertical: SP[1] },
  sysMsg: { textAlign: 'center', fontSize: F.size.xs, color: C.hint, paddingVertical: SP[1] },

  meRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6 },
  timeMe: { fontSize: 10, color: C.hint, marginBottom: 2 },
  meBubble: {
    maxWidth: '75%',
    backgroundColor: C.inkNavy,
    paddingHorizontal: SP[3],
    paddingVertical: SP[2],
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  meText: { color: C.white, fontSize: F.size.base, lineHeight: 20 },

  themRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  themName: { fontSize: F.size.xs, color: C.textMeta, marginBottom: 2, marginLeft: 4 },
  themRowInner: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  themBubble: {
    backgroundColor: C.white,
    paddingHorizontal: SP[3],
    paddingVertical: SP[2],
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.divider,
  },
  themText: { color: C.text, fontSize: F.size.base, lineHeight: 20 },
  timeThem: { fontSize: 10, color: C.hint, marginBottom: 2 },

  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.white,
    paddingHorizontal: SP[3],
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.divider,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.hint },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    paddingHorizontal: SP[2],
    paddingTop: SP[2],
    paddingBottom: 32,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  plusBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, height: 36,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.full,
    fontSize: F.size.base, color: C.text, fontFamily: F.family,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.inkNavy,
    alignItems: 'center', justifyContent: 'center',
  },
});
