import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Tab Navigator params
export type TabParamList = {
  Blocking: undefined;
  Blocklist: undefined;
  Settings: undefined;
};

// Root Stack Navigator params
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  PartnerSetup: undefined;
  PinEntry: { mode: 'create' | 'verify' | 'change' };
  PermissionSetup: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<
  TabParamList,
  T
>;
