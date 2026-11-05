import type { ResumeDocument } from '../types/resume.types';

export function validateResumePersonalDetails(
  resume: ResumeDocument,
): string | undefined {
  if (!resume.personal.fullName.trim())
    return 'Add your full name before continuing.';
  if (
    resume.personal.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.personal.email.trim())
  ) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function getResumeCompletion(resume: ResumeDocument): number {
  const checks = [
    Boolean(resume.personal.fullName.trim()),
    Boolean(resume.personal.email.trim() || resume.personal.phone.trim()),
    Boolean(resume.personal.summary.trim()),
    resume.education.length > 0,
    resume.experience.length > 0,
    resume.skills.length > 0,
    resume.projects.length > 0,
    resume.certifications.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
