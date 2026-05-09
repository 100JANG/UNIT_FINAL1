import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
import type { RootStackParamList } from '../../types';
import { usePostDetail } from '../../hooks/usePostDetail';
import type { PostDetail } from '../../types/post';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R$ = RouteProp<RootStackParamList, 'PostDetail'>;

// Mock comment thread used as a placeholder while Comments API is not yet
// connected. Backend GET /v1/posts/{postId} does not embed comments — they live
// at GET /v1/posts/{postId}/comments (next cycle). Toggle states below are
// local-only on purpose: like/scrap toggle endpoints are also out of scope.
const MOCK_COMMENTS = [
  { id: 1, nick: '익명1', time: '8분 전', body: '댓글 API 연결 전 임시 표시입니다.', up: 4 },
  { id: 2, nick: '익명2', time: '6분 전', body: 'Cycle 4에서 실제 댓글로 교체됩니다.', up: 1 },
];

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function PostDetailV2() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R$>();
  const { status, post, error, refetch } = usePostDetail(params.postId);

  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title={post?.boardName ?? post?.boardId ?? '게시글'}
          trailing={<IconButton icon={<IcMore />} onPress={() => undefined} />}
        />
      }
    >
      {status === 'loading' || status === 'idle' ? (
        <CenteredState>
          <ActivityIndicator />
        </CenteredState>
      ) : status === 'not-found' ? (
        <CenteredState>
          <Text style={styles.stateTitle}>삭제되었거나 존재하지 않는 글입니다</Text>
          <Text style={styles.stateBody}>
            {error?.message ?? '요청한 게시글을 찾을 수 없습니다.'}
          </Text>
          <PrimaryButton label="뒤로 가기" onPress={() => navigation.goBack()} />
        </CenteredState>
      ) : status === 'auth-required' ? (
        <CenteredState>
          <Text style={styles.stateTitle}>로그인이 필요합니다</Text>
          <Text style={styles.stateBody}>
            게시글을 보려면 인증이 필요합니다. 개발 단계에서는 피드 상단의 DEV 패널에서
            sessionToken을 입력해주세요.
          </Text>
          <PrimaryButton label="뒤로 가기" onPress={() => navigation.goBack()} />
        </CenteredState>
      ) : status === 'forbidden' ? (
        <CenteredState>
          <Text style={styles.stateTitle}>접근할 수 없는 게시글입니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '권한이 없습니다.'}</Text>
          <PrimaryButton label="뒤로 가기" onPress={() => navigation.goBack()} />
        </CenteredState>
      ) : status === 'reserved' ? (
        <CenteredState>
          <Text style={styles.stateTitle}>준비 중인 기능입니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '곧 제공될 예정입니다.'}</Text>
        </CenteredState>
      ) : status === 'error' ? (
        <CenteredState>
          <Text style={styles.stateTitle}>게시글을 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
          <PrimaryButton label="다시 시도" onPress={refetch} />
        </CenteredState>
      ) : post ? (
        <PostBody post={post} navigation={navigation} />
      ) : null}
    </Screen>
  );
}

function PostBody({ post, navigation }: { post: PostDetail; navigation: Nav }) {
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState(post.myActions?.liked ?? false);
  const [scrapped, setScrapped] = useState(post.myActions?.scrapped ?? false);
  const [shared, setShared] = useState(false);

  const onShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 1200);
  };

  return (
    <>
      <View style={styles.body}>
        <View style={styles.head}>
          <Avatar name={post.author.anonymousId} size={28} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headNick}>{post.author.anonymousId}</Text>
            <Text style={styles.headTime}>{formatRelative(post.createdAt)}</Text>
          </View>
          <Pill>{post.boardName ?? post.boardId}</Pill>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.bodyText}>{post.content}</Text>
        {post.tags.length > 0 && (
          <View style={styles.tagRow}>
            {post.tags.map(t => (
              <Text key={t} style={styles.tag}>#{t}</Text>
            ))}
          </View>
        )}
      </View>

      <Hairline mx={SP[4]} />

      <View style={styles.actions}>
        <ActionBtn
          icon={<IcThumb size={18} color={liked ? C.inkNavy : C.textMeta} />}
          label={`추천 ${post.stats.likes + (liked ? 1 : 0)}`}
          accent={liked}
          onPress={() => setLiked(v => !v)}
        />
        <ActionBtn
          icon={<IcMsg size={18} color={C.textMeta} />}
          label={`댓글 ${post.stats.comments}`}
          onPress={() => undefined}
        />
        <ActionBtn
          icon={<IcBookmark size={18} color={scrapped ? C.warn : C.textMeta} />}
          label={`스크랩 ${post.stats.scraps + (scrapped ? 1 : 0)}`}
          accent={scrapped}
          accentColor={C.warn}
          onPress={() => setScrapped(v => !v)}
        />
        <ActionBtn
          icon={<IcShare size={18} color={C.textMeta} />}
          label={shared ? '복사됨' : '공유'}
          onPress={onShare}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.commentsHead}>
        <Text style={styles.commentsTitle}>댓글 {post.stats.comments}</Text>
        <Pressable hitSlop={6}>
          <Text style={styles.sortText}>최신순</Text>
        </Pressable>
      </View>

      {/* Mock placeholder until Comments API is connected next cycle. */}
      {MOCK_COMMENTS.map(c => (
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
              onPress={() => navigation.navigate('UnitV2', { screen: 'CommentThread', params: { commentId: c.id } })}
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
        <Pressable disabled={!draft.trim()} hitSlop={6} onPress={() => setDraft('')}>
          <Text style={[styles.submitBtn, !draft.trim() && { color: C.hint }]}>등록</Text>
        </Pressable>
      </View>
    </>
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

function CenteredState({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryBtn}>
      <Text style={styles.primaryBtnText}>{label}</Text>
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

  center: {
    paddingHorizontal: SP[6],
    paddingVertical: SP[8],
    alignItems: 'center',
    gap: 8,
  },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  primaryBtn: {
    marginTop: SP[3],
    paddingHorizontal: SP[4],
    paddingVertical: SP[2],
    backgroundColor: C.inkNavy,
    borderRadius: R.md,
  },
  primaryBtnText: { color: C.white, fontFamily: F.familySemiBold, fontSize: F.size.sm },
});
