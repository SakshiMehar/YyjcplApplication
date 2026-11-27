import React, { useState } from 'react';
import { Alert, ImageBackground, StyleSheet, TextInput, View } from 'react-native';
import { AppButton, AppText, Card } from '../../../components/common';
import { ScreenLayout } from '../../../layout';
import { useRaiseComplaintMutation } from '../api/sharedApi';
import { colors, radius, scale, spacing, vs } from '../../../theme';

/** Shared complaint form for job seekers and recruiters. */
export default function RaiseComplaintScreen() {
  const [description, setDescription] = useState('');
  const [raiseComplaint, { isLoading }] = useRaiseComplaintMutation();

  const sendComplaint = async () => {
    const message = description.trim();
    if (!message) {
      Alert.alert('Write a complaint', 'Enter a message before sending.');
      return;
    }

    try {
      await raiseComplaint({ complaintText: message }).unwrap();
      setDescription('');
      Alert.alert('Complaint sent', 'Our support team will review your message.');
    } catch {
      Alert.alert('Could not send complaint', 'Please check your connection and try again.');
    }
  };

  return (
    <ScreenLayout title="Make a Complaint" padded={false} mainBackground="transparent">
      <ImageBackground
        source={require('../../../assets/illustrations/interview screen.png')}
        resizeMode="cover"
        style={styles.background}>
        <View style={styles.center}>
          <Card>
            <AppText variant="h3">How can we help?</AppText>
            <AppText color="textSecondary" style={styles.description}>
              Describe your issue and our support team will get back to you.
            </AppText>
            <TextInput
              accessibilityLabel="Complaint message"
              value={description}
              onChangeText={setDescription}
              placeholder="Write your complaint here..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={2000}
              style={styles.input}
            />
            <View style={styles.button}>
              <AppButton
                title={isLoading ? 'Sending...' : 'Send'}
                onPress={sendComplaint}
                disabled={isLoading || !description.trim()}
                loading={isLoading}
              />
            </View>
          </Card>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  description: { marginTop: vs(8), marginBottom: vs(18) },
  input: {
    minHeight: vs(170),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: scale(14),
    paddingVertical: vs(12),
    color: colors.text,
    fontSize: scale(15),
    backgroundColor: colors.background,
  },
  button: { marginTop: spacing.md },
});
