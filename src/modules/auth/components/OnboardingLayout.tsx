import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { AppButton, AppText, PageDots } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { colors, font, scale, spacing, vs } from '../../../theme';
import AuthGradientButton from './AuthGradientButton';

type Props = {
  title: string;
  highlight: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  /** Receives the computed responsive size for the artwork. */
  renderIllustration?: (size: number) => React.ReactNode;
  backgroundImage?: ImageSourcePropType;
  onNext: () => void;
};

/** Shared layout for onboarding screens: text on top, artwork in middle, dots + Next at bottom. */
export default function OnboardingLayout({
  title,
  highlight,
  subtitle,
  step,
  totalSteps,
  renderIllustration,
  backgroundImage,
  onNext,
}: Props) {
  const { width, height } = useWindowDimensions();
  const isFocused = useIsFocused();
  const artSize = Math.min(width - spacing.xl * 2, height * 0.42, scale(380));
  const textBlock = (
    <View style={styles.textBlock}>
      <AppText variant="h1" style={styles.heading}>{title}</AppText>
      <AppText variant="h1" color="primary" style={styles.heading}>
        {highlight}
      </AppText>
      <AppText color="textSecondary" style={styles.subtitle}>
        {subtitle}
      </AppText>
    </View>
  );

  return (
    <ScreenLayout
      showHeader={false}
      edges={backgroundImage ? [] : undefined}
      scroll={backgroundImage ? false : undefined}
      padded={backgroundImage ? false : undefined}
      mainBackground={backgroundImage ? colors.transparent : colors.background}>
      {isFocused ? <StatusBar hidden={Boolean(backgroundImage)} /> : null}
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="stretch"
          style={styles.fullScreenBackground}>
          <View style={styles.backgroundText}>{textBlock}</View>
          {renderIllustration ? (
            <View style={styles.fullScreenArt}>{renderIllustration(artSize)}</View>
          ) : null}
          <View style={styles.fullScreenDots}>
            <PageDots total={totalSteps} active={step} />
          </View>
          <AuthGradientButton title="Next" onPress={onNext} />
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          {textBlock}
          {renderIllustration ? (
            <View style={styles.art}>{renderIllustration(artSize)}</View>
          ) : null}
          <View style={styles.bottom}>
            <PageDots total={totalSteps} active={step} />
            <AppButton title="Next" onPress={onNext} />
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: scale(520),
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: vs(8),
  },
  fullScreenBackground: { flex: 1, width: '100%' },
  backgroundText: {
    width: '100%',
    maxWidth: scale(520),
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: vs(28),
  },
  fullScreenDots: {
    position: 'absolute',
    top: '81%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fullScreenArt: {
    position: 'absolute',
    top: '34%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  textBlock: { marginTop: vs(28) },
  heading: {
    fontSize: font(34),
    lineHeight: vs(40),
    fontWeight: '700',
  },
  subtitle: {
    marginTop: vs(12),
    maxWidth: scale(340),
    fontSize: font(18),
    lineHeight: vs(25),
  },
  art: { alignItems: 'center', justifyContent: 'center', marginVertical: vs(16) },
  bottom: { gap: vs(24) },
});
