import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton, AppText, OtpInput } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import { toApiRole, USER_ROLES } from '../../../constants/roles';
import { useCountdown } from '../../../hooks/useCountdown';
import { AuthScreenProps } from '../../../navigation/types';
import {
  firebaseAuthMessage,
  linkPhoneToCurrentUser,
  sendPhoneOtp,
  signInWithPhoneOtp,
} from '../../../services/firebase/auth';
import { useAppSelector } from '../../../store/hooks';
import { scale, vs } from '../../../theme';
import { DEV_NO_BACKEND, DEV_OTP } from '../../../utils/dev';
import { useResendOtpMutation, useVerifyOtpMutation } from '../api/authApi';
import AuthFormLayout from '../components/AuthFormLayout';
import AuthHeader from '../components/AuthHeader';
import { backendErrorMessage, useBackendLogin } from '../hooks/useBackendLogin';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const formatPhone = (p: string) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;

/**
 * OTP Verification
 *  login    – Firebase phone sign-in        → POST /api/auth/login
 *  register – link phone to the new account → POST /api/auth/login (with fullName)
 *  reset    – backend OTP                   → Reset Password screen
 */
export default function OtpScreen({ navigation, route }: AuthScreenProps<'Otp'>) {
  const { phone, purpose, fullName } = route.params;
  const isFirebase = purpose !== 'reset';
  const selectedRole = useAppSelector(s => s.auth.selectedRole);
  const role = toApiRole(selectedRole ?? USER_ROLES.CANDIDATE);

  const { login: backendLogin, isLoading: isLoggingIn } = useBackendLogin();
  const [verifyOtp, { isLoading: isVerifyingReset }] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const { label, isDone, restart } = useCountdown(RESEND_SECONDS);

  // Android can read the SMS automatically – then the code is pre-filled
  const [otp, setOtp] = useState(route.params.autoCode ?? '');
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationId, setVerificationId] = useState(route.params.verificationId ?? '');
  const [requestId, setRequestId] = useState(route.params.requestId ?? '');
  const lastSubmitted = useRef('');

  const busy = verifying || isLoggingIn || isVerifyingReset;

  /** Firebase OTP → ID token → backend login. */
  const verifyWithFirebase = async (code: string) => {
    let idToken: string;
    try {
      idToken =
        purpose === 'register'
          ? await linkPhoneToCurrentUser(verificationId, code)
          : await signInWithPhoneOtp(verificationId, code);
    } catch (e) {
      setError(firebaseAuthMessage(e));
      return;
    }
    try {
      await backendLogin(idToken, role, purpose === 'register' ? fullName : undefined);
    } catch (e) {
      Alert.alert(purpose === 'register' ? 'Sign up failed' : 'Login failed', backendErrorMessage(e));
    }
  };

  /** Backend OTP for password reset (unchanged flow). */
  const verifyResetOtp = async (code: string) => {
    try {
      const res = await verifyOtp({ requestId, otp: code, purpose }).unwrap();
      if (res.resetToken) {
        navigation.replace('ResetPassword', { resetToken: res.resetToken });
      }
    } catch {
      if (DEV_NO_BACKEND && code === DEV_OTP) {
        navigation.replace('ResetPassword', { resetToken: 'dev-reset' });
        return;
      }
      setError('Invalid code. Please check and try again.');
    }
  };

  const onVerify = async (code = otp) => {
    if (code.length !== OTP_LENGTH) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(undefined);
    lastSubmitted.current = code;
    setVerifying(true);
    try {
      await (isFirebase ? verifyWithFirebase(code) : verifyResetOtp(code));
    } finally {
      setVerifying(false);
    }
  };

  // auto-verify as soon as all 6 digits are entered (or auto-read from SMS)
  useEffect(() => {
    if (otp.length === OTP_LENGTH && otp !== lastSubmitted.current && !busy) {
      onVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const onResend = async () => {
    setResending(true);
    try {
      if (isFirebase) {
        const res = await sendPhoneOtp(phone, true);
        setVerificationId(res.verificationId);
      } else {
        const res = await resendOtp({ requestId }).unwrap();
        setRequestId(res.requestId);
      }
    } catch (e) {
      if (isFirebase || !DEV_NO_BACKEND) {
        Alert.alert('Could not resend OTP', isFirebase ? firebaseAuthMessage(e) : 'Please try again.');
        return;
      }
    } finally {
      setResending(false);
    }
    setOtp('');
    setError(undefined);
    lastSubmitted.current = '';
    restart();
  };

  return (
    <AuthFormLayout>
      <AuthHeader
        title="Verify OTP"
        subtitle={
          <>
            Enter the 6 digit code sent to{'\n'}
            <AppText variant="bodyBold">{formatPhone(phone)}</AppText>
          </>
        }
      />

      <OtpInput
        value={otp}
        onChange={v => {
          setOtp(v);
          if (error) {
            setError(undefined);
          }
        }}
        error={error}
      />

      <View style={styles.resendRow}>
        {isDone ? (
          <Pressable onPress={onResend} disabled={resending} hitSlop={scale(8)}>
            <AppText variant="bodyBold" color="primary">
              {resending ? 'Sending…' : 'Resend OTP'}
            </AppText>
          </Pressable>
        ) : (
          <AppText color="textSecondary">
            Resend OTP in{' '}
            <AppText variant="bodyBold" color="primary">
              {label}
            </AppText>
          </AppText>
        )}
      </View>

      <AppButton title="Verify" onPress={() => onVerify()} loading={busy} style={styles.cta} />

      {DEV_NO_BACKEND && !isFirebase ? (
        <AppText variant="caption" color="textMuted" align="center" style={styles.devHint}>
          Dev mode: use OTP {DEV_OTP}
        </AppText>
      ) : null}
    </AuthFormLayout>
  );
}

const styles = StyleSheet.create({
  resendRow: { alignItems: 'center', marginTop: vs(24) },
  cta: { marginTop: vs(32) },
  devHint: { marginTop: vs(16) },
});
