import React from 'react';
import { StyleSheet, View } from 'react-native';
import { scale, vs } from '../../theme';
import AppText from './AppText';
import Pressable from './InteractivePressable';

type Props = { title: string; actionLabel?: string; onActionPress?: () => void };

/** Section title with an optional "See all" style link on the right. */
export default function SectionHeader({ title, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="h3">{title}</AppText>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={scale(8)} accessibilityRole="button">
          <AppText variant="bodyBold" color="primary">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
});
