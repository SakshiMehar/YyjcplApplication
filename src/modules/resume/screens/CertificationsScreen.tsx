import React from 'react';
import { CandidateScreenProps } from '../../../navigation/types';
import ResumeSectionEditorScreen from './ResumeSectionEditorScreen';

export default function CertificationsScreen({
  navigation,
  route,
}: CandidateScreenProps<'Certifications'>) {
  return (
    <ResumeSectionEditorScreen
      section="certifications"
      resumeId={route.params.resumeId}
      navigation={navigation}
    />
  );
}
