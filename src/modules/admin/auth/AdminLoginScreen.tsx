import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react-native';
import { AppInput, AppText, PasswordInput } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { BrandLogo } from '../../../components/illustrations';
import { APP_NAME } from '../../../constants/app';
import { USER_ROLES } from '../../../constants/roles';
import { AuthScreenProps } from '../../../navigation/types';
import { saveAuthSession } from '../../../services/secureStorage';
import { setCredentials } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hooks';
import { colors, gradients, radius, scale, sizes, spacing, vs } from '../../../theme';
import { User } from '../../../types/models';
import { DEV_ADMIN_ID, DEV_ADMIN_PASSWORD, DEV_TOKEN } from '../../../utils/dev';
import { usePasswordLoginMutation } from '../../auth/api/authApi';
import { backendErrorMessage } from '../../auth/hooks/useBackendLogin';
import { AdminLoginForm, adminLoginSchema, looksLikePhone } from '../../auth/schemas/auth.schema';

const AUTH_BUTTON_GRADIENT = 'linear-gradient(105deg, #FFA500 0%, #FF0050 100%)';

/**
 * Admin Login – opened from the "Admin Login" button at the bottom of the Login screen.
 * Admin ID (email / mobile) + password -> POST /api/auth/login. Only accounts whose
 * role is ADMIN are let into the admin panel.
 */
