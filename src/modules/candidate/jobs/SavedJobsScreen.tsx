import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, MapPin, Trash2 } from 'lucide-react-native';
import { AppButton, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateStackParamList } from '../../../navigation/types';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { JobSeekerJob, useGetSavedJobsQuery, useRemoveSavedJobMutation } from '../api/candidateApi';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

function SavedJobCard({
  job,
  isRemoving,
  onPress,
  onRemove,
}: {
  job: JobSeekerJob;
  isRemoving: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  const initials = job.companyName
    .split(' ')
    .map(word => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.cardMain, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${job.role} at ${job.companyName}`}>
        <View style={styles.avatar}>
          <AppText variant="bodyBold" color="primary">{initials || '?'}</AppText>
        </View>
        <View style={styles.jobInfo}>
          <AppText variant="bodyBold" numberOfLines={1}>{job.role}</AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {job.companyName}
          </AppText>
          <View style={styles.meta}>
            <MapPin size={scale(13)} color={colors.textMuted} />
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {job.location}
            </AppText>
          </View>
          {job.salary ? (
            <AppText variant="caption" color="primary" style={styles.salary}>
              {job.salary}
            </AppText>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.cardFooter}>
        {job.experience ? (
          <AppText variant="caption" color="textMuted">{job.experience} experience</AppText>
        ) : <View />}
        <Pressable
          onPress={onRemove}
          disabled={isRemoving}
          accessibilityRole="button"
          accessibilityLabel={`Discard ${job.role}`}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
          {isRemoving ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Trash2 size={scale(15)} color={colors.danger} />
          )}
          <AppText variant="caption" color="danger" style={styles.removeText}>
            {isRemoving ? 'Removing…' : 'Discard'}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function SavedJobsEmpty({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Bookmark size={scale(30)} color={colors.primary} />
      </View>
      <AppText variant="h3" align="center">No saved jobs yet</AppText>
      <AppText variant="caption" color="textSecondary" align="center" style={styles.emptyMessage}>
        Save jobs you like and they’ll be waiting for you here.
      </AppText>
      <AppButton title="Browse Jobs" onPress={onBrowse} style={styles.browseButton} />
    </View>
  );
}

export default function SavedJobsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { data: jobs = [], isLoading, isError, isFetching, refetch } = useGetSavedJobsQuery();
  const [removeSavedJob] = useRemoveSavedJobMutation();

  const discardJob = (job: JobSeekerJob) => {
    Alert.alert('Discard saved job?', `Remove ${job.role} at ${job.companyName} from your saved jobs?`, [
      { text: 'Keep job', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          setRemovingId(job.id);
          try {
            await removeSavedJob({ jobId: job.id }).unwrap();
          } catch (error) {
            const apiError = error as { data?: { message?: string } };
            Alert.alert('Could not remove job', apiError.data?.message ?? 'Please try again.');
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Bookmark size={scale(19)} color={colors.primary} />
        </View>
        <View style={styles.headingText}>
          <AppText variant="h3">Your saved jobs</AppText>
          <AppText variant="caption" color="textSecondary">
            {isLoading ? 'Loading your jobs…' : `${jobs.length} saved ${jobs.length === 1 ? 'job' : 'jobs'}`}
          </AppText>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.error}>
          <AppText variant="bodyBold" align="center">Could not load saved jobs</AppText>
          <AppText variant="caption" color="textSecondary" align="center" style={styles.emptyMessage}>
            Check your connection and try again.
          </AppText>
          <AppButton title="Try Again" onPress={() => { refetch(); }} style={styles.browseButton} />
        </View>
      ) : jobs.length === 0 ? (
        <SavedJobsEmpty onBrowse={() => navigation.navigate('CandidateTabs', { screen: 'JobSearch' })} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={job => job.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => { refetch(); }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <SavedJobCard
              job={item}
              isRemoving={removingId === item.id}
              onPress={() => navigation.navigate('JobDetails', { job: item })}
              onRemove={() => discardJob(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(15),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headingIcon: {
    width: scale(42),
    height: scale(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  headingText: { flex: 1, gap: vs(2) },
  list: { padding: spacing.lg, paddingBottom: vs(28), gap: vs(12) },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    boxShadow: `0px ${scale(2)}px ${scale(8)}px rgba(28, 25, 23, 0.05)`,
  },
  cardMain: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  pressed: { opacity: 0.78 },
  avatar: {
    width: scale(48),
    height: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    backgroundColor: colors.primaryLight,
  },
  jobInfo: { flex: 1, minWidth: 0, gap: vs(3) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: vs(3) },
  salary: { marginTop: vs(2), fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(12),
    paddingTop: vs(9),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  removeButton: {
    minHeight: vs(34),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FFF1F0',
  },
  removeText: { fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyIcon: {
    width: scale(68),
    height: scale(68),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  emptyMessage: { maxWidth: scale(280), marginTop: vs(8), lineHeight: font(19) },
  browseButton: { minWidth: scale(160), marginTop: vs(18) },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
