import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  IconButton,
  ListRow,
  Screen,
  Switch,
  IcBack,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const ACTIVITY = [
  { id: 'cmt', l: '댓글', sub: '내 글에 새 댓글이 달릴 때' },
  { id: 'rep', l: '답글', sub: '내 댓글에 답글이 달릴 때' },
  { id: 'rec', l: '추천', sub: '내 글·댓글이 추천받을 때' },
  { id: 'scr', l: '스크랩', sub: '내 글이 스크랩될 때' },
  { id: 'men', l: '멘션', sub: '@닉네임으로 호출될 때' },
];

const JURY = [
  { id: 'call', l: '배심원 호출', sub: '검토 요청이 도착할 때' },
  { id: 'res', l: '결과', sub: '내가 참여한 안건의 결과' },
  { id: 'ali', l: '의견 일치', sub: '다수 의견과 일치할 때' },
];

export default function NotificationSettingsV2() {
  const navigation = useNavigation();
  const [master, setMaster] = useState(true);
  const [s, setS] = useState<Record<string, boolean>>({
    cmt: true, rep: true, rec: true, scr: false, men: true,
    call: true, res: true, ali: false,
    dnd: false,
    preview: true,
  });

  const toggle = (id: string) => setS((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Screen
      bg={C.cream}
      appBar={
        <AppBar
          leading={
            <View style={styles.leading}>
              <IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />
              <Text style={styles.title}>알림 설정</Text>
            </View>
          }
        />
      }
    >
      <View style={styles.masterCard}>
        <View style={styles.masterRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterLabel}>푸시 알림 받기</Text>
            <Text style={styles.masterSub}>
              꺼두면 아래 항목이 모두 작동하지 않아요
            </Text>
          </View>
          <Switch value={master} onChange={setMaster} />
        </View>
      </View>

      <View style={[!master && { opacity: 0.4 }]} pointerEvents={master ? 'auto' : 'none'}>
        <Text style={styles.sectionLabel}>활동</Text>
        <View style={styles.card}>
          {ACTIVITY.map((a) => (
            <ListRow
              key={a.id}
              label={a.l}
              value={a.sub}
              trailing="switch"
              switchValue={s[a.id]}
              onSwitchChange={() => toggle(a.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>배심원</Text>
        <View style={styles.card}>
          {JURY.map((a) => (
            <ListRow
              key={a.id}
              label={a.l}
              value={a.sub}
              trailing="switch"
              switchValue={s[a.id]}
              onSwitchChange={() => toggle(a.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>방해금지</Text>
        <View style={styles.card}>
          <ListRow
            label="야간 방해금지"
            trailing="switch"
            switchValue={s.dnd}
            onSwitchChange={() => toggle('dnd')}
          />
          {s.dnd && (
            <>
              <ListRow label="시작" value="22:00" trailing="chev" onPress={() => undefined} />
              <ListRow label="종료" value="08:00" trailing="chev" onPress={() => undefined} />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>잠금화면</Text>
        <View style={styles.card}>
          <ListRow
            label="내용 미리보기"
            value="끄면 'UNIT 알림'만 표시돼요"
            trailing="switch"
            switchValue={s.preview}
            onSwitchChange={() => toggle('preview')}
          />
        </View>
      </View>
      <View style={{ height: SP[6] }} />
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

  masterCard: {
    marginHorizontal: SP[4],
    marginTop: SP[3],
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
  },
  masterRow: { flexDirection: 'row', alignItems: 'center' },
  masterLabel: { fontSize: F.size.md, fontFamily: F.familyMedium, color: C.text },
  masterSub: { marginTop: 2, fontSize: F.size.xs, color: C.hint },

  sectionLabel: {
    paddingHorizontal: SP[5],
    paddingTop: SP[4],
    paddingBottom: SP[1],
    fontSize: F.size.xs,
    fontFamily: F.familyMedium,
    color: C.hint,
    letterSpacing: F.ls.wide,
  },
  card: {
    marginHorizontal: SP[4],
    backgroundColor: C.white,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.divider,
    overflow: 'hidden',
  },
});
