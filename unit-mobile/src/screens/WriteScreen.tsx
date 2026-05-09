import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import {
  AppBar,
  Hairline,
  IconX,
  IconChev,
  IconCamera,
} from '../components/shared';

const PHOTO_LIMIT = 10;

export default function WriteScreen() {
  const navigation = useNavigation();
  const [board] = useState('자유게시판');
  const [anon, setAnon] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const canPublish = title.trim().length > 0 && body.trim().length > 0;

  const pickImage = async () => {
    const remaining = PHOTO_LIMIT - photos.length;
    if (remaining <= 0) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('사진 접근 권한이 필요해요');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      <AppBar
        leading={
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.goBack()}
              className="p-1 -ml-1"
              hitSlop={8}
            >
              <IconX size={22} color="#111" />
            </Pressable>
            <Text
              className="text-[15.5px] text-[#111] ml-2"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              글쓰기
            </Text>
          </View>
        }
        trailing={
          <>
            <Pressable className="px-2.5 py-1.5">
              <Text className="text-[13px] text-[#6B7280]">임시저장</Text>
            </Pressable>
            <Pressable
              disabled={!canPublish}
              className={`px-3 py-1.5 rounded-md ${
                canPublish ? 'bg-navy' : 'bg-[#F3F4F6]'
              }`}
            >
              <Text
                className="text-[13.5px]"
                style={{
                  color: canPublish ? '#FFFFFF' : '#9CA3AF',
                  fontFamily: 'Pretendard-SemiBold',
                }}
              >
                게시
              </Text>
            </Pressable>
          </>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Board picker */}
          <Pressable className="w-full px-4 h-12 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <Text className="text-[14px] text-[#111]">{board}</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[12.5px] text-[#9CA3AF]">게시판 선택</Text>
              <IconChev size={14} color="#9CA3AF" />
            </View>
          </Pressable>

          {/* Anonymous toggle */}
          <Pressable
            onPress={() => setAnon(!anon)}
            className="w-full px-4 h-12 flex-row items-center justify-between border-b border-[#F0F0F0]"
          >
            <Text className="text-[14px] text-[#111]">익명으로 작성</Text>
            <AnimatedToggle on={anon} />
          </Pressable>

          {/* Title */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#C9CDD3"
            className="w-full px-4 pt-5 pb-3 text-[18px] text-[#111]"
            style={{
              fontFamily: 'Pretendard-SemiBold',
              letterSpacing: -0.4,
            }}
          />
          <Hairline className="mx-4" />

          {/* Body */}
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            placeholder={'내용을 자유롭게 작성하세요.\n\n같은 학과 학생들이 읽을 수 있어요.'}
            placeholderTextColor="#C9CDD3"
            className="w-full px-4 pt-4 pb-2 text-[15px] text-[#111]"
            style={{
              fontFamily: 'Pretendard',
              letterSpacing: -0.2,
              lineHeight: 25.5,
              minHeight: 9 * 26,
              textAlignVertical: 'top',
            }}
          />

          {/* Photo strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          >
            <Pressable
              onPress={pickImage}
              className="w-16 h-16 rounded-lg border border-[#E5E7EB] items-center justify-center mr-2 active:bg-[#F9FAFB]"
            >
              <IconCamera size={20} color="#6B7280" />
              <Text className="text-[10.5px] text-[#6B7280] mt-0.5">
                {photos.length}/{PHOTO_LIMIT}
              </Text>
            </Pressable>
            {photos.map((uri) => (
              <View key={uri} className="w-16 h-16 rounded-lg overflow-hidden mr-2 relative">
                <Image source={{ uri }} className="w-full h-full" />
                <Pressable
                  onPress={() => setPhotos((p) => p.filter((u) => u !== uri))}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                  <Text className="text-white text-[10px]">×</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Tags */}
          <View className="px-4 pt-3 pb-4">
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="태그를 추가하세요 (쉼표로 구분)"
              placeholderTextColor="#C9CDD3"
              className="w-full h-10 text-[13.5px] text-[#111]"
              style={{ fontFamily: 'Pretendard' }}
            />
          </View>
          <Hairline className="mx-4" />

          {/* Notice */}
          <View className="px-4 py-4">
            <Text
              className="text-[12px] text-[#9CA3AF]"
              style={{ lineHeight: 19 }}
            >
              작성한 글은 같은 학과 학생들이 볼 수 있어요. 신고가 누적되면 학과 학생 30명에게 검토를 요청할 수 있습니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AnimatedToggle({ on }: { on: boolean }) {
  const left = useSharedValue(on ? 20 : 2);
  useEffect(() => {
    left.value = withTiming(on ? 20 : 2, { duration: 180 });
  }, [on, left]);
  const knobStyle = useAnimatedStyle(() => ({ left: left.value }));

  return (
    <View
      className="w-[42px] h-[24px] rounded-full"
      style={{ backgroundColor: on ? '#000080' : '#E5E7EB' }}
    >
      <Animated.View
        style={[
          knobStyle,
          {
            position: 'absolute',
            top: 2,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 1.5,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
          },
        ]}
      />
    </View>
  );
}
