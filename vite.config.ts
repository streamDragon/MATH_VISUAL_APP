import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import type { ResolvedConfig } from 'vite';

function normalizeBuildEnv(raw?: string): string {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) return 'dev';
  if (value === 'preview') return 'preview';
  if (value === 'production' || value === 'prod') return 'prod';
  if (value === 'development' || value === 'dev' || value === 'local') return 'dev';
  return value;
}

function sanitizeBuildSha(raw?: string): string {
  const value = String(raw || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '');
  if (!value) return 'unknown';
  return value.slice(0, 40);
}

function readAppVersion(rootDir: string): string {
  const versionPath = path.join(rootDir, 'public', 'version.json');
  try {
    const raw = fs.readFileSync(versionPath, 'utf8');
    const parsed = JSON.parse(raw) as { app_version?: unknown };
    const version = String(parsed?.app_version || '').trim();
    if (version) return version;
  } catch {
    // Fall back to local if file is missing/invalid.
  }
  return 'local';
}

const rootDir = process.cwd();
const appVersion = readAppVersion(rootDir);
const buildEnv = normalizeBuildEnv(process.env.BUILD_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV);
const buildSha = sanitizeBuildSha(
  process.env.BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.BUILD_ID
);
const rawBuildTime = String(process.env.BUILD_TIME || new Date().toISOString()).trim();
const buildTime = Number.isNaN(Date.parse(rawBuildTime))
  ? rawBuildTime
  : new Date(rawBuildTime).toISOString();
const buildId = String(process.env.BUILD_ID || '').trim() || (buildSha !== 'unknown' ? buildSha : `${buildEnv}-${Date.now()}`);

const buildTokens: Record<string, string> = {
  __APP_VERSION__: appVersion,
  __BUILD_ID__: buildId,
  __BUILD_ENV__: buildEnv,
  __BUILD_SHA__: buildSha,
  __BUILD_TIME__: buildTime
};
let resolvedConfig: ResolvedConfig | null = null;

function replaceBuildTokens(input: string): string {
  let output = input;
  for (const [token, value] of Object.entries(buildTokens)) {
    output = output.split(token).join(value);
  }
  return output;
}

export default defineConfig({
  base: './',
  define: Object.fromEntries(
    Object.entries(buildTokens).map(([token, value]) => [token, JSON.stringify(value)])
  ),
  plugins: [
    {
      name: 'inject-build-stamp',
      configResolved(config) {
        resolvedConfig = config;
      },
      transformIndexHtml(html) {
        return replaceBuildTokens(html);
      },
      writeBundle() {
        if (!resolvedConfig) return;
        const outDir = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir);
        const versionPayload = {
          app_version: appVersion,
          build: buildId,
          build_env: buildEnv,
          build_sha: buildSha,
          generated_at_utc: buildTime
        };
        fs.writeFileSync(path.join(outDir, 'version.json'), `${JSON.stringify(versionPayload, null, 2)}\n`, 'utf8');
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
