import { flags } from '../../utils/featureFlags';
import LegacyChatRoomScreen from '../ChatRoomScreen';
import ChatRoomV2 from '../v2/ChatRoomScreen';
import type { RootStackProps } from '../../types';

/**
 * Adapter: legacy chatId is number, v2 id is string.
 * Both legacy ChatRoomScreen and v2 ChatRoomV2 use mock data internally,
 * so the adapter just bridges signature without real data transform.
 */
export default function ChatRoomWrapper(props: RootStackProps<'ChatRoom'>) {
  if (flags.unitV2.chat) {
    return <ChatRoomV2 />;
  }
  return <LegacyChatRoomScreen {...props} />;
}
