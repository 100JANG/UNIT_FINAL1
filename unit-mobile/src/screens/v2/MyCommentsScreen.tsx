import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Pill,
  Screen,
  IcBack,
} from '../../components/ui';
import { C, F, SP } from '../../theme/tokens';

const COMMENTS = [
  { board: '자유',  parent: '기숙사 식단 이번 학기부터 바뀐 거 어때요?', body: '저는 토스트 코너 좋더라고요. 잼 종류 늘려주면 좋겠음.', time: '8분 전', up: 4 },
  { board: '학사',  parent: '수강신청 서버 또 터질까요',                  body: '작년에 30분 정도 멈췄던 기억. 12시 전후로 한 번 더 새로고침 해보세요.', time: '32분 전', up: 12 },
  { board: '시험',  parent: '중간고사 기간 도서관 자리 어디가 제일 낫나요', body: '공대 별관 의외로 한산해요. 4층 아무도 없을 때 많아요.', time: '1시간 전', up: 8 },
  { board: '자취',  parent: '자취방 계약할 때 조심할 점 공유합니다',        body: '관리비 항목 진짜 중요해요. 제 옆방은 나중에 30만원 청구받음.', time: '2시간 전', up: 23 },
];

export default function MyCommentsV2() {
  const navigation = useNavigation();
  return (
    <Screen
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>내가 쓴 댓글</Text>
              <Pill tone="mist">{COMMENTS.length}</Pill>
            </View>
          }
        />
      }
    >
      {COMMENTS.map((c, i) => (
        <View key={i}>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <View style={styles.context}>
              <Pill>{c.board}</Pill>
              <Text style={styles.parent} numberOfLines={1}>
                ↳ {c.parent}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.bodyText} numberOfLines={3}>
                "{c.body}"
              </Text>
              <View style={styles.foot}>
                <Text style={styles.time}>{c.time}</Text>
                <Text style={[styles.up, { color: C.inkNavy }]}>
                  추천 {c.up}
                </Text>
              </View>
            </View>
          </Pressable>
          {i < COMMENTS.length - 1 && <Hairline />}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  title: {
    fontSize: F.size.lg,
    fontFamily: F.familySemiBold,
    color: C.text,
    marginLeft: SP[1],
  },
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[1],
    backgroundColor: '#F8F9FA',
  },
  parent: { flex: 1, fontSize: F.size.sm, color: C.textMeta },
  body: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    backgroundColor: C.white,
  },
  pressed: { opacity: 0.85 },
  bodyText: {
    fontSize: F.size.md,
    color: C.textSub,
    lineHeight: 22,
    fontFamily: F.family,
  },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SP[2],
  },
  time: { fontSize: F.size.xs, color: C.hint },
  up: {
    fontSize: F.size.sm,
    fontFamily: F.familySemiBold,
  },
});
