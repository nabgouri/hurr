import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme';

interface PinInputProps {
  length: number;
  filledCount: number;
  error?: boolean;
  shakeAnim?: Animated.Value;
}

export default function PinInput({ length, filledCount, error, shakeAnim }: PinInputProps) {
  return (
    <Animated.View
      style={[
        styles.container,
        shakeAnim && { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < filledCount && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
