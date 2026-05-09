import { flags } from '../../utils/featureFlags';
import LegacyChatListScreen from '../ChatListScreen';
import ChatListV2 from '../v2/ChatListScreen';

export default function ChatListWrapper() {
  return flags.unitV2.chat ? <ChatListV2 /> : <LegacyChatListScreen />;
}
