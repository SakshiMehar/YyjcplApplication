import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin } from 'lucide-react-native';
import { AppText, EmptyState, SearchBar, SectionHeader } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { ScreenLayout } from '../../../layout';
import { CandidateStackParamList, CandidateTabParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { useGetJobSeekerJobsQuery, JobSeekerJob } from '../api/candidateApi';
import { useGetNotificationsQuery } from '../../shared/api/sharedApi';
import HomeHeader from './components/HomeHeader';
import CandidateMoreMenu, { MoreMenuAction } from './components/CandidateMoreMenu';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

/* ─── Inline job card (uses JobSeekerJob shape) ─────────────────────────── */
function HomeJobCard({
  job,
  onPress,
}: {
  job: JobSeekerJob;
  onPress: () => void;
}) {
  const initials = (job.companyName ?? '')
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.jobCard, pressed && styles.jobCardPressed]}
      accessibilityRole="button">
      <View style={styles.jobAvatar}>
        <AppText style={styles.jobAvatarText}>{initials || '?'}</AppText>
      </View>
      <View style={styles.jobBody}>
        <AppText variant="bodyBold" numberOfLines={1}>{job.role}</AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {job.companyName}
        </AppText>
        <View style={styles.jobMeta}>
          <MapPin size={scale(11)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.jobMetaText}>
            {job.location}
            {job.salary ? `  ·  ${job.salary}` : ''}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CandidateHomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector(s => s.auth.user);
  const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

  const jobsQuery = useGetJobSeekerJobsQuery();
  const { data: notifications } = useGetNotificationsQuery({ page: 1 });
  const hasUnread = !!notifications?.items.some(n => !n.read);

  const openTab = (screen: keyof CandidateTabParamList) =>
    navigation.navigate('CandidateTabs', { screen });

  const jobs = jobsQuery.data ?? [];

  const handleMoreMenu = (action: MoreMenuAction) => {
    switch (action) {
      case 'profile':
      case 'performance':
        openTab('CandidateProfile');
        break;
      case 'search':
      case 'recommended':
        openTab('JobSearch');
        break;
      case 'applied':
        openTab('MyApplications');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'writeToUs':
        navigation.navigate('RaiseComplaint');
        break;
      case 'about':
        Alert.alert('About YYJCPL', 'YYJCPL connects job seekers with opportunities that fit their skills and goals.');
        break;
    }
  };

  return (
    <ScreenLayout
      showHeader={false}
      padded={false}
      edges={['top']}
      mainBackground={colors.background}>
      <View style={styles.content}>
        <HomeHeader
          name={user?.name}
          avatarUrl={user?.avatarUrl}
          hasUnread={hasUnread}
          onAvatarPress={() => openTab('CandidateProfile')}
          onBellPress={() => navigation.navigate('Notifications')}
          onMenuPress={() => setMoreMenuVisible(true)}
        />

        <View style={styles.block}>
          <SearchBar
            placeholder="Search jobs, skills, location…"
            onPress={() => openTab('JobSearch')}
            onFilterPress={() => openTab('JobSearch')}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recommended Jobs"
            actionLabel="See all"
            onActionPress={() => openTab('JobSearch')}
          />

          {jobsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title={jobsQuery.isError ? "Couldn't load jobs" : 'No jobs yet'}
              message={
                jobsQuery.isError
                  ? 'Check your connection and try again.'
                  : 'Complete your profile to get job recommendations.'
              }
            />
          ) : (
            jobs.slice(0, 5).map(job => (
              <HomeJobCard
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetails', { job })}
              />
            ))
          )}
        </View>
      </View>
      <CandidateMoreMenu
        visible={isMoreMenuVisible}
        name={user?.name}
        avatarUrl={user?.avatarUrl}
        onClose={() => setMoreMenuVisible(false)}
        onSelect={handleMoreMenu}
      />
    </ScreenLayout>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: scale(560),
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(12),
    paddingBottom: vs(24),
  },
  block: { marginTop: vs(16) },
  section: { marginTop: vs(24) },
  loader: { marginVertical: vs(32) },

  /* Inline job card */
  jobCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: vs(12),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  jobCardPressed: { opacity: 0.85 },
  jobAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: font(13),
  },
  jobBody: { flex: 1, gap: vs(2) },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: vs(2) },
  jobMetaText: { flexShrink: 1 },
});
