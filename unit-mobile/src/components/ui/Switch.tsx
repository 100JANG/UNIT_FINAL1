import { Switch as RNSwitch } from 'react-native';
import { C } from '../../theme/tokens';

type SwitchProps = {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
};

export function Switch({ value, onChange, disabled = false }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: C.divider2, true: C.inkNavy }}
      thumbColor={C.white}
      ios_backgroundColor={C.divider2}
    />
  );
}
