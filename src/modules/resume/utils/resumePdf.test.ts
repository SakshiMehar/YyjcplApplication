jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: { DocumentDir: '/documents', DownloadDir: '/downloads' },
      exists: jest.fn().mockResolvedValue(true),
      mkdir: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
    },
    android: {
      actionViewIntent: jest.fn().mockResolvedValue(true),
      addCompleteDownload: jest.fn().mockResolvedValue(undefined),
      getSDCardDir: jest.fn().mockResolvedValue('/external/app'),
    },
    ios: { previewDocument: jest.fn() },
    MediaCollection: {
      copyToMediaStore: jest.fn().mockResolvedValue('content://download'),
    },
  },
}));

import ReactNativeBlobUtil from 'react-native-blob-util';
import { PermissionsAndroid, Platform } from 'react-native';
import type { ResumeDocument } from '../types/resume.types';
import {
  createResumePdf,
  downloadResumePdf,
  openDownloadedResumePdf,
} from './resumePdf';

const resume: ResumeDocument = {
  id: 'resume-123',
  title: 'Java Developer Resume',
  template: 'MODERN',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  personal: {
    fullName: 'Asha Kumar',
    email: 'asha@example.com',
    phone: '9876543210',
    location: 'Bengaluru',
    summary: 'Java and Spring Boot developer with 3 years of experience.',
  },
  experience: [
    {
      id: 'experience-1',
      role: 'Backend Developer',
      company: 'Acme Ltd',
      duration: '2023-2026',
      description: 'Built REST APIs using Spring Boot.',
    },
  ],
  education: [],
  skills: ['Java', 'Spring Boot', 'MySQL'],
  projects: [],
  certifications: [],
  sectionIds: {},
};

