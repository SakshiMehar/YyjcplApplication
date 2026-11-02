import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Raise a Complaint
 * Send a complaint to YYJCPL admin.
 */
export default function RaiseComplaintScreen() {
  return (
    <ScreenLayout title="Raise a Complaint">
      <Card>
        <AppText variant="h3">Raise a Complaint</AppText>
        <AppText color="textSecondary">Send a complaint to YYJCPL admin.</AppText>
      </Card>
    </ScreenLayout>
  );
}
