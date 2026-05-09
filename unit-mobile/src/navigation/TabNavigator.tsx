import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import type { TabParamList, RootStackParamList } from '../types';
import { IcPencil } from '../components/ui';
import { C, R, SHADOW } from '../theme/tokens';

import FeedScreen from '../screens/v2/FeedScreen';
import CampusHubScreen from '../screens/v2/CampusHubScreen';
import ChatListScreen from '../screens/v2/ChatListScreen';
import ProfileScreen from '../screens/v2/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

function FabPlaceholder() {
  return null;
}

type RootNav = NativeStackNavigationProp<RootStackParamList>;

// Inline filled-toggle icons (replaces legacy Icons.tsx for tab bar)
function IconHome({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}
function IconGrid({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Rect x={4} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
      <Rect x={13} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
      <Rect x={4} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
      <Rect x={13} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}
function IconChatTab({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3l-4 4-4-4H6a2 2 0 0 1-2-2V6Z"
        stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}
function IconUser({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.6} />
      <Path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"
        stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10.5, fontFamily: 'Pretendard-Medium' },
        tabBarActiveTintColor: C.inkNavy,
        tabBarInactiveTintColor: C.textMeta,
        tabBarStyle: {
          borderTopColor: C.divider2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{ title: '피드', tabBarIcon: IconHome }}
      />
      <Tab.Screen
        name="Campus"
        component={CampusHubScreen}
        options={{ title: '캠퍼스', tabBarIcon: IconGrid }}
      />
      <Tab.Screen
        name="WriteFab"
        component={FabPlaceholder}
        options={{
          tabBarLabel: '쓰기',
          tabBarIcon: () => (
            <View style={[styles.fab, SHADOW.fab]}>
              <IcPencil color="#FFFFFF" size={20} />
            </View>
          ),
          tabBarButton: (props) => <WriteFabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ title: '채팅', tabBarIcon: IconChatTab }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{ title: '나', tabBarIcon: IconUser }}
      />
    </Tab.Navigator>
  );
}

function WriteFabButton(props: any) {
  const navigation = useNavigation<RootNav>();
  return <Pressable {...props} onPress={() => navigation.navigate('Write')} />;
}

const styles = StyleSheet.create({
  fab: {
    width: 48,
    height: 48,
    marginTop: -20,
    borderRadius: R.full,
    backgroundColor: C.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
