import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { spacing } from '../../../theme';
import FormInput from '../components/FormInput';
import { useResume } from '../hooks/useResume';

export default function SkillsScreen({
  navigation,
  route,
}: CandidateScreenProps<'Skills'>) {
  const { resume, createSection, editSection, removeSection, loading, error } =
    useResume(route.params.resumeId);
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    if (resume) setInput(resume.skills.join(', '));
  }, [resume]);

  const save = async (preview = false) => {
    if (!resume) return;
    const skills = [
      ...new Set(
        input
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean),
      ),
    ];
    try {
      if (skills.length) {
        const body = {
          sectionType: 'SKILLS' as const,
          title: 'Skills',
          content: skills,
          position:
            resume.sectionPositions?.skills ??
            Object.keys(resume.sectionIds).filter(
              key => resume.sectionIds[key as keyof typeof resume.sectionIds],
            ).length,
        };
        if (resume.sectionIds.skills) {
          await editSection(resume.id, resume.sectionIds.skills, body);
        } else {
          await createSection(resume.id, body);
        }
      } else if (resume.sectionIds.skills) {
        await removeSection(resume.id, resume.sectionIds.skills);
      }
      navigation.navigate(preview ? 'ResumePreview' : 'Projects', {
        resumeId: resume.id,
      });
    } catch (reason) {
      Alert.alert(
        'Could not save skills',
        reason instanceof Error ? reason.message : 'Please try again.',
      );
    }
  };

  if (loading || !resume) {
    return (
      <ScreenLayout title="Skills" showBack>
        <AppText color="textSecondary">
          {error ?? 'Loading your resume…'}
        </AppText>
      </ScreenLayout>
    );
  }

  const skills = input
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return (
    <ScreenLayout
      title="Skills"
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
      <AppText variant="h3" style={styles.heading}>
        Show what you do best
      </AppText>
      <AppText
        variant="caption"
        color="textSecondary"
        style={styles.description}
      >
        Add skills separated by commas. You can edit or remove any skill below.
      </AppText>
      <FormInput
        label="Skills"
        value={input}
        onChangeText={setInput}
        multiline
        placeholder="e.g. Communication, Excel, React"
      />
      {skills.length ? (
        <Card>
          <AppText variant="bodyBold" style={styles.subheading}>
            Preview skills
          </AppText>
          <View style={styles.chips}>
            {skills.map((skill, index) => (
              <View key={`${skill}-${index}`} style={styles.chip}>
                <AppText variant="caption">{skill}</AppText>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.xs },
  description: { marginBottom: spacing.lg },
  subheading: { marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#FFF1E8',
    borderRadius: 999,
  },
  footer: { flexDirection: 'row', gap: spacing.sm },
});
