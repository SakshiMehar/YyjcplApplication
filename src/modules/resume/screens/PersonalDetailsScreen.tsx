import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import FormInput from '../components/FormInput';
import ResumeProgress from '../components/ResumeProgress';
import { useResume } from '../hooks/useResume';
import type { ResumeDocument } from '../types/resume.types';
import {
  getResumeCompletion,
  validateResumePersonalDetails,
} from '../utils/resumeValidation';

export default function PersonalDetailsScreen({
  navigation,
  route,
}: CandidateScreenProps<'PersonalDetails'>) {
  const {
    resume,
    update,
    createSection,
    editSection: updateSection,
    removeSection,
    loading,
    error,
  } = useResume(route.params.resumeId);
  const [values, setValues] = React.useState<ResumeDocument['personal'] | null>(
    null,
  );
  const [title, setTitle] = React.useState('');

  React.useEffect(() => {
    if (resume) {
      setValues(resume.personal);
      setTitle(resume.title);
    }
  }, [resume]);

  const change = (key: keyof ResumeDocument['personal'], value: string) => {
    setValues(current => (current ? { ...current, [key]: value } : current));
  };

  const save = async (preview = false) => {
    if (!resume || !values) return;
    const message = validateResumePersonalDetails({
      ...resume,
      personal: values,
    });
    if (message) {
      Alert.alert('Check your details', message);
      return;
    }
    try {
      await update(resume.id, {
        personal: values,
        title: title.trim() || values.fullName.trim(),
      });
      if (values.summary.trim()) {
        const body = {
          sectionType: 'SUMMARY' as const,
          title: 'Professional Summary',
          content: values.summary.trim(),
          position: 0,
        };
        if (resume.sectionIds.summary) {
          await updateSection(resume.id, resume.sectionIds.summary, body);
        } else {
          await createSection(resume.id, body);
        }
      } else if (resume.sectionIds.summary) {
        await removeSection(resume.id, resume.sectionIds.summary);
      }
      navigation.navigate(preview ? 'ResumePreview' : 'Education', {
        resumeId: resume.id,
      });
    } catch (reason) {
      Alert.alert(
        'Could not save details',
        reason instanceof Error ? reason.message : 'Please try again.',
      );
    }
  };

  if (loading || !resume || !values) {
    return (
      <ScreenLayout title="Personal details" showBack>
        {error ? (
          <Card>
            <AppText color="danger">{error}</AppText>
          </Card>
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Personal details"
      showBack
      footer={
        <View style={styles.footer}>
          <AppButton title="Save and continue" onPress={() => save()} />
          <AppButton
            title="Preview"
            variant="outline"
            onPress={() => save(true)}
          />
        </View>
      }
    >
      <ResumeProgress
        value={getResumeCompletion({ ...resume, personal: values })}
      />
      <AppText variant="h3" style={styles.heading}>
        Let employers know who you are
      </AppText>
      <AppText variant="caption" color="textSecondary" style={styles.hint}>
        Your contact details appear at the top of your resume.
      </AppText>
      <FormInput
        label="Resume title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Product designer"
      />
      <FormInput
        label="Full name *"
        value={values.fullName}
        onChangeText={value => change('fullName', value)}
      />
      <FormInput
        label="Email"
        value={values.email}
        onChangeText={value => change('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        label="Phone"
        value={values.phone}
        onChangeText={value => change('phone', value)}
        keyboardType="phone-pad"
      />
      <FormInput
        label="Location"
        value={values.location}
        onChangeText={value => change('location', value)}
        placeholder="City, State"
      />
      <FormInput
        label="Professional summary"
        value={values.summary}
        onChangeText={value => change('summary', value)}
        multiline
        placeholder="A short introduction highlighting your strengths and goals"
      />
      <View style={styles.note}>
        <AppText variant="caption" color="textSecondary">
          Your changes are saved to your resume as you move through each
          section.
        </AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.md },
  hint: { marginTop: spacing.xs, marginBottom: spacing.lg },
  note: { marginTop: spacing.sm, marginBottom: spacing.md },
  footer: { gap: spacing.sm, flexDirection: 'row' },
});
