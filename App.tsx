import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import i18n configuration (must be imported before components that use translations)
import './src/i18n';

// Import fonts
import { fontAssets } from './src/theme/fonts';
import { colors, fonts, fontSizes } from './src/theme';

// Import navigation
import { RootNavigator } from './src/navigation';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const FIRST_LAUNCH_KEY = '@hur_first_launch';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Load fonts
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    async function prepare() {
      try {
        // Check if this is the first launch
        const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
        } else {
          setIsFirstLaunch(false);
        }
      } catch (e) {
        console.warn('Error in app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  // Log RTL status for debugging
  useEffect(() => {
    console.log('RTL Status:', I18nManager.isRTL);
  }, []);

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>حُر</Text>
        <Text style={styles.loadingSubtext}>تحرر من القيود الرقمية</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator isFirstLaunch={isFirstLaunch} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.display,
    color: colors.primary,
  },
  loadingSubtext: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginTop: 8,
  },
});
