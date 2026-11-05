export type ResumeTemplateId = 'CLASSIC' | 'MODERN' | 'CREATIVE' | 'MINIMAL';
export type ResumeSectionType =
  | 'SUMMARY'
  | 'EDUCATION'
  | 'EXPERIENCE'
  | 'SKILLS'
  | 'PROJECTS'
  | 'CERTIFICATIONS';

export type ResumeEntry = {
  id: string;
  sectionId?: string;
  [key: string]: string | undefined;
};

export type ResumeDocument = {
  id: string;
  title: string;
  template: ResumeTemplateId;
  createdAt: string;
  updatedAt: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: ResumeEntry[];
  experience: ResumeEntry[];
  skills: string[];
  projects: ResumeEntry[];
  certifications: ResumeEntry[];
  sectionIds: Partial<Record<Lowercase<ResumeSectionType>, string>>;
  sectionPositions?: Partial<Record<Lowercase<ResumeSectionType>, number>>;
};

export type ResumeTemplate = {
  id: ResumeTemplateId;
  name: string;
  description: string;
  accent: string;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'CLASSIC',
    name: 'Classic',
    description: 'A polished layout for every industry.',
    accent: '#244B75',
  },
  {
    id: 'MODERN',
    name: 'Modern',
    description: 'A confident design with a bold sidebar.',
    accent: '#0F766E',
  },
  {
    id: 'MINIMAL',
    name: 'Minimal',
    description: 'Clean typography with plenty of space.',
    accent: '#44403C',
  },
  {
    id: 'CREATIVE',
    name: 'Creative',
    description: 'A distinctive style for creative careers.',
    accent: '#7C3AED',
  },
];
