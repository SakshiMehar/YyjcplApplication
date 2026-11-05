import React from 'react';
import { CandidateScreenProps } from '../../../navigation/types';
import ResumeSectionEditorScreen from './ResumeSectionEditorScreen';

export default function ExperienceScreen({
  navigation,
  route,
}: CandidateScreenProps<'Experience'>) {
  return (
    <ResumeSectionEditorScreen
      section="experience"
      resumeId={route.params.resumeId}
      navigation={navigation}
    />
  );
}