describe('resume PDF rendering', () => {
  const platformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS');
  const versionDescriptor = Object.getOwnPropertyDescriptor(Platform, 'Version');

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(ReactNativeBlobUtil.fs.exists)
      .mockResolvedValue(true);
    jest.mocked(ReactNativeBlobUtil.fs.mkdir).mockResolvedValue(undefined);
    jest
      .mocked(ReactNativeBlobUtil.fs.writeFile)
      .mockResolvedValue(undefined);
    jest
      .mocked(ReactNativeBlobUtil.MediaCollection.copyToMediaStore)
      .mockResolvedValue('content://download');
    jest
      .mocked(ReactNativeBlobUtil.android.getSDCardDir)
      .mockResolvedValue('/external/app');
    jest
      .mocked(ReactNativeBlobUtil.android.addCompleteDownload)
      .mockResolvedValue(undefined);
    jest
      .mocked(ReactNativeBlobUtil.android.actionViewIntent)
      .mockResolvedValue(true);
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      writable: true,
      value: 'android',
    });
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      writable: true,
      value: 34,
    });
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(
      PermissionsAndroid.RESULTS.GRANTED,
    );
  });

  afterEach(() => {
    if (platformDescriptor) {
      Object.defineProperty(Platform, 'OS', platformDescriptor);
    }
    if (versionDescriptor) {
      Object.defineProperty(Platform, 'Version', versionDescriptor);
    }
    jest.restoreAllMocks();
  });

  it('writes the generated PDF as an ASCII byte array', async () => {
    const savedPdf = await downloadResumePdf(resume);

    const [path, bytes, encoding] = jest.mocked(
      ReactNativeBlobUtil.fs.writeFile,
    ).mock.calls[0];
    expect(path).toBe(
      '/external/app/ResumeDownloads/Asha-Kumar-resume-123.pdf',
    );
    expect(encoding).toBe('ascii');
    expect(Array.isArray(bytes)).toBe(true);
    expect(String.fromCharCode(...(bytes as number[]).slice(0, 8))).toBe(
      '%PDF-1.4',
    );
    if (savedPdf.uri) {
      expect(savedPdf.fileName).toBe('Asha-Kumar-resume-123.pdf');
      expect(savedPdf.uri).toBe('content://download');
      expect(
        ReactNativeBlobUtil.MediaCollection.copyToMediaStore,
      ).toHaveBeenCalledWith(
        {
          name: 'Asha-Kumar-resume-123.pdf',
          parentFolder: '',
          mimeType: 'application/pdf',
        },
        'Download',
        '/external/app/ResumeDownloads/Asha-Kumar-resume-123.pdf',
      );
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      expect(ReactNativeBlobUtil.android.addCompleteDownload).toHaveBeenCalledWith(
        {
          title: 'Asha-Kumar-resume-123.pdf',
          description: 'Your resume PDF is ready to view.',
          mime: 'application/pdf',
          path: '/external/app/ResumeDownloads/Asha-Kumar-resume-123.pdf',
          showNotification: true,
        },
      );
      expect(savedPdf.notificationShown).toBe(true);
    }
  });

  it('keeps the successful save when Android cannot access a public file path', async () => {
    jest.mocked(ReactNativeBlobUtil.fs.exists).mockResolvedValue(false);

    const savedPdf = await downloadResumePdf(resume);

    expect(savedPdf.uri).toBe('content://download');
    expect(savedPdf.notificationShown).toBe(false);
    expect(savedPdf.notificationError).toContain('cannot access');
    expect(
      ReactNativeBlobUtil.android.addCompleteDownload,
    ).not.toHaveBeenCalled();
  });

  it('keeps the successful save if Android notification registration fails', async () => {
    jest
      .mocked(ReactNativeBlobUtil.android.addCompleteDownload)
      .mockRejectedValue(new Error('Android notification unavailable'));

    const savedPdf = await downloadResumePdf(resume);

    expect(savedPdf.uri).toBe('content://download');
    expect(savedPdf.notificationShown).toBe(false);
    expect(savedPdf.notificationError).toBe(
      'Android notification unavailable',
    );
  });

  it('saves the PDF without a notification when permission is denied', async () => {
    jest
      .mocked(PermissionsAndroid.request)
      .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    const savedPdf = await downloadResumePdf(resume);

    expect(savedPdf.notificationShown).toBe(false);
    expect(savedPdf.notificationError).toContain('permission was denied');
    expect(savedPdf.notificationPermissionDenied).toBe(true);
    expect(
      ReactNativeBlobUtil.android.addCompleteDownload,
    ).not.toHaveBeenCalled();
  });

  it('opens the saved Android Downloads URI with a PDF viewer', async () => {
    await openDownloadedResumePdf('content://download');

    expect(ReactNativeBlobUtil.android.actionViewIntent).toHaveBeenCalledWith(
      'content://download',
      'application/pdf',
      'Open resume PDF',
    );
  });

  it('creates a styled PDF using the selected template and resume content', () => {
    const pdf = createResumePdf(resume);

    expect(pdf).toContain('%PDF-1.4');
    expect(pdf).toContain('/Count 1');
    expect(pdf).toContain('0.059 0.463 0.431 rg');
    expect(pdf).toContain('(Asha Kumar) Tj');
    expect(pdf).toContain('(PROFILE) Tj');
    expect(pdf).toContain('(EXPERIENCE) Tj');
    expect(pdf).toContain('(Java | Spring Boot | MySQL) Tj');
    expect(pdf).toContain('startxref');
    expect(pdf.endsWith('%%EOF')).toBe(true);
    expect([...pdf].every(character => character.charCodeAt(0) <= 127)).toBe(
      true,
    );
  });

  it('uses a distinct accent for each of the four resume templates', () => {
    const templates: Array<[ResumeDocument['template'], string]> = [
      ['CLASSIC', '0.141 0.294 0.459'],
      ['MODERN', '0.059 0.463 0.431'],
      ['CREATIVE', '0.486 0.231 0.929'],
      ['MINIMAL', '0.267 0.251 0.235'],
    ];

    templates.forEach(([template, accent]) => {
      const pdf = createResumePdf({ ...resume, template });
      expect(pdf).toContain(`${accent} rg`);
    });
  });

  it('adds pages when resume content exceeds one page', () => {
    const longResume = {
      ...resume,
      experience: Array.from({ length: 20 }, (_, index) => ({
        id: `experience-${index}`,
        role: `Developer ${index}`,
        description: 'Built reliable services and maintained production systems. '.repeat(5),
      })),
    };
    const pdf = createResumePdf(longResume);

    expect(pdf).toMatch(/\/Count [2-9]\d*/);
    expect(pdf).toContain('(Developer 19) Tj');
  });
});
