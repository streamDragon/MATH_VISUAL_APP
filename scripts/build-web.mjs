import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

const buildId = (process.env.BUILD_ID || '').trim() || `local-${Date.now()}`;
const buildTime = (process.env.BUILD_TIME || '').trim() || new Date().toISOString();

function runNode(args) {
  return spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: rootDir
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

async function bumpAppVersion() {
  const sourceVersionFile = path.join(rootDir, 'public', 'version.json');
  let versionData = {};

  try {
    const raw = await fs.readFile(sourceVersionFile, 'utf8');
    versionData = JSON.parse(raw);
  } catch {
    versionData = {};
  }

  const rawVersion = typeof versionData.app_version === 'string'
    ? versionData.app_version.trim()
    : '';
  const numericVersion = /^\d+$/.test(rawVersion) ? rawVersion : '';
  const width = Math.max(2, numericVersion.length || 2);
  const nextVersion = String((numericVersion ? Number(numericVersion) : 0) + 1).padStart(width, '0');

  versionData.app_version = nextVersion;
  if (typeof versionData.build !== 'string' || !versionData.build.trim()) {
    versionData.build = '__BUILD_ID__';
  }
  if (typeof versionData.generated_at_utc !== 'string' || !versionData.generated_at_utc.trim()) {
    versionData.generated_at_utc = '__BUILD_TIME__';
  }

  await fs.writeFile(sourceVersionFile, `${JSON.stringify(versionData, null, 2)}\n`, 'utf8');
  return nextVersion;
}

const appVersion = await bumpAppVersion();

exitOnFailure(runNode([viteBin, 'build']));

const distDir = path.join(rootDir, 'dist');
await fs.mkdir(distDir, { recursive: true });

await replaceInFile(path.join(distDir, 'index.html'), [
  ['__BUILD_ID__', buildId],
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
    '{\n  "app_version": "__APP_VERSION__",\n  "build": "__BUILD_ID__",\n  "generated_at_utc": "__BUILD_TIME__"\n}\n',
    'utf8'
  );
}

await replaceInFile(versionFile, [
  ['__APP_VERSION__', appVersion],
  ['__BUILD_ID__', buildId],
  ['__BUILD_TIME__', buildTime]
]);

const noJekyllFile = path.join(distDir, '.nojekyll');
try {
  await fs.access(noJekyllFile);
} catch {
  await fs.writeFile(noJekyllFile, '', 'utf8');
}

console.log(`[build:web] version=${appVersion} build=${buildId} time=${buildTime}`);
