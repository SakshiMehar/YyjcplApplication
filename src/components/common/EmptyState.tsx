import React from 'react';
import { StyleSheet } from 'react-native';
import Appear from '../animated/Appear';
import LottieAnimation from '../animated/LottieAnimation';
import { scale, spacing, vs } from '../../theme';
import AppText from './AppText';

type Props = { title: string; message?: string; animation?: boolean };

/** Nothing-to-show state: floating magnifier (Lottie) + title + message. */
export default function EmptyState({ title, message, animation = true }: Props) {
  return (
    <Appear from="zoom" style={styles.container}>
      {animation ? <LottieAnimation name="empty" size={scale(120)} style={styles.art} /> : null}
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color="textSecondary" align="center" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </Appear>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: vs(28), paddingHorizontal: spacing.xl },
  art: { marginBottom: vs(4) },
  message: { marginTop: spacing.sm },
});
