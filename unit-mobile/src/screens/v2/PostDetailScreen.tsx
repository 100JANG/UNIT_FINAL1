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
import { usePostComments } from '../../hooks/usePostComments';
import { usePostActions } from '../../hooks/usePostActions';
import type { CommentItem, PostDetail } from '../../types/post';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R$ = RouteProp<RootStackParamList, 'PostDetail'>;

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
        <PostBody post={post} />
      ) : null}
    </Screen>
  );
}

function PostBody({ post }: { post: PostDetail }) {
  const [draft, setDraft] = useState('');
  const [shared, setShared] = useState(false);

  // myActions is currently absent from GET /v1/posts/{postId}; we pass it in
  // case a future contract upgrade adds it. Until then both default to false.
  const actions = usePostActions({
    postId: post.postId,
    initialLikeCount: post.stats.likes,
    initialScrapCount: post.stats.scraps,
    initialLiked: post.myActions?.liked,
    initialScrapped: post.myActions?.scrapped,
  });

  const actionError = actions.likeError ?? actions.scrapError;

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
          icon={<IcThumb size={18} color={actions.liked ? C.inkNavy : C.textMeta} />}
          label={`추천 ${actions.likeCount}`}
          accent={actions.liked}
          pending={actions.isLikePending}
          onPress={actions.toggleLike}
        />
        <ActionBtn
          icon={<IcMsg size={18} color={C.textMeta} />}
          label={`댓글 ${post.stats.comments}`}
          onPress={() => undefined}
        />
        <ActionBtn
          icon={<IcBookmark size={18} color={actions.scrapped ? C.warn : C.textMeta} />}
          label={`스크랩 ${actions.scrapCount}`}
          accent={actions.scrapped}
          accentColor={C.warn}
          pending={actions.isScrapPending}
          onPress={actions.toggleScrap}
        />
        <ActionBtn
          icon={<IcShare size={18} color={C.textMeta} />}
          label={shared ? '복사됨' : '공유'}
          onPress={onShare}
        />
      </View>

      {actionError && (
        <Text style={styles.actionError}>{actionError.message}</Text>
      )}

      <View style={styles.divider} />

      <View style={styles.commentsHead}>
        <Text style={styles.commentsTitle}>댓글 {post.stats.comments}</Text>
        <Pressable hitSlop={6}>
          <Text style={styles.sortText}>최신순</Text>
        </Pressable>
      </View>

      <CommentsSection postId={post.postId} />

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

function CommentsSection({ postId }: { postId: string }) {
  const { status, comments, error, hasMore, isLoadingMore, loadMore, refetch } =
    usePostComments({ postId });

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.commentsState}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'auth-required') {
    return (
      <View style={styles.commentsState}>
        <Text style={styles.commentsStateTitle}>댓글을 보려면 로그인이 필요합니다</Text>
        <Text style={styles.commentsStateBody}>
          개발 단계에서는 피드 상단의 DEV 패널에서 sessionToken을 입력해주세요.
        </Text>
      </View>
    );
  }

  if (status === 'reserved') {
    return (
      <View style={styles.commentsState}>
        <Text style={styles.commentsStateTitle}>준비 중인 기능입니다</Text>
        <Text style={styles.commentsStateBody}>{error?.message ?? '곧 제공될 예정입니다.'}</Text>
      </View>
    );
  }

  if (status === 'not-found') {
    return (
      <View style={styles.commentsState}>
        <Text style={styles.commentsStateTitle}>댓글을 불러올 수 없습니다</Text>
        <Text style={styles.commentsStateBody}>{error?.message ?? '글이 삭제되었을 수 있습니다.'}</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.commentsState}>
        <Text style={styles.commentsStateTitle}>댓글을 불러오지 못했습니다</Text>
        <Text style={styles.commentsStateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
        <Pressable onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>댓글 다시 불러오기</Text>
        </Pressable>
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.commentsState}>
        <Text style={styles.commentsStateBody}>아직 댓글이 없어요</Text>
      </View>
    );
  }

  return (
    <>
      {comments.map(c => (
        <CommentRow key={c.id} comment={c} />
      ))}
      {hasMore && (
        <Pressable
          onPress={loadMore}
          disabled={isLoadingMore}
          style={({ pressed }) => [
            styles.loadMoreBtn,
            (pressed || isLoadingMore) && { opacity: 0.6 },
          ]}
        >
          {isLoadingMore ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.loadMoreText}>댓글 더보기</Text>
          )}
        </Pressable>
      )}
    </>
  );
}

function CommentRow({ comment }: { comment: CommentItem }) {
  const isReply = comment.parentCommentId !== null;
  return (
    <View style={[styles.commentRow, isReply && styles.commentRowReply]}>
      <View style={styles.commentHead}>
        <Avatar name={comment.anonymousId} size={24} />
        <Text style={styles.commentNick}>{comment.anonymousId}</Text>
        <Text style={styles.commentTime}>{formatRelative(comment.createdAt)}</Text>
      </View>
      <Text style={[styles.commentBody, comment.deleted && styles.commentBodyDeleted]}>
        {comment.content}
      </Text>
      {!comment.deleted && (
        <View style={styles.commentFoot}>
          <View style={styles.thumbRow}>
            <IcThumb size={12} color={C.hint} />
            <Text style={styles.thumbCount}>{comment.likeCount}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function ActionBtn({
  icon, label, accent = false, accentColor = C.inkNavy, pending = false, onPress,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  accentColor?: string;
  pending?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={pending}
      hitSlop={6}
      style={({ pressed }) => [
        styles.actionBtn,
        pending && { opacity: 0.5 },
        pressed && !pending && { opacity: 0.7 },
      ]}
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
  actionError: {
    fontSize: F.size.xs,
    color: C.warn,
    paddingHorizontal: SP[4],
    paddingBottom: SP[2],
    textAlign: 'center',
  },

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
  commentRowReply: { paddingLeft: SP[4] + 24, backgroundColor: C.surface2 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: 4 },
  commentNick: { fontSize: F.size.sm, fontFamily: F.familyMedium, color: C.text },
  commentTime: { fontSize: F.size.xs, color: C.hint },
  commentBody: { paddingLeft: 32, fontSize: F.size.base, color: C.textSub, lineHeight: 21 },
  commentBodyDeleted: { color: C.hint, fontStyle: 'italic' },
  commentFoot: {
    paddingLeft: 32,
    marginTop: 6,
    flexDirection: 'row',
    gap: SP[3],
  },
  thumbRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  thumbCount: { fontSize: F.size.xs, color: C.hint },
  replyLink: { fontSize: F.size.xs, color: C.hint },

  commentsState: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[5],
    alignItems: 'center',
    gap: 6,
  },
  commentsStateTitle: { fontSize: F.size.base, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  commentsStateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: {
    marginTop: SP[2],
    paddingHorizontal: SP[3],
    paddingVertical: SP[2],
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.divider2,
  },
  retryText: { color: C.text, fontSize: F.size.sm, fontFamily: F.familyMedium },
  loadMoreBtn: {
    marginHorizontal: SP[4],
    marginVertical: SP[3],
    paddingVertical: SP[2],
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.divider2,
  },
  loadMoreText: { color: C.text, fontSize: F.size.sm, fontFamily: F.familyMedium },

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
