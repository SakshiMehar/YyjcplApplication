import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Schedule Interview
 * Pick date, time, mode and location/link for an interview.
 */
export default function ScheduleInterviewScreen() {
  return (
    <ScreenLayout title="Schedule Interview">
      <Card>
        <AppText variant="h3">Schedule Interview</AppText>
        <AppText color="textSecondary">Pick date, time, mode and location/link for an interview.</AppText>
      </Card>
    </ScreenLayout>
  );
}
