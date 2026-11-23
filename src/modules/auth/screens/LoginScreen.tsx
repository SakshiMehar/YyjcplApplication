import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, LockKeyhole, ShieldCheck, Smartphone, UserPlus } from 'lucide-react-native';
import { AppInput, AppText, PasswordInput } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { BrandLogo } from '../../../components/illustrations';
import { Appear, Floating } from '../../../components/animated';
import { APP_NAME, APP_TAGLINE } from '../../../constants/app';
import { USER_ROLES } from '../../../constants/roles';
import { ScreenLayout } from '../../../layout';
import { AuthScreenProps } from '../../../navigation/types';
import { User } from '../../../types/models';
import {
  clearDeactivatedAccountMarker,
  getDeactivatedAccountId,
  saveAuthSession,
} from '../../../services/secureStorage';
import { getFcmLoginFields } from '../../../services/firebase/messaging';
import { clearSelectedRole, setCredentials } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hooks';
import { colors, glass, radius, scale, shadows, sizes, spacing, vs } from '../../../theme';
import { usePasswordLoginMutation, useReactivateAccountMutation } from '../api/authApi';
import { backendErrorMessage } from '../hooks/useBackendLogin';
import { LoginForm, loginSchema, looksLikePhone } from '../schemas/auth.schema';

const AUTH_BUTTON_GRADIENT = 'linear-gradient(105deg, #FFA500 0%, #FF0050 100%)';

/**
 * Login
 *  HEADER: orange gradient hero (logo + characters)
 *  MAIN:   white card sliding over the hero with the form
 *
 * Mobile number or email (as given at sign-up) + password -> POST /api/auth/login.
 */
