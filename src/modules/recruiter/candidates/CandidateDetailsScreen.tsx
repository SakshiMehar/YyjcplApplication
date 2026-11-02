import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Candidate
 * Candidate profile viewed by the recruiter.
 */
export default function CandidateDetailsScreen() {
  return (
    <ScreenLayout title="Candidate">
      <Card>
        <AppText variant="h3">Candidate</AppText>
        <AppText color="textSecondary">Candidate profile viewed by the recruiter.</AppText>
      </Card>
    </ScreenLayout>
  );
}
