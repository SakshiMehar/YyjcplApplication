import React from 'react';
import { CandidateScreenProps } from '../../../navigation/types';
import ResumeSectionEditorScreen from './ResumeSectionEditorScreen';

export default function EducationScreen({
  navigation,
  route,
}: CandidateScreenProps<'Education'>) {
  return (
    <ResumeSectionEditorScreen
      section="education"
      resumeId={route.params.resumeId}
      navigation={navigation}
    />
  );
}
