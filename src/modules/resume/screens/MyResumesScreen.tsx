import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { FileText, Sparkles } from 'lucide-react-native';
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
} from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, font, radius, scale, shadows, spacing, vs } from '../../../theme';
import ResumeCard from '../components/ResumeCard';
import { useResumeLibrary } from '../hooks/useResume';

export default function MyResumesScreen({
  navigation,
}: CandidateScreenProps<'Resume'>) {
  const { resumes, loading, error, remove, refresh } = useResumeLibrary();
  const [heroHovered, setHeroHovered] = React.useState(false);

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
      <Pressable
        onHoverIn={() => setHeroHovered(true)}
        onHoverOut={() => setHeroHovered(false)}
        style={[styles.hero, heroHovered && styles.heroHovered]}>
        <View style={styles.heroIcon}>
          <Sparkles size={scale(22)} color={colors.primary} />
        </View>
        <AppText variant="h3" style={styles.heroTitle}>Your career, on paper</AppText>
        <AppText variant="caption" color="textSecondary" style={styles.heroCopy}>
          Create polished resumes for every opportunity and keep them all in one place.
        </AppText>
        <View style={styles.heroFoot}>
          <FileText size={scale(15)} color={colors.primary} />
          <AppText variant="caption" color="primary" style={styles.heroFootText}>
            {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} in your library
          </AppText>
        </View>
      </Pressable>
      <AppButton
        title="Create a new resume"
        onPress={() => navigation.navigate('ResumeTemplates')}
        style={styles.create}
      />
      <AppButton
        title="View uploaded resume  ›"
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
  hero: {
    alignItems: 'flex-start',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg + scale(4),
    borderWidth: 1,
    borderColor: '#FFE2CC',
    backgroundColor: '#FFF9F4',
    backgroundImage: 'linear-gradient(145deg, #FFFFFF 0%, #FFF5EC 100%)',
    boxShadow: shadows.md,
  },
  heroHovered: {
    transform: [{ translateY: -scale(2) }],
    borderColor: colors.primarySoft,
    boxShadow: shadows.glow('rgba(249, 115, 22, 0.22)'),
  },
  heroIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md + scale(2),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    boxShadow: shadows.sm,
  },
  heroTitle: { fontSize: font(20), marginBottom: vs(5) },
  heroCopy: { lineHeight: vs(20) },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(6),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  heroFootText: { fontWeight: '700' },
  create: { marginBottom: spacing.md, boxShadow: shadows.glow() },
  uploaded: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    boxShadow: shadows.sm,
  },
  loading: {
    padding: spacing.xl,
    marginVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    boxShadow: shadows.sm,
  },
  error: { marginVertical: spacing.md },
});
