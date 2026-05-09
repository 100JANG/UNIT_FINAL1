import { StyleSheet, View } from 'react-native';

type HairlineProps = { className?: string };

export function Hairline({ className = '' }: HairlineProps) {
  return (
    <View
      className={`bg-[#E5E7EB] ${className}`}
      style={{ height: StyleSheet.hairlineWidth }}
    />
  );
}
