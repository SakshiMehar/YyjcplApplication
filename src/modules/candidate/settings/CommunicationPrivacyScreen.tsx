import React from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Check, ChevronLeft, CircleX, MoreVertical } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { SharedRoutes } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { USER_ROLES } from '../../../constants/roles';
import { colors, font, scale, spacing, vs } from '../../../theme';
import { useDeleteAccountMutation, useDeactivateAccountMutation } from '../../auth/api/authApi';
import { useAppLogout } from '../../auth/hooks/useAppLogout';
import { clearDeactivatedAccountMarker, markAccountDeactivated } from '../../../services/secureStorage';

const communicationItems = [
  'Job recommendations',
  'Job status updates',
  'Notification when your profile is viewed',
  'Profile visible to recruiters',
  'Jobs & messages from recruiters',
  'Promotional mails',
];

function CommunicationList({ visibleCount }: { visibleCount: number }) {
  return (
    <View style={styles.communicationList}>
      {communicationItems.map((item, index) => {
        const isVisible = index < visibleCount;
        const Icon = isVisible ? Check : CircleX;
        return (
          <View key={item} style={styles.communicationRow}>
            <Icon
              size={scale(22)}
              color={isVisible ? '#FFFFFF' : '#9AA4B7'}
              fill={isVisible ? '#9AA4B7' : 'transparent'}
              strokeWidth={isVisible ? 3 : 2}
            />
            <AppText style={styles.communicationText}>{item}</AppText>
          </View>
        );
      })}
    </View>
  );
}

