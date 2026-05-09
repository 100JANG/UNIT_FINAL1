import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  IconBack,
  IconSearch,
  IconPhone,
} from '../components/shared';

type Group = {
  name: string;
  items: { l: string; tel: string }[];
};

const GROUPS: Group[] = [
  {
    name: '학사 · 행정',
    items: [
      { l: '교무처',     tel: '032-860-7000' },
      { l: '학생지원처', tel: '032-860-7100' },
      { l: '국제처',     tel: '032-860-7250' },
    ],
  },
  {
    name: '학과 사무실',
    items: [
      { l: '소프트웨어학과', tel: '032-860-7390' },
      { l: '경영학과',       tel: '032-860-7710' },
      { l: '사학과',         tel: '032-860-8030' },
    ],
  },
  {
    name: '시설 · 안전',
    items: [
      { l: '도서관 안내',  tel: '032-860-7610' },
      { l: '캠퍼스 보안', tel: '032-860-9112' },
      { l: '보건진료소',  tel: '032-860-7800' },
    ],
  },
];

export default function ContactsScreen() {
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
              교내 연락처
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView className="flex-1" style={{ backgroundColor: '#FAF8F4' }}>
        {GROUPS.map((g, i) => (
          <View key={i} className="px-6 pt-5">
            <Text
              className="text-[11.5px] text-[#9CA3AF] mb-2"
              style={{ letterSpacing: 0.5 }}
            >
              {g.name.toUpperCase()}
            </Text>
            <View className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
              {g.items.map((it, j) => (
                <View
                  key={j}
                  className={`px-5 py-3.5 flex-row items-center justify-between ${
                    j < g.items.length - 1 ? 'border-b border-[#F0F0F0]' : ''
                  }`}
                >
                  <View>
                    <Text className="text-[14px] text-[#111]">{it.l}</Text>
                    <Text className="text-[12px] text-[#6B7280] mt-0.5">{it.tel}</Text>
                  </View>
                  <Pressable
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#E2F1EA' }}
                  >
                    <IconPhone size={16} color="#1F7A5C" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
