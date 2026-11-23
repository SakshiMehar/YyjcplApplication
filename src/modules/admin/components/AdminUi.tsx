import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { colors, font, radius, scale, sizes, spacing, vs } from '../../../theme';

/* ─── Tones (status pills, soft buttons) ─────────────────────────────────── */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' | 'purple';

export const TONES: Record<Tone, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: colors.success },
  warning: { bg: '#FEF9C3', text: '#92400E' },
  danger: { bg: '#FEE2E2', text: colors.danger },
  info: { bg: '#DBEAFE', text: '#1D4ED8' },
  primary: { bg: colors.primaryLight, text: colors.primary },
  neutral: { bg: '#F3F4F6', text: colors.textSecondary },
  purple: { bg: '#F3F0FF', text: '#7C3AED' },
};

/* ─── Screen shell: back + title header on the light-grey surface ───────── */
type AdminScreenProps = {
  title: string;
  subtitle?: string;
  /** Tab screens have no back button. */
  showBack?: boolean;
  right?: React.ReactNode;
  /** Pinned under the header (search bar, pill tabs…). */
  toolbar?: React.ReactNode;
  /** Pinned at the bottom (primary action). */
  footer?: React.ReactNode;
  /** Inside a bottom-tab navigator the tab bar already covers the bottom inset. */
  inTabs?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function AdminScreen({
  title,
  subtitle,
  showBack = true,
  right,
  toolbar,
  footer,
  inTabs,
  onRefresh,
  contentStyle,
  children,
}: AdminScreenProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = onRefresh
    ? () => {
        setRefreshing(true);
        onRefresh();
        setTimeout(() => setRefreshing(false), 600);
      }
    : undefined;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        {showBack ? (
          <Pressable
            onPress={navigation.goBack}
            hitSlop={scale(8)}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.back}>
            <ChevronLeft size={sizes.iconMd} color={colors.text} />
          </Pressable>
        ) : null}
        <View style={styles.titleWrap}>
          <AppText variant="h3" numberOfLines={1} style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
      {toolbar ? <View style={styles.toolbar}>{toolbar}</View> : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          handleRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (inTabs || footer ? 0 : insets.bottom) + vs(24) },
          contentStyle,
        ]}>
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: (inTabs ? 0 : insets.bottom) + vs(12) }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/* ─── White rounded card ─────────────────────────────────────────────────── */
export function Panel({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.panel, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.panel, style]}>{children}</View>;
}

/* ─── Colored status pill ────────────────────────────────────────────────── */
export function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <AppText style={[styles.pillText, { color: t.text }]}>{label}</AppText>
    </View>
  );
}

/* ─── Segmented pill tabs: "Active (8) | Pending (2) | Closed (4)" ───────── */
export type PillTab<K extends string> = { key: K; label: string; count?: number };

export function PillTabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: PillTab<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <View style={styles.tabs}>
      {tabs.map(tab => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}>
            <AppText
              numberOfLines={1}
              style={[styles.tabText, active && styles.tabTextActive]}>
              {tab.label}
              {tab.count !== undefined ? ` (${tab.count})` : ''}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Section title with optional "See all →" ────────────────────────────── */
export function SectionTitle({
  title,
  actionLabel = 'See all →',
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <AppText variant="h3" style={styles.sectionTitle}>
        {title}
      </AppText>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={scale(8)} accessibilityRole="button">
          <AppText variant="caption" style={styles.sectionAction}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── Small soft / filled / outline action button ────────────────────────── */
export function ActionButton({
  title,
  onPress,
  tone = 'primary',
  variant = 'soft',
  icon: Icon,
  style,
}: {
  title: string;
  onPress: () => void;
  tone?: Tone;
  variant?: 'soft' | 'filled' | 'outline';
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}) {
  const t = TONES[tone];
  const filledBg = tone === 'primary' ? colors.primary : t.text;
  const bg = variant === 'filled' ? filledBg : variant === 'soft' ? t.bg : colors.background;
  const fg = variant === 'filled' ? colors.textOnPrimary : t.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.2, borderColor: t.text },
        variant === 'filled' && tone === 'primary' && styles.actionShadow,
        pressed && styles.pressed,
        style,
      ]}>
      {Icon ? <Icon size={scale(15)} color={fg} strokeWidth={2.3} /> : null}
      <AppText style={[styles.actionText, { color: fg }]}>{title}</AppText>
    </Pressable>
  );
}

/* ─── Icon + label + value row ───────────────────────────────────────────── */
export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={scale(16)} color={colors.primary} />
      </View>
      <AppText variant="caption" color="textSecondary" style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText variant="bodyBold" style={styles.infoValue} numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

/* ─── Skill / tag chip ───────────────────────────────────────────────────── */
export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <AppText variant="caption" color="primary" style={styles.tagText}>
        {label}
      </AppText>
    </View>
  );
}

/* ─── Divider for stacked rows inside a Panel ────────────────────────────── */
export const RowDivider = () => <View style={styles.divider} />;

export const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(10),
  },
  back: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: { fontWeight: '700' },
  toolbar: { paddingHorizontal: spacing.lg, paddingBottom: vs(10), gap: vs(10) },
  content: { paddingHorizontal: spacing.lg, paddingTop: vs(4) },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(12),
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  panel: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: vs(12),
    boxShadow: `0px ${scale(2)}px ${scale(8)}px rgba(28, 25, 23, 0.04)`,
  },
  pressed: { opacity: 0.82 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  pillText: { fontSize: font(10), fontWeight: '700', letterSpacing: 0.3 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: scale(4),
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    height: vs(34),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  tabActive: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primarySoft },
  tabText: { fontSize: font(12.5), fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(8),
    marginBottom: vs(12),
  },
  sectionTitle: { fontWeight: '700' },
  sectionAction: { color: colors.primary, fontWeight: '600' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    height: vs(36),
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  actionShadow: { boxShadow: `0px ${scale(4)}px ${scale(10)}px rgba(249, 115, 22, 0.28)` },
  actionText: { fontSize: font(13), fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: vs(8) },
  infoIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { width: scale(92) },
  infoValue: { flex: 1, textAlign: 'right', fontSize: font(14) },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(5),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  tagText: { fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: vs(10) },
});
