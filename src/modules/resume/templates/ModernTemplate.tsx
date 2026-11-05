import React from 'react';
import ResumeTemplateLayout from './ResumeTemplateLayout';
import type { ResumeDocument } from '../types/resume.types';

export default function ModernTemplate({ resume }: { resume: ResumeDocument }) {
  return (
    <ResumeTemplateLayout resume={resume} accent="#0F766E" variant="modern" />
  );
}
