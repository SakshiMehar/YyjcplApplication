import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Power, UserPlus, X } from 'lucide-react-native';
import { AppInput, AppText, UserAvatar } from '../../../components/common';
import { useAppSelector } from '../../../store/hooks';
import { scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, SectionTitle, StatusPill, Tone } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { AdminStaff, STAFF_ROLE_LABEL, StaffRole } from '../data/sampleAdmin';

const ROLE_TONE: Record<StaffRole, Tone> = {
  SUPER_ADMIN: 'primary',
  MODERATOR: 'purple',
  SUPPORT: 'info',
  FINANCE: 'warning',
};
const ROLE_ACCESS: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Full access to every section',
  MODERATOR: 'Jobs, verification, candidates, recruiters',
  SUPPORT: 'Complaints, notifications, applications',
  FINANCE: 'Subscriptions, payments, reports',
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AddStaffForm({ onDone }: { onDone: () => void }) {
  const { addStaff } = useAdminData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('MODERATOR');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = () => {
    const next = {
      name: name.trim().length < 2 ? 'Enter a name' : undefined,
      email: EMAIL_RE.test(email.trim()) ? undefined : 'Enter a valid email',
    };
    setErrors(next);
    if (next.name || next.email) return;
    addStaff(name.trim(), email.trim().toLowerCase(), role);
    Alert.alert('Admin user added', `An invite will be sent to ${email.trim()}.`);
    onDone();
  };

  return (
    <Panel>
      <AppInput label="Full name" placeholder="e.g. Ritu Sharma" value={name} onChangeText={setName} error={errors.name} />
      <AppInput
        label="Work email"
        placeholder="name@yyjcpl.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <AppText variant="caption" color="textSecondary" style={styles.label}>Role</AppText>
      <PillTabs<StaffRole>
        value={role}
        onChange={setRole}
        tabs={[
          { key: 'MODERATOR', label: 'Moderator' },
          { key: 'SUPPORT', label: 'Support' },
          { key: 'FINANCE', label: 'Finance' },
        ]}
      />
      <AppText variant="caption" color="textMuted" style={styles.access}>{ROLE_ACCESS[role]}</AppText>
      <View style={styles.actions}>
        <ActionButton title="Cancel" icon={X} tone="neutral" style={styles.flex} onPress={onDone} />
        <ActionButton title="Add User" icon={UserPlus} variant="filled" style={styles.flex} onPress={submit} />
      </View>
    </Panel>
  );
}

/** Users – YYJCPL staff who can log into this admin panel, and their roles. */
export default function AdminStaffUsersScreen() {
  const { staff, setStaffStatus } = useAdminData();
  const me = useAppSelector(s => s.auth.user);
  const [adding, setAdding] = useState(false);

  const toggle = (u: AdminStaff) => {
    const disable = u.status === 'ACTIVE';
    Alert.alert(disable ? 'Disable admin user?' : 'Enable admin user?', `${u.name} (${u.email})`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: disable ? 'Disable' : 'Enable',
        style: disable ? 'destructive' : 'default',
        onPress: () => setStaffStatus(u.id, disable ? 'DISABLED' : 'ACTIVE'),
      },
    ]);
  };

  return (
    <AdminScreen
      title="Users"
      subtitle={`${staff.filter(s => s.status === 'ACTIVE').length} active admin users`}
      footer={
        adding ? undefined : (
          <ActionButton title="Add Admin User" icon={UserPlus} variant="filled" style={styles.footerBtn} onPress={() => setAdding(true)} />
        )
      }>
      {adding ? (
        <>
          <SectionTitle title="New Admin User" />
          <AddStaffForm onDone={() => setAdding(false)} />
        </>
      ) : null}

      <SectionTitle title="Admin Team" />
      {staff.map(u => {
        const isMe = u.email === me?.email;
        const disabled = u.status === 'DISABLED';
        return (
          <Panel key={u.id} style={disabled ? styles.disabled : undefined}>
            <View style={styles.row}>
              <UserAvatar name={u.name} size={scale(46)} />
              <View style={styles.flex}>
                <AppText variant="bodyBold" numberOfLines={1}>
                  {u.name}
                  {isMe ? ' (you)' : ''}
                </AppText>
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>{u.email}</AppText>
                <AppText variant="caption" color="textMuted">
                  {disabled ? 'Disabled' : `Active ${timeAgo(u.lastActiveAt)}`}
                </AppText>
              </View>
              <StatusPill label={STAFF_ROLE_LABEL[u.role].toUpperCase()} tone={ROLE_TONE[u.role]} />
            </View>
            <AppText variant="caption" color="textMuted" style={styles.access}>{ROLE_ACCESS[u.role]}</AppText>
            {u.role !== 'SUPER_ADMIN' ? (
              <ActionButton
                title={disabled ? 'Enable' : 'Disable'}
                icon={Power}
                tone={disabled ? 'success' : 'danger'}
                style={styles.toggle}
                onPress={() => toggle(u)}
              />
            ) : null}
          </Panel>
        );
      })}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  disabled: { opacity: 0.6 },
  access: { marginTop: vs(8) },
  toggle: { alignSelf: 'flex-end', marginTop: vs(10) },
  label: { fontWeight: '600', marginBottom: vs(8) },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: vs(14) },
  footerBtn: { height: vs(48) },
});
