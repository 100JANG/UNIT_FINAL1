import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  IconBack,
  IconShield,
  IconChev,
} from '../components/shared';
import { GRADES, gradeFromScore } from '../data/manner';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCORE = 82;

const AXES = [
  { l: '친절함',   v: 88, n: '댓글·채팅 추천 비율' },
  { l: '진실성',   v: 92, n: '강의평·후기 신뢰도' },
  { l: '활동성',   v: 74, n: '최근 30일 게시 활동' },
  { l: '신고이력', v: 76, n: '누적 신고 (적을수록 ↑)' },
];

const RECENT: { d: string; delta: number; src: string; tone: 'mint' | 'warn' | 'navy' }[] = [
  { d: '오늘', delta:  2, src: '강의평이 추천 12회 받음',          tone: 'mint' },
  { d: '5/10', delta:  1, src: '댓글이 추천 5회 받음',             tone: 'mint' },
  { d: '5/8',  delta: -3, src: '댓글이 신고 2회 받음 (검토 후 차감)', tone: 'warn' },
  { d: '5/5',  delta:  1, src: '중고 거래 후기 "친절해요"',         tone: 'mint' },
  { d: '5/2',  delta:  2, src: '게시글이 베스트 선정',              tone: 'navy' },
  { d: '4/28', delta:  1, src: '배심원 투표 5회 참여',              tone: 'navy' },
];

const TONE_COLOR = { mint: '#1F7A5C', warn: '#B73E37', navy: '#000080' };

const HOW_IT_WORKS = [
  '게시글·댓글 추천 / 비추',
  '강의평·후기의 추천 비율',
  '중고 거래 후 받은 매너 칭찬',
  '신고 누적 (검토 후 차감)',
  '배심원·신고 처리에 참여',
];

