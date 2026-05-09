import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';

import TabNavigator from './TabNavigator';
import WriteScreen from '../screens/wrappers/WriteWrapper';
import PostDetailScreen from '../screens/wrappers/PostDetailWrapper';
import CoursesScreen from '../screens/wrappers/CoursesWrapper';
import CourseDetailScreen from '../screens/wrappers/CourseDetailWrapper';
import CourseReviewScreen from '../screens/wrappers/CourseReviewWrapper';
import JuryScreen from '../screens/wrappers/JuryWrapper';
import ChatRoomScreen from '../screens/wrappers/ChatRoomWrapper';
import NotificationsScreen from '../screens/wrappers/NotificationsWrapper';
import MannerGradeScreen from '../screens/MannerGradeScreen';
import MannerLadderScreen from '../screens/MannerLadderScreen';
import TimetableScreen from '../screens/TimetableScreen';
import MealScreen from '../screens/MealScreen';
import BusScreen from '../screens/BusScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ContestScreen from '../screens/ContestScreen';
import JobsScreen from '../screens/JobsScreen';
import MarketScreen from '../screens/MarketScreen';
import FriendsScreen from '../screens/FriendsScreen';
import UnitV2Stack from './UnitV2Stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />

      <Stack.Screen
        name="Write"
        component={WriteScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen
        name="CourseReview"
        component={CourseReviewScreen}
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

      {/* PR-02: nested v2 navigator. Access via navigate('UnitV2', { screen: 'Feed' }). */}
      <Stack.Screen name="UnitV2" component={UnitV2Stack} />
    </Stack.Navigator>
  );
}
