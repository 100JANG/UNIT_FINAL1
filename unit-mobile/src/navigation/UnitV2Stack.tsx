/**
 * UnitV2Stack — 36 routes per docs/handoff/03_SCREENS.md.
 *
 * PR-02: every route points to PlaceholderScreen.
 * PR-03+ replaces individual entries with real screens.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlaceholderScreen } from '../screens/v2/PlaceholderScreen';
import type { UnitV2ParamList } from '../types/unit-v2';

const Stack = createNativeStackNavigator<UnitV2ParamList>();

const ROUTES: { name: keyof UnitV2ParamList; spec?: string }[] = [
  // Auth / Onboarding
  { name: 'Splash', spec: '1.2s 후 SchoolSelect 또는 Feed로 자동' },
  { name: 'SchoolSelect', spec: '학교 검색 + 5개 인기 학교' },
  { name: 'Login', spec: '학교 이메일 입력 + OTP 발송' },
  { name: 'EmailVerify', spec: '6자리 OTP + 5분 타이머' },
  { name: 'ProfileSetup', spec: '닉네임/학과/학번/약관' },
  // Feed
  { name: 'Feed' },
  { name: 'PostDetail' },
  { name: 'Write' },
  // Campus Hub
  { name: 'CampusHub' },
  { name: 'Timetable' },
  { name: 'Meal' },
  { name: 'Bus' },
  { name: 'Library' },
  { name: 'Contacts' },
  // Student Life
  { name: 'Contest' },
  { name: 'Jobs' },
  { name: 'Market' },
  { name: 'Friends' },
  // Chat
  { name: 'ChatList' },
  { name: 'ChatRoom' },
  // Courses
  { name: 'Courses' },
  { name: 'CourseDetail' },
  { name: 'CourseReview' },
  // 자치/알림/나
  { name: 'Jury' },
  { name: 'Notifications' },
  { name: 'Profile' },
  // Search / My Activity
  { name: 'Search' },
  { name: 'MyPosts' },
  { name: 'MyComments' },
  { name: 'Scraps' },
  // Social / Moderation
  { name: 'OtherProfile' },
  { name: 'FriendRequests' },
  { name: 'Report' },
  { name: 'BlockList' },
  { name: 'CommentThread' },
  // Settings
  { name: 'Settings' },
  { name: 'NotificationSettings' },
  { name: 'AccountSettings' },
  // Campus Deep
  { name: 'MarketWrite' },
  { name: 'MarketDetail' },
  { name: 'JobDetail' },
  { name: 'ContestDetail' },
  // Manner
  { name: 'MannerGrade' },
  { name: 'MannerLadder' },
];

export default function UnitV2Stack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {ROUTES.map(({ name, spec }) => (
        <Stack.Screen
          key={name}
          name={name as keyof UnitV2ParamList}
          options={getOptions(name)}
        >
          {() => <PlaceholderScreen routeName={name} spec={spec} />}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  );
}

const MODAL_ROUTES = new Set([
  'Write',
  'CourseReview',
  'Jury',
  'Report',
  'MarketWrite',
]);

function getOptions(name: keyof UnitV2ParamList) {
  if (MODAL_ROUTES.has(name)) {
    return { presentation: 'modal' as const, animation: 'slide_from_bottom' as const };
  }
  return {};
}
