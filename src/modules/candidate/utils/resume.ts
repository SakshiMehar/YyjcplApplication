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

export function resolveProfilePictureUrl(imageUrl: string): string {
  const value = imageUrl.trim();
  if (!value) return value;

  const image = new URL(value, ENV.API_BASE_URL);
  const api = new URL(ENV.API_BASE_URL);
  const isLocalhost =
    image.hostname === 'localhost' ||
    image.hostname === '127.0.0.1' ||
    image.hostname === '[::1]';
  if (image.origin !== api.origin && !isLocalhost) return value;

  const fileName = image.pathname.split('/').filter(Boolean).pop();
  if (!fileName) return resolveBackendUrl(value);

  let decodedFileName = fileName;
  try {
    decodedFileName = decodeURIComponent(fileName);
  } catch {
    // Keep malformed encoded names unchanged so the server can report the error.
  }

  return resolveBackendUrl(`/api/profile-pictures/${encodeURIComponent(decodedFileName)}`);
}

export function getProfilePictureHeaders(
  imageUrl: string | undefined,
  token: string | null | undefined,
): Record<string, string> | undefined {
  if (!imageUrl || !token) return undefined;

  const resolvedUrl = resolveProfilePictureUrl(imageUrl);
  try {
    const imageHost = new URL(resolvedUrl);
    const apiHost = new URL(ENV.API_BASE_URL);
    if (imageHost.origin !== apiHost.origin) return undefined;

    return {
      Authorization: `Bearer ${token}`,
      ...(apiHost.hostname.includes('ngrok')
        ? { 'ngrok-skip-browser-warning': 'true' }
        : {}),
    };
  } catch {
    return undefined;
  }
}
