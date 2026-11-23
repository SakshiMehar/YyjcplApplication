import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Megaphone, Send } from 'lucide-react-native';
import { AppInput, AppText } from '../../../components/common';
import { colors, radius, scale, spacing, vs } from '../../../theme';
import { timeAgo } from '../../../utils/format';
import { ActionButton, AdminScreen, Panel, PillTabs, RowDivider, SectionTitle, StatusPill } from '../components/AdminUi';
import { useAdminData } from '../data/AdminDataProvider';
import { useCelebrate } from '../../../components/animated';
import { BroadcastAudience } from '../data/sampleAdmin';

const AUDIENCE_LABEL: Record<BroadcastAudience, string> = {
  ALL: 'Everyone',
  JOB_SEEKER: 'Job Seekers',
  RECRUITER: 'Recruiters',
};

/** Send a push notification to all users, only job seekers, or only recruiters. */
export default function AdminNotificationsScreen() {
  const { broadcasts, sendBroadcast } = useAdminData();
  const celebrate = useCelebrate();
  const [audience, setAudience] = useState<BroadcastAudience>('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ title?: string; message?: string }>({});

  const onSend = () => {
    const next = {
      title: title.trim().length < 3 ? 'Enter a title (min 3 characters)' : undefined,
      message: message.trim().length < 10 ? 'Enter a message (min 10 characters)' : undefined,
    };
    setErrors(next);
    if (next.title || next.message) return;

    Alert.alert('Send notification?', `This will be sent to ${AUDIENCE_LABEL[audience].toLowerCase()}.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: () => {
          sendBroadcast(title.trim(), message.trim(), audience);
          setTitle('');
          setMessage('');
          celebrate('Notification sent');
        },
      },
    ]);
  };

  return (
    <AdminScreen
      title="Notifications"
      subtitle="Broadcast push notifications to users"
      footer={<ActionButton title="Send Notification" icon={Send} variant="filled" style={styles.send} onPress={onSend} />}>
      <Panel>
        <AppText variant="caption" color="textSecondary" style={styles.label}>
          Send to
        </AppText>
        <PillTabs<BroadcastAudience>
          value={audience}
          onChange={setAudience}
          tabs={[
            { key: 'ALL', label: 'Everyone' },
            { key: 'JOB_SEEKER', label: 'Job Seekers' },
            { key: 'RECRUITER', label: 'Recruiters' },
          ]}
        />
        <View style={styles.gap} />
        <AppInput
          label="Title"
          placeholder="e.g. New jobs in your city"
          value={title}
          onChangeText={setTitle}
          maxLength={60}
          error={errors.title}
        />
        <AppInput
          label="Message"
          placeholder="Write the notification message…"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={240}
          textAlignVertical="top"
          error={errors.message}
          hint={`${message.length}/240`}
          fieldStyle={styles.messageField}
          style={styles.messageInput}
          wrapperStyle={styles.lastInput}
        />
      </Panel>

      {/* ── Preview ── */}
      {title || message ? (
        <View style={styles.preview}>
          <View style={styles.previewIcon}>
            <Megaphone size={scale(16)} color={colors.textOnPrimary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyBold" numberOfLines={1}>
              {title || 'Title'}
            </AppText>
            <AppText variant="caption" color="textSecondary" numberOfLines={2}>
              {message || 'Message'}
            </AppText>
          </View>
        </View>
      ) : null}

      <SectionTitle title="Sent Notifications" />
      <Panel>
        {broadcasts.map((b, i) => (
          <React.Fragment key={b.id}>
            {i > 0 ? <RowDivider /> : null}
            <View style={styles.history}>
              <View style={styles.historyHead}>
                <AppText variant="bodyBold" style={styles.flex} numberOfLines={1}>
                  {b.title}
                </AppText>
                <StatusPill label={AUDIENCE_LABEL[b.audience].toUpperCase()} tone="primary" />
              </View>
              <AppText variant="caption" color="textSecondary">
                {b.message}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {timeAgo(b.sentAt)}
              </AppText>
            </View>
          </React.Fragment>
        ))}
      </Panel>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  label: { fontWeight: '600', marginBottom: vs(8) },
  gap: { height: vs(14) },
  messageField: { height: vs(110), alignItems: 'flex-start', paddingVertical: vs(10) },
  messageInput: { height: '100%' },
  lastInput: { marginBottom: 0 },
  send: { height: vs(48) },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: vs(12),
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primarySoft,
  },
  previewIcon: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  history: { gap: vs(3) },
  historyHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
