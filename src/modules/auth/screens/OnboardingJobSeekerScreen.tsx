import React from 'react';
import { ILLUSTRATIONS } from '../../../assets/illustrations';
import { IllustrationSlot, TargetIllustration } from '../../../components/illustrations';
import { AuthScreenProps } from '../../../navigation/types';
import OnboardingLayout from '../components/OnboardingLayout';

/** Onboarding 1 – for candidates. */
export default function OnboardingJobSeekerScreen({
  navigation,
}: AuthScreenProps<'OnboardingJobSeeker'>) {
  return (
    <OnboardingLayout
      title="Find Your"
      highlight="Dream Job"
      subtitle="Connect with top companies and build your future"
      step={0}
      totalSteps={3}
      renderIllustration={size => (
        <IllustrationSlot size={size} image={ILLUSTRATIONS.onboardingJobSeeker}>
          <TargetIllustration size={size} />
        </IllustrationSlot>
      )}
      onNext={() => navigation.navigate('OnboardingEmployer')}
    />
  );
}
