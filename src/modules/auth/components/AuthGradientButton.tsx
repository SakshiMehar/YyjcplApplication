import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { colors, scale } from '../../../theme';

type Props = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function AuthGradientButton({ title, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.button, style, pressed && styles.buttonPressed]}>
      <View style={styles.buttonContent}>
        <AppText style={styles.buttonText}>{title}</AppText>
        <View style={styles.arrowCircle}>
          <ChevronRight size={scale(22)} color={colors.danger} strokeWidth={3} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: '20.1%',
    top: '86.3%',
    width: '60.1%',
    height: '5.8%',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundImage: 'linear-gradient(105deg, #FFA500 0%, #FF0050 100%)',
    boxShadow: `0px ${scale(7)}px ${scale(14)}px rgba(255, 35, 75, 0.38)`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonContent: {
    width: '100%',
    height: '100%',
    paddingHorizontal: '8%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scale(18),
    fontWeight: '700',
  },
  arrowCircle: {
    position: 'absolute',
    right: '3%',
    width: '14%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
