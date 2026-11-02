import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2, 'Enter company name'),
  industry: z.string().min(2, 'Enter industry'),
  size: z.string().optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Enter location'),
  about: z.string().max(2000).optional(),
});
export type CompanyForm = z.infer<typeof companySchema>;

export const postJobSchema = z
  .object({
    title: z.string().min(3, 'Enter job title'),
    description: z.string().min(30, 'Description must be at least 30 characters'),
    location: z.string().min(2, 'Enter location'),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    minSalary: z.number().nonnegative().optional(),
    maxSalary: z.number().nonnegative().optional(),
    minExperience: z.number().nonnegative().optional(),
    skills: z.array(z.string()).min(1, 'Add at least one skill'),
    openings: z.number().int().positive('At least 1 opening'),
  })
  .refine(d => !d.minSalary || !d.maxSalary || d.maxSalary >= d.minSalary, {
    message: 'Max salary must be greater than min salary',
    path: ['maxSalary'],
  });
export type PostJobForm = z.infer<typeof postJobSchema>;

export const scheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(1, 'Pick date & time'),
  mode: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']),
  locationOrLink: z.string().optional(),
  notes: z.string().max(500).optional(),
});
export type ScheduleInterviewForm = z.infer<typeof scheduleInterviewSchema>;
