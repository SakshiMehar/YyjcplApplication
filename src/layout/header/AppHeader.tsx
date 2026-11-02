import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from '../../components/common';
import Pressable from '../../components/common/InteractivePressable';
import { colors, scale, sizes, spacing } from '../../theme';

export type AppHeaderProps = {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export default function AppHeader({ title, showBack, right }: AppHeaderProps) {
  const navigation = useNavigation();
  const canGoBack = showBack ?? navigation.canGoBack();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {canGoBack ? (
          <Pressable onPress={navigation.goBack} hitSlop={scale(10)}>
            <AppText variant="h3" color="primary">
              {'‹'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <AppText variant="h3" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: { width: scale(40) },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
