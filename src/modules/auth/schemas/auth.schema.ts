import { z } from 'zod';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const phone = z.string().trim().regex(PHONE_REGEX, 'Enter a valid 10-digit mobile number');
const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a number');

export type LoginChannel = 'phone' | 'email';

/** Phone if the value is a valid 10-digit Indian mobile number, otherwise email. */
export const getLoginChannel = (value: string): LoginChannel =>
  PHONE_REGEX.test(value.trim()) ? 'phone' : 'email';

/** True while the user is typing digits (phone mode: +91 chip, OTP login). */
export const looksLikePhone = (value: string) => /^\d+$/.test(value.trim());

/* ---------- Login: (mobile or email) + password ---------- */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your mobile number or email')
    .refine(
      v => (looksLikePhone(v) ? PHONE_REGEX.test(v) : z.email().safeParse(v).success),
      { error: 'Enter a valid 10-digit mobile number or email address' },
    ),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginForm = z.infer<typeof loginSchema>;

/* ---------- Registration ---------- */
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  phone,
  email: z.string().trim().min(1, 'Enter your email address').pipe(z.email('Enter a valid email address')),
  password: strongPassword,
  /** Recruiters only – required by `recruiterRegisterSchema`. */
  companyName: z.string().trim(),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const recruiterRegisterSchema = registerSchema.extend({
  companyName: z.string().trim().min(2, 'Enter your company name'),
});

/* ---------- Forgot / reset password ---------- */
export const forgotPasswordSchema = z.object({ phone });
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Re-enter your password'),
  })
  .refine(d => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Enter your current password'),
  newPassword: strongPassword,
});
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

/* ---------- OTP ---------- */
export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
});
export type OtpForm = z.infer<typeof otpSchema>;

/* ---------- Admin login: admin ID (username / email / mobile) + password ---------- */
export const adminLoginSchema = z.object({
  adminId: z.string().trim().min(3, 'Enter your admin ID'),
  password: z.string().min(1, 'Enter your password'),
});
export type AdminLoginForm = z.infer<typeof adminLoginSchema>;
