import React from 'react';
import { View, ViewProps, StyleSheet, I18nManager } from 'react-native';

interface RTLViewProps extends ViewProps {
  row?: boolean;
  children: React.ReactNode;
}

export default function RTLView({ row, children, style, ...props }: RTLViewProps) {
  return (
    <View
      style={[
        row && styles.row,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  },
});
