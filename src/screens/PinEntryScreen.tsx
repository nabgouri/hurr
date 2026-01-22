import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, fontSizes } from '../theme';
import { RootStackParamList } from '../navigation/types';

type PinEntryRouteProp = RouteProp<RootStackParamList, 'PinEntry'>;

const PIN_LENGTH = 4;

export default function PinEntryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<PinEntryRouteProp>();
  const { mode } = route.params;

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const getTitle = () => {
    if (mode === 'verify') return t('pin.enterPin');
    if (step === 'enter') return t('pin.createPin');
    return t('pin.confirmPin');
  };

  const shake = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDigitPress = (digit: string) => {
    if (step === 'enter' && pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === PIN_LENGTH) {
        if (mode === 'verify') {
          // Verify PIN logic
          // For now, just go back
          navigation.goBack();
        } else {
          setStep('confirm');
        }
      }
    } else if (step === 'confirm' && confirmPin.length < PIN_LENGTH) {
      const newConfirmPin = confirmPin + digit;
      setConfirmPin(newConfirmPin);
      setError('');

      if (newConfirmPin.length === PIN_LENGTH) {
        if (newConfirmPin === pin) {
          // Save PIN logic
          navigation.goBack();
        } else {
          setError(t('pin.pinMismatch'));
          shake();
          setConfirmPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter' && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm' && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  const renderDots = () => (
    <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
      {Array(PIN_LENGTH)
        .fill(0)
        .map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < currentPin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
    </Animated.View>
  );

  const renderKeypad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
      <View style={styles.keypad}>
        {keys.map((key, index) => {
          if (key === '') {
            return <View key={index} style={styles.keyEmpty} />;
          }

          if (key === 'del') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.key}
                onPress={handleDelete}
              >
                <Text style={styles.keyTextDelete}>⌫</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.key}
              onPress={() => handleDigitPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>{getTitle()}</Text>

        {renderDots()}

        {error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorPlaceholder} />}
      </View>

      {renderKeypad()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotError: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    height: 24,
  },
  errorPlaceholder: {
    height: 40,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    backgroundColor: colors.surface,
  },
  keyEmpty: {
    width: 80,
    height: 80,
    margin: 8,
  },
  keyText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxxl,
    color: colors.textPrimary,
  },
  keyTextDelete: {
    fontSize: 28,
    color: colors.textSecondary,
  },
});
