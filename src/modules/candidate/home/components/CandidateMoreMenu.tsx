import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  Info,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../../components/common';
import Pressable from '../../../../components/common/InteractivePressable';
import { colors, radius, scale, sizes, spacing, vs } from '../../../../theme';

export type MoreMenuAction =
  | 'profile'
  | 'search'
  | 'recommended'
  | 'applied'
  | 'performance'
  | 'settings'
  | 'writeToUs'
  | 'about';

type Props = {
  visible: boolean;
  name?: string;
  avatarUrl?: string;
  avatarHeaders?: Record<string, string>;
  onClose: () => void;
  onSelect: (action: MoreMenuAction) => void;
};

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
      <View style={styles.icon}>{icon}</View>
      <AppText variant="body" style={styles.itemLabel}>{label}</AppText>
    </Pressable>
  );
}

/** Job-seeker home navigation drawer. */
export default function CandidateMoreMenu({
  visible,
  name,
  avatarUrl,
  avatarHeaders,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const choose = (action: MoreMenuAction) => {
    onClose();
    onSelect(action);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.drawer, { paddingTop: insets.top + vs(10), paddingBottom: insets.bottom + vs(16) }]}>
          <View style={styles.drawerHeader}>
            <Pressable
              onPress={() => choose('profile')}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              style={({ pressed }) => [styles.profile, pressed && styles.itemPressed]}>
              <UserAvatar name={name} uri={avatarUrl} headers={avatarHeaders} size={scale(48)} />
              <View style={styles.profileText}>
                <AppText variant="bodyBold" numberOfLines={1}>{name || 'My profile'}</AppText>
                <AppText variant="caption" color="primary">View profile</AppText>
              </View>
              <ChevronRight size={sizes.iconSm} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={onClose}
              hitSlop={scale(8)}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              style={({ pressed }) => [styles.close, pressed && styles.itemPressed]}>
              <X size={sizes.iconSm} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.highlight}>
            <Sparkles size={sizes.iconSm} color={colors.primary} />
            <AppText variant="bodyBold" style={styles.highlightText}>Find your next opportunity</AppText>
          </View>

          <View style={styles.menu}>
            <MenuItem icon={<Search size={sizes.iconSm} color={colors.primary} />} label="Search Jobs" onPress={() => choose('search')} />
            <MenuItem icon={<BriefcaseBusiness size={sizes.iconSm} color={colors.primary} />} label="Recommended Jobs" onPress={() => choose('recommended')} />
            <MenuItem icon={<FileText size={sizes.iconSm} color={colors.primary} />} label="Applied Jobs" onPress={() => choose('applied')} />
            <MenuItem icon={<BarChart3 size={sizes.iconSm} color={colors.primary} />} label="Profile Performance" onPress={() => choose('performance')} />
          </View>

          <View style={styles.divider} />

          <View style={styles.menu}>
            <MenuItem icon={<Settings size={sizes.iconSm} color={colors.primary} />} label="Settings" onPress={() => choose('settings')} />
            <MenuItem icon={<MessageCircle size={sizes.iconSm} color={colors.primary} />} label="Write to Us" onPress={() => choose('writeToUs')} />
            <MenuItem icon={<Info size={sizes.iconSm} color={colors.primary} />} label="About Us" onPress={() => choose('about')} />
          </View>

          <View style={styles.version}>
            <AppText variant="caption" color="textMuted">YYJCPL</AppText>
            <AppText variant="caption" color="textMuted">Version 1.0.0</AppText>
          </View>
        </View>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(28, 25, 23, 0.48)' },
  drawer: {
    width: '86%',
    maxWidth: scale(340),
    backgroundColor: colors.background,
  },
  backdrop: { flex: 1 },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: vs(20),
  },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileText: { flex: 1, gap: vs(2) },
  close: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: vs(18),
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  highlightText: { flex: 1, color: colors.primaryDark },
  menu: { paddingHorizontal: spacing.sm },
  item: {
    minHeight: vs(50),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemPressed: { opacity: 0.65 },
  icon: {
    width: scale(32),
    height: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  itemLabel: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, marginVertical: vs(12) },
  version: { marginTop: 'auto', paddingHorizontal: spacing.lg, gap: vs(2) },
});
