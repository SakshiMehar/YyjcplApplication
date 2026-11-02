import React from 'react';
import { Alert, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ILLUSTRATIONS } from '../../../assets/illustrations';
import { Mail, User as UserIcon } from 'lucide-react-native';
import { AppButton, AppInput, AppText, PasswordInput } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { BrandLogo, IllustrationSlot } from '../../../components/illustrations';
import { APP_NAME } from '../../../constants/app';
import { USER_ROLES } from '../../../constants/roles';
import { ScreenLayout } from '../../../layout';
import { AuthScreenProps } from '../../../navigation/types';
import { saveToken } from '../../../services/secureStorage';
import { clearSelectedRole, setCredentials } from '../../../store/slices/authSlice';
import { useAppDispatch } from '../../../store/hooks';
import { colors, gradients, radius, scale, sizes, spacing, vs } from '../../../theme';
import { usePasswordLoginMutation } from '../api/authApi';
import { backendErrorMessage } from '../hooks/useBackendLogin';
import { LoginForm, loginSchema, looksLikePhone } from '../schemas/auth.schema';

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
  const { width, height } = useWindowDimensions();
  const [passwordLogin, { isLoading }] = usePasswordLoginMutation();

  // responsive hero
  const heroH = Math.min(height * 0.4, vs(340)) + insets.top;
  const artSize = Math.min(width * 0.62, scale(300));
  const cardOverlap = vs(32);

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    const id = values.identifier.trim();
    const body = looksLikePhone(id)
      ? { mobile: `+91${id}`, password: values.password }
      : { email: id, password: values.password };
    try {
      // the response is printed to the terminal by the API layer (npm run logs)
      const { token, user } = await passwordLogin(body).unwrap();
      if (!token) {
        Alert.alert('Login failed', 'The server did not return a session token.');
        return;
      }
      if (__DEV__ && user.role === USER_ROLES.CANDIDATE) {
        console.log('[Auth] Job seeker token:', token);
      }
      await saveToken(token);
      dispatch(setCredentials({ token, user }));
    } catch (e) {
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
      edges={['bottom']}
      mainBackground={colors.background}>
      {isFocused ? <StatusBar barStyle="light-content" /> : null}

      {/* ---------- HERO ---------- */}
      <View style={[styles.hero, { height: heroH, paddingTop: insets.top + vs(18) }]}>
        <View style={[styles.bubble, styles.bubbleLarge]} />
        <View style={[styles.bubble, styles.bubbleSmall]} />

        <View style={styles.brandRow}>
          <BrandLogo size={scale(40)} variant="onDark" />
          <AppText variant="h3" color="textOnPrimary">
            {APP_NAME}
          </AppText>
        </View>

        {ILLUSTRATIONS.splash ? (
          <View style={[styles.heroArt, { bottom: cardOverlap - vs(6) }]}>
            <IllustrationSlot size={artSize} image={ILLUSTRATIONS.splash}>
              {null}
            </IllustrationSlot>
          </View>
        ) : null}
      </View>

      {/* ---------- CARD ---------- */}
      <View style={[styles.card, { marginTop: -cardOverlap }]}>
        <View style={styles.cardInner}>
          <View style={styles.handle} />

          <AppText variant="h3" style={styles.heading}>
            Login with your{' '}
            <AppText variant="h3" color="primary">
              mobile
            </AppText>{' '}
            or{' '}
            <AppText variant="h3" color="primary">
              email
            </AppText>{' '}
            to continue
          </AppText>

          <Controller
            control={control}
            name="identifier"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
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
                leftElement={
                  looksLikePhone(value) ? (
                    <View style={styles.codeChip}>
                      <AppText variant="bodyBold" color="primary">
                        +91
                      </AppText>
                    </View>
                  ) : value ? (
                    <Mail size={sizes.iconSm} color={colors.textMuted} />
                  ) : (
                    <UserIcon size={sizes.iconSm} color={colors.textMuted} />
                  )
                }
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur }, fieldState }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                textContentType="password"
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={scale(8)}
            style={styles.forgot}>
            <AppText variant="bodyBold" color="primary">
              Forgot Password?
            </AppText>
          </Pressable>

          <AppButton title="Login" onPress={onSubmit} loading={isLoading} style={styles.cta} />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <AppText variant="caption" color="textMuted">
              New to YYJCPL?
            </AppText>
            <View style={styles.line} />
          </View>

          <AppButton
            title="Create an account"
            variant="outline"
            onPress={onCreateAccount}
          />

          <View style={styles.spacer} />

          <AppText variant="caption" color="textMuted" align="center" style={styles.terms}>
            By continuing, you agree to our{' '}
            <AppText variant="caption" color="primary">
              Terms of Service
            </AppText>{' '}
            and{' '}
            <AppText variant="caption" color="primary">
              Privacy Policy
            </AppText>
          </AppText>
        </View>
      </View>
    </ScreenLayout>
  );
}

const BUBBLE_L = scale(220);
const BUBBLE_S = scale(110);

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.primary,
    backgroundImage: gradients.primary,
  },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  bubbleLarge: {
    width: BUBBLE_L,
    height: BUBBLE_L,
    borderRadius: BUBBLE_L / 2,
    top: -BUBBLE_L * 0.35,
    right: -BUBBLE_L * 0.3,
  },
  bubbleSmall: {
    width: BUBBLE_S,
    height: BUBBLE_S,
    borderRadius: BUBBLE_S / 2,
    bottom: vs(60),
    left: -BUBBLE_S * 0.4,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroArt: { position: 'absolute', alignSelf: 'center' },

  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    boxShadow: `0px -${scale(6)}px ${scale(18)}px rgba(120, 45, 0, 0.12)`,
  },
  cardInner: {
    flex: 1,
    width: '100%',
    maxWidth: scale(480),
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: vs(12),
    paddingBottom: vs(16),
  },
  handle: {
    alignSelf: 'center',
    width: scale(40),
    height: vs(4),
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: vs(20),
  },
  heading: { marginBottom: vs(24) },
  codeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  forgot: { alignSelf: 'flex-end', marginTop: -vs(6), marginBottom: vs(16) },
  cta: { marginTop: vs(4) },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: vs(20),
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  spacer: { flex: 1, minHeight: vs(16) },
  terms: { paddingHorizontal: spacing.lg },
});
