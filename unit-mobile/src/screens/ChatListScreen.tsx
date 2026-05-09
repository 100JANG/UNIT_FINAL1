import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AppBar,
  Avatar,
  IconSearch,
  IconPlus,
} from '../components/shared';
import { CHATS, type Chat } from '../data/chats';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TabId = 'on' | 'done';

export default function ChatListScreen() {
  const [tab, setTab] = useState<TabId>('on');
  const navigation = useNavigation<Nav>();

  const tabs = useMemo(
    () => [
      { id: 'on'   as const, l: '진행중',   list: CHATS.filter((c) => !c.done) },
      { id: 'done' as const, l: '대화 완료', list: CHATS.filter((c) =>  c.done) },
    ],
    [],
  );
  const cur = tabs.find((t) => t.id === tab)!;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <AppBar
        title="채팅"
        trailing={
          <>
            <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
            <Pressable className="p-2"><IconPlus size={20} color="#000080" /></Pressable>
          </>
        }
        divider={false}
      />

      <View className="flex-row items-center px-4 border-b border-[#F0F0F0]">
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              className="relative h-11 px-3.5 flex-row items-center gap-1.5 justify-center"
            >
              <Text
                className={`text-[14px] ${on ? 'text-[#111]' : 'text-[#9CA3AF]'}`}
                style={{ fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard' }}
              >
                {t.l}
              </Text>
              <Text className="text-[12px] text-[#9CA3AF]">{t.list.length}</Text>
              {on && <View className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]" />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1">
        {cur.list.map((c) => (
          <ChatRow
            key={c.id}
            c={c}
            onPress={() => navigation.navigate('ChatRoom', { chatId: c.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChatRow({ c, onPress }: { c: Chat; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 flex-row items-center gap-3 border-b border-[#F0F0F0] active:bg-[#F9FAFB]`}
      style={c.done ? { opacity: 0.7 } : undefined}
    >
      <View className="relative">
        <Avatar name={c.name} size={46} hue={c.group ? '#E8E8F2' : '#FAF8F4'} />
        {c.group && c.members != null && (
          <View
            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-navy items-center justify-center"
            style={{ borderWidth: 2, borderColor: '#FFFFFF' }}
          >
            <Text
              className="text-white text-[9px]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              {c.members}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5">
          <Text
            numberOfLines={1}
            className="text-[14.5px] text-[#111] flex-1"
            style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.2 }}
          >
            {c.name}
          </Text>
          <Text className="text-[11px] text-[#9CA3AF]">{c.time}</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-0.5">
          <Text
            numberOfLines={1}
            className="text-[12.5px] text-[#6B7280] flex-1"
          >
            {c.sub}
          </Text>
          {c.unread > 0 && (
            <View
              className="h-[18px] px-1.5 rounded-full bg-coral items-center justify-center"
              style={{ minWidth: 18 }}
            >
              <Text
                className="text-white text-[10.5px]"
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                {c.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
