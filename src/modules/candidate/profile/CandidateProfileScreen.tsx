import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Award,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Languages,
  Link2,
  LogOut,
  MapPin,
  Pencil,
  Settings,
  Sparkles,
  TriangleAlert,
  UserRound,
  Wrench,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppText, UserAvatar } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateStackParamList } from '../../../navigation/types';
import { clearToken } from '../../../services/secureStorage';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import {
  colors,
  font,
  MAX_FONT_MULTIPLIER,
  radius,
  scale,
  sizes,
  spacing,
  vs,
} from '../../../theme';
import {
  useGetJobSeekerProfileQuery,
  useUpdateJobSeekerProfileMutation,
  useGetCertificationsQuery,
  useAddCertificationMutation,
  useGetProjectsQuery,
  useAddProjectMutation,
} from '../api/candidateApi';

type Nav = NativeStackNavigationProp<CandidateStackParamList>;

function isValidProjectDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

function projectSaveErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Unable to save the project. Please try again.';
  }

  const apiError = error as {
    status?: unknown;
    data?: unknown;
    error?: unknown;
  };

  if (apiError.status === 'FETCH_ERROR') {
    return "Can't reach the server. Check your internet connection.";
  }
  if (apiError.status === 'TIMEOUT_ERROR') {
    return 'The request timed out. Please try again.';
  }

  if (apiError.data && typeof apiError.data === 'object') {
    const response = apiError.data as { message?: unknown; error?: unknown };
    if (typeof response.message === 'string' && response.message.trim()) {
      return response.message;
    }
    if (typeof response.error === 'string' && response.error.trim()) {
      return response.error;
    }
  } else if (typeof apiError.data === 'string' && apiError.data.trim()) {
    return apiError.data;
  }

  if (typeof apiError.error === 'string' && apiError.error.trim()) {
    return apiError.error;
  }
  if (typeof apiError.status === 'number') {
    return `The server rejected the project (HTTP ${apiError.status}). Please review the details and try again.`;
  }
  return 'Unable to save the project. Please try again.';
}

function getSocialMediaFields(value?: string): { name: string; url: string } {
  const savedValue = value?.trim() ?? '';
  const match = /^([^:\n]+):\s*(https?:\/\/\S+)$/i.exec(savedValue);

  if (match) {
    return { name: match[1].trim(), url: match[2].trim() };
  }

  return { name: savedValue ? 'Social media' : '', url: savedValue };
}

function isValidSocialMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ─── Quick-edit field ───────────────────────────────────────────────────── */
function QuickField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={qStyles.field}>
      <AppText variant="caption" color="textSecondary" style={qStyles.label}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[qStyles.input, multiline && qStyles.inputMulti]}
      />
    </View>
  );
}

const qStyles = StyleSheet.create({
  field: { marginBottom: vs(14) },
  label: { fontWeight: '600', marginBottom: vs(6) },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(10),
    fontSize: font(14),
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputMulti: { minHeight: vs(80) },
});

