import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import {
  AppBar,
  IconSearch,
  IconCal,
  IconFork,
  IconBus,
  IconChair,
  IconPhone,
  IconTrophy,
  IconBriefcase,
  IconTag,
  IconFriend,
} from '../components/shared';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function IconStar({ size = 22, color = '#000080' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.3 9.4l6-.9L12 3Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type ServiceTarget =
  | 'Courses' | 'Timetable' | 'Meal' | 'Bus' | 'Library'
  | 'Contacts' | 'Contest' | 'Jobs' | 'Market' | 'Friends';

type Service = {
  id: ServiceTarget;
  l: string;
  Icon: (p: { size?: number; color?: string }) => React.ReactElement;
};

const SERVICES: Service[] = [
  { id: 'Timetable', l: '시간표',     Icon: IconCal },
  { id: 'Courses',   l: '강의평',     Icon: IconStar },
  { id: 'Meal',      l: '식단표',     Icon: IconFork },
  { id: 'Bus',       l: '셔틀버스',   Icon: IconBus },
  { id: 'Library',   l: '열람실',     Icon: IconChair },
  { id: 'Contacts',  l: '교내 연락처', Icon: IconPhone },
  { id: 'Contest',   l: '공모전',     Icon: IconTrophy },
  { id: 'Jobs',      l: '알바',       Icon: IconBriefcase },
  { id: 'Market',    l: '중고장터',   Icon: IconTag },
  { id: 'Friends',   l: '친구찾기',   Icon: IconFriend },
];

const QUICK = [
  { l: '중도 4층', v: '잔여 38석', c: '#1F7A5C' },
  { l: '셔틀',    v: '3분 후',    c: '#000080' },
  { l: '학식 점심', v: '제육덮밥', c: '#6B4F2E' },
];

export default function CampusHubScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#FAF8F4]">
      <View className="bg-white">
        <AppBar
          title="캠퍼스"
          trailing={
            <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
          }
          divider={false}
        />
      </View>

      <ScrollView className="flex-1">
        {/* Today card */}
        <View className="mx-4 mt-2 mb-3 p-4 rounded-xl bg-white border border-[#F0F0F0]">
          <Text className="text-[11.5px] text-[#9CA3AF] mb-1">
            오늘 · 5월 12일 화요일
          </Text>
          <Text
            className="text-[15px] text-[#111]"
            style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3 }}
          >
            다음 수업까지 1시간 · 데이터분석개론
          </Text>
          <Text className="text-[12px] text-[#6B7280] mt-0.5">
            하이테크관 502호 · 13:00
          </Text>

          {/* Quick stats — flex-row + flex-1 */}
          <View className="mt-3 flex-row gap-2">
            {QUICK.map((q, i) => (
              <View
                key={i}
                className="flex-1 px-2.5 py-2 rounded-md items-center"
                style={{ backgroundColor: '#FAF8F4' }}
              >
                <Text className="text-[10.5px] text-[#9CA3AF]">{q.l}</Text>
                <Text
                  className="text-[14px] mt-0.5"
                  style={{ color: q.c, fontFamily: 'Pretendard-SemiBold' }}
                >
                  {q.v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Services 4-col grid */}
        <View className="bg-white mx-4 rounded-xl border border-[#F0F0F0] p-2 flex-row flex-wrap mb-5">
          {SERVICES.map((s) => {
            const { Icon } = s;
            return (
              <Pressable
                key={s.id}
                onPress={() => navigation.navigate(s.id as never)}
                className="items-center gap-1.5 py-3 px-1 active:bg-[#F9FAFB] rounded-lg"
                style={{ width: '25%' }}
              >
                <View className="w-10 h-10 rounded-full bg-[#F3F4F6] items-center justify-center">
                  <Icon size={20} color="#000080" />
                </View>
                <Text
                  className="text-[11.5px] text-[#111]"
                  style={{ letterSpacing: -0.2 }}
                >
                  {s.l}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
