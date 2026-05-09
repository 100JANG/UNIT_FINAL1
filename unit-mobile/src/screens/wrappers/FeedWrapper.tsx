import { flags } from '../../utils/featureFlags';
import LegacyFeedScreen from '../FeedScreen';
import FeedV2 from '../v2/FeedScreen';

export default function FeedWrapper() {
  return flags.unitV2.feed ? <FeedV2 /> : <LegacyFeedScreen />;
}
