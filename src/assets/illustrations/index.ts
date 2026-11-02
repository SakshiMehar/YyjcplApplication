import { ImageSourcePropType } from 'react-native';

/**
 * Optional 3D / designer illustrations.
 *
 * The screens draw their own vector illustrations by default. To use your own
 * artwork instead, put a square transparent PNG in this folder and replace `null`, e.g.
 *   onboardingJobSeeker: require('./onboarding-job-seeker.png'),
 * Then restart Metro.
 */
export const ILLUSTRATIONS: Record<
  'splash' | 'onboardingJobSeeker' | 'onboardingEmployer',
  ImageSourcePropType | null
> = {
  splash: require('./splash-duo.png'),
  onboardingJobSeeker: null,
  onboardingEmployer: require('./onboarding-employer.png'),
};

/** Round avatars on the "Select Your Role" cards (cropped from the 3D characters). */
export const ROLE_AVATARS = {
  CANDIDATE: require('./role-job-seeker.png'),
  RECRUITER: require('./role-recruiter.png'),
} as const;
