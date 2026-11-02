import { ENV } from '../../../config/env';

export function resolveBackendUrl(url: string): string {
  const value = url.trim();
  if (/^https?:\/\//i.test(value)) return value;

  const serverUrl = ENV.API_BASE_URL.replace(/\/api\/?$/, '');
  return `${serverUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export function resolveResumeUrl(resumeUrl: string): string {
  return resolveBackendUrl(resumeUrl);
}
