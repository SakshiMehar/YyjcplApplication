/**
 * Prints API responses to the console in debug builds.
 * They appear in the Metro terminal (`npm start`), in React Native DevTools
 * (press "j" in Metro) and in `npm run logs`.
 */
export function logApi(label: string, status: number | string | undefined, body: unknown) {
  if (!__DEV__) {
    return;
  }
  console.log(`[API] ${label} → ${status ?? '?'}\n${JSON.stringify(body, null, 2)}`);
}
