import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { baseApi } from '../../../store/api/baseApi';
import { ENV } from '../../../config/env';
import type { RootState } from '../../../store';
import { RESUME_TEMPLATES } from '../types/resume.types';
import type {
  ResumeDocument,
  ResumeEntry,
  ResumeSectionType,
  ResumeTemplate,
  ResumeTemplateId,
} from '../types/resume.types';

type ApiRecord = Record<string, unknown>;

export type ResumeCreateRequest = {
  title: string;
  templateCode: ResumeTemplateId;
  resumeData: {
    personalInfo: Omit<ResumeDocument['personal'], 'summary'>;
    sections: Array<{
      sectionType: ResumeSectionType;
      title: string;
      content: unknown;
      position: number;
    }>;
  };
};

export type ResumeUpdateRequest = {
  title?: string;
  templateCode?: ResumeTemplateId;
  resumeData?: {
    personalInfo?: ResumeCreateRequest['resumeData']['personalInfo'];
    sections?: ResumeCreateRequest['resumeData']['sections'];
  };
};

export type ResumeSectionRequest = {
  sectionType: ResumeSectionType;
  title: string;
  content: unknown;
  position: number;
};

const asRecord = (value: unknown): ApiRecord | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ApiRecord)
    : undefined;

function unwrap(value: unknown): unknown {
  const record = asRecord(value);
  return record && 'data' in record ? record.data : value;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : fallback;
}

function templateCode(value: unknown): ResumeTemplateId {
  switch (String(value ?? '').toUpperCase()) {
    case 'MODERN':
      return 'MODERN';
    case 'CREATIVE':
      return 'CREATIVE';
    case 'MINIMAL':
      return 'MINIMAL';
    case 'CLASSIC':
    default:
      return 'CLASSIC';
  }
}

export function normalizeResumeTemplates(response: unknown): ResumeTemplate[] {
  const body = unwrap(response);
  const record = asRecord(body);
  const list = Array.isArray(body)
    ? body
    : record?.templates ?? record?.items ?? record?.content;
  if (!Array.isArray(list)) {
    throw new Error('The resume templates response is invalid.');
  }
  const names: Record<
    ResumeTemplateId,
    { name: string; description: string; accent: string }
  > = {
    CLASSIC: {
      name: 'Classic',
      description: 'A polished layout for every industry.',
      accent: '#244B75',
    },
    MODERN: {
      name: 'Modern',
      description: 'A confident design with a bold sidebar.',
      accent: '#0F766E',
    },
    CREATIVE: {
      name: 'Creative',
      description: 'A distinctive style for creative careers.',
      accent: '#7C3AED',
    },
    MINIMAL: {
      name: 'Minimal',
      description: 'Clean typography with plenty of space.',
      accent: '#44403C',
    },
  };
  const templates = list.flatMap(item => {
    const entry = asRecord(item);
    const code = templateCode(
      typeof item === 'string' ? item : entry?.templateCode ?? entry?.code,
    );
    if (typeof item === 'string' || entry?.templateCode || entry?.code) {
      return [{ id: code, ...names[code] }];
    }
    return [];
  });

  // Some backend payloads include aliases or unsupported template codes. Those
  // normalize to CLASSIC, so retain only one item per ID, then restore any
  // locally supported designs the response did not list. The app supports all
  // four templates even if the backend currently sends only CLASSIC.
  const uniqueTemplates = [...new Map(templates.map(template => [template.id, template])).values()];
  return [
    ...uniqueTemplates,
    ...RESUME_TEMPLATES.filter(template => !uniqueTemplates.some(item => item.id === template.id)),
  ];
}

type NormalizedSection = {
  id: string;
  type: ResumeSectionType;
  title: string;
  content: unknown;
  position: number;
};

const SECTION_TYPES: ResumeSectionType[] = [
  'SUMMARY',
  'EDUCATION',
  'EXPERIENCE',
  'SKILLS',
  'PROJECTS',
  'CERTIFICATIONS',
];

function normalizeSections(value: unknown): NormalizedSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const section = asRecord(item);
    if (!section) return [];
    const type = String(
      section.sectionType ?? '',
    ).toUpperCase() as ResumeSectionType;
    if (!SECTION_TYPES.includes(type)) return [];
    const id = text(section.sectionId ?? section.id);
    if (!id) return [];
    return [
      {
        id,
        type,
        title: text(section.title, type),
        content: section.content,
        position:
          typeof section.position === 'number' ? section.position : index,
      },
    ];
  });
}

