import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Hairline,
  Pill,
  IconSearch,
  IconChevDn,
  IconThumb,
  IconCheck,
} from '../components/shared';
import { COURSES, type Course } from '../data/courses';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Vote = 'rec' | 'no' | null;

const FILTERS = ['2025-1학기', '아주대학교', '전체 학과', '추천순'];

export default function CoursesScreen() {
  const [voted, setVoted] = useState<Record<number, Vote>>({});
  const navigation = useNavigation<Nav>();

  const vote = (id: number, v: 'rec' | 'no') =>
    setVoted((prev) => ({ ...prev, [id]: prev[id] === v ? null : v }));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <AppBar
        title="강의평"
        trailing={
          <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
        }
        divider={false}
      />

      {/* Search bar (display only) */}
      <View className="px-4 pt-1 pb-3 bg-white">
        <View className="flex-row items-center gap-2 h-10 px-3.5 rounded-lg bg-[#F3F4F6]">
          <IconSearch size={18} color="#9CA3AF" />
          <Text className="text-[13.5px] text-[#9CA3AF]">강의명, 교수명으로 검색</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 6 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            className="h-7 px-2.5 rounded-full border border-[#E5E7EB] flex-row items-center gap-1"
          >
            <Text className="text-[12px] text-[#374151]">{f}</Text>
            <IconChevDn size={11} color="#374151" />
          </Pressable>
        ))}
      </ScrollView>
      <Hairline />

      <ScrollView className="flex-1">
        {COURSES.map((c, i) => (
          <View key={c.id}>
            <CourseRow
              c={c}
              v={voted[c.id] ?? null}
              onVote={(v) => vote(c.id, v)}
              onPress={() =>
                navigation.navigate('CourseDetail', { courseId: c.id })
              }
            />
            {i < COURSES.length - 1 && <Hairline className="mx-4" />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function CourseRow({
  c,
  v,
  onVote,
  onPress,
}: {
  c: Course;
  v: Vote;
  onVote: (v: 'rec' | 'no') => void;
  onPress: () => void;
}) {
  return (
    <View className="px-4 py-3.5">
      <Pressable onPress={onPress} className="active:bg-[#F9FAFB]">
        <View className="flex-row items-baseline gap-2 mb-1">
          <Text
            className="text-[15.5px] text-[#111]"
            style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3 }}
          >
            {c.name}
          </Text>
          <Text className="text-[12.5px] text-[#6B7280]">{c.prof}</Text>
          {c.trust && (
            <View className="ml-auto">
              <Pill tone="mint">신뢰</Pill>
            </View>
          )}
        </View>
        <Text className="text-[12px] text-[#9CA3AF] mb-2.5">
          {c.dept} · {c.credit}학점
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Text
              className="text-[12px] text-navy"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              {c.rec}%
            </Text>
            <Text className="text-[12px] text-[#6B7280]">추천</Text>
          </View>
          <Text className="text-[12px] text-[#E5E7EB]">·</Text>
          <Text className="text-[12px] text-[#6B7280]">응답 {c.n}</Text>
          <Text className="text-[12px] text-[#E5E7EB]">·</Text>
          <Text className="text-[12px] text-[#6B7280]">참여율 {c.partic}%</Text>
        </View>
        <View className="mt-2 h-[3px] rounded-full bg-[#F3F4F6] overflow-hidden">
          <View
            className="h-full bg-navy"
            style={{ width: `${c.rec}%` }}
          />
        </View>
      </Pressable>

      {/* Quick vote — flex-row + flex-1 instead of grid-cols-2 */}
      <View className="mt-3 flex-row gap-2">
        <Pressable
          onPress={() => onVote('rec')}
          className={`flex-1 h-9 rounded-md border flex-row items-center justify-center gap-1.5 ${
            v === 'rec'
              ? 'bg-navy border-navy'
              : 'bg-white border-[#E5E7EB] active:bg-[#F9FAFB]'
          }`}
        >
          <IconThumb size={14} color={v === 'rec' ? '#FFFFFF' : '#374151'} />
          <Text
            className="text-[12.5px]"
            style={{
              color: v === 'rec' ? '#FFFFFF' : '#374151',
              fontFamily: 'Pretendard-Medium',
            }}
          >
            추천
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onVote('no')}
          className={`flex-1 h-9 rounded-md border flex-row items-center justify-center gap-1.5 ${
            v === 'no'
              ? 'bg-coral border-coral'
              : 'bg-white border-[#E5E7EB] active:bg-[#F9FAFB]'
          }`}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <IconThumb size={14} color={v === 'no' ? '#FFFFFF' : '#374151'} />
          </View>
          <Text
            className="text-[12.5px]"
            style={{
              color: v === 'no' ? '#FFFFFF' : '#374151',
              fontFamily: 'Pretendard-Medium',
            }}
          >
            비추천
          </Text>
        </Pressable>
      </View>
      {v && (
        <View className="mt-2 flex-row items-center gap-1">
          <IconCheck size={13} color="#1F7A5C" />
          <Text className="text-[11.5px] text-mint">
            의견을 등록했어요. 한줄평은 강의 상세에서 추가할 수 있어요.
          </Text>
        </View>
      )}
    </View>
  );
}
