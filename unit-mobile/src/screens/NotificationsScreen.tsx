import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppBar } from '../components/shared';
import { NOTIFS, KIND_LABEL, type Notif } from '../data/notifs';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function NotificationsScreen() {
  const [tab, setTab] = useState(0);
  const navigation = useNavigation<Nav>();
  const list = tab === 0 ? NOTIFS : NOTIFS.filter((n) => !n.read);
  const totalAll = NOTIFS.length;
  const totalUnread = NOTIFS.filter((n) => !n.read).length;

  const onNotifPress = (n: Notif) => {
    if (n.kind === 'jury') navigation.navigate('Jury', { caseId: undefined });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <AppBar
        title="알림"
        trailing={
          <Pressable className="px-2 py-1.5">
            <Text className="text-[12.5px] text-[#9CA3AF]">모두 읽음</Text>
          </Pressable>
        }
        divider={false}
      />

      <View className="flex-row items-center px-4 border-b border-[#F0F0F0]">
        {[
          { l: '전체', c: totalAll },
          { l: '읽지 않음', c: totalUnread },
        ].map((t, i) => {
          const on = tab === i;
          return (
            <Pressable
              key={i}
              onPress={() => setTab(i)}
              className="relative h-11 px-3.5 flex-row items-center gap-1.5 justify-center"
            >
              <Text
                className={`text-[14px] ${on ? 'text-[#111]' : 'text-[#9CA3AF]'}`}
                style={{ fontFamily: on ? 'Pretendard-SemiBold' : 'Pretendard' }}
              >
                {t.l}
              </Text>
              <Text className="text-[12px] text-[#9CA3AF]">{t.c}</Text>
              {on && <View className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#111]" />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1">
        {list.map((n, i) => (
          <NotifRow key={i} n={n} onPress={() => onNotifPress(n)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotifRow({ n, onPress }: { n: Notif; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3.5 border-b border-[#F0F0F0] flex-row gap-3 active:bg-[#F0F1F4] ${
        n.read ? '' : 'bg-[#F9FAFB]'
      }`}
    >
      <View
        className="mt-1 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: n.read ? 'transparent' : '#000080' }}
      />
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text className="text-[11px] text-[#9CA3AF]">{KIND_LABEL[n.kind]}</Text>
          <Text className="text-[11px] text-[#9CA3AF]">·</Text>
          <Text className="text-[11px] text-[#9CA3AF]">{n.ago}</Text>
        </View>
        <Text
          className="text-[14px] text-[#111]"
          style={{ letterSpacing: -0.2, lineHeight: 18 }}
        >
          {n.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-[12.5px] text-[#6B7280] mt-1"
          style={{ lineHeight: 17 }}
        >
          {n.body}
        </Text>
      </View>
    </Pressable>
  );
}
