import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { BadgeCheck, ChevronLeft, ChevronRight, LogOut, Pencil, TriangleAlert } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { SharedRoutes } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { colors, font, radius, scale, spacing, vs } from '../../../theme';
import { useAppLogout } from '../../auth/hooks/useAppLogout';

function AccountCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View style={styles.card}>
      <AppText variant="bodyBold" style={styles.cardTitle}>
        {title}
      </AppText>
      <AppText variant="body" style={styles.cardDescription}>
        {description}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="body" style={styles.value} numberOfLines={1}>
          {value}
        </AppText>
        <View style={styles.editIcon} accessibilityLabel={`Edit ${title.toLowerCase()}`}>
          <Pencil size={scale(18)} color="#748096" />
        </View>
        <BadgeCheck size={scale(21)} color={colors.success} />
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const user = useAppSelector(state => state.auth.user);
  const logout = useAppLogout();

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
            Account
          </AppText>

          <AccountCard
            title="Email"
            description={
              user?.email
                ? `'${user.email}' is your email ID & recruiters will reach out to you here`
                : 'Add an email address so recruiters can reach you here'
            }
            value={user?.email ?? 'No email added'}
          />

          <AccountCard
            title="Mobile Number"
            description="Recruiters may reach out to you regarding jobs on this number"
            value={user?.phone ?? 'No mobile number added'}
          />

          <View style={[styles.card, styles.passwordCard]}>
            <AppText variant="bodyBold" style={styles.cardTitle}>
              Password
            </AppText>
            <Pressable
              onPress={() => navigation.navigate('ChangePassword')}
              accessibilityRole="button"
              accessibilityLabel="Change password"
              hitSlop={scale(8)}>
              <AppText variant="bodyBold" style={styles.changePassword}>
                Change password
              </AppText>
            </Pressable>
          </View>

          <View style={styles.actionCard}>
            <Pressable
              onPress={() => navigation.navigate('RaiseComplaint')}
              style={styles.actionRow}
              accessibilityRole="button"
              accessibilityLabel="Raise a complaint">
              <View style={styles.actionIcon}>
                <TriangleAlert size={scale(20)} color={colors.primary} />
              </View>
              <View style={styles.actionCopy}>
                <AppText variant="bodyBold" style={styles.actionTitle}>Raise a complaint</AppText>
                <AppText variant="caption" style={styles.actionDescription}>Get help from our support team</AppText>
              </View>
              <ChevronRight size={scale(20)} color={colors.textMuted} />
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable
              onPress={logout}
              style={styles.actionRow}
              accessibilityRole="button"
              accessibilityLabel="Logout">
              <View style={styles.actionIcon}>
                <LogOut size={scale(20)} color={colors.danger} />
              </View>
              <View style={styles.actionCopy}>
                <AppText variant="bodyBold" style={[styles.actionTitle, styles.logoutTitle]}>Logout</AppText>
                <AppText variant="caption" style={styles.actionDescription}>Sign out securely from this device</AppText>
              </View>
              <ChevronRight size={scale(20)} color={colors.textMuted} />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(24),
  },
  title: {
    marginTop: vs(12),
    marginBottom: vs(24),
    fontSize: font(26),
    lineHeight: vs(32),
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg + scale(4),
    padding: spacing.lg,
    marginBottom: vs(16),
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.06,
    shadowRadius: scale(14),
    elevation: 2,
  },
  cardTitle: {
    color: '#202433',
    fontSize: font(16),
    lineHeight: vs(22),
    fontWeight: '700',
  },
  cardDescription: {
    color: '#7C8498',
    fontSize: font(14),
    lineHeight: vs(19),
    marginTop: vs(2),
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: vs(22),
  },
  value: {
    flex: 1,
    color: colors.text,
    fontSize: font(15),
  },
  editIcon: {
    width: scale(26),
    height: scale(26),
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordCard: {
    minHeight: vs(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(2),
  },
  changePassword: {
    color: colors.info,
    fontSize: font(14),
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg + scale(4),
    marginTop: vs(2),
    overflow: 'hidden',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.06,
    shadowRadius: scale(14),
    elevation: 2,
  },
  actionRow: {
    minHeight: vs(72),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },
  actionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  actionCopy: { flex: 1, gap: vs(3) },
  actionTitle: { color: colors.text, fontSize: font(16), fontWeight: '700' },
  logoutTitle: { color: colors.danger },
  actionDescription: { color: colors.textSecondary, fontSize: font(13) },
  actionDivider: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + scale(56), backgroundColor: colors.border },
});
