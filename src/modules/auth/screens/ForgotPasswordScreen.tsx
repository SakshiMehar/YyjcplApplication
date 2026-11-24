import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react-native';
import { AppButton, AppInput } from '../../../components/common';
import { AuthScreenProps } from '../../../navigation/types';
import { colors, sizes, vs } from '../../../theme';
import { useForgotPasswordMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { backendErrorMessage } from '../hooks/useBackendLogin';
import { ForgotPasswordForm, forgotPasswordSchema } from '../schemas/auth.schema';

/** Forgot Password – email password-reset instructions to a registered user. */
export default function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      Alert.alert(
        'Check your email',
        'If this email is registered, password-reset instructions have been sent.',
        [{ text: 'Continue', onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }) }],
      );
    } catch (error) {
      Alert.alert('Could not send reset email', backendErrorMessage(error));
    }
  });

  return (
    <AuthFormLayout>
      <AuthHeader
        title="Forgot Password"
        subtitle={'Enter your registered email\nto receive reset instructions'}
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
            autoFocus
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<Mail size={sizes.iconSm} color={colors.textMuted} />}
          />
        )}
      />

      <AppButton title="Send reset link" onPress={onSubmit} loading={isLoading} style={styles.cta} />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: vs(8) },
});
