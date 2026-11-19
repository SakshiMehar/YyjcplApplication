import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  Camera,
  ChevronLeft,
  FileText,
  Globe,
  MapPin,
  Tag,
} from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import type { DocumentPickerResponse } from '@react-native-documents/picker';
import { AppButton, AppText } from '../../../components/common';
import { RecruiterScreenProps } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, MAX_FONT_MULTIPLIER, radius, scale, spacing, vs } from '../../../theme';
import {
  useGetRecruiterProfileQuery,
  useUpsertRecruiterProfileMutation,
  useUploadRecruiterProfilePictureMutation,
} from '../api/recruiterApi';
import {
  getProfilePictureHeaders,
  resolveProfilePictureUrl,
} from '../../candidate/utils/resume';
import { normalizeRecruiterProfile } from '../api/recruiterApi';

/* ─── Field component ────────────────────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
  multiline = false,
  required = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: 'default' | 'url';
  autoCapitalize?: 'sentences' | 'words' | 'none';
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary" style={styles.fieldLabel}>
        {label}{required ? <AppText style={styles.required}> *</AppText> : null}
      </AppText>
      <View style={[styles.fieldBox, multiline && styles.fieldBoxMulti]}>
        <View style={styles.fieldIconWrap}>{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          textAlignVertical={multiline ? 'top' : 'center'}
          maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        />
      </View>
    </View>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getImageMimeType(file: DocumentPickerResponse): string | undefined {
  if (file.type?.startsWith('image/')) return file.type;
  const extension = file.name?.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return extension ? mimeTypes[extension] : undefined;
}

/* ─── Section label ──────────────────────────────────────────────────────── */
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

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function EditCompanyScreen({ navigation }: RecruiterScreenProps<'EditCompany'>) {
  const insets = useSafeAreaInsets();
  const token = useAppSelector(state => state.auth.token);
  const { data: existing, refetch: refetchProfile } = useGetRecruiterProfileQuery();
  const [upsert, { isLoading }] = useUpsertRecruiterProfileMutation();
  const [uploadProfilePicture, { isLoading: isUploadingPicture }] =
    useUploadRecruiterProfilePictureMutation();

  const [companyName,        setCompanyName]        = useState('');
  const [companyWebsite,     setCompanyWebsite]     = useState('');
  const [companyIndustry,    setCompanyIndustry]    = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLocation,    setCompanyLocation]    = useState('');
  const [profilePictureUrl,  setProfilePictureUrl]  = useState('');

  // Pending picked image — uploaded on "Save Profile"
  const [selectedPicture, setSelectedPicture] = useState<DocumentPickerResponse | null>(null);

  // Pre-fill once data loads
  useEffect(() => {
    if (existing) {
      setCompanyName(existing.companyName       ?? '');
      setCompanyWebsite(existing.companyWebsite     ?? '');
      setCompanyIndustry(existing.companyIndustry    ?? '');
      setCompanyDescription(existing.companyDescription ?? '');
      setCompanyLocation(existing.companyLocation    ?? '');
      setProfilePictureUrl(existing.profilePictureUrl  ?? '');
    }
  }, [existing]);

  // ── Pick an image from the device gallery ──
  const handlePickPicture = async () => {
    try {
      const [file] = await pick({ type: [types.images] });
      if (!file.hasRequestedType || !getImageMimeType(file)) {
        Alert.alert('Invalid image', 'Please select a valid image file (JPG, PNG, WebP).');
        return;
      }
      setSelectedPicture(file);
      // Show a local preview immediately
      setProfilePictureUrl(file.uri);
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Could not select image', 'Please try again.');
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      Alert.alert('Required', 'Please enter your company name.');
      return;
    }

    try {
      let savedPictureUrl = profilePictureUrl.trim() || undefined;

      // If a new image was picked, upload it first
      if (selectedPicture) {
        const mimeType = getImageMimeType(selectedPicture);
        if (!mimeType) {
          Alert.alert('Invalid image', 'The selected file is not a supported image.');
          return;
        }

        const formData = new FormData();
        formData.append('file', {
          uri: selectedPicture.uri,
          name: selectedPicture.name ?? 'profile-picture',
          type: mimeType,
        } as unknown as Blob);

        const uploadResult = await uploadProfilePicture(formData).unwrap();

        // Extract the returned URL — backend may return it in different shapes
        const normalized = normalizeRecruiterProfile(
          typeof uploadResult === 'object' && uploadResult !== null
            ? uploadResult
            : { profilePictureUrl: savedPictureUrl },
        );
        savedPictureUrl =
          normalized.profilePictureUrl ??
          (await refetchProfile().unwrap()).profilePictureUrl ??
          savedPictureUrl;

        setSelectedPicture(null);
      }

      await upsert({
        companyName:        companyName.trim(),
        companyWebsite:     companyWebsite.trim()     || undefined,
        companyIndustry:    companyIndustry.trim()    || undefined,
        companyDescription: companyDescription.trim() || undefined,
        companyLocation:    companyLocation.trim()    || undefined,
        profilePictureUrl:  savedPictureUrl,
      }).unwrap();

      Alert.alert('Saved', 'Company profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const response = error as {
        status?: number | string;
        data?: { message?: string; error?: string };
      };
      Alert.alert(
        'Could not save',
        response.data?.message ??
          response.data?.error ??
          (response.status === 'FETCH_ERROR' || response.status === 'TIMEOUT_ERROR'
            ? "Can't reach the server. Check your connection and try again."
            : 'Please check your profile details and try again.'),
      );
    }
  };

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
        <View style={styles.headerText}>
          <AppText variant="h3">Edit Profile</AppText>
          <AppText variant="caption" color="textSecondary">
            Update your company information
          </AppText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}>

        {/* ── Profile picture section ── */}
        <View style={styles.picSection}>
          <Pressable
            onPress={handlePickPicture}
            accessibilityLabel="Change profile picture"
            accessibilityRole="button">
            <View style={styles.picWrap}>
              {profilePictureUrl ? (
                <Image
                  source={
                    // Local uri from picker doesn't need auth headers
                    selectedPicture
                      ? { uri: profilePictureUrl }
                      : {
                          uri: resolveProfilePictureUrl(profilePictureUrl),
                          headers: getProfilePictureHeaders(profilePictureUrl, token),
                        }
                  }
                  style={styles.picImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.picPlaceholder}>
                  <Building2 size={scale(36)} color={colors.primary} />
                </View>
              )}
              {/* Edit overlay */}
              <View style={styles.picEditBadge}>
                <Camera size={scale(14)} color={colors.textOnPrimary} />
              </View>
            </View>
          </Pressable>
          <AppText variant="caption" color="textSecondary" style={styles.picHint}>
            {selectedPicture ? selectedPicture.name ?? 'Image selected' : 'Tap to change photo'}
          </AppText>
        </View>

        {/* ── Company info ── */}
        <SectionLabel label="Company Information" />

        <Field
          label="Company Name"
          value={companyName}
          onChange={setCompanyName}
          placeholder="Acme Ltd"
          icon={<Building2 size={scale(16)} color={companyName ? colors.primary : colors.textMuted} />}
          autoCapitalize="words"
          required
        />

        <Field
          label="Industry"
          value={companyIndustry}
          onChange={setCompanyIndustry}
          placeholder="IT Services"
          icon={<Tag size={scale(16)} color={companyIndustry ? colors.primary : colors.textMuted} />}
          autoCapitalize="words"
        />

        <Field
          label="Location"
          value={companyLocation}
          onChange={setCompanyLocation}
          placeholder="Bengaluru"
          icon={<MapPin size={scale(16)} color={companyLocation ? colors.primary : colors.textMuted} />}
          autoCapitalize="words"
        />

        <Field
          label="Website"
          value={companyWebsite}
          onChange={setCompanyWebsite}
          placeholder="https://acme.example"
          icon={<Globe size={scale(16)} color={companyWebsite ? colors.primary : colors.textMuted} />}
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* ── About ── */}
        <SectionLabel label="About" />

        <Field
          label="Company Description"
          value={companyDescription}
          onChange={setCompanyDescription}
          placeholder="Tell candidates what your company does…"
          icon={<FileText size={scale(16)} color={companyDescription ? colors.primary : colors.textMuted} />}
          multiline
        />

        <View style={{ height: vs(16) }} />
      </ScrollView>

      {/* ── Sticky save button ── */}
      <View style={styles.footer}>
        <AppButton
          title="Save Profile"
          onPress={handleSave}
          loading={isLoading || isUploadingPicture}
        />
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

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
    width: scale(34), height: scale(34), borderRadius: scale(17),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerText: { flex: 1, gap: vs(2) },

  scroll: { paddingHorizontal: spacing.lg, paddingTop: vs(20) },

  /* Profile picture */
  picSection: { alignItems: 'center', marginBottom: vs(24) },
  picWrap: {
    position: 'relative',
    width: scale(100), height: scale(100),
    marginBottom: vs(8),
  },
  picImage: {
    width: scale(100), height: scale(100),
    borderRadius: scale(50),
    borderWidth: 3, borderColor: colors.primarySoft,
  },
  picPlaceholder: {
    width: scale(100), height: scale(100),
    borderRadius: scale(50),
    backgroundColor: colors.primaryLight,
    borderWidth: 3, borderColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  picEditBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: scale(28), height: scale(28), borderRadius: scale(14),
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  picHint: { textAlign: 'center' },

  /* Section labels */
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: vs(12),
    marginTop: vs(4),
  },
  sectionAccent: {
    width: scale(3), height: scale(14),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sectionLabelText: { fontWeight: '700', letterSpacing: 0.8 },

  /* Field */
  field: { marginBottom: vs(14) },
  fieldLabel: { marginBottom: vs(6), fontWeight: '600' },
  required: { color: colors.danger },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    height: vs(48),
  },
  fieldBoxMulti: {
    height: undefined,
    minHeight: vs(100),
    alignItems: 'flex-start',
    paddingTop: vs(12),
    paddingBottom: vs(12),
  },
  fieldIconWrap: { marginRight: spacing.sm, flexShrink: 0 },
  fieldInput: {
    flex: 1,
    fontSize: font(14),
    color: colors.text,
    padding: 0,
  },
  fieldInputMulti: {
    textAlignVertical: 'top',
    minHeight: vs(76),
  },

  /* Footer */
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },
});
