import { flags } from '../../utils/featureFlags';
import LegacyCourseReviewScreen from '../CourseReviewScreen';
import CourseReviewV2 from '../v2/CourseReviewScreen';
import type { RootStackProps } from '../../types';

export default function CourseReviewWrapper(props: RootStackProps<'CourseReview'>) {
  if (flags.unitV2.courses) {
    const adapted = {
      ...props,
      route: { ...props.route, params: { id: props.route.params.courseId } },
    };
    return <CourseReviewV2 {...(adapted as any)} />;
  }
  return <LegacyCourseReviewScreen {...props} />;
}
