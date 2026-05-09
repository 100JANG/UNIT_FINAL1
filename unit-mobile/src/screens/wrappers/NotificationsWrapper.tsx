import { flags } from '../../utils/featureFlags';
import LegacyNotificationsScreen from '../NotificationsScreen';
import NotificationsV2 from '../v2/NotificationsScreen';

export default function NotificationsWrapper() {
  return flags.unitV2.profile ? <NotificationsV2 /> : <LegacyNotificationsScreen />;
}
