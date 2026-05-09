import type { TextStyle } from 'react-native';

export type FontWeightToken = 400 | 500 | 600 | 700;

export const fontWeight = (w: FontWeightToken): TextStyle => {
  const family =
    w === 700 ? 'Pretendard-Bold' :
    w === 600 ? 'Pretendard-SemiBold' :
    w === 500 ? 'Pretendard-Medium' :
    'Pretendard';
  return { fontFamily: family };
};
