import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

// Import centralized AppState provider
import { AppStateProvider } from './src/contexts/AppStateContext';

// Import blocker modules and data
import { AppBlocker } from './src/modules';
import { allAdultKeywords, adultDomains } from './src/data/adultBlocklist';
import { StorageService } from './src/services';

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
          setIsFirstLaunch(true); // TODO: revert to false after testing
        }

        // Sync blocklists to native accessibility service
        if (AppBlocker.isAvailable()) {
          const [, , blockedApps] = await Promise.all([
            AppBlocker.setBlockedKeywords(allAdultKeywords),
            AppBlocker.setBlockedDomains(adultDomains),
            StorageService.getBlockedApps(),
          ]);

          if (blockedApps.length > 0) {
            const packageNames = blockedApps.map(app => app.packageName);
            await AppBlocker.setBlockedApps(packageNames);
          }
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

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>حُر</Text>
        <Text style={styles.loadingSubtext}>تحرر من القيود الرقمية</Text>
      </View>
    );
  }

  return (
    <AppStateProvider>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator isFirstLaunch={isFirstLaunch} />
        </NavigationContainer>
      </SafeAreaProvider>
    </AppStateProvider>
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
