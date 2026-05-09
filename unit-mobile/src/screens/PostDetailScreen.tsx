import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Avatar,
  Hairline,
  Pill,
  IconBack,
  IconMore,
  IconThumb,
  IconMsg,
  IconBookmark,
  IconShare,
  IconChevDn,
} from '../components/shared';
import { POSTS, COMMENTS } from '../data/posts';
import type { RootStackProps } from '../types';

const ACTIONS: { icon: typeof IconThumb; label: string; accent?: boolean }[] = [
  { icon: IconThumb, label: '추천 24', accent: true },
  { icon: IconMsg, label: '댓글 18' },
  { icon: IconBookmark, label: '스크랩 4' },
  { icon: IconShare, label: '공유' },
];

const TAGS = ['기숙사', '식단', '학교생활'];

export default function PostDetailScreen({ route }: RootStackProps<'PostDetail'>) {
  const navigation = useNavigation();
  const p = POSTS.find((x) => x.id === route.params.postId) ?? POSTS[0];

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <AppBar
        leading={
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
              <IconBack size={22} color="#111" />
            </Pressable>
            <Text
              className="text-[15px] text-[#111] ml-1"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              자유게시판
            </Text>
          </View>
        }
        trailing={
          <Pressable className="p-2" hitSlop={8}>
            <IconMore size={20} color="#333" />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Body */}
          <View className="px-4 pt-4 pb-3">
            <View className="flex-row items-center gap-2 mb-2">
              <Avatar name="익" size={28} />
              <View className="min-w-0">
                <Text
                  className="text-[13px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  {p.nick}
                </Text>
                <Text className="text-[11.5px] text-[#9CA3AF]">{p.time}</Text>
              </View>
              <View className="ml-auto">
                <Pill tone="plain">{p.board}</Pill>
              </View>
            </View>
            <Text
              className="text-[18px] text-[#111] mb-2"
              style={{ fontFamily: 'Pretendard-SemiBold', letterSpacing: -0.4, lineHeight: 24 }}
            >
              {p.title}
            </Text>
            <Text
              className="text-[14.5px] text-[#374151]"
              style={{ letterSpacing: -0.2, lineHeight: 25 }}
            >
              {p.body}
              {'\n\n'}
              오늘 점심 직접 가서 봤는데 메인은 진짜 그대로였어요.
              사이드만 두 가지 늘었고, 음료대는 그대로. 업체 바뀐 줄 알았는데 그건 아닌 듯.
              {'\n\n'}
              바뀐 거 직접 보신 분 후기 있으면 같이 공유해 주세요.
            </Text>
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {TAGS.map((t) => (
                <Text key={t} className="text-[12px] text-navy">
                  #{t}
                </Text>
              ))}
            </View>
          </View>
          <Hairline className="mx-4 mt-1" />

          {/* Actions */}
          <View className="flex-row items-center justify-around py-2">
            {ACTIONS.map((a, i) => {
              const Icon = a.icon;
              return (
                <Pressable
                  key={i}
                  className="flex-row items-center gap-1.5 px-3 py-1.5"
                >
                  <Icon size={16} color={a.accent ? '#000080' : '#6B7280'} />
                  <Text
                    className="text-[12.5px]"
                    style={{
                      color: a.accent ? '#000080' : '#6B7280',
                      fontFamily: a.accent ? 'Pretendard-Medium' : 'Pretendard',
                    }}
                  >
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="h-[6px] bg-[#F8F9FA]" />

          {/* Comments header */}
          <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
            <Text
              className="text-[13.5px] text-[#111]"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              댓글 18
            </Text>
            <Pressable className="flex-row items-center">
              <Text className="text-[12px] text-[#9CA3AF]">최신순</Text>
              <IconChevDn size={12} color="#9CA3AF" />
            </Pressable>
          </View>

          {COMMENTS.map((c, i) => (
            <View key={i} className="px-4 py-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Avatar name={c.nick.slice(2)} size={24} />
                <Text
                  className="text-[12.5px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  {c.nick}
                </Text>
                <Text className="text-[11px] text-[#9CA3AF]">{c.time}</Text>
              </View>
              <Text
                className="text-[13.5px] text-[#374151] pl-[32px]"
                style={{ lineHeight: 21 }}
              >
                {c.body}
              </Text>
              <View className="pl-[32px] mt-1.5 flex-row items-center gap-3">
                <Pressable className="flex-row items-center gap-1">
                  <IconThumb size={12} color="#9CA3AF" />
                  <Text className="text-[11.5px] text-[#9CA3AF]">{c.up}</Text>
                </Pressable>
                <Pressable>
                  <Text className="text-[11.5px] text-[#9CA3AF]">답글</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Sticky comment input */}
        <View className="border-t border-[#F0F0F0] px-3 py-2 flex-row items-center gap-2 bg-white">
          <TextInput
            placeholder="댓글을 남겨보세요"
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-10 px-3.5 rounded-full bg-[#F3F4F6] text-[13.5px]"
            style={{ fontFamily: 'Pretendard' }}
          />
          <Pressable className="px-2">
            <Text
              className="text-[13px] text-navy"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              등록
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
