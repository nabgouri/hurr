import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
  Keyboard,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height,
}: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(screenHeight);
      keyboardOffset.setValue(0);
    }
  }, [visible, translateY, keyboardOffset, screenHeight]);

  // Android Modal has its own window, so keyboard doesn't push content up.
  // Manually shift the sheet by keyboard height.
  useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return;

    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      keyboardOffset.setValue(0);
    };
  }, [visible, keyboardOffset]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const sheetHeight =
    typeof height === 'string'
      ? { height: screenHeight * (parseFloat(height) / 100) }
      : height
        ? { height }
        : {};

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.sheet,
            sheetHeight,
            { maxHeight: screenHeight * 0.9 },
            { transform: [{ translateY }, { translateY: keyboardOffset }] },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          {title && (
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
          <View style={height ? styles.childrenFlex : undefined}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
  },
  childrenFlex: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
});
