import {
  getResumeCompletion,
  validateResumePersonalDetails,
} from './resumeValidation';
import type { ResumeDocument } from '../types/resume.types';

const resume: ResumeDocument = {
  id: 'resume-1',
  title: 'Resume',
  template: 'CLASSIC',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  personal: { fullName: '', email: '', phone: '', location: '', summary: '' },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  sectionIds: {},
};

describe('resume validation', () => {
  it('requires a full name and validates an optional email', () => {
    expect(validateResumePersonalDetails(resume)).toBe(
      'Add your full name before continuing.',
    );
    expect(
      validateResumePersonalDetails({
        ...resume,
        personal: {
          ...resume.personal,
          fullName: 'Alex Lee',
          email: 'not-an-email',
        },
      }),
    ).toBe('Enter a valid email address.');
    expect(
      validateResumePersonalDetails({
        ...resume,
        personal: {
          ...resume.personal,
          fullName: 'Alex Lee',
          email: 'alex@example.com',
        },
      }),
    ).toBeUndefined();
  });

  it('calculates completion from filled resume sections', () => {
    expect(getResumeCompletion(resume)).toBe(0);
    expect(
      getResumeCompletion({
        ...resume,
        personal: {
          ...resume.personal,
          fullName: 'Alex Lee',
          phone: '555-1234',
          summary: 'Designer',
        },
        education: [{ id: 'edu-1', degree: 'BA' }],
        experience: [{ id: 'exp-1', role: 'Designer' }],
        skills: ['Research'],
        projects: [{ id: 'project-1', name: 'Portfolio' }],
        certifications: [{ id: 'cert-1', name: 'Certificate' }],
      }),
    ).toBe(100);
  });
});
