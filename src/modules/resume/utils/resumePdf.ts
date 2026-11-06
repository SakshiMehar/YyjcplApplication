import { PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import type { ResumeDocument, ResumeEntry } from '../types/resume.types';

type PdfPage = { commands: string[]; y: number };
type RGB = [number, number, number];

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 48;
const RIGHT = PAGE_WIDTH - LEFT;
const DARK: RGB = [0.12, 0.14, 0.18];
const MUTED: RGB = [0.36, 0.39, 0.43];

const TEMPLATE_ACCENTS: Record<ResumeDocument['template'], RGB> = {
  CLASSIC: [0.141, 0.294, 0.459],
  MODERN: [0.059, 0.463, 0.431],
  CREATIVE: [0.486, 0.231, 0.929],
  MINIMAL: [0.267, 0.251, 0.235],
};

function color(rgb: RGB): string {
  return rgb.map(value => value.toFixed(3)).join(' ');
}

function safeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/[\\()]/g, character => `\\${character}`);
}

function wrapText(value: string, fontSize: number, width = RIGHT - LEFT): string[] {
  const maxCharacters = Math.max(12, Math.floor(width / (fontSize * 0.52)));
  const lines: string[] = [];
  value.split(/\r?\n/).forEach(paragraph => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      return;
    }
    let line = '';
    words.forEach(word => {
      if (line && `${line} ${word}`.length > maxCharacters) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function addText(
  page: PdfPage,
  text: string,
  options: { size?: number; bold?: boolean; ink?: RGB; x?: number; width?: number } = {},
): PdfPage {
  const size = options.size ?? 10;
  const x = options.x ?? LEFT;
  const lines = wrapText(text, size, options.width);
  lines.forEach(line => {
    if (page.y > PAGE_HEIGHT - 54) {
      page = newPage();
    }
    const font = options.bold ? 'F2' : 'F1';
    const y = PAGE_HEIGHT - page.y;
    page.commands.push(
      `BT /${font} ${size} Tf ${color(options.ink ?? DARK)} rg 1 0 0 1 ${x} ${y.toFixed(2)} Tm (${safeText(line)}) Tj ET`,
    );
    page.y += size * 1.45;
  });
  return page;
}

function newPage(): PdfPage {
  const page = { commands: [] as string[], y: 58 };
  pages.push(page);
  return page;
}

let pages: PdfPage[] = [];

function addRule(page: PdfPage, accent: RGB): void {
  const y = PAGE_HEIGHT - page.y + 3;
  page.commands.push(
    `${color(accent)} RG 0.8 w ${LEFT} ${y.toFixed(2)} m ${RIGHT} ${y.toFixed(2)} l S`,
  );
  page.y += 12;
}

function addSection(
  page: PdfPage,
  title: string,
  accent: RGB,
  writeContent: (current: PdfPage) => PdfPage,
): PdfPage {
  if (page.y > PAGE_HEIGHT - 110) page = newPage();
  page.y += 12;
  page = addText(page, title.toUpperCase(), {
    size: 10,
    bold: true,
    ink: accent,
  });
  addRule(page, accent);
  page = writeContent(page);
  page.y += 5;
  return page;
}

function drawModernHeader(
  page: PdfPage,
  resume: ResumeDocument,
  accent: RGB,
): PdfPage {
  page.commands.push(
    `q ${color(accent)} rg 32 ${PAGE_HEIGHT - 142} ${PAGE_WIDTH - 64} 142 re f Q`,
  );
  const white: RGB = [1, 1, 1];
  page = addText(page, resume.personal.fullName || 'Your name', {
    size: 25,
    bold: true,
    ink: white,
    x: LEFT,
    width: RIGHT - LEFT,
  });
  page.y += 7;
  const contact = [
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
  ].filter(Boolean).join('  |  ') || 'Email  |  Phone  |  Location';
  if (contact) page = addText(page, contact, { size: 9, ink: white });
  page.y = 164;
  return page;
}

function drawHeader(page: PdfPage, resume: ResumeDocument, accent: RGB): PdfPage {
  if (resume.template === 'MODERN') {
    return drawModernHeader(page, resume, accent);
  }
  page = addText(page, resume.personal.fullName || 'Your name', {
    size: 25,
    bold: true,
    ink: accent,
    x: LEFT,
    width: RIGHT - LEFT,
  });
  const contact = [
    resume.personal.email,
    resume.personal.phone,
    resume.personal.location,
  ].filter(Boolean).join('  |  ') || 'Email  |  Phone  |  Location';
  if (contact) {
    page = addText(page, contact, {
      size: 9,
      ink: MUTED,
      x: LEFT,
      width: RIGHT - LEFT,
    });
  }
  page.y += 13;
  return page;
}

export function createResumePdf(resume: ResumeDocument): string {
  pages = [];
  let page = newPage();
  const accent = TEMPLATE_ACCENTS[resume.template] ?? TEMPLATE_ACCENTS.CLASSIC;
  page = drawHeader(page, resume, accent);

  if (resume.personal.summary) {
    page = addSection(page, 'Profile', accent, current => {
      return addText(current, resume.personal.summary, { size: 10, ink: MUTED });
    });
  }

  const addEntries = (
    title: string,
    entries: ResumeEntry[],
    getHeading: (entry: ResumeEntry) => string,
    getDetails: (entry: ResumeEntry) => string,
  ) => {
    if (!entries.length) return;
    page = addSection(page, title, accent, current => {
      entries.forEach(entry => {
        const heading = getHeading(entry);
        if (heading) current = addText(current, heading, { size: 10, bold: true });
        const details = getDetails(entry);
        if (details) current = addText(current, details, { size: 9, ink: MUTED });
        const description = entry.description?.trim();
        if (description) {
          current = addText(current, description, { size: 9, ink: MUTED });
        }
        current.y += 6;
      });
      return current;
    });
  };

  addEntries(
    'Experience',
    resume.experience,
    entry =>
      `${entry.role || entry.title || 'Position'}${
        entry.company ? `  |  ${entry.company}` : ''
      }`,
    entry =>
      [
        entry.duration,
        [entry.startDate, entry.endDate].filter(Boolean).join(' - '),
      ]
        .filter(Boolean)
        .join(' - '),
  );
  addEntries(
    'Education',
    resume.education,
    entry =>
      `${entry.degree || 'Degree'}${
        entry.institution ? `  |  ${entry.institution}` : ''
      }`,
    entry => [entry.startYear, entry.endYear].filter(Boolean).join(' - '),
  );
  if (resume.skills.length) {
    page = addSection(page, 'Skills', accent, current => {
      return addText(current, resume.skills.join('  |  '), {
        size: 10,
        ink: MUTED,
      });
    });
  }
  addEntries(
    'Projects',
    resume.projects,
    entry =>
      `${entry.name || 'Project'}${entry.link ? `  |  ${entry.link}` : ''}`,
    () => '',
  );
  addEntries(
    'Certifications',
    resume.certifications,
    entry => entry.name || 'Certification',
    entry => [entry.issuer, entry.date].filter(Boolean).join(' | '),
  );

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  pages.forEach((current, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    const stream = current.commands.join('\n');
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export type ResumePdfDownload = {
  fileName: string;
  uri?: string;
  notificationShown?: boolean;
  notificationError?: string;
  notificationPermissionDenied?: boolean;
};

export async function downloadResumePdf(
  resume: ResumeDocument,
): Promise<ResumePdfDownload> {
  const safeName = (resume.personal.fullName || resume.title || 'resume')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || 'resume';
  const fileName = `${safeName}-${resume.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  let path: string;
  if (Platform.OS === 'android') {
    const externalFilesDir = await ReactNativeBlobUtil.android.getSDCardDir();
    if (!externalFilesDir) {
      throw new Error('Android could not access app storage for the PDF.');
    }
    const resumeDirectory = `${externalFilesDir}/ResumeDownloads`;
    if (!(await ReactNativeBlobUtil.fs.exists(resumeDirectory))) {
      await ReactNativeBlobUtil.fs.mkdir(resumeDirectory);
    }
    path = `${resumeDirectory}/${fileName}`;
  } else {
    path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
  }
  const pdf = createResumePdf(resume);
  const bytes = Array.from(pdf, character => character.charCodeAt(0));
  await ReactNativeBlobUtil.fs.writeFile(path, bytes, 'ascii');

  if (Platform.OS === 'android') {
    const uri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      { name: fileName, parentFolder: '', mimeType: 'application/pdf' },
      'Download',
      path,
    );
    if (!uri) {
      throw new Error('The PDF was created, but could not be saved to Downloads.');
    }
    try {
      const notificationAllowed =
        Platform.Version < 33 ||
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )) === PermissionsAndroid.RESULTS.GRANTED;
      if (!notificationAllowed) {
        return {
          fileName,
          uri,
          notificationShown: false,
          notificationError: 'Notification permission was denied.',
          notificationPermissionDenied: true,
        };
      }
      if (!(await ReactNativeBlobUtil.fs.exists(path))) {
        return {
          fileName,
          uri,
          notificationShown: false,
          notificationError:
            'Android cannot access the saved resume file by filesystem path.',
        };
      }
      await ReactNativeBlobUtil.android.addCompleteDownload({
        title: fileName,
        description: 'Your resume PDF is ready to view.',
        mime: 'application/pdf',
        path,
        showNotification: true,
      });
      return { fileName, uri, notificationShown: true };
    } catch (error) {
      return {
        fileName,
        uri,
        notificationShown: false,
        notificationError:
          error instanceof Error
            ? error.message
            : 'Android could not post the download notification.',
      };
    }
  }
  if (Platform.OS === 'ios') {
    ReactNativeBlobUtil.ios.previewDocument(path);
    return { fileName };
  }
  throw new Error('PDF download is not supported on this device.');
}

export async function openDownloadedResumePdf(uri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('Opening a downloaded PDF this way is only supported on Android.');
  }
  const opened = await ReactNativeBlobUtil.android.actionViewIntent(
    uri,
    'application/pdf',
    'Open resume PDF',
  );
  if (opened === false) {
    throw new Error('No PDF viewer is available on this device.');
  }
}
