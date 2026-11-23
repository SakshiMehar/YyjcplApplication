import React from 'react';
import UserDirectory from '../users/UserDirectory';

/** Candidates – every job seeker on the platform. */
export default function AdminCandidatesScreen() {
  return <UserDirectory type="JOB_SEEKER" />;
}
