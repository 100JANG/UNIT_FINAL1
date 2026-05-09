import { View, Text } from 'react-native';

type AvatarProps = {
  name?: string;
  size?: number;
  hue?: string;
};

export function Avatar({ name = '익', size = 30, hue }: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: hue || '#F1F3F5',
      }}
      className="rounded-full items-center justify-center"
    >
      <Text
        style={{
          fontSize: size * 0.42,
          color: '#6B7280',
          fontFamily: 'Pretendard-SemiBold',
        }}
      >
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}
