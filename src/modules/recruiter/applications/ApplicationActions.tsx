import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppButton, AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import {
  ApplicationInterviewBody,
  useRejectApplicationMutation,
  useScheduleApplicationInterviewMutation,
  useScheduleApplicationNextRoundMutation,
  useShortlistApplicationMutation,
  useUpdateApplicationResultMutation,
} from '../api/recruiterApi';
import type { InterviewMode } from '../../../types/models';

type Props = {
  applicationId: string;
  status: string;
  onUpdated: () => void;
};

type FormAction = 'interview' | 'nextRound' | 'reject' | null;
type ModeOption = { value: InterviewMode; label: string };

const MODES: ModeOption[] = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_PERSON', label: 'In person' },
];

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiError = error as {
      data?: { message?: string; error?: string };
      error?: string;
      status?: number | string;
    };
    if (apiError.data?.message) return apiError.data.message;
    if (apiError.data?.error) return apiError.data.error;
    if (apiError.error) return apiError.error;
    if (apiError.status) return `Request failed (${apiError.status}). Please try again.`;
  }
  return 'Please try again.';
}

function isValidDateTime(date: string, time: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hour, minute);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    hour <= 23 &&
    minute <= 59 &&
    parsed.getTime() >= Date.now();
}

export default function ApplicationActions({ applicationId, status, onUpdated }: Props) {
  const [shortlist, shortlistState] = useShortlistApplicationMutation();
  const [scheduleInterview, interviewState] = useScheduleApplicationInterviewMutation();
  const [scheduleNextRound, nextRoundState] = useScheduleApplicationNextRoundMutation();
  const [updateResult, resultState] = useUpdateApplicationResultMutation();
  const [rejectApplication, rejectState] = useRejectApplicationMutation();
  const [formAction, setFormAction] = useState<FormAction>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<InterviewMode>('VIDEO');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  const isWorking =
    shortlistState.isLoading ||
    interviewState.isLoading ||
    nextRoundState.isLoading ||
    resultState.isLoading ||
    rejectState.isLoading;
  const normalizedStatus = status.toUpperCase();
  const isFinal = ['SELECTED', 'NOT_SELECTED', 'REJECTED'].includes(normalizedStatus);

  const success = (message: string) => {
    setFormAction(null);
    Alert.alert('Updated', message, [{ text: 'OK', onPress: onUpdated }]);
  };

  const runAction = async (
    action: () => Promise<unknown>,
    message: string,
  ) => {
    try {
      await action();
      success(message);
    } catch (error) {
      Alert.alert('Could not update application', getErrorMessage(error));
    }
  };

  const confirmShortlist = () => {
    Alert.alert(
      'Shortlist candidate?',
      'This will move the application to the shortlisted stage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Shortlist',
          onPress: () => {
            runAction(() => shortlist(applicationId).unwrap(), 'Candidate shortlisted.');
          },
        },
      ],
    );
  };

  const confirmResult = (result: 'SELECTED' | 'NOT_SELECTED') => {
    const label = result === 'SELECTED' ? 'select' : 'mark as not selected';
    Alert.alert(
      'Confirm final result',
      `Are you sure you want to ${label} this candidate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: result === 'SELECTED' ? 'Select' : 'Confirm',
          onPress: () => {
            runAction(
              () => updateResult({ applicationId, result }).unwrap(),
              result === 'SELECTED' ? 'Candidate selected.' : 'Final result saved.',
            );
          },
        },
      ],
    );
  };

  const openForm = (action: Exclude<FormAction, null>) => {
    setDate('');
    setTime('');
    setMode('VIDEO');
    setLocationOrLink('');
    setNotes('');
    setReason('');
    setFormAction(action);
  };

  const submitForm = () => {
    if (formAction === 'reject') {
      Alert.alert('Reject candidate?', 'This application will be marked as rejected.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            runAction(
              () => rejectApplication({ applicationId, reason: reason.trim() || undefined }).unwrap(),
              'Application rejected.',
            );
          },
        },
      ]);
      return;
    }

    if (!isValidDateTime(date.trim(), time.trim())) {
      Alert.alert('Check date and time', 'Enter a valid future date (YYYY-MM-DD) and time (HH:MM).');
      return;
    }

    const payload: { applicationId: string } & ApplicationInterviewBody = {
      applicationId,
      scheduledAt: new Date(`${date.trim()}T${time.trim()}:00`).toISOString(),
      mode,
      locationOrLink: locationOrLink.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    const isNextRound = formAction === 'nextRound';
    const label = isNextRound ? 'next-round interview' : 'interview';

    Alert.alert(`Schedule ${label}?`, 'Confirm these schedule details.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Schedule',
        onPress: () => {
          runAction(
            () => (isNextRound ? scheduleNextRound(payload) : scheduleInterview(payload)).unwrap(),
            isNextRound ? 'Next-round details saved.' : 'Interview scheduled.',
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {!isFinal && normalizedStatus === 'APPLIED' ? (
        <AppButton
          title="Shortlist"
          onPress={confirmShortlist}
          loading={shortlistState.isLoading}
          disabled={isWorking}
          style={styles.actionButton}
        />
      ) : null}
      {!isFinal && normalizedStatus === 'SHORTLISTED' ? (
        <AppButton
          title="Schedule interview"
          onPress={() => openForm('interview')}
          disabled={isWorking}
          style={styles.actionButton}
        />
      ) : null}
      {!isFinal && ['INTERVIEW_SCHEDULED', 'NEXT_ROUND'].includes(normalizedStatus) ? (
        <>
          <AppButton
            title="Schedule next round"
            variant="outline"
            onPress={() => openForm('nextRound')}
            disabled={isWorking}
            style={styles.actionButton}
          />
          <AppButton
            title="Select"
            onPress={() => confirmResult('SELECTED')}
            loading={resultState.isLoading}
            disabled={isWorking}
            style={styles.actionButton}
          />
          <AppButton
            title="Not selected"
            variant="outline"
            onPress={() => confirmResult('NOT_SELECTED')}
            disabled={isWorking}
            style={styles.actionButton}
          />
        </>
      ) : null}
      {!isFinal ? (
        <AppButton
          title="Reject"
          variant="ghost"
          onPress={() => openForm('reject')}
          disabled={isWorking}
          style={styles.actionButton}
        />
      ) : null}

      <Modal
        visible={formAction !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setFormAction(null)}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.scrim} onPress={() => setFormAction(null)} />
          <View style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AppText variant="h3" style={styles.title}>
                {formAction === 'interview'
                  ? 'Schedule interview'
                  : formAction === 'nextRound'
                    ? 'Schedule next round'
                    : 'Reject candidate'}
              </AppText>
              {formAction === 'reject' ? (
                <Field
                  label="Reason (optional)"
                  placeholder="Add a note for the application record"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                />
              ) : (
                <>
                  <Field
                    label="Date"
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                    keyboardType="numbers-and-punctuation"
                  />
                  <Field
                    label="Time"
                    placeholder="HH:MM (24-hour)"
                    value={time}
                    onChangeText={setTime}
                    keyboardType="numbers-and-punctuation"
                  />
                  <AppText variant="caption" color="textSecondary" style={styles.fieldLabel}>
                    Interview mode
                  </AppText>
                  <View style={styles.modeRow}>
                    {MODES.map(option => (
                      <Pressable
                        key={option.value}
                        onPress={() => setMode(option.value)}
                        style={[styles.modeOption, mode === option.value && styles.modeSelected]}>
                        <AppText
                          variant="caption"
                          style={[styles.modeText, mode === option.value && styles.modeTextSelected]}>
                          {option.label}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                  <Field
                    label="Meeting link or location (optional)"
                    placeholder="Video link or office address"
                    value={locationOrLink}
                    onChangeText={setLocationOrLink}
                    autoCapitalize="none"
                  />
                  <Field
                    label="Notes (optional)"
                    placeholder="Details shared with the candidate"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                </>
              )}
              <View style={styles.modalActions}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setFormAction(null)}
                  disabled={isWorking}
                  style={styles.modalButton}
                />
                <AppButton
                  title={formAction === 'reject' ? 'Continue' : 'Continue'}
                  onPress={submitForm}
                  loading={isWorking}
                  disabled={isWorking}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'sentences';
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType = 'default',
  autoCapitalize,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary" style={styles.fieldLabel}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexGrow: 1, minWidth: scale(140), marginBottom: spacing.xs },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: { marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontWeight: '700', marginBottom: vs(6) },
  input: {
    minHeight: scale(46),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multiline: { minHeight: scale(88), paddingTop: spacing.md },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  modeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(8),
  },
  modeSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  modeText: { color: colors.textSecondary, fontWeight: '600' },
  modeTextSelected: { color: colors.primary },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  modalButton: { flex: 1 },
});
