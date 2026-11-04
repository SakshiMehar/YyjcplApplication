import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarDays, Clock3, MapPin, Video } from 'lucide-react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateStackParamList } from '../../../navigation/types';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import {
  ApplicationSchedule,
  JobSeekerApplication,
  useGetMyApplicationsQuery,
} from '../api/candidateApi';

type InterviewItem = {
  id: string;
  title: string;
  application: JobSeekerApplication;
  schedule: ApplicationSchedule;
};

function parseInterviewDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const backendDate = value.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (backendDate) {
    const [, day, month, year, rawHour, minute, rawPeriod] = backendDate;
    let hour = Number(rawHour) % 12;
    if (rawPeriod.toUpperCase() === 'PM') hour += 12;
    const date = new Date(Number(year), Number(month) - 1, Number(day), hour, Number(minute));
    if (
      date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
    ) {
      return date;
    }
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatInterviewDate(value?: string): string {
  const date = parseInterviewDate(value);
  return date
    ? date.toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : value ?? 'Time to be confirmed';
}

function getInterviewItems(applications: JobSeekerApplication[]): InterviewItem[] {
  return applications.flatMap(application => {
    const status = application.status.toUpperCase();
    const interview = application.interview ??
      (status === 'INTERVIEW_SCHEDULED' ? {} : undefined);
    const nextRound = application.nextRound ??
      (status === 'NEXT_ROUND' ? {} : undefined);
    const jobTitle = application.job?.role ?? application.job?.title ?? `Job #${application.jobId}`;
    const items: InterviewItem[] = [];

    if (interview) {
      items.push({
        id: `${application.applicationId}-interview`,
        title: `Interview · ${jobTitle}`,
        application,
        schedule: interview,
      });
    }
    if (nextRound) {
      items.push({
        id: `${application.applicationId}-next-round`,
        title: `Next round · ${jobTitle}`,
        application,
        schedule: nextRound,
      });
    }

    return items;
  }).sort((left, right) => {
    const leftDate = parseInterviewDate(left.schedule.scheduledAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDate = parseInterviewDate(right.schedule.scheduledAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  });
}

function InterviewCard({ item }: { item: InterviewItem }) {
  const navigation = useNavigation<NativeStackNavigationProp<CandidateStackParamList>>();
  const mode = item.schedule.mode?.replace(/_/g, ' ');
  const details = item.schedule.locationOrLink ?? item.schedule.notes;
  const isOnline = mode?.toUpperCase() === 'ONLINE' || mode?.toUpperCase() === 'VIDEO';

  return (
    <Card
      onPress={() => navigation.navigate('ApplicationTracker', {
        applicationId: item.application.applicationId,
      })}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.title}`}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <CalendarDays size={scale(20)} color={colors.primary} />
        </View>
        <View style={styles.cardTitleWrap}>
          <AppText variant="bodyBold" numberOfLines={2}>{item.title}</AppText>
          <AppText variant="caption" color="textSecondary">
            {item.application.job?.companyName ?? 'Company details unavailable'}
          </AppText>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Clock3 size={scale(16)} color={colors.primary} />
        <AppText variant="caption" color="textSecondary" style={styles.detailText}>
          {formatInterviewDate(item.schedule.scheduledAt)}
        </AppText>
      </View>
      {mode ? (
        <View style={styles.detailRow}>
          {isOnline ? (
            <Video size={scale(16)} color={colors.primary} />
          ) : (
            <MapPin size={scale(16)} color={colors.primary} />
          )}
          <AppText variant="caption" color="textSecondary" style={styles.detailText}>{mode}</AppText>
        </View>
      ) : null}
      {details ? (
        <AppText variant="caption" color="textSecondary" style={styles.notes}>
          {details}
        </AppText>
      ) : null}
    </Card>
  );
}

export default function CandidateInterviewsScreen() {
  const { data: applications = [], isLoading, isError, isFetching, refetch } =
    useGetMyApplicationsQuery();
  const interviews = useMemo(() => getInterviewItems(applications), [applications]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <ScreenLayout title="Interviews" showBack={false} edges={['top']} scroll={false} padded={false}>
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="caption" color="textSecondary">Loading your interviews…</AppText>
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <AppText variant="h3" align="center">Could not load interviews</AppText>
          <AppText variant="caption" color="textSecondary" align="center" style={styles.stateMessage}>
            Check your connection and try again.
          </AppText>
          <AppButton title="Try Again" onPress={() => { refetch(); }} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={interviews}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            interviews.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => { refetch(); }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <AppText variant="caption" color="textSecondary">
                Interviews scheduled by recruiters for your applications.
              </AppText>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.state}>
              <View style={styles.emptyIcon}>
                <CalendarDays size={scale(28)} color={colors.primary} />
              </View>
              <AppText variant="h3" align="center">No interviews scheduled</AppText>
              <AppText variant="caption" color="textSecondary" align="center" style={styles.stateMessage}>
                When a recruiter schedules an interview, it will appear here.
              </AppText>
            </View>
          }
          renderItem={({ item }) => <InterviewCard item={item} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: vs(24) },
  emptyList: { flexGrow: 1 },
  listHeader: { marginBottom: spacing.md },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stateMessage: { maxWidth: scale(290), marginTop: vs(8), lineHeight: vs(20) },
  retryButton: { minWidth: scale(150), marginTop: vs(16) },
  emptyIcon: {
    width: scale(64),
    height: scale(64),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: vs(14) },
  iconWrap: {
    width: scale(44),
    height: scale(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  cardTitleWrap: { flex: 1, gap: vs(3) },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: vs(8) },
  detailText: { flex: 1 },
  notes: {
    marginTop: vs(12),
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
