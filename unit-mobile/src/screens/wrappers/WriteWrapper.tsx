import { flags } from '../../utils/featureFlags';
import LegacyWriteScreen from '../WriteScreen';
import WriteV2 from '../v2/WriteScreen';

export default function WriteWrapper() {
  return flags.unitV2.feed ? <WriteV2 /> : <LegacyWriteScreen />;
}
