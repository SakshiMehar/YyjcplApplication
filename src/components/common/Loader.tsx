import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieAnimation from '../animated/LottieAnimation';
import { scale } from '../../theme';

/** Full-screen loading state – bouncing brand-coloured dots (Lottie). */
export default function Loader() {
  return (
    <View style={styles.container} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <LottieAnimation name="loading" size={scale(56)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
