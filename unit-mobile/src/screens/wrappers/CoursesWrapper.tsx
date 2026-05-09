import { flags } from '../../utils/featureFlags';
import LegacyCoursesScreen from '../CoursesScreen';
import CoursesV2 from '../v2/CoursesScreen';

export default function CoursesWrapper() {
  return flags.unitV2.courses ? <CoursesV2 /> : <LegacyCoursesScreen />;
}
