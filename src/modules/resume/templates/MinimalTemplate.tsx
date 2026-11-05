import React from 'react';
import ResumeTemplateLayout from './ResumeTemplateLayout';
import type { ResumeDocument } from '../types/resume.types';

export default function MinimalTemplate({
  resume,
}: {
  resume: ResumeDocument;
}) {
  return (
    <ResumeTemplateLayout resume={resume} accent="#44403C" variant="minimal" />
  );
}
