import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppButton, AppText, PageDots } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { colors, scale, spacing, vs } from '../../../theme';

type Props = {
  title: string;
  highlight: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  /** Receives the computed responsive size for the artwork. */
  renderIllustration: (size: number) => React.ReactNode;
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
  onNext,
}: Props) {
  const { width, height } = useWindowDimensions();
  const artSize = Math.min(width - spacing.xl * 2, height * 0.42, scale(380));

  return (
    <ScreenLayout showHeader={false} mainBackground={colors.background}>
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <AppText variant="h1">{title}</AppText>
          <AppText variant="h1" color="primary">
            {highlight}
          </AppText>
          <AppText color="textSecondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        </View>

        <View style={styles.art}>{renderIllustration(artSize)}</View>

        <View style={styles.bottom}>
          <PageDots total={totalSteps} active={step} />
          <AppButton title="Next" onPress={onNext} />
        </View>
      </View>
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
  textBlock: { marginTop: vs(28) },
  subtitle: { marginTop: vs(10), maxWidth: scale(280) },
  art: { alignItems: 'center', justifyContent: 'center', marginVertical: vs(16) },
  bottom: { gap: vs(24) },
});
