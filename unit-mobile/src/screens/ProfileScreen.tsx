import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Avatar,
  IconMore,
  IconChev,
} from '../components/shared';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATS = [
  { n: 18,  l: '작성' },
  { n: 124, l: '댓글' },
  { n: 326, l: '받은 추천' },
];

const SCOPE_OPTS = [
  { id: 'dept',    l: '같은 학과만',   sub: '소프트웨어학과 22 학생에게만 노출' },
  { id: 'friends', l: '친구의 친구만', sub: '내 친구와 1촌인 학생까지 노출' },
  { id: 'all',     l: '전체 공개',     sub: '같은 학교의 모든 학생에게 노출' },
] as const;

const MENU = [
  { l: '내 활동', sub: '내가 쓴 글, 댓글' },
  { l: '스크랩', sub: '47개' },
  { l: '내가 쓴 강의평', sub: '6개' },
  { l: '배심원 기록', sub: '참여 9건' },
];

export default function ProfileScreen() {
  const [findable, setFindable] = useState(true);
  const [scope, setScope] = useState<typeof SCOPE_OPTS[number]['id']>('dept');
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#FAF8F4]">
      <View className="bg-white">
        <AppBar
          title="나"
          trailing={
            <Pressable className="p-2">
              <IconMore size={20} color="#333" />
            </Pressable>
          }
          divider={false}
        />
      </View>

      <ScrollView className="flex-1">
        {/* Hero */}
        <View className="bg-white px-5 pt-4 pb-5 border-b border-[#F0F0F0]">
          <View className="flex-row items-center gap-3.5">
            <Avatar name="민" size={56} />
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="text-[17px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3 }}
                >
                  민서연
                </Text>
                <View
                  className="w-[22px] h-[22px] rounded items-center justify-center"
                  style={{ borderWidth: 1, borderColor: '#3461C7' }}
                >
                  <Text
                    style={{ color: '#3461C7', fontFamily: 'Pretendard-Bold' }}
                    className="text-[10px]"
                  >
                    A0
                  </Text>
                </View>
              </View>
              <Text className="text-[12.5px] text-[#6B7280] mt-0.5">
                아주대학교 · 소프트웨어학과 · 22학번
              </Text>
            </View>
            <Pressable className="px-2 py-1.5">
              <Text className="text-[12.5px] text-navy">편집</Text>
            </Pressable>
          </View>

          {/* Stats — flex-row + flex-1 instead of grid-cols-3 */}
          <View className="flex-row mt-5 pt-4 border-t border-[#F0F0F0]">
            {STATS.map((s, i) => (
              <View key={i} className="flex-1 items-center">
                <Text
                  className="text-[20px] text-[#111]"
                  style={{
                    fontFamily: 'Pretendard-SemiBold',
                    letterSpacing: -0.3,
                  }}
                >
                  {s.n}
                </Text>
                <Text className="text-[11.5px] text-[#9CA3AF] mt-0.5">{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Manner card */}
        <Pressable
          onPress={() => navigation.navigate('MannerGrade')}
          className="mt-3 mx-4 p-4 bg-white rounded-xl border border-[#F0F0F0] active:bg-[#F9FAFB]"
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[11.5px] text-[#9CA3AF]">매너 학점</Text>
            <Text className="text-[11.5px] text-[#9CA3AF]">82 / 100</Text>
          </View>
          <View className="flex-row items-baseline gap-2">
            <Text
              className="text-[28px]"
              style={{
                fontFamily: 'Pretendard-Bold',
                color: '#3461C7',
                letterSpacing: -0.6,
              }}
            >
              A0
            </Text>
            <Text className="text-[12.5px] text-[#374151]">우수 · 다음 등급 +13점</Text>
          </View>
          <View className="mt-2 h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
            <View
              className="h-full"
              style={{ width: '68%', backgroundColor: '#3461C7' }}
            />
          </View>
        </Pressable>

        {/* Privacy — replace divide-y with explicit border-b */}
        <View className="mt-3 mx-4 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <View className="px-4 py-3.5 border-b border-[#E5E7EB]">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-[14px] text-[#111]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                친구 검색 허용
              </Text>
              <PrivacyToggle on={findable} onPress={() => setFindable((v) => !v)} />
            </View>
            <Text className="text-[11.5px] text-[#6B7280]">
              학번·이름으로 다른 학생이 나를 찾을 수 있어요
            </Text>

            {findable && (
              <View className="mt-3 pt-3 border-t border-[#F0F0F0]">
                <Text className="text-[11.5px] text-[#9CA3AF] mb-1">공개 범위</Text>
                <View className="gap-2">
                  {SCOPE_OPTS.map((o) => {
                    const on = scope === o.id;
                    return (
                      <Pressable
                        key={o.id}
                        onPress={() => setScope(o.id)}
                        className={`flex-row items-start gap-2.5 p-2.5 rounded-lg border ${
                          on
                            ? 'border-navy bg-[#F4F4FB]'
                            : 'border-[#E5E7EB] bg-white'
                        }`}
                      >
                        <View
                          className="mt-0.5 w-4 h-4 rounded-full items-center justify-center"
                          style={{
                            borderWidth: 2,
                            borderColor: on ? '#000080' : '#C9CDD3',
                          }}
                        >
                          {on && (
                            <View className="w-1.5 h-1.5 rounded-full bg-navy" />
                          )}
                        </View>
                        <View className="min-w-0 flex-1">
                          <Text
                            className="text-[13.5px] text-[#111]"
                            style={{ fontFamily: 'Pretendard-Medium' }}
                          >
                            {o.l}
                          </Text>
                          <Text className="text-[11.5px] text-[#6B7280] mt-0.5">
                            {o.sub}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View className="px-4 py-3.5 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#111]">알림 수신</Text>
            <Text className="text-[12.5px] text-[#6B7280]">전체</Text>
          </View>
        </View>

        {/* Menu sections — divide-y replaced */}
        <View className="mt-3 mx-4 bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
          {MENU.map((m, i) => (
            <Pressable
              key={i}
              className={`px-4 py-3.5 flex-row items-center justify-between active:bg-[#F9FAFB] ${
                i < MENU.length - 1 ? 'border-b border-[#F0F0F0]' : ''
              }`}
            >
              <View>
                <Text className="text-[14px] text-[#111]">{m.l}</Text>
                <Text className="text-[11.5px] text-[#9CA3AF] mt-0.5">{m.sub}</Text>
              </View>
              <IconChev size={16} color="#C9CDD3" />
            </Pressable>
          ))}
        </View>

        <View className="mt-3 mx-4 bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
          <Pressable className="px-4 py-3.5 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <Text className="text-[14px] text-[#111]">설정</Text>
            <IconChev size={16} color="#C9CDD3" />
          </Pressable>
          <Pressable className="px-4 py-3.5 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#9CA3AF]">로그아웃</Text>
          </Pressable>
        </View>

        <View className="px-4 py-6">
          <Text className="text-[11px] text-[#C9CDD3] text-center">
            UNIT v0.4.2 · 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrivacyToggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const left = useSharedValue(on ? 21 : 3);
  useEffect(() => {
    left.value = withTiming(on ? 21 : 3, { duration: 180 });
  }, [on, left]);
  const knobStyle = useAnimatedStyle(() => ({ left: left.value }));

  return (
    <Pressable
      onPress={onPress}
      className="w-[44px] h-[26px] rounded-full"
      style={{ backgroundColor: on ? '#000080' : '#D1D5DB' }}
    >
      <Animated.View
        style={[
          knobStyle,
          {
            position: 'absolute',
            top: 3,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 1.5,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          },
        ]}
      />
    </Pressable>
  );
}
