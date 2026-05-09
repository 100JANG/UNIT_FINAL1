import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconBack,
  IconSearch,
  IconPlus,
  IconCheck,
  IconChevDn,
} from '../components/shared';
import type { PillTone } from '../components/shared';

type Item = {
  title: string; price: number; time: string; loc: string;
  tag: '거래중' | '예약중' | '거래완료'; bg: string;
};

const ALL: Item[] = [
  { title: '맥북 에어 M2 13인치 (스페이스그레이)', price: 1180000, time: '15분 전', loc: '용현동', tag: '거래중',   bg: '#E5E7EB' },
  { title: '경영학원론 박상우 교재',                price: 12000,   time: '1시간 전', loc: '주안동', tag: '거래중',   bg: '#FAF8F4' },
  { title: '아이패드 미니 6세대 (퍼플)',           price: 580000,  time: '3시간 전', loc: '학익동', tag: '예약중',   bg: '#E8E8F2' },
  { title: '자전거 (출퇴근용)',                     price: 95000,   time: '어제',     loc: '용현동', tag: '거래중',   bg: '#E2F1EA' },
  { title: '데이터분석개론 솔루션',                 price: 8000,    time: '2일 전',   loc: '도화동', tag: '거래완료', bg: '#FBE9E6' },
];

const TONE: Record<Item['tag'], PillTone> = {
  '거래완료': 'plain',
  '예약중':   'cream',
  '거래중':   'mint',
};

export default function MarketScreen() {
  const navigation = useNavigation();
  const [hideDone, setHideDone] = useState(true);

  const items = useMemo(
    () => (hideDone ? ALL.filter((i) => i.tag !== '거래완료') : ALL),
    [hideDone],
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <AppBar
        leading={
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
              <IconBack size={22} color="#111" />
            </Pressable>
            <Text
              className="text-[15px] text-[#111] ml-1"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              중고장터
            </Text>
          </View>
        }
        trailing={
          <>
            <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
            <Pressable className="p-2"><IconPlus size={20} color="#000080" /></Pressable>
          </>
        }
      />

      <View className="px-4 py-2.5 border-b border-[#F0F0F0] flex-row items-center gap-2">
        <Pressable
          onPress={() => setHideDone((v) => !v)}
          className={`h-7 px-3 rounded-full flex-row items-center gap-1 ${
            hideDone ? 'bg-navy border-navy' : 'bg-white border-[#E5E7EB]'
          }`}
          style={{ borderWidth: 1 }}
        >
          {hideDone && <IconCheck size={12} color="#FFFFFF" />}
          <Text
            className="text-[12px]"
            style={{ color: hideDone ? '#FFFFFF' : '#374151' }}
          >
            거래완료 제외
          </Text>
        </Pressable>
        <Pressable
          className="h-7 px-3 rounded-full flex-row items-center gap-1"
          style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
        >
          <Text className="text-[12px] text-[#374151]">전체 동네</Text>
          <IconChevDn size={11} color="#374151" />
        </Pressable>
        <Text className="ml-auto text-[11.5px] text-[#9CA3AF]">{items.length}건</Text>
      </View>

      <ScrollView className="flex-1">
        {items.map((it, i) => (
          <Pressable
            key={i}
            className={`px-4 py-3 flex-row gap-3 active:bg-[#F9FAFB] ${
              i < items.length - 1 ? 'border-b border-[#F0F0F0]' : ''
            }`}
          >
            <View
              className="w-[78px] h-[78px] rounded-lg"
              style={{ backgroundColor: it.bg }}
            />
            <View className="flex-1 min-w-0">
              <Text
                className="text-[14px] text-[#111]"
                style={{ letterSpacing: -0.2, lineHeight: 19 }}
              >
                {it.title}
              </Text>
              <Text className="text-[11.5px] text-[#9CA3AF] mt-0.5">
                {it.loc} · {it.time}
              </Text>
              <View className="mt-1.5 flex-row items-center gap-2">
                <Text
                  className="text-[15px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3 }}
                >
                  {it.price.toLocaleString()}원
                </Text>
                <Pill tone={TONE[it.tag]}>{it.tag}</Pill>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