function asEntries(content: unknown, sectionId: string): ResumeEntry[] {
  const list = Array.isArray(content)
    ? content
    : content == null
    ? []
    : [content];
  return list.flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];
    return [
      {
        ...Object.fromEntries(
          Object.entries(record).map(([key, value]) => [key, text(value)]),
        ),
        id: `${sectionId}:${index}`,
        sectionId,
      } as ResumeEntry,
    ];
  });
}

export function normalizeResume(response: unknown): ResumeDocument {
  const body = unwrap(response);
  const outer = asRecord(body);
  const record =
    asRecord(outer?.resume) ??
    asRecord(outer?.preview) ??
    asRecord(outer?.resumePreview) ??
    outer;
  if (!record) throw new Error('The resume response is invalid.');
  const data = asRecord(record.resumeData) ?? record;
  const personal = asRecord(data.personalInfo) ?? asRecord(data.personal) ?? {};
  const sections = normalizeSections(data.sections ?? record.sections);
  const entries = (type: ResumeSectionType) =>
    sections
      .filter(section => section.type === type)
      .flatMap(section => asEntries(section.content, section.id));
  const summarySection = sections.find(section => section.type === 'SUMMARY');
  const summaryContent = summarySection?.content;
  const summary =
    typeof summaryContent === 'string'
      ? summaryContent
      : Array.isArray(summaryContent)
      ? text(summaryContent[0])
      : text(
          asRecord(summaryContent)?.text ?? asRecord(summaryContent)?.summary,
        );
  const skillSections = sections.filter(section => section.type === 'SKILLS');
  const skills = skillSections.flatMap(section =>
    (Array.isArray(section.content) ? section.content : [section.content])
      .map(value =>
        typeof value === 'string' ? value : text(asRecord(value)?.name),
      )
      .filter(Boolean),
  );
  const firstSection = (type: ResumeSectionType) =>
    sections.find(section => section.type === type)?.id;
  const firstPosition = (type: ResumeSectionType) =>
    sections.find(section => section.type === type)?.position;
  return {
    id: text(record.resumeId ?? record.id),
    title: text(record.title, 'Untitled resume'),
    template: templateCode(record.templateCode ?? record.template),
    createdAt: text(record.createdAt),
    updatedAt: text(record.updatedAt ?? record.modifiedAt ?? record.createdAt),
    personal: {
      fullName: text(personal.fullName),
      email: text(personal.email),
      phone: text(personal.phone),
      location: text(personal.location),
      summary,
    },
    education: entries('EDUCATION'),
    experience: entries('EXPERIENCE'),
    skills,
    projects: entries('PROJECTS'),
    certifications: entries('CERTIFICATIONS'),
    sectionIds: {
      summary: firstSection('SUMMARY'),
      education: firstSection('EDUCATION'),
      experience: firstSection('EXPERIENCE'),
      skills: firstSection('SKILLS'),
      projects: firstSection('PROJECTS'),
      certifications: firstSection('CERTIFICATIONS'),
    },
    sectionPositions: {
      summary: firstPosition('SUMMARY'),
      education: firstPosition('EDUCATION'),
      experience: firstPosition('EXPERIENCE'),
      skills: firstPosition('SKILLS'),
      projects: firstPosition('PROJECTS'),
      certifications: firstPosition('CERTIFICATIONS'),
    },
  };
}

function normalizeResumeList(response: unknown): ResumeDocument[] {
  const body = unwrap(response);
  const record = asRecord(body);
  const list = Array.isArray(body)
    ? body
    : record?.resumes ?? record?.items ?? record?.content;
  if (!Array.isArray(list)) {
    throw new Error('The resume list response is invalid.');
  }
  return list.map(normalizeResume);
}

function normalizeSectionId(response: unknown): string {
  const record = asRecord(unwrap(response));
  const section = asRecord(record?.section);
  const id = text(
    record?.sectionId ?? record?.id ?? section?.sectionId ?? section?.id,
  );
  if (!id) throw new Error('The server did not return the saved section ID.');
  return id;
}

export function createPdfDownloadConfig(
  fileName: string,
  platform: typeof Platform.OS = Platform.OS,
) {
  if (platform === 'android') {
    return ReactNativeBlobUtil.config({
      timeout: ENV.REQUEST_TIMEOUT_MS,
      addAndroidDownloads: {
        useDownloadManager: true,
        path: `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`,
        title: fileName,
        description: 'Resume PDF',
        mime: 'application/pdf',
        mediaScannable: true,
        notification: true,
      },
    });
  }
  return ReactNativeBlobUtil.config({
    path: `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`,
    timeout: ENV.REQUEST_TIMEOUT_MS,
  });
}

