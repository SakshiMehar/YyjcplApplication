import React from 'react';
import { Image, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ILLUSTRATIONS } from '../../../assets/illustrations';
import { AppButton, AppText } from '../../../components/common';
import { IllustrationSlot, SplashIllustration } from '../../../components/illustrations';
import { APP_TAGLINE } from '../../../constants/app';
import { ScreenLayout } from '../../../layout';
import { AuthScreenProps } from '../../../navigation/types';
import { colors, gradients, radius, scale, spacing, vs } from '../../../theme';

/** Splash / welcome – orange gradient, logo, tagline, artwork, Get Started. */
export default function SplashScreen({ navigation }: AuthScreenProps<'Splash'>) {
  const { width, height } = useWindowDimensions();
  const artSize = ILLUSTRATIONS.splash
    ? Math.min(width - spacing.lg * 2, height * 0.46, scale(460))
    : Math.min(width * 0.82, height * 0.4, scale(380));
  const brandSize = Math.min(width * 0.58, scale(240), height * 0.3);
  const stageW = artSize * 0.95;
  const stageH = artSize * 0.14;

  // white status-bar icons only while this screen is visible
  const isFocused = useIsFocused();

  return (
    <ScreenLayout
      showHeader={false}
      rootStyle={styles.root}
      mainBackground={colors.transparent}>
      {isFocused ? <StatusBar barStyle="light-content" /> : null}
      <View style={styles.container}>
        <View style={styles.brand}>
          <View style={[styles.logoCard, { width: brandSize, height: brandSize }]}>
            <Image
              source={require('../../../assets/icons/AppIcon.jpeg')}
              style={styles.logo}
              resizeMode="contain"
              accessible
              accessibilityLabel="YYJCPL company logo"
            />
          </View>
          <AppText
            color="textOnPrimary"
            align="center"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.tagline}>
            {APP_TAGLINE}
          </AppText>
        </View>

        <View style={styles.art}>
          {/* soft white platform the characters stand on */}
          <View
            style={[
              styles.stage,
              {
                // a circle squashed vertically = a true soft ellipse
                width: stageW,
                height: stageW,
                borderRadius: stageW / 2,
                bottom: stageH / 2 - stageW / 2 - stageH * 0.3,
                transform: [{ scaleY: stageH / stageW }],
                boxShadow: `0px 0px ${stageW * 0.12}px ${stageW * 0.04}px rgba(255,255,255,0.3)`,
              },
            ]}
          />
          <IllustrationSlot size={artSize} image={ILLUSTRATIONS.splash}>
            <SplashIllustration size={artSize} />
          </IllustrationSlot>
        </View>

        <AppButton
          title="Get Started"
          variant="onDark"
          onPress={() => navigation.navigate('OnboardingJobSeeker')}
          style={styles.button}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.primary, backgroundImage: gradients.primary },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(36),
    paddingBottom: vs(12),
    paddingHorizontal: spacing.sm,
  },
  brand: { alignItems: 'center', gap: vs(10) },
  logoCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: colors.background,
    padding: scale(4),
    boxShadow: `0px ${vs(5)}px ${scale(18)}px rgba(90, 40, 0, 0.2)`,
  },
  logo: { width: '100%', height: '100%' },
  art: { alignItems: 'center', justifyContent: 'flex-end' },
  stage: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.2)' },
  tagline: { opacity: 0.95, paddingHorizontal: spacing.sm },
  button: { width: '100%', maxWidth: scale(520) },
});
