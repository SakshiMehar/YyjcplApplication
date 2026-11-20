import React, { useCallback, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  Info,
  Zap,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../api/sharedApi';
import { AppNotification } from '../../../types/models';
import { timeAgo } from '../../../utils/format';

/* ─── Icon per notification type ────────────────────────────────────────── */
const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  APPLICATION: {
    icon: <BriefcaseBusiness size={scale(18)} color="#3B82F6" />,
    bg: '#DBEAFE',
    color: '#3B82F6',
  },
  NEW_APPLICATION: {
    icon: <BriefcaseBusiness size={scale(18)} color="#3B82F6" />,
    bg: '#DBEAFE',
    color: '#3B82F6',
  },
  APPLICATION_UPDATE: {
    icon: <CalendarDays size={scale(18)} color="#F59E0B" />,
    bg: '#FEF9C3',
    color: '#F59E0B',
  },
  INTERVIEW: {
    icon: <CalendarDays size={scale(18)} color="#F59E0B" />,
    bg: '#FEF9C3',
    color: '#F59E0B',
  },
  JOB: {
    icon: <Zap size={scale(18)} color={colors.primary} />,
    bg: colors.primaryLight,
    color: colors.primary,
  },
  PAYMENT: {
    icon: <CircleDollarSign size={scale(18)} color={colors.success} />,
    bg: '#DCFCE7',
    color: colors.success,
  },
  SYSTEM: {
    icon: <Info size={scale(18)} color="#6B7280" />,
    bg: '#F3F4F6',
    color: '#6B7280',
  },
};
const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type] ?? TYPE_CONFIG.SYSTEM;

/* ─── Notification row ───────────────────────────────────────────────────── */
function NotifRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const cfg = getTypeConfig(item.type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        item.read !== true && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button">
      {/* Unread dot */}
      {item.read !== true && <View style={styles.unreadDot} />}

      {/* Type icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        {cfg.icon}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AppText
          variant={item.read !== true ? 'bodyBold' : 'body'}
          numberOfLines={1}
          style={item.read !== true && styles.unreadTitle}>
          {item.title}
        </AppText>
        <AppText
          variant="caption"
          color="textSecondary"
          numberOfLines={2}
          style={styles.body}>
          {item.body}
        </AppText>
        <AppText variant="caption" color="textMuted" style={styles.time}>
          {timeAgo(item.createdAt)}
        </AppText>
      </View>
    </Pressable>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ isError }: { isError: boolean }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Bell size={scale(32)} color={colors.textMuted} />
      </View>
      <AppText variant="bodyBold" style={styles.emptyTitle}>
        {isError ? 'Could not load notifications' : 'No notifications yet'}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.emptySub}>
        {isError
          ? 'Pull down to retry.'
          : "You're all caught up! New notifications will appear here."}
      </AppText>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetNotificationsQuery({ page: 1 });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [markRead] = useMarkNotificationReadMutation();

  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const notifications = (data?.items ?? []).map(item =>
    readIds.has(String(item.id)) ? { ...item, read: true } : item,
  );
  const unreadCount = notifications.filter(n => n.read !== true).length;

  const handlePress = async (item: AppNotification) => {
    if (item.read !== true) {
      try {
        await markRead(item.id).unwrap();
        setReadIds(previous => new Set(previous).add(String(item.id)));
      } catch {
        Alert.alert('Could not mark notification as read', 'Please try again.');
      }
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(item => item.read !== true);
    if (isMarkingAll || unread.length === 0) {
      return;
    }

    setIsMarkingAll(true);
    const results = await Promise.all(
      unread.map(async item => {
        try {
          await markRead(item.id).unwrap();
          return { id: String(item.id), success: true };
        } catch {
          return { id: String(item.id), success: false };
        }
      }),
    );

    const succeededIds = results
      .filter(result => result.success)
      .map(result => result.id);
    const failedCount = results.length - succeededIds.length;

    if (succeededIds.length > 0) {
      setReadIds(previous => new Set([...previous, ...succeededIds]));
    }
    if (failedCount > 0) {
      Alert.alert(
        'Some notifications could not be marked as read',
        `${failedCount} notification${failedCount === 1 ? '' : 's'} failed. Please try again.`,
      );
    }

    setIsMarkingAll(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={scale(12)}
          style={styles.backBtn}
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.text} />
        </Pressable>

        <View style={styles.headerMid}>
          <AppText variant="h3">Notifications</AppText>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <AppText style={styles.unreadBadgeText}>{unreadCount} new</AppText>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0 || isMarkingAll}
          accessibilityRole="button"
          style={styles.markAllButton}>
          <AppText
            variant="caption"
            style={[
              styles.markAllText,
              (unreadCount === 0 || isMarkingAll) && styles.markAllDisabled,
            ]}>
            {isMarkingAll ? 'Marking…' : 'Mark all as read'}
          </AppText>
        </Pressable>
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + vs(24) }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={() => { refetch(); }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={<EmptyState isError={isError} />}
          renderItem={({ item }) => (
            <NotifRow item={item} onPress={() => handlePress(item)} />
          )}
        />
      )}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: scale(34), height: scale(34), borderRadius: scale(17),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerMid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  markAllButton: { paddingVertical: vs(8), paddingLeft: spacing.xs },
  markAllText: { color: colors.primary, fontWeight: '700', fontSize: font(11) },
  markAllDisabled: { color: colors.textMuted },
  unreadBadge: {
    backgroundColor: colors.primary, borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: vs(2),
  },
  unreadBadgeText: { color: colors.textOnPrimary, fontSize: font(11), fontWeight: '700' },

  loader: { marginTop: vs(60) },

  /* Row */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(14),
    backgroundColor: colors.background,
    position: 'relative',
  },
  rowUnread: { backgroundColor: '#FFFBF5' },
  rowPressed: { opacity: 0.8 },
  unreadDot: {
    position: 'absolute',
    left: spacing.sm,
    top: vs(20),
    width: scale(7), height: scale(7),
    borderRadius: scale(4),
    backgroundColor: colors.primary,
  },
  iconWrap: {
    width: scale(42), height: scale(42), borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  content: { flex: 1 },
  unreadTitle: { color: colors.text },
  body: { marginTop: vs(2), lineHeight: vs(18) },
  time: { marginTop: vs(4) },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(42) + spacing.md,
  },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: vs(60), paddingHorizontal: spacing.xl, gap: vs(10) },
  emptyIcon: {
    width: scale(72), height: scale(72), borderRadius: scale(36),
    backgroundColor: colors.primaryLight,
    borderWidth: 1, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: vs(4),
  },
  emptyTitle: { marginTop: vs(4) },
  emptySub: { textAlign: 'center', lineHeight: vs(18) },
});
