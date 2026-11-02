import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Subscription
 * Plans and payment through the payment gateway.
 */
export default function SubscriptionScreen() {
  return (
    <ScreenLayout title="Subscription">
      <Card>
        <AppText variant="h3">Subscription</AppText>
        <AppText color="textSecondary">Plans and payment through the payment gateway.</AppText>
      </Card>
    </ScreenLayout>
  );
}
