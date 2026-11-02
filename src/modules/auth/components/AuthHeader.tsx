import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { colors, radius, scale, spacing, vs } from '../../../theme';

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
};

/** Back button + title + subtitle used on OTP, role, registration and password screens. */
export default function AuthHeader({ title, subtitle, align = 'center' }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrap}>
      {navigation.canGoBack() ? (
        <Pressable
          onPress={navigation.goBack}
          hitSlop={scale(8)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={scale(22)} color={colors.primary} strokeWidth={2.5} />
        </Pressable>
      ) : null}
      <AppText variant="h2" align={align}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText color="textSecondary" align={align} style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const BACK = scale(40);

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(28) },
  back: {
    width: BACK,
    height: BACK,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginBottom: vs(24),
  },
  pressed: { opacity: 0.7 },
  subtitle: { marginTop: spacing.xs },
});
