import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

function normalizeBuildEnv(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return 'dev';
  if (value === 'preview') return 'preview';
  if (value === 'production' || value === 'prod') return 'prod';
  if (value === 'development' || value === 'dev' || value === 'local') return 'dev';
  return value;
}

function sanitizeBuildSha(raw) {
  const value = String(raw || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '');
  if (!value) return 'unknown';
  return value.slice(0, 40);
}

const buildEnv = normalizeBuildEnv(process.env.BUILD_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV);
const buildSha = sanitizeBuildSha(
  process.env.BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.BUILD_ID
);
const buildId = (process.env.BUILD_ID || '').trim() || (buildSha !== 'unknown' ? buildSha : `${buildEnv}-${Date.now()}`);
const buildTime = (process.env.BUILD_TIME || '').trim() || new Date().toISOString();

function runNode(args) {
  return spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      BUILD_ENV: buildEnv,
      BUILD_SHA: buildSha,
      BUILD_ID: buildId,
      BUILD_TIME: buildTime
    }
  });
}

function exitOnFailure(result) {
  const status = typeof result.status === 'number' ? result.status : 1;
  if (status !== 0) {
    process.exit(status);
  }
}

async function replaceInFile(filePath, replacements) {
  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    return;
  }

  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }

  if (next !== content) {
    await fs.writeFile(filePath, next, 'utf8');
  }
}

async function copyFileIfExists(sourcePath, targetPath) {
  try {
    await fs.copyFile(sourcePath, targetPath);
  } catch (err) {
    if (err && err.code === 'ENOENT') return;
    throw err;
  }
}

async function readAppVersion() {
  const sourceVersionFile = path.join(rootDir, 'public', 'version.json');
  try {
    const raw = await fs.readFile(sourceVersionFile, 'utf8');
    const parsed = JSON.parse(raw);
    const version = typeof parsed?.app_version === 'string' ? parsed.app_version.trim() : '';
    return version || 'local';
  } catch {
    return 'local';
  }
}

const appVersion = await readAppVersion();

exitOnFailure(runNode([viteBin, 'build']));

const distDir = path.join(rootDir, 'dist');
await fs.mkdir(distDir, { recursive: true });

await Promise.all([
  copyFileIfExists(path.join(rootDir, 'public', 'privacy.html'), path.join(distDir, 'privacy.html')),
  copyFileIfExists(path.join(rootDir, 'public', 'offline.html'), path.join(distDir, 'offline.html'))
]);

await replaceInFile(path.join(distDir, 'index.html'), [
  ['__BUILD_ID__', buildId],
  ['__BUILD_ENV__', buildEnv],
  ['__BUILD_SHA__', buildSha],
  ['__BUILD_TIME__', buildTime],
  ['__APP_VERSION__', appVersion],
  ['href="mobile.css"', `href="mobile.css?v=${buildId}"`],
  ['src="questions.js"', `src="questions.js?v=${buildId}"`],
  ['src="sound.js"', `src="sound.js?v=${buildId}"`],
  ['src="capacitor.js"', `src="capacitor.js?v=${buildId}"`]
]);

const versionFile = path.join(distDir, 'version.json');
try {
  await fs.access(versionFile);
} catch {
  await fs.writeFile(
    versionFile,
    '{\n  "app_version": "__APP_VERSION__",\n  "build": "__BUILD_ID__",\n  "build_env": "__BUILD_ENV__",\n  "build_sha": "__BUILD_SHA__",\n  "generated_at_utc": "__BUILD_TIME__"\n}\n',
    'utf8'
  );
}

await replaceInFile(versionFile, [
  ['__APP_VERSION__', appVersion],
  ['__BUILD_ID__', buildId],
  ['__BUILD_ENV__', buildEnv],
  ['__BUILD_SHA__', buildSha],
  ['__BUILD_TIME__', buildTime]
]);

const noJekyllFile = path.join(distDir, '.nojekyll');
try {
  await fs.access(noJekyllFile);
} catch {
  await fs.writeFile(noJekyllFile, '', 'utf8');
}

console.log(`[build:web] version=${appVersion} env=${buildEnv} sha=${buildSha} build=${buildId} time=${buildTime}`);
