import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const capacitorBin = path.join(
  rootDir,
  'node_modules',
  '@capacitor',
  'cli',
  'bin',
  'capacitor'
);
const buildScript = path.join(rootDir, 'scripts', 'build-web.mjs');

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: rootDir
  });
  const status = typeof result.status === 'number' ? result.status : 1;
  if (status !== 0) {
    process.exit(status);
  }
}

const action = process.argv[2] || 'sync';

runNode([buildScript]);
runNode([capacitorBin, 'sync']);

if (action === 'open-android') {
  runNode([capacitorBin, 'open', 'android']);
}
