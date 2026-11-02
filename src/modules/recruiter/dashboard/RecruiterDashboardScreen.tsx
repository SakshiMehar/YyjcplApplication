import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BriefcaseBusiness, CircleCheckBig, FileText, Star } from 'lucide-react-native';
import { AppText, EmptyState, SectionHeader } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { RecruiterStackParamList, RecruiterTabParamList } from '../../../navigation/types';
import { getPendingCompany } from '../../../services/secureStorage';
import { useAppSelector } from '../../../store/hooks';
import { colors, scale, spacing, vs } from '../../../theme';
import { DEV_NO_BACKEND } from '../../../utils/dev';
import { useGetNotificationsQuery } from '../../shared/api/sharedApi';
import {
  useGetActiveJobsCountQuery,
  useGetApplicationsCountQuery,
  useGetCompanyQuery,
  useGetJobApplicationsQuery,
  useGetJobsCountQuery,
  useGetShortlistedCountQuery,
} from '../api/recruiterApi';
import DashboardHeader from './components/DashboardHeader';
import PostJobBanner from './components/PostJobBanner';
import RecentApplicationRow from './components/RecentApplicationRow';
import StatCard from './components/StatCard';
import { SAMPLE_APPLICATIONS, SAMPLE_STATS } from './sampleDashboard';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

const RECENT_COUNT = 5;

/**
 * Recruiter Dashboard
 *  greeting · 2×2 stats · post-job CTA · recent applications
 */
export default function RecruiterDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector(s => s.auth.user);

  // Immediately show the company name the recruiter typed at registration,
  // even before GET /api/recruiter/company resolves on first login.
  const [pendingName, setPendingName] = useState<string | null>(null);
  useEffect(() => {
    getPendingCompany()
      .then(p => p && setPendingName(p.companyName))
      .catch(() => {});
  }, []);

  const { data: company } = useGetCompanyQuery();
  const { data: totalJobs, isError: jobsErr }          = useGetJobsCountQuery();
  const { data: activeJobs, isError: activeErr }       = useGetActiveJobsCountQuery();
  const { data: appsCount, isError: appsErr }          = useGetApplicationsCountQuery();
  const { data: shortlistedCount, isError: shortErr }  = useGetShortlistedCountQuery();
  const recent        = useGetJobApplicationsQuery();
  const { data: notifications } = useGetNotificationsQuery({ page: 1 });
  const hasUnread = !!notifications?.items.some(n => !n.read);

  const openTab = (screen: keyof RecruiterTabParamList) =>
    navigation.navigate('RecruiterTabs', { screen });

  // real data, or labelled samples in a debug build while the API isn't available
  const useSamples = DEV_NO_BACKEND && (jobsErr || appsErr);
  const stats = useSamples
    ? SAMPLE_STATS
    : { totalJobs, activeJobs, applications: appsCount, shortlisted: shortlistedCount };
  const recentApps = (useSamples ? [] : (recent.data ?? [])).slice(
    0,
    RECENT_COUNT,
  );

  return (
    <ScreenLayout
      showHeader={false}
      padded={false}
      edges={['top']}
      mainBackground={colors.surface}>
      <View style={styles.content}>
        <DashboardHeader
          companyName={company?.name ?? pendingName ?? (useSamples ? 'XYZ Technologies' : undefined)}
          logoUrl={company?.logoUrl}
          hasUnread={hasUnread}
          onLogoPress={() => openTab('CompanyProfile')}
          onBellPress={() => navigation.navigate('Notifications')}
        />

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <StatCard
              label="Total Jobs"
              value={stats.totalJobs}
              icon={BriefcaseBusiness}
              tint="primary"
              onPress={() => openTab('MyJobs')}
            />
            <StatCard
              label="Active Jobs"
              value={stats.activeJobs}
              icon={CircleCheckBig}
              tint="success"
              onPress={() => openTab('MyJobs')}
            />
          </View>
          <View style={styles.gridRow}>
            <StatCard
              label="Applications"
              value={stats.applications}
              icon={FileText}
              tint="info"
              onPress={() => openTab('Applications')}
            />
            <StatCard
              label="Shortlisted"
              value={stats.shortlisted}
              icon={Star}
              tint="warning"
              onPress={() => navigation.navigate('Shortlist')}
            />
          </View>
        </View>

        <View style={styles.block}>
          <PostJobBanner onPress={() => navigation.navigate('PostJob')} />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recent Applications"
            actionLabel="See all"
            onActionPress={() => openTab('Applications')}
          />

          {useSamples ? (
            <AppText variant="caption" color="textMuted" style={styles.devNote}>
              Showing sample data – recruiter API not connected yet (dev only)
            </AppText>
          ) : null}

          {recent.isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : recentApps.length === 0 ? (
            <EmptyState
              title={recent.isError ? "Couldn't load applications" : 'No applications yet'}
              message={
                recent.isError
                  ? 'Check your internet connection and try again.'
                  : 'Post a job to start receiving applications.'
              }
            />
          ) : (
            recentApps.map(app => (
              <RecentApplicationRow
                key={String(app.applicationId)}
                application={app}
                onPress={
                  useSamples
                    ? undefined
                    : () => navigation.navigate('ApplicantDetails', { application: app })
                }
              />
            ))
          )}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: scale(560),
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(12),
    paddingBottom: vs(24),
  },
  grid: { marginTop: vs(22), gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  block: { marginTop: vs(20) },
  section: { marginTop: vs(28) },
  devNote: { marginTop: -vs(6), marginBottom: vs(10) },
  loader: { marginVertical: vs(32) },
});
