import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import Pressable from '../../../components/common/InteractivePressable';
import { AppText } from '../../../components/common';
import { colors, radius, scale, spacing } from '../../../theme';
import type { ResumeTemplate } from '../types/resume.types';

export default function TemplateCard({
  template,
  selected,
  onPress,
}: {
  template: ResumeTemplate;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.preview, { borderTopColor: template.accent }]}>
        <View
          style={[styles.previewTitle, { backgroundColor: template.accent }]}
        />
        <View style={styles.previewLine} />
        <View style={[styles.previewLine, styles.shortLine]} />
        <View style={styles.previewSection} />
        <View style={styles.previewLine} />
        <View style={[styles.previewLine, styles.shortLine]} />
      </View>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <AppText variant="bodyBold">{template.name}</AppText>
          {selected ? <Check size={scale(18)} color={colors.primary} /> : null}
        </View>
        <AppText variant="caption" color="textSecondary">
          {template.description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  preview: {
    width: scale(76),
    height: scale(96),
    borderTopWidth: scale(4),
    borderRadius: radius.sm,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    justifyContent: 'center',
  },
  previewTitle: { height: scale(8), width: '68%', marginBottom: spacing.sm },
  previewLine: {
    height: scale(3),
    backgroundColor: '#D6D3D1',
    marginBottom: spacing.xs,
  },
  shortLine: { width: '68%' },
  previewSection: {
    height: scale(4),
    width: '48%',
    backgroundColor: '#A8A29E',
    marginVertical: spacing.xs,
  },
  details: { flex: 1, gap: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
