import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton, AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { spacing } from '../../../theme';
import { getResumeErrorMessage, useResume } from '../hooks/useResume';
import type { ResumeDocument } from '../types/resume.types';
import { getResumeCompletion } from '../utils/resumeValidation';
import {
  useGetResumePreviewQuery,
} from '../services/resumeApi';
import { downloadResumePdf } from '../utils/resumePdf';
import ProfessionalTemplate from '../templates/ProfessionalTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import CreativeTemplate from '../templates/CreativeTemplate';
import ResumeProgress from '../components/ResumeProgress';

function TemplatePreview({ resume }: { resume: ResumeDocument }) {
  switch (resume.template) {
    case 'MODERN':
      return <ModernTemplate resume={resume} />;
    case 'MINIMAL':
      return <MinimalTemplate resume={resume} />;
    case 'CREATIVE':
      return <CreativeTemplate resume={resume} />;
    default:
      return <ProfessionalTemplate resume={resume} />;
  }
}

export default function ResumePreviewScreen({
  navigation,
  route,
}: CandidateScreenProps<'ResumePreview'>) {
  const { resume, loading, error } = useResume(route.params.resumeId);
  const {
    data: serverPreview,
    isLoading: previewLoading,
    isError: previewIsError,
  } = useGetResumePreviewQuery(route.params.resumeId);
  const [downloading, setDownloading] = React.useState(false);
  const previewResume = serverPreview ?? resume;

  const startDownload = async () => {
    if (!resume) return;
    try {
      await downloadResumePdf(previewResume ?? resume);
      Alert.alert('PDF downloaded', 'Your resume PDF is ready.');
    } catch (reason) {
      Alert.alert(
        'Could not download PDF',
        getResumeErrorMessage(reason, 'Please try again.'),
      );
    } finally {
      setDownloading(false);
    }
  };

  const edit = (
    routeName:
      | 'PersonalDetails'
      | 'Education'
      | 'Experience'
      | 'Skills'
      | 'Projects'
      | 'Certifications',
  ) => {
    if (!resume) return;
    navigation.navigate(routeName, { resumeId: resume.id });
  };

  if (loading || !resume || !previewResume) {
    return (
      <ScreenLayout title="Resume preview" showBack>
        <AppText color="textSecondary">
          {error ?? 'Loading your resume…'}
        </AppText>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Resume preview" showBack>
      <AppText variant="h3" style={styles.heading}>
        {previewResume.title}
      </AppText>
      <ResumeProgress value={getResumeCompletion(previewResume)} />
      <View style={styles.preview}>
        <TemplatePreview resume={previewResume} />
      </View>
      {previewLoading ? (
        <AppText variant="caption" color="textSecondary">
          Loading server preview…
        </AppText>
      ) : previewIsError ? (
        <AppText variant="caption" color="danger">
          Could not load the server preview. Check your connection and try
          again.
        </AppText>
      ) : null}
      <AppButton
        title="Download PDF"
        onPress={() => {
          setDownloading(true);
          startDownload();
        }}
        loading={downloading}
        style={styles.button}
      />
      <AppButton
        title="Change template"
        variant="outline"
        onPress={() =>
          navigation.navigate('ResumeTemplates', { resumeId: resume.id })
        }
        style={styles.button}
      />
      <AppText variant="bodyBold" style={styles.editTitle}>
        Edit a section
      </AppText>
      <View style={styles.editGrid}>
        <AppButton
          title="Personal details"
          variant="ghost"
          onPress={() => edit('PersonalDetails')}
        />
        <AppButton
          title="Education"
          variant="ghost"
          onPress={() => edit('Education')}
        />
        <AppButton
          title="Experience"
          variant="ghost"
          onPress={() => edit('Experience')}
        />
        <AppButton
          title="Skills"
          variant="ghost"
          onPress={() => edit('Skills')}
        />
        <AppButton
          title="Projects"
          variant="ghost"
          onPress={() => edit('Projects')}
        />
        <AppButton
          title="Certifications"
          variant="ghost"
          onPress={() => edit('Certifications')}
        />
      </View>
      <AppButton
        title="Done"
        variant="outline"
        onPress={() => navigation.navigate('Resume')}
        style={styles.done}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  preview: { marginTop: spacing.md, marginBottom: spacing.lg },
  button: { marginBottom: spacing.sm },
  editTitle: { marginTop: spacing.md, marginBottom: spacing.sm },
  editGrid: { gap: spacing.xs, marginBottom: spacing.md },
  done: { marginBottom: spacing.md },
});
