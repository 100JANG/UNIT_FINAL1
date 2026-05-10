import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Chip,
  Hairline,
  IconButton,
  Screen,
  IcSearch,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { RootStackParamList } from '../../types';
import { useCourses } from '../../hooks/useCourses';
import type { CourseSummary } from '../../types/course';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// TODO(profile-cycle): replace with /v1/users/me.schoolId once Profile is wired.
// Backend requires schoolId — without it, the response is an empty page.
const FALLBACK_SCHOOL_ID = 'ajou';

const FILTERS = ['아주대학교', '추천순'];

export default function CoursesV2() {
  const navigation = useNavigation<Nav>();
  const { status, courses, error, hasMore, isLoadingMore, loadMore, refetch } = useCourses({
    schoolId: FALLBACK_SCHOOL_ID,
  });

  return (
    <Screen
      appBar={
        <AppBar
          title="강의평"
          trailing={
            <IconButton
              icon={<IcSearch />}
              onPress={() => navigation.navigate('UnitV2', { screen: 'Search' })}
            />
          }
        />
      }
    >
      <Pressable
        onPress={() => navigation.navigate('UnitV2', { screen: 'Search' })}
        style={({ pressed }) => [styles.searchBox, pressed && { opacity: 0.85 }]}
      >
        <IcSearch size={18} color={C.hint} />
        <Text style={styles.searchText}>강의명, 교수명으로 검색</Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
          <Chip key={f}>{f}</Chip>
        ))}
      </ScrollView>
      <Hairline />

      {status === 'loading' || status === 'idle' ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : status === 'auth-required' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>로그인이 필요합니다</Text>
          <Text style={styles.stateBody}>
            개발 단계에서는 피드 상단의 DEV 패널에서 sessionToken을 입력해주세요.
          </Text>
        </View>
      ) : status === 'reserved' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>준비 중인 기능입니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? ''}</Text>
        </View>
      ) : status === 'business-rule' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>강의를 표시할 수 없습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
        </View>
      ) : status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>강의를 불러오지 못했습니다</Text>
          <Text style={styles.stateBody}>{error?.message ?? '잠시 후 다시 시도해주세요.'}</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : status === 'empty' ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>표시할 강의가 없어요</Text>
          <Text style={styles.stateBody}>학교 정보가 등록되면 강의가 표시됩니다.</Text>
        </View>
      ) : (
        <>
          {courses.map((c, i) => (
            <View key={c.courseId}>
              <CourseRow
                course={c}
                onPress={() =>
                  navigation.navigate('CourseDetail', { courseId: c.courseId })
                }
              />
              {i < courses.length - 1 && <Hairline mx={SP[4]} />}
            </View>
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
                <Text style={styles.loadMoreText}>강의 더보기</Text>
              )}
            </Pressable>
          )}
        </>
      )}
    </Screen>
  );
}

function CourseRow({
  course,
  onPress,
}: {
  course: CourseSummary;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={1}>{course.name}</Text>
        <Text style={styles.prof}>{course.professor}</Text>
      </View>
      <Text style={styles.meta}>{course.semester}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    marginHorizontal: SP[4],
    marginTop: SP[2],
    marginBottom: SP[3],
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  searchText: { fontSize: F.size.base, color: C.hint },
  filterRow: { paddingHorizontal: SP[4], paddingBottom: SP[2], gap: SP[2] },

  row: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: SP[2], marginBottom: 4 },
  name: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, letterSpacing: -0.3, flexShrink: 1 },
  prof: { fontSize: F.size.sm, color: C.textMeta },
  meta: { fontSize: F.size.xs, color: C.hint },

  center: {
    paddingHorizontal: SP[6],
    paddingVertical: SP[8],
    alignItems: 'center',
    gap: 6,
  },
  stateTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, textAlign: 'center' },
  stateBody: { fontSize: F.size.sm, color: C.textMeta, textAlign: 'center' },
  retryBtn: {
    marginTop: SP[3],
    paddingHorizontal: SP[4],
    paddingVertical: SP[2],
    backgroundColor: C.inkNavy,
    borderRadius: R.md,
  },
  retryText: { color: C.white, fontFamily: F.familySemiBold, fontSize: F.size.sm },

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
});
