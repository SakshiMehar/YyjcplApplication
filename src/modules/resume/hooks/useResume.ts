import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  useAddResumeSectionMutation,
  useCreateResumeMutation,
  useDeleteResumeMutation,
  useDeleteResumeSectionMutation,
  useGetResumeQuery,
  useGetResumesQuery,
  useUpdateResumeMutation,
  useUpdateResumeSectionMutation,
  type ResumeCreateRequest,
  type ResumeSectionRequest,
  type ResumeUpdateRequest,
} from '../services/resumeApi';
import type { ResumeDocument, ResumeTemplateId } from '../types/resume.types';

export function getResumeErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if ('message' in data) return String(data.message);
      if ('error' in data) return String(data.error);
    }
  }
  if (error && typeof error === 'object' && 'error' in error) {
    return String(error.error);
  }
  if (error && typeof error === 'object' && 'status' in error) {
    return `${fallback} (HTTP ${String(error.status)}).`;
  }
  return fallback;
}

async function runMutation<T>(
  request: Promise<T>,
  fallback: string,
): Promise<T> {
  try {
    return await request;
  } catch (error) {
    throw new Error(getResumeErrorMessage(error, fallback));
  }
}

function useResumeMutations() {
  const [createResume] = useCreateResumeMutation();
  const [updateResume] = useUpdateResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [addSection] = useAddResumeSectionMutation();
  const [updateSection] = useUpdateResumeSectionMutation();
  const [deleteSection] = useDeleteResumeSectionMutation();

  const create = React.useCallback(
    async (template: ResumeTemplateId) => {
      const body: ResumeCreateRequest = {
        title: 'Untitled resume',
        templateCode: template,
        resumeData: {
          personalInfo: { fullName: '', email: '', phone: '', location: '' },
          sections: [],
        },
      };
      return runMutation(
        createResume(body).unwrap(),
        'Could not create the resume.',
      );
    },
    [createResume],
  );

  const update = React.useCallback(
    async (
      resumeId: string,
      changes: Partial<Omit<ResumeDocument, 'id' | 'createdAt'>>,
    ) => {
      const body: ResumeUpdateRequest = {};
      if (changes.title !== undefined) body.title = changes.title;
      if (changes.template !== undefined) body.templateCode = changes.template;
      if (changes.personal !== undefined) {
        body.resumeData = {
          personalInfo: {
            fullName: changes.personal.fullName,
            email: changes.personal.email,
            phone: changes.personal.phone,
            location: changes.personal.location,
          },
        };
      }
      await runMutation(
        updateResume({ resumeId, body }).unwrap(),
        'Could not update the resume.',
      );
    },
    [updateResume],
  );

  const remove = React.useCallback(
    async (resumeId: string) => {
      await runMutation(
        deleteResume(resumeId).unwrap(),
        'Could not delete the resume.',
      );
    },
    [deleteResume],
  );

  const createSection = React.useCallback(
    async (resumeId: string, body: ResumeSectionRequest) =>
      runMutation(
        addSection({ resumeId, body }).unwrap(),
        'Could not add the resume section.',
      ),
    [addSection],
  );
  const editSection = React.useCallback(
    async (resumeId: string, sectionId: string, body: ResumeSectionRequest) =>
      runMutation(
        updateSection({ resumeId, sectionId, body }).unwrap(),
        'Could not update the resume section.',
      ),
    [updateSection],
  );
  const removeSection = React.useCallback(
    async (resumeId: string, sectionId: string) =>
      runMutation(
        deleteSection({ resumeId, sectionId }).unwrap(),
        'Could not delete the resume section.',
      ),
    [deleteSection],
  );

  return { create, update, remove, createSection, editSection, removeSection };
}

export function useResumeLibrary() {
  const query = useGetResumesQuery();
  const refetch = query.refetch;
  const mutations = useResumeMutations();

  useFocusEffect(
    React.useCallback(() => {
      refetch().catch(() => undefined);
    }, [refetch]),
  );

  return {
    resumes: query.data ?? [],
    loading: query.isLoading,
    error: query.isError
      ? getResumeErrorMessage(query.error, 'Could not load your resumes.')
      : null,
    refresh: refetch,
    ...mutations,
  };
}

export function useResume(resumeId: string) {
  const query = useGetResumeQuery(resumeId, { skip: !resumeId });
  const mutations = useResumeMutations();
  return {
    ...mutations,
    resume: query.data,
    loading: query.isLoading,
    error: query.isError
      ? getResumeErrorMessage(query.error, 'Could not load this resume.')
      : null,
    refresh: query.refetch,
  };
}
