import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, Smartphone, User as UserIcon } from 'lucide-react-native';
import { AppButton, AppInput, AppText, PasswordInput } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { APP_NAME } from '../../../constants/app';
import { toApiRole, USER_ROLES } from '../../../constants/roles';
import { AuthScreenProps } from '../../../navigation/types';
import { savePendingCompany } from '../../../services/secureStorage';
import { useAppSelector } from '../../../store/hooks';
import { colors, radius, scale, sizes, spacing, vs } from '../../../theme';
import { useRegisterMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { RegisterForm, recruiterRegisterSchema, registerSchema } from '../schemas/auth.schema';

const iconProps = { size: sizes.iconSm, color: colors.textMuted };

/** Readable message from an RTK Query error returned by the register API. */
function registerErrorMessage(error: unknown): string {
  const e = error as { status?: number | string; data?: { message?: string; error?: string } };
  if (e?.status === 'FETCH_ERROR' || e?.status === 'TIMEOUT_ERROR') {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  return e?.data?.message ?? e?.data?.error ?? 'Please check your details and try again.';
}

/** Create Account – POST /api/auth/register → 201 → back to Login. */
export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const role = useAppSelector(s => s.auth.selectedRole) ?? USER_ROLES.CANDIDATE;
  const isRecruiter = role === USER_ROLES.RECRUITER;
  const [register, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(isRecruiter ? recruiterRegisterSchema : registerSchema),
    defaultValues: { fullName: '', companyName: '', phone: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      // the response is printed to the terminal by the API layer (npm run logs)
      const user = await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        mobile: `+91${values.phone}`,
        password: values.password,
        role: toApiRole(role),
        ...(isRecruiter ? { companyName: values.companyName.trim() } : {}),
      }).unwrap();

      // sent to PUT /api/recruiter/profile after the first login (no token yet)
      if (isRecruiter) {
        await savePendingCompany(values.phone, values.companyName.trim()).catch(() => {});
      }

      Alert.alert('Account created', `Welcome, ${user.fullName}! Please login to continue.`, [
        { text: 'Login', onPress: () => navigation.popTo('Login') },
      ]);
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 409) {
        Alert.alert('Account already exists', registerErrorMessage(e), [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.popTo('Login') },
        ]);
      } else {
        Alert.alert('Could not create account', registerErrorMessage(e));
      }
    }
  });

  return (
    <AuthFormLayout>
      <AuthHeader title="Create Account" subtitle={`Join ${APP_NAME} today`} align="left" />

      {/* chosen role, with a way back to change it */}
      <View style={styles.roleRow}>
        <View style={styles.roleChip}>
          <AppText variant="caption" color="primary" style={styles.roleText}>
            {isRecruiter ? 'Recruiter' : 'Job Seeker'}
          </AppText>
        </View>
        <Pressable onPress={() => navigation.goBack()} hitSlop={scale(8)}>
          <AppText variant="caption" color="textSecondary" style={styles.change}>
            Change
          </AppText>
        </Pressable>
      </View>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="Full Name"
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<UserIcon {...iconProps} />}
          />
        )}
      />
      {isRecruiter ? (
        <Controller
          control={control}
          name="companyName"
          render={({ field: { value, onChange, onBlur }, fieldState }) => (
            <AppInput
              placeholder="Company Name"
              autoCapitalize="words"
              textContentType="organizationName"
              autoComplete="organization"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftElement={<Building2 {...iconProps} />}
            />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="Mobile Number"
            keyboardType="number-pad"
            maxLength={10}
            textContentType="telephoneNumber"
            autoComplete="tel"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<Smartphone {...iconProps} />}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<Mail {...iconProps} />}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <PasswordInput
            placeholder="Password"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            hint="At least 8 characters, with a letter and a number"
          />
        )}
      />

      <AppButton title="Sign Up" onPress={onSubmit} loading={isLoading} style={styles.cta} />

      <View style={styles.loginRow}>
        <AppText color="textSecondary">Already have an account? </AppText>
        <Pressable onPress={() => navigation.popTo('Login')} hitSlop={scale(8)}>
          <AppText variant="bodyBold" color="primary">
            Login
          </AppText>
        </Pressable>
      </View>
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -vs(14),
    marginBottom: vs(20),
  },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(4),
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  roleText: { fontWeight: '600' },
  change: { textDecorationLine: 'underline' },
  cta: { marginTop: vs(8) },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(24),
  },
});
