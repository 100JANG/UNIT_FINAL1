import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Chip,
  Hairline,
  IconButton,
  Screen,
  IcBack,
  IcSearch,
  IcX,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const RECENT_INIT = ['수강신청', '기숙사', 'A0', '셔틀', '데이터분석개론'];

const POPULAR = [
  { word: '수강신청', dir: 'up'   as const, change: 5 },
  { word: '기숙사 식단', dir: 'up' as const, change: 2 },
  { word: '중간고사', dir: 'new' as const, change: 0 },
  { word: '셔틀', dir: 'down' as const, change: 1 },
  { word: '계절학기', dir: 'up'  as const, change: 8 },
  { word: '도서관', dir: 'flat' as const, change: 0 },
  { word: '동아리 모집', dir: 'new' as const, change: 0 },
  { word: '강의평', dir: 'up'  as const, change: 3 },
  { word: '자취방', dir: 'down' as const, change: 2 },
  { word: '팀플', dir: 'up'  as const, change: 1 },
];

const FILTERS = [
  { id: 'all',    l: '전체' },
  { id: 'post',   l: '게시글' },
  { id: 'course', l: '강의' },
  { id: 'market', l: '장터' },
  { id: 'user',   l: '사용자' },
];

export default function SearchV2() {
  const navigation = useNavigation();
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState(RECENT_INIT);
  const [filter, setFilter] = useState('all');

  const showResults = q.trim().length > 0;

  const onSelect = (w: string) => {
    setQ(w);
    setRecent((prev) => [w, ...prev.filter((x) => x !== w)].slice(0, 8));
  };

  const dirColor = (d: string) =>
    d === 'up' ? C.trust : d === 'down' ? C.danger : d === 'new' ? C.inkNavy : C.hint;

  const dirGlyph = (d: string) =>
    d === 'up' ? '▲' : d === 'down' ? '▼' : d === 'new' ? 'NEW' : '–';

  return (
    <Screen
      appBar={
        <View style={styles.appBar}>
          <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
          <View style={styles.searchBox}>
            <IcSearch size={18} color={C.hint} />
            <TextInput
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder="통합 검색"
              placeholderTextColor={C.hint}
              style={styles.searchInput}
            />
            {q.length > 0 && (
              <Pressable onPress={() => setQ('')} hitSlop={8}>
                <IcX size={16} color={C.hint} />
              </Pressable>
            )}
          </View>
        </View>
      }
    >
      {!showResults ? (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionLabel}>최근 검색어</Text>
              {recent.length > 0 && (
                <Pressable onPress={() => setRecent([])}>
                  <Text style={styles.clearAll}>전체 삭제</Text>
                </Pressable>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {recent.map((w) => (
                <Pressable
                  key={w}
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
                  onPress={() => onSelect(w)}
                >
                  <Text style={styles.chipText}>{w}</Text>
                  <Pressable
                    hitSlop={6}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setRecent((prev) => prev.filter((x) => x !== w));
                    }}
                  >
                    <IcX size={11} color={C.hint} />
                  </Pressable>
                </Pressable>
              ))}
              {recent.length === 0 && (
                <Text style={styles.empty}>최근 검색어가 없어요</Text>
              )}
            </ScrollView>
          </View>

          <Hairline mx={SP[4]} />

          <Text style={styles.sectionLabel2}>인기 검색어</Text>
          {POPULAR.map((p, i) => {
            const top3 = i < 3;
            return (
              <Pressable
                key={p.word}
                style={({ pressed }) => [styles.popularRow, pressed && styles.rowPressed]}
                onPress={() => onSelect(p.word)}
              >
                <Text style={[styles.popularRank, top3 ? styles.rankTop : styles.rankNorm]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.popularWord}>{p.word}</Text>
                <Text style={[styles.popularDir, { color: dirColor(p.dir) }]}>
                  {dirGlyph(p.dir)}{p.change > 0 ? p.change : ''}
                </Text>
                <IcChev size={14} color={C.hint} />
              </Pressable>
            );
          })}
        </>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <Chip
                key={f.id}
                active={filter === f.id}
                onPress={() => setFilter(f.id)}
              >
                {f.l}
              </Chip>
            ))}
          </ScrollView>

          <ResultGroup
            title="게시글"
            count={2}
            samples={[
              { tag: '학사', body: `"${q}" 관련 정보 정리해드려요` },
              { tag: '자유', body: `${q} 신청 시 주의사항` },
            ]}
            keyword={q}
          />
          <ResultGroup
            title="강의"
            count={1}
            samples={[{ tag: '강의', body: `${q} 관련 강의 - 교양` }]}
            keyword={q}
          />
        </>
      )}
    </Screen>
  );
}

