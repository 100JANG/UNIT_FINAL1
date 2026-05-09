import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Avatar,
  IconBack,
  IconSearch,
  IconCheck,
} from '../components/shared';

type Friend = {
  name: string; dept: string; mut: number;
  st: 'add' | 'sent' | 'friend';
};

const LIST: Friend[] = [
  { name: '김민수', dept: '소프트웨어학과 22', mut: 4, st: 'add' },
  { name: '이서윤', dept: '경영학과 23',       mut: 2, st: 'add' },
  { name: '박지호', dept: '소프트웨어학과 22', mut: 7, st: 'sent' },
  { name: '정유진', dept: '디자인학과 24',     mut: 1, st: 'add' },
  { name: '최도윤', dept: '전자공학과 21',     mut: 3, st: 'friend' },
];

export default function FriendsScreen() {
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
              친구찾기
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
        }
      />

      <ScrollView className="flex-1">
        <View className="px-4 pt-3 pb-2">
          <View className="flex-row items-center gap-2 h-10 px-3.5 rounded-lg bg-[#F3F4F6]">
            <IconSearch size={18} color="#9CA3AF" />
            <Text className="text-[13.5px] text-[#9CA3AF]">
              학번, 이름, 학과로 검색
            </Text>
          </View>
        </View>
        <Text className="px-4 pt-2 pb-2 text-[12px] text-[#9CA3AF]">
          같은 학과 · 알 수도 있는 친구
        </Text>
        {LIST.map((p, i) => (
          <View
            key={i}
            className="px-4 py-3 flex-row items-center gap-3 border-b border-[#F0F0F0]"
          >
            <Avatar name={p.name} size={42} />
            <View className="flex-1 min-w-0">
              <Text
                className="text-[14px] text-[#111]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                {p.name}
              </Text>
              <Text className="text-[12px] text-[#6B7280] mt-0.5">
                {p.dept} · 함께 아는 친구 {p.mut}
              </Text>
            </View>
            <FriendAction st={p.st} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function FriendAction({ st }: { st: Friend['st'] }) {
  if (st === 'add') {
    return (
      <Pressable className="h-8 px-3 rounded-md bg-navy items-center justify-center">
        <Text
          className="text-white text-[12.5px]"
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          친구추가
        </Text>
      </Pressable>
    );
  }
  if (st === 'sent') {
    return (
      <Pressable className="h-8 px-3 rounded-md bg-[#F3F4F6] items-center justify-center">
        <Text className="text-[#6B7280] text-[12.5px]">신청 중</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      className="h-8 px-3 rounded-md flex-row items-center gap-1"
      style={{ borderWidth: 1, borderColor: '#E5E7EB' }}
    >
      <IconCheck size={13} color="#374151" />
      <Text className="text-[#374151] text-[12.5px]">친구</Text>
    </Pressable>
  );
}
