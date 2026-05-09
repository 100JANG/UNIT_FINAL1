import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  IconBack,
} from '../components/shared';

type HallStatus = 'busy' | 'ok' | 'free';

type Hall = {
  name: string; total: number; used: number; st: HallStatus;
};

const HALLS: Hall[] = [
  { name: '중앙도서관 4층 제1열람실', total: 280, used: 242, st: 'busy' },
  { name: '중앙도서관 4층 제2열람실', total: 180, used: 142, st: 'busy' },
  { name: '중앙도서관 5층 제3열람실', total: 200, used: 88,  st: 'ok'   },
  { name: '공대 별관 열람실',         total: 120, used: 31,  st: 'free' },
  { name: '경영대 열람실',            total: 80,  used: 64,  st: 'busy' },
  { name: '기숙사 학습실 A',          total: 60,  used: 18,  st: 'free' },
];

const LIT: Record<HallStatus, string> = {
  busy: '#B73E37',
  ok:   '#B5882B',
  free: '#1F7A5C',
};

const LABEL: Record<HallStatus, string> = {
  busy: '혼잡', ok: '보통', free: '여유',
};

export default function LibraryScreen() {
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
              열람실
            </Text>
          </View>
        }
        trailing={
          <Pressable className="px-2 py-1.5">
            <Text className="text-[12.5px] text-[#6B7280]">2분 전 갱신</Text>
          </Pressable>
        }
      />

      <ScrollView className="flex-1">
        {HALLS.map((h, i) => {
          const remain = h.total - h.used;
          const pct = (h.used / h.total) * 100;
          return (
            <View key={i} className="px-4 py-3.5 border-b border-[#F0F0F0]">
              <View className="flex-row items-baseline gap-2 mb-1.5">
                <Text
                  className="text-[14.5px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.2 }}
                >
                  {h.name}
                </Text>
                <Text
                  className="ml-auto text-[20px]"
                  style={{
                    color: LIT[h.st],
                    fontFamily: 'Pretendard-SemiBold',
                    letterSpacing: -0.5,
                  }}
                >
                  {remain}
                </Text>
                <Text className="text-[12px] text-[#9CA3AF]">/ {h.total}석</Text>
              </View>
              <View className="h-[6px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <View
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: LIT[h.st] }}
                />
              </View>
              <Text className="mt-1.5 text-[11.5px] text-[#9CA3AF]">
                {LABEL[h.st]} · 잔여 {remain}석
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
