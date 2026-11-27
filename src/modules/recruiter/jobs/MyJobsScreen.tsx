import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SkeletonList } from '../../../components/animated';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton, AppText, Card, EmptyState } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { ScreenLayout } from '../../../layout';
import { RecruiterStackParamList } from '../../../navigation/types';
import { colors, radius, scale, sizes, spacing, vs } from '../../../theme';
import { RecruiterJob, useGetMyJobsQuery, useUpdateJobStatusMutation } from '../api/recruiterApi';

function statusLabel(status?: string) {
  return status ? status.replace(/_/g, ' ') : 'Pending';
}

function JobCard({
  job,
  onExpire,
  isUpdatingStatus,
}: {
  job: RecruiterJob;
  onExpire: () => void;
  isUpdatingStatus: boolean;
}) {
  const status = job.status ?? job.approvalStatus;
  const isExpired = status?.toUpperCase() === 'EXPIRED';
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <AppText variant="h3">{job.role}</AppText>
          <AppText color="textSecondary">{job.companyName}</AppText>
        </View>
        <View style={styles.statusPill}>
          <AppText variant="caption" color="primary" style={styles.statusText}>
            {statusLabel(status)}
          </AppText>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <AppText variant="caption" color="textMuted">
            Salary
          </AppText>
          <AppText variant="bodyBold">{job.salary}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText variant="caption" color="textMuted">
            Experience
          </AppText>
          <AppText variant="bodyBold">{job.experience}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText variant="caption" color="textMuted">
            Vacancies
          </AppText>
          <AppText variant="bodyBold">{job.candidateVacancies}</AppText>
        </View>
        <View style={styles.metaItem}>
          <AppText variant="caption" color="textMuted">
            Location
          </AppText>
          <AppText variant="bodyBold">{job.location}</AppText>
        </View>
      </View>
      {!isExpired ? (
        <AppButton
          title="Mark as Expired"
          onPress={onExpire}
          loading={isUpdatingStatus}
          disabled={isUpdatingStatus}
          variant="outline"
          style={styles.expireButton}
        />
      ) : null}
    </Card>
  );
}

/**
 * My Jobs
 * Posted jobs with approval status (pending / approved / closed).
 */
export default function MyJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RecruiterStackParamList>>();
  const { data: jobs = [], isLoading, isFetching, isError, refetch } = useGetMyJobsQuery();
  const [updateJobStatus, { isLoading: isUpdatingStatus }] = useUpdateJobStatusMutation();
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const confirmExpireJob = (job: RecruiterJob) => {
    Alert.alert(
      'Mark job as expired?',
      `This will stop new applications for ${job.role}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, expire',
          style: 'destructive',
          onPress: async () => {
            setUpdatingJobId(job.id);
            try {
              await updateJobStatus({ jobId: job.id, status: 'EXPIRED' }).unwrap();
              Alert.alert('Job expired', `${job.role} is no longer accepting applications.`);
            } catch (error) {
              const apiError = error as { data?: { message?: string; error?: string } };
              Alert.alert('Unable to update job', apiError.data?.message ?? apiError.data?.error ?? 'Please try again.');
            } finally {
              setUpdatingJobId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout
      showHeader={false}
      edges={['top']}
      scroll={false}
      padded={false}
      rootStyle={styles.transparentRoot}
      mainBackground="transparent">
      <View style={styles.screenContent}>
      <View style={styles.screenHeader}>
        <View style={styles.headerSide} />
        <AppText variant="h3" style={styles.screenTitle}>My Jobs</AppText>
        <View style={[styles.headerSide, styles.headerRight]}>
          <Pressable
            onPress={() => navigation.navigate('PostJob')}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Post a job">
            <Plus size={sizes.iconMd} color={colors.primary} />
          </Pressable>
        </View>
      </View>
      {isLoading ? (
        <SkeletonList count={3} variant="card" />
      ) : isError ? (
        <View style={styles.state}>
          <EmptyState title="Could not load jobs" message="Pull to refresh or try again." />
          <AppButton title="Retry" onPress={() => refetch()} variant="outline" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                refetch();
              }}
            />
          }>
          {jobs.length === 0 ? (
            <EmptyState title="No jobs posted" message="Create your first recruiter job post." />
          ) : (
            jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onExpire={() => confirmExpireJob(job)}
                isUpdatingStatus={isUpdatingStatus && updatingJobId === job.id}
              />
            ))
          )}
        </ScrollView>
      )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  transparentRoot: { backgroundColor: 'transparent' },
  screenContent: { flex: 1 },
  screenHeader: {
    minHeight: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
  },
  headerSide: { width: scale(40), alignItems: 'flex-start' },
  headerRight: { alignItems: 'flex-end' },
  screenTitle: { flex: 1, textAlign: 'center' },
  addButton: {
    width: scale(40), height: scale(40), borderRadius: scale(20),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.10)',
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.16)',
  },
  content: { padding: spacing.lg, paddingBottom: vs(96) },
  state: { padding: spacing.lg, gap: spacing.md },
  card: {},
  expireButton: { alignSelf: 'flex-start', marginTop: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  titleBlock: { flex: 1 },
  statusPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
  },
  statusText: { fontWeight: '700' },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -scale(4),
  },
  metaItem: {
    width: '50%',
    paddingHorizontal: scale(4),
    marginTop: spacing.sm,
  },
});
