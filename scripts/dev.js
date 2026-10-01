// One-command dev runner:  npm run dev
// - creates server/.env from the example if missing
// - installs any missing dependencies
// - starts the API (auto-creates + seeds the MySQL database) and the Vite frontend
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = path.join(root, 'server');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const shell = process.platform === 'win32';

const log = (m) => console.log(`\x1b[35m[dev]\x1b[0m ${m}`);

// 1. env file
const envFile = path.join(server, '.env');
if (!fs.existsSync(envFile)) {
  fs.copyFileSync(path.join(server, '.env.example'), envFile);
  log('Created server/.env from .env.example — set DB_PASS (your MySQL password) and JWT_SECRET there.');
}

// 2. dependencies
const needs = [
  [root, 'vite'],
  [server, 'express'],
];
for (const [dir, probe] of needs) {
  if (!fs.existsSync(path.join(dir, 'node_modules', probe))) {
    log(`Installing dependencies in ${path.relative(root, dir) || '.'} …`);
    const r = spawnSync(npm, ['install'], { cwd: dir, stdio: 'inherit', shell });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}

// 3. start both processes
const procs = [];
const run = (name, cmd, args, cwd) => {
  const p = spawn(cmd, args, { cwd, stdio: 'inherit' });
  p.on('exit', (code) => {
    if (code) log(`${name} exited with code ${code}`);
    shutdown(code ?? 0);
  });
  procs.push(p);
};

let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  procs.forEach((p) => p.kill());
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

log('Starting API on http://localhost:5000 and site on http://localhost:5173');
run('api', process.execPath, ['--watch', 'server.js'], server);
run('web', process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--open'], root);
