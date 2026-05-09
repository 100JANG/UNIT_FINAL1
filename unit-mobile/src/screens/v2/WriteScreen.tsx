import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Hairline,
  IconButton,
  Screen,
  Switch,
  IcX,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

export default function WriteV2() {
  const navigation = useNavigation();
  const [board] = useState('자유게시판');
  const [anon, setAnon] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const valid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
          title="글쓰기"
          trailing={
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Pressable hitSlop={6}>
                <Text style={styles.draftText}>임시저장</Text>
              </Pressable>
              <Pressable
                disabled={!valid}
                hitSlop={6}
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.publishBtn,
                  { backgroundColor: valid ? C.inkNavy : C.surface2 },
                  pressed && valid && { opacity: 0.9 },
                ]}
              >
                <Text style={[styles.publishText, { color: valid ? C.white : C.hint }]}>
                  게시
                </Text>
              </Pressable>
            </View>
          }
        />
      }
    >
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
        <Text style={styles.rowLabel}>{board}</Text>
        <View style={styles.rowRight}>
          <Text style={styles.rowSub}>게시판 선택</Text>
          <IcChev size={14} color={C.hint} />
        </View>
      </Pressable>
      <Hairline />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>익명으로 작성</Text>
        <Switch value={anon} onChange={setAnon} />
      </View>
      <Hairline />

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
        placeholderTextColor="#C9CDD3"
        style={styles.titleInput}
      />
      <Hairline mx={SP[4]} />

      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        placeholder={'내용을 자유롭게 작성하세요.\n\n같은 학과 학생들이 읽을 수 있어요.'}
        placeholderTextColor="#C9CDD3"
        style={styles.bodyInput}
        textAlignVertical="top"
      />

      <View style={styles.tagsBox}>
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="태그를 추가하세요 (쉼표로 구분)"
          placeholderTextColor="#C9CDD3"
          style={styles.tagsInput}
        />
      </View>
      <Hairline mx={SP[4]} />

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          작성한 글은 같은 학과 학생들이 볼 수 있어요. 신고가 누적되면 학과 학생
          30명에게 검토를 요청할 수 있습니다.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  draftText: {
    fontSize: F.size.sm, color: C.textMeta,
    paddingHorizontal: SP[2], paddingVertical: SP[1],
  },
  publishBtn: {
    height: 32, paddingHorizontal: SP[3], borderRadius: R.md,
    alignItems: 'center', justifyContent: 'center',
  },
  publishText: { fontSize: F.size.sm, fontFamily: F.familySemiBold },

  row: {
    height: 48,
    paddingHorizontal: SP[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
  },
  rowPressed: { backgroundColor: C.surface },
  rowLabel: { fontSize: F.size.md, color: C.text },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SP[1] },
  rowSub: { fontSize: F.size.sm, color: C.hint },

  titleInput: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[4],
    fontSize: F.size.h2,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.4,
  },

  bodyInput: {
    minHeight: 200,
    padding: SP[4],
    fontSize: F.size.lg,
    color: C.text,
    fontFamily: F.family,
    lineHeight: 25,
  },

  tagsBox: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  tagsInput: {
    height: 40,
    fontSize: F.size.base,
    color: C.text,
    fontFamily: F.family,
    paddingVertical: 0,
  },

  notice: { padding: SP[4] },
  noticeText: { fontSize: F.size.sm, color: C.hint, lineHeight: 19 },
});
