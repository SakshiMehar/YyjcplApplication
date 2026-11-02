import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleX,
  Clock3,
  MapPin,
  Video,
} from 'lucide-react-native';
import { AppButton, AppText, Card, EmptyState } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, scale, spacing, vs } from '../../../theme';
import { JobSeekerApplication, useGetMyApplicationsQuery } from '../api/candidateApi';
import ApplicationStatusBadge from './ApplicationStatusBadge';

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'NEXT_ROUND'] as const;
const LABELS: Record<string, string> = {
  APPLIED: 'Application submitted',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  NEXT_ROUND: 'Next interview round',
  SELECTED: 'Selected',
  NOT_SELECTED: 'Not selected',
  REJECTED: 'Application rejected',
  PLACED: 'Placed',
};

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

function Timeline({ application }: { application: JobSeekerApplication }) {
  const status = application.status.toUpperCase();
  const terminal = ['SELECTED', 'NOT_SELECTED', 'REJECTED', 'PLACED'].includes(status);
  const history = application.timeline?.filter(item => item.status.trim().length > 0) ?? [];
  const currentStageIndex = STAGES.indexOf(status as (typeof STAGES)[number]);
  const inferredStages = currentStageIndex >= 0
    ? STAGES.slice(0, currentStageIndex + 1)
    : status === 'SELECTED' || status === 'PLACED'
      ? [...STAGES, status]
      : terminal
        ? ['APPLIED', status]
        : ['APPLIED'];
  const stages = history.length
    ? [
        ...history,
        ...(history.some(item => item.status.toUpperCase() === status)
          ? []
          : [{ status, changedAt: undefined, note: undefined }]),
      ]
    : inferredStages.map(stage => ({
        status: stage,
        changedAt: stage === 'APPLIED' ? application.appliedAt : undefined,
        note: undefined,
      }));

  return (
    <Card>
      {stages.map((stage, index) => {
        const complete = index < stages.length;
        const isCurrent = index === stages.length - 1;
        const stageStatus = stage.status.toUpperCase();
        return (
          <View key={`${stageStatus}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineTrack}>
              {complete ? (
                <CheckCircle2
                  size={scale(20)}
                  color={stageStatus === 'REJECTED' || stageStatus === 'NOT_SELECTED' ? colors.danger : colors.success}
                />
              ) : (
                <Circle size={scale(20)} color={colors.border} />
              )}
              {index < stages.length - 1 ? (
                <View style={[styles.timelineLine, complete && styles.timelineLineComplete]} />
              ) : null}
            </View>
            <View style={styles.timelineText}>
              <AppText variant="bodyBold" color={isCurrent ? 'text' : 'textSecondary'}>
                {LABELS[stageStatus] ?? stageStatus.replace(/_/g, ' ')}
              </AppText>
              {formatDate(stage.changedAt) ? (
                <AppText variant="caption" color="textMuted">{formatDate(stage.changedAt)}</AppText>
              ) : null}
              {stage.note ? (
                <AppText variant="caption" color="textSecondary">{stage.note}</AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

function ScheduleCard({
  title,
  schedule,
}: {
  title: string;
  schedule: JobSeekerApplication['interview'];
}) {
  if (!schedule) return null;
  return (
    <Card>
      <AppText variant="bodyBold" style={styles.sectionHeading}>{title}</AppText>
      {schedule.scheduledAt ? (
        <View style={styles.detailRow}>
          <CalendarDays size={scale(17)} color={colors.primary} />
          <AppText variant="body" style={styles.detailText}>{formatDate(schedule.scheduledAt)}</AppText>
        </View>
      ) : null}
      {schedule.mode ? (
        <View style={styles.detailRow}>
          {schedule.mode.toUpperCase() === 'VIDEO'
            ? <Video size={scale(17)} color={colors.primary} />
            : <Clock3 size={scale(17)} color={colors.primary} />}
          <AppText variant="body" style={styles.detailText}>
            {schedule.mode.replace(/_/g, ' ')}
          </AppText>
        </View>
      ) : null}
      {schedule.locationOrLink ? (
        <View style={styles.detailRow}>
          <MapPin size={scale(17)} color={colors.primary} />
          <AppText variant="body" style={styles.detailText}>{schedule.locationOrLink}</AppText>
        </View>
      ) : null}
      {schedule.notes ? (
        <AppText variant="caption" color="textSecondary" style={styles.notes}>
          Recruiter notes: {schedule.notes}
        </AppText>
      ) : null}
    </Card>
  );
}

function ApplicationDetails({ application }: { application: JobSeekerApplication }) {
  const status = application.status.toUpperCase();
  const title = application.job?.role ?? application.job?.title ?? `Job #${application.jobId}`;
  const showInterview = status === 'INTERVIEW_SCHEDULED' || Boolean(application.interview);
  const showNextRound = status === 'NEXT_ROUND' || Boolean(application.nextRound);

  return (
    <>
      <Card>
        <ApplicationStatusBadge status={status} />
        <AppText variant="h3" style={styles.jobTitle}>{title}</AppText>
        <AppText variant="body" color="textSecondary">
          {application.job?.companyName ?? 'Company details unavailable'}
        </AppText>
        {application.job?.location ? (
          <AppText variant="caption" color="textMuted" style={styles.jobLocation}>
            {application.job.location}
          </AppText>
        ) : null}
        {application.appliedAt ? (
          <AppText variant="caption" color="textMuted" style={styles.jobLocation}>
            Applied {formatDate(application.appliedAt)}
          </AppText>
        ) : null}
        {application.job?.description ? (
          <AppText variant="body" color="textSecondary" style={styles.description}>
            {application.job.description}
          </AppText>
        ) : null}
        {application.job?.salary || application.job?.experience ? (
          <AppText variant="caption" color="textSecondary" style={styles.jobLocation}>
            {[application.job.salary, application.job.experience].filter(Boolean).join(' · ')}
          </AppText>
        ) : null}
      </Card>

      <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>APPLICATION TIMELINE</AppText>
      <Timeline application={application} />

      {application.recruiter && (application.recruiter.name || application.recruiter.title || application.recruiter.email || application.recruiter.phone) ? (
        <Card>
          <AppText variant="bodyBold" style={styles.sectionHeading}>Recruiter</AppText>
          {application.recruiter.name ? <AppText variant="body">{application.recruiter.name}</AppText> : null}
          {application.recruiter.title ? <AppText variant="caption" color="textSecondary">{application.recruiter.title}</AppText> : null}
          {application.recruiter.email ? <AppText variant="caption" color="textSecondary">{application.recruiter.email}</AppText> : null}
          {application.recruiter.phone ? <AppText variant="caption" color="textSecondary">{application.recruiter.phone}</AppText> : null}
        </Card>
      ) : null}

      {showInterview ? <ScheduleCard title="Interview details" schedule={application.interview} /> : null}
      {showNextRound ? <ScheduleCard title="Next-round details" schedule={application.nextRound} /> : null}

      {status === 'SELECTED' ? (
        <Card style={styles.resultCard}>
          <CheckCircle2 size={scale(26)} color={colors.success} />
          <View style={styles.resultText}>
            <AppText variant="bodyBold">Congratulations!</AppText>
            <AppText variant="caption" color="textSecondary">
              You have been selected. The recruiter will contact you separately by email.
            </AppText>
          </View>
        </Card>
      ) : null}
      {status === 'NOT_SELECTED' || status === 'REJECTED' ? (
        <Card style={styles.rejectionCard}>
          <CircleX size={scale(24)} color={colors.danger} />
          <View style={styles.resultText}>
            <AppText variant="bodyBold">{status === 'REJECTED' ? 'Application update' : 'Not selected'}</AppText>
            <AppText variant="caption" color="textSecondary">
              {application.resultNote ?? 'You were not selected for this role. You can continue exploring other opportunities.'}
            </AppText>
          </View>
        </Card>
      ) : null}
    </>
  );
}

export default function ApplicationTrackerScreen({
  route,
}: CandidateScreenProps<'ApplicationTracker'>) {
  const { data: applications, isLoading, isError, refetch } = useGetMyApplicationsQuery();
  const application = applications?.find(
    item => String(item.applicationId) === String(route.params.applicationId),
  );

  return (
    <ScreenLayout title="Application Details">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText color="textSecondary">Loading application…</AppText>
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <EmptyState title="Couldn't load application" message="Check your connection and try again." />
          <AppButton title="Try again" onPress={() => refetch()} style={styles.retry} />
        </View>
      ) : application ? (
        <ApplicationDetails application={application} />
      ) : (
        <EmptyState title="Application not found" message="This application may no longer be available." />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  retry: { minWidth: scale(140) },
  jobTitle: { marginTop: spacing.md },
  jobLocation: { marginTop: spacing.xs },
  description: { marginTop: spacing.md },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight: '700', letterSpacing: 0.8 },
  sectionHeading: { marginBottom: spacing.md },
  timelineRow: { flexDirection: 'row', minHeight: scale(52), gap: spacing.md },
  timelineTrack: { alignItems: 'center', width: scale(22) },
  timelineLine: { width: 2, flex: 1, minHeight: scale(24), backgroundColor: colors.border },
  timelineLineComplete: { backgroundColor: colors.success },
  timelineText: { flex: 1, gap: vs(3), paddingBottom: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  detailText: { flex: 1 },
  notes: { lineHeight: vs(19), marginTop: spacing.xs },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderColor: `${colors.success}55` },
  rejectionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderColor: `${colors.danger}55` },
  resultText: { flex: 1, gap: spacing.xs },
});
