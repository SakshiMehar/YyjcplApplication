import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BadgeCheck, ChevronRight, MapPin } from 'lucide-react-native';
import { AppText, EmptyState, SearchBar, UserAvatar } from '../../../components/common';
import { AdminStackParamList } from '../../../navigation/types';
import { colors, scale, spacing, vs } from '../../../theme';
import { AdminScreen, Panel, PillTabs, StatusPill } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminUser, AdminUserType } from '../data/sampleAdmin';

type Nav = NativeStackNavigationProp<AdminStackParamList>;
type Filter = 'ALL' | 'ACTIVE' | 'BLOCKED' | 'UNVERIFIED';

function UserRow({ user, onPress }: { user: AdminUser; onPress: () => void }) {
  const blocked = user.status === 'BLOCKED';
  const isRecruiter = user.type === 'RECRUITER';
  return (
    <Panel onPress={onPress} style={styles.row}>
      <UserAvatar name={user.name} size={scale(46)} />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <AppText variant="bodyBold" numberOfLines={1} style={styles.name}>
            {user.name}
          </AppText>
          {user.verified ? <BadgeCheck size={scale(15)} color={colors.info} /> : null}
        </View>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {isRecruiter
            ? `${user.headline} • ${user.company}`
            : `${user.headline} • ${user.experience}`}
        </AppText>
        <View style={styles.meta}>
          <MapPin size={scale(11)} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {user.location} •{' '}
            {isRecruiter
              ? `${user.activityCount} jobs • ${user.plan ?? 'No plan'}`
              : `${user.activityCount} applications`}
          </AppText>
        </View>
      </View>
      <View style={styles.right}>
        <StatusPill label={blocked ? 'BLOCKED' : 'ACTIVE'} tone={blocked ? 'danger' : 'success'} />
        <ChevronRight size={scale(18)} color={colors.textMuted} />
      </View>
    </Panel>
  );
}

/** Searchable list of one kind of app user (Candidates or Recruiters tab). */
export default function UserDirectory({ type }: { type: AdminUserType }) {
  const navigation = useNavigation<Nav>();
  const { users } = useAdminData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const isRecruiter = type === 'RECRUITER';

  const ofType = useMemo(() => users.filter(u => u.type === type), [users, type]);
  const count = (f: Filter) =>
    ofType.filter(u =>
      f === 'ALL' ? true : f === 'UNVERIFIED' ? !u.verified : u.status === f,
    ).length;

  const q = query.trim().toLowerCase();
  const list = ofType.filter(u => {
    if (filter === 'UNVERIFIED' ? u.verified : filter !== 'ALL' && u.status !== filter) return false;
    return (
      !q ||
      [u.name, u.email, u.phone, u.company, u.location, u.headline, ...(u.skills ?? [])]
        .filter(Boolean)
        .some(v => v!.toLowerCase().includes(q))
    );
  });

  return (
    <AdminScreen
      title={isRecruiter ? 'Recruiters' : 'Candidates'}
      subtitle={`${ofType.length} registered ${isRecruiter ? 'recruiters' : 'job seekers'}`}
      showBack={false}
      inTabs
      onRefresh={() => {}}
      toolbar={
        <>
          <SearchBar
            placeholder={isRecruiter ? 'Search name, company, city…' : 'Search name, skills, city…'}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <PillTabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { key: 'ALL', label: 'All', count: count('ALL') },
              { key: 'ACTIVE', label: 'Active', count: count('ACTIVE') },
              { key: 'BLOCKED', label: 'Blocked', count: count('BLOCKED') },
              { key: 'UNVERIFIED', label: 'Unverified', count: count('UNVERIFIED') },
            ]}
          />
        </>
      }>
      {list.length === 0 ? (
        <EmptyState title="No one found" message="Try a different search or filter." />
      ) : (
        list.map(u => (
          <UserRow
            key={u.id}
            user={u}
            onPress={() => navigation.navigate('AdminUserDetails', { userId: u.id })}
          />
        ))
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: vs(14) },
  body: { flex: 1, gap: vs(2) },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  name: { flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: scale(3) },
  right: { alignItems: 'flex-end', gap: vs(10) },
});