export const resumeApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getResumeTemplates: build.query<ResumeTemplate[], void>({
      query: () => '/job-seeker/resumes/templates',
      transformResponse: normalizeResumeTemplates,
    }),
    getResumes: build.query<ResumeDocument[], void>({
      query: () => '/job-seeker/resumes',
      transformResponse: normalizeResumeList,
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Resume' as const, id })),
              { type: 'Resume' as const, id: 'LIST' },
            ]
          : [{ type: 'Resume' as const, id: 'LIST' }],
    }),
    getResume: build.query<ResumeDocument, string>({
      query: resumeId => `/job-seeker/resumes/${encodeURIComponent(resumeId)}`,
      transformResponse: normalizeResume,
      providesTags: (_result, _error, id) => [{ type: 'Resume', id }],
    }),
    createResume: build.mutation<ResumeDocument, ResumeCreateRequest>({
      query: body => ({ url: '/job-seeker/resumes', method: 'POST', body }),
      transformResponse: normalizeResume,
      invalidatesTags: [{ type: 'Resume', id: 'LIST' }],
    }),
    updateResume: build.mutation<
      void,
      { resumeId: string; body: ResumeUpdateRequest }
    >({
      query: ({ resumeId, body }) => ({
        url: `/job-seeker/resumes/${encodeURIComponent(resumeId)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Resume', id: resumeId },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
    deleteResume: build.mutation<void, string>({
      query: resumeId => ({
        url: `/job-seeker/resumes/${encodeURIComponent(resumeId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, resumeId) => [
        { type: 'Resume', id: resumeId },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
    addResumeSection: build.mutation<
      string,
      { resumeId: string; body: ResumeSectionRequest }
    >({
      query: ({ resumeId, body }) => ({
        url: `/job-seeker/resumes/${encodeURIComponent(resumeId)}/sections`,
        method: 'POST',
        body,
      }),
      transformResponse: normalizeSectionId,
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Resume', id: resumeId },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
    updateResumeSection: build.mutation<
      void,
      { resumeId: string; sectionId: string; body: ResumeSectionRequest }
    >({
      query: ({ resumeId, sectionId, body }) => ({
        url: `/job-seeker/resumes/${encodeURIComponent(
          resumeId,
        )}/sections/${encodeURIComponent(sectionId)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Resume', id: resumeId },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
    deleteResumeSection: build.mutation<
      void,
      { resumeId: string; sectionId: string }
    >({
      query: ({ resumeId, sectionId }) => ({
        url: `/job-seeker/resumes/${encodeURIComponent(
          resumeId,
        )}/sections/${encodeURIComponent(sectionId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { resumeId }) => [
        { type: 'Resume', id: resumeId },
        { type: 'Resume', id: 'LIST' },
      ],
    }),
    getResumePreview: build.query<ResumeDocument, string>({
      query: resumeId =>
        `/job-seeker/resumes/${encodeURIComponent(resumeId)}/preview`,
      transformResponse: normalizeResume,
      providesTags: (_result, _error, id) => [{ type: 'Resume', id }],
    }),
    downloadResumePdf: build.mutation<string, string>({
      async queryFn(resumeId, api) {
        const token = (api.getState() as RootState).auth.token;
        if (!token) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Sign in to download this resume.',
            },
          };
        }
        const fileName = `resume-${resumeId.replace(
          /[^a-zA-Z0-9_-]/g,
          '_',
        )}.pdf`;
        const headers = {
          Authorization: `Bearer ${token}`,
          ...(ENV.API_BASE_URL.includes('ngrok')
            ? { 'ngrok-skip-browser-warning': 'true' }
            : {}),
        };
        try {
          const response = await createPdfDownloadConfig(fileName).fetch(
            'GET',
            `${ENV.API_BASE_URL}/job-seeker/resumes/${encodeURIComponent(
              resumeId,
            )}/pdf`,
            headers,
          );
          const status = response.info().status;
          if (status < 200 || status >= 300) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: `PDF download failed (${status}).`,
              },
            };
          }
          const downloadedPath = response.path();
          if (Platform.OS === 'ios') {
            ReactNativeBlobUtil.ios.previewDocument(downloadedPath);
          }
          return { data: downloadedPath };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error:
                error instanceof Error
                  ? error.message
                  : 'Could not download the resume PDF.',
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetResumeTemplatesQuery,
  useGetResumesQuery,
  useGetResumeQuery,
  useCreateResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useAddResumeSectionMutation,
  useUpdateResumeSectionMutation,
  useDeleteResumeSectionMutation,
  useGetResumePreviewQuery,
  useDownloadResumePdfMutation,
} = resumeApi;
