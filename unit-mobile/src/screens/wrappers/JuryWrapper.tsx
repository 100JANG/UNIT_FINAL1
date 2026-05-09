/**
 * Wrapper that picks legacy NativeWind Jury or new v2 StyleSheet Jury
 * based on flags.unitV2.profile.
 */
import { flags } from '../../utils/featureFlags';
import LegacyJuryScreen from '../JuryScreen';
import JuryV2 from '../v2/JuryScreen';

export default function JuryWrapper() {
  return flags.unitV2.profile ? <JuryV2 /> : <LegacyJuryScreen />;
}