export default function AdminLoginScreen({ navigation }: AuthScreenProps<'AdminLogin'>) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [passwordLogin, { isLoading }] = usePasswordLoginMutation();
  const [brandName, ...brandSuffix] = APP_NAME.split(' ');

  const { control, handleSubmit } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { adminId: '', password: '' },
  });

  const enterPanel = async (token: string, user: User) => {
    await saveAuthSession(token, user);
    dispatch(setCredentials({ token, user }));
  };

  const onSubmit = handleSubmit(async ({ adminId, password }) => {
    const id = adminId.trim();

    // Debug builds only: demo admin so the panel can be reviewed without a backend admin account.
    if (__DEV__ && id.toLowerCase() === DEV_ADMIN_ID && password === DEV_ADMIN_PASSWORD) {
      await enterPanel(DEV_TOKEN, {
        id: 'dev-admin',
        role: USER_ROLES.ADMIN,
        name: 'Super Admin',
        phone: '',
        email: 'admin@yyjcpl.com',
        isVerified: true,
      });
      return;
    }

    const body = looksLikePhone(id) ? { mobile: `+91${id}`, password } : { email: id, password };
    try {
      const { token, user } = await passwordLogin(body).unwrap();
      if (user.role !== USER_ROLES.ADMIN) {
        Alert.alert('Access denied', 'This account does not have admin access.');
        return;
      }
      if (!token) {
        Alert.alert('Login failed', 'The server did not return a session token.');
        return;
      }
      await enterPanel(token, user);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      Alert.alert(
        'Login failed',
        status === 401 ? 'Incorrect admin ID or password.' : backendErrorMessage(e),
      );
    }
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(24) }]}>
          {/* ── Hero ── */}
          <View style={[styles.hero, { paddingTop: insets.top + vs(10) }]}>
            <View style={[styles.bubble, styles.bubbleLarge]} />
            <View style={[styles.bubble, styles.bubbleSmall]} />
            <Pressable
              onPress={navigation.goBack}
              hitSlop={scale(10)}
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              style={styles.back}>
              <ChevronLeft size={sizes.iconMd} color={colors.textOnPrimary} />
            </Pressable>

            <View style={styles.shield}>
              <ShieldCheck size={scale(40)} color={colors.primary} strokeWidth={2.2} />
            </View>
            <AppText variant="h2" color="textOnPrimary" align="center" style={styles.heroTitle}>
              Admin Panel
            </AppText>
            <AppText variant="caption" color="textOnPrimary" align="center" style={styles.heroSub}>
              Authorised YYJCPL staff only
            </AppText>
          </View>

          {/* ── Form card ── */}
          <View style={styles.card}>
            <View style={styles.brandRow}>
              <BrandLogo size={scale(34)} />
              <AppText variant="h3" style={styles.brandTitle}>
                {brandName}{' '}
                <AppText variant="h3" style={styles.brandAccent}>
                  {brandSuffix.join(' ')}
                </AppText>
              </AppText>
            </View>

            <AppText variant="h3" align="center" style={styles.heading}>
              Login with your{' '}
              <AppText variant="h3" style={styles.headingAccent}>
                admin ID
              </AppText>
            </AppText>

            <Controller
              control={control}
              name="adminId"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <View style={styles.inputRow}>
                  <View style={styles.iconBadge}>
                    <UserCog size={sizes.iconMd} color={colors.primary} />
                  </View>
                  <View style={styles.inputColumn}>
                    <AppInput
                      label="Admin ID"
                      placeholder="Enter admin ID or email"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={fieldState.error?.message}
                      wrapperStyle={styles.inputWrapper}
                      fieldStyle={styles.inputField}
                      style={styles.inputText}
                    />
                  </View>
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <View style={styles.inputRow}>
                  <View style={styles.iconBadge}>
                    <LockKeyhole size={sizes.iconMd} color={colors.primary} />
                  </View>
                  <View style={styles.inputColumn}>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={() => onSubmit()}
                      error={fieldState.error?.message}
                      leftElement={null}
                      wrapperStyle={styles.inputWrapper}
                      fieldStyle={styles.inputField}
                      style={styles.inputText}
                    />
                  </View>
                </View>
              )}
            />

            <Pressable
              onPress={() => onSubmit()}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Login as admin"
              style={({ pressed }) => [
                styles.cta,
                pressed && styles.ctaPressed,
                isLoading && styles.disabled,
              ]}>
              {isLoading ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <>
                  <AppText variant="button" color="textOnPrimary" style={styles.ctaText}>
                    Login as Admin
                  </AppText>
                  <View style={styles.arrowCircle}>
                    <ChevronRight size={sizes.iconMd} color={colors.danger} strokeWidth={3} />
                  </View>
                </>
              )}
            </Pressable>

            <View style={styles.noteRow}>
              <LockKeyhole size={scale(13)} color={colors.textMuted} />
              <AppText variant="caption" color="textMuted" style={styles.note}>
                Admin access is monitored. Do not share your credentials.
              </AppText>
            </View>
          </View>

          <Pressable onPress={navigation.goBack} accessibilityRole="button" style={styles.backLink}>
            <AppText variant="bodyBold" style={styles.headingAccent}>
              ← Back to user login
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const BUBBLE = scale(180);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: vs(70),
    backgroundColor: colors.primary,
    backgroundImage: gradients.primary,
    borderBottomLeftRadius: scale(36),
    borderBottomRightRadius: scale(36),
    overflow: 'hidden',
  },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  bubbleLarge: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    top: -BUBBLE * 0.35,
    right: -BUBBLE * 0.3,
  },
  bubbleSmall: {
    width: BUBBLE * 0.55,
    height: BUBBLE * 0.55,
    borderRadius: BUBBLE * 0.275,
    bottom: -BUBBLE * 0.1,
    left: -BUBBLE * 0.15,
  },
  back: {
    alignSelf: 'flex-start',
    marginLeft: spacing.lg,
    width: scale(38),
    height: scale(38),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    marginTop: vs(6),
    width: scale(78),
    height: scale(78),
    borderRadius: scale(39),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0px ${scale(6)}px ${scale(16)}px rgba(115, 47, 0, 0.25)`,
  },
  heroTitle: { marginTop: vs(12), fontWeight: '800' },
  heroSub: { marginTop: vs(2), opacity: 0.92 },
  card: {
    marginTop: -vs(48),
    marginHorizontal: scale(14),
    padding: spacing.xl,
    paddingTop: vs(18),
    borderRadius: scale(28),
    backgroundColor: colors.background,
    boxShadow: `0px ${scale(6)}px ${scale(20)}px rgba(91, 77, 158, 0.14)`,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: vs(10),
  },
  brandTitle: { color: '#1554B5', fontWeight: '800' },
  brandAccent: { color: '#FF6500', fontWeight: '800' },
  heading: {
    color: '#192459',
    fontSize: scale(16),
    lineHeight: vs(20),
    marginBottom: vs(14),
    fontWeight: '700',
  },
  headingAccent: { color: '#F66A00', fontSize: scale(16), lineHeight: vs(20), fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: vs(8) },
  iconBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,111,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputColumn: { flex: 1 },
  inputWrapper: { marginBottom: 0 },
  inputField: {
    height: vs(44),
    borderRadius: radius.pill,
    borderColor: '#E1DFEA',
    backgroundColor: 'rgba(247,246,251,0.9)',
    paddingHorizontal: spacing.sm,
  },
  inputText: { fontSize: scale(14) },
  cta: {
    marginTop: vs(14),
    width: '92%',
    alignSelf: 'center',
    height: vs(48),
    borderRadius: radius.pill,
    backgroundImage: AUTH_BUTTON_GRADIENT,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    boxShadow: `0px ${scale(6)}px ${scale(14)}px rgba(255, 91, 0, 0.3)`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.7 },
  ctaText: { fontWeight: '700', fontSize: scale(17) },
  arrowCircle: {
    position: 'absolute',
    right: spacing.md,
    width: scale(30),
    height: scale(30),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: vs(14),
  },
  note: { flexShrink: 1 },
  backLink: { alignSelf: 'center', marginTop: vs(20), padding: spacing.sm },
});
