import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateStackParamList } from '../../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing } from '../../../theme';
import FormInput from '../components/FormInput';
import { useResume } from '../hooks/useResume';
import type { ResumeEntry, ResumeSectionType } from '../types/resume.types';

export type EntrySection =
  | 'education'
  | 'experience'
  | 'projects'
  | 'certifications';
type Field = { key: string; label: string };
const COPY: Record<
  EntrySection,
  {
    title: string;
    description: string;
    fields: Field[];
    next: keyof CandidateStackParamList;
  }
> = {
  education: {
    title: 'Education',
    description: 'Add your degrees, courses and other relevant education.',
    fields: [
      { key: 'degree', label: 'Degree or qualification' },
      { key: 'institution', label: 'School or institution' },
      { key: 'startYear', label: 'Start year' },
      { key: 'endYear', label: 'End year' },
    ],
    next: 'Experience',
  },
  experience: {
    title: 'Experience',
    description: 'Show employers the impact you have made in previous roles.',
    fields: [
      { key: 'role', label: 'Job title' },
      { key: 'company', label: 'Company' },
      { key: 'duration', label: 'Duration' },
      { key: 'description', label: 'Responsibilities and achievements' },
    ],
    next: 'Skills',
  },
  projects: {
    title: 'Projects',
    description: 'Highlight personal, academic or professional projects.',
    fields: [
      { key: 'name', label: 'Project name' },
      { key: 'link', label: 'Project link' },
      { key: 'description', label: 'What did you build or achieve?' },
    ],
    next: 'Certifications',
  },
  certifications: {
    title: 'Certifications',
    description: 'Add certificates, licenses and professional training.',
    fields: [
      { key: 'name', label: 'Certification name' },
      { key: 'issuer', label: 'Issuing organization' },
      { key: 'date', label: 'Date earned' },
    ],
    next: 'ResumePreview',
  },
};
const SECTION_TYPE: Record<EntrySection, ResumeSectionType> = {
  education: 'EDUCATION',
  experience: 'EXPERIENCE',
  projects: 'PROJECTS',
  certifications: 'CERTIFICATIONS',
};

type Props = {
  section: EntrySection;
  resumeId: string;
  navigation: NativeStackNavigationProp<CandidateStackParamList>;
};

