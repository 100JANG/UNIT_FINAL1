import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

type AppBarProps = {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
};

export function AppBar({ title, leading, trailing, divider = true }: AppBarProps) {
  return (
    <View
      className={`h-12 flex-row items-center justify-between px-4 bg-white ${
        divider ? 'border-b border-[#E5E7EB]' : ''
      }`}
    >
      <View className="flex-row items-center gap-1 min-w-0 flex-1">
        {leading ?? (
          <Text
            numberOfLines={1}
            className="text-[17px] font-semibold tracking-[-0.3px] text-[#111]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {title}
          </Text>
        )}
      </View>
      <View className="flex-row items-center gap-1">{trailing}</View>
    </View>
  );
}
