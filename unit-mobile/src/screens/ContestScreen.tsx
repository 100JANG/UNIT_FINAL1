import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  IconBack,
  IconSearch,
} from '../components/shared';

type Item = {
  tag: '디자인' | '개발' | '창업' | '학술';
  host: string; title: string; deadline: string; prize: string; n: number; fit: number;
};

const ALL: Item[] = [
  { tag: '디자인', host: '한국디자인진흥원',   title: '청년 UX 디자인 공모전',     deadline: 'D-12', prize: '대상 500만원',     n: 1240, fit: 92 },
  { tag: '개발',   host: '삼성SDS',            title: '대학생 SW 알고리즘 챌린지', deadline: 'D-5',  prize: '대상 300만원',     n: 892,  fit: 88 },
  { tag: '창업',   host: '인천창조경제센터',   title: '인천 대학생 창업 아이디어', deadline: 'D-21', prize: '시상금 200만원',  n: 634,  fit: 71 },
  { tag: '학술',   host: '한국정보과학회',     title: '학부 논문 경진대회',         deadline: 'D-32', prize: '학회지 게재',     n: 312,  fit: 58 },
];

const ACCENT: Record<Item['tag'], string> = {
  '디자인': '#000080',
  '개발':   '#1F7A5C',
  '창업':   '#B5882B',
  '학술':   '#6B4F2E',
};

type TabId = 'rec' | 'all' | 'soon';

export default function ContestScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<TabId>('rec');

  const list = useMemo(
    () => (tab === 'rec' ? [...ALL].sort((a, b) => b.fit - a.fit) : ALL),
    [tab],
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
              공모전
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
        }
      />

      <View className="flex-row items-center px-4 border-b border-[#F0F0F0]">
        {[
          { id: 'rec' as const, l: '추천' },
          { id: 'all' as const, l: '전체' },
          { id: 'soon' as const, l: '마감임박' },
        ].map((t) => {
          const on = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              className="relative h-11 px-3.5 justify-center"
            >
              <Text
                className={`text-[13.5px] ${on ? 'text-[#111]' : 'text-[#9CA3AF]'}`}
                style={{ fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard' }}
              >
                {t.l}
              </Text>
              {on && <View className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]" />}
            </Pressable>
          );
        })}
      </View>

      {tab === 'rec' && (
        <View
          className="px-4 py-2.5 border-b border-[#F0F0F0]"
          style={{ backgroundColor: '#FAF8F4' }}
        >
          <Text className="text-[11.5px] text-[#6B7280]">
            내 학과·관심사 기준으로 정렬해드렸어요
          </Text>
        </View>
      )}

      <ScrollView className="flex-1" style={{ backgroundColor: '#FAF8F4' }}>
        <View className="p-3 flex-row flex-wrap" style={{ gap: 12 }}>
          {list.map((it, i) => (
            <View
              key={i}
              className="bg-white rounded-xl border border-[#F0F0F0] p-3"
              style={{ width: '47.7%' }}
            >
              <View className="flex-row items-center">
                <Text
                  className="text-[11px]"
                  style={{ color: ACCENT[it.tag], fontFamily: 'Pretendard-SemiBold' }}
                >
                  {it.tag}
                </Text>
                <Text
                  className="ml-auto text-[11px] text-coral"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {it.deadline}
                </Text>
              </View>
              <Text
                numberOfLines={2}
                className="text-[13.5px] text-[#111] mt-1.5"
                style={{
                  fontFamily: 'Pretendard-SemiBold',
                  letterSpacing: -0.2,
                  lineHeight: 18,
                  minHeight: 36,
                }}
              >
                {it.title}
              </Text>
              <Text
                numberOfLines={1}
                className="text-[11px] text-[#9CA3AF] mt-1"
              >
                {it.host}
              </Text>
              <Text
                numberOfLines={1}
                className="text-[11.5px] text-[#374151]"
              >
                {it.prize}
              </Text>
              <View className="mt-1 pt-2 border-t border-[#F0F0F0] flex-row items-center justify-between">
                <Text className="text-[10.5px] text-[#9CA3AF]">
                  스크랩 {it.n}
                </Text>
                {tab === 'rec' && (
                  <Text
                    className="text-[10.5px] text-mint"
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    적합 {it.fit}%
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