/* ─── Section title with optional edit pencil ───────────────────────────── */
function SectionTitle({
  label,
  onEdit,
}: {
  label: string;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <AppText variant="caption" color="textSecondary" style={styles.sectionTitleText}>
        {label.toUpperCase()}
      </AppText>
      {onEdit ? (
        <Pressable
          onPress={onEdit}
          hitSlop={scale(10)}
          style={styles.sectionEditBtn}
          accessibilityLabel={`Edit ${label}`}>
          <Pencil size={scale(13)} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── Info row ───────────────────────────────────────────────────────────── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <AppText variant="caption" color="textMuted" style={styles.infoLabel}>
          {label}
        </AppText>
        <AppText variant="body" style={styles.infoValue}>
          {value}
        </AppText>
      </View>
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

/* ─── Action row ─────────────────────────────────────────────────────────── */
function ActionRow({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
      accessibilityRole="button">
      <View style={[styles.actionIcon, destructive && styles.actionIconDestructive]}>
        {icon}
      </View>
      <AppText
        variant="body"
        style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}
        numberOfLines={1}>
        {label}
      </AppText>
      <ChevronRight size={scale(16)} color={destructive ? colors.danger : colors.textMuted} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function CandidateProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const insets = useSafeAreaInsets();

  const { data: profile, isLoading, isError } = useGetJobSeekerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateJobSeekerProfileMutation();
  const { data: certifications = [] } = useGetCertificationsQuery();
  const [addCertification, { isLoading: isCertSaving }] = useAddCertificationMutation();
  const { data: projects = [] } = useGetProjectsQuery();
  const [addProject, { isLoading: isProjSaving }] = useAddProjectMutation();

  /* ── Certification modal state ── */
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [certCompletionId, setCertCompletionId] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certValidFrom, setCertValidFrom] = useState('');
  const [certValidTill, setCertValidTill] = useState('');
  const [certNoExpiry, setCertNoExpiry] = useState(false);

  /* ── Project modal state ── */
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projStatus, setProjStatus] = useState<'In Progress' | 'Finished'>('Finished');
  const [projWorkedFrom, setProjWorkedFrom] = useState('');
  const [projWorkedTill, setProjWorkedTill] = useState('');
  const [projDetails, setProjDetails] = useState('');
  const [projShowMore, setProjShowMore] = useState(false);
  const [projLocation, setProjLocation] = useState('');
  const [projSite, setProjSite] = useState<'Off Site' | 'On Site'>('Off Site');
  const [projEmployment, setProjEmployment] = useState<'Full Time' | 'Part Time' | 'Contractual'>('Full Time');
  const [projTeamSize, setProjTeamSize] = useState('');
  const [projRole, setProjRole] = useState('');
  const [projRoleDesc, setProjRoleDesc] = useState('');
  const [projSkillsUsed, setProjSkillsUsed] = useState('');

  const openProjectModal = () => {
    setProjTitle('');
    setProjClient('');
    setProjStatus('Finished');
    setProjWorkedFrom('');
    setProjWorkedTill('');
    setProjDetails('');
    setProjShowMore(false);
    setProjLocation('');
    setProjSite('Off Site');
    setProjEmployment('Full Time');
    setProjTeamSize('');
    setProjRole('');
    setProjRoleDesc('');
    setProjSkillsUsed('');
    setProjectModalOpen(true);
  };

  const handleProjectSave = async () => {
    if (!projTitle.trim()) {
      Alert.alert('Required', 'Please enter a project title.');
      return;
    }
    if (!projClient.trim()) {
      Alert.alert('Required', 'Please enter the client.');
      return;
    }
    const workedFrom = projWorkedFrom.trim();
    const workedTill = projWorkedTill.trim();
    if (!workedFrom) {
      Alert.alert('Required', 'Please enter the worked from date.');
      return;
    }
    if (!isValidProjectDate(workedFrom)) {
      Alert.alert('Invalid date', 'Enter "Worked from" as YYYY-MM-DD.');
      return;
    }
    const status = projStatus === 'In Progress' ? 'IN_PROGRESS' : 'FINISHED';
    if (status === 'FINISHED' && !workedTill) {
      Alert.alert('Required', 'Please enter the worked till date for a finished project.');
      return;
    }
    if (workedTill && !isValidProjectDate(workedTill)) {
      Alert.alert('Invalid date', 'Enter "Worked till" as YYYY-MM-DD.');
      return;
    }
    if (workedFrom && workedTill && workedFrom > workedTill) {
      Alert.alert('Invalid dates', '"Worked from" cannot be after "Worked till".');
      return;
    }
    if (!projDetails.trim()) {
      Alert.alert('Required', 'Please enter the project details.');
      return;
    }
    const teamSizeNum = projTeamSize.trim() ? Number(projTeamSize.trim()) : undefined;
    if (
      projTeamSize.trim() &&
      (teamSizeNum === undefined || !Number.isInteger(teamSizeNum) || teamSizeNum < 1)
    ) {
      Alert.alert('Invalid', 'Team size must be a positive number.');
      return;
    }

    try {
      await addProject({
        projectTitle:       projTitle.trim(),
        client:             projClient.trim() || undefined,
        projectStatus:      status as 'IN_PROGRESS' | 'FINISHED',
        workedFrom,
        workTill:           workedTill || undefined,
        projectDetails:     projDetails.trim(),
        projectLocation:    projLocation.trim() || undefined,
        projectSite:        projShowMore
          ? (projSite === 'Off Site' ? 'OFF_SITE' : 'ON_SITE')
          : undefined,
        natureOfEmployment: projShowMore
          ? ({ 'Full Time': 'FULL_TIME', 'Part Time': 'PART_TIME', 'Contractual': 'CONTRACTUAL' }[projEmployment] as 'FULL_TIME' | 'PART_TIME' | 'CONTRACTUAL')
          : undefined,
        teamSize:           teamSizeNum,
        roleInProject:      projRole.trim() || undefined,
        roleDescription:    projRoleDesc.trim() || undefined,
        skillsUsed:         projSkillsUsed.trim() || undefined,
      }).unwrap();
      setProjectModalOpen(false);
    } catch (error) {
      Alert.alert('Could not save', projectSaveErrorMessage(error));
    }
  };

  const openCertModal = () => {
    setCertName('');
    setCertCompletionId('');
    setCertUrl('');
    setCertValidFrom('');
    setCertValidTill('');
    setCertNoExpiry(false);
    setCertModalOpen(true);
  };

  const handleCertSave = async () => {
    if (!certName.trim()) {
      Alert.alert('Required', 'Please enter a certification name.');
      return;
    }
    if (certValidFrom && certValidTill && certValidFrom > certValidTill) {
      Alert.alert('Invalid dates', '"Valid from" cannot be after "Valid till".');
      return;
    }
    try {
      await addCertification({
        certificationName: certName.trim(),
        certificationCompletionId: certCompletionId.trim() || undefined,
        certificationUrl: certUrl.trim() || undefined,
        validFrom: certValidFrom.trim() || undefined,
        validTill: certNoExpiry ? undefined : (certValidTill.trim() || undefined),
        certificationExpired: false,
      }).unwrap();
      setCertModalOpen(false);
    } catch {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    }
  };

  /* ── Quick-edit modal state (4 hero fields only) ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [qHeadline, setQHeadline] = useState('');
  const [qSummary, setQSummary] = useState('');
  const [qExperience, setQExperience] = useState('');
  const [qLocation, setQLocation] = useState('');

  /* ── Social media modal state ── */
  const [socialMediaModalOpen, setSocialMediaModalOpen] = useState(false);
  const [socialMediaName, setSocialMediaName] = useState('');
  const [socialMediaUrl, setSocialMediaUrl] = useState('');

  /* ── Languages modal state ── */
  const [languagesModalOpen, setLanguagesModalOpen] = useState(false);
  const [languageItems, setLanguageItems] = useState<string[]>([]);

  // Pre-fill modal when profile loads
  useEffect(() => {
    if (profile) {
      setQHeadline(profile.headline ?? '');
      setQSummary(profile.professionalSummary ?? '');
      setQExperience(profile.experience ?? '');
      setQLocation(profile.preferredLocation ?? '');
    }
  }, [profile]);

  const openQuickEdit = () => {
    // Reset to latest profile values each time
    setQHeadline(profile?.headline ?? '');
    setQSummary(profile?.professionalSummary ?? '');
    setQExperience(profile?.experience ?? '');
    setQLocation(profile?.preferredLocation ?? '');
    setModalOpen(true);
  };

  const handleQuickSave = async () => {
    try {
      await updateProfile({
        headline:            qHeadline.trim(),
        professionalSummary: qSummary.trim(),
        experience:          qExperience.trim(),
        preferredLocation:   qLocation.trim(),
        // Keep existing values for other fields
        skills:              profile?.skills ?? '',
        resumeUrl:           profile?.resumeUrl ?? '',
        education:           profile?.education ?? '',
        projects:            profile?.projects ?? '',
        socialMediaLinks:    profile?.socialMediaLinks ?? '',
        certifications:      profile?.certifications ?? '',
        languages:           profile?.languages ?? '',
        joiningDate:         profile?.joiningDate ?? '',
        currentSalary:       profile?.currentSalary ?? '',
        expectedSalary:      profile?.expectedSalary ?? '',
        preferredRole:       profile?.preferredRole ?? '',
      }).unwrap();
      setModalOpen(false);
    } catch {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    }
  };

  const openSocialMediaModal = () => {
    const socialMedia = getSocialMediaFields(profile?.socialMediaLinks);
    setSocialMediaName(socialMedia.name === 'Social media' ? '' : socialMedia.name);
    setSocialMediaUrl(socialMedia.url);
    setSocialMediaModalOpen(true);
  };

  const handleSocialMediaSave = async () => {
    const name = socialMediaName.trim();
    const typedUrl = socialMediaUrl.trim();
    const url = /^https?:\/\//i.test(typedUrl) ? typedUrl : `https://${typedUrl}`;

    if (!name) {
      Alert.alert('Required', 'Please enter the social media name.');
      return;
    }
    if (!typedUrl || !isValidSocialMediaUrl(url)) {
      Alert.alert('Invalid link', 'Enter a valid website URL.');
      return;
    }

    try {
      await updateProfile({
        headline:            profile?.headline ?? '',
        professionalSummary: profile?.professionalSummary ?? '',
        experience:          profile?.experience ?? '',
        preferredLocation:   profile?.preferredLocation ?? '',
        skills:              profile?.skills ?? '',
        resumeUrl:           profile?.resumeUrl ?? '',
        education:           profile?.education ?? '',
        projects:            profile?.projects ?? '',
        socialMediaLinks:    `${name}: ${url}`,
        certifications:      profile?.certifications ?? '',
        languages:           profile?.languages ?? '',
        joiningDate:         profile?.joiningDate ?? '',
        currentSalary:       profile?.currentSalary ?? '',
        expectedSalary:      profile?.expectedSalary ?? '',
        preferredRole:       profile?.preferredRole ?? '',
      }).unwrap();
      setSocialMediaModalOpen(false);
    } catch {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    }
  };

  const openLanguagesModal = () => {
    const savedLanguages = profile?.languages
      ?.split(/[,;\n]/)
      .map(language => language.trim())
      .filter(Boolean) ?? [];
    setLanguageItems(savedLanguages.length > 0 ? savedLanguages : ['']);
    setLanguagesModalOpen(true);
  };

  const handleLanguagesSave = async () => {
    const languages = languageItems
      .map(language => language.trim())
      .filter(Boolean);
    const uniqueLanguages = [...new Set(languages)];

    if (uniqueLanguages.length === 0) {
      Alert.alert('Required', 'Please add at least one language.');
      return;
    }

    try {
      await updateProfile({
        headline:            profile?.headline ?? '',
        professionalSummary: profile?.professionalSummary ?? '',
        experience:          profile?.experience ?? '',
        preferredLocation:   profile?.preferredLocation ?? '',
        skills:              profile?.skills ?? '',
        resumeUrl:           profile?.resumeUrl ?? '',
        education:           profile?.education ?? '',
        projects:            profile?.projects ?? '',
        socialMediaLinks:    profile?.socialMediaLinks ?? '',
        certifications:      profile?.certifications ?? '',
        languages:           uniqueLanguages.join(', '),
        joiningDate:         profile?.joiningDate ?? '',
        currentSalary:       profile?.currentSalary ?? '',
        expectedSalary:      profile?.expectedSalary ?? '',
        preferredRole:       profile?.preferredRole ?? '',
      }).unwrap();
      setLanguagesModalOpen(false);
    } catch {
      Alert.alert('Could not save', 'Please check your connection and try again.');
    }
  };

  const handleLogout = async () => {
    await clearToken();
    dispatch(logout());
  };

  const skillList = profile?.skills
    ? profile.skills.split(',').filter(s => s.trim().length > 0)
    : [];
  const socialMedia = getSocialMediaFields(profile?.socialMediaLinks);

  const goFullEdit = () => navigation.navigate('EditCandidateProfile');

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>

      {/* ════════════════════════════════════════════
          Quick-edit modal — 4 hero fields only
      ════════════════════════════════════════════ */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + vs(8) }]}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <AppText variant="h3">Edit Profile</AppText>
              <Pressable
                onPress={() => setModalOpen(false)}
                hitSlop={scale(10)}
                accessibilityLabel="Close">
                <X size={scale(20)} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}>
              <QuickField
                label="Headline"
                value={qHeadline}
                onChange={setQHeadline}
                placeholder="Java Backend Developer"
              />
              <QuickField
                label="Professional Summary"
                value={qSummary}
                onChange={setQSummary}
                placeholder="Backend developer with experience building REST APIs…"
                multiline
              />
              <QuickField
                label="Experience"
                value={qExperience}
                onChange={setQExperience}
                placeholder="2 years"
              />
              <QuickField
                label="Preferred Location"
                value={qLocation}
                onChange={setQLocation}
                placeholder="Delhi"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton
                title="Save"
                onPress={handleQuickSave}
                loading={isSaving}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════
          Social media modal
      ════════════════════════════════════════════ */}
      <Modal
        visible={socialMediaModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSocialMediaModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + vs(8) }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">Social Media</AppText>
              <Pressable
                onPress={() => setSocialMediaModalOpen(false)}
                hitSlop={scale(10)}
                accessibilityLabel="Close">
                <X size={scale(20)} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}>
              <QuickField
                label="Social media name"
                value={socialMediaName}
                onChange={setSocialMediaName}
                placeholder="LinkedIn"
              />
              <QuickField
                label="URL link"
                value={socialMediaUrl}
                onChange={setSocialMediaUrl}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton title="Save" onPress={handleSocialMediaSave} loading={isSaving} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={languagesModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguagesModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + vs(8) }]}>
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="h3">Languages</AppText>
                <AppText variant="caption" color="textSecondary">
                  Add the languages you are familiar with
                </AppText>
              </View>
              <Pressable
                onPress={() => setLanguagesModalOpen(false)}
                hitSlop={scale(10)}
                accessibilityLabel="Close">
                <X size={scale(20)} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}>
              {languageItems.map((language, index) => (
                <View key={index} style={styles.languageRow}>
                  <View style={styles.languageInputWrap}>
                    <QuickField
                      label={`Language ${index + 1}`}
                      value={language}
                      onChange={value => setLanguageItems(current =>
                        current.map((item, itemIndex) => itemIndex === index ? value : item),
                      )}
                      placeholder="e.g. English"
                    />
                  </View>
                  {languageItems.length > 1 ? (
                    <Pressable
                      onPress={() => setLanguageItems(current =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )}
                      hitSlop={scale(8)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove language ${index + 1}`}>
                      <X size={scale(18)} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable
                onPress={() => setLanguageItems(current => [...current, ''])}
                style={projStyles.addMoreBtn}
                accessibilityRole="button">
                <AppText variant="body" style={projStyles.addMoreText}>
                  Add another language +
                </AppText>
              </Pressable>
            </ScrollView>

            <View style={styles.modalFooter}>
              <AppButton title="Save" onPress={handleLanguagesSave} loading={isSaving} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={projectModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setProjectModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + vs(8) }]}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="h3">Project</AppText>
                <AppText variant="caption" color="textSecondary">
                  Stand out by adding details about projects you have done
                </AppText>
              </View>
              <Pressable onPress={() => setProjectModalOpen(false)} hitSlop={scale(10)}>
                <X size={scale(20)} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}>

              {/* Project title */}
              <View style={projStyles.fieldWrap}>
                <AppText variant="caption" style={projStyles.fieldLabel}>
                  Project title <AppText style={projStyles.required}>*</AppText>
                </AppText>
                <TextInput
                  value={projTitle}
                  onChangeText={setProjTitle}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={projStyles.input}
                />
              </View>

              {/* Client */}
              <View style={projStyles.fieldWrap}>
                <AppText variant="caption" style={projStyles.fieldLabel}>
                  Client <AppText style={projStyles.required}>*</AppText>
                </AppText>
                <TextInput
                  value={projClient}
                  onChangeText={setProjClient}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={projStyles.input}
                />
              </View>

              {/* Project status */}
              <View style={projStyles.fieldWrap}>
                <AppText variant="caption" style={projStyles.statusLabel}>
                  Project status
                </AppText>
                <View style={projStyles.toggleRow}>
                  {(['In Progress', 'Finished'] as const).map(s => (
                    <Pressable
                      key={s}
                      onPress={() => {
                        setProjStatus(s);
                        if (s === 'In Progress') setProjWorkedTill('');
                      }}
                      style={[
                        projStyles.toggleBtn,
                        projStatus === s && projStyles.toggleBtnActive,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: projStatus === s }}>
                      <AppText
                        variant="caption"
                        style={[
                          projStyles.toggleText,
                          projStatus === s && projStyles.toggleTextActive,
                        ]}>
                        {s}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Worked from / till */}
              <View style={projStyles.fieldWrap}>
                <View style={projStyles.dateRow}>
                  <View style={projStyles.dateField}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Worked from <AppText style={projStyles.required}>*</AppText>
                    </AppText>
                    <TextInput
                      value={projWorkedFrom}
                      onChangeText={setProjWorkedFrom}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      maxLength={10}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      style={projStyles.input}
                    />
                  </View>
                  <View style={projStyles.dateField}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Worked till{projStatus === 'Finished' ? <AppText style={projStyles.required}> *</AppText> : null}
                    </AppText>
                    {projStatus === 'In Progress' ? (
                      <View style={projStyles.tillNowBox}>
                        <AppText variant="body" style={projStyles.tillNowText}>Till Now</AppText>
                      </View>
                    ) : (
                      <TextInput
                        value={projWorkedTill}
                        onChangeText={setProjWorkedTill}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textMuted}
                        maxLength={10}
                        maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        style={projStyles.input}
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* Details */}
              <View style={projStyles.fieldWrap}>
                <AppText variant="caption" style={projStyles.fieldLabel}>
                  Details of project <AppText style={projStyles.required}>*</AppText>
                </AppText>
                <TextInput
                  value={projDetails}
                  onChangeText={t => projDetails.length < 1000 || t.length < projDetails.length
                    ? setProjDetails(t) : undefined}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={1000}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  textAlignVertical="top"
                  style={[projStyles.input, projStyles.inputMulti]}
                />
                <AppText variant="caption" color="textMuted" style={projStyles.counter}>
                  {projDetails.length}/1000
                </AppText>
              </View>

              {/* Role in project */}
              <View style={projStyles.fieldWrap}>
                <AppText variant="caption" style={projStyles.fieldLabel}>
                  Role in project
                </AppText>
                <TextInput
                  value={projRole}
                  onChangeText={setProjRole}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={projStyles.input}
                />
              </View>

              {/* Add more details */}
              {!projShowMore ? (
                <Pressable
                  onPress={() => setProjShowMore(true)}
                  style={projStyles.addMoreBtn}
                  accessibilityRole="button">
                  <AppText variant="body" style={projStyles.addMoreText}>
                    Add more details +
                  </AppText>
                </Pressable>
              ) : (
                <>
                  {/* Project location */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Project location
                    </AppText>
                    <TextInput
                      value={projLocation}
                      onChangeText={setProjLocation}
                      placeholder=""
                      placeholderTextColor={colors.textMuted}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      style={projStyles.input}
                    />
                  </View>

                  {/* Project site */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.statusLabel}>
                      Project site
                    </AppText>
                    <View style={projStyles.toggleRow}>
                      {(['Off Site', 'On Site'] as const).map(s => (
                        <Pressable
                          key={s}
                          onPress={() => setProjSite(s)}
                          style={[projStyles.toggleBtn, projSite === s && projStyles.toggleBtnActive]}>
                          <AppText variant="caption" style={[projStyles.toggleText, projSite === s && projStyles.toggleTextActive]}>
                            {s}
                          </AppText>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Nature of employment */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.statusLabel}>
                      Nature of employment
                    </AppText>
                    <View style={projStyles.toggleRow}>
                      {(['Full Time', 'Part Time', 'Contractual'] as const).map(s => (
                        <Pressable
                          key={s}
                          onPress={() => setProjEmployment(s)}
                          style={[projStyles.toggleBtn, projEmployment === s && projStyles.toggleBtnActive]}>
                          <AppText variant="caption" style={[projStyles.toggleText, projEmployment === s && projStyles.toggleTextActive]}>
                            {s}
                          </AppText>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Size of team */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Size of team
                    </AppText>
                    <TextInput
                      value={projTeamSize}
                      onChangeText={setProjTeamSize}
                      placeholder=""
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      style={projStyles.input}
                    />
                  </View>

                  {/* Role description */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Role description
                    </AppText>
                    <TextInput
                      value={projRoleDesc}
                      onChangeText={setProjRoleDesc}
                      placeholder=""
                      placeholderTextColor={colors.textMuted}
                      multiline
                      maxLength={250}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      textAlignVertical="top"
                      style={[projStyles.input, projStyles.inputMulti]}
                    />
                    <AppText variant="caption" color="textMuted" style={projStyles.counter}>
                      {projRoleDesc.length}/250
                    </AppText>
                  </View>

                  {/* Skills used */}
                  <View style={projStyles.fieldWrap}>
                    <AppText variant="caption" style={projStyles.fieldLabel}>
                      Skills used
                    </AppText>
                    <TextInput
                      value={projSkillsUsed}
                      onChangeText={setProjSkillsUsed}
                      placeholder=""
                      placeholderTextColor={colors.textMuted}
                      multiline
                      maxLength={500}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      textAlignVertical="top"
                      style={[projStyles.input, projStyles.inputMulti]}
                    />
                    <AppText variant="caption" color="textMuted" style={projStyles.counter}>
                      {projSkillsUsed.length}/500
                    </AppText>
                  </View>
                </>
              )}

            </ScrollView>

            {/* Footer */}
            <View style={certStyles.footer}>
              <Pressable
                onPress={() => setProjectModalOpen(false)}
                style={certStyles.cancelBtn}>
                <AppText variant="body" style={certStyles.cancelText}>Cancel</AppText>
              </Pressable>
              <Pressable
                onPress={handleProjectSave}
                disabled={isProjSaving}
                style={[certStyles.saveBtn, isProjSaving && certStyles.saveBtnDisabled]}>
                <AppText variant="body" style={certStyles.saveText}>
                  {isProjSaving ? 'Saving…' : 'Save'}
                </AppText>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════
          Certification modal
      ════════════════════════════════════════════ */}
      <Modal
        visible={certModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCertModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + vs(8) }]}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <AppText variant="h3">Certification</AppText>
                <AppText variant="caption" color="textSecondary">
                  Add details of certifications you have completed
                </AppText>
              </View>
              <Pressable onPress={() => setCertModalOpen(false)} hitSlop={scale(10)}>
                <X size={scale(20)} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScroll}>

              {/* Certification Name */}
              <View style={certStyles.fieldWrap}>
                <AppText variant="caption" style={certStyles.fieldLabel}>
                  Certification name <AppText style={certStyles.required}>*</AppText>
                </AppText>
                <TextInput
                  value={certName}
                  onChangeText={setCertName}
                  placeholder="Please enter your certification name"
                  placeholderTextColor={colors.textMuted}
                  maxLength={255}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={certStyles.input}
                />
                <AppText variant="caption" color="textMuted" style={certStyles.counter}>
                  {certName.length}/255
                </AppText>
              </View>

              {/* Completion ID */}
              <View style={certStyles.fieldWrap}>
                <AppText variant="caption" style={certStyles.fieldLabel}>
                  Certification completion ID
                </AppText>
                <TextInput
                  value={certCompletionId}
                  onChangeText={setCertCompletionId}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  maxLength={50}
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={certStyles.input}
                />
                <AppText variant="caption" color="textMuted" style={certStyles.counter}>
                  {certCompletionId.length}/50
                </AppText>
              </View>

              {/* URL */}
              <View style={certStyles.fieldWrap}>
                <AppText variant="caption" style={certStyles.fieldLabel}>
                  Certification URL{' '}
                  <AppText variant="caption" color="textMuted">(recommended)</AppText>
                </AppText>
                <TextInput
                  value={certUrl}
                  onChangeText={setCertUrl}
                  placeholder=""
                  placeholderTextColor={colors.textMuted}
                  maxLength={255}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                  selectionColor={colors.primary}
                  cursorColor={colors.primary}
                  style={certStyles.input}
                />
                <AppText variant="caption" color="textMuted" style={certStyles.counter}>
                  {certUrl.length}/255
                </AppText>
              </View>

              {/* Validity */}
              <View style={certStyles.fieldWrap}>
                <AppText variant="caption" style={certStyles.validityLabel}>
                  Certification validity{' '}
                  <AppText variant="caption" color="textMuted">(recommended)</AppText>
                </AppText>
                <View style={certStyles.dateRow}>
                  <View style={certStyles.dateField}>
                    <AppText variant="caption" color="textMuted" style={certStyles.dateLabel}>
                      Valid from
                    </AppText>
                    <TextInput
                      value={certValidFrom}
                      onChangeText={setCertValidFrom}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      maxLength={10}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      style={certStyles.dateInput}
                    />
                  </View>
                  <View style={certStyles.dateField}>
                    <AppText variant="caption" color="textMuted" style={certStyles.dateLabel}>
                      Valid till
                    </AppText>
                    <TextInput
                      value={certValidTill}
                      onChangeText={setCertValidTill}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textMuted}
                      maxLength={10}
                      editable={!certNoExpiry}
                      maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
                      selectionColor={colors.primary}
                      cursorColor={colors.primary}
                      style={[certStyles.dateInput, certNoExpiry && certStyles.dateInputDisabled]}
                    />
                  </View>
                </View>
              </View>

              {/* No expiry checkbox */}
              <Pressable
                onPress={() => {
                  setCertNoExpiry(v => !v);
                  if (!certNoExpiry) setCertValidTill('');
                }}
                style={certStyles.checkRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: certNoExpiry }}>
                <View style={[certStyles.checkbox, certNoExpiry && certStyles.checkboxActive]}>
                  {certNoExpiry ? (
                    <AppText style={certStyles.checkmark}>✓</AppText>
                  ) : null}
                </View>
                <AppText variant="body" color="textSecondary">
                  This certification does not expire
                </AppText>
              </Pressable>

            </ScrollView>

            {/* Footer — Cancel + Save */}
            <View style={certStyles.footer}>
              <Pressable
                onPress={() => setCertModalOpen(false)}
                style={certStyles.cancelBtn}
                accessibilityLabel="Cancel">
                <AppText variant="body" style={certStyles.cancelText}>Cancel</AppText>
              </Pressable>
              <Pressable
                onPress={handleCertSave}
                disabled={isCertSaving}
                style={[certStyles.saveBtn, isCertSaving && certStyles.saveBtnDisabled]}
                accessibilityLabel="Save certification">
                <AppText variant="body" style={certStyles.saveText}>
                  {isCertSaving ? 'Saving…' : 'Save'}
                </AppText>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════
          Main scroll content
      ════════════════════════════════════════════ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Header ── */}
        <View style={[styles.hero, { paddingTop: insets.top + vs(24) }]}>
          <View style={styles.avatarRing}>
            <UserAvatar name={user?.name} uri={user?.avatarUrl} size={scale(96)} />
          </View>

          <View style={styles.nameRow}>
            <AppText variant="h2" style={styles.heroName} numberOfLines={1}>
              {user?.name ?? 'Your Name'}
            </AppText>
            {/* Pencil opens quick-edit modal (4 fields only) */}
            <Pressable
              onPress={openQuickEdit}
              hitSlop={scale(10)}
              style={styles.editBtn}
              accessibilityLabel="Edit headline, summary, experience, location">
              <Pencil size={scale(16)} color={colors.primary} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: vs(8) }} />
          ) : (
            <>
              <AppText
                variant="body"
                color="textSecondary"
                style={styles.heroHeadline}
                numberOfLines={2}>
                {profile?.headline ?? 'Add a headline — tap the pencil to edit'}
              </AppText>

              {profile?.skills ? (
                <AppText
                  variant="caption"
                  color="textMuted"
                  style={styles.heroSkills}
                  numberOfLines={3}>
                  {profile.skills.split(',').map(s => s.trim()).join('  |  ')}
                </AppText>
              ) : null}

              {(profile?.preferredLocation || profile?.experience) ? (
                <View style={styles.heroPills}>
                  {profile?.preferredLocation ? (
                    <View style={styles.heroPill}>
                      <MapPin size={scale(11)} color={colors.primary} />
                      <AppText variant="caption" color="textSecondary" style={styles.heroPillText}>
                        {profile.preferredLocation}
                      </AppText>
                    </View>
                  ) : null}
                  {profile?.experience ? (
                    <View style={styles.heroPill}>
                      <BriefcaseBusiness size={scale(11)} color={colors.primary} />
                      <AppText variant="caption" color="textSecondary" style={styles.heroPillText}>
                        {profile.experience}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          )}

          {isError && !isLoading ? (
            <View style={styles.errorRow}>
              <TriangleAlert size={scale(13)} color={colors.danger} />
              <AppText variant="caption" color="danger">Could not load profile</AppText>
            </View>
          ) : null}
        </View>

        {/* ── About ── */}
        <View style={styles.section}>
          <SectionTitle label="About" onEdit={openQuickEdit} />
          <View style={styles.card}>
            {profile?.professionalSummary ? (
              <View style={styles.aboutRow}>
                <Sparkles size={sizes.iconSm} color={colors.primary} />
                <AppText variant="body" color="textSecondary" style={styles.aboutText}>
                  {profile.professionalSummary}
                </AppText>
              </View>
            ) : (
              <Pressable onPress={openQuickEdit} style={styles.emptyRow}>
                <Sparkles size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  No summary added yet. Tap to add one.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Details ── */}
        <View style={styles.section}>
          <SectionTitle label="Details" onEdit={goFullEdit} />
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <BriefcaseBusiness size={sizes.iconSm} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <AppText variant="caption" color="textMuted" style={styles.infoLabel}>Experience</AppText>
                <AppText variant="body" style={profile?.experience ? styles.infoValue : styles.infoEmpty}>
                  {profile?.experience ?? 'Not set'}
                </AppText>
              </View>
            </View>
            <View style={styles.infoRowDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MapPin size={sizes.iconSm} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <AppText variant="caption" color="textMuted" style={styles.infoLabel}>Preferred Location</AppText>
                <AppText variant="body" style={profile?.preferredLocation ? styles.infoValue : styles.infoEmpty}>
                  {profile?.preferredLocation ?? 'Not set'}
                </AppText>
              </View>
            </View>
            <View style={styles.infoRowDivider} />
            {profile?.resumeUrl ? (
              <Pressable
                onPress={() => navigation.navigate('Resume')}
                style={({ pressed }) => [styles.resumeRow, pressed && styles.resumeRowPressed]}>
                <View style={styles.infoIcon}>
                  <FileText size={sizes.iconSm} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <AppText variant="caption" color="textMuted" style={styles.infoLabel}>Resume</AppText>
                  <AppText variant="body" style={styles.resumeLink} numberOfLines={1}>
                    View / Download
                  </AppText>
                </View>
                <Globe size={scale(15)} color={colors.primary} />
              </Pressable>
            ) : (
              <Pressable onPress={goFullEdit} style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={sizes.iconSm} color={colors.textMuted} />
                </View>
                <View style={styles.infoText}>
                  <AppText variant="caption" color="textMuted" style={styles.infoLabel}>Resume</AppText>
                  <AppText variant="body" style={styles.infoEmpty}>Tap to upload resume</AppText>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Skills ── */}
        <View style={styles.section}>
          <SectionTitle label="Skills" onEdit={goFullEdit} />
          <View style={styles.card}>
            {skillList.length > 0 ? (
              <View style={styles.skillsRow}>
                <Wrench size={sizes.iconSm} color={colors.primary} style={{ marginTop: vs(2) }} />
                <View style={styles.chipWrap}>
                  {skillList.map((s, i) => <SkillChip key={i} label={s} />)}
                </View>
              </View>
            ) : (
              <Pressable onPress={goFullEdit} style={styles.emptyRow}>
                <Wrench size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  No skills added yet. Tap to add.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Education & Career ── */}
        <View style={styles.section}>
          <SectionTitle label="Education & Career" onEdit={goFullEdit} />
          <View style={styles.card}>
            <InfoRow
              icon={<GraduationCap size={sizes.iconSm} color={colors.primary} />}
              label="Education"
              value={profile?.education}
            />
            {profile?.education && profile?.preferredRole ? <View style={styles.infoRowDivider} /> : null}
            <InfoRow
              icon={<UserRound size={sizes.iconSm} color={colors.primary} />}
              label="Preferred Role"
              value={profile?.preferredRole}
            />
            {profile?.preferredRole && profile?.joiningDate ? <View style={styles.infoRowDivider} /> : null}
            <InfoRow
              icon={<CalendarCheck size={sizes.iconSm} color={colors.primary} />}
              label="Available to Join"
              value={profile?.joiningDate}
            />
            {!profile?.education && !profile?.preferredRole && !profile?.joiningDate ? (
              <Pressable onPress={goFullEdit} style={styles.emptyRow}>
                <GraduationCap size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  Tap to add education details.
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* ── Certifications ── */}
        <View style={styles.section}>
          <SectionTitle label="Certifications" onEdit={openCertModal} />
          <View style={styles.card}>
            {certifications.length > 0 ? (
              certifications.map((cert, i) => (
                <React.Fragment key={cert.id}>
                  {i > 0 ? <View style={styles.infoRowDivider} /> : null}
                  <Pressable
                    onPress={() => cert.certificationUrl
                      ? Linking.openURL(cert.certificationUrl).catch(() => {})
                      : undefined}
                    disabled={!cert.certificationUrl}
                    style={styles.certRow}>
                    {/* Icon */}
                    <View style={[styles.infoIcon, cert.certificationExpired && styles.infoIconMuted]}>
                      <Award size={sizes.iconSm} color={cert.certificationExpired ? colors.textMuted : colors.primary} />
                    </View>
                    {/* Details */}
                    <View style={styles.certBody}>
                      <View style={styles.certNameRow}>
                        <AppText variant="bodyBold" numberOfLines={1} style={styles.certName}>
                          {cert.certificationName}
                        </AppText>
                        {cert.certificationExpired ? (
                          <View style={styles.expiredBadge}>
                            <AppText variant="caption" style={styles.expiredBadgeText}>Expired</AppText>
                          </View>
                        ) : (
                          <View style={styles.activeBadge}>
                            <AppText variant="caption" style={styles.activeBadgeText}>Active</AppText>
                          </View>
                        )}
                      </View>
                      {cert.certificationCompletionId ? (
                        <AppText variant="caption" color="textMuted">
                          ID: {cert.certificationCompletionId}
                        </AppText>
                      ) : null}
                      {(cert.validFrom || cert.validTill) ? (
                        <AppText variant="caption" color="textMuted">
                          {cert.validFrom ?? '—'}{cert.validTill ? ` → ${cert.validTill}` : ''}
                        </AppText>
                      ) : null}
                      {cert.certificationUrl ? (
                        <AppText variant="caption" color="primary" style={styles.certLink}>
                          View Certificate →
                        </AppText>
                      ) : null}
                    </View>
                  </Pressable>
                </React.Fragment>
              ))
            ) : (
              <Pressable onPress={openCertModal} style={styles.emptyRow}>
                <Award size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  No certifications added yet. Tap + to add.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Projects ── */}
        <View style={styles.section}>
          <SectionTitle label="Projects" onEdit={openProjectModal} />
          <View style={styles.card}>
            {projects.length > 0 ? (
              projects.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 ? <View style={styles.infoRowDivider} /> : null}
                  <View style={styles.projCard}>
                    {/* Title + status badge */}
                    <View style={styles.projTitleRow}>
                      <View style={styles.infoIcon}>
                        <FolderOpen size={sizes.iconSm} color={colors.primary} />
                      </View>
                      <View style={styles.projTitleBody}>
                        <View style={styles.projNameRow}>
                          <AppText variant="bodyBold" numberOfLines={1} style={styles.projTitle}>
                            {p.projectTitle}
                          </AppText>
                          <View style={[
                            styles.projStatusBadge,
                            p.projectStatus === 'IN_PROGRESS' ? styles.projStatusActive : styles.projStatusDone,
                          ]}>
                            <AppText variant="caption" style={[
                              styles.projStatusText,
                              p.projectStatus === 'IN_PROGRESS' ? styles.projStatusTextActive : styles.projStatusTextDone,
                            ]}>
                              {p.projectStatus === 'IN_PROGRESS' ? 'In Progress' : 'Finished'}
                            </AppText>
                          </View>
                        </View>
                        {p.client ? (
                          <AppText variant="caption" color="textSecondary">
                            Client: {p.client}
                          </AppText>
                        ) : null}
                        <AppText variant="caption" color="textMuted">
                          {p.workedFrom}{p.workTill ? ` → ${p.workTill}` : ' → Present'}
                        </AppText>
                      </View>
                    </View>

                    {/* Project details */}
                    {p.projectDetails ? (
                      <AppText variant="body" color="textSecondary" style={styles.projDetails}>
                        {p.projectDetails}
                      </AppText>
                    ) : null}

                    {/* Extra chips */}
                    <View style={styles.projChips}>
                      {p.projectLocation ? (
                        <View style={styles.projChip}>
                          <AppText variant="caption" color="textMuted">{p.projectLocation}</AppText>
                        </View>
                      ) : null}
                      {p.projectSite ? (
                        <View style={styles.projChip}>
                          <AppText variant="caption" color="textMuted">
                            {p.projectSite === 'OFF_SITE' ? 'Off Site' : 'On Site'}
                          </AppText>
                        </View>
                      ) : null}
                      {p.natureOfEmployment ? (
                        <View style={styles.projChip}>
                          <AppText variant="caption" color="textMuted">
                            {{ FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACTUAL: 'Contractual' }[p.natureOfEmployment]}
                          </AppText>
                        </View>
                      ) : null}
                      {p.teamSize ? (
                        <View style={styles.projChip}>
                          <AppText variant="caption" color="textMuted">Team: {p.teamSize}</AppText>
                        </View>
                      ) : null}
                    </View>

                    {/* Role */}
                    {p.roleInProject ? (
                      <AppText variant="caption" color="textSecondary" style={styles.projRole}>
                        Role: {p.roleInProject}
                        {p.roleDescription ? ` — ${p.roleDescription}` : ''}
                      </AppText>
                    ) : null}

                    {/* Skills used */}
                    {p.skillsUsed ? (
                      <AppText variant="caption" color="textMuted" style={styles.projSkills}>
                        Skills: {p.skillsUsed}
                      </AppText>
                    ) : null}
                  </View>
                </React.Fragment>
              ))
            ) : (
              <Pressable onPress={openProjectModal} style={styles.emptyRow}>
                <FolderOpen size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  Tap + to add your projects.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Social Media ── */}
        <View style={styles.section}>
          <SectionTitle label="Social Media" onEdit={openSocialMediaModal} />
          <View style={styles.card}>
            {socialMedia.url ? (
              <View style={styles.aboutRow}>
                <Link2 size={sizes.iconSm} color={colors.primary} />
                <View style={styles.infoText}>
                  <AppText variant="bodyBold" numberOfLines={1}>
                    {socialMedia.name}
                  </AppText>
                  <Pressable
                    onPress={() => Linking.openURL(socialMedia.url).catch(() => {
                      Alert.alert('Could not open link', 'Please check the URL and try again.');
                    })}
                    accessibilityRole="link">
                    <AppText variant="body" style={styles.resumeLink} numberOfLines={2}>
                      {socialMedia.url}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={openSocialMediaModal} style={styles.emptyRow}>
                <Link2 size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  Tap to add a social media name and link.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Languages ── (at the end) */}
        <View style={styles.section}>
          <SectionTitle label="Languages" onEdit={openLanguagesModal} />
          <View style={styles.card}>
            {profile?.languages ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Languages size={sizes.iconSm} color={colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <AppText variant="caption" color="textMuted" style={styles.infoLabel}>
                    Languages Known
                  </AppText>
                  <AppText variant="body" style={styles.infoValue}>
                    {profile.languages}
                  </AppText>
                </View>
              </View>
            ) : (
              <Pressable onPress={openLanguagesModal} style={styles.emptyRow}>
                <Languages size={sizes.iconSm} color={colors.textMuted} />
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  Tap to add languages.
                </AppText>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Account Actions ── */}
        <View style={styles.section}>
          <SectionTitle label="Account" />
          <View style={styles.card}>
            <ActionRow
              icon={<Settings size={sizes.iconSm} color={colors.primary} />}
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
            />
            <Divider />
            <ActionRow
              icon={<TriangleAlert size={sizes.iconSm} color={colors.primary} />}
              label="Raise a Complaint"
              onPress={() => navigation.navigate('RaiseComplaint')}
            />
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.card}>
            <ActionRow
              icon={<LogOut size={sizes.iconSm} color={colors.danger} />}
              label="Logout"
              onPress={handleLogout}
              destructive
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Project modal styles ───────────────────────────────────────────────── */
const projStyles = StyleSheet.create({
  fieldWrap: {
    marginBottom: vs(20),
  },
  fieldLabel: {
    color: colors.textSecondary,
    marginBottom: vs(6),
    fontWeight: '500',
  },
  required: {
    color: colors.danger,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: vs(8),
    fontSize: font(15),
    color: colors.text,
  },
  inputMulti: {
    minHeight: vs(80),
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: vs(10),
  },
  counter: {
    textAlign: 'right',
    marginTop: vs(4),
  },
  statusLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: vs(10),
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(7),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dateField: {
    flex: 1,
  },
  addMoreBtn: {
    alignSelf: 'flex-start',
    marginBottom: vs(20),
  },
  addMoreText: {
    color: colors.primary,
    fontWeight: '700',
  },
  tillNowBox: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
    paddingVertical: vs(8),
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
  },
  tillNowText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

/* ─── Certification modal styles ─────────────────────────────────────────── */
const certStyles = StyleSheet.create({
  fieldWrap: {
    marginBottom: vs(20),
  },
  fieldLabel: {
    color: colors.textSecondary,
    marginBottom: vs(6),
    fontWeight: '500',
  },
  required: {
    color: colors.danger,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: vs(8),
    fontSize: font(15),
    color: colors.text,
  },
  counter: {
    textAlign: 'right',
    marginTop: vs(4),
  },
  validityLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: vs(10),
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: vs(4),
  },
  dateInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: vs(8),
    fontSize: font(15),
    color: colors.text,
  },
  dateInputDisabled: {
    color: colors.textMuted,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: vs(4),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: scale(3),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontSize: font(12),
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(14),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(10),
  },
  cancelText: {
    color: colors.primary,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: vs(10),
    minWidth: scale(80),
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
  },
});

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: vs(32) },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageInputWrap: { flex: 1 },

  /* Hero */
  hero: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: vs(24),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: vs(20),
  },
  avatarRing: {
    borderRadius: scale(52),
    borderWidth: 3,
    borderColor: colors.primarySoft,
    marginBottom: vs(14),
    overflow: 'hidden',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: vs(4),
  },
  editBtn: { padding: spacing.xs },
  heroName: { color: colors.text, textAlign: 'center' },
  heroHeadline: { textAlign: 'center', marginBottom: vs(8), lineHeight: vs(20) },
  heroSkills: { textAlign: 'center', lineHeight: vs(18), marginBottom: vs(10), paddingHorizontal: spacing.sm },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: vs(4),
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
  },
  heroPillText: { color: colors.textSecondary },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginTop: vs(8) },

  /* Sections */
  section: { marginHorizontal: spacing.lg, marginBottom: vs(16) },
  lastSection: { marginBottom: vs(8) },
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
  sectionTitleText: { fontWeight: '700', letterSpacing: 0.8, flex: 1 },
  sectionEditBtn: {
    padding: spacing.xs,
    marginLeft: 'auto',
  },

  /* Cards */
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  /* About */
  aboutRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'flex-start' },
  aboutText: { flex: 1, lineHeight: vs(20) },
  emptyRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'center' },
  emptyText: { flex: 1, fontStyle: 'italic' },

  /* Info rows */
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  infoIcon: {
    width: scale(32), height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1 },
  infoLabel: { fontWeight: '600', letterSpacing: 0.4, marginBottom: vs(2) },
  infoValue: { color: colors.text },
  infoEmpty: { color: colors.textMuted, fontStyle: 'italic' },
  infoRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(32) + spacing.md,
  },

  /* Resume */
  resumeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  resumeRowPressed: { backgroundColor: colors.surface },
  resumeLink: { color: colors.primary, textDecorationLine: 'underline' },

  /* Skills */
  skillsRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'flex-start' },
  chipWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  chipText: { color: colors.primary, fontWeight: '600' },

  /* Project card */
  projCard: {
    padding: spacing.lg,
  },
  projTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: vs(8),
  },
  projTitleBody: { flex: 1, gap: vs(2) },
  projNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  projTitle: { flex: 1 },
  projStatusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(2),
  },
  projStatusActive: { backgroundColor: '#DBEAFE' },
  projStatusDone:   { backgroundColor: '#DCFCE7' },
  projStatusText:   { fontWeight: '700', fontSize: 10 },
  projStatusTextActive: { color: '#1D4ED8' },
  projStatusTextDone:   { color: colors.success },
  projDetails: { lineHeight: vs(20), marginBottom: vs(8) },
  projChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: vs(6),
  },
  projChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(2),
  },
  projRole:   { marginBottom: vs(4) },
  projSkills: { fontStyle: 'italic' },

  /* Certification card */
  certRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  infoIconMuted: {
    backgroundColor: colors.surface,
  },
  certBody: {
    flex: 1,
    gap: vs(3),
  },
  certNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  certName: {
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(2),
  },
  activeBadgeText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 10,
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(2),
  },
  expiredBadgeText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 10,
  },
  certLink: {
    marginTop: vs(2),
    fontWeight: '600',
  },

  /* Action rows */
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: vs(14), paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  actionRowPressed: { backgroundColor: colors.surface },
  actionIcon: {
    width: scale(32), height: scale(32),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  actionIconDestructive: { backgroundColor: '#FEE2E2' },
  actionLabel: { flex: 1 },
  actionLabelDestructive: { color: colors.danger },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + scale(32) + spacing.md,
  },

  /* Quick-edit modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
    paddingBottom: vs(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(16),
    paddingBottom: vs(8),
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
