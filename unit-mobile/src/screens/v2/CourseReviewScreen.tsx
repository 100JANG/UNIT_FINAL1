import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  IconButton,
  Screen,
  IcX,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useCreateCourseReview } from '../../hooks/useCreateCourseReview';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R$ = RouteProp<RootStackParamList, 'CourseReview'>;

export default function CourseReviewV2() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R$>();

  const draft = useCreateCourseReview({
    courseId: params.courseId,
    onSuccess: () => {
      // Replace so back-press does not return to the now-stale review screen.
      // CourseDetail will refetch on mount and show the updated stats.
      navigation.replace('CourseDetail', { courseId: params.courseId });
    },
  });

  const showCount = draft.comment.length > 0;
  const tooLong = draft.comment.length > draft.maxCommentLength;

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
          trailing={
            <Pressable
              hitSlop={6}
              onPress={draft.skipReview}
              disabled={draft.isSubmitting}
            >
              <Text style={[styles.skipText, draft.isSubmitting && { opacity: 0.5 }]}>
                건너뛰기
              </Text>
            </Pressable>
          }
        />
      }
    >
      <View style={styles.body}>
        <Text style={styles.title}>강의 평가</Text>
        <Text style={styles.intro}>
          한 줄 평가 후 다른 강의평을 볼 수 있어요. 추천 / 비추천 / 건너뛰기 중 하나를 선택해주세요.
        </Text>

        <View style={styles.btnRow}>
          <VoteButton
            emoji="👍"
            label="추천"
            on={draft.vote === 'RECOMMEND'}
            disabled={draft.isSubmitting}
            onPress={() =>
              draft.setVote(draft.vote === 'RECOMMEND' ? null : 'RECOMMEND')
            }
          />
          <VoteButton
            emoji="👎"
            label="비추천"
            on={draft.vote === 'NOT_RECOMMEND'}
            disabled={draft.isSubmitting}
            onPress={() =>
              draft.setVote(draft.vote === 'NOT_RECOMMEND' ? null : 'NOT_RECOMMEND')
            }
          />
        </View>

        <Text style={styles.label}>한 줄로 남기고 싶은 말 (선택)</Text>
        <TextInput
          value={draft.comment}
          onChangeText={draft.setComment}
          editable={!draft.isSubmitting}
          multiline
          maxLength={draft.maxCommentLength + 50 /* allow temporary over-paste; client validation flags it */}
          placeholder="다음 학기에 들을 학생에게 도움이 되는 한마디"
          placeholderTextColor="#C9CDD3"
          style={styles.textarea}
          textAlignVertical="top"
        />
        {showCount && (
          <Text style={[styles.counter, tooLong && { color: C.warn }]}>
            {draft.comment.length} / {draft.maxCommentLength}
          </Text>
        )}

        {draft.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{draft.error.message}</Text>
            {draft.error.fieldErrors?.map(f => (
              <Text key={f.field} style={styles.fieldError}>
                · {f.field}: {f.reason}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={!draft.canSubmit}
          onPress={draft.submitReview}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: draft.canSubmit ? C.inkNavy : C.surface2 },
            pressed && draft.canSubmit && { opacity: 0.9 },
          ]}
        >
          <Text style={[styles.ctaText, { color: draft.canSubmit ? C.white : C.hint }]}>
            {draft.isSubmitting ? '등록 중…' : '등록'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function VoteButton({
  emoji,
  label,
  on,
  disabled,
  onPress,
}: {
  emoji: string;
  label: string;
  on: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bigBtn,
        on && styles.bigBtnOn,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.bigBtnEmoji, on && { color: C.white }]}>{emoji}</Text>
      <Text style={[styles.bigBtnText, on && { color: C.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  skipText: { fontSize: F.size.sm, color: C.hint, paddingHorizontal: SP[2] },

  body: { flex: 1, paddingHorizontal: SP[5], paddingTop: SP[4] },
  title: { fontSize: F.size.h2, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.4 },
  intro: { marginTop: SP[2], fontSize: F.size.sm, color: C.hint, lineHeight: 19 },

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

  errorBox: {
    marginTop: SP[4],
    padding: SP[3],
    backgroundColor: '#FFF6F6',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  errorText: { fontSize: F.size.sm, color: C.warn, fontFamily: F.familyMedium },
  fieldError: { fontSize: F.size.xs, color: C.warn, marginTop: 2 },

  bottomBar: { paddingHorizontal: SP[5], paddingTop: SP[3], paddingBottom: SP[5] },
  cta: { height: 48, borderRadius: R.lg, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: F.size.lg, fontFamily: F.familySemiBold },
});
