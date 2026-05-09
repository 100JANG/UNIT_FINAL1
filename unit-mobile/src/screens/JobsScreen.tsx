import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Pill,
  IconBack,
  IconSearch,
  IconCal,
} from '../components/shared';

type Item = {
  tag: string; title: string; wage: string;
  dist: string; days: string; hours: string; hot: boolean;
};

const ITEMS: Item[] = [
  { tag: '캠퍼스내', title: '주말 바리스타',           wage: '시급 12,000원',  dist: '0.2km', days: '토일',     hours: '09:00~18:00', hot: true },
  { tag: '과외',     title: '중3 영어',                wage: '회당 60,000원',  dist: '3.4km', days: '월수',     hours: '19:00~21:00', hot: false },
  { tag: '단기',     title: '컨퍼런스 운영 보조',      wage: '일급 110,000원', dist: '8.7km', days: '5/24~5/26', hours: '08:30~18:00', hot: true },
  { tag: '재택',     title: '대학생 설문조사 검토',    wage: '건당 8,000원',   dist: '재택', days: '자유',     hours: '자유',         hot: false },
  { tag: '캠퍼스내', title: '학생회관 카페 평일',      wage: '시급 11,500원',  dist: '0.3km', days: '월~금',    hours: '12:00~17:00', hot: false },
];

export default function JobsScreen() {
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
              알바
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView className="flex-1">
        {ITEMS.map((it, i) => (
          <Pressable
            key={i}
            className={`px-4 py-4 active:bg-[#F9FAFB] ${
              i < ITEMS.length - 1 ? 'border-b border-[#F0F0F0]' : ''
            }`}
          >
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Pill tone="navy">{it.tag}</Pill>
              <Text className="text-[11.5px] text-[#9CA3AF]">{it.dist}</Text>
              {it.hot && (
                <View className="ml-auto">
                  <Pill tone="warn">급구</Pill>
                </View>
              )}
            </View>
            <Text
              className="text-[15px] text-[#111] mb-1.5"
              style={{
                fontFamily: 'Pretendard-SemiBold',
                letterSpacing: -0.3,
                lineHeight: 20,
              }}
            >
              {it.title}
            </Text>
            <Text
              className="text-[13px] text-navy mb-1.5"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              {it.wage}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1">
                <IconCal size={13} color="#6B7280" />
                <Text className="text-[12px] text-[#6B7280]">{it.days}</Text>
              </View>
              <Text className="text-[12px] text-[#E5E7EB]">·</Text>
              <Text className="text-[12px] text-[#6B7280]">{it.hours}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
