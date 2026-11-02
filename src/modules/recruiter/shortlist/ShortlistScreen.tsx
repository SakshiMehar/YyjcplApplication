import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Shortlist
 * Shortlisted candidates per job.
 */
export default function ShortlistScreen() {
  return (
    <ScreenLayout title="Shortlist">
      <Card>
        <AppText variant="h3">Shortlist</AppText>
        <AppText color="textSecondary">Shortlisted candidates per job.</AppText>
      </Card>
    </ScreenLayout>
  );
}
