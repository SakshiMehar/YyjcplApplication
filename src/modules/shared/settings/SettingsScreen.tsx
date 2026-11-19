import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleX,
  LockKeyhole,
  UserRound,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { colors, font, scale, spacing, vs } from '../../../theme';
import { SharedRoutes } from '../../../navigation/types';
import { useAppSelector } from '../../../store/hooks';
import { USER_ROLES } from '../../../constants/roles';

const settingsItems = [
  {
    icon: <LockKeyhole size={scale(20)} color={colors.text} />,
    title: 'Communication & privacy',
    description: 'Control the visibility of your profile to recruiters & companies',
    candidateOnly: true,
  },
  {
    icon: <UserRound size={scale(20)} color={colors.text} />,
    title: 'Account',
    description: 'Change your primary email, mobile number or password',
    candidateOnly: false,
  },
  {
    icon: <BriefcaseBusiness size={scale(20)} color={colors.text} />,
    title: 'Career preferences',
    description: 'Get job recommendations based on your career preferences',
    candidateOnly: true,
  },
  {
    icon: <CircleX size={scale(20)} color={colors.text} />,
    title: 'Blocked companies',
    description: 'Choose the companies you do not want to show your profile to',
    candidateOnly: true,
  },
  {
    icon: <CircleX size={scale(20)} color={colors.text} />,
    title: 'Blocked job seekers',
    description: 'Job seekers you block cannot see your listings or apply',
    candidateOnly: false,
    recruiterOnly: true,
  },
];

function SettingsRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.rowText}>
        <AppText variant="bodyBold" style={styles.rowTitle}>
          {title}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.rowDescription}>
          {description}
        </AppText>
      </View>
      <ChevronRight size={scale(22)} color={colors.text} />
    </>
  );
  const rowStyle = styles.row;

  return onPress ? (
    <Pressable
      style={rowStyle}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}>
      {content}
    </Pressable>
  ) : (
    <View style={rowStyle} accessibilityLabel={`${title}. ${description}`}>
      {content}
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const userRole = useAppSelector(state => state.auth.user?.role);

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
            Settings
          </AppText>
          {settingsItems
            .filter(item => {
              if (item.candidateOnly && userRole !== USER_ROLES.CANDIDATE) return false;
              if (item.recruiterOnly && userRole === USER_ROLES.CANDIDATE) return false;
              return true;
            })
            .map(item => (
              <SettingsRow
                key={item.title}
                {...item}
                onPress={
                  item.title === 'Account'
                    ? () => navigation.navigate('Account')
                    : item.title === 'Career preferences'
                      ? () => navigation.navigate('CareerPreferences')
                      : item.title === 'Communication & privacy'
                        ? () => navigation.navigate('CommunicationPrivacy')
                        : item.title === 'Blocked companies'
                          ? () => navigation.navigate('BlockedCompanies')
                          : item.title === 'Blocked job seekers'
                            ? () => navigation.navigate('BlockedCompanies')
                            : undefined
                }
              />
            ))}
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
    marginTop: vs(22),
    marginBottom: vs(14),
    fontSize: font(26),
    lineHeight: vs(32),
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    minHeight: vs(72),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F8',
  },
  rowText: { flex: 1, gap: vs(3) },
  rowTitle: {
    color: colors.text,
    fontSize: font(16),
    lineHeight: vs(22),
    fontWeight: '700',
  },
  rowDescription: {
    color: '#7C8498',
    fontSize: font(14),
    lineHeight: vs(19),
  },
});
