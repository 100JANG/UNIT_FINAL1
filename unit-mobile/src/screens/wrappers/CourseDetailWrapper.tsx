import { flags } from '../../utils/featureFlags';
import LegacyCourseDetailScreen from '../CourseDetailScreen';
import CourseDetailV2 from '../v2/CourseDetailScreen';
import type { RootStackProps } from '../../types';

/**
 * Adapter: legacy uses route.params.courseId, v2 uses route.params.id.
 * Wrapper bridges both signatures so navigation call sites don't change.
 */
export default function CourseDetailWrapper(props: RootStackProps<'CourseDetail'>) {
  if (flags.unitV2.courses) {
    // Adapt courseId → id for v2
    const adapted = {
      ...props,
      route: { ...props.route, params: { id: props.route.params.courseId } },
    };
    return <CourseDetailV2 {...(adapted as any)} />;
  }
  return <LegacyCourseDetailScreen {...props} />;
}
