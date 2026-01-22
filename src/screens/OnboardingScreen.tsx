import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bird,
  Smartphone,
  Globe,
  Users,
  KeyRound,
  ChevronLeft,
  ArrowLeft,
} from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: 'bird' | 'smartphone' | 'globe' | 'users' | 'key';
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'bird',
    titleKey: 'onboarding.welcome',
    descriptionKey: 'onboarding.welcomeDescription',
    color: colors.primary,
  },
  {
    id: '2',
    icon: 'smartphone',
    titleKey: 'apps.title',
    descriptionKey: 'apps.selectAppsToBlock',
    color: colors.secondary,
  },
  {
    id: '3',
    icon: 'globe',
    titleKey: 'websites.title',
    descriptionKey: 'websites.vpnExplanation',
    color: colors.accent,
  },
  {
    id: '4',
    icon: 'users',
    titleKey: 'partner.title',
    descriptionKey: 'partner.description',
    color: colors.tertiary,
  },
  {
    id: '5',
    icon: 'key',
    titleKey: 'onboarding.permissions',
    descriptionKey: 'onboarding.permissionsDescription',
    color: colors.success,
  },
];

const SlideIcon = ({ icon, color }: { icon: string; color: string }) => {
  const iconProps = { size: 80, color, strokeWidth: 1.5 };

  switch (icon) {
    case 'bird':
      return <Bird {...iconProps} />;
    case 'smartphone':
      return <Smartphone {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'key':
      return <KeyRound {...iconProps} />;
    default:
      return <Bird {...iconProps} />;
  }
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <SlideIcon icon={item.icon} color={item.color} />
      </View>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.description}>{t(item.descriptionKey)}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 24, 10],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          <ArrowLeft size={16} color={colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {renderDots()}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1
              ? t('onboarding.getStarted')
              : t('onboarding.next')}
          </Text>
          <ChevronLeft size={20} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skipButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.lg * 1.6,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textOnPrimary,
  },
});