function ResultGroup({
  title,
  count,
  samples,
  keyword,
}: {
  title: string;
  count: number;
  samples: { tag: string; body: string }[];
  keyword: string;
}) {
  return (
    <View>
      <View style={styles.groupHead}>
        <Text style={styles.groupTitle}>
          {title} {count}건
        </Text>
        {count > samples.length && (
          <Pressable>
            <Text style={styles.moreLink}>더보기</Text>
          </Pressable>
        )}
      </View>
      {samples.map((s, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [styles.resultRow, pressed && styles.rowPressed]}
        >
          <Text style={styles.resultTag}>{s.tag}</Text>
          <Text style={styles.resultBody} numberOfLines={1}>
            {highlightKeyword(s.body, keyword)}
          </Text>
        </Pressable>
      ))}
      <Hairline mx={SP[4]} />
    </View>
  );
}

function highlightKeyword(text: string, kw: string): React.ReactNode {
  if (!kw) return text;
  const i = text.indexOf(kw);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <Text style={styles.kwHighlight}>{text.slice(i, i + kw.length)}</Text>
      {text.slice(i + kw.length)}
    </>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: 44,
    paddingHorizontal: SP[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    backgroundColor: C.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider2,
  },
  searchBox: {
    flex: 1,
    height: 40,
    paddingHorizontal: SP[3],
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  searchInput: {
    flex: 1,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
    padding: 0,
  },

  section: { paddingTop: SP[4] },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SP[4],
    marginBottom: SP[2],
  },
  sectionLabel: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    letterSpacing: F.ls.wide,
  },
  sectionLabel2: {
    paddingHorizontal: SP[4],
    paddingTop: SP[5],
    paddingBottom: SP[2],
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    letterSpacing: F.ls.wide,
  },
  clearAll: { fontSize: F.size.sm, color: C.hint },
  chipsRow: { paddingHorizontal: SP[4], gap: SP[2] },
  chip: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.full,
    backgroundColor: C.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[1],
  },
  chipText: { fontSize: F.size.sm, color: C.textSub },
  empty: {
    fontSize: F.size.sm,
    color: C.hint,
    paddingVertical: SP[2],
  },

  popularRow: {
    height: 48,
    paddingHorizontal: SP[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
    backgroundColor: C.white,
  },
  rowPressed: { backgroundColor: C.surface },
  popularRank: {
    width: 28,
    fontSize: 19,
    textAlign: 'center',
  },
  rankTop: { color: C.inkNavy, fontFamily: F.familySemiBold },
  rankNorm: { color: C.hint, fontFamily: F.family },
  popularWord: { flex: 1, fontSize: F.size.md, color: C.text },
  popularDir: { fontSize: F.size.xs, fontFamily: F.familyMedium },

  filterRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    gap: SP[2],
  },

  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SP[4],
    paddingTop: SP[4],
    paddingBottom: SP[2],
  },
  groupTitle: {
    fontSize: F.size.base,
    fontFamily: F.familySemiBold,
    color: C.text,
  },
  moreLink: { fontSize: F.size.sm, color: C.inkNavy },
  resultRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    gap: SP[2],
  },
  resultTag: {
    fontSize: F.size.xs,
    color: C.textMeta,
    fontFamily: F.familyMedium,
    minWidth: 32,
  },
  resultBody: { flex: 1, fontSize: F.size.sm, color: C.textSub },
  kwHighlight: {
    color: C.inkNavy,
    fontFamily: F.familySemiBold,
  },
});
