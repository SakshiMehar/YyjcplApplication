/**
 * Keeps the USB links between the phone and your PC alive:
 *   8081 -> Metro (JS bundle). The backend is reached through ngrok (see src/config/env.ts).
 * Xiaomi / some phones reset the USB connection now and then, which silently
 * removes `adb reverse` -> app shows "Unable to load script" or API calls fail.
 *
 * Usage: npm run phone:watch  (or automatically as part of  npm run dev)
 */
const { execSync } = require('child_process');
const path = require('path');

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const adb = sdk ? `"${path.join(sdk, 'platform-tools', 'adb')}"` : 'adb';
const PORTS = [8081];
const INTERVAL_MS = 3000;

let lastState = '';

function log(state, msg) {
  if (state !== lastState) {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
    lastState = state;
  }
}

function tick() {
  try {
    const devices = execSync(`${adb} devices`, { encoding: 'utf8' })
      .split('\n')
      .slice(1)
      .filter(l => l.trim().endsWith('\tdevice'));
    if (devices.length === 0) {
      return log('nodevice', 'No phone connected (check cable / allow USB debugging)…');
    }
    const list = execSync(`${adb} reverse --list`, { encoding: 'utf8' });
    // each line looks like: "UsbFfs tcp:8081 tcp:8081"
    const missing = PORTS.filter(p => !new RegExp(`tcp:${p}\\s+tcp:${p}`).test(list));
    if (missing.length) {
      missing.forEach(p => execSync(`${adb} reverse tcp:${p} tcp:${p}`));
      lastState = '';
      return log('restored', `Link restored (ports ${missing.join(', ')}) – press "r" in Metro to reload`);
    }
    log('ok', 'Phone linked to Metro ✔');
  } catch (e) {
    log('error', `adb error: ${e.message.split('\n')[0]}`);
  }
}

/** Starts watching; used by scripts/dev.js and when run directly. */
function startPhoneWatch() {
  tick();
  return setInterval(tick, INTERVAL_MS);
}

module.exports = { startPhoneWatch };

if (require.main === module) {
  console.log('Watching phone ↔ PC links. Press Ctrl+C to stop.');
  startPhoneWatch();
}
