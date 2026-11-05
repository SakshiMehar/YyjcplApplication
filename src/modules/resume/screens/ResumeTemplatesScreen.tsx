import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { getResumeErrorMessage } from '../hooks/useResume';
import TemplateCard from '../components/TemplateCard';
import {
  useCreateResumeMutation,
  useGetResumeTemplatesQuery,
  useUpdateResumeMutation,
} from '../services/resumeApi';
import type { ResumeTemplateId } from '../types/resume.types';

export default function ResumeTemplatesScreen({
  navigation,
  route,
}: CandidateScreenProps<'ResumeTemplates'>) {
  const [createResume] = useCreateResumeMutation();
  const [updateResume] = useUpdateResumeMutation();
  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useGetResumeTemplatesQuery();
  const resumeId = route.params?.resumeId;

  const chooseTemplate = async (template: ResumeTemplateId) => {
    try {
      if (typeof resumeId === 'string') {
        await updateResume({
          resumeId,
          body: { templateCode: template },
        }).unwrap();
        navigation.goBack();
        return;
      }
      const resume = await createResume({
        title: 'Untitled resume',
        templateCode: template,
        resumeData: {
          personalInfo: { fullName: '', email: '', phone: '', location: '' },
          sections: [],
        },
      }).unwrap();
      navigation.replace('PersonalDetails', { resumeId: resume.id });
    } catch (reason) {
      Alert.alert(
        resumeId ? 'Could not update resume' : 'Could not create resume',
        getResumeErrorMessage(reason, 'Please try again.'),
      );
    }
  };

  return (
    <ScreenLayout title="Choose a template" showBack>
      <AppText variant="h3" style={styles.title}>
        Start with a design you like
      </AppText>
      <AppText
        variant="caption"
        color="textSecondary"
        style={styles.description}
      >
        You can switch templates any time from the preview.
      </AppText>
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <AppText color="danger" onPress={() => refetch()}>
          Could not load templates. Tap to try again.
        </AppText>
      ) : (
        templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onPress={() => chooseTemplate(template.id)}
          />
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.xs },
  description: { marginBottom: spacing.lg },
  state: { padding: spacing.xl },
});
