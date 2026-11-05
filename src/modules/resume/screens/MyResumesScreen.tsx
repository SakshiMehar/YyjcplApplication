import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
} from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import ResumeCard from '../components/ResumeCard';
import { useResumeLibrary } from '../hooks/useResume';

export default function MyResumesScreen({
  navigation,
}: CandidateScreenProps<'Resume'>) {
  const { resumes, loading, error, remove, refresh } = useResumeLibrary();

  const confirmDelete = (resumeId: string, title: string) => {
    Alert.alert(
      'Delete resume?',
      `“${title}” will be permanently deleted from your account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(resumeId).catch(reason =>
              Alert.alert(
                'Could not delete resume',
                reason instanceof Error ? reason.message : 'Please try again.',
              ),
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout title="My resumes">
      <View style={styles.intro}>
        <View style={styles.icon}>
          <FileText size={24} color={colors.primary} />
        </View>
        <AppText variant="h3">Build a resume that opens doors</AppText>
        <AppText variant="caption" color="textSecondary">
          Create, edit and download multiple tailored resumes.
        </AppText>
      </View>
      <AppButton
        title="Create a resume"
        onPress={() => navigation.navigate('ResumeTemplates')}
        style={styles.create}
      />
      <AppButton
        title="View uploaded resume"
        variant="outline"
        onPress={() => navigation.navigate('UploadedResume')}
        style={styles.uploaded}
      />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <Card>
          <AppText variant="bodyBold">Could not load your resumes</AppText>
          <AppText variant="caption" color="textSecondary" style={styles.error}>
            {error}
          </AppText>
          <AppButton
            title="Try again"
            variant="outline"
            onPress={() => refresh()}
          />
        </Card>
      ) : resumes.length ? (
        resumes.map(resume => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onOpen={() =>
              navigation.navigate('ResumePreview', { resumeId: resume.id })
            }
            onDelete={() => confirmDelete(resume.id, resume.title)}
          />
        ))
      ) : (
        <EmptyState
          title="No resumes yet"
          message="Choose a template to start building your first resume."
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  create: { marginBottom: spacing.lg },
  uploaded: { marginBottom: spacing.lg },
  loading: { padding: spacing.xl },
  error: { marginVertical: spacing.md },
});
