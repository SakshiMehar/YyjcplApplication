/**
 * One command for daily work:
 *
 *   npm run dev          Metro + keeps the phone linked (keys r / a / d work as usual)
 *   npm run dev:build    same, and also builds + installs the app on the phone
 *                        (only needed after installing a native library)
 *
 * Press Ctrl+C to stop everything.
 */
const { spawn } = require('child_process');
const http = require('http');
const { startPhoneWatch } = require('./keep-phone-connected');

const withBuild = process.argv.includes('--build');
const run = (script, stdin) =>
  spawn('npm', ['run', script], { stdio: [stdin, 'inherit', 'inherit'], shell: true });

const metroIsUp = () =>
  new Promise(resolve => {
    http
      .get('http://localhost:8081/status', res => resolve(res.statusCode === 200))
      .on('error', () => resolve(false));
  });

async function main() {
  if (await metroIsUp()) {
    console.log('Metro is already running on port 8081 – stop the other terminal first (Ctrl+C there).');
    process.exit(1);
  }

  const watcher = startPhoneWatch();

  // Metro gets this terminal's keyboard, so r (reload), a (build Android), d (dev menu) work
  const metro = run('start', 'inherit');
  metro.on('exit', code => {
    clearInterval(watcher);
    process.exit(code ?? 0);
  });

  if (withBuild) {
    while (!(await metroIsUp())) {
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log('\nMetro is ready – building and installing the app on your phone…\n');
    run('android:phone', 'ignore').on('exit', code =>
      console.log(code === 0 ? '\n✔ App installed.\n' : '\n✖ Build/install failed – see the messages above.\n'),
    );
  }
}

main();
