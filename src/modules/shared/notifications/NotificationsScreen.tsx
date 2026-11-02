import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Notifications
 * Push and in-app notifications (FCM).
 */
export default function NotificationsScreen() {
  return (
    <ScreenLayout title="Notifications">
      <Card>
        <AppText variant="h3">Notifications</AppText>
        <AppText color="textSecondary">Push and in-app notifications (FCM).</AppText>
      </Card>
    </ScreenLayout>
  );
}
