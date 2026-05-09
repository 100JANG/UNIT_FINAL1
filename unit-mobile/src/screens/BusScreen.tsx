import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconBack,
  IconBell,
} from '../components/shared';

type Route = {
  name: string; next: string; after: string; live: string; n: string;
};

const ROUTES: Route[] = [
  { name: '캠퍼스 ↔ 인천역', next: '3분',     after: '23분',       live: 'ETA 09:48', n: '101' },
  { name: '캠퍼스 ↔ 송도',   next: '12분',    after: '32분',       live: 'ETA 09:57', n: '202' },
  { name: '캠퍼스 ↔ 부평역', next: '운행종료', after: '내일 07:30', live: '운행 종료', n: '303' },
  { name: '교내 순환',       next: '5분',     after: '15분',       live: 'ETA 09:50', n: '순환' },
];

export default function BusScreen() {
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
              셔틀버스
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconBell size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView className="flex-1">
        <View className="px-4 pt-3 pb-2">
          <Text className="text-[11.5px] text-[#9CA3AF]">현재 위치</Text>
          <Text
            className="text-[14px] text-[#111]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            인하대학교 정문 · 09:45
          </Text>
        </View>

        {ROUTES.map((r, i) => (
          <View
            key={i}
            className={`px-4 py-4 ${
              i < ROUTES.length - 1 ? 'border-b border-[#F0F0F0]' : ''
            }`}
          >
            <View className="flex-row items-center gap-2 mb-1.5">
              <Pill tone="navySolid">{r.n}</Pill>
              <Text
                className="text-[14.5px] text-[#111]"
                style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.2 }}
              >
                {r.name}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-[11.5px] text-[#9CA3AF]">다음 도착</Text>
                <Text
                  className="text-[20px] text-navy mt-0.5"
                  style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.5 }}
                >
                  {r.next}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11.5px] text-[#9CA3AF]">그 다음</Text>
                <Text className="text-[14px] text-[#374151] mt-1">{r.after}</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-[11.5px] text-[#9CA3AF]">실시간</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <PulseDot color="#1F7A5C" />
                  <Text className="text-[12px] text-mint">{r.live}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PulseDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[style, { width: 6, height: 6, borderRadius: 3, backgroundColor: color }]}
    />
  );
}
