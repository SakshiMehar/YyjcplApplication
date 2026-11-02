import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Search Candidates
 * Search candidate database by skills, location and experience.
 */
export default function CandidateSearchScreen() {
  return (
    <ScreenLayout title="Search Candidates" showBack={false} edges={['top']}>
      <Card>
        <AppText variant="h3">Search Candidates</AppText>
        <AppText color="textSecondary">Search candidate database by skills, location and experience.</AppText>
      </Card>
    </ScreenLayout>
  );
}
