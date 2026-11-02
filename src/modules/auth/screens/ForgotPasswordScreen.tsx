import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone } from 'lucide-react-native';
import { AppButton, AppInput } from '../../../components/common';
import { AuthScreenProps } from '../../../navigation/types';
import { colors, sizes, vs } from '../../../theme';
import { DEV_NO_BACKEND, DEV_REQUEST_ID } from '../../../utils/dev';
import { useForgotPasswordMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { ForgotPasswordForm, forgotPasswordSchema } from '../schemas/auth.schema';

/** Forgot Password – mobile number → OTP → Reset Password. */
export default function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = handleSubmit(async ({ phone }) => {
    try {
      const { requestId } = await forgotPassword({ phone }).unwrap();
      navigation.navigate('Otp', { phone, requestId, purpose: 'reset' });
    } catch {
      if (DEV_NO_BACKEND) {
        navigation.navigate('Otp', { phone, requestId: DEV_REQUEST_ID, purpose: 'reset' });
        return;
      }
      Alert.alert('Could not send OTP', 'Please check the number and try again.');
    }
  });

  return (
    <AuthFormLayout>
      <AuthHeader
        title="Forgot Password"
        subtitle={'Enter your mobile number\nto receive OTP'}
        align="left"
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur }, fieldState }) => (
          <AppInput
            placeholder="Mobile Number"
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            leftElement={<Smartphone size={sizes.iconSm} color={colors.textMuted} />}
          />
        )}
      />

      <AppButton title="Send OTP" onPress={onSubmit} loading={isLoading} style={styles.cta} />
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: vs(8) },
});