export default function CommunicationPrivacyScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const user = useAppSelector(state => state.auth.user);
  const userRole = useAppSelector(state => state.auth.user?.role);
  const logout = useAppLogout();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [deactivateAccount, { isLoading: isDeactivating }] = useDeactivateAccountMutation();

  const getErrorMessage = (error: unknown) => {
    const apiError = error as { data?: { message?: string; error?: string } };
    return apiError.data?.message ?? apiError.data?.error ?? 'Please try again.';
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount({ confirmation: 'DELETE' }).unwrap();
              await clearDeactivatedAccountMarker();
              Alert.alert('Account deleted', 'Your account has been deleted.', [
                { text: 'OK', onPress: async () => { await logout(); } },
              ]);
            } catch (error) {
              Alert.alert('Unable to delete account', getErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  const confirmDeactivateAccount = () => {
    Alert.alert(
      'Deactivate account?',
      'Are you sure you want to deactivate your account? You will be signed out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateAccount().unwrap();
              const accountMarker = user?.email
                ? `email:${user.email.trim().toLowerCase()}`
                : user?.phone
                  ? `phone:${user.phone.replace(/\D/g, '').slice(-10)}`
                  : user?.id;
              if (accountMarker) {
                // Use the same email/phone identity entered on the login screen.
                await markAccountDeactivated(accountMarker);
              }
              Alert.alert('Account deactivated', 'Your account has been deactivated.', [
                { text: 'OK', onPress: async () => { await logout(); } },
              ]);
            } catch (error) {
              Alert.alert('Unable to deactivate account', getErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  if (userRole !== USER_ROLES.CANDIDATE) {
    return (
      <ScreenLayout showHeader={false} padded={false}>
        <View style={styles.restricted}>
          <AppText variant="body">Communication &amp; privacy is only available for job seekers.</AppText>
          <Pressable onPress={navigation.goBack} accessibilityRole="button">
            <AppText style={styles.manageText}>Go back</AppText>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showHeader={false} padded={false} scroll={false} mainBackground="transparent">
      <ImageBackground
        source={require('../../../assets/illustrations/interview screen.png')}
        resizeMode="cover"
        style={styles.page}>
        <View style={styles.backBar}>
          <Pressable
            onPress={navigation.goBack}
            hitSlop={scale(12)}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={scale(26)} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.headerDivider} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <AppText variant="h1" style={styles.title}>
            Communication &amp; privacy
          </AppText>

          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Immediately looking for a job</AppText>
            <AppText style={styles.description}>
              Your profile is visible to recruiters &amp; they can reach out to you for job
              opportunities
            </AppText>
            <CommunicationList visibleCount={communicationItems.length} />
          </View>

          <View style={[styles.card, styles.selectedCard]}>
            <View style={styles.cardHeading}>
              <AppText style={[styles.cardTitle, styles.flexTitle]}>
                Not actively looking but open for job opportunities
              </AppText>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Manage preferences',
                    'Communication preferences are not connected to an account settings API yet.',
                  )
                }
                hitSlop={scale(8)}
                accessibilityRole="button"
                accessibilityLabel="Manage communication preferences">
                <AppText style={styles.manageText}>Manage</AppText>
              </Pressable>
            </View>
            <AppText style={styles.description}>
              Your profile is not visible to recruiters but you can still search and apply to jobs
            </AppText>
            <CommunicationList visibleCount={3} />
          </View>

          <View style={styles.lastOption}>
            <View style={styles.lastOptionText}>
              <AppText style={styles.lastOptionTitle}>
                Not looking for a job change right now
              </AppText>
              <AppText style={styles.description}>
                This will stop all communications from Naukri &amp; recruiters. But your profile
                will be reactivated whenever you log in to your account in the future.
              </AppText>
            </View>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Manage preferences',
                  'Communication preferences are not connected to an account settings API yet.',
                )
              }
              hitSlop={scale(8)}
              accessibilityRole="button"
              accessibilityLabel="More communication options">
              <MoreVertical size={scale(22)} color="#151923" />
            </Pressable>
          </View>

          <View style={styles.accountPrivacy}>
            <AppText style={styles.accountPrivacyTitle}>Account privacy</AppText>
            <AppText style={styles.description}>
              You can temporarily deactivate your account or permanently delete it.
            </AppText>
            <Pressable
              onPress={confirmDeactivateAccount}
              disabled={isDeleting || isDeactivating}
              style={[styles.accountAction, (isDeleting || isDeactivating) && styles.accountActionDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Deactivate account">
              <AppText style={styles.deactivateText}>
                {isDeactivating ? 'Deactivating…' : 'Deactivate account'}
              </AppText>
            </Pressable>
            <Pressable
              onPress={confirmDeleteAccount}
              disabled={isDeleting || isDeactivating}
              style={[styles.accountAction, styles.deleteAction, (isDeleting || isDeactivating) && styles.accountActionDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Delete account">
              <AppText style={styles.deleteText}>
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  backBar: {
    height: vs(56),
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: vs(24) },
  title: {
    marginHorizontal: spacing.lg,
    marginTop: vs(18),
    marginBottom: vs(18),
    fontSize: font(26),
    lineHeight: vs(32),
    fontWeight: '700',
    color: '#151923',
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: vs(14),
    paddingHorizontal: spacing.lg,
    paddingTop: vs(22),
    paddingBottom: vs(24),
    borderRadius: scale(22),
    backgroundColor: '#FFFFFF',
  },
  selectedCard: {
    borderWidth: scale(1.2),
    borderColor: '#171A20',
    paddingHorizontal: spacing.lg - scale(1.2),
    paddingTop: vs(21),
    paddingBottom: vs(24),
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  flexTitle: { flex: 1 },
  cardTitle: {
    color: '#171A20',
    fontSize: font(16),
    lineHeight: vs(22),
    fontWeight: '700',
  },
  description: {
    color: '#7D879A',
    fontSize: font(14),
    lineHeight: vs(19),
    marginTop: vs(6),
  },
  communicationList: { gap: vs(12), marginTop: vs(18) },
  communicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: vs(22),
  },
  communicationText: {
    color: '#7D879A',
    fontSize: font(14),
    lineHeight: vs(20),
    flex: 1,
  },
  manageText: {
    color: '#3163D9',
    fontSize: font(15),
    lineHeight: vs(22),
    fontWeight: '700',
  },
  lastOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: vs(10),
    paddingTop: vs(4),
  },
  lastOptionText: { flex: 1 },
  lastOptionTitle: {
    color: '#171A20',
    fontSize: font(16),
    lineHeight: vs(22),
    fontWeight: '700',
  },
  accountPrivacy: {
    marginHorizontal: spacing.md,
    marginTop: vs(28),
    paddingTop: vs(20),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  accountPrivacyTitle: {
    color: '#171A20',
    fontSize: font(18),
    lineHeight: vs(24),
    fontWeight: '700',
  },
  accountAction: {
    minHeight: vs(48),
    marginTop: vs(14),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  deleteAction: { borderColor: colors.danger, marginTop: vs(10) },
  accountActionDisabled: { opacity: 0.55 },
  deactivateText: { color: colors.primary, fontSize: font(15), fontWeight: '700' },
  deleteText: { color: colors.danger, fontSize: font(15), fontWeight: '700' },
  restricted: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
