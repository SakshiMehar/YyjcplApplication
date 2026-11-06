import React from 'react';
import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { AuthScreenProps } from '../../../navigation/types';
import { colors, scale } from '../../../theme';

/** Splash screen using the supplied artwork with a native Get Started button. */
export default function SplashScreen({ navigation }: AuthScreenProps<'Splash'>) {
  const isFocused = useIsFocused();

  return (
    <ScreenLayout
      showHeader={false}
      edges={[]}
      padded={false}
      rootStyle={styles.root}
      mainBackground={colors.transparent}>
      {isFocused ? <StatusBar hidden /> : null}
      <ImageBackground
        source={require('../../../assets/illustrations/Your Career, Our Priority.png')}
        resizeMode="stretch"
        style={styles.background}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          onPress={() => navigation.navigate('OnboardingJobSeeker')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}>
          <View style={styles.buttonContent}>
            <AppText style={styles.buttonText}>Get Started</AppText>
            <View style={styles.arrowCircle}>
              <ChevronRight
                size={scale(22)}
                color={colors.danger}
                strokeWidth={3}
              />
            </View>
          </View>
        </Pressable>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background },
  background: {
    flex: 1,
    width: '100%',
  },
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