export default function ResumeSectionEditorScreen({
  section,
  resumeId,
  navigation,
}: Props) {
  const { resume, createSection, editSection, removeSection, loading, error } =
    useResume(resumeId);
  const copy = COPY[section];
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = React.useState<string>();
  const entries = resume?.[section] ?? [];
  const savedSectionId = resume?.sectionIds[section];

  React.useEffect(() => {
    setActiveSectionId(savedSectionId);
  }, [resume?.id, section, savedSectionId]);

  const setField = (key: string, value: string) =>
    setValues(current => ({ ...current, [key]: value }));

  const updateEntries = async (nextEntries: ResumeEntry[]) => {
    if (!resume) return;
    const sectionId = activeSectionId ?? resume.sectionIds[section];
    if (!nextEntries.length) {
      if (sectionId) await removeSection(resume.id, sectionId);
      setActiveSectionId(undefined);
      return;
    }
    const content = nextEntries.map(
      ({ id: _id, sectionId: _sectionId, ...entry }) => entry,
    );
    const body = {
      sectionType: SECTION_TYPE[section],
      title: copy.title,
      content,
      position:
        resume.sectionPositions?.[section] ??
        Object.keys(resume.sectionIds).filter(
          key => resume.sectionIds[key as keyof typeof resume.sectionIds],
        ).length,
    };
    if (sectionId) {
      await editSection(resume.id, sectionId, body);
    } else {
      setActiveSectionId(await createSection(resume.id, body));
    }
  };

  const saveEntry = async () => {
    if (!resume) return;
    if (!Object.values(values).some(value => value.trim())) {
      Alert.alert(
        'Add some details',
        'Enter at least one detail before saving this section.',
      );
      return;
    }
    try {
      const current = entries.filter(entry => entry.id !== editingId);
      const entry: ResumeEntry = {
        ...values,
        sectionId: editingId
          ? entries.find(item => item.id === editingId)?.sectionId
          : activeSectionId,
        id:
          editingId ??
          `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      await updateEntries(
        editingId
          ? entries.map(item => (item.id === editingId ? entry : item))
          : [entry, ...current],
      );
      setValues({});
      setEditingId(null);
    } catch (reason) {
      Alert.alert(
        'Could not save section',
        reason instanceof Error ? reason.message : 'Please try again.',
      );
    }
  };

  const deleteEntry = (entry: ResumeEntry) => {
    Alert.alert(
      'Delete this item?',
      'This item will be removed from your resume.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            updateEntries(entries.filter(item => item.id !== entry.id)).catch(
              reason =>
                Alert.alert(
                  'Could not delete item',
                  reason instanceof Error
                    ? reason.message
                    : 'Please try again.',
                ),
            );
          },
        },
      ],
    );
  };

  const continueToNext = () => {
    if (!resume) return;
    if (copy.next === 'Experience')
      navigation.navigate('Experience', { resumeId });
    else if (copy.next === 'Skills')
      navigation.navigate('Skills', { resumeId });
    else if (copy.next === 'Projects')
      navigation.navigate('Projects', { resumeId });
    else if (copy.next === 'Certifications')
      navigation.navigate('Certifications', { resumeId });
    else navigation.navigate('ResumePreview', { resumeId });
  };

  if (loading || !resume) {
    return (
      <ScreenLayout title={copy.title} showBack>
        <AppText color="textSecondary">
          {error ?? 'Loading your resume…'}
        </AppText>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title={copy.title}
      showBack
      footer={
        <View style={styles.footer}>
          <AppButton title="Save and continue" onPress={continueToNext} />
          <AppButton
            title="Preview"
            variant="outline"
            onPress={() => navigation.navigate('ResumePreview', { resumeId })}
          />
        </View>
      }
    >
      <AppText variant="h3" style={styles.heading}>
        {copy.title}
      </AppText>
      <AppText
        variant="caption"
        color="textSecondary"
        style={styles.description}
      >
        {copy.description}
      </AppText>
      {entries.map(entry => (
        <Card
          key={entry.id}
          onPress={() => {
            setEditingId(entry.id);
            setValues(
              Object.fromEntries(
                copy.fields.map(field => [field.key, entry[field.key] ?? '']),
              ),
            );
          }}
        >
          <View style={styles.entryHeader}>
            <View style={styles.entryTitle}>
              <AppText variant="bodyBold">
                {entry[copy.fields[0].key] || copy.title}
              </AppText>
              <AppText
                variant="caption"
                color="textSecondary"
                numberOfLines={2}
              >
                {copy.fields
                  .slice(1)
                  .map(field => entry[field.key])
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
            </View>
            <AppButton
              title="Delete"
              variant="ghost"
              onPress={() => deleteEntry(entry)}
            />
          </View>
        </Card>
      ))}
      <Card style={styles.formCard}>
        <AppText variant="bodyBold" style={styles.formTitle}>
          {editingId ? 'Edit item' : `Add ${copy.title.toLowerCase()}`}
        </AppText>
        {copy.fields.map(field => (
          <FormInput
            key={field.key}
            label={field.label}
            value={values[field.key] ?? ''}
            onChangeText={value => setField(field.key, value)}
            multiline={field.key === 'description'}
          />
        ))}
        <AppButton
          title={editingId ? 'Update item' : `Add ${copy.title.toLowerCase()}`}
          onPress={() => saveEntry()}
        />
        {editingId ? (
          <AppButton
            title="Cancel edit"
            variant="ghost"
            onPress={() => {
              setEditingId(null);
              setValues({});
            }}
            style={styles.cancel}
          />
        ) : null}
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.xs },
  description: { marginBottom: spacing.lg },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  entryTitle: { flex: 1, gap: spacing.xs },
  formCard: { marginTop: spacing.sm },
  formTitle: { marginBottom: spacing.md },
  cancel: { marginTop: spacing.xs },
  footer: { flexDirection: 'row', gap: spacing.sm },
});
