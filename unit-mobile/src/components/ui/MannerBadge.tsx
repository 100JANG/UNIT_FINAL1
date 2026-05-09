import { Platform, StyleSheet, Text, View } from 'react-native';
import { C, F } from '../../theme/tokens';

export type MannerGrade =
  | 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F';

type MannerBadgeProps = {
  grade: MannerGrade;
  size?: 'sm' | 'md' | 'lg';
};

const GRADE_COLOR: Record<MannerGrade, string> = {
  'A+': C.manner.aPlus,
  'A0': C.manner.a0,
  'B+': C.manner.bPlus,
  'B0': C.manner.b0,
  'C+': C.manner.cPlus,
  'C0': C.manner.c0,
  'D+': C.manner.dPlus,
  'D0': C.manner.d0,
  'F':  C.manner.f,
};

const SIZE = {
  sm: { box: 20, font: 11, border: 1 },
  md: { box: 32, font: 14, border: 1.5 },
  lg: { box: 96, font: 48, border: 2 },
};

export function MannerBadge({ grade, size = 'md' }: MannerBadgeProps) {
  const color = GRADE_COLOR[grade];
  const s = SIZE[size];
  const isLg = size === 'lg';
  return (
    <View
      style={[
        styles.box,
        {
          width: s.box,
          height: s.box,
          borderColor: color,
          borderWidth: isLg ? 0 : s.border,
          borderRadius: isLg ? 12 : 6,
          backgroundColor: isLg ? 'transparent' : C.white,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: s.font,
            includeFontPadding: false,
          },
        ]}
      >
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: F.familyBold,
    letterSpacing: -0.5,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
