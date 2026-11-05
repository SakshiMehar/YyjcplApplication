jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {},
}));

import type { ResumeDocument } from '../types/resume.types';
import { createResumePdf } from './resumePdf';

const resume: ResumeDocument = {
  id: 'resume-123',
  title: 'Java Developer Resume',
  template: 'MODERN',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  personal: {
    fullName: 'Asha Kumar',
    email: 'asha@example.com',
    phone: '9876543210',
    location: 'Bengaluru',
    summary: 'Java and Spring Boot developer with 3 years of experience.',
  },
  experience: [
    {
      id: 'experience-1',
      role: 'Backend Developer',
      company: 'Acme Ltd',
      duration: '2023-2026',
      description: 'Built REST APIs using Spring Boot.',
    },
  ],
  education: [],
  skills: ['Java', 'Spring Boot', 'MySQL'],
  projects: [],
  certifications: [],
  sectionIds: {},
};

function pdfText(document: number[]): string {
  return String.fromCharCode(...document);
}

describe('resume PDF rendering', () => {
  it('creates a styled PDF using the selected template and resume content', () => {
    const pdf = pdfText(createResumePdf(resume));

    expect(pdf).toContain('%PDF-1.4');
    expect(pdf).toContain('/Count 1');
    expect(pdf).toContain('0.059 0.463 0.431 rg');
    expect(pdf).toContain('(Asha Kumar) Tj');
    expect(pdf).toContain('(PROFILE) Tj');
    expect(pdf).toContain('(EXPERIENCE) Tj');
    expect(pdf).toContain('(Java | Spring Boot | MySQL) Tj');
    expect(pdf).toContain('startxref');
    expect(pdf.endsWith('%%EOF')).toBe(true);
  });

  it('uses a distinct accent for each of the four resume templates', () => {
    const templates: Array<[ResumeDocument['template'], string]> = [
      ['CLASSIC', '0.141 0.294 0.459'],
      ['MODERN', '0.059 0.463 0.431'],
      ['CREATIVE', '0.486 0.231 0.929'],
      ['MINIMAL', '0.267 0.251 0.235'],
    ];

    templates.forEach(([template, accent]) => {
      const pdf = pdfText(createResumePdf({ ...resume, template }));
      expect(pdf).toContain(`${accent} rg`);
    });
  });

  it('adds pages when resume content exceeds one page', () => {
    const longResume = {
      ...resume,
      experience: Array.from({ length: 20 }, (_, index) => ({
        id: `experience-${index}`,
        role: `Developer ${index}`,
        description: 'Built reliable services and maintained production systems. '.repeat(5),
      })),
    };
    const pdf = pdfText(createResumePdf(longResume));

    expect(pdf).toMatch(/\/Count [2-9]\d*/);
    expect(pdf).toContain('(Developer 19) Tj');
  });
});
