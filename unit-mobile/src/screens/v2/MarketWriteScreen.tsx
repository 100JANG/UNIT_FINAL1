import { useState } from 'react';
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
  AppBar,
  Chip,
  Hairline,
  IconButton,
  Screen,
  IcX,
  IcChev,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const CATS = ['디지털', '도서', '생활', '패션', '티켓', '기타'];

export default function MarketWriteV2() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [free, setFree] = useState(false);
  const [direct, setDirect] = useState(true);
  const [parcel, setParcel] = useState(false);
  const [body, setBody] = useState('');

  const valid = title.trim() && cat && (free || price.trim()) && body.trim().length >= 10;

  const fmtPrice = (s: string) => {
    const n = s.replace(/[^0-9]/g, '');
    if (!n) return '';
    return Number(n).toLocaleString();
  };

  return (
    <Screen
      appBar={
        <AppBar
          leading={<IconButton icon={<IcX />} onPress={() => navigation.goBack()} />}
          title="상품 등록"
          trailing={
            <Pressable
              disabled={!valid}
              hitSlop={6}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: valid ? C.inkNavy : C.surface2 },
                pressed && valid && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.submitText, { color: valid ? C.white : C.hint }]}>
                등록
              </Text>
            </Pressable>
          }
        />
      }
    >
      <View style={styles.photoStrip}>
        <View style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>📷</Text>
          <Text style={styles.photoCounter}>0/10</Text>
        </View>
      </View>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="제목 (필수)"
        placeholderTextColor="#C9CDD3"
        style={styles.titleInput}
      />
      <Hairline />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>카테고리</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATS.map((c) => (
            <Chip key={c} active={cat === c} onPress={() => setCat(c)}>{c}</Chip>
          ))}
        </ScrollView>
      </View>
      <Hairline />

      <View style={styles.priceRow}>
        <Text style={styles.priceCurr}>₩</Text>
        <TextInput
          value={fmtPrice(price)}
          onChangeText={setPrice}
          placeholder={free ? '나눔' : '0'}
          placeholderTextColor={C.hint}
          keyboardType="number-pad"
          editable={!free}
          style={styles.priceInput}
        />
        <Pressable
          onPress={() => setFree((v) => !v)}
          style={({ pressed }) => [
            styles.freeChip,
            free && { backgroundColor: C.inkNavy },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[styles.freeText, free && { color: C.white }]}>나눔</Text>
        </Pressable>
      </View>
      <Hairline />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>거래 방식</Text>
        <Pressable
          onPress={() => setDirect((v) => !v)}
          style={styles.checkRow}
        >
          <View style={[styles.check, direct && styles.checkOn]}>
            {direct && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>직거래 가능</Text>
        </Pressable>
        <Pressable
          onPress={() => setParcel((v) => !v)}
          style={styles.checkRow}
        >
          <View style={[styles.check, parcel && styles.checkOn]}>
            {parcel && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>택배 가능 (착불)</Text>
        </Pressable>
      </View>
      <Hairline />

      <Pressable style={({ pressed }) => [styles.regionRow, pressed && styles.pressed]}>
        <Text style={styles.regionLabel}>거래 동네</Text>
        <View style={styles.regionValueRow}>
          <Text style={styles.regionValue}>용현동</Text>
          <IcChev size={16} color={C.hint} />
        </View>
      </Pressable>
      <Hairline />

      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        placeholder="상품 상태와 거래 방식을 알려주세요. (10자 이상)"
        placeholderTextColor="#C9CDD3"
        style={styles.bodyInput}
        textAlignVertical="top"
      />

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          거래 금지 품목 (담배·주류·동물·계정 등)을 등록하면 매너 점수가 차감돼요.{' '}
          <Text style={{ color: C.inkNavy, fontFamily: F.familyMedium }}>자세히 보기</Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  submitBtn: {
    height: 32,
    paddingHorizontal: SP[3],
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: F.size.sm, fontFamily: F.familySemiBold },

  photoStrip: { paddingHorizontal: SP[4], paddingVertical: SP[3], flexDirection: 'row' },
  photoBtn: {
    width: 64, height: 64,
    borderRadius: R.md,
    borderWidth: 1, borderColor: C.divider2,
    alignItems: 'center', justifyContent: 'center',
  },
  photoBtnText: { fontSize: 22 },
  photoCounter: { marginTop: 2, fontSize: 10, color: C.textMeta },

  titleInput: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[4],
    fontSize: F.size.h2,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.4,
  },

  section: { paddingHorizontal: SP[4], paddingVertical: SP[3] },
  sectionLabel: {
    fontSize: F.size.xs,
    color: C.hint,
    fontFamily: F.familyMedium,
    marginBottom: SP[2],
  },
  chipsRow: { gap: SP[2] },

  priceRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[2],
  },
  priceCurr: { fontSize: F.size.xl, color: C.text, fontFamily: F.familySemiBold },
  priceInput: {
    flex: 1,
    fontSize: F.size.xl,
    color: C.text,
    fontFamily: F.familySemiBold,
    textAlign: 'right',
    padding: 0,
  },
  freeChip: {
    height: 28, paddingHorizontal: SP[3],
    borderRadius: R.full,
    backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  freeText: { fontSize: F.size.sm, color: C.textMeta },

  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SP[2], gap: SP[2] },
  check: {
    width: 18, height: 18,
    borderRadius: R.sm,
    borderWidth: 1.5, borderColor: C.hint,
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { borderColor: C.inkNavy, backgroundColor: C.inkNavy },
  checkMark: { color: C.white, fontSize: 11, fontFamily: F.familyBold },
  checkLabel: { fontSize: F.size.md, color: C.text },

  regionRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: { backgroundColor: C.surface },
  regionLabel: { fontSize: F.size.md, color: C.text },
  regionValueRow: { flexDirection: 'row', alignItems: 'center', gap: SP[2] },
  regionValue: { fontSize: F.size.base, color: C.textSub },

  bodyInput: {
    minHeight: 200,
    padding: SP[4],
    fontSize: F.size.lg,
    color: C.text,
    fontFamily: F.family,
    lineHeight: 25,
  },

  notice: {
    margin: SP[4],
    padding: SP[3],
    backgroundColor: C.cream,
    borderRadius: R.lg,
  },
  noticeText: { fontSize: F.size.sm, color: C.textSub, lineHeight: 19 },
});
