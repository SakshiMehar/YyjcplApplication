import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Mail } from 'lucide-react-native';
import { AppButton, AppInput, PasswordInput } from '../../../components/common';
import { AuthScreenProps } from '../../../navigation/types';
import { colors, sizes, vs } from '../../../theme';
import { useResetPasswordMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { backendErrorMessage } from '../hooks/useBackendLogin';
import { ResetPasswordForm, resetPasswordSchema } from '../schemas/auth.schema';

/** Reset Password – verifies the emailed OTP and saves a new password. */
export default function ResetPasswordScreen({ navigation, route }: AuthScreenProps<'ResetPassword'>) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const { control, handleSubmit } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: route.params.email ?? '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const done = () =>
    Alert.alert('Password updated', 'You can now login with your new password.', [
      { text: 'Login', onPress: () => navigation.popTo('Login') },
    ]);

  const onSubmit = handleSubmit(async ({ email, otp, newPassword }) => {
    try {
      await resetPassword({ email: email.trim(), otp, newPassword }).unwrap();
      done();
    } catch (error) {
      Alert.alert('Could not update password', backendErrorMessage(error));
    }
  });

  return (
    <AuthFormLayout>
      <AuthHeader
        title="Set New Password"
        subtitle={'Enter the code sent to your email\nand create a new password'}
        align="left"
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<Mail size={sizes.iconSm} color={colors.textMuted} />}
          />
        )}
      />
      <Controller
        control={control}
        name="otp"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="6-digit OTP"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<KeyRound size={sizes.iconSm} color={colors.textMuted} />}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <PasswordInput
            placeholder="New Password"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            hint="At least 8 characters, with a letter and a number"
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <PasswordInput
            placeholder="Confirm Password"
            textContentType="newPassword"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <AppButton title="Update Password" onPress={onSubmit} loading={isLoading} style={styles.cta} />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: vs(8) },
});
