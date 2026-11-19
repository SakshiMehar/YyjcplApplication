import React from 'react';
import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '../../../layout';
import { AuthScreenProps } from '../../../navigation/types';
import { colors } from '../../../theme';

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
          style={styles.startButton}
        />
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
  startButton: {
    position: 'absolute',
    left: '20.1%',
    top: '86.3%',
    width: '60.1%',
    height: '5.8%',
  },
});
