import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  Tabs,
  IcBack,
  IcBookmark,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useCourseDetail } from '../../hooks/useCourseDetail';
import type { CourseDetailUi } from '../../types/course';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R$ = RouteProp<RootStackParamList, 'CourseDetail'>;

// Reviews list is still mock — Course Review write/read endpoints are connected
// in a later cycle. This screen owns only the course-detail aggregate (recommend
// / notRecommend / skip / total / recommendRate).
const REVIEWS_PLACEHOLDER = [
  { vote: 'rec' as const, body: '강의평 API 연결 전 임시 표시입니다.', nick: '익명1', sem: '24-2', up: 0 },
];

export default function CourseDetailV2() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R$>();
  const { status, course, error, refetch } = useCourseDetail(params.courseId);

  // REVIEW_QUOTA_REQUIRED: per contract, route to the review screen instead of
  // showing an error toast. We `replace` so back-press skips this screen.
  useEffect(() => {
    if (status === 'review-required') {
      navigation.replace('CourseReview', { courseId: params.courseId });
    }
  }, [status, navigation, params.courseId]);

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          title={course?.name ?? '강의 상세'}
        />
      }
    >
      {status === 'loading' || status === 'idle' || status === 'review-required' ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : status === 'not-found' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>강의를 찾을 수 없습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '삭제되었거나 존재하지 않는 강의입니다.'}</Text>
          <PrimaryButton label="뒤로 가기" onPress={() => navigation.goBack()} />
        </View>
      ) : status === 'auth-required' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>로그인이 필요합니다</Text>
          <Text style={styles.stateBody}>피드 상단의 DEV 패널에서 sessionToken을 입력해주세요.</Text>
          <PrimaryButton label="뒤로 가기" onPress={() => navigation.goBack()} />
        </View>
      ) : status === 'forbidden' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>접근할 수 없습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
        </View>
      ) : status === 'reserved' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>준비 중인 기능입니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
        </View>
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>강의 정보를 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
          <PrimaryButton label="다시 시도" onPress={refetch} />
        </View>
      ) : course ? (
        <CourseDetailBody course={course} navigation={navigation} courseId={params.courseId} />
      ) : null}
    </Screen>
  );
}

function CourseDetailBody({
  course,
  navigation,
  courseId,
}: {
  course: CourseDetailUi;
  navigation: Nav;
  courseId: string;
}) {
  const [tab, setTab] = useState<'rec' | 'no' | 'all'>('rec');
  const [scrap, setScrap] = useState(false);

  return (
    <>
      <View style={styles.scrapWrap}>
        <Pressable
          hitSlop={6}
          onPress={() => setScrap(v => !v)}
          style={({ pressed }) => [styles.scrapBtn, pressed && { opacity: 0.7 }]}
        >
          <IcBookmark size={22} color={scrap ? C.warn : C.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.name}>{course.name}</Text>
        <Text style={styles.meta}>{course.professor} · {course.semester}</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.recRow}>
          <Text style={styles.recBig}>{course.stats.recommendPct}%</Text>
          <Text style={styles.recLabel}>추천</Text>
          <Text style={styles.recCount}>응답 {course.stats.total}명</Text>
        </View>
        <View style={styles.distRow}>
          <View style={[styles.distFill, { flex: course.stats.recommendPct, backgroundColor: C.inkNavy }]} />
          <View style={[styles.distFill, { flex: Math.max(0, 100 - course.stats.recommendPct), backgroundColor: C.divider2 }]} />
        </View>
        <View style={styles.breakdown}>
          <Text style={styles.breakdownText}>👍 추천 {course.stats.recommend}</Text>
          <Text style={styles.breakdownText}>👎 비추 {course.stats.notRecommend}</Text>
          <Text style={styles.breakdownText}>⏭ Skip {course.stats.skip}</Text>
        </View>
      </View>

      <Tabs
        items={[
          { id: 'rec', label: `추천 ${course.stats.recommend}` },
          { id: 'no',  label: `비추천 ${course.stats.notRecommend}` },
          { id: 'all', label: '의견' },
        ]}
        active={tab}
        onChange={(id) => setTab(id as 'rec' | 'no' | 'all')}
      />

      {/* Reviews list is still placeholder — connected in a later cycle. */}
      {REVIEWS_PLACEHOLDER.map((r, i) => (
        <View key={i}>
          <View style={styles.reviewRow}>
            <View style={styles.reviewHead}>
              <Pill tone={r.vote === 'rec' ? 'mist' : 'coral'}>
                {r.vote === 'rec' ? '추천' : '비추천'}
              </Pill>
              <Text style={styles.reviewMeta}>{r.sem}학기 · {r.nick}</Text>
            </View>
            <Text style={styles.reviewBody}>{r.body}</Text>
          </View>
          {i < REVIEWS_PLACEHOLDER.length - 1 && <Hairline mx={SP[4]} />}
        </View>
      ))}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => navigation.navigate('CourseReview', { courseId })}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.ctaText}>평가하기</Text>
        </Pressable>
      </View>
    </>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryBtn}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrapWrap: { alignItems: 'flex-end', paddingHorizontal: SP[2] },
  scrapBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  hero: { paddingHorizontal: SP[4], paddingTop: SP[2], paddingBottom: SP[3] },
  name: { fontSize: F.size.h2, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.4 },
  meta: { marginTop: 4, fontSize: F.size.base, color: C.textMeta },

  statCard: {
    marginHorizontal: SP[4],
    marginBottom: SP[2],
    padding: SP[4],
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: R.lg,
  },
  recRow: { flexDirection: 'row', alignItems: 'baseline', gap: SP[2], marginBottom: SP[3] },
  recBig: { fontSize: F.size.hero, fontFamily: F.familyBold, color: C.inkNavy, letterSpacing: -0.5 },
  recLabel: { fontSize: F.size.base, color: C.textMeta },
  recCount: { marginLeft: 'auto', fontSize: F.size.sm, color: C.hint },
  distRow: { height: 6, borderRadius: R.full, overflow: 'hidden', flexDirection: 'row' },
  distFill: { height: '100%' },
  breakdown: {
    marginTop: SP[3],
    paddingTop: SP[3],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownText: { fontSize: F.size.sm, color: C.textSub },

  reviewRow: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: SP[2], marginBottom: 6 },
  reviewMeta: { fontSize: F.size.xs, color: C.hint },
  reviewBody: { fontSize: F.size.base, color: C.textSub, lineHeight: 22 },

  bottomBar: {
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[5],
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  cta: {
    height: 48,
    borderRadius: R.lg,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, color: C.white, fontFamily: F.familySemiBold },

  center: {
    paddingHorizontal: SP[6],
    paddingVertical: SP[8],
    alignItems: 'center',
    gap: 6,
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
