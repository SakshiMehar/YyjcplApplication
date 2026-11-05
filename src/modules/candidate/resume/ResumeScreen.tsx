import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { ChevronLeft, FileText, Upload } from 'lucide-react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { ScreenLayout } from '../../../layout';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, radius, scale, sizes, spacing } from '../../../theme';
import { useAppSelector } from '../../../store/hooks';
import { useGetJobSeekerProfileQuery } from '../api/candidateApi';
import { resolveResumeUrl } from '../utils/resume';

function getResumeFileName(resumeUrl: string): string {
  const fileName = resumeUrl.split(/[?#]/, 1)[0]?.split('/').pop();
  if (!fileName) return 'Uploaded resume';

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

export default function ResumeScreen({ navigation }: CandidateScreenProps<'UploadedResume'>) {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useGetJobSeekerProfileQuery();
  const token = useAppSelector(state => state.auth.token);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [isPdfLoading, setIsPdfLoading] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);

  const handleOpenResume = () => {
    if (!profile?.resumeUrl) return;
    setPdfError(null);
    setIsPdfLoading(true);
    setIsViewerOpen(true);
  };

  const resumeUrl = profile?.resumeUrl?.trim();
  const resolvedResumeUrl = resumeUrl ? resolveResumeUrl(resumeUrl) : undefined;
  const pdfSource = resolvedResumeUrl
    ? {
        uri: resolvedResumeUrl,
        cache: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(resolvedResumeUrl.includes('ngrok')
            ? { 'ngrok-skip-browser-warning': 'true' }
            : {}),
        },
      }
    : undefined;

  return (
    <ScreenLayout title="Resume">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText color="textSecondary">Loading your resume…</AppText>
        </View>
      ) : isError ? (
        <Card>
          <AppText variant="h3">Could not load resume</AppText>
          <AppText color="textSecondary" style={styles.message}>
            Check your connection and try again.
          </AppText>
          <AppButton title="Try again" onPress={() => refetch()} />
        </Card>
      ) : resumeUrl ? (
        <Card>
          <View style={styles.fileIcon}>
            <FileText size={sizes.iconLg} color={colors.primary} />
          </View>
          <AppText variant="h3">Your uploaded resume</AppText>
          <AppText color="textSecondary" style={styles.fileName} numberOfLines={2}>
            {getResumeFileName(resumeUrl)}
          </AppText>
          <AppButton
            title="View / Download"
            onPress={handleOpenResume}
            style={styles.button}
          />
          <AppButton
            title="Replace resume"
            variant="outline"
            onPress={() => navigation.navigate('EditCandidateProfile')}
          />
        </Card>
      ) : (
        <Card>
          <View style={styles.fileIcon}>
            <Upload size={sizes.iconLg} color={colors.primary} />
          </View>
          <AppText variant="h3">No resume uploaded</AppText>
          <AppText color="textSecondary" style={styles.message}>
            Upload a PDF resume to view or share it with employers.
          </AppText>
          <AppButton
            title="Upload resume"
            onPress={() => navigation.navigate('EditCandidateProfile')}
            style={styles.button}
          />
        </Card>
      )}
      <Modal
        visible={isViewerOpen}
        animationType="slide"
        onRequestClose={() => setIsViewerOpen(false)}>
        <View style={styles.viewer}>
          <View style={styles.viewerHeader}>
            <Pressable
              onPress={() => setIsViewerOpen(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close resume">
              <ChevronLeft size={scale(22)} color={colors.text} />
            </Pressable>
            <AppText variant="bodyBold" numberOfLines={1} style={styles.viewerTitle}>
              {resumeUrl ? getResumeFileName(resumeUrl) : 'Resume'}
            </AppText>
          </View>
          {pdfError ? (
            <View style={styles.pdfError}>
              <FileText size={scale(32)} color={colors.danger} />
              <AppText variant="bodyBold">Could not open this resume</AppText>
              <AppText variant="caption" color="textSecondary" style={styles.pdfErrorMessage}>
                {pdfError}
              </AppText>
              <AppButton
                title="Close"
                variant="outline"
                onPress={() => setIsViewerOpen(false)}
              />
            </View>
          ) : pdfSource ? (
            <Pdf
              source={pdfSource}
              style={styles.pdf}
              trustAllCerts={false}
              renderActivityIndicator={() => (
                <ActivityIndicator size="large" color={colors.primary} />
              )}
              onLoadComplete={() => setIsPdfLoading(false)}
              onError={error => {
                setIsPdfLoading(false);
                setPdfError(error.message || 'Check your connection and try again.');
              }}
            />
          ) : null}
          {isPdfLoading && !pdfError ? (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null}
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  fileIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  fileName: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  message: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  viewer: { flex: 1, backgroundColor: colors.background },
  viewerHeader: {
    minHeight: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerTitle: { flex: 1 },
  pdf: { flex: 1, width: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    top: scale(56),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  pdfError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  pdfErrorMessage: { textAlign: 'center' },
});
