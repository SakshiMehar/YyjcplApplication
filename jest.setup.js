/* Mocks for native modules that don't exist in the Jest environment. */
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

/* Icons render as nothing in tests (lucide ships ESM .mjs files Jest doesn't transform). */
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));

/* Firebase native modules don't exist in Jest – auth functions are plain mocks. */
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  getIdToken: jest.fn(() => Promise.resolve('test-id-token')),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  verifyPhoneNumber: jest.fn(),
  signInWithCredential: jest.fn(),
  linkWithCredential: jest.fn(),
  signOut: jest.fn(),
  PhoneAuthProvider: { credential: jest.fn() },
}));
