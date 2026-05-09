/**
 * UnitV2Stack — 36 routes per docs/handoff/03_SCREENS.md.
 *
 * PR-02: every route points to PlaceholderScreen.
 * PR-03+ replaces individual entries with real screens.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlaceholderScreen } from '../screens/v2/PlaceholderScreen';
import MannerGradeV2 from '../screens/v2/MannerGradeScreen';
import MannerLadderV2 from '../screens/v2/MannerLadderScreen';
import SplashV2 from '../screens/v2/SplashScreen';
import SchoolSelectV2 from '../screens/v2/SchoolSelectScreen';
import LoginV2 from '../screens/v2/LoginScreen';
import EmailVerifyV2 from '../screens/v2/EmailVerifyScreen';
import ProfileSetupV2 from '../screens/v2/ProfileSetupScreen';
import SearchV2 from '../screens/v2/SearchScreen';
import MyPostsV2 from '../screens/v2/MyPostsScreen';
import MyCommentsV2 from '../screens/v2/MyCommentsScreen';
import ScrapsV2 from '../screens/v2/ScrapsScreen';
import OtherProfileV2 from '../screens/v2/OtherProfileScreen';
import FriendRequestsV2 from '../screens/v2/FriendRequestsScreen';
import ReportV2 from '../screens/v2/ReportScreen';
import BlockListV2 from '../screens/v2/BlockListScreen';
import CommentThreadV2 from '../screens/v2/CommentThreadScreen';
import SettingsV2 from '../screens/v2/SettingsScreen';
import NotificationSettingsV2 from '../screens/v2/NotificationSettingsScreen';
import AccountSettingsV2 from '../screens/v2/AccountSettingsScreen';
import CampusHubV2 from '../screens/v2/CampusHubScreen';
import TimetableV2 from '../screens/v2/TimetableScreen';
import MealV2 from '../screens/v2/MealScreen';
import BusV2 from '../screens/v2/BusScreen';
import LibraryV2 from '../screens/v2/LibraryScreen';
import ContactsV2 from '../screens/v2/ContactsScreen';
import MarketWriteV2 from '../screens/v2/MarketWriteScreen';
import MarketDetailV2 from '../screens/v2/MarketDetailScreen';
import JobDetailV2 from '../screens/v2/JobDetailScreen';
import ContestDetailV2 from '../screens/v2/ContestDetailScreen';
import ContestV2 from '../screens/v2/ContestScreen';
import JobsV2 from '../screens/v2/JobsScreen';
import MarketV2 from '../screens/v2/MarketScreen';
import FriendsV2 from '../screens/v2/FriendsScreen';
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

// Real screens registered per route — fall back to PlaceholderScreen otherwise
const REAL_SCREENS: Partial<
  Record<keyof UnitV2ParamList, React.ComponentType<any>>
> = {
  Splash: SplashV2,
  SchoolSelect: SchoolSelectV2,
  Login: LoginV2,
  EmailVerify: EmailVerifyV2,
  ProfileSetup: ProfileSetupV2,
  Search: SearchV2,
  MyPosts: MyPostsV2,
  MyComments: MyCommentsV2,
  Scraps: ScrapsV2,
  OtherProfile: OtherProfileV2,
  FriendRequests: FriendRequestsV2,
  Report: ReportV2,
  BlockList: BlockListV2,
  CommentThread: CommentThreadV2,
  Settings: SettingsV2,
  NotificationSettings: NotificationSettingsV2,
  AccountSettings: AccountSettingsV2,
  CampusHub: CampusHubV2,
  Timetable: TimetableV2,
  Meal: MealV2,
  Bus: BusV2,
  Library: LibraryV2,
  Contacts: ContactsV2,
  MarketWrite: MarketWriteV2,
  MarketDetail: MarketDetailV2,
  JobDetail: JobDetailV2,
  ContestDetail: ContestDetailV2,
  Contest: ContestV2,
  Jobs: JobsV2,
  Market: MarketV2,
  Friends: FriendsV2,
  MannerGrade: MannerGradeV2,
  MannerLadder: MannerLadderV2,
};

export default function UnitV2Stack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {ROUTES.map(({ name, spec }) => {
        const Real = REAL_SCREENS[name];
        return (
          <Stack.Screen
            key={name}
            name={name as keyof UnitV2ParamList}
            options={getOptions(name)}
          >
            {() => (Real ? <Real /> : <PlaceholderScreen routeName={name} spec={spec} />)}
          </Stack.Screen>
        );
      })}
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
