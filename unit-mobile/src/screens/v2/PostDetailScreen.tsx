import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcBack,
  IcMore,
  IcThumb,
  IcMsg,
  IcBookmark,
  IcShare,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;
type R$ = RouteProp<UnitV2ParamList, 'PostDetail'>;

const POST = {
  board: '자유',
  nick: '익명',
  time: '12분 전',
  title: '기숙사 식단 이번 학기부터 바뀐 거 어때요?',
  body: '아침에 시리얼 코너 사라지고 토스트 추가됐는데, 점심은 그대로인 것 같음.\n\n오늘 점심 직접 가서 봤는데 메인은 진짜 그대로였어요. 사이드만 두 가지 늘었고, 음료대는 그대로.\n\n바뀐 거 직접 보신 분 후기 있으면 같이 공유해 주세요.',
  tags: ['기숙사', '식단', '학교생활'],
  up: 24, cmt: 18, scrap: 4,
};

const COMMENTS = [
  { id: 1, nick: '익명1', time: '8분 전', body: '저는 토스트 코너 좋더라고요. 잼 종류 늘려주면 좋겠음.', up: 4 },
  { id: 2, nick: '익명2', time: '6분 전', body: '근데 사이드 두 가지 늘었다는 거 사실인가요?', up: 1 },
  { id: 3, nick: '익명3', time: '3분 전', body: '식단표 학사정보 사이트에 올라와 있어요. 4월 4주차부터 적용이라고 합니다.', up: 8 },
];

export default function PostDetailV2() {
  const navigation = useNavigation<Nav>();
  useRoute<R$>(); // params used here would lookup post by id
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState(false);
  const [scrapped, setScrapped] = useState(false);
  const [shared, setShared] = useState(false);

  const onShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1200);
  };

  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title="자유게시판"
          trailing={<IconButton icon={<IcMore />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.body}>
        <View style={styles.head}>
          <Avatar name={POST.nick} size={28} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headNick}>{POST.nick}</Text>
            <Text style={styles.headTime}>{POST.time}</Text>
          </View>
          <Pill>{POST.board}</Pill>
        </View>
        <Text style={styles.title}>{POST.title}</Text>
        <Text style={styles.bodyText}>{POST.body}</Text>
        <View style={styles.tagRow}>
          {POST.tags.map((t) => (
            <Text key={t} style={styles.tag}>#{t}</Text>
          ))}
        </View>
      </View>

      <Hairline mx={SP[4]} />

      <View style={styles.actions}>
        <ActionBtn
          icon={<IcThumb size={18} color={liked ? C.inkNavy : C.textMeta} />}
          label={`추천 ${POST.up + (liked ? 1 : 0)}`}
          accent={liked}
          onPress={() => setLiked((v) => !v)}
        />
        <ActionBtn
          icon={<IcMsg size={18} color={C.textMeta} />}
          label={`댓글 ${POST.cmt}`}
          onPress={() => undefined}
        />
        <ActionBtn
          icon={<IcBookmark size={18} color={scrapped ? C.warn : C.textMeta} />}
          label={`스크랩 ${POST.scrap + (scrapped ? 1 : 0)}`}
          accent={scrapped}
          accentColor={C.warn}
          onPress={() => setScrapped((v) => !v)}
        />
        <ActionBtn
          icon={<IcShare size={18} color={C.textMeta} />}
          label={shared ? '복사됨' : '공유'}
          onPress={onShare}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.commentsHead}>
        <Text style={styles.commentsTitle}>댓글 {POST.cmt}</Text>
        <Pressable hitSlop={6}>
          <Text style={styles.sortText}>최신순</Text>
        </Pressable>
      </View>

      {COMMENTS.map((c) => (
        <View key={c.id} style={styles.commentRow}>
          <View style={styles.commentHead}>
            <Avatar name={c.nick} size={24} />
            <Text style={styles.commentNick}>{c.nick}</Text>
            <Text style={styles.commentTime}>{c.time}</Text>
          </View>
          <Text style={styles.commentBody}>{c.body}</Text>
          <View style={styles.commentFoot}>
            <Pressable hitSlop={6} style={styles.thumbRow}>
              <IcThumb size={12} color={C.hint} />
              <Text style={styles.thumbCount}>{c.up}</Text>
            </Pressable>
            <Pressable
              hitSlop={6}
              onPress={() => navigation.navigate('CommentThread', { commentId: c.id })}
            >
              <Text style={styles.replyLink}>답글</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.inputBar}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="댓글을 남겨보세요"
          placeholderTextColor={C.hint}
          style={styles.input}
        />
        <Pressable
          disabled={!draft.trim()}
          hitSlop={6}
          onPress={() => setDraft('')}
        >
          <Text style={[styles.submitBtn, !draft.trim() && { color: C.hint }]}>
            등록
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function ActionBtn({
  icon, label, accent = false, accentColor = C.inkNavy, onPress,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  accentColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
    >
      {icon}
      <Text style={[styles.actionLabel, accent && { color: accentColor, fontFamily: F.familyMedium }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: SP[4], paddingTop: SP[4], paddingBottom: SP[3] },
  head: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: SP[2] },
  headNick: { fontSize: F.size.base, fontFamily: F.familyMedium, color: C.text },
  headTime: { fontSize: F.size.xs, color: C.hint },
  title: {
    fontSize: F.size.h2,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.4,
    lineHeight: 24,
    marginBottom: SP[2],
  },
  bodyText: {
    fontSize: F.size.lg,
    color: C.textSub,
    lineHeight: 25,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: SP[3] },
  tag: { fontSize: F.size.sm, color: C.inkNavy },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SP[2],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SP[2],
    paddingVertical: SP[1],
  },
  actionLabel: { fontSize: F.size.sm, color: C.textMeta },

  divider: { height: 6, backgroundColor: '#F8F9FA' },

  commentsHead: {
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[2],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentsTitle: { fontSize: F.size.base, fontFamily: F.familySemiBold, color: C.text },
  sortText: { fontSize: F.size.xs, color: C.hint },

  commentRow: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: 4 },
  commentNick: { fontSize: F.size.sm, fontFamily: F.familyMedium, color: C.text },
  commentTime: { fontSize: F.size.xs, color: C.hint },
  commentBody: { paddingLeft: 32, fontSize: F.size.base, color: C.textSub, lineHeight: 21 },
  commentFoot: {
    paddingLeft: 32,
    marginTop: 6,
    flexDirection: 'row',
    gap: SP[3],
  },
  thumbRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  thumbCount: { fontSize: F.size.xs, color: C.hint },
  replyLink: { fontSize: F.size.xs, color: C.hint },

  inputBar: {
    marginTop: SP[2],
    paddingHorizontal: SP[3],
    paddingVertical: SP[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.white,
  },
  input: {
    flex: 1, height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.full,
    fontSize: F.size.base, color: C.text, fontFamily: F.family,
  },
  submitBtn: {
    fontSize: F.size.base,
    color: C.inkNavy,
    fontFamily: F.familySemiBold,
    paddingHorizontal: SP[2],
  },
});
