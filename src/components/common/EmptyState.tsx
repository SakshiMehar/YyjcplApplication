import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, vs } from '../../theme';
import AppText from './AppText';

type Props = { title: string; message?: string };

export default function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color="textSecondary" align="center" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: vs(40), paddingHorizontal: spacing.xl },
  message: { marginTop: spacing.sm },
});
