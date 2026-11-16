// Run the existing Python import contract on Windows and Unix without invoking
// the Windows Store's non-functional python3.exe app alias.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const testFile = fileURLToPath(new URL('../tests/question_import_test.py', import.meta.url));
const candidates = process.platform === 'win32'
  ? [['py', ['-3']], ['python', []], ['python3', []]]
  : [['python3', []], ['python', []]];

for (const [command, args] of candidates) {
  const result = spawnSync(command, [...args, testFile], { stdio: 'inherit' });
  if (result.error?.code === 'ENOENT') continue;
  if (result.error) {
    console.error('Python test runner failed:', result.error.message);
    process.exitCode = 1;
    break;
  }
  process.exitCode = result.status ?? 1;
  break;
}
if (process.exitCode === undefined) {
  console.error('No usable Python interpreter found. Install Python 3 and rerun.');
  process.exitCode = 1;
}
