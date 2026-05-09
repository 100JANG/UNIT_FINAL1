import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AppBar,
  Avatar,
  Hairline,
  IconButton,
  MannerBadge,
  Pill,
  Screen,
  IcBack,
  IcBookmark,
  IcMore,
  IcShare,
} from '../../components/ui';
import { C, F, R, SP } from '../../theme/tokens';

const ITEM = {
  title: '맥북 에어 M2 13인치 (스페이스그레이)',
  cat: '디지털',
  loc: '용현동',
  ago: '15분 전',
  price: 1180000,
  body: '작년 가을 구매, 영수증 있어요.\n주말 직거래 가능합니다. 케이스/충전기 포함.\n쿨링패드는 별도 구매 가능.',
  seller: { name: '민서연', dept: '소프트웨어학과', deals: 12 },
};

export default function MarketDetailV2() {
  const navigation = useNavigation();
  const [scrap, setScrap] = useState(false);

  return (
    <Screen
      scrollable
      appBar={
        <AppBar
          leading={<IconButton icon={<IcBack />} onPress={() => navigation.goBack()} />}
          trailing={
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon={<IcShare />} onPress={() => undefined} />
              <IconButton icon={<IcMore />} onPress={() => undefined} />
            </View>
          }
        />
      }
    >
      <View style={styles.photo}>
        <Text style={styles.photoEmoji}>💻</Text>
        <View style={styles.photoIndicator}>
          <Text style={styles.photoCounter}>1 / 4</Text>
        </View>
      </View>

      <View style={styles.sellerRow}>
        <Avatar name={ITEM.seller.name} size={32} />
        <View style={{ flex: 1 }}>
          <View style={styles.sellerNameRow}>
            <Text style={styles.sellerName}>{ITEM.seller.name}</Text>
            <MannerBadge grade="A0" size="sm" />
          </View>
          <Text style={styles.sellerMeta}>
            {ITEM.seller.dept} · 거래 {ITEM.seller.deals}회
          </Text>
        </View>
      </View>
      <Hairline />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{ITEM.title}</Text>
        <Text style={styles.metaRow}>
          {ITEM.cat} · {ITEM.loc} · {ITEM.ago}
        </Text>
        <Text style={styles.price}>{ITEM.price.toLocaleString()}원</Text>
        <View style={{ marginTop: SP[1] }}>
          <Pill tone="mint">거래 가능</Pill>
        </View>
      </View>

      <Text style={styles.body}>{ITEM.body}</Text>

      <View style={styles.tradeBox}>
        <Text style={styles.tradeLabel}>거래 방식</Text>
        <Text style={styles.tradeText}>직거래 가능 · 택배 가능 (착불)</Text>
      </View>

      <View style={styles.safeBox}>
        <Text style={styles.safeText}>
          ⚠️ 법인 거래는 금지돼요. 직접 만나서 거래하고, 사기 의심 시 신고해주세요.
        </Text>
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => setScrap((v) => !v)}
          style={({ pressed }) => [
            styles.bookmarkBtn,
            scrap && { backgroundColor: C.warn + '15' },
            pressed && { opacity: 0.8 },
          ]}
        >
          <IcBookmark size={20} color={scrap ? C.warn : C.textMeta} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: SP[2] }}>
          <Text style={styles.priceSmall}>{ITEM.price.toLocaleString()}원</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaText}>채팅하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    aspectRatio: 4 / 3,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  photoIndicator: {
    position: 'absolute',
    top: SP[3],
    right: SP[3],
    paddingHorizontal: SP[2],
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: R.full,
  },
  photoCounter: { fontSize: F.size.xs, color: C.white, fontFamily: F.familyMedium },

  sellerRow: {
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP[3],
  },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: SP[1] },
  sellerName: { fontSize: F.size.md, fontFamily: F.familySemiBold, color: C.text },
  sellerMeta: { fontSize: F.size.sm, color: C.textMeta, marginTop: 2 },

  titleBlock: { paddingHorizontal: SP[4], paddingTop: SP[4] },
  title: {
    fontSize: F.size.h2,
    fontFamily: F.familySemiBold,
    color: C.text,
    letterSpacing: -0.4,
  },
  metaRow: { marginTop: 4, fontSize: F.size.sm, color: C.textMeta },
  price: {
    marginTop: SP[2],
    fontSize: F.size.hero,
    fontFamily: F.familyBold,
    color: C.inkNavy,
    letterSpacing: -0.5,
  },

  body: {
    paddingHorizontal: SP[4],
    paddingTop: SP[3],
    paddingBottom: SP[5],
    fontSize: F.size.lg,
    color: C.textSub,
    lineHeight: 25,
  },

  tradeBox: {
    marginHorizontal: SP[4],
    marginBottom: SP[3],
    padding: SP[4],
    backgroundColor: '#F8F9FA',
    borderRadius: R.lg,
  },
  tradeLabel: { fontSize: F.size.xs, color: C.hint, marginBottom: 4 },
  tradeText: { fontSize: F.size.base, color: C.textSub },

  safeBox: {
    marginHorizontal: SP[4],
    marginBottom: SP[3],
    padding: SP[3],
    backgroundColor: C.cream,
    borderRadius: R.lg,
  },
  safeText: { fontSize: F.size.sm, color: C.textSub, lineHeight: 19 },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP[4],
    paddingVertical: SP[3],
    borderTopWidth: 1,
    borderTopColor: C.divider,
    backgroundColor: C.white,
  },
  bookmarkBtn: {
    width: 44, height: 44,
    borderRadius: R.md,
    borderWidth: 1, borderColor: C.divider2,
    alignItems: 'center', justifyContent: 'center',
  },
  priceSmall: { fontSize: F.size.lg, fontFamily: F.familySemiBold, color: C.text },
  cta: {
    height: 48,
    paddingHorizontal: SP[5],
    borderRadius: R.lg,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontSize: F.size.lg, color: C.white, fontFamily: F.familySemiBold },
});
