import React from 'react';
import ResumeTemplateLayout from './ResumeTemplateLayout';
import type { ResumeDocument } from '../types/resume.types';

export default function CreativeTemplate({
  resume,
}: {
  resume: ResumeDocument;
}) {
  return (
    <ResumeTemplateLayout resume={resume} accent="#7C3AED" variant="creative" />
  );
}
