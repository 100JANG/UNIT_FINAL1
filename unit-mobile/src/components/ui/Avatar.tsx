import { Image, StyleSheet, Text, View } from 'react-native';
import { C, F } from '../../theme/tokens';

type AvatarProps = {
  name: string;
  size?: number;
  uri?: string;
};

const PALETTE = ['#DCE7F5', '#E2F1EA', '#FCF1D6', '#FBE6CC', '#F1F3F5'];

function hash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  return Math.abs(h);
}

export function Avatar({ name, size = 36, uri }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  const bg = PALETTE[hash(name) % PALETTE.length];
  return (
    <View
      style={[
        styles.base,
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.42) }]}>
        {name.slice(0, 1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: C.textMeta,
    fontFamily: F.familySemiBold,
  },
});