export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [passwordLogin, { isLoading }] = usePasswordLoginMutation();
  const [reactivateAccount, { isLoading: isReactivating }] = useReactivateAccountMutation();

  const cardTop = height * 0.46;
  const termsBottom = Math.max(insets.bottom + vs(4), vs(10));
  // leaves room under the card for the "Admin Login" button + terms line
  const cardBottom = Math.max(insets.bottom + vs(80), height * 0.105);
  const [brandName, ...brandSuffix] = APP_NAME.split(' ');

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const completeLogin = async (token: string, user: User) => {
    if (!token) {
      Alert.alert('Login failed', 'The server did not return a session token.');
      return;
    }
    if (__DEV__ && user.role === USER_ROLES.CANDIDATE) {
      console.log('[Auth] Job seeker token:', token);
    }
    await saveAuthSession(token, user);
    dispatch(setCredentials({ token, user }));
  };

  const isDeactivatedLoginError = (error: unknown) => {
    const apiError = error as {
      status?: number;
      data?: unknown;
    };
    const detail = typeof apiError.data === 'string'
      ? apiError.data
      : JSON.stringify(apiError.data ?? '');
    // Login endpoints commonly use 403/423 for a disabled account. Password
    // failures remain 401, so they continue to show the normal login error.
    return (
      apiError.status === 403 ||
      apiError.status === 423 ||
      detail.toLowerCase().includes('deactivat') ||
      detail.toLowerCase().includes('inactive')
    );
  };

  const confirmReactivation = (token?: string, onReactivated?: () => Promise<void>) => {
    Alert.alert(
      'Reactivate account?',
      'Do you want to reactivate your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await reactivateAccount(token ? { token } : undefined).unwrap();
              if (onReactivated) {
                await onReactivated();
              } else {
                Alert.alert('Account reactivated', 'Your account is active. Please log in again.');
              }
            } catch (error) {
              Alert.alert('Unable to reactivate account', backendErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  const onSubmit = handleSubmit(async values => {
    const id = values.identifier.trim();
    const isPhoneLogin = looksLikePhone(id);
    const body = isPhoneLogin
      ? { mobile: `+91${id}`, password: values.password }
      : { email: id, password: values.password };
    const loginAccountMarker = isPhoneLogin
      ? `phone:${id.replace(/\D/g, '').slice(-10)}`
      : `email:${id.toLowerCase()}`;
    try {
      const fcmFields = await getFcmLoginFields();
      // the response is printed to the terminal by the API layer (npm run logs)
      const { token, user, accountDeactivated } = await passwordLogin({ ...body, ...fcmFields }).unwrap();
      const deactivatedAccountId = await getDeactivatedAccountId();
      // Older app versions stored the backend's internal user ID. That ID is
      // not always present in a subsequent login response, but its presence
      // still means this device has a pending deactivated-account reactivation.
      const hasLegacyDeactivationMarker = Boolean(
        deactivatedAccountId &&
        !deactivatedAccountId.startsWith('email:') &&
        !deactivatedAccountId.startsWith('phone:'),
      );
      const needsReactivation =
        accountDeactivated ||
        deactivatedAccountId === loginAccountMarker ||
        deactivatedAccountId === user.id ||
        hasLegacyDeactivationMarker;
      if (needsReactivation) {
        confirmReactivation(token, async () => {
          await clearDeactivatedAccountMarker();
          if (token) await completeLogin(token, user);
          else Alert.alert('Account reactivated', 'Your account is active. Please log in again.');
        });
        return;
      }
      await completeLogin(token, user);
    } catch (e) {
      if (isDeactivatedLoginError(e)) {
        const errorData = (e as {
          data?: { token?: string; accessToken?: string; data?: { token?: string; accessToken?: string } };
        }).data;
        confirmReactivation(
          errorData?.token ??
          errorData?.accessToken ??
          errorData?.data?.token ??
          errorData?.data?.accessToken,
        );
        return;
      }
      const status = (e as { status?: number })?.status;
      Alert.alert(
        'Login failed',
        status === 401 && !(e as { data?: { message?: string } })?.data?.message
          ? 'Incorrect mobile number / email or password.'
          : backendErrorMessage(e),
      );
    }
  });

  const onCreateAccount = () => {
    dispatch(clearSelectedRole());
    navigation.navigate('RoleSelect');
  };

  return (
    <ScreenLayout
      showHeader={false}
      padded={false}
      edges={[]}
      mainBackground={colors.transparent}
      rootStyle={styles.root}>
      {isFocused ? (
        <StatusBar barStyle="dark-content" />
      ) : null}

      <ImageBackground
        source={require('../../../assets/illustrations/login backimg.png')}
        resizeMode="stretch"
        style={[styles.background, { height }]}>
        <View style={styles.page}>
          <View style={[styles.brandRow, { top: insets.top + vs(26) }]}>
            <BrandLogo size={scale(52)} />
            <View style={styles.brandDivider} />
            <View>
              <AppText variant="h2" style={styles.brandTitle}>
                {brandName}{' '}
                <AppText variant="h2" style={styles.brandAccent}>
                  {brandSuffix.join(' ')}
                </AppText>
              </AppText>
              <AppText variant="caption" style={styles.tagline}>
                {APP_TAGLINE}
              </AppText>
            </View>
          </View>

          <Floating distance={5} style={styles.heroArtWrap}>
            <Image
              source={require('../../../assets/illustrations/splash-duo.png')}
              resizeMode="contain"
              style={styles.heroArt}
              accessibilityLabel="YYJCPL Jobs candidates"
            />
          </Floating>

          <Appear delay={80} style={[styles.card, { top: cardTop, bottom: cardBottom }]}>
            <View style={styles.cardInner}>
              <AppText variant="h3" align="center" style={styles.heading}>
                Login with your{' '}
                <AppText variant="h3" style={styles.headingAccent}>
                  mobile
                </AppText>{' '}
                or{' '}
                <AppText variant="h3" style={styles.headingAccent}>
                  email
                </AppText>{' '}
                to continue
              </AppText>

              <Controller
                control={control}
                name="identifier"
                render={({ field: { value, onChange, onBlur }, fieldState }) => (
                  <View style={styles.inputRow}>
                    <View style={styles.iconBadge}>
                      <Smartphone size={sizes.iconMd} color={colors.primary} />
                    </View>
                    <View style={styles.inputColumn}>
                      <AppInput
                        label="Mobile Number or Email"
                        placeholder="Enter mobile number or email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        maxLength={looksLikePhone(value) ? 10 : 100}
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
                        textContentType="password"
                        autoComplete="password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
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
                onPress={() => navigation.navigate('ForgotPassword')}
                hitSlop={scale(8)}
                accessibilityRole="button"
                style={styles.forgot}>
                <AppText variant="bodyBold" style={styles.headingAccent}>
                  Forgot Password?
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => onSubmit()}
                disabled={isLoading || isReactivating}
                accessibilityRole="button"
                accessibilityLabel="Login"
                style={({ pressed }) => [
                  styles.cta,
                  pressed && styles.ctaPressed,
                  (isLoading || isReactivating) && styles.disabled,
                ]}>
                {isLoading || isReactivating ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <>
                    <AppText variant="button" color="textOnPrimary" style={styles.ctaText}>
                      Login
                    </AppText>
                    <View style={styles.arrowCircle}>
                      <ChevronRight size={sizes.iconMd} color={colors.danger} strokeWidth={3} />
                    </View>
                  </>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <AppText variant="caption" style={styles.newAccountText}>
                  New to YYJCPL?
                </AppText>
                <View style={styles.line} />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onCreateAccount}
                style={({ pressed }) => [
                  styles.createAccount,
                  pressed && styles.createAccountPressed,
                ]}>
                {({ pressed }) => (
                  <>
                    <UserPlus
                      size={sizes.iconMd}
                      color={pressed ? colors.textOnPrimary : colors.primary}
                    />
                    <AppText
                      variant="button"
                      color={pressed ? 'textOnPrimary' : 'primary'}
                      style={styles.createAccountText}>
                      Create an account
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </Appear>

          <View style={[styles.adminRow, { bottom: termsBottom + vs(22) }]}>
            <Pressable
              onPress={() => navigation.navigate('AdminLogin')}
              accessibilityRole="button"
              accessibilityLabel="Admin login"
              hitSlop={scale(6)}
              style={({ pressed }) => [styles.adminButton, pressed && styles.adminButtonPressed]}>
              <ShieldCheck size={scale(15)} color={colors.primary} strokeWidth={2.4} />
              <AppText variant="caption" style={styles.adminButtonText}>
                Admin Login
              </AppText>
            </Pressable>
          </View>

          <AppText
            variant="caption"
            color="textOnPrimary"
            align="center"
            style={[styles.terms, { bottom: termsBottom }]}>
            By continuing, you agree to our{' '}
            <AppText variant="caption" color="textOnPrimary" style={styles.termsLink}>
              Terms of Service
            </AppText>{' '}
            and{' '}
            <AppText variant="caption" color="textOnPrimary" style={styles.termsLink}>
              Privacy Policy
            </AppText>
          </AppText>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.transparent },
  background: { width: '100%' },
  page: { flex: 1, position: 'relative' },
  brandRow: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  brandDivider: { width: scale(1.5), height: scale(54), backgroundColor: '#24336F' },
  brandTitle: { color: '#1554B5', fontWeight: '800' },
  brandAccent: { color: '#FF6500', fontWeight: '800' },
  tagline: { color: '#1C2C65', fontStyle: 'italic', fontWeight: '600', marginTop: vs(2) },
  heroArtWrap: {
    position: 'absolute',
    top: '13%',
    width: '96%',
    height: '36%',
    alignSelf: 'center',
  },
  heroArt: { width: '100%', height: '100%' },
  card: {
    position: 'absolute',
    left: scale(12),
    right: scale(12),
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    backgroundImage: glass.light.backgroundImage,
    borderWidth: 1,
    borderColor: glass.light.borderColor,
    borderTopLeftRadius: scale(34),
    borderTopRightRadius: scale(34),
    borderBottomLeftRadius: scale(48),
    borderBottomRightRadius: scale(48),
    boxShadow: `0px -${scale(5)}px ${scale(18)}px rgba(91, 77, 158, 0.16), ${shadows.innerHighlight}`,
  },
  cardInner: {
    flex: 1,
    width: '100%',
    maxWidth: scale(480),
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: vs(14),
    paddingBottom: vs(8),
  },
  heading: {
    color: '#192459',
    fontSize: scale(16),
    lineHeight: vs(20),
    marginBottom: vs(10),
    fontWeight: '700',
  },
  headingAccent: {
    color: '#F66A00',
    fontSize: scale(16),
    lineHeight: vs(20),
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: vs(4),
  },
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
    height: vs(42),
    borderRadius: radius.pill,
    borderColor: '#E1DFEA',
    backgroundColor: 'rgba(247,246,251,0.9)',
    paddingHorizontal: spacing.sm,
  },
  inputText: { fontSize: scale(14) },
  forgot: { alignSelf: 'flex-end', marginTop: -vs(2), marginBottom: vs(7) },
  cta: {
    width: '92%',
    alignSelf: 'center',
    height: vs(46),
    borderRadius: radius.pill,
    backgroundImage: AUTH_BUTTON_GRADIENT,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    boxShadow: `0px ${scale(6)}px ${scale(14)}px rgba(255, 91, 0, 0.3)`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ctaPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.7 },
  ctaText: { fontWeight: '700', fontSize: scale(18) },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: vs(8),
  },
  line: { flex: 1, height: 1, backgroundColor: '#D9D7E2' },
  newAccountText: { color: '#68677A', fontSize: scale(14) },
  createAccount: {
    width: '92%',
    alignSelf: 'center',
    height: vs(40),
    borderWidth: 1.5,
    borderColor: '#FF6A00',
    borderRadius: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  createAccountPressed: {
    backgroundImage: AUTH_BUTTON_GRADIENT,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  createAccountText: { color: '#F65F00', fontWeight: '700', fontSize: scale(15) },
  adminRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
    alignItems: 'center',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    height: vs(30),
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.35)',
    boxShadow: `0px ${scale(3)}px ${scale(8)}px rgba(115, 47, 0, 0.18)`,
  },
  adminButtonPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  adminButtonText: { color: '#F65F00', fontWeight: '700', fontSize: scale(12.5) },
  terms: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 3,
    fontSize: scale(10),
    textShadowColor: 'rgba(115, 47, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  termsLink: { textDecorationLine: 'underline' },
});
