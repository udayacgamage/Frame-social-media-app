import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { colors, typography } from '@/theme/tokens';
import { Icon } from '@/components/common/Icon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="home"
              size={22}
              color={focused ? colors.coral : colors.secondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms/index"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="bubble-chart"
              size={22}
              color={focused ? colors.coral : colors.secondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create/index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="add-box"
              size={22}
              color={focused ? colors.coral : colors.secondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges/index"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="emoji-events"
              size={22}
              color={focused ? colors.coral : colors.secondary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="person"
              size={22}
              color={focused ? colors.coral : colors.secondary}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 84 : 56,
    paddingBottom: Platform.OS === 'ios' ? 28 : 6,
    paddingTop: 6,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    ...typography.labelSm,
    fontSize: 11,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
});
