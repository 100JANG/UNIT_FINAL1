import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  IconBack,
  IconMore,
} from '../components/shared';

const DAYS = ['월', '화', '수', '목', '금'];
const TIMES = ['9', '10', '11', '12', '13', '14', '15', '16', '17'];
const ROW = 50;
const TIME_COL = 36;

type Block = {
  d: number; s: number; e: number; name: string; room: string; color: string;
};

const BLOCKS: Block[] = [
  { d: 0, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
  { d: 1, s: 13, e: 15, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
  { d: 1, s: 10, e: 12, name: '경영학원론',     room: '인경 305',   color: '#6B4F2E' },
  { d: 2, s: 14, e: 16, name: '한국근현대사',   room: '문과대 401', color: '#1F7A5C' },
  { d: 3, s: 9,  e: 11, name: '데이터분석개론', room: '하이텍 502', color: '#000080' },
  { d: 3, s: 13, e: 14, name: '체육 (배드민턴)', room: '체육관',     color: '#B73E37' },
  { d: 4, s: 10, e: 12, name: '선형대수',       room: '자연대 207', color: '#B5882B' },
];

export default function TimetableScreen() {
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
              시간표
            </Text>
          </View>
        }
        trailing={
          <>
            <Pressable className="px-2"><Text className="text-[12.5px] text-[#6B7280]">2025-1</Text></Pressable>
            <Pressable className="p-2"><IconMore size={20} color="#333" /></Pressable>
          </>
        }
      />

      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[0]}
      >
        {/* Day header */}
        <View className="flex-row border-b border-[#E5E7EB] bg-white">
          <View style={{ width: TIME_COL }} />
          {DAYS.map((d) => (
            <View key={d} className="flex-1 py-2 items-center">
              <Text
                className="text-[12px] text-[#6B7280]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <View>
          <Grid />
          {BLOCKS.map((b, idx) => (
            <BlockCell key={idx} b={b} />
          ))}
        </View>

        <View className="px-4 py-4">
          <Text className="text-[12px] text-[#9CA3AF]">
            공강: 월 13~17 · 수 9~14 · 금 13~17
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Grid() {
  return (
    <>
      {TIMES.map((t) => (
        <View key={t} className="flex-row" style={{ height: ROW }}>
          <View
            style={{ width: TIME_COL }}
            className="pt-1 pr-1.5 items-end"
          >
            <Text className="text-[10.5px] text-[#9CA3AF]">{t}</Text>
          </View>
          {DAYS.map((_, di) => (
            <View
              key={di}
              className="flex-1"
              style={{
                borderLeftWidth: 1,
                borderTopWidth: 1,
                borderColor: '#F0F0F0',
              }}
            />
          ))}
        </View>
      ))}
    </>
  );
}

function BlockCell({ b }: { b: Block }) {
  const dayCols = DAYS.length;
  const top = (b.s - 9) * ROW;
  const height = (b.e - b.s) * ROW;
  // total widths: TIME_COL + flex(rest). Each day column takes (100% - TIME_COL)/dayCols.
  // Use absolute positioning with percentage-based leftOffset.
  return (
    <View
      style={{
        position: 'absolute',
        top,
        left: TIME_COL,
        right: 0,
        height,
        flexDirection: 'row',
      }}
      pointerEvents="none"
    >
      {Array.from({ length: dayCols }).map((_, i) => {
        if (i !== b.d) return <View key={i} className="flex-1" />;
        return (
          <View
            key={i}
            className="flex-1 p-2"
            style={{
              backgroundColor: b.color,
              borderTopColor: 'rgba(255,255,255,0.15)',
              borderTopWidth: 1,
              borderLeftColor: 'rgba(255,255,255,0.15)',
              borderLeftWidth: 1,
            }}
          >
            <Text
              className="text-white text-[11px]"
              style={{ fontFamily: 'Pretendard-SemiBold', lineHeight: 14 }}
            >
              {b.name}
            </Text>
            <Text
              className="text-white text-[10.5px] mt-0.5"
              style={{ opacity: 0.8 }}
            >
              {b.room}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
