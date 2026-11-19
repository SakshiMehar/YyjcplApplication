/* eslint-disable react-native/no-inline-styles -- tile contents are sized from the scene size */
import React from 'react';
import { View } from 'react-native';
import { ILLUSTRATIONS } from '../../../assets/illustrations';
import { AppText } from '../../../components/common';
import { Avatar, HiringIllustration } from '../../../components/illustrations';
import ImageScene, { FloatingTile } from '../../../components/illustrations/ImageScene';
import { AuthScreenProps } from '../../../navigation/types';
import { colors } from '../../../theme';
import OnboardingLayout from '../components/OnboardingLayout';

/** Onboarding 2 – for recruiters / employers. */
export default function OnboardingEmployerScreen({
  navigation,
}: AuthScreenProps<'OnboardingEmployer'>) {
  return (
    <OnboardingLayout
      title="For Employers"
      highlight="Find the Right Talent"
      subtitle="Post jobs, review applications and hire the best"
      step={1}
      totalSteps={3}
      renderIllustration={size =>
        ILLUSTRATIONS.onboardingEmployer ? (
          <ImageScene size={size} image={ILLUSTRATIONS.onboardingEmployer}>
            <FloatingTile base={size} style={{ left: size * 0.02, top: size * 0.38 }}>
              <Avatar size={size * 0.085} tone="soft" />
              <View
                style={{
                  marginTop: size * 0.012,
                  width: size * 0.09,
                  height: size * 0.012,
                  borderRadius: size * 0.006,
                  backgroundColor: colors.border,
                }}
              />
            </FloatingTile>
            <FloatingTile base={size} style={{ right: size * 0.02, top: size * 0.2 }}>
              <View
                style={{
                  width: size * 0.095,
                  height: size * 0.095,
                  borderRadius: size * 0.05,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary,
                }}>
                <AppText
                  variant="bodyBold"
                  color="textOnPrimary"
                  style={{ fontSize: size * 0.055, lineHeight: size * 0.07 }}>
                  ✓
                </AppText>
              </View>
            </FloatingTile>
          </ImageScene>
        ) : (
          <HiringIllustration size={size} />
        )
      }
      backgroundImage={require('../../../assets/illustrations/interview screen.png')}
      onNext={() => navigation.navigate('Login')}
    />
  );
}
