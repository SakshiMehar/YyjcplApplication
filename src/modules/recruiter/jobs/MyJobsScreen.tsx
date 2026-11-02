import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton, AppText, Card, EmptyState, Loader } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { ScreenLayout } from '../../../layout';
import { RecruiterStackParamList } from '../../../navigation/types';
import { colors, radius, scale, sizes, spacing, vs } from '../../../theme';
import { RecruiterJob, useGetMyJobsQuery } from '../api/recruiterApi';

function statusLabel(status?: string) {
  return status ? status.replace(/_/g, ' ') : 'Pending';
}

function JobCard({ job }: { job: RecruiterJob }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <AppText variant="h3">{job.role}</AppText>
          <AppText color="textSecondary">{job.companyName}</AppText>
        </View>
        <View style={styles.statusPill}>
          <AppText variant="caption" color="primary" style={styles.statusText}>
            {statusLabel(job.approvalStatus)}
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

  return (
    <ScreenLayout
      title="My Jobs"
      showBack={false}
      edges={['top']}
      scroll={false}
      padded={false}
      right={
        <Pressable onPress={() => navigation.navigate('PostJob')} hitSlop={scale(10)}>
          <Plus size={sizes.iconMd} color={colors.primary} />
        </Pressable>
      }>
      {isLoading ? (
        <Loader />
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
          <AppButton
            title="Post a Job"
            onPress={() => navigation.navigate('PostJob')}
            style={styles.postButton}
          />
          {jobs.length === 0 ? (
            <EmptyState title="No jobs posted" message="Create your first recruiter job post." />
          ) : (
            jobs.map(job => <JobCard key={job.id} job={job} />)
          )}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: vs(96) },
  state: { padding: spacing.lg, gap: spacing.md },
  postButton: { marginBottom: spacing.md },
  card: {},
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
