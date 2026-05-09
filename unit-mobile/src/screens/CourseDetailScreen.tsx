import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Pill,
  IconBack,
  IconBookmark,
  IconShield,
  IconThumb,
} from '../components/shared';
import { COURSES, REVIEWS } from '../data/courses';
import type { RootStackParamList, RootStackProps } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabId = 'rec' | 'no' | 'all';

export default function CourseDetailScreen({
  route,
}: RootStackProps<'CourseDetail'>) {
  const [tab, setTab] = useState<TabId>('rec');
  const navigation = useNavigation<Nav>();
  const c = COURSES.find((x) => x.id === route.params.courseId) ?? COURSES[0];

  const filtered =
    tab === 'rec' ? REVIEWS.filter((r) => r.vote === 'rec')
    : tab === 'no'  ? REVIEWS.filter((r) => r.vote === 'no')
    : REVIEWS;

  const tabs = [
    { id: 'rec' as const, l: `추천 ${REVIEWS.filter((r) => r.vote === 'rec').length}` },
    { id: 'no'  as const, l: `비추천 ${REVIEWS.filter((r) => r.vote === 'no').length}` },
    { id: 'all' as const, l: '의견' },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <AppBar
        leading={
          <View className="flex-row items-center min-w-0 flex-1">
            <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
              <IconBack size={22} color="#111" />
            </Pressable>
            <Text
              numberOfLines={1}
              className="text-[15px] text-[#111] ml-1 flex-1"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              {c.name}
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconBookmark size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[2]}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3">
          <Text
            className="text-[20px] text-[#111]"
            style={{
              fontFamily: 'Pretendard-SemiBold',
              letterSpacing: -0.4,
              lineHeight: 26,
            }}
          >
            {c.name}
          </Text>
          <Text className="text-[13px] text-[#6B7280] mt-1">
            {c.prof} · {c.dept} · {c.credit}학점
          </Text>
        </View>

        {/* Stats card */}
        <View className="mx-4 mb-2 px-4 py-4 border border-[#F0F0F0] rounded-xl">
          <View className="flex-row items-baseline gap-2 mb-3">
            <Text
              className="text-[28px] text-navy"
              style={{ fontFamily: 'Pretendard-Bold', letterSpacing: -0.5 }}
            >
              {c.rec}%
            </Text>
            <Text className="text-[13px] text-[#6B7280]">추천</Text>
            <Text className="ml-auto text-[12px] text-[#9CA3AF]">응답 {c.n}명</Text>
          </View>
          <View className="h-[6px] rounded-full overflow-hidden flex-row bg-[#F3F4F6]">
            <View className="h-full bg-navy" style={{ width: `${c.rec}%` }} />
            <View className="h-full bg-[#E5E7EB]" style={{ width: `${100 - c.rec}%` }} />
          </View>
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#F0F0F0]">
            <View className="flex-row items-center gap-1.5">
              <IconShield size={15} color="#374151" />
              <Text className="text-[12.5px] text-[#374151]">
                참여율{' '}
                <Text
                  className="text-navy"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {c.partic}%
                </Text>
              </Text>
            </View>
            <Pill tone="cobalt">70% 이상이라 신뢰할 수 있어요</Pill>
          </View>
        </View>

        {/* Sticky review tabs */}
        <View className="flex-row items-center gap-1 px-4 pt-3 pb-2 bg-white border-b border-[#F0F0F0]">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                className={`h-8 px-3 rounded-full ${
                  on ? 'bg-navy' : 'bg-[#F3F4F6]'
                } items-center justify-center`}
              >
                <Text
                  className="text-[12.5px]"
                  style={{
                    color: on ? '#FFFFFF' : '#6B7280',
                    fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard',
                  }}
                >
                  {t.l}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filtered.map((r, i) => (
          <View key={i} className="px-4 py-3.5 border-b border-[#F0F0F0]">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Pill tone={r.vote === 'rec' ? 'navy' : 'warn'}>
                {r.vote === 'rec' ? '추천' : '비추천'}
              </Pill>
              <Text className="text-[11.5px] text-[#9CA3AF]">
                {r.sem}학기 · {r.nick}
              </Text>
              <View className="ml-auto flex-row items-center gap-1">
                <IconThumb size={11} color="#9CA3AF" />
                <Text className="text-[11.5px] text-[#9CA3AF]">{r.up}</Text>
              </View>
            </View>
            <Text
              className="text-[13.5px] text-[#374151]"
              style={{ letterSpacing: -0.2, lineHeight: 22 }}
            >
              {r.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* CTA */}
      <View className="px-4 pt-3 pb-6 border-t border-[#F0F0F0]">
        <Pressable
          onPress={() =>
            navigation.navigate('CourseReview', { courseId: c.id })
          }
          className="w-full h-12 rounded-lg bg-navy items-center justify-center"
        >
          <Text
            className="text-white text-[14.5px]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            평가하기
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
