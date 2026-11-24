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
  InterviewModeApi,
  InterviewModeBackend,
  useRejectApplicationMutation,
  useScheduleApplicationInterviewMutation,
  useShortlistApplicationMutation,
  useUpdateApplicationResultMutation,
} from '../api/recruiterApi';

type Props = {
  applicationId: string;
  status: string;
  hasInterviewScheduled?: boolean;
  onUpdated: () => void;
};

type FormAction = 'interview' | 'reject' | null;
type ModeOption = { value: InterviewModeBackend; label: string };

const MODES: ModeOption[] = [
  { value: 'ONLINE',  label: 'Online'   },
  { value: 'OFFLINE', label: 'In Person' },
  { value: 'PHONE',   label: 'Phone'    },
];

const MODE_API_VALUES: Record<InterviewModeBackend, InterviewModeApi> = {
  ONLINE: 'Online',
  OFFLINE: 'In Person',
  PHONE: 'Phone',
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiError = error as {
      data?: { message?: string; error?: string; errors?: unknown };
      error?: string;
      status?: number | string;
      originalStatus?: number;
    };
    // Log full error for debugging
    console.error('[ApplicationActions] API error:', JSON.stringify(error, null, 2));
    if (apiError.data?.message) return apiError.data.message;
    if (apiError.data?.error) return apiError.data.error;
    if (apiError.error) return apiError.error;
    if (apiError.status === 'PARSING_ERROR') return 'Server returned an unexpected response. Check your connection.';
    if (apiError.status) return `Request failed (${apiError.status}). Please try again.`;
  }
  return 'Please try again.';
}

function isValidDateTime(date: string, time: string): boolean {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const [day, month, year] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hour, minute);
  return parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    hour <= 23 &&
    minute <= 59 &&
    parsed.getTime() >= Date.now();
}

export default function ApplicationActions({
  applicationId,
  status,
  hasInterviewScheduled = false,
  onUpdated,
}: Props) {
  const [shortlist, shortlistState] = useShortlistApplicationMutation();
  const [scheduleInterview, interviewState] = useScheduleApplicationInterviewMutation();
  const [updateResult, resultState] = useUpdateApplicationResultMutation();
  const [rejectApplication, rejectState] = useRejectApplicationMutation();
  const [formAction, setFormAction] = useState<FormAction>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<InterviewModeBackend>('ONLINE');
  const [details, setDetails] = useState('');
  const [reason, setReason] = useState('');
  const [didScheduleInterview, setDidScheduleInterview] = useState(false);

  const isWorking =
    shortlistState.isLoading ||
    interviewState.isLoading ||
    resultState.isLoading ||
    rejectState.isLoading;
  const normalizedStatus = status.toUpperCase();
  const isFinal = ['SELECTED', 'NOT_SELECTED', 'REJECTED'].includes(normalizedStatus);
  const interviewScheduled = didScheduleInterview || hasInterviewScheduled;
  const isInterviewStage =
    interviewScheduled || ['INTERVIEW_SCHEDULED', 'NEXT_ROUND'].includes(normalizedStatus);

  const success = (message: string) => {
    setFormAction(null);
    Alert.alert('Updated', message, [{ text: 'OK', onPress: onUpdated }]);
  };

  const runAction = async (
    action: () => Promise<unknown>,
    message: string,
    onSuccess?: () => void,
  ) => {
    try {
      await action();
      onSuccess?.();
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

  const confirmResult = () => {
    Alert.alert(
      'Confirm final result',
      'Are you sure you want to select this candidate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select',
          onPress: () => {
            runAction(
              () => updateResult({ applicationId, result: 'SELECTED' }).unwrap(),
              'Candidate selected.',
            );
          },
        },
      ],
    );
  };

  const openForm = (action: Exclude<FormAction, null>) => {
    setDate('');
    setTime('');
    setMode('ONLINE');
    setDetails('');
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
      Alert.alert('Check date and time', 'Enter a valid future date (DD-MM-YYYY) and time (HH:MM).');
      return;
    }

    const [day, month, year] = date.trim().split('-');
    const [hour, minute] = time.trim().split(':').map(Number);
    const displayHour = String(hour % 12 || 12).padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    const payload: { applicationId: string } & ApplicationInterviewBody = {
      applicationId,
      interviewAt: `${day}-${month}-${year} ${displayHour}:${String(minute).padStart(2, '0')} ${period}`,
      mode: MODE_API_VALUES[mode],
      details: details.trim(),
    };
    console.log('[ApplicationActions] Scheduling payload:', JSON.stringify(payload, null, 2));

    Alert.alert('Schedule interview?', 'Confirm these schedule details.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Schedule',
        onPress: () => {
          runAction(
            () => scheduleInterview(payload).unwrap(),
            'Interview scheduled.',
            () => setDidScheduleInterview(true),
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
      {!isFinal && normalizedStatus === 'SHORTLISTED' && !interviewScheduled ? (
        <AppButton
          title="Schedule interview"
          onPress={() => openForm('interview')}
          disabled={isWorking}
          style={styles.actionButton}
        />
      ) : null}
      {!isFinal && isInterviewStage ? (
        <AppButton
          title="Select"
          onPress={confirmResult}
          loading={resultState.isLoading}
          disabled={isWorking}
          style={styles.actionButton}
        />
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
                {formAction === 'interview' ? 'Schedule interview' : 'Reject candidate'}
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
                    placeholder="DD-MM-YYYY"
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
                        onPress={() => {
                          setMode(option.value);
                        }}
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
                    label={
                      mode === 'ONLINE'
                        ? 'Meeting link or details'
                        : mode === 'OFFLINE'
                          ? 'Interview location or details'
                          : 'Phone number or details'
                    }
                    placeholder={
                      mode === 'ONLINE'
                        ? 'e.g. https://meet.google.com/...'
                        : mode === 'OFFLINE'
                          ? 'e.g. Interview at the office.'
                          : 'e.g. phone number or call details'
                    }
                    value={details}
                    onChangeText={setDetails}
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
