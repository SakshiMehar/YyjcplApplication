import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  IndianRupee,
  MapPin,
  UserRoundPlus,
  Clock3,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppInput, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { RecruiterScreenProps } from '../../../navigation/types';
import {
  colors,
  radius,
  scale,
  sizes,
  spacing,
  vs,
} from '../../../theme';
import { useCreateJobMutation } from '../api/recruiterApi';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type JobForm = {
  companyName: string;
  role: string;
  salary: string;
  experience: string;
  candidateVacancies: string;
  location: string;
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const iconProps = { size: sizes.iconSm, color: colors.textMuted };
const iconPropsActive = { size: sizes.iconSm, color: colors.primary };

function jobErrorMessage(error: unknown): string {
  const e = error as {
    status?: number | string;
    data?: { message?: string; error?: string };
  };
  return (
    e?.data?.message ??
    e?.data?.error ??
    'Please check the job details and try again.'
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.sectionAccent} />
      <AppText variant="caption" color="textSecondary" style={styles.sectionLabelText}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

/* ─── Live Preview Card ──────────────────────────────────────────────────── */
function JobPreviewCard({
  companyName,
  role,
  salary,
  experience,
  candidateVacancies,
  location,
}: Partial<JobForm>) {
  const hasContent = !!(role || companyName);

  return (
    <View style={styles.previewCard}>
      {/* Card header */}
      <View style={styles.previewHeader}>
        <View style={styles.previewIconWrap}>
          <BriefcaseBusiness size={scale(22)} color={colors.primary} />
        </View>
        <View style={styles.previewTitles}>
          <AppText variant="bodyBold" style={styles.previewRole} numberOfLines={1}>
            {role || 'Job Role'}
          </AppText>
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {companyName || 'Company Name'}
          </AppText>
        </View>
        {hasContent && (
          <View style={styles.previewBadge}>
            <AppText variant="caption" style={styles.previewBadgeText}>
              Preview
            </AppText>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.previewDivider} />

      {/* Meta chips */}
      <View style={styles.previewChips}>
        <PreviewChip
          icon={<IndianRupee size={scale(11)} color={colors.primary} />}
          label={salary || '₹ Salary'}
        />
        <PreviewChip
          icon={<Clock3 size={scale(11)} color={colors.primary} />}
          label={experience || 'Experience'}
        />
        <PreviewChip
          icon={<MapPin size={scale(11)} color={colors.primary} />}
          label={location || 'Location'}
        />
        <PreviewChip
          icon={<UserRoundPlus size={scale(11)} color={colors.primary} />}
          label={
            candidateVacancies
              ? `${candidateVacancies} Vacanc${Number(candidateVacancies) === 1 ? 'y' : 'ies'}`
              : 'Vacancies'
          }
        />
      </View>
    </View>
  );
}

function PreviewChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.chip}>
      {icon}
      <AppText variant="caption" color="textSecondary" style={styles.chipText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function PostJobScreen({
  navigation,
}: RecruiterScreenProps<'PostJob'>) {
  const insets = useSafeAreaInsets();
  const [createJob, { isLoading }] = useCreateJobMutation();

  const { control, handleSubmit, reset } = useForm<JobForm>({
    defaultValues: {
      companyName: '',
      role: '',
      salary: '',
      experience: '',
      candidateVacancies: '',
      location: '',
    },
  });

  // Live preview values
  const watched = useWatch({ control });

  const onSubmit = handleSubmit(async values => {
    const vacancies = Number(values.candidateVacancies);
    if (!Number.isInteger(vacancies) || vacancies < 1) {
      Alert.alert('Invalid vacancies', 'Enter at least 1 candidate vacancy.');
      return;
    }

    try {
      await createJob({
        companyName: values.companyName.trim(),
        role: values.role.trim(),
        salary: values.salary.trim(),
        experience: values.experience.trim(),
        candidateVacancies: vacancies,
        location: values.location.trim(),
      }).unwrap();

      reset();
      Alert.alert(
        'Job Posted!',
        'Your job listing has been submitted for approval.',
        [
          {
            text: 'View Jobs',
            onPress: () =>
              navigation.navigate('RecruiterTabs', { screen: 'MyJobs' }),
          },
        ],
      );
    } catch (e) {
      Alert.alert('Could not post job', jobErrorMessage(e));
    }
  });

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      {/* ── Gradient-style Hero Header ── */}
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        {/* Back button */}
        {navigation.canGoBack() && (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={scale(12)}
            style={styles.backBtn}
            accessibilityLabel="Go back">
            <ChevronLeft size={scale(22)} color={colors.textOnPrimary} />
          </Pressable>
        )}

        {/* Hero copy */}
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Sparkles size={scale(18)} color={colors.primary} />
          </View>
          <AppText variant="h2" style={styles.heroTitle}>
            Post a Job
          </AppText>
          <AppText variant="caption" style={styles.heroSub}>
            Fill in the details below and reach thousands of candidates
          </AppText>
        </View>
      </View>

      {/* ── Scrollable form body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Live Preview Card */}
        <JobPreviewCard
          companyName={watched.companyName}
          role={watched.role}
          salary={watched.salary}
          experience={watched.experience}
          candidateVacancies={watched.candidateVacancies}
          location={watched.location}
        />

        {/* ── Section: Company ── */}
        <SectionLabel label="Company" />
        <Controller
          control={control}
          name="companyName"
          rules={{ required: 'Enter company name' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Company Name"
              placeholder="YY Job Care"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftElement={
                <Building2
                  {...(value ? iconPropsActive : iconProps)}
                />
              }
            />
          )}
        />

        {/* ── Section: Role & Experience ── */}
        <SectionLabel label="Role & Experience" />
        <Controller
          control={control}
          name="role"
          rules={{ required: 'Enter job role' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Job Role"
              placeholder="Java Developer"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftElement={
                <BriefcaseBusiness
                  {...(value ? iconPropsActive : iconProps)}
                />
              }
            />
          )}
        />
        <Controller
          control={control}
          name="experience"
          rules={{ required: 'Enter required experience' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Experience Required"
              placeholder="2–4 years"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. 2–4 years, Fresher, 5+ years"
              leftElement={
                <Clock3 {...(value ? iconPropsActive : iconProps)} />
              }
            />
          )}
        />

        {/* ── Section: Compensation & Team ── */}
        <SectionLabel label="Compensation & Team" />
        <Controller
          control={control}
          name="salary"
          rules={{ required: 'Enter salary range' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Salary / CTC"
              placeholder="₹8–12 LPA"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. ₹8–12 LPA, ₹40,000/month"
              leftElement={
                <IndianRupee
                  {...(value ? iconPropsActive : iconProps)}
                />
              }
            />
          )}
        />

        {/* Vacancies — compact single-field row */}
        <View style={styles.halfRow}>
          <Controller
            control={control}
            name="candidateVacancies"
            rules={{ required: 'Enter vacancies' }}
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <AppInput
                label="Vacancies"
                placeholder="3"
                keyboardType="number-pad"
                value={value}
                onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))}
                onBlur={onBlur}
                error={fieldState.error?.message}
                hint="No. of open positions"
                leftElement={
                  <UserRoundPlus
                    {...(value ? iconPropsActive : iconProps)}
                  />
                }
                style={styles.halfInput}
              />
            )}
          />
        </View>

        {/* ── Section: Location ── */}
        <SectionLabel label="Location" />
        <Controller
          control={control}
          name="location"
          rules={{ required: 'Enter job location' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="City / Work Location"
              placeholder="Delhi"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. Delhi, Mumbai, Remote"
              leftElement={
                <MapPin {...(value ? iconPropsActive : iconProps)} />
              }
            />
          )}
        />

        {/* Bottom breathing room above sticky footer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={styles.footer}>
        <AppButton
          title="Save & Post Job"
          onPress={onSubmit}
          loading={isLoading}
        />
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  /* Hero */
  hero: {
    backgroundColor: colors.text, // near-black base
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(24),
  },
  backBtn: {
    marginTop: vs(10),
    marginBottom: vs(4),
    alignSelf: 'flex-start',
  },
  heroContent: {
    marginTop: vs(4),
  },
  heroIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  heroTitle: {
    color: colors.textOnPrimary,
    marginBottom: vs(4),
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
  },

  /* Preview Card */
  previewCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: vs(24),
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.06,
    shadowRadius: scale(8),
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewIconWrap: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitles: {
    flex: 1,
  },
  previewRole: {
    marginBottom: vs(2),
  },
  previewBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  previewBadgeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  previewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: vs(12),
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
  },
  chipText: {
    maxWidth: scale(90),
  },

  /* Section labels */
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: vs(12),
    marginTop: vs(4),
  },
  sectionAccent: {
    width: scale(3),
    height: scale(14),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sectionLabelText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  /* Half-width row for vacancies */
  halfRow: {
    maxWidth: '60%',
  },
  halfInput: {
    minWidth: 0,
  },

  /* Sticky footer */
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },

  bottomSpacer: {
    height: vs(16),
  },
});
