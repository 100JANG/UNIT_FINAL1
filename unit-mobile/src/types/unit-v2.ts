/**
 * UnitV2 — type-safe ParamList for the v2 stack.
 *
 * Route names must match docs/handoff/03_SCREENS.md exactly.
 * 36 routes total.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';

export type UnitV2ParamList = {
  // Auth / Onboarding (5)
  Splash: undefined;
  SchoolSelect: undefined;
  Login: undefined;
  EmailVerify: { email: string };
  ProfileSetup: undefined;

  // Feed (3)
  Feed: undefined;
  PostDetail: { postId: string };
  Write: { board?: string };

  // Campus Hub (6)
  CampusHub: undefined;
  Timetable: undefined;
  Meal: undefined;
  Bus: undefined;
  Library: undefined;
  Contacts: undefined;

  // Student Life (4)
  Contest: undefined;
  Jobs: undefined;
  Market: undefined;
  Friends: undefined;

  // Chat (2)
  ChatList: undefined;
  ChatRoom: { id: string };

  // Courses (3)
  Courses: undefined;
  CourseDetail: { id: number };
  CourseReview: { id: number };

  // 자치/알림/나 (3)
  Jury: undefined;
  Notifications: undefined;
  Profile: undefined;

  // Search / My Activity (4)
  Search: undefined;
  MyPosts: undefined;
  MyComments: undefined;
  Scraps: undefined;

  // Social / Moderation (5)
  OtherProfile: { userId: string };
  FriendRequests: undefined;
  Report: { targetType: 'post' | 'comment' | 'user'; targetId: string };
  BlockList: undefined;
  CommentThread: { commentId: string };

  // Settings (3)
  Settings: undefined;
  NotificationSettings: undefined;
  AccountSettings: undefined;

  // Campus Deep (4)
  MarketWrite: undefined;
  MarketDetail: { id: number };
  JobDetail: { id: number };
  ContestDetail: { id: number };

  // Manner (2)
  MannerGrade: undefined;
  MannerLadder: undefined;
};

// Root navigation that contains UnitV2 as a nested navigator.
export type RootStackParamList = {
  Tabs: undefined;
  UnitV2: { screen?: keyof UnitV2ParamList; params?: object } | undefined;
} & {
  // Existing routes (legacy, kept for backwards compat — see PR-11~14)
  Write: undefined;
  PostDetail: { postId: string };
  Courses: undefined;
  CourseDetail: { courseId: number };
  CourseReview: { courseId: number };
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

export type UnitV2Props<T extends keyof UnitV2ParamList> = CompositeScreenProps<
  NativeStackScreenProps<UnitV2ParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
