import { z } from 'zod';

export const candidateProfileSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  headline: z.string().max(120).optional(),
  location: z.string().min(2, 'Enter your city'),
  summary: z.string().max(1000).optional(),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  expectedSalary: z.number().positive().optional(),
});
export type CandidateProfileForm = z.infer<typeof candidateProfileSchema>;

export const applyJobSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
});
export type ApplyJobForm = z.infer<typeof applyJobSchema>;
