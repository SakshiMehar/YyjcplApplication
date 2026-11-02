import { ColorName } from '../theme/colors';

/**
 * Recruitment pipeline:
 * APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → NEXT_ROUND → SELECTED
 * (REJECTED / NOT_SELECTED / WITHDRAWN can happen at any step)
 */
export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  NEXT_ROUND: 'NEXT_ROUND',
  SELECTED: 'SELECTED',
  NOT_SELECTED: 'NOT_SELECTED',
  PLACED: 'PLACED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

/** Ordered steps used by the application tracker timeline. */
export const APPLICATION_PIPELINE: ApplicationStatus[] = [
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  APPLICATION_STATUS.NEXT_ROUND,
  APPLICATION_STATUS.SELECTED,
  APPLICATION_STATUS.PLACED,
];

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: ColorName }
> = {
  APPLIED: { label: 'Applied', color: 'info' },
  SHORTLISTED: { label: 'Shortlisted', color: 'primary' },
  INTERVIEW_SCHEDULED: { label: 'Interview', color: 'warning' },
  NEXT_ROUND: { label: 'Next round', color: 'info' },
  SELECTED: { label: 'Selected', color: 'success' },
  NOT_SELECTED: { label: 'Not selected', color: 'textMuted' },
  PLACED: { label: 'Placed', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'danger' },
  WITHDRAWN: { label: 'Withdrawn', color: 'textMuted' },
};
