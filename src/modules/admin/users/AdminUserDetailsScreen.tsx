import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import {
  Ban,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { AppText, EmptyState, UserAvatar } from '../../../components/common';
import { AdminScreenProps } from '../../../navigation/types';
import { colors, font, scale, spacing, vs } from '../../../theme';
import { formatDate } from '../../../utils/format';
import { ActionButton, AdminScreen, InfoRow, Panel, StatusPill, Tag } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';

/** User details – profile, contact, activity and Block / Unblock. */
export default function AdminUserDetailsScreen({ route }: AdminScreenProps<'AdminUserDetails'>) {
  const { users, setUserStatus } = useAdminData();
  const user = users.find(u => u.id === route.params.userId);

  if (!user) {
    return (
      <AdminScreen title="User Details">
        <EmptyState title="User not found" message="This account may have been removed." />
      </AdminScreen>
    );
  }

  const blocked = user.status === 'BLOCKED';
  const isRecruiter = user.type === 'RECRUITER';

  const toggleBlock = () =>
    Alert.alert(
      blocked ? 'Unblock user?' : 'Block user?',
      blocked
        ? `${user.name} will be able to log in and use YYJCPL again.`
        : `${user.name} will be logged out and can't use YYJCPL until unblocked.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: blocked ? 'Unblock' : 'Block',
          style: blocked ? 'default' : 'destructive',
          onPress: () => setUserStatus(user.id, blocked ? 'ACTIVE' : 'BLOCKED'),
        },
      ],
    );

  return (
    <AdminScreen
      title="User Details"
      footer={
        <View style={styles.footerRow}>
          <ActionButton
            title="Email User"
            icon={Mail}
            variant="outline"
            style={styles.flex}
            onPress={() => Linking.openURL(`mailto:${user.email}`).catch(() => {})}
          />
          <ActionButton
            title={blocked ? 'Unblock User' : 'Block User'}
            icon={blocked ? ShieldCheck : Ban}
            tone={blocked ? 'success' : 'danger'}
            variant="filled"
            style={styles.flex}
            onPress={toggleBlock}
          />
        </View>
      }>
      {/* ── Profile header ── */}
      <Panel style={styles.profile}>
        <UserAvatar name={user.name} size={scale(72)} />
        <View style={styles.profileText}>
          <View style={styles.nameRow}>
            <AppText variant="h3" style={styles.name} numberOfLines={1}>
              {user.name}
            </AppText>
            {user.verified ? <BadgeCheck size={scale(18)} color={colors.info} /> : null}
          </View>
          <AppText variant="caption" color="textSecondary">
            {user.headline}
            {user.experience ? ` • ${user.experience}` : ''}
          </AppText>
          <View style={styles.pills}>
            <StatusPill
              label={isRecruiter ? 'RECRUITER' : 'JOB SEEKER'}
              tone={isRecruiter ? 'purple' : 'info'}
            />
            <StatusPill label={blocked ? 'BLOCKED' : 'ACTIVE'} tone={blocked ? 'danger' : 'success'} />
          </View>
        </View>
      </Panel>

      {/* ── Activity summary ── */}
      <View style={styles.statsRow}>
        <Panel style={styles.stat}>
          <AppText style={styles.statValue}>{user.activityCount}</AppText>
          <AppText variant="caption" color="textSecondary">
            {isRecruiter ? 'Jobs posted' : 'Applications'}
          </AppText>
        </Panel>
        <Panel style={styles.stat}>
          <AppText style={styles.statValue}>{isRecruiter ? user.plan ?? 'Free' : user.skills?.length ?? 0}</AppText>
          <AppText variant="caption" color="textSecondary">
            {isRecruiter ? 'Current plan' : 'Skills'}
          </AppText>
        </Panel>
        <Panel style={styles.stat}>
          <AppText style={styles.statValue}>{user.verified ? 'Yes' : 'No'}</AppText>
          <AppText variant="caption" color="textSecondary">
            Verified
          </AppText>
        </Panel>
      </View>

      {/* ── Contact & account ── */}
      <Panel>
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow icon={Phone} label="Mobile" value={`+91 ${user.phone}`} />
        <InfoRow icon={MapPin} label="Location" value={user.location} />
        {isRecruiter ? <InfoRow icon={Building2} label="Company" value={user.company ?? '—'} /> : null}
        {isRecruiter ? <InfoRow icon={CreditCard} label="Plan" value={user.plan ?? 'No plan'} /> : null}
        {!isRecruiter ? (
          <InfoRow icon={BriefcaseBusiness} label="Experience" value={user.experience ?? '—'} />
        ) : null}
        <InfoRow icon={CalendarDays} label="Joined" value={formatDate(user.joinedAt)} />
      </Panel>

      {user.skills?.length ? (
        <Panel>
          <AppText variant="bodyBold" style={styles.blockTitle}>
            Skills
          </AppText>
          <View style={styles.tags}>
            {user.skills.map(s => (
              <Tag key={s} label={s} />
            ))}
          </View>
        </Panel>
      ) : null}

      {!isRecruiter ? (
        <Panel onPress={() => Alert.alert('Resume', 'Resume preview will open once the admin API is connected.')}>
          <View style={styles.resumeRow}>
            <FileText size={scale(20)} color={colors.primary} />
            <AppText variant="bodyBold" style={styles.flex}>
              View Resume
            </AppText>
            <AppText variant="caption" color="primary" style={styles.link}>
              Open →
            </AppText>
          </View>
        </Panel>
      ) : null}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  profileText: { flex: 1, gap: vs(3) },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: scale(5) },
  name: { flexShrink: 1, fontWeight: '700' },
  pills: { flexDirection: 'row', gap: spacing.xs, marginTop: vs(4) },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  statValue: { fontSize: font(18), fontWeight: '800', color: colors.primary },
  blockTitle: { marginBottom: vs(10) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  resumeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: { fontWeight: '700' },
});
