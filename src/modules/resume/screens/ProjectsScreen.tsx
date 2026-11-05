import React from 'react';
import { CandidateScreenProps } from '../../../navigation/types';
import ResumeSectionEditorScreen from './ResumeSectionEditorScreen';

export default function ProjectsScreen({
  navigation,
  route,
}: CandidateScreenProps<'Projects'>) {
  return (
    <ResumeSectionEditorScreen
      section="projects"
      resumeId={route.params.resumeId}
      navigation={navigation}
    />
  );
}
