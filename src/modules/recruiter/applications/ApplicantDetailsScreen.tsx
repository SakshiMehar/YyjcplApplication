import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  FileText,
  GraduationCap,
  Globe,
  IndianRupee,
  Languages,
  MapPin,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react-native';
import { AppText, UserAvatar } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { RecruiterScreenProps } from '../../../navigation/types';
import { colors, font, radius, scale, sizes, spacing, vs } from '../../../theme';
import { ENV } from '../../../config/env';
import ApplicationActions from './ApplicationActions';

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  APPLIED:             { bg: '#DBEAFE', text: '#1D4ED8' },
  SHORTLISTED:         { bg: '#FFF1E6', text: colors.primary },
  INTERVIEW_SCHEDULED: { bg: '#FEF9C3', text: '#92400E' },
  NEXT_ROUND:          { bg: '#CCFBF1', text: '#0F766E' },
  SELECTED:            { bg: '#DCFCE7', text: colors.success },
  NOT_SELECTED:        { bg: '#F3F4F6', text: colors.textMuted },
  PLACED:              { bg: '#DCFCE7', text: colors.success },
  REJECTED:            { bg: '#FEE2E2', text: colors.danger },
  WITHDRAWN:           { bg: '#F3F4F6', text: colors.textMuted },
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

/* ─── Info row ───────────────────────────────────────────────────────────── */
function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  if (!value) return null;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <AppText variant="caption" color="textMuted" style={styles.infoLabel}>
          {label}
        </AppText>
        <AppText
          variant="body"
          style={[styles.infoValue, onPress && styles.infoLink]}
          numberOfLines={2}>
          {value}
        </AppText>
      </View>
    </Pressable>
  );
}

function RowDivider() {
  return <View style={styles.rowDivider} />;
}

