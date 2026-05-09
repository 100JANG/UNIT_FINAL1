import { Image, StyleSheet, Text, View } from 'react-native';
import { C, F, R } from '../../theme/tokens';

type LogoMarkProps = {
  domain: string;
  size?: number;
};

const REMOTE_FAVICON = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const LABEL: Record<string, string> = {
  'inha.ac.kr':   '인',
  'ajou.ac.kr':   '아',
  'snu.ac.kr':    '서',
  'korea.ac.kr':  '고',
  'yonsei.ac.kr': '연',
};

export function LogoMark({ domain, size = 36 }: LogoMarkProps) {
  const label = LABEL[domain] ?? domain.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: R.md },
      ]}
    >
      <Image
        source={{ uri: REMOTE_FAVICON(domain) }}
        style={[styles.img, { width: size, height: size, borderRadius: R.md }]}
      />
      <Text style={[styles.fallback, { fontSize: Math.round(size * 0.42) }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: C.surface2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallback: {
    color: C.textMeta,
    fontFamily: F.familySemiBold,
  },
});