export default function MannerGradeScreen() {
  const navigation = useNavigation<Nav>();
  const g = gradeFromScore(SCORE);
  const next = GRADES[GRADES.findIndex((x) => x.id === g.id) - 1] ?? g;
  const toNext = next.min - SCORE;
  const progressPct = ((SCORE - g.min) / (next.min - g.min)) * 100;

  const includeFontPadding = Platform.OS === 'android' ? { includeFontPadding: false } : {};

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
              매너 학점
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconShield size={20} color="#333" /></Pressable>
        }
        divider={false}
      />

      <ScrollView className="flex-1">
        {/* Hero */}
        <View
          className="px-5 pt-3 pb-6 border-b border-[#F0F0F0]"
          style={{ backgroundColor: '#FAF8F4' }}
        >
          <Text
            className="text-[11.5px] text-[#9CA3AF] mb-1"
            style={{ letterSpacing: 0.5 }}
          >
            MY GRADE
          </Text>
          <View className="flex-row items-end gap-4">
            <Text
              style={[
                {
                  color: g.accent,
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 88,
                  letterSpacing: -3,
                  lineHeight: 88,
                },
                includeFontPadding,
              ]}
            >
              {g.id}
            </Text>
            <View className="pb-2">
              <Text
                className="text-[14px] text-[#111]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                {g.label}
              </Text>
              <Text className="text-[12px] text-[#6B7280] mt-0.5">{g.desc}</Text>
            </View>
            <View className="ml-auto pb-2">
              <Text className="text-[11px] text-[#9CA3AF] text-right">SCORE</Text>
              <View className="flex-row items-baseline justify-end mt-1">
                <Text
                  style={[
                    {
                      fontSize: 28,
                      color: '#111',
                      fontFamily: 'Pretendard-SemiBold',
                      letterSpacing: -0.6,
                      lineHeight: 28,
                    },
                    includeFontPadding,
                  ]}
                >
                  {SCORE}
                </Text>
                <Text className="text-[14px] text-[#9CA3AF]"> / 100</Text>
              </View>
            </View>
          </View>

          {/* progress to next */}
          <View className="mt-5">
            <View className="flex-row items-baseline justify-between mb-1.5">
              <Text className="text-[11.5px] text-[#6B7280]">
                다음 등급{' '}
                <Text
                  className="text-[#111]"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {next.id}
                </Text>
                까지
              </Text>
              <Text className="text-[11.5px]">
                <Text
                  style={{ color: g.accent, fontFamily: 'Pretendard-Bold' }}
                >
                  +{toNext}
                </Text>
                <Text className="text-[#111]">점</Text>
              </Text>
            </View>
            <View
              className="h-[8px] rounded-full overflow-hidden bg-white"
              style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
            >
              <View
                className="h-full"
                style={{ width: `${progressPct}%`, backgroundColor: g.accent }}
              />
            </View>
          </View>
        </View>

        {/* 4 axis */}
        <View className="px-5 py-5 border-b border-[#F0F0F0]">
          <View className="flex-row items-baseline justify-between mb-3">
            <Text
              className="text-[14px] text-[#111]"
              style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.2 }}
            >
              평가 항목
            </Text>
            <Text className="text-[11.5px] text-[#9CA3AF]">최근 90일</Text>
          </View>
          <View className="gap-3">
            {AXES.map((a) => (
              <View key={a.l}>
                <View className="flex-row items-baseline justify-between mb-1">
                  <View className="flex-row items-baseline gap-2">
                    <Text
                      className="text-[13.5px] text-[#111]"
                      style={{ fontFamily: 'Pretendard-SemiBold' }}
                    >
                      {a.l}
                    </Text>
                    <Text className="text-[11px] text-[#9CA3AF]">{a.n}</Text>
                  </View>
                  <Text
                    className="text-[13px] text-[#111]"
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    {a.v}
                  </Text>
                </View>
                <View className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
                  <View
                    className="h-full bg-navy"
                    style={{ width: `${a.v}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent */}
        <View className="px-5 py-5 border-b border-[#F0F0F0]">
          <Text
            className="text-[14px] text-[#111] mb-3"
            style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.2 }}
          >
            최근 변동
          </Text>
          <View className="gap-3">
            {RECENT.map((r, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <Text className="text-[11px] text-[#9CA3AF] pt-0.5 w-[58px]">
                  {r.d}
                </Text>
                <Text
                  style={{
                    color: TONE_COLOR[r.tone],
                    fontFamily: 'Pretendard-SemiBold',
                    width: 34,
                  }}
                  className="text-[13px]"
                >
                  {r.delta > 0 ? `+${r.delta}` : r.delta}
                </Text>
                <Text
                  className="flex-1 text-[12.5px] text-[#374151]"
                  style={{ lineHeight: 18 }}
                >
                  {r.src}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <Pressable
          onPress={() => navigation.navigate('MannerLadder')}
          className="w-full px-5 py-4 flex-row items-center justify-between active:bg-[#F9FAFB]"
        >
          <View>
            <Text
              className="text-[13.5px] text-[#111]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              9등급 사다리 · 혜택 보기
            </Text>
            <Text className="text-[11.5px] text-[#9CA3AF] mt-0.5">
              A+부터 F까지 등급별 권한과 제한
            </Text>
          </View>
          <IconChev size={18} color="#9CA3AF" />
        </Pressable>

        {/* How it works */}
        <View
          className="px-5 py-5 border-t border-[#F0F0F0]"
          style={{ backgroundColor: '#FAF8F4' }}
        >
          <Text
            className="text-[13px] text-[#111] mb-2"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            점수는 이렇게 매겨져요
          </Text>
          <View className="gap-1">
            {HOW_IT_WORKS.map((b, i) => (
              <View key={i} className="flex-row items-start">
                <Text className="text-[12px] text-[#6B7280] mr-1.5">·</Text>
                <Text
                  className="text-[12px] text-[#6B7280] flex-1"
                  style={{ lineHeight: 20 }}
                >
                  {b}
                </Text>
              </View>
            ))}
          </View>
          <Text
            className="text-[11.5px] text-[#9CA3AF] mt-3"
            style={{ lineHeight: 18 }}
          >
            신규 가입 시 B0(80점)으로 시작합니다. 정지 처분을 받으면
            기존 등급과 무관하게 F로 초기화돼요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
