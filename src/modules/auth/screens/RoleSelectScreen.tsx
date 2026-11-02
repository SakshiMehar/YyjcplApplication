import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ROLE_AVATARS } from '../../../assets/illustrations';
import { AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { APP_NAME } from '../../../constants/app';
import { USER_ROLES, UserRole } from '../../../constants/roles';
import { AuthScreenProps } from '../../../navigation/types';
import { setSelectedRole } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hooks';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';

const ROLES: { role: UserRole; title: string; subtitle: string }[] = [
  { role: USER_ROLES.CANDIDATE, title: 'Job Seeker', subtitle: 'Find jobs & grow\nyour career' },
  { role: USER_ROLES.RECRUITER, title: 'Recruiter', subtitle: 'Hire talent for\nyour company' },
];

/** Select Your Role – shown after "Create an account", before registration. */
export default function RoleSelectScreen({ navigation }: AuthScreenProps<'RoleSelect'>) {
  const dispatch = useAppDispatch();

  const onSelect = (role: UserRole) => {
    dispatch(setSelectedRole(role));
    navigation.navigate('Register');
  };

  return (
    <AuthFormLayout>
      <AuthHeader title="Select Your Role" subtitle={`Choose how you want to use ${APP_NAME}`} />

      {ROLES.map(item => (
        <Pressable
          key={item.role}
          onPress={() => onSelect(item.role)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.subtitle.replace('\n', ' ')}`}>
          <View style={styles.avatarWrap}>
            <Image source={ROLE_AVATARS[item.role]} style={styles.avatar} />
          </View>
          <View style={styles.text}>
            <AppText variant="h3">{item.title}</AppText>
            <AppText color="textSecondary" style={styles.subtitle}>
              {item.subtitle}
            </AppText>
          </View>
          <View style={styles.chevron}>
            <ChevronRight size={scale(18)} color={colors.primary} strokeWidth={2.5} />
          </View>
        </Pressable>
      ))}
    </AuthFormLayout>
  );
}

const AVATAR = scale(72);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: vs(16),
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    boxShadow: `0px ${scale(4)}px ${scale(14)}px rgba(28, 25, 23, 0.06)`,
  },
  cardPressed: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  avatar: { width: '100%', height: '100%' },
  text: { flex: 1 },
  subtitle: { marginTop: vs(2) },
  chevron: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
});
