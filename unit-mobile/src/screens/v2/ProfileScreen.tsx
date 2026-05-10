import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  ListRow,
  MannerBadge,
  Screen,
  Switch,
  IcMore,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';
import type { UnitV2ParamList } from '../../types/unit-v2';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMyProfile } from '../../hooks/useMyProfile';

type Nav = NativeStackNavigationProp<UnitV2ParamList>;

export default function ProfileV2() {
  const navigation = useNavigation<Nav>();
  const [findable, setFindable] = useState(true);
  const [scope, setScope] = useState<'dept' | 'friends' | 'all'>('dept');
  const { status, profile, stats, error } = useMyProfile();

  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          title="나"
          trailing={<IconButton icon={<IcMore />} onPress={() => undefined} />}
        />
      }
    >
      <View style={styles.hero}>
        {status === 'loading' || status === 'idle' ? (
          <ActivityIndicator />
        ) : status === 'auth-required' ? (
          <View>
            <Text style={styles.heroErrorTitle}>로그인이 필요합니다</Text>
            <Text style={styles.heroErrorBody}>
              피드 상단의 DEV 패널에서 sessionToken을 입력해주세요.
            </Text>
          </View>
        ) : status === 'error' ? (
          <View>
            <Text style={styles.heroErrorTitle}>프로필을 불러오지 못했습니다</Text>
            <Text style={styles.heroErrorBody}>{error?.message ?? ''}</Text>
          </View>
        ) : profile ? (
          <>
            <View style={styles.heroRow}>
              <Avatar name={profile.name} size={56} />
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{profile.name}</Text>
                  {/* MannerBadge stays as a placeholder — backend grade not in /me yet. */}
                  <MannerBadge grade="A0" size="sm" />
                </View>
                <Text style={styles.deptText}>
                  {[
                    profile.schoolLabel ?? profile.schoolId ?? '학교 미등록',
                    profile.departmentLabel ?? profile.departmentId ?? '학과 미등록',
                    profile.studentNumberMasked ?? '학번 미등록',
                  ].join(' · ')}
                </Text>
                {profile.isStudentVerificationReserved && (
                  <Text style={styles.reservedNote}>학생 인증 준비 중</Text>
                )}
              </View>
            </View>

            <View style={styles.stats}>
              {[
                { l: '작성', v: stats?.posts ?? 0 },
                { l: '댓글', v: stats?.comments ?? 0 },
                { l: '받은 추천', v: stats?.likesReceived ?? 0 },
              ].map((s, i) => (
                <View key={i} style={styles.statCol}>
                  <Text style={styles.statValue}>{String(s.v)}</Text>
                  <Text style={styles.statLabel}>{s.l}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>

      <Pressable
        onPress={() => navigation.navigate('MannerGrade')}
        style={({ pressed }) => [styles.mannerCard, pressed && { backgroundColor: C.surface }]}
      >
        <View style={styles.mannerHead}>
          <Text style={styles.mannerLabel}>매너 학점</Text>
          <Text style={styles.mannerLabel}>82 / 100</Text>
        </View>
        <View style={styles.mannerRow}>
          <MannerBadge grade="A0" size="md" />
          <View style={{ flex: 1, marginLeft: SP[3] }}>
            <Text style={styles.mannerCaption}>우수 · 다음 등급 +13점</Text>
            <View style={styles.mannerBar}>
              <View style={[styles.mannerFill, { width: '68%' }]} />
            </View>
          </View>
          <IcChev size={16} color={C.hint} />
        </View>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.toggleSection}>
          <View style={styles.toggleHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>친구 검색 허용</Text>
              <Text style={styles.toggleSub}>
                학번·이름으로 다른 학생이 나를 찾을 수 있어요
              </Text>
            </View>
            <Switch value={findable} onChange={setFindable} />
          </View>
          {findable && (
            <View style={styles.scopeBox}>
              <Text style={styles.scopeLabel}>공개 범위</Text>
              {[
                { id: 'dept',    l: '같은 학과만',   sub: '소프트웨어학과 22 학생에게만 노출' },
                { id: 'friends', l: '친구의 친구만', sub: '내 친구와 1촌인 학생까지 노출' },
                { id: 'all',     l: '전체 공개',     sub: '같은 학교의 모든 학생에게 노출' },
              ].map((o) => {
                const on = scope === o.id;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => setScope(o.id as 'dept' | 'friends' | 'all')}
                    style={[
                      styles.scopeRow,
                      on && { borderColor: C.inkNavy, backgroundColor: '#F4F4FB' },
                    ]}
                  >
                    <View style={[styles.radio, on && { borderColor: C.inkNavy }]}>
                      {on && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scopeOptLabel}>{o.l}</Text>
                      <Text style={styles.scopeOptSub}>{o.sub}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        <Hairline />
        <ListRow label="알림 수신" value="전체" />
      </View>

      <View style={styles.card}>
        <ListRow label="내 활동" value="내가 쓴 글, 댓글" trailing="chev" onPress={() => navigation.navigate('MyPosts')} />
        <Hairline />
        <ListRow label="스크랩" value="47개" trailing="chev" onPress={() => navigation.navigate('Scraps')} />
        <Hairline />
        <ListRow label="내가 쓴 강의평" value="6개" trailing="chev" />
        <Hairline />
        <ListRow label="배심원 기록" value="참여 9건" trailing="chev" onPress={() => navigation.navigate('Jury')} />
      </View>

      <View style={styles.card}>
        <ListRow label="설정" trailing="chev" onPress={() => navigation.navigate('Settings')} />
        <Hairline />
        <ListRow label="로그아웃" />
      </View>

      <Text style={styles.footer}>UNIT v0.4.2 · 2026</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[5],
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: SP[3] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SP[1] },
  name: {
    fontSize: F.size.h3,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.3,
  },
  deptText: { marginTop: 2, fontSize: F.size.sm, color: C.textMeta },
  reservedNote: { marginTop: 2, fontSize: F.size.xs, color: C.hint },
  editLink: { fontSize: F.size.sm, color: C.inkNavy, paddingHorizontal: SP[2], paddingVertical: SP[1] },
  heroErrorTitle: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text, marginBottom: 4 },
  heroErrorBody: { fontSize: F.size.sm, color: C.textMeta },

  stats: { marginTop: SP[5], paddingTop: SP[4], flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.divider },
  statCol: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: F.size.xl, fontFamily: F.familySemiBold, color: C.text },
  statLabel: { marginTop: 2, fontSize: F.size.xs, color: C.hint },

  mannerCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    padding: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
  },
  mannerHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SP[2] },
  mannerLabel: { fontSize: F.size.xs, color: C.hint },
  mannerRow: { flexDirection: 'row', alignItems: 'center' },
  mannerCaption: { fontSize: F.size.sm, color: C.textSub },
  mannerBar: { marginTop: SP[1], height: 6, borderRadius: R.full, backgroundColor: C.surface2, overflow: 'hidden' },
  mannerFill: { height: '100%', backgroundColor: C.cobalt },

  card: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },

  toggleSection: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  toggleHead: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { fontSize: F.size.md, fontFamily: F.familyMedium, color: C.text },
  toggleSub: { marginTop: 2, fontSize: F.size.xs, color: C.textMeta },

  scopeBox: {
    marginTop: SP[3],
    paddingTop: SP[3],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    gap: SP[2],
  },
  scopeLabel: { fontSize: F.size.xs, color: C.hint, marginBottom: SP[1] },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SP[2],
    padding: SP[3],
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.divider2,
    backgroundColor: C.white,
  },
  radio: {
    marginTop: 2,
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: C.hint,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.inkNavy },
  scopeOptLabel: { fontSize: F.size.base, fontFamily: F.familyMedium, color: C.text },
  scopeOptSub: { marginTop: 2, fontSize: F.size.xs, color: C.textMeta },

  footer: {
    paddingVertical: SP[6],
    fontSize: F.size.xs,
    color: C.hint,
    textAlign: 'center',
  },
});
