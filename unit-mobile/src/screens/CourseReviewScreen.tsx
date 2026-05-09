import { useState } from 'react';
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
  IconX,
  IconThumb,
} from '../components/shared';
import { COURSES } from '../data/courses';
import type { RootStackProps } from '../types';

type Vote = 'rec' | 'no' | null;

export default function CourseReviewScreen({
  route,
}: RootStackProps<'CourseReview'>) {
  const navigation = useNavigation();
  const [vote, setVote] = useState<Vote>(null);
  const [body, setBody] = useState('');
  const c = COURSES.find((x) => x.id === route.params.courseId) ?? COURSES[0];

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <AppBar
        leading={
          <Pressable onPress={() => navigation.goBack()} className="p-1 -ml-1" hitSlop={8}>
            <IconX size={22} color="#111" />
          </Pressable>
        }
        trailing={
          <Pressable className="px-3 py-1.5">
            <Text className="text-[13px] text-[#9CA3AF]">건너뛰기</Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
          <Text
            className="text-[20px] text-[#111]"
            style={{
              fontFamily: 'Pretendard-SemiBold',
              letterSpacing: -0.4,
              lineHeight: 26,
            }}
          >
            {c.name}
          </Text>
          <Text className="text-[13px] text-[#6B7280] mt-1">
            {c.prof} · {c.dept}
          </Text>
          <Text className="text-[12.5px] text-[#9CA3AF] mt-3">
            한 줄 평가 후 다른 강의평을 볼 수 있어요
          </Text>

          {/* Vote big buttons */}
          <View className="flex-row gap-2.5 mt-5">
            <Pressable
              onPress={() => setVote('rec')}
              className={`flex-1 h-[88px] rounded-xl items-center justify-center gap-1.5 ${
                vote === 'rec' ? 'bg-navy' : 'bg-[#F3F4F6]'
              }`}
            >
              <IconThumb size={22} color={vote === 'rec' ? '#FFFFFF' : '#6B7280'} />
              <Text
                className="text-[14px]"
                style={{
                  color: vote === 'rec' ? '#FFFFFF' : '#6B7280',
                  fontFamily: 'Pretendard-SemiBold',
                }}
              >
                추천
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVote('no')}
              className={`flex-1 h-[88px] rounded-xl items-center justify-center gap-1.5 ${
                vote === 'no' ? 'bg-navy' : 'bg-[#F3F4F6]'
              }`}
            >
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <IconThumb size={22} color={vote === 'no' ? '#FFFFFF' : '#6B7280'} />
              </View>
              <Text
                className="text-[14px]"
                style={{
                  color: vote === 'no' ? '#FFFFFF' : '#6B7280',
                  fontFamily: 'Pretendard-SemiBold',
                }}
              >
                비추천
              </Text>
            </Pressable>
          </View>

          {/* Optional text */}
          <View className="mt-5">
            <Text className="text-[12.5px] text-[#9CA3AF] mb-2">
              한 줄로 남기고 싶은 말 (선택)
            </Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={5}
              placeholder="다음 학기에 들을 학생에게 도움이 되는 한마디"
              placeholderTextColor="#C9CDD3"
              className="w-full p-3.5 rounded-lg bg-[#F8F9FA] text-[13.5px] text-[#111]"
              style={{
                textAlignVertical: 'top',
                minHeight: 100,
                lineHeight: 21,
                fontFamily: 'Pretendard',
              }}
            />
          </View>
        </ScrollView>

        <View className="px-5 pb-5 pt-3">
          <Pressable
            disabled={!vote}
            className={`w-full h-12 rounded-lg items-center justify-center ${
              vote ? 'bg-navy' : 'bg-[#F3F4F6]'
            }`}
          >
            <Text
              className="text-[15px]"
              style={{
                color: vote ? '#FFFFFF' : '#9CA3AF',
                fontFamily: 'Pretendard-SemiBold',
              }}
            >
              등록
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
