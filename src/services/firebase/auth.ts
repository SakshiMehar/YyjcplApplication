import {
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  linkWithCredential,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPhoneNumber,
} from '@react-native-firebase/auth';

/**
 * Firebase Authentication – the ONLY place the app talks to Firebase Auth.
 *
 * Every sign-in ends with a Firebase ID token, which the app sends to the
 * backend (POST /api/auth/login). Passwords never go to our backend.
 */

const COUNTRY_CODE = '+91';
const toE164 = (phone: string) => `${COUNTRY_CODE}${phone.trim()}`;

/* ---------------- Email / password ---------------- */

/** Existing account → Firebase ID token. */
export async function signInWithEmail(email: string, password: string): Promise<string> {
  const { user } = await signInWithEmailAndPassword(getAuth(), email.trim(), password);
  return getIdToken(user);
}

/**
 * New account (stays signed in so the phone number can be linked next).
 * If this account was already created a moment ago (e.g. SMS failed and the user
 * taps Sign Up again), it is reused instead of failing with "email already in use".
 */
export async function createEmailAccount(email: string, password: string, fullName: string) {
  const auth = getAuth();
  const sameUser = auth.currentUser?.email?.toLowerCase() === email.trim().toLowerCase();
  const user = sameUser && auth.currentUser
    ? auth.currentUser
    : (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
  await updateProfile(user, { displayName: fullName.trim() });
}

/* ---------------- Phone OTP ---------------- */

export type PhoneVerification = {
  verificationId: string;
  /** Android may read the SMS automatically – then the code is already here. */
  autoCode?: string;
};

/** Sends the SMS code. `resend` forces a new SMS. */
export async function sendPhoneOtp(phone: string, resend = false): Promise<PhoneVerification> {
  const snapshot = await verifyPhoneNumber(getAuth(), toE164(phone), resend);
  return { verificationId: snapshot.verificationId, autoCode: snapshot.code ?? undefined };
}

/** Mobile login: OTP → signed in → Firebase ID token. */
export async function signInWithPhoneOtp(verificationId: string, code: string): Promise<string> {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const { user } = await signInWithCredential(getAuth(), credential);
  return getIdToken(user);
}

/**
 * Registration: link the verified phone number to the email/password account
 * created just before, so both log in to the SAME Firebase user.
 */
export async function linkPhoneToCurrentUser(verificationId: string, code: string): Promise<string> {
  const current = getAuth().currentUser;
  if (!current) {
    throw new Error('auth/no-current-user');
  }
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const { user } = await linkWithCredential(current, credential);
  return getIdToken(user, true); // refresh so the token includes the phone number
}

/* ---------------- Session ---------------- */

export async function signOutFirebase() {
  if (getAuth().currentUser) {
    await signOut(getAuth());
  }
}

/** Friendly message for a Firebase Auth error code. */
export function firebaseAuthMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/invalid-verification-code':
      return 'Invalid code. Please check and try again.';
    case 'auth/session-expired':
    case 'auth/code-expired':
      return 'This code has expired. Please resend the OTP.';
    case 'auth/credential-already-in-use':
    case 'auth/provider-already-linked':
      return 'This mobile number is already linked to another account.';
    case 'auth/invalid-phone-number':
      return 'Enter a valid mobile number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
