import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Rocket } from 'lucide-react-native';
import { AppButton, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { CandidateScreenProps } from '../../../navigation/types';
import { colors, radius, scale, spacing, vs } from '../../../theme';

/**
 * Apply Job — waiting for POST /api/job-seeker/apply (or equivalent) from backend.
 * UI is ready; wire up the mutation once the API is available.
 */
export default function ApplyJobScreen({
  route,
  navigation,
}: CandidateScreenProps<'ApplyJob'>) {
  const { job } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Back */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        hitSlop={scale(12)}
        accessibilityLabel="Go back">
        <ChevronLeft size={scale(22)} color={colors.text} />
      </Pressable>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Rocket size={scale(40)} color={colors.primary} />
        </View>

        <AppText variant="h2" style={styles.title}>
          Apply for {job.role}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          {job.companyName}
        </AppText>

        <View style={styles.infoBox}>
          <AppText variant="caption" color="textSecondary" style={styles.infoText}>
            The job application API is not available yet. Please ask the backend developer to
            provide the endpoint, then this screen will be fully functional.
          </AppText>
        </View>

        <AppButton
          title="Go Back"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  backBtn: {
    margin: spacing.lg,
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: vs(12),
    marginTop: -vs(60),
  },
  iconWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8),
  },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: -vs(4) },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: vs(8),
  },
  infoText: { textAlign: 'center', lineHeight: vs(18) },
  btn: { marginTop: vs(8), alignSelf: 'stretch' },
});
