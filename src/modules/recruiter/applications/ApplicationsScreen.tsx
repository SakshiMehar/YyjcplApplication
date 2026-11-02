import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BriefcaseBusiness, ChevronRight, Clock3, MapPin, Users2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, UserAvatar } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { RecruiterStackParamList } from '../../../navigation/types';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { RecruiterApplication, useGetJobApplicationsQuery } from '../api/recruiterApi';

type Nav = NativeStackNavigationProp<RecruiterStackParamList>;

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPLIED:              { bg: '#DBEAFE', text: '#1D4ED8' },
  SHORTLISTED:          { bg: '#FFF1E6', text: colors.primary },
  INTERVIEW_SCHEDULED:  { bg: '#FEF9C3', text: '#92400E' },
  NEXT_ROUND:           { bg: '#CCFBF1', text: '#0F766E' },
  SELECTED:             { bg: '#DCFCE7', text: colors.success },
  NOT_SELECTED:         { bg: '#F3F4F6', text: colors.textMuted },
  PLACED:               { bg: '#DCFCE7', text: colors.success },
  REJECTED:             { bg: '#FEE2E2', text: colors.danger },
  WITHDRAWN:            { bg: '#F3F4F6', text: colors.textMuted },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <AppText variant="caption" style={[styles.badgeText, { color: s.text }]}>
        {status.replace(/_/g, ' ')}
      </AppText>
    </View>
  );
}

/* ─── Application card ───────────────────────────────────────────────────── */
function ApplicationCard({
  item,
  onPress,
}: {
  item: RecruiterApplication;
  onPress: () => void;
}) {
  const profile = item.jobSeekerProfile;
  const name = profile?.name ?? item.applicantName ?? item.jobSeekerName ?? `Job Seeker #${item.jobSeekerId}`;
  const appliedDate = new Date(item.appliedAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`View application from ${name}`}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <UserAvatar name={name} size={scale(44)} />
        <View style={styles.cardInfo}>
          <AppText variant="bodyBold" numberOfLines={1}>{name}</AppText>
          {profile?.headline ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {profile.headline}
            </AppText>
          ) : null}
          {item.job?.role ? (
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              Applied for: {item.job.role}
            </AppText>
          ) : null}
        </View>
        <ChevronRight size={scale(16)} color={colors.textMuted} />
      </View>

      {/* Meta row */}
      <View style={styles.cardMeta}>
        {profile?.experience ? (
          <View style={styles.metaItem}>
            <BriefcaseBusiness size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{profile.experience}</AppText>
          </View>
        ) : null}
        {profile?.preferredLocation ? (
          <View style={styles.metaItem}>
            <MapPin size={scale(11)} color={colors.textMuted} />
            <AppText variant="caption" color="textMuted">{profile.preferredLocation}</AppText>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Clock3 size={scale(11)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">{appliedDate}</AppText>
        </View>
      </View>

      {/* Footer row */}
      <View style={styles.cardFooter}>
        <StatusBadge status={item.status} />
      </View>
    </Pressable>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function ApplicationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const { data: applications = [], isLoading, isError, isFetching, refetch } =
    useGetJobApplicationsQuery();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2">Applicants</AppText>
        <AppText variant="caption" color="textSecondary">
          {isLoading ? 'Loading…' : `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
        </AppText>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => String(item.applicationId)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + vs(24) },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: vs(12) }} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => { refetch(); }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users2 size={scale(48)} color={colors.border} />
              <AppText variant="bodyBold" style={styles.emptyTitle}>
                {isError ? 'Could not load applications' : 'No applications yet'}
              </AppText>
              <AppText variant="caption" color="textMuted" style={styles.emptySub}>
                {isError
                  ? 'Pull down to retry.'
                  : 'Post a job to start receiving applications.'}
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <ApplicationCard
              item={item}
              onPress={() => navigation.navigate('ApplicantDetails', { application: item })}
            />
          )}
        />
      )}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
    paddingBottom: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  loader: { marginTop: vs(60) },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
  },

  /* Card */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(1) },
    shadowOpacity: 0.04,
    shadowRadius: scale(6),
    elevation: 2,
  },
  cardPressed: { backgroundColor: colors.surface },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: { flex: 1, gap: vs(2) },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: vs(10),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  cardFooter: {
    marginTop: vs(10),
    flexDirection: 'row',
  },

  /* Badge */
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: font(11),
  },

  /* Empty */
  empty: {
    alignItems: 'center',
    paddingTop: vs(60),
    gap: vs(8),
  },
  emptyTitle: { marginTop: vs(8) },
  emptySub: { textAlign: 'center', paddingHorizontal: spacing.xl },
});
