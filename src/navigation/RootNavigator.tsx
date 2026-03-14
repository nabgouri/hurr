import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors, fonts, fontSizes } from '../theme';

// Import navigators and screens
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import PartnerSetupScreen from '../screens/PartnerSetupScreen';
import PinEntryScreen from '../screens/PinEntryScreen';
import PermissionSetupScreen from '../screens/PermissionSetupScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isFirstLaunch: boolean;
}

export default function RootNavigator({ isFirstLaunch }: RootNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={isFirstLaunch ? 'Onboarding' : 'MainTabs'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_left', // RTL-aware animation
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="PartnerSetup"
        component={PartnerSetupScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: '',
          headerTintColor: colors.primary,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: fonts.bold,
            fontSize: fontSizes.lg,
          },
        }}
      />
      <Stack.Screen
        name="PinEntry"
        component={PinEntryScreen}
        options={{
          presentation: 'modal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="PermissionSetup"
        component={PermissionSetupScreen}
      />
    </Stack.Navigator>
  );
}
