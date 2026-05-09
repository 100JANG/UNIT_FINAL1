import { useState } from 'react';
import {
  Pressable,
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
  IcThumb,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const PARENT = {
  context: '자유 · 기숙사 식단 이번 학기부터 바뀐 거 어때요?',
  nick: '익명3',
  time: '3분 전',
  body: '식단표 학사정보 사이트에 올라와 있어요. 4월 4주차부터 적용이라고 합니다.',
  up: 8,
};

const REPLIES = [
  { nick: '익명1', time: '1분 전', body: '오, 정보 감사합니다. 어디서 확인했어요?', up: 2 },
  { nick: '익명2', time: '방금', body: '저도 봤어요. 시리얼 코너는 확실히 빠진 듯', up: 1 },
];

export default function CommentThreadV2() {
  const navigation = useNavigation();
  const [draft, setDraft] = useState('');
  const [mention, setMention] = useState<string | null>(null);

  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>답글 {REPLIES.length}</Text>
            </View>
          }
        />
      }
    >
      {/* Parent comment card */}
      <View style={styles.parentCard}>
        <Text style={styles.context} numberOfLines={1}>
          ↳ {PARENT.context}
        </Text>
        <View style={styles.cardHead}>
          <Avatar name={PARENT.nick} size={24} />
          <Text style={styles.cardNick}>{PARENT.nick}</Text>
          <Text style={styles.cardTime}>{PARENT.time}</Text>
        </View>
        <Text style={styles.cardBody}>{PARENT.body}</Text>
        <View style={styles.cardFoot}>
          <View style={styles.thumbRow}>
            <IcThumb size={12} color={C.textMeta} />
            <Text style={styles.thumbCount}>{PARENT.up}</Text>
          </View>
          <Text style={styles.replyCount}>답글 {REPLIES.length}</Text>
        </View>
      </View>

      {/* Replies */}
      <View style={styles.replies}>
        {REPLIES.map((r, i) => (
          <View key={i} style={styles.reply}>
            <View style={styles.replyHead}>
              <Avatar name={r.nick} size={22} />
              <Text style={styles.replyNick}>{r.nick}</Text>
              <Text style={styles.replyTime}>{r.time}</Text>
            </View>
            <Text style={styles.replyBody}>{r.body}</Text>
            <View style={styles.replyFoot}>
              <Pressable hitSlop={6} style={styles.thumbRow}>
                <IcThumb size={11} color={C.hint} />
                <Text style={styles.replyMeta}>{r.up}</Text>
              </Pressable>
              <Pressable
                hitSlop={6}
                onPress={() => setMention(r.nick)}
              >
                <Text style={styles.replyMeta}>답글</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomBar}>
        {mention && (
          <View style={styles.mentionToken}>
            <Text style={styles.mentionText}>@{mention}</Text>
            <Pressable hitSlop={6} onPress={() => setMention(null)}>
              <Text style={styles.mentionX}>×</Text>
            </Pressable>
          </View>
        )}
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="답글 입력"
          placeholderTextColor={C.hint}
          style={styles.input}
        />
        <Pressable
          disabled={!draft.trim()}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          onPress={() => setDraft('')}
        >
          <Text style={[styles.sendBtn, !draft.trim() && { color: C.hint }]}>
            등록
          </Text>
        </Pressable>
      </View>
    </Screen>
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

  parentCard: {
    margin: SP[3],
    padding: SP[3],
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
  },
  context: { fontSize: F.size.xs, color: C.hint, marginBottom: SP[2] },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  cardNick: { fontSize: F.size.sm, fontFamily: F.familyMedium, color: C.text },
  cardTime: { fontSize: F.size.xs, color: C.hint },
  cardBody: {
    marginTop: SP[2],
    fontSize: F.size.base,
    color: C.textSub,
    lineHeight: 20,
  },
  cardFoot: {
    marginTop: SP[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
  },
  thumbRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  thumbCount: { fontSize: F.size.sm, color: C.textMeta },
  replyCount: { fontSize: F.size.sm, color: C.inkNavy },

  replies: { paddingHorizontal: SP[4], marginTop: SP[2] },
  reply: {
    paddingVertical: SP[3],
    borderLeftWidth: 1,
    borderLeftColor: C.divider,
    paddingLeft: SP[3],
    marginLeft: SP[2],
    marginBottom: SP[2],
  },
  replyHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  replyNick: { fontSize: F.size.sm, fontFamily: F.familyMedium, color: C.text },
  replyTime: { fontSize: F.size.xs, color: C.hint },
  replyBody: {
    marginTop: 4,
    fontSize: F.size.base,
    color: C.textSub,
    lineHeight: 20,
  },
  replyFoot: { marginTop: 4, flexDirection: 'row', gap: SP[3] },
  replyMeta: { fontSize: F.size.xs, color: C.hint },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    paddingHorizontal: SP[3],
    paddingVertical: SP[2],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.white,
  },
  mentionToken: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SP[2],
    paddingVertical: 4,
    borderRadius: R.md,
    backgroundColor: '#DCE7F5',
  },
  mentionText: { fontSize: F.size.sm, color: C.inkNavy, fontFamily: F.familyMedium },
  mentionX: { fontSize: 14, color: C.inkNavy, paddingHorizontal: 2 },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.full,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
  },
  sendBtn: {
    fontSize: F.size.base,
    color: C.inkNavy,
    fontFamily: F.familySemiBold,
    paddingHorizontal: SP[2],
  },
});
