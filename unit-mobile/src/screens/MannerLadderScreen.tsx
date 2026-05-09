import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconBack,
} from '../components/shared';
import { GRADES, BENEFITS, type GradeId } from '../data/manner';

const MY_GRADE: GradeId = 'B0';

const SCORE_RULES = [
  { sign: '+', c: '#1F7A5C', t: '추천 댓글 10개 받기',     p: '+1' },
  { sign: '+', c: '#1F7A5C', t: '강의평·정보글 작성',        p: '+2' },
  { sign: '+', c: '#1F7A5C', t: '배심원 판단 일치',          p: '+1' },
  { sign: '−', c: '#B73E37', t: '신고 반영 (욕설·도배)',     p: '−5' },
  { sign: '−', c: '#B73E37', t: '거래 약속 불이행',          p: '−3' },
  { sign: '−', c: '#B73E37', t: '허위 정보',                 p: '−10' },
];

export default function MannerLadderScreen() {
  const navigation = useNavigation();
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
              매너 학점별 혜택
            </Text>
          </View>
        }
      />

      <ScrollView className="flex-1">
        {/* Score rules */}
        <View
          className="mx-4 mt-4 mb-3 p-4 rounded-xl"
          style={{ backgroundColor: '#F4F4FB', borderWidth: 1, borderColor: '#DDDDF1' }}
        >
          <Text
            className="text-[12.5px] text-navy mb-1"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            점수 반영 기준
          </Text>
          <Text
            className="text-[12px] text-[#374151] mb-3"
            style={{ lineHeight: 19 }}
          >
            모든 사용자는{' '}
            <Text style={{ fontFamily: 'Pretendard-Bold' }}>B0 (80점)</Text>으로 시작해요.
            아래 활동에 따라 점수가 오르내리고, 점수에 따라{' '}
            <Text style={{ fontFamily: 'Pretendard-Bold' }}>실시간으로</Text> 등급이 바뀝니다.
          </Text>
          <View className="gap-1.5">
            {SCORE_RULES.map((r, i) => (
              <View key={i} className="flex-row items-center">
                <Text
                  className="w-4 text-[12px]"
                  style={{ color: r.c, fontFamily: 'Pretendard-SemiBold' }}
                >
                  {r.sign}
                </Text>
                <Text className="flex-1 text-[12px] text-[#374151]">{r.t}</Text>
                <Text
                  className="text-[12px]"
                  style={{ color: r.c, fontFamily: 'Pretendard-SemiBold' }}
                >
                  {r.p}
                </Text>
              </View>
            ))}
          </View>
          <View
            className="mt-3 pt-2.5"
            style={{ borderTopWidth: 1, borderTopColor: '#DDDDF1' }}
          >
            <Text
              className="text-[11px] text-[#6B7280]"
              style={{ lineHeight: 16.5 }}
            >
              기준은 학생회·운영진이 함께 정하고, 분기마다 공개 검토해요.
              모든 점수 변동은{' '}
              <Text style={{ fontFamily: 'Pretendard-Bold' }}>내 매너 학점</Text>{' '}
              페이지의 변동 내역에서 확인할 수 있어요.
            </Text>
          </View>
        </View>

        <Text
          className="px-4 pb-1.5 text-[11.5px] text-[#9CA3AF]"
          style={{ fontFamily: 'Pretendard-Medium', letterSpacing: 0.5 }}
        >
          등급별 혜택
        </Text>

        {GRADES.map((g) => {
          const me = g.id === MY_GRADE;
          return (
            <View
              key={g.id}
              className="border-b border-[#F0F0F0] flex-row"
            >
              <View style={{ backgroundColor: g.accent, width: 6 }} />
              <View
                className="flex-1 flex-row gap-4 px-4 py-4"
                style={{ backgroundColor: me ? g.tone : 'transparent' }}
              >
                <View
                  className="rounded-lg py-2 items-center"
                  style={{ width: 64, backgroundColor: g.tone }}
                >
                  <Text
                    style={[
                      {
                        color: g.accent,
                        fontFamily: 'Pretendard-Bold',
                        fontSize: 34,
                        letterSpacing: -1,
                        lineHeight: 34,
                      },
                      includeFontPadding,
                    ]}
                  >
                    {g.id}
                  </Text>
                  <Text
                    className="text-[10px] text-[#6B7280] mt-1"
                    style={{ fontFamily: 'Pretendard' }}
                  >
                    ≥{g.min}점
                  </Text>
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text
                      className="text-[14px] text-[#111]"
                      style={{ fontFamily: 'Pretendard-SemiBold' }}
                    >
                      {g.label}
                    </Text>
                    {me && <Pill tone="navySolid">내 등급</Pill>}
                  </View>
                  <Text className="text-[12px] text-[#6B7280] mb-2">{g.desc}</Text>
                  <View className="gap-0.5">
                    {BENEFITS[g.id].map((b, i) => (
                      <View key={i} className="flex-row items-start gap-1.5">
                        <Text className="text-[#9CA3AF] mt-1 text-[12.5px]">·</Text>
                        <Text className="flex-1 text-[12.5px] text-[#374151]">
                          {b}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
