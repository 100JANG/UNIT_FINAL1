import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconBack,
} from '../components/shared';

type MealCard = {
  time: string; range: string; cafe: string;
  items: string[]; price: number; accent: string; hot?: boolean;
};

const CARDS: MealCard[] = [
  { time: '조식', range: '7:30~9:00',   cafe: '학생회관',   items: ['토스트 세트', '계란프라이', '시리얼', '우유'], price: 3000, accent: '#B5882B' },
  { time: '중식', range: '11:30~14:00', cafe: '학생회관',   items: ['제육덮밥', '미소된장국', '단무지', '깍두기'], price: 5500, accent: '#B73E37', hot: true },
  { time: '중식', range: '11:30~14:00', cafe: '교직원식당', items: ['치킨까스 정식', '카레라이스', '치킨샐러드'], price: 6500, accent: '#000080' },
  { time: '석식', range: '17:00~19:00', cafe: '학생회관',   items: ['김치찌개', '감자조림', '계란말이', '김'],     price: 5500, accent: '#1F7A5C' },
];

const FILTER_TABS = ['전체', '학생회관', '교직원식당', '기숙사'];

export default function MealScreen() {
  const navigation = useNavigation();

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
              식단표
            </Text>
          </View>
        }
        trailing={
          <Pressable className="px-2 py-1.5">
            <Text
              className="text-[12.5px] text-navy"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              5/12 (화)
            </Text>
          </Pressable>
        }
      />

      <View className="bg-white border-b border-[#F0F0F0]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}
        >
          {FILTER_TABS.map((c, i) => {
            const on = i === 0;
            return (
              <Pressable
                key={c}
                className={`h-8 px-3 rounded-full items-center justify-center ${
                  on ? 'bg-navy' : 'bg-[#F3F4F6]'
                }`}
              >
                <Text
                  className="text-[12.5px]"
                  style={{
                    color: on ? '#FFFFFF' : '#6B7280',
                    fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard',
                  }}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" style={{ backgroundColor: '#FAF8F4' }}>
        <View className="p-3 flex-row flex-wrap" style={{ gap: 12 }}>
          {CARDS.map((m, i) => (
            <View
              key={i}
              className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden"
              style={{ width: '47.7%' }}
            >
              <View style={{ backgroundColor: m.accent, height: 3 }} />
              <View className="p-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[13px] text-[#111]"
                    style={{ fontFamily: 'Pretendard-SemiBold' }}
                  >
                    {m.time}
                  </Text>
                  {m.hot && <Pill tone="warn">인기</Pill>}
                </View>
                <Text className="text-[10.5px] text-[#9CA3AF] mt-1">{m.range}</Text>
                <Text className="text-[11.5px] text-[#374151] mt-0.5">{m.cafe}</Text>
                <View className="mt-1">
                  {m.items.map((it) => (
                    <Text
                      key={it}
                      className="text-[12.5px] text-[#374151]"
                      style={{ lineHeight: 17 }}
                    >
                      · {it}
                    </Text>
                  ))}
                </View>
                <View className="mt-2 pt-2 border-t border-[#F0F0F0]">
                  <Text
                    className="text-[12.5px] text-[#111]"
                    style={{ fontFamily: 'Pretendard-SemiBold' }}
                  >
                    {m.price.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
