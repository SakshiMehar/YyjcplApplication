import React from 'react';
import UserDirectory from '../users/UserDirectory';

/** Recruiters – every employer account on the platform. */
export default function AdminRecruitersScreen() {
  return <UserDirectory type="RECRUITER" />;
}
