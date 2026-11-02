import {
  getLoginChannel,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../src/modules/auth/schemas/auth.schema';

const login = (identifier: string, password?: string) =>
  loginSchema.safeParse({ identifier, password }).success;

describe('login: (mobile or email) + password', () => {
  test('mobile number + password', () => {
    expect(login('9876543210', 'secret123')).toBe(true);
    expect(login('9876543210')).toBe(false);
    expect(getLoginChannel('9876543210')).toBe('phone');
  });

  test('email + password', () => {
    expect(login('name@company.com', 'secret123')).toBe(true);
    expect(login('name@company.com')).toBe(false);
    expect(getLoginChannel('name@company.com')).toBe('email');
  });

  test('rejects bad input', () => {
    expect(login('', 'secret123')).toBe(false);
    expect(login('12345', 'secret123')).toBe(false); // too short
    expect(login('1234567890', 'secret123')).toBe(false); // mobile must start with 6-9
    expect(login('name@', 'secret123')).toBe(false);
  });
});

describe('registration', () => {
  const base = {
    fullName: 'Asha Rao',
    phone: '9876543210',
    email: 'asha@mail.com',
    password: 'secret123',
  };

  test('email is required (Firebase email/password account)', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, email: '' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, email: 'asha@' }).success).toBe(false);
  });

  test('password must be 8+ chars with a letter and a number', () => {
    expect(registerSchema.safeParse({ ...base, password: 'short1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'onlyletters' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: '12345678' }).success).toBe(false);
  });
});

test('reset password: passwords must match', () => {
  expect(
    resetPasswordSchema.safeParse({ password: 'secret123', confirmPassword: 'secret123' }).success,
  ).toBe(true);
  expect(
    resetPasswordSchema.safeParse({ password: 'secret123', confirmPassword: 'secret124' }).success,
  ).toBe(false);
});
