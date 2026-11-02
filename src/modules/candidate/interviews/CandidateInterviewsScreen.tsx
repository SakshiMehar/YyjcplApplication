import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Interviews
 * Upcoming and past interviews with date, mode and location/link.
 */
export default function CandidateInterviewsScreen() {
  return (
    <ScreenLayout title="Interviews" showBack={false} edges={['top']}>
      <Card>
        <AppText variant="h3">Interviews</AppText>
        <AppText color="textSecondary">Upcoming and past interviews with date, mode and location/link.</AppText>
      </Card>
    </ScreenLayout>
  );
}
