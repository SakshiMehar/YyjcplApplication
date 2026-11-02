import React from 'react';
import { AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';

/**
 * Edit Company
 * Edit company details and logo.
 */
export default function EditCompanyScreen() {
  return (
    <ScreenLayout title="Edit Company">
      <Card>
        <AppText variant="h3">Edit Company</AppText>
        <AppText color="textSecondary">Edit company details and logo.</AppText>
      </Card>
    </ScreenLayout>
  );
}
