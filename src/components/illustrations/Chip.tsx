import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme';
import AppText from '../common/AppText';

type Props = {
  /** Size of the parent illustration – the chip scales from it. */
  base: number;
  label: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Small floating white card used inside illustrations. */
export default function Chip({ base: s, label, icon, style }: Props) {
  return (
    <View
      style={[
        styles.chip,
        {
          gap: s * 0.02,
          paddingVertical: s * 0.022,
          paddingHorizontal: s * 0.035,
          borderRadius: s * 0.04,
          boxShadow: `0px ${s * 0.015}px ${s * 0.04}px rgba(28, 25, 23, 0.12)`,
        },
        style,
      ]}>
      {icon ?? (
        <View
          style={{
            width: s * 0.035,
            height: s * 0.035,
            borderRadius: s * 0.02,
            backgroundColor: colors.primary,
          }}
        />
      )}
      <AppText variant="bodyBold" style={{ fontSize: s * 0.04, lineHeight: s * 0.055 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
