import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';

import TabNavigator from './TabNavigator';
import UnitV2Stack from './UnitV2Stack';

import WriteScreen from '../screens/v2/WriteScreen';
import PostDetailV2 from '../screens/v2/PostDetailScreen';
import CoursesScreen from '../screens/v2/CoursesScreen';
import CourseDetailV2 from '../screens/v2/CourseDetailScreen';
import CourseReviewV2 from '../screens/v2/CourseReviewScreen';
import JuryScreen from '../screens/v2/JuryScreen';
import ChatRoomScreen from '../screens/v2/ChatRoomScreen';
import NotificationsScreen from '../screens/v2/NotificationsScreen';
import MannerGradeScreen from '../screens/v2/MannerGradeScreen';
import MannerLadderScreen from '../screens/v2/MannerLadderScreen';
import TimetableScreen from '../screens/v2/TimetableScreen';
import MealScreen from '../screens/v2/MealScreen';
import BusScreen from '../screens/v2/BusScreen';
import LibraryScreen from '../screens/v2/LibraryScreen';
import ContactsScreen from '../screens/v2/ContactsScreen';
import ContestScreen from '../screens/v2/ContestScreen';
import JobsScreen from '../screens/v2/JobsScreen';
import MarketScreen from '../screens/v2/MarketScreen';
import FriendsScreen from '../screens/v2/FriendsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator — all v2 screens promoted (PR-15).
 *
 * Param shapes are now unified across Root and UnitV2 stacks
 * (postId/courseId/commentId all string). Adapters are no longer needed.
 *
 * UnitV2 nested stack (used via `navigate('UnitV2', { screen: 'Foo' })`)
 * provides the full 36-route hierarchy in v2-native param shape.
 */
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />

      <Stack.Screen
        name="Write"
        component={WriteScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailV2} />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailV2} />
      <Stack.Screen
        name="CourseReview"
        component={CourseReviewV2}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Jury"
        component={JuryScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MannerGrade" component={MannerGradeScreen} />
      <Stack.Screen name="MannerLadder" component={MannerLadderScreen} />

      <Stack.Screen name="Timetable" component={TimetableScreen} />
      <Stack.Screen name="Meal" component={MealScreen} />
      <Stack.Screen name="Bus" component={BusScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Contest" component={ContestScreen} />
      <Stack.Screen name="Jobs" component={JobsScreen} />
      <Stack.Screen name="Market" component={MarketScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />

      <Stack.Screen name="UnitV2" component={UnitV2Stack} />
    </Stack.Navigator>
  );
}
