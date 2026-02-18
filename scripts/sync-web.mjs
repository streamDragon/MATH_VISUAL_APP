import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'www');

const alwaysInclude = new Set(['.nojekyll', 'CNAME']);
const allowedExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.json',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.txt',
  '.xml',
  '.map'
]);

const blockedFiles = new Set([
  'package.json',
  'package-lock.json',
  'capacitor.config.ts',
  'README.md',
  '.gitignore',
  '.gitattributes'
]);

const optionalAssetDirs = ['assets', 'images', 'img', 'fonts', 'media'];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyFileByName(fileName) {
  const sourcePath = path.join(rootDir, fileName);
  if (!(await pathExists(sourcePath))) {
    return false;
  }

  const targetPath = path.join(webDir, fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
  return true;
}

async function copyOptionalDir(dirName) {
  const sourcePath = path.join(rootDir, dirName);
  if (!(await pathExists(sourcePath))) {
    return false;
  }

  const targetPath = path.join(webDir, dirName);
  await fs.cp(sourcePath, targetPath, { recursive: true });
  return true;
}

await fs.rm(webDir, { recursive: true, force: true });
await fs.mkdir(webDir, { recursive: true });

const rootEntries = await fs.readdir(rootDir, { withFileTypes: true });
const copiedFiles = [];
const copiedDirs = [];

for (const entry of rootEntries) {
  if (!entry.isFile()) {
    continue;
  }

  const fileName = entry.name;
  if (blockedFiles.has(fileName)) {
    continue;
  }

  const extension = path.extname(fileName).toLowerCase();
  if (!alwaysInclude.has(fileName) && !allowedExtensions.has(extension)) {
    continue;
  }

  if (await copyFileByName(fileName)) {
    copiedFiles.push(fileName);
  }
}

for (const dirName of optionalAssetDirs) {
  if (await copyOptionalDir(dirName)) {
    copiedDirs.push(dirName);
  }
}

console.log(`[sync:web] Copied ${copiedFiles.length} files to www`);
if (copiedDirs.length > 0) {
  console.log(`[sync:web] Copied asset directories: ${copiedDirs.join(', ')}`);
}
