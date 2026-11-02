import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton, PasswordInput } from '../../../components/common';
import { AuthScreenProps } from '../../../navigation/types';
import { vs } from '../../../theme';
import { DEV_NO_BACKEND } from '../../../utils/dev';
import { useResetPasswordMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { ResetPasswordForm, resetPasswordSchema } from '../schemas/auth.schema';

/** Reset Password – shown after the forgot-password OTP is verified. */
export default function ResetPasswordScreen({ navigation, route }: AuthScreenProps<'ResetPassword'>) {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const { control, handleSubmit } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const done = () =>
    Alert.alert('Password updated', 'You can now login with your new password.', [
      { text: 'Login', onPress: () => navigation.popTo('Login') },
    ]);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      await resetPassword({ resetToken: route.params.resetToken, password }).unwrap();
      done();
    } catch {
      if (DEV_NO_BACKEND) {
        done();
        return;
      }
      Alert.alert('Could not update password', 'Please try again.');
    }
  });

  return (
    <AuthFormLayout>
      <AuthHeader
        title="Set New Password"
        subtitle="Create a strong password for your account"
        align="left"
      />

      <Controller
        control={control}
        name="password"
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
