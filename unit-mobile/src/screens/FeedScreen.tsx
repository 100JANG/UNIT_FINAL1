import { useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppBar,
  Pill,
  IconSearch,
  IconBell,
  IconChevDn,
  IconThumb,
  IconMsg,
  IconBookmark,
} from '../components/shared';
import { POSTS, type Post } from '../data/posts';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCOPES = ['통합', '내학교', '내학과'] as const;
const SORTS = ['최신순', '인기순', '댓글순'] as const;

export default function FeedScreen() {
  const [scope, setScope] = useState(0);
  const [sort] = useState(0);
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <AppBar
        leading={
          <Text
            numberOfLines={1}
            className="text-[17px] text-[#111] px-1 -ml-1"
            style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3 }}
          >
            아주대학교
          </Text>
        }
        trailing={
          <>
            <Pressable className="p-2"><IconSearch size={20} color="#333" /></Pressable>
            <Pressable
              className="p-2"
              onPress={() => navigation.navigate('Notifications')}
            >
              <IconBell size={20} color="#333" />
            </Pressable>
          </>
        }
        divider={false}
      />

      {/* Scope tabs (sticky-style: just above the list) */}
      <View className="flex-row items-center px-4 border-b border-[#E5E7EB] bg-white">
        {SCOPES.map((s, i) => {
          const on = scope === i;
          return (
            <Pressable
              key={s}
              onPress={() => setScope(i)}
              className="relative h-12 px-4 justify-center"
            >
              <Text
                className={`text-[14.5px] ${on ? 'text-[#111]' : 'text-[#9CA3AF]'}`}
                style={{
                  fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard',
                  letterSpacing: -0.2,
                }}
              >
                {s}
              </Text>
              {on && (
                <View className="absolute left-3 right-3 bottom-0 h-[2.5px] bg-[#111]" />
              )}
            </Pressable>
          );
        })}
        <Pressable className="ml-auto flex-row items-center gap-0.5 px-2 py-1">
          <Text className="text-[12.5px] text-[#6B7280]">{SORTS[sort]}</Text>
          <IconChevDn size={12} color="#6B7280" />
        </Pressable>
      </View>

      {/* Post list */}
      <FlatList
        data={POSTS}
        keyExtractor={(p) => p.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            p={item}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 16 }}
        style={{ backgroundColor: '#F4F5F7' }}
      />
    </SafeAreaView>
  );
}

function PostCard({ p, onPress }: { p: Post; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3.5 active:bg-[#F9FAFB]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center gap-1.5 mb-2">
        <Pill tone="plain">{p.board}</Pill>
        <Text className="text-[12px] text-[#9CA3AF]">{p.nick} · {p.time}</Text>
      </View>
      <Text
        numberOfLines={2}
        className="text-[16px] text-[#111] mb-1.5"
        style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.3, lineHeight: 22 }}
      >
        {p.title}
      </Text>
      <Text
        numberOfLines={2}
        className="text-[13.5px] text-[#4B5563] mb-3"
        style={{ letterSpacing: -0.2, lineHeight: 21 }}
      >
        {p.body}
      </Text>
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1">
          <IconThumb size={13} color="#000080" />
          <Text
            className="text-[12.5px] text-navy"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {p.up}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconMsg size={13} color="#6B7280" />
          <Text className="text-[12.5px] text-[#6B7280]">{p.cmt}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconBookmark size={13} color="#6B7280" />
          <Text className="text-[12.5px] text-[#6B7280]">{p.scrap}</Text>
        </View>
      </View>
    </Pressable>
  );
}
