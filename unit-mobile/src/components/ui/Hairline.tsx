import { StyleSheet, View } from 'react-native';
import { C } from '../../theme/tokens';

type HairlineProps = {
  color?: string;
  mx?: number;
};

export function Hairline({ color = C.divider, mx = 0 }: HairlineProps) {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: color,
        marginHorizontal: mx,
      }}
    />
  );
}
