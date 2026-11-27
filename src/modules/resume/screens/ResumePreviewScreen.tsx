import React from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { AppButton, AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, scale, spacing } from '../../../theme';
import { getResumeErrorMessage, useResume } from '../hooks/useResume';
import type { ResumeDocument } from '../types/resume.types';
import { getResumeCompletion } from '../utils/resumeValidation';
import {
  useGetResumePreviewQuery,
} from '../services/resumeApi';
import {
  downloadResumePdf,
  openDownloadedResumePdf,
  createResumePdf,
} from '../utils/resumePdf';
import ProfessionalTemplate from '../templates/ProfessionalTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import CreativeTemplate from '../templates/CreativeTemplate';
import ResumeProgress from '../components/ResumeProgress';
import {
  useGetJobSeekerProfileQuery,
  useUpdateJobSeekerProfileMutation,
  useUploadResumeMutation,
} from '../../candidate/api/candidateApi';

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
  const [usingTemplate, setUsingTemplate] = React.useState(false);
  const { data: profile } = useGetJobSeekerProfileQuery();
  const [uploadResume] = useUploadResumeMutation();
  const [updateProfile] = useUpdateJobSeekerProfileMutation();
  const previewResume = serverPreview ?? resume;

  const startDownload = async () => {
    if (!resume) return;
    try {
      const savedPdf = await downloadResumePdf(previewResume ?? resume);
      if (Platform.OS === 'android' && savedPdf.uri) {
        const { uri } = savedPdf;
        const openSettings = () => {
          Linking.openSettings().catch(reason => {
            Alert.alert(
              'Could not open settings',
              getResumeErrorMessage(
                reason,
                'Enable notifications for YYJCPL in your device settings.',
              ),
            );
          });
        };
        const notificationMessage = savedPdf.notificationPermissionDenied
          ? `${savedPdf.fileName} is saved in Downloads. Notifications are disabled for YYJCPL. Enable them in app settings to see download alerts.`
          : savedPdf.notificationShown
          ? `${savedPdf.fileName} is available in Downloads. A download notification was added.`
          : `${savedPdf.fileName} is available in Downloads, but Android could not show a download notification. The PDF has still been saved successfully.`;
        Alert.alert(
          'PDF saved to Downloads',
          notificationMessage,
          [
            ...(savedPdf.notificationPermissionDenied
              ? [{ text: 'Notification settings', onPress: openSettings }]
              : []),
            {
              text: 'Open PDF',
              onPress: () => {
                openDownloadedResumePdf(uri).catch(reason => {
                  Alert.alert(
                    'Could not open PDF',
                    getResumeErrorMessage(reason, 'Please try again.'),
                  );
                });
              },
            },
            { text: 'Done', style: 'cancel' },
          ],
        );
      } else {
        Alert.alert(
          'PDF saved',
          `${savedPdf.fileName} was saved to Documents and opened for preview.`,
        );
      }
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

  const useResumeForProfile = async () => {
    if (!previewResume || !resume) return;
    setUsingTemplate(true);
    const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/profile-resume-${resume.id}.pdf`;
    try {
      const pdf = createResumePdf(previewResume);
      const bytes = Array.from(pdf, character => character.charCodeAt(0));
      await ReactNativeBlobUtil.fs.writeFile(path, bytes, 'ascii');
      const form = new FormData();
      form.append('file', {
        uri: `file://${path}`,
        name: `${previewResume.title || 'resume'}.pdf`,
        type: 'application/pdf',
      } as unknown as Blob);
      const uploaded = await uploadResume(form).unwrap();
      await updateProfile({
        headline: profile?.headline ?? '',
        professionalSummary: profile?.professionalSummary ?? '',
        experience: profile?.experience ?? '',
        skills: profile?.skills ?? '',
        resumeUrl: uploaded.resumeUrl,
        preferredLocation: profile?.preferredLocation ?? '',
        education: profile?.education ?? '',
        projects: profile?.projects ?? '',
        socialMediaLinks: profile?.socialMediaLinks ?? '',
        certifications: profile?.certifications ?? '',
        languages: profile?.languages ?? '',
        joiningDate: profile?.joiningDate ?? '',
        currentSalary: profile?.currentSalary ?? '',
        expectedSalary: profile?.expectedSalary ?? '',
        preferredRole: profile?.preferredRole ?? '',
      }).unwrap();
      Alert.alert('Resume added to profile', 'This resume is now attached to your profile.');
    } catch (error) {
      Alert.alert(
        'Could not add resume',
        getResumeErrorMessage(error, 'Please try again.'),
      );
    } finally {
      setUsingTemplate(false);
      ReactNativeBlobUtil.fs.unlink(path).catch(() => {});
    }
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
    <ScreenLayout
      title="Resume preview"
      showBack
      right={
        <Pressable
          onPress={() => edit('PersonalDetails')}
          disabled={!resume}
          hitSlop={scale(10)}
          accessibilityRole="button"
          accessibilityLabel="Edit this resume">
          <Pencil size={scale(19)} color={colors.primary} />
        </Pressable>
      }>
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
      <AppButton
        title="Use this resume in my profile"
        variant="outline"
        onPress={useResumeForProfile}
        loading={usingTemplate}
        disabled={usingTemplate}
        style={styles.button}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  preview: { marginTop: spacing.md, marginBottom: spacing.lg },
  button: { marginBottom: spacing.sm },
});
