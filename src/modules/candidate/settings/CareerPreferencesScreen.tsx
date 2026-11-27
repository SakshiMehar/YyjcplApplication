import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, scale, spacing, vs } from '../../../theme';
import {
  useGetCareerPreferencesQuery,
  useUpdateCareerPreferencesMutation,
} from '../api/candidateApi';

const MAX_ROLES = 3;
const MAX_LOCATIONS = 10;

function formatIndianAmount(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('en-IN') : '';
}

function PreferenceChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.chip}>
      <AppText style={styles.chipText}>{label}</AppText>
      <Pressable
        onPress={onRemove}
        hitSlop={scale(8)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label}`}>
        <X size={scale(17)} color="#7785A0" />
      </Pressable>
    </View>
  );
}

export default function CareerPreferencesScreen({
  navigation,
}: CandidateScreenProps<'CareerPreferences'>) {
  const userRole = useAppSelector(state => state.auth.user?.role);
  const { data: preferences, isLoading, isError, refetch } = useGetCareerPreferencesQuery();
  const [updateCareerPreferences, { isLoading: isSaving }] = useUpdateCareerPreferencesMutation();
  const [lookingFor, setLookingFor] = useState<'JOB' | 'INTERNSHIP'>('JOB');
  const [roles, setRoles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [salary, setSalary] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);

  useEffect(() => {
    if (!preferences) return;
    setLookingFor(preferences.lookingFor);
    setRoles(preferences.preferredJobRoles);
    setLocations(preferences.preferredLocations);
    setSalary(preferences.expectedSalaryPerYear ? String(preferences.expectedSalaryPerYear) : '');
  }, [preferences]);

  const addPreference = (
    value: string,
    current: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    limit: number,
  ) => {
    const preference = value.trim();
    if (!preference) return;
    if (current.length >= limit) {
      Alert.alert('Limit reached', `You can add up to ${limit} preferences.`);
      return;
    }
    if (current.some(item => item.toLowerCase() === preference.toLowerCase())) {
      setInput('');
      return;
    }
    setValues([...current, preference]);
    setInput('');
  };

  const onSave = async () => {
    const expectedSalaryPerYear = Number(salary);
    if (!Number.isFinite(expectedSalaryPerYear) || expectedSalaryPerYear < 0) {
      Alert.alert('Invalid salary', 'Enter a valid annual salary amount in rupees.');
      return;
    }

    try {
      Keyboard.dismiss();
      await updateCareerPreferences({
        lookingFor,
        preferredJobRoles: roles,
        expectedSalaryPerYear,
        preferredLocations: locations,
      }).unwrap();
      Alert.alert('Preferences saved', 'Your career preferences have been updated.', [
        { text: 'OK', onPress: navigation.goBack },
      ]);
    } catch (error) {
      const response = error as { data?: { message?: string; error?: string } };
      Alert.alert(
        'Could not save preferences',
        response.data?.message ?? response.data?.error ?? 'Please try again.',
      );
    }
  };

  if (userRole !== 'CANDIDATE') {
    return (
      <ScreenLayout showHeader={false} padded={false} mainBackground={colors.background}>
        <View style={styles.restricted}>
          <AppText variant="body">Career preferences are only available for job seekers.</AppText>
          <Pressable onPress={navigation.goBack} accessibilityRole="button">
            <AppText style={styles.actionText}>Go back</AppText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showHeader={false} padded={false} mainBackground={colors.background}>
      <ImageBackground
        source={require('../../../assets/illustrations/interview screen.png')}
        resizeMode="cover"
        style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={navigation.goBack}
            style={styles.backButton}
            hitSlop={scale(10)}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={scale(25)} color={colors.text} />
          </Pressable>
          <AppText variant="h2" style={styles.title}>Career preferences</AppText>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AppText style={styles.subtitle}>
            Tell us your preferences for your next job &amp; we will send you most relevant
            recommendations
          </AppText>

          <View style={styles.lookingForRow}>
            {(['JOB', 'INTERNSHIP'] as const).map(value => (
              <Pressable
                key={value}
                onPress={() => setLookingFor(value)}
                style={[styles.lookingForOption, lookingFor === value && styles.lookingForOptionActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: lookingFor === value }}>
                <AppText style={[styles.lookingForText, lookingFor === value && styles.lookingForTextActive]}>
                  {value === 'JOB' ? 'Job' : 'Internship'}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Preferred job role (Max {MAX_ROLES})</AppText>
            <View style={styles.underline} />
            <View style={styles.chips}>
              {roles.map(role => (
                <PreferenceChip
                  key={role}
                  label={role}
                  onRemove={() => setRoles(current => current.filter(item => item !== role))}
                />
              ))}
            </View>
            {roles.length < MAX_ROLES ? (
              <View style={styles.addRow}>
                <TextInput
                  value={roleInput}
                  onChangeText={setRoleInput}
                  onSubmitEditing={() =>
                    addPreference(roleInput, roles, setRoles, setRoleInput, MAX_ROLES)
                  }
                  placeholder="Add a job role"
                  placeholderTextColor="#9AA5B8"
                  returnKeyType="done"
                  style={styles.addInput}
                  accessibilityLabel="Add a preferred job role"
                />
                <Pressable
                  onPress={() => addPreference(roleInput, roles, setRoles, setRoleInput, MAX_ROLES)}
                  style={styles.addButton}
                  accessibilityRole="button"
                  accessibilityLabel="Add job role">
                  <Plus size={scale(18)} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={styles.salarySection}>
            <AppText style={styles.salaryLabel}>Expected annual salary</AppText>
            <View style={styles.salaryRow}>
              <AppText style={styles.currency}>₹</AppText>
              <TextInput
                value={isEditingSalary ? salary : formatIndianAmount(salary)}
                onChangeText={value => setSalary(value.replace(/\D/g, ''))}
                onFocus={() => setIsEditingSalary(true)}
                onBlur={() => setIsEditingSalary(false)}
                keyboardType="number-pad"
                placeholder="Enter amount"
                placeholderTextColor="#9AA5B8"
                style={styles.salaryInput}
                accessibilityLabel="Expected annual salary in rupees"
              />
              <AppText style={styles.perYear}>Per year</AppText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.locationHeader}>
              <AppText style={styles.sectionTitle}>
                Preferred location (Max {MAX_LOCATIONS})
              </AppText>
              <Pressable
                onPress={() => setIsEditingLocations(editing => !editing)}
                hitSlop={scale(8)}
                accessibilityRole="button">
                <AppText style={styles.actionText}>
                  {isEditingLocations ? 'Done' : 'Edit'}
                </AppText>
              </Pressable>
            </View>
            <View style={styles.underline} />
            <View style={styles.chips}>
              {locations.map(location => (
                <PreferenceChip
                  key={location}
                  label={location}
                  onRemove={() =>
                    setLocations(current => current.filter(item => item !== location))
                  }
                />
              ))}
            </View>
            {isEditingLocations && locations.length < MAX_LOCATIONS ? (
              <View style={styles.addRow}>
                <TextInput
                  value={locationInput}
                  onChangeText={setLocationInput}
                  onSubmitEditing={() =>
                    addPreference(
                      locationInput,
                      locations,
                      setLocations,
                      setLocationInput,
                      MAX_LOCATIONS,
                    )
                  }
                  placeholder="Add a city or Remote"
                  placeholderTextColor="#9AA5B8"
                  returnKeyType="done"
                  style={styles.addInput}
                  accessibilityLabel="Add a preferred location"
                />
                <Pressable
                  onPress={() =>
                    addPreference(
                      locationInput,
                      locations,
                      setLocations,
                      setLocationInput,
                      MAX_LOCATIONS,
                    )
                  }
                  style={styles.addButton}
                  accessibilityRole="button"
                  accessibilityLabel="Add location">
                  <Plus size={scale(18)} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
          </View>

          {isLoading ? (
            <ActivityIndicator color={BLUE} style={styles.loading} />
          ) : isError ? (
            <Pressable onPress={() => refetch()} style={styles.retry} accessibilityRole="button">
              <AppText style={styles.errorText}>Couldn’t load your profile. Tap to retry.</AppText>
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={navigation.goBack}
            style={styles.cancelButton}
            accessibilityRole="button">
            <AppText style={styles.actionText}>Cancel</AppText>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={isLoading || isSaving || isError}
            style={[
              styles.saveButton,
              (isLoading || isSaving || isError) && styles.disabled,
            ]}
            accessibilityRole="button">
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <AppText style={styles.saveText}>Save</AppText>
            )}
          </Pressable>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const BLUE = '#2F5FEA';

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    minHeight: vs(56),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  backButton: {
    width: scale(28),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  title: { color: '#172033', fontSize: font(22), fontWeight: '700' },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(24),
  },
  subtitle: {
    marginTop: vs(8),
    color: '#78869E',
    fontSize: font(15),
    lineHeight: vs(21),
    maxWidth: '96%',
  },
  lookingForRow: { flexDirection: 'row', gap: spacing.sm, marginTop: vs(20) },
  lookingForOption: {
    minWidth: scale(104),
    minHeight: vs(40),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: '#CFD6E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookingForOptionActive: { backgroundColor: BLUE, borderColor: BLUE },
  lookingForText: { color: '#52617A', fontSize: font(14), fontWeight: '600' },
  lookingForTextActive: { color: '#FFFFFF' },
  section: { marginTop: vs(46) },
  sectionTitle: {
    color: '#8995A9',
    fontSize: font(16),
    lineHeight: vs(22),
    flexShrink: 1,
  },
  underline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E6EC',
    marginTop: vs(14),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginTop: vs(14),
  },
  chip: {
    minHeight: vs(40),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: '#F1C4B8',
    backgroundColor: '#FFF3F0',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(7),
  },
  chipText: { color: '#202536', fontSize: font(14), lineHeight: vs(20) },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CFD6E1',
    marginTop: vs(12),
    minHeight: vs(44),
  },
  addInput: {
    flex: 1,
    color: '#202536',
    fontSize: font(15),
    paddingVertical: vs(8),
  },
  addButton: {
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  salarySection: { marginTop: vs(42) },
  salaryLabel: {
    color: '#52617A',
    fontSize: font(14),
    lineHeight: vs(20),
    fontWeight: '600',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
    gap: spacing.sm,
  },
  currency: { color: '#71819C', fontSize: font(18) },
  salaryInput: {
    minWidth: scale(118),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CFD6E1',
    color: '#202536',
    fontSize: font(17),
    paddingVertical: vs(8),
  },
  perYear: {
    color: '#59677D',
    fontSize: font(15),
    marginLeft: 'auto',
    marginRight: scale(10),
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionText: { color: BLUE, fontSize: font(15), fontWeight: '600' },
  loading: { marginTop: vs(20) },
  retry: { alignItems: 'center', marginTop: vs(20) },
  errorText: { color: colors.danger, fontSize: font(14) },
  footer: {
    minHeight: vs(70),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
  },
  cancelButton: {
    minWidth: scale(82),
    minHeight: vs(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    width: scale(112),
    height: vs(48),
    borderRadius: vs(26),
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: font(15), fontWeight: '600' },
  disabled: { opacity: 0.55 },
  restricted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
