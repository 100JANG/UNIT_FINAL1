import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconX,
  IconShield,
  IconCheck,
} from '../components/shared';

type Voted = 'ok' | 'issue' | null;

export default function JuryScreen() {
  const navigation = useNavigation();
  const [responded, setResponded] = useState(17);
  const [voted, setVoted] = useState<Voted>(null);

  useEffect(() => {
    if (voted) return;
    const id = setInterval(() => {
      setResponded((r) => Math.min(30, r + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [voted]);

  const pct = (responded / 30) * 100;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <AppBar
        leading={
          <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
            <IconX size={22} color="#111" />
          </Pressable>
        }
        trailing={
          <Pressable className="p-2"><IconShield size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView className="flex-1 px-5 pt-2 pb-4">
        <Text
          className="text-[12px] text-navy mb-1.5"
          style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: 0.5 }}
        >
          배심원 호출
        </Text>
        <Text
          className="text-[22px] text-[#111]"
          style={{
            fontFamily: 'Pretendard-SemiBold',
            letterSpacing: -0.5,
            lineHeight: 29,
          }}
        >
          이 글, 같은 학과 학생들의{'\n'}판단이 필요합니다
        </Text>
        <Text
          className="text-[13px] text-[#6B7280] mt-2"
          style={{ lineHeight: 21 }}
        >
          신고가 누적되어 같은 학과 학생 30명에게 검토를 요청했어요.
          24시간 안에 한 표 부탁드려요.
        </Text>

        {/* Reported preview */}
        <View className="mt-5 border border-[#E5E7EB] rounded-xl p-4">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Pill tone="plain">자유</Pill>
            <Text className="text-[11.5px] text-[#9CA3AF]">익명 · 1시간 전</Text>
            <View
              className="ml-auto rounded px-1.5 py-0.5"
              style={{ backgroundColor: '#FFF4EE' }}
            >
              <Text style={{ color: '#9A3412' }} className="text-[11px]">
                신고 5
              </Text>
            </View>
          </View>
          <Text
            className="text-[14.5px] text-[#111] mb-1"
            style={{
              fontFamily: 'Pretendard-SemiBold',
              letterSpacing: -0.2,
              lineHeight: 19,
            }}
          >
            중간고사 기간 도서관 운영시간 진짜 너무함
          </Text>
          <Text
            numberOfLines={4}
            className="text-[13px] text-[#374151]"
            style={{ lineHeight: 21 }}
          >
            매번 시험 기간만 되면 운영시간 줄이는 거 진짜 이해가 안 갑니다.
            학생회는 뭐 하나요? 지금까지 별다른 입장도 없고, 이런 식이면
            학생회비 왜 내는지 모르겠어요.
          </Text>
        </View>

        {/* Counter */}
        <View className="mt-5">
          <View className="flex-row items-baseline gap-2">
            <BouncingCount value={responded} />
            <Text className="text-[14px] text-[#6B7280]">/ 30명 응답</Text>
            <Text className="ml-auto text-[12px] text-[#9CA3AF]">남은 시간 18시간</Text>
          </View>
          <ProgressBar pct={pct} />
        </View>

        {/* Rule */}
        <View
          className="mt-5 px-4 py-3 rounded-lg"
          style={{ backgroundColor: '#F8F9FA' }}
        >
          <Text className="text-[12px] text-[#6B7280]" style={{ lineHeight: 19 }}>
            판단 기준은 학과별로 정한 자치 규정을 따릅니다.{'\n'}
            기록은 내 프로필 → 배심원 기록에서 확인할 수 있어요.
          </Text>
        </View>

        {voted && (
          <View
            className="mt-4 px-4 py-3 rounded-lg flex-row items-center gap-2"
            style={{ backgroundColor: '#E8E8F2' }}
          >
            <IconCheck size={16} color="#000080" />
            <Text className="text-[13px] text-navy flex-1">
              의견을 등록했어요. 결과는 응답이 모이면 알려드릴게요.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Two big actions */}
      <View className="px-4 pt-3 pb-4 border-t border-[#F0F0F0] flex-row gap-2.5">
        <Pressable
          onPress={() => setVoted('ok')}
          disabled={!!voted}
          className={`flex-1 h-12 rounded-lg border items-center justify-center ${
            voted === 'ok'
              ? 'bg-navy border-navy'
              : voted
              ? 'bg-[#F3F4F6] border-[#F3F4F6]'
              : 'bg-white border-[#E5E7EB] active:bg-[#F9FAFB]'
          }`}
        >
          <Text
            className="text-[14.5px]"
            style={{
              color: voted === 'ok' ? '#FFFFFF' : voted ? '#9CA3AF' : '#111111',
              fontFamily: 'Pretendard-SemiBold',
            }}
          >
            문제 없음
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setVoted('issue')}
          disabled={!!voted}
          className={`flex-1 h-12 rounded-lg items-center justify-center ${
            voted === 'issue'
              ? 'bg-navy'
              : voted
              ? 'bg-[#F3F4F6]'
              : 'bg-navy active:opacity-90'
          }`}
        >
          <Text
            className="text-[14.5px]"
            style={{
              color: voted && voted !== 'issue' ? '#9CA3AF' : '#FFFFFF',
              fontFamily: 'Pretendard-SemiBold',
            }}
          >
            문제 있음
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function BouncingCount({ value }: { value: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSequence(
      withTiming(4, { duration: 0 }),
      withTiming(0, { duration: 220 }),
    );
    opacity.value = withSequence(
      withTiming(0.5, { duration: 0 }),
      withTiming(1, { duration: 220 }),
    );
  }, [value, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        animatedStyle,
        {
          fontSize: 26,
          color: '#000080',
          fontFamily: 'Pretendard-Bold',
          letterSpacing: -0.5,
        },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const width = useSharedValue(pct);
  useEffect(() => {
    width.value = withTiming(pct, { duration: 220 });
  }, [pct, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View className="mt-2 h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
      <Animated.View style={style} className="h-full bg-navy" />
    </View>
  );
}
