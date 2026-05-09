import { flags } from '../../utils/featureFlags';
import LegacyPostDetailScreen from '../PostDetailScreen';
import PostDetailV2 from '../v2/PostDetailScreen';
import type { RootStackProps } from '../../types';

/**
 * Adapter: legacy postId vs v2 id (both number) — direct map.
 */
export default function PostDetailWrapper(props: RootStackProps<'PostDetail'>) {
  if (flags.unitV2.feed) {
    const adapted = {
      ...props,
      route: { ...props.route, params: { id: props.route.params.postId } },
    };
    return <PostDetailV2 {...(adapted as any)} />;
  }
  return <LegacyPostDetailScreen {...props} />;
}
