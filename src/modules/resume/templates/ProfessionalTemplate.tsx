import React from 'react';
import ResumeTemplateLayout from './ResumeTemplateLayout';
import type { ResumeDocument } from '../types/resume.types';

export default function ProfessionalTemplate({
  resume,
}: {
  resume: ResumeDocument;
}) {
  return (
    <ResumeTemplateLayout
      resume={resume}
      accent="#244B75"
      variant="professional"
    />
  );
}
