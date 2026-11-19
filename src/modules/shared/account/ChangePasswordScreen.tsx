import React from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { AppButton, AppText, PasswordInput } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { SharedRoutes } from '../../../navigation/types';
import { useChangePasswordMutation } from '../../auth/api/authApi';
import {
  ChangePasswordForm,
  changePasswordSchema,
} from '../../auth/schemas/auth.schema';
import { colors, font, scale, spacing, vs } from '../../../theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

function getErrorMessage(error: unknown): string {
  const response = error as { data?: { message?: string; error?: string } };
  return response.data?.message ?? response.data?.error ?? 'Please check your current password and try again.';
}

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NavigationProp<SharedRoutes>>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { control, handleSubmit } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '' },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await changePassword(values).unwrap();
      Alert.alert('Password updated', 'Your password has been changed.', [
        { text: 'OK', onPress: navigation.goBack },
      ]);
    } catch (error) {
      Alert.alert('Could not change password', getErrorMessage(error));
    }
  });

  return (
    <ScreenLayout
      showHeader={false}
      padded={false}
      scroll={false}
      mainBackground="transparent"
      footer={<AppButton title="Save" onPress={onSubmit} loading={isLoading} style={styles.saveButton} />}>
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AppText variant="h1" style={styles.title}>
            Change password
          </AppText>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="oldPassword"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <PasswordInput
                  placeholder="Old password"
                  textContentType="password"
                  autoComplete="current-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <PasswordInput
                  placeholder="New password"
                  textContentType="newPassword"
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                  hint="At least 8 characters, with a letter and a number"
                />
              )}
            />
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(24),
  },
  title: {
    marginTop: vs(20),
    marginBottom: vs(24),
    fontSize: font(26),
    lineHeight: vs(32),
    fontWeight: '700',
    color: colors.text,
  },
  fields: { gap: vs(18) },
  saveButton: {
    flex: 1,
    marginHorizontal: spacing.lg,
  },
});
