import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  Screen,
  IcX,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

type Vote = 'rec' | 'no' | null;

export default function CourseReviewV2() {
  const navigation = useNavigation();
  const [vote, setVote] = useState<Vote>(null);
  const [body, setBody] = useState('');

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
          trailing={
            <Pressable hitSlop={6} onPress={() => navigation.goBack()}>
              <Text style={styles.skipText}>건너뛰기</Text>
            </Pressable>
          }
        />
      }
    >
      <View style={styles.body}>
        <Text style={styles.name}>데이터분석개론</Text>
        <Text style={styles.meta}>김지연 · 소프트웨어학과</Text>
        <Text style={styles.intro}>한 줄 평가 후 다른 강의평을 볼 수 있어요</Text>

        <View style={styles.btnRow}>
          <Pressable
            onPress={() => setVote('rec')}
            style={({ pressed }) => [
              styles.bigBtn,
              vote === 'rec' && styles.bigBtnOn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.bigBtnEmoji, vote === 'rec' && { color: C.white }]}>👍</Text>
            <Text style={[styles.bigBtnText, vote === 'rec' && { color: C.white }]}>추천</Text>
          </Pressable>
          <Pressable
            onPress={() => setVote('no')}
            style={({ pressed }) => [
              styles.bigBtn,
              vote === 'no' && styles.bigBtnOn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.bigBtnEmoji, vote === 'no' && { color: C.white }]}>👎</Text>
            <Text style={[styles.bigBtnText, vote === 'no' && { color: C.white }]}>비추천</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>한 줄로 남기고 싶은 말 (선택)</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={150}
          placeholder="다음 학기에 들을 학생에게 도움이 되는 한마디"
          placeholderTextColor="#C9CDD3"
          style={styles.textarea}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{body.length} / 150</Text>
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={!vote}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: vote ? C.inkNavy : C.surface2 },
            pressed && vote && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: vote ? C.white : C.hint }]}>등록</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipText: { fontSize: F.size.sm, color: C.hint, paddingHorizontal: SP[2] },

  body: { flex: 1, paddingHorizontal: SP[5], paddingTop: SP[4] },
  name: { fontSize: F.size.h1, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.4 },
  meta: { marginTop: 4, fontSize: F.size.base, color: C.textMeta },
  intro: { marginTop: SP[3], fontSize: F.size.sm, color: C.hint },

  btnRow: { marginTop: SP[5], flexDirection: 'row', gap: SP[2] },
  bigBtn: {
    flex: 1,
    height: 88,
    borderRadius: R.lg,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bigBtnOn: { backgroundColor: C.inkNavy },
  bigBtnEmoji: { fontSize: 28, color: C.textMeta },
  bigBtnText: { fontSize: F.size.md, color: C.textMeta, fontFamily: F.familySemiBold },

  label: { marginTop: SP[5], marginBottom: SP[2], fontSize: F.size.sm, color: C.hint },
  textarea: {
    minHeight: 100,
    padding: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
    lineHeight: 20,
  },
  counter: { marginTop: 4, textAlign: 'right', fontSize: F.size.xs, color: C.hint },

  bottomBar: { paddingHorizontal: SP[5], paddingTop: SP[3], paddingBottom: SP[5] },
  cta: { height: 48, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },
});
