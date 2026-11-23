import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { ChevronRight, LogOut, ShieldCheck } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { APP_NAME } from '../../../constants/app';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { useAppLogout } from '../../auth/hooks/useAppLogout';
import { AdminScreen, Panel, RowDivider, StatusPill } from '../components/AdminUi';
import { ADMIN_MODULE_GROUPS, moduleByKey } from '../adminModules';
import { useAdminBadges, useOpenAdminModule } from '../useAdminModules';

function MenuRow({
  icon: Icon,
  color,
  title,
  subtitle,
  badge,
  onPress,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}1A` }]}>
        <Icon size={scale(20)} color={color} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyBold">{title}</AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      <ChevronRight size={scale(18)} color={colors.textMuted} />
    </Pressable>
  );
}

/** More – admin profile, every admin section (grouped) and logout. */
export default function AdminMoreScreen() {
  const admin = useAppSelector(s => s.auth.user);
  const badges = useAdminBadges();
  const openModule = useOpenAdminModule();
  const logout = useAppLogout();
  const [loggingOut, setLoggingOut] = useState(false);


  const confirmLogout = () =>
    Alert.alert('Logout?', 'You will need your admin ID and password to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);

  return (
    <AdminScreen title="Menu" subtitle="All admin sections" showBack={false} inTabs>
      {/* ── Admin profile ── */}
      <Panel style={styles.profile}>
        <View style={styles.profileBubble} />
        <UserAvatar name={admin?.name || 'Admin'} size={scale(62)} />
        <View style={styles.flex}>
          <AppText variant="h3" style={styles.name} numberOfLines={1}>
            {admin?.name || 'Admin'}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {admin?.email || (admin?.phone ? `+91 ${admin.phone}` : 'YYJCPL Staff')}
          </AppText>
          <View style={styles.roleRow}>
            <ShieldCheck size={scale(13)} color={colors.primary} />
            <StatusPill label="SUPER ADMIN" tone="primary" />
          </View>
        </View>
      </Panel>

      {ADMIN_MODULE_GROUPS.map(group => (
        <React.Fragment key={group.title}>
          <AppText variant="caption" color="textMuted" style={styles.group}>
            {group.title}
          </AppText>
          <Panel style={styles.menu}>
            {group.keys.map((key, i) => {
              const m = moduleByKey(key);
              return (
                <React.Fragment key={key}>
                  {i > 0 ? <RowDivider /> : null}
                  <MenuRow
                    icon={m.icon}
                    color={m.color}
                    title={m.label}
                    subtitle={m.description}
                    badge={badges[key]}
                    onPress={() => openModule(key)}
                  />
                </React.Fragment>
              );
            })}
          </Panel>
        </React.Fragment>
      ))}

      <Pressable
        onPress={confirmLogout}
        disabled={loggingOut}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        {loggingOut ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <>
            <LogOut size={scale(18)} color={colors.danger} />
            <AppText style={styles.logoutText}>Logout</AppText>
          </>
        )}
      </Pressable>

      <AppText variant="caption" color="textMuted" align="center" style={styles.version}>
        {APP_NAME} • Admin Panel
      </AppText>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, overflow: 'hidden' },
  profileBubble: {
    position: 'absolute',
    right: -scale(30),
    top: -scale(30),
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    backgroundColor: colors.primaryLight,
  },
  name: { fontWeight: '700' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: scale(4), marginTop: vs(6) },
  group: { fontWeight: '700', letterSpacing: 0.8, marginTop: vs(6), marginBottom: vs(8), marginLeft: spacing.xs },
  menu: { paddingVertical: vs(6) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: vs(4) },
  rowIcon: { width: scale(42), height: scale(42), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: {
    minWidth: scale(22),
    height: scale(22),
    paddingHorizontal: scale(6),
    borderRadius: scale(11),
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.textOnPrimary, fontSize: font(11), fontWeight: '800' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: vs(48),
    marginTop: vs(8),
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: font(15) },
  version: { marginTop: vs(14) },
});
