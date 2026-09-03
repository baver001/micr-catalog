import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const requiredFiles = [
  'infra/deploy.sh',
  'infra/nginx-micr.fun.conf',
  'infra/pm2.config.json',
  '.github/workflows/deploy.yml',
  'server/api/index.js',
  'sw.js',
  'data/i18n/locales.json',
  'play/mapmapmaps/index.html',
];

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(root, relativePath)), `missing deploy file: ${relativePath}`);
}

const deployScript = read('infra/deploy.sh');
for (const token of ['sw.js', 'admin', 'locales', 'release.commit', 'FEEDBACK_FILE', 'git status --porcelain', 'npm ci --omit=dev', 'pm2']) {
  assert(deployScript.includes(token), `deploy script does not cover: ${token}`);
}
assert(!deployScript.includes('reset --hard'), 'deploy script must not reset the VPS checkout');

const workflow = read('.github/workflows/deploy.yml');
for (const token of ['DEPLOY_HOST', 'DEPLOY_USER', 'DEPLOY_SSH_KEY', 'DEPLOY_KNOWN_HOSTS', 'git pull --ff-only', 'git status --porcelain', './infra/deploy.sh']) {
  assert(workflow.includes(token), `deploy workflow is missing: ${token}`);
}

const pm2 = JSON.parse(read('infra/pm2.config.json'));
assert(pm2.apps?.[0]?.env?.FEEDBACK_FILE, 'PM2 must configure a persistent FEEDBACK_FILE');

console.log(`deploy config OK: ${requiredFiles.length} files, ${pm2.apps.length} PM2 app`);
