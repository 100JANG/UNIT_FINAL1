import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { TabParamList, RootStackParamList } from '../types';
import {
  IconHome,
  IconGrid,
  IconChatTab,
  IconUser,
  IconPencil,
} from '../components/shared/Icons';

import FeedScreen from '../screens/wrappers/FeedWrapper';
import CampusHubScreen from '../screens/CampusHubScreen';
import ChatListScreen from '../screens/wrappers/ChatListWrapper';
import ProfileScreen from '../screens/wrappers/ProfileWrapper';

const Tab = createBottomTabNavigator<TabParamList>();

function FabPlaceholder() {
  return null;
}

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontFamily: 'Pretendard-Medium',
        },
        tabBarActiveTintColor: '#000080',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          title: '피드',
          tabBarIcon: ({ color, focused }) => (
            <IconHome color={color} filled={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Campus"
        component={CampusHubScreen}
        options={{
          title: '캠퍼스',
          tabBarIcon: ({ color, focused }) => (
            <IconGrid color={color} filled={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WriteFab"
        component={FabPlaceholder}
        options={{
          tabBarLabel: '쓰기',
          tabBarIcon: () => (
            <View
              className="w-12 h-12 -mt-5 rounded-full bg-navy items-center justify-center"
              style={{
                shadowColor: '#000080',
                shadowOpacity: 0.28,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <IconPencil color="#FFFFFF" size={20} />
            </View>
          ),
          tabBarButton: (props) => <WriteFabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          title: '채팅',
          tabBarIcon: ({ color, focused }) => (
            <IconChatTab color={color} filled={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{
          title: '나',
          tabBarIcon: ({ color, focused }) => (
            <IconUser color={color} filled={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function WriteFabButton(props: any) {
  const navigation = useNavigation<RootNav>();
  return (
    <Pressable
      {...props}
      onPress={() => navigation.navigate('Write')}
    />
  );
}
