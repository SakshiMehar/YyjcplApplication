import React from 'react';
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
      backgroundImage={require('../../../assets/illustrations/splash1.png')}
      onNext={() => navigation.navigate('OnboardingEmployer')}
    />
  );
}