/* ─── Section title ──────────────────────────────────────────────────────── */
function SectionTitle({ label }: { label: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <AppText variant="caption" color="textSecondary" style={styles.sectionTitleText}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

/* ─── Skill chip ─────────────────────────────────────────────────────────── */
function SkillChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" style={styles.chipText}>{label.trim()}</AppText>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function ApplicantDetailsScreen({
  route,
  navigation,
}: RecruiterScreenProps<'ApplicantDetails'>) {
  const { application } = route.params;
  const profile = application.jobSeekerProfile;
  const insets = useSafeAreaInsets();

  const name = profile?.name ?? application.applicantName ?? application.jobSeekerName ?? `Job Seeker #${application.jobSeekerId}`;
  const appliedDate = new Date(application.appliedAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const skillList = profile?.skills
    ? profile.skills.split(',').filter(s => s.trim().length > 0)
    : [];

  const handleResumeOpen = () => {
    if (!profile?.resumeUrl) return;
    const url = profile.resumeUrl.startsWith('http')
      ? profile.resumeUrl
      : `${ENV.API_BASE_URL.replace('/api', '')}${profile.resumeUrl}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero ── */}
        <View style={[styles.hero, { paddingTop: insets.top + vs(16) }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={scale(12)}
            accessibilityLabel="Go back">
            <ChevronLeft size={scale(22)} color={colors.textOnPrimary} />
          </Pressable>

          <UserAvatar name={name} size={scale(80)} />

          <View style={styles.nameRow}>
            <AppText variant="h2" style={styles.heroName} numberOfLines={1}>
              {name}
            </AppText>
          </View>

          {profile?.headline ? (
            <AppText variant="body" style={styles.heroHeadline} numberOfLines={2}>
              {profile.headline}
            </AppText>
          ) : null}

          {/* Pills */}
          <View style={styles.heroPills}>
            <StatusBadge status={application.status} />
            {profile?.experience ? (
              <View style={styles.heroPill}>
                <BriefcaseBusiness size={scale(11)} color="rgba(255,255,255,0.7)" />
                <AppText variant="caption" style={styles.heroPillText}>
                  {profile.experience}
                </AppText>
              </View>
            ) : null}
            {profile?.preferredLocation ? (
              <View style={styles.heroPill}>
                <MapPin size={scale(11)} color="rgba(255,255,255,0.7)" />
                <AppText variant="caption" style={styles.heroPillText}>
                  {profile.preferredLocation}
                </AppText>
              </View>
            ) : null}
          </View>

          {/* Applied for */}
          {application.job?.role ? (
            <View style={styles.appliedForRow}>
              <AppText variant="caption" style={styles.appliedForText}>
                Applied for: {application.job.role}
                {application.job.companyName ? ` at ${application.job.companyName}` : ''}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ── Professional Summary ── */}
        {profile?.headline ? (
          <View style={styles.section}>
            <SectionTitle label="About" />
            <View style={styles.card}>
              <View style={styles.aboutRow}>
                <Sparkles size={sizes.iconSm} color={colors.primary} />
                <AppText variant="body" color="textSecondary" style={styles.aboutText}>
                  {profile.headline}
                </AppText>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Details ── */}
        <View style={styles.section}>
          <SectionTitle label="Details" />
          <View style={styles.card}>
            <InfoRow
              icon={<BriefcaseBusiness size={sizes.iconSm} color={colors.primary} />}
              label="Experience"
              value={profile?.experience}
            />
            {profile?.experience && profile?.preferredLocation ? <RowDivider /> : null}
            <InfoRow
              icon={<MapPin size={sizes.iconSm} color={colors.primary} />}
              label="Preferred Location"
              value={profile?.preferredLocation}
            />
            {profile?.preferredLocation && profile?.preferredRole ? <RowDivider /> : null}
            <InfoRow
              icon={<Star size={sizes.iconSm} color={colors.primary} />}
              label="Preferred Role"
              value={profile?.preferredRole}
            />
            {profile?.preferredRole && profile?.education ? <RowDivider /> : null}
            <InfoRow
              icon={<GraduationCap size={sizes.iconSm} color={colors.primary} />}
              label="Education"
              value={profile?.education}
            />
            {profile?.education && profile?.certifications ? <RowDivider /> : null}
            <InfoRow
              icon={<Award size={sizes.iconSm} color={colors.primary} />}
              label="Certifications"
              value={profile?.certifications}
            />
            {profile?.certifications && profile?.languages ? <RowDivider /> : null}
            <InfoRow
              icon={<Languages size={sizes.iconSm} color={colors.primary} />}
              label="Languages"
              value={profile?.languages}
            />
          </View>
        </View>

        {/* ── Salary ── */}
        {(profile?.currentSalary || profile?.expectedSalary) ? (
          <View style={styles.section}>
            <SectionTitle label="Salary" />
            <View style={styles.card}>
              <InfoRow
                icon={<IndianRupee size={sizes.iconSm} color={colors.primary} />}
                label="Current Salary"
                value={profile?.currentSalary}
              />
              {profile?.currentSalary && profile?.expectedSalary ? <RowDivider /> : null}
              <InfoRow
                icon={<IndianRupee size={sizes.iconSm} color={colors.primary} />}
                label="Expected Salary"
                value={profile?.expectedSalary}
              />
            </View>
          </View>
        ) : null}

        {/* ── Skills ── */}
        {skillList.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle label="Skills" />
            <View style={styles.card}>
              <View style={styles.skillsRow}>
                <Wrench size={sizes.iconSm} color={colors.primary} style={{ marginTop: vs(2) }} />
                <View style={styles.chipWrap}>
                  {skillList.map((s, i) => <SkillChip key={i} label={s} />)}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Resume ── */}
        {profile?.resumeUrl ? (
          <View style={styles.section}>
            <SectionTitle label="Resume" />
            <Pressable
              onPress={handleResumeOpen}
              style={({ pressed }) => [styles.card, styles.resumeCard, pressed && styles.resumeCardPressed]}
              accessibilityLabel="Open resume">
              <View style={styles.resumeIcon}>
                <FileText size={scale(24)} color={colors.primary} />
              </View>
              <View style={styles.resumeMeta}>
                <AppText variant="bodyBold">View Resume</AppText>
                <AppText variant="caption" color="primary">Tap to open PDF</AppText>
              </View>
              <Globe size={scale(16)} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}

        {/* ── Application Info ── */}
        <View style={styles.section}>
          <SectionTitle label="Application" />
          <View style={styles.card}>
            <InfoRow
              icon={<CalendarCheck size={sizes.iconSm} color={colors.primary} />}
              label="Applied On"
              value={appliedDate}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle label="Manage application" />
          <ApplicationActions
            applicationId={String(application.applicationId)}
            status={application.status}
            onUpdated={() => navigation.goBack()}
          />
        </View>

        <View style={{ height: vs(16) }} />
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: vs(8) },

  /* Hero */
  hero: {
    backgroundColor: colors.text,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(28),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: vs(20),
  },
  backBtn: {
    position: 'absolute',
    top: vs(16),
    left: spacing.lg,
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(14),
    gap: spacing.sm,
  },
  heroName: { color: colors.textOnPrimary, textAlign: 'center' },
  heroHeadline: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: vs(4),
    paddingHorizontal: spacing.xl,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: vs(12),
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
  },
  heroPillText: { color: 'rgba(255,255,255,0.75)' },
  appliedForRow: {
    marginTop: vs(10),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
  },
  appliedForText: { color: 'rgba(255,255,255,0.7)' },

  /* Badge */
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  badgeText: { fontWeight: '700', fontSize: font(11) },

  /* Sections */
  section: { marginHorizontal: spacing.lg, marginBottom: vs(16) },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: vs(8),
  },
  sectionAccent: {
    width: scale(3),
    height: scale(14),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sectionTitleText: { fontWeight: '700', letterSpacing: 0.8 },

  /* Card */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  /* About */
  aboutRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  aboutText: { flex: 1, lineHeight: vs(20) },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoLabel: { fontWeight: '600', letterSpacing: 0.4, marginBottom: vs(2) },
  infoValue: { color: colors.text },
  infoLink: { color: colors.primary, textDecorationLine: 'underline' },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(32) + spacing.md,
  },

  /* Skills */
  skillsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  chipWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  chipText: { color: colors.primary, fontWeight: '600' },

  /* Resume */
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  resumeCardPressed: { backgroundColor: colors.surface },
  resumeIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resumeMeta: { flex: 1, gap: vs(2) },
});
