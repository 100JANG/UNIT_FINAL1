import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Tabs: undefined;
  UnitV2: { screen?: string; params?: object } | undefined;
  Write: undefined;
  PostDetail: { postId: string };
  Courses: undefined;
  CourseDetail: { courseId: string };
  CourseReview: { courseId: string };
  Jury: { caseId?: number };
  ChatRoom: { chatId: number };
  Notifications: undefined;
  MannerGrade: undefined;
  MannerLadder: undefined;
  Timetable: undefined;
  Meal: undefined;
  Bus: undefined;
  Library: undefined;
  Contacts: undefined;
  Contest: undefined;
  Jobs: undefined;
  Market: undefined;
  Friends: undefined;
};

export type TabParamList = {
  Home: undefined;
  Campus: undefined;
  WriteFab: undefined;
  Chat: undefined;
  Me: undefined;
};

export type RootStackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
