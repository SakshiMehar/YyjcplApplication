import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import Pressable from '../../../components/common/InteractivePressable';
import { AppText, Card } from '../../../components/common';
import { colors, scale, spacing } from '../../../theme';
import { RESUME_TEMPLATES, type ResumeDocument } from '../types/resume.types';
import ResumeProgress from './ResumeProgress';
import { getResumeCompletion } from '../utils/resumeValidation';

export default function ResumeCard({
  resume,
  onOpen,
  onDelete,
}: {
  resume: ResumeDocument;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const template = RESUME_TEMPLATES.find(item => item.id === resume.template);
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${resume.title}`}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.templateMark,
              { backgroundColor: template?.accent ?? colors.primary },
            ]}
          />
          <View style={styles.title}>
            <AppText variant="bodyBold" numberOfLines={1}>
              {resume.title}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {template?.name ?? 'Resume'} · Updated{' '}
              {new Date(resume.updatedAt).toLocaleDateString()}
            </AppText>
          </View>
          <Pressable
            onPress={event => {
              event.stopPropagation();
              onDelete();
            }}
            hitSlop={scale(10)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${resume.title}`}
          >
            <MoreVertical size={scale(20)} color={colors.textMuted} />
          </Pressable>
        </View>
        <ResumeProgress value={getResumeCompletion(resume)} />
        <AppText variant="caption" color="primary">
          Open resume ›
        </AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  templateMark: { width: scale(10), height: scale(42), borderRadius: scale(5) },
  title: { flex: 1, gap: spacing.xs },
});
