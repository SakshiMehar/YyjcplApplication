import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  FileText,
  FolderOpen,
  GraduationCap,
  IndianRupee,
  Languages,
  Link2,
  MapPin,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { AppButton, AppInput, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, sizes, spacing, vs } from '../../../theme';
import {
  useGetJobSeekerProfileQuery,
  useUpdateJobSeekerProfileMutation,
  useUploadResumeMutation,
} from '../api/candidateApi';
import { resolveResumeUrl } from '../utils/resume';

/* ─── Form type ──────────────────────────────────────────────────────────── */
type ProfileForm = {
  headline: string;
  professionalSummary: string;
  experience: string;
  skills: string;
  preferredLocation: string;
  preferredRole: string;
  education: string;
  currentSalary: string;
  expectedSalary: string;
  joiningDate: string;
  languages: string;
  certifications: string;
  projects: string;
  socialMediaLinks: string;
  resumeUrl: string;
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const iconProps = { size: sizes.iconSm, color: colors.textMuted };
const iconActive = { size: sizes.iconSm, color: colors.primary };

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

function apiErrorMessage(error: unknown): string {
  const e = error as {
    status?: number | string;
    data?: { message?: string; error?: string; errors?: unknown };
    error?: string;
  };

  // Network / timeout errors
  if (e?.status === 'FETCH_ERROR' || e?.status === 'TIMEOUT_ERROR') {
    return "Can't reach the server. Check your internet connection.";
  }

  // Server returned a structured error body
  if (e?.data?.message) return e.data.message;
  if (e?.data?.error) return e.data.error;

  // RTK Query serialized error string
  if (e?.error) return e.error;

  // HTTP status with no body
  if (typeof e?.status === 'number') {
    return `Server error (${e.status}). Please try again.`;
  }

  return 'Something went wrong. Please try again.';
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function EditCandidateProfileScreen({
  navigation,
}: CandidateScreenProps<'EditCandidateProfile'>) {
  const insets = useSafeAreaInsets();

  const { data: existing } = useGetJobSeekerProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateJobSeekerProfileMutation();
  const [uploadResume, { isLoading: isUploading }] = useUploadResumeMutation();

  // Tracks the file picked & uploaded this session
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);

  const handlePickResume = async (setUrl: (url: string) => void) => {
    try {
      const [file] = await pick({ type: [types.pdf] });

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name ?? 'resume.pdf',
        type: 'application/pdf',
      } as unknown as Blob);

      const result = await uploadResume(formData).unwrap();

      setUrl(resolveResumeUrl(result.resumeUrl));
      setResumeFileName(result.fileName);
      setResumeUploadedAt(
        new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      );
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Upload failed', 'Could not upload resume. Please try again.');
    }
  };

  const { control, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: {
      headline: '',
      professionalSummary: '',
      experience: '',
      skills: '',
      preferredLocation: '',
      preferredRole: '',
      education: '',
      currentSalary: '',
      expectedSalary: '',
      joiningDate: '',
      languages: '',
      certifications: '',
      projects: '',
      socialMediaLinks: '',
      resumeUrl: '',
    },
  });

  // Live skills preview
  const watchedSkills = useWatch({ control, name: 'skills' });
  const skillChips = (watchedSkills ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  // Pre-fill form once existing data arrives
  useEffect(() => {
    if (existing) {
      reset({
        headline: existing.headline ?? '',
        professionalSummary: existing.professionalSummary ?? '',
        experience: existing.experience ?? '',
        skills: existing.skills ?? '',
        preferredLocation: existing.preferredLocation ?? '',
        preferredRole: existing.preferredRole ?? '',
        education: existing.education ?? '',
        currentSalary: existing.currentSalary ?? '',
        expectedSalary: existing.expectedSalary ?? '',
        joiningDate: existing.joiningDate ?? '',
        languages: existing.languages ?? '',
        certifications: existing.certifications ?? '',
        projects: existing.projects ?? '',
        socialMediaLinks: existing.socialMediaLinks ?? '',
        resumeUrl: existing.resumeUrl ?? '',
      });
      if (existing.resumeUrl) {
        const parts = existing.resumeUrl.split('/');
        setResumeFileName(decodeURIComponent(parts[parts.length - 1] ?? 'Resume on file'));
      }
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async values => {
    // Backend expects ALL fields as strings, never undefined/omitted.
    // Empty fields must be sent as "". joiningDate must be YYYY-MM-DD or "".
    const body = {
      headline:            values.headline.trim(),
      professionalSummary: values.professionalSummary.trim(),
      experience:          values.experience.trim(),
      skills:              values.skills.trim(),
      resumeUrl:           values.resumeUrl.trim(),
      preferredLocation:   values.preferredLocation.trim(),
      education:           values.education.trim(),
      projects:            values.projects.trim(),
      socialMediaLinks:    values.socialMediaLinks.trim(),
      certifications:      values.certifications.trim(),
      languages:           values.languages.trim(),
      joiningDate:         values.joiningDate.trim(),   // must be YYYY-MM-DD or ""
      currentSalary:       values.currentSalary.trim(),
      expectedSalary:      values.expectedSalary.trim(),
      preferredRole:       values.preferredRole.trim(),
    };

    console.log('[EditProfile] Sending body:', JSON.stringify(body, null, 2));

    try {
      await updateProfile(body).unwrap();

      Alert.alert('Profile Updated', 'Your profile has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('[EditProfile] PUT /job-seeker/profile failed:', JSON.stringify(e, null, 2));
      Alert.alert('Could not save', apiErrorMessage(e));
    }
  });

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + vs(10) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={scale(12)}
          style={styles.backBtn}
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitles}>
          <AppText variant="h3">Edit Profile</AppText>
          <AppText variant="caption" color="textSecondary">
            Changes are saved to your public profile
          </AppText>
        </View>
      </View>

      {/* ── Scrollable form ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>

        {/* ── Professional Identity ── */}
        <SectionLabel label="Professional Identity" />

        <Controller
          control={control}
          name="headline"
          rules={{ required: 'Headline is required' }}
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Headline"
              placeholder="Java Backend Developer"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Shown prominently on your profile"
              leftElement={<Sparkles {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="professionalSummary"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <View style={styles.textAreaWrapper}>
              <AppText variant="caption" color="textSecondary" style={styles.textAreaLabel}>
                Professional Summary
              </AppText>
              <View style={[
                styles.textAreaField,
                fieldState.error ? styles.textAreaError : undefined,
              ]}>
                <View style={styles.textAreaIcon}>
                  <FileText {...(value ? iconActive : iconProps)} />
                </View>
                <TextInput
                  placeholder="Backend developer with experience building REST APIs…"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="sentences"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  textAlignVertical="top"
                  style={styles.textAreaInput}
                />
              </View>
              {fieldState.error ? (
                <AppText variant="caption" color="danger" style={styles.textAreaHint}>
                  {fieldState.error.message}
                </AppText>
              ) : (
                <AppText variant="caption" color="textMuted" style={styles.textAreaHint}>
                  A short paragraph about yourself
                </AppText>
              )}
            </View>
          )}
        />

        {/* ── Experience & Location ── */}
        <SectionLabel label="Experience & Location" />

        <Controller
          control={control}
          name="experience"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Experience"
              placeholder="3 years"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. Fresher, 1 year, 3 years, 5+ years"
              leftElement={<BriefcaseBusiness {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="preferredLocation"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Preferred Location"
              placeholder="Delhi"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="City where you'd like to work"
              leftElement={<MapPin {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Skills ── */}
        <SectionLabel label="Skills" />

        <Controller
          control={control}
          name="skills"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Skills"
              placeholder="Java, Spring Boot, MySQL"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Comma-separated — e.g. Java, Spring Boot, MySQL"
              leftElement={<Wrench {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Education & Career ── */}
        <SectionLabel label="Education & Career" />

        <Controller
          control={control}
          name="education"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Education"
              placeholder="B.Tech, Computer Science"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. B.Tech, Computer Science"
              leftElement={<GraduationCap {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="preferredRole"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Preferred Role"
              placeholder="Backend Developer"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="The job role you are targeting"
              leftElement={<UserRound {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="joiningDate"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Available to Join"
              placeholder="2026-11-01"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Date you can start — format: YYYY-MM-DD or Immediately"
              leftElement={<CalendarCheck {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Salary ── */}
        <SectionLabel label="Salary" />

        <Controller
          control={control}
          name="currentSalary"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Current Salary"
              placeholder="5 LPA"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. 5 LPA, ₹40,000/month"
              leftElement={<IndianRupee {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="expectedSalary"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Expected Salary"
              placeholder="8 LPA"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Your target CTC"
              leftElement={<Star {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Languages & Certifications ── */}
        <SectionLabel label="Languages & Certifications" />

        <Controller
          control={control}
          name="languages"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Languages Known"
              placeholder="English, Hindi"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Comma-separated"
              leftElement={<Languages {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        <Controller
          control={control}
          name="certifications"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Certifications"
              placeholder="AWS Cloud Practitioner"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. AWS Cloud Practitioner, Google Analytics"
              leftElement={<Award {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Projects ── */}
        <SectionLabel label="Projects" />

        <Controller
          control={control}
          name="projects"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Projects"
              placeholder="Job portal API; inventory management app"
              autoCapitalize="sentences"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="Semicolon-separated project names"
              leftElement={<FolderOpen {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Social & Links ── */}
        <SectionLabel label="Social & Links" />

        <Controller
          control={control}
          name="socialMediaLinks"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              label="Social Media / Links"
              placeholder="LinkedIn: https://linkedin.com/in/…"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              hint="e.g. LinkedIn: url, GitHub: url"
              leftElement={<Link2 {...(value ? iconActive : iconProps)} />}
            />
          )}
        />

        {/* ── Resume ── */}
        <SectionLabel label="Resume" />

        <Controller
          control={control}
          name="resumeUrl"
          render={({ field: { value, onChange } }) => (
            <View style={styles.resumeCard}>
              {/* Header */}
              <View style={styles.resumeCardHeader}>
                <AppText variant="bodyBold">Resume</AppText>
                {value ? (
                  <Pressable
                    onPress={() => handlePickResume(onChange)}
                    disabled={isUploading}
                    style={styles.resumeUpdateBtn}
                    accessibilityLabel="Update resume">
                    <AppText variant="caption" style={styles.resumeUpdateText}>
                      {isUploading ? 'Uploading…' : 'Update'}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>

              {value ? (
                /* File uploaded / on file */
                <View style={styles.resumeFileRow}>
                  <View style={styles.resumeFileIcon}>
                    <FileText size={scale(26)} color={colors.primary} />
                  </View>
                  <View style={styles.resumeFileMeta}>
                    <AppText variant="body" numberOfLines={1} style={styles.resumeFileName}>
                      {resumeFileName ?? 'Resume on file'}
                    </AppText>
                    {resumeUploadedAt ? (
                      <AppText variant="caption" color="primary">{resumeUploadedAt}</AppText>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => { onChange(''); setResumeFileName(null); setResumeUploadedAt(null); }}
                    hitSlop={scale(10)}
                    accessibilityLabel="Remove resume">
                    <Trash2 size={scale(18)} color={colors.danger} />
                  </Pressable>
                </View>
              ) : (
                /* Empty — tap to pick */
                <Pressable
                  onPress={() => handlePickResume(onChange)}
                  disabled={isUploading}
                  style={styles.resumeEmptyBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Add resume">
                  <View style={styles.resumeEmptyIcon}>
                    <Upload size={scale(24)} color={colors.primary} />
                  </View>
                  <AppText variant="bodyBold" color="primary">
                    {isUploading ? 'Uploading…' : 'Add Resume'}
                  </AppText>
                  <AppText variant="caption" color="textMuted">PDF only · max 10 MB</AppText>
                </Pressable>
              )}
            </View>
          )}
        />

        {/* ── Skills preview ── */}
        {skillChips.length > 0 ? (
          <View style={styles.skillsPreview}>
            <AppText variant="caption" color="textMuted" style={styles.skillsPreviewLabel}>
              Skills preview
            </AppText>
            <View style={styles.chipRow}>
              {skillChips.map((chip: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <AppText variant="caption" style={styles.chipText}>
                    {chip}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ height: vs(16) }} />
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        <AppButton
          title="Save Profile"
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

  /* Header */
  header: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitles: {
    flex: 1,
    gap: vs(2),
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
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

  /* Multiline textarea (Professional Summary) */
  textAreaWrapper: {
    marginBottom: spacing.lg,
  },
  textAreaLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  textAreaField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(10),
    minHeight: vs(100),
  },
  textAreaError: {
    borderColor: colors.danger,
  },
  textAreaIcon: {
    marginTop: vs(2),
    marginRight: spacing.sm,
  },
  textAreaInput: {
    flex: 1,
    fontSize: font(15),
    color: colors.text,
    padding: 0,
    textAlignVertical: 'top',
    minHeight: vs(80),
  },
  textAreaHint: {
    marginTop: spacing.xs,
  },

  /* Skills preview */
  skillsPreview: {
    marginTop: vs(-8),
    marginBottom: vs(20),
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  skillsPreviewLabel: {
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: vs(8),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
  },
  chipText: {
    color: colors.primary,
    fontWeight: '600',
  },

  /* Resume card */
  resumeCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  resumeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  resumeUpdateBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
  },
  resumeUpdateText: {
    color: colors.primary,
    fontWeight: '700',
  },
  resumeFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resumeFileIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resumeFileMeta: {
    flex: 1,
    gap: vs(3),
  },
  resumeFileName: {
    fontWeight: '600',
  },
  resumeEmptyBtn: {
    alignItems: 'center',
    paddingVertical: vs(20),
    gap: vs(6),
  },
  resumeEmptyIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(4),
  },

  footer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },
});
