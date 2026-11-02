import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react-native';
import { AppButton, AppText, EmptyState } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateStackParamList } from '../../../navigation/types';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import { JobSeekerApplication, useGetMyApplicationsQuery } from '../api/candidateApi';
import { resolveBackendUrl } from '../utils/resume';
import ApplicationStatusBadge from './ApplicationStatusBadge';

const appliedDate = (date?: string) => {
  if (!date) return 'Application date unavailable';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? 'Application date unavailable'
    : `Applied ${parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

function ApplicationCard({
  application,
  onPress,
}: {
  application: JobSeekerApplication;
  onPress: () => void;
}) {
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const job = application.job;
  const role = job?.role ?? job?.title ?? `Job #${application.jobId || '—'}`;
  const company = job?.companyName ?? 'Company details unavailable';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${role} application details`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          {job?.companyLogoUrl && !logoLoadFailed ? (
            <Image
              source={{ uri: resolveBackendUrl(job.companyLogoUrl) }}
              style={styles.companyLogo}
              onError={() => setLogoLoadFailed(true)}
            />
          ) : (
            <BriefcaseBusiness size={scale(20)} color={colors.primary} />
          )}
        </View>
        <View style={styles.titleBlock}>
          <AppText variant="bodyBold" numberOfLines={1}>{role}</AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>{company}</AppText>
        </View>
      </View>

      <ApplicationStatusBadge status={application.status} />

      <View style={styles.meta}>
        {job?.location ? (
          <View style={styles.metaItem}>
            <MapPin size={scale(14)} color={colors.textMuted} />
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>{job.location}</AppText>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <CalendarDays size={scale(14)} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>{appliedDate(application.appliedAt)}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * My Applications
 * All applications with their current status.
 */
export default function MyApplicationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CandidateStackParamList>>();
  const { data: applications = [], isLoading, isError, isFetching, refetch } = useGetMyApplicationsQuery();

  return (
    <ScreenLayout title="Applied Jobs" showBack={false} edges={['top']} scroll={false} padded={false}>
      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : isError ? (
        <View style={styles.empty}>
          <EmptyState title="Couldn't load applications" message="Check your connection and try again." />
          <AppButton title="Try Again" onPress={() => { refetch(); }} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item, index) => String(item.applicationId || `${item.jobId}-${index}`)}
          contentContainerStyle={applications.length ? styles.list : styles.empty}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => { refetch(); }} colors={[colors.primary]} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState title="No applications yet" message="Jobs you apply for will appear here." />}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
              onPress={() => navigation.navigate('ApplicationTracker', { applicationId: item.applicationId })}
            />
          )}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: vs(28) },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flexGrow: 1, justifyContent: 'center' },
  retry: { alignSelf: 'center', minWidth: scale(150) },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(12),
  },
  cardPressed: { opacity: 0.88 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  companyLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
  titleBlock: { flex: 1, gap: vs(2) },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: vs(12) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: scale(4), maxWidth: '100%' },
});
