import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  AppBar,
  Avatar,
  IconBack,
  IconBell,
  IconMore,
  IconPlus,
  IconSend,
} from '../components/shared';
import { CHATS, INITIAL_MSGS, type ChatMsg } from '../data/chats';
import type { RootStackProps } from '../types';

export default function ChatRoomScreen({ route }: RootStackProps<'ChatRoom'>) {
  const navigation = useNavigation();
  const chat = CHATS.find((c) => c.id === route.params.chatId) ?? CHATS[2];
  const subTitle = chat.group && chat.members != null
    ? `참여 ${chat.members}명 · 활성`
    : '활성';
  const [msgs, setMsgs] = useState<ChatMsg[]>(INITIAL_MSGS);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // mock socket: incoming after delay
  useEffect(() => {
    const t1 = setTimeout(() => {
      setTyping(true);
      const t2 = setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [
          ...m,
          { from: 'them', name: '지호', body: '저도 그래프 만드는 거 도와드릴게요', t: '오후 4:07' },
        ]);
      }, 1800);
      return () => clearTimeout(t2);
    }, 2400);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { from: 'me', body: draft, t: '오후 4:08' }]);
    setDraft('');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-cream">
      <View className="bg-white">
        <AppBar
          leading={
            <View className="flex-row items-center">
              <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
                <IconBack size={22} color="#111" />
              </Pressable>
              <View className="ml-2 flex-1 min-w-0">
                <Text
                  numberOfLines={1}
                  className="text-[14.5px] text-[#111]"
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {chat.name}
                </Text>
                <Text className="text-[11px] text-[#9CA3AF]">{subTitle}</Text>
              </View>
            </View>
          }
          trailing={
            <>
              <Pressable className="p-2"><IconBell size={20} color="#333" /></Pressable>
              <Pressable className="p-2"><IconMore size={20} color="#333" /></Pressable>
            </>
          }
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-3 py-3"
          contentContainerStyle={{ gap: 8 }}
        >
          <Text className="text-center text-[10.5px] text-[#9CA3AF] py-1">
            2025년 5월 12일 화요일
          </Text>

          {msgs.map((m, i) => {
            const k = `${m.from}-${i}-${m.t}`;
            if (m.from === 'sys') {
              return (
                <Text key={k} className="text-center text-[11px] text-[#9CA3AF] py-1">
                  {m.body}
                </Text>
              );
            }

            if (m.from === 'me') {
              return (
                <View key={k} className="flex-row items-end justify-end gap-1.5">
                  <Text className="text-[10px] text-[#9CA3AF] mb-0.5">{m.t}</Text>
                  <View
                    className="bg-navy rounded-2xl rounded-br-sm px-3 py-2"
                    style={{ maxWidth: '78%' }}
                  >
                    <Text
                      className="text-white text-[13.5px]"
                      style={{ lineHeight: 19 }}
                    >
                      {m.body}
                    </Text>
                  </View>
                </View>
              );
            }

            const prev = msgs[i - 1];
            const showName =
              i === 0 || prev.from !== 'them' || prev.name !== m.name;
            return (
              <View key={k} className="flex-row items-end gap-1.5">
                <View className="w-7">
                  {showName && <Avatar name={m.name} size={28} />}
                </View>
                <View style={{ maxWidth: '78%' }}>
                  {showName && (
                    <Text className="text-[11px] text-[#6B7280] mb-0.5 ml-1">
                      {m.name}
                    </Text>
                  )}
                  <View className="flex-row items-end gap-1.5">
                    <View
                      className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 border border-[#F0F0F0]"
                    >
                      <Text
                        className="text-[13.5px] text-[#111]"
                        style={{ lineHeight: 19 }}
                      >
                        {m.body}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-[#9CA3AF] mb-0.5">{m.t}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {typing && (
            <View className="flex-row items-end gap-1.5">
              <View className="w-7" />
              <View className="bg-white border border-[#F0F0F0] rounded-2xl px-3 py-2.5 flex-row gap-1">
                <TypingDot delay={0} />
                <TypingDot delay={150} />
                <TypingDot delay={300} />
              </View>
            </View>
          )}
        </ScrollView>

        <View className="px-2 pt-2.5 pb-2.5 border-t border-[#F0F0F0] bg-white flex-row items-end gap-2">
          <Pressable className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center">
            <IconPlus size={18} color="#6B7280" />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder="메시지 입력"
            placeholderTextColor="#9CA3AF"
            className="flex-1 h-9 px-3 rounded-full bg-[#F3F4F6] text-[13.5px] text-[#111]"
            style={{ fontFamily: 'Pretendard' }}
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            className="w-9 h-9 rounded-full bg-navy items-center justify-center"
            style={{ opacity: !draft.trim() ? 0.4 : 1 }}
          >
            <IconSend size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 400 }), -1, true),
    );
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={style}
      className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"
    />
  );
}
