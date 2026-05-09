import { flags } from '../../utils/featureFlags';
import LegacyProfileScreen from '../ProfileScreen';
import ProfileV2 from '../v2/ProfileScreen';

export default function ProfileWrapper() {
  return flags.unitV2.profile ? <ProfileV2 /> : <LegacyProfileScreen />;
}
