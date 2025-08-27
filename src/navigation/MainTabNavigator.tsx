import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../constants/colors';
import { MainTabParamList } from '../types';

// Import main screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// High-end SVG Icon Components
function HomeIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.primary.teal : colors.text.secondary;
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V16C9 15.4477 9.44772 15 10 15H14C14.5523 15 15 15.4477 15 16V21M9 21H15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.primary.teal : colors.text.secondary;
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M16 2V6M8 2V6M3 10H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="14" r="1.5" fill={color} />
      <Circle cx="12" cy="14" r="1.5" fill={color} />
      <Circle cx="16" cy="14" r="1.5" fill={color} />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const color = focused ? colors.primary.teal : colors.text.secondary;
  return (
    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconProps = { focused };
  
  switch (name) {
    case 'Home':
      return <HomeIcon {...iconProps} />;
    case 'Calendar':
      return <CalendarIcon {...iconProps} />;
    case 'Profile':
      return <ProfileIcon {...iconProps} />;
    default:
      return null;
  }
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.background.white,
          borderTopWidth: 1,
          borderTopColor: colors.status.neutral,
          height: 90,
          paddingTop: 12,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.primary.teal,
        tabBarInactiveTintColor: colors.text.secondary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});