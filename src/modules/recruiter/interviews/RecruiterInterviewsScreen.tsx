import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Interviews
 * All scheduled interviews; mark candidates selected or rejected.
 */
export default function RecruiterInterviewsScreen() {
  return (
    <ScreenLayout title="Interviews">
      <Card>
        <AppText variant="h3">Interviews</AppText>
        <AppText color="textSecondary">All scheduled interviews; mark candidates selected or rejected.</AppText>
      </Card>
    </ScreenLayout>
  );
}
