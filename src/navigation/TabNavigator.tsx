import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Ban,
  List,
  Settings,
} from 'lucide-react-native';
import { TabParamList } from './types';
import { colors, fonts, fontSizes } from '../theme';

// Import screens
import BlockingScreen from '../screens/BlockingScreen';
import BlocklistScreen from '../screens/BlocklistScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  name: 'blocking' | 'blocklist' | 'settings';
  focused: boolean;
  color: string;
}

const TabIcon = ({ name, focused, color }: TabIconProps) => {
  const iconProps = {
    size: 24,
    color,
    strokeWidth: focused ? 2 : 1.5,
  };

  const renderIcon = () => {
    switch (name) {
      case 'blocking':
        return <Ban {...iconProps} />;
      case 'blocklist':
        return <List {...iconProps} />;
      case 'settings':
        return <Settings {...iconProps} />;
      default:
        return <Ban {...iconProps} />;
    }
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      {renderIcon()}
    </View>
  );
};

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Blocking"
        component={BlockingScreen}
        options={{
          tabBarLabel: t('navigation.blocking'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="blocking" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Blocklist"
        component={BlocklistScreen}
        options={{
          tabBarLabel: t('navigation.blocklist'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="blocklist" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('navigation.settings'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    backgroundColor: colors.primaryLight + '30',
  },
});
