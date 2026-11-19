jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: { dirs: { DocumentDir: '/documents', DownloadDir: '/downloads' } },
    config: jest.fn((options: unknown) => ({ options })),
    android: {},
    ios: {},
  },
}));

import {
  createPdfDownloadConfig,
  normalizeResume,
  normalizeResumeTemplates,
} from './resumeApi';

describe('resume API response mapping', () => {
  it('uses the public Downloads directory and Download Manager on Android', () => {
    createPdfDownloadConfig('resume-123.pdf', 'android');
    const blobUtil = jest.requireMock('react-native-blob-util').default;
    expect(blobUtil.config).toHaveBeenLastCalledWith({
      timeout: expect.any(Number),
      addAndroidDownloads: {
        useDownloadManager: true,
        path: '/downloads/resume-123.pdf',
        title: 'resume-123.pdf',
        description: 'Resume PDF',
        mime: 'application/pdf',
        mediaScannable: true,
        notification: true,
      },
    });
  });

  it('uses the app documents directory on iOS', () => {
    createPdfDownloadConfig('resume-123.pdf', 'ios');
    const blobUtil = jest.requireMock('react-native-blob-util').default;
    expect(blobUtil.config).toHaveBeenLastCalledWith({
      path: '/documents/resume-123.pdf',
      timeout: expect.any(Number),
    });
  });

  it('maps server template codes into the app templates', () => {
    expect(
      normalizeResumeTemplates({
        templates: [
          { templateCode: 'CLASSIC' },
          { templateCode: 'MODERN' },
          { templateCode: 'CREATIVE' },
          { templateCode: 'MINIMAL' },
        ],
      }).map(template => template.id),
    ).toEqual(['CLASSIC', 'MODERN', 'CREATIVE', 'MINIMAL']);
  });

  it('keeps all four supported designs when the API returns only Classic', () => {
    expect(
      normalizeResumeTemplates({ templates: [{ templateCode: 'CLASSIC' }] }).map(template => template.id),
    ).toEqual(['CLASSIC', 'MODERN', 'MINIMAL', 'CREATIVE']);
  });

  it('maps server resume data and sections into the editor model', () => {
    expect(
      normalizeResume({
        resumeId: 'resume-123',
        title: 'Java Developer Resume',
        templateCode: 'MODERN',
        createdAt: '2026-01-01T00:00:00Z',
        resumeData: {
          personalInfo: {
            fullName: 'Asha Kumar',
            email: 'asha@example.com',
            phone: '9876543210',
            location: 'Bengaluru',
          },
          sections: [
            {
              sectionId: 'summary-1',
              sectionType: 'SUMMARY',
              title: 'Professional Summary',
              content: 'Java and Spring Boot developer.',
              position: 0,
            },
            {
              sectionId: 'skills-1',
              sectionType: 'SKILLS',
              title: 'Skills',
              content: ['Java', 'Spring Boot', 'MySQL'],
              position: 1,
            },
            {
              sectionId: 'experience-1',
              sectionType: 'EXPERIENCE',
              title: 'Work Experience',
              content: [{ company: 'Acme Ltd', role: 'Backend Developer' }],
              position: 2,
            },
          ],
        },
      }),
    ).toMatchObject({
      id: 'resume-123',
      title: 'Java Developer Resume',
      template: 'MODERN',
      personal: {
        fullName: 'Asha Kumar',
        email: 'asha@example.com',
        phone: '9876543210',
        location: 'Bengaluru',
        summary: 'Java and Spring Boot developer.',
      },
      skills: ['Java', 'Spring Boot', 'MySQL'],
      experience: [
        {
          id: 'experience-1:0',
          sectionId: 'experience-1',
          company: 'Acme Ltd',
          role: 'Backend Developer',
        },
      ],
      sectionIds: {
        summary: 'summary-1',
        skills: 'skills-1',
        experience: 'experience-1',
      },
    });
  });
});
