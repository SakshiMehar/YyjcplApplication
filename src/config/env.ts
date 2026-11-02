/**
 * Environment config.
 *
 * DEV: backend exposed through ngrok, so it works on any phone/emulator over the
 * internet (no USB port forwarding needed). The ngrok URL changes when ngrok is
 * restarted – update DEV_API_URL then.
 *
 * Replace the production URL with your real backend URL before release.
 */
const DEV_API_URL = 'https://impish-earwig-epiphany.ngrok-free.dev';
const PROD_API_URL = 'https://api.yyjcpl.com';

export const ENV = {
  API_BASE_URL: `${__DEV__ ? DEV_API_URL : PROD_API_URL}/api`,
  REQUEST_TIMEOUT_MS: 20000,
} as const;
