# MATH_VISUAL_APP

Canonical app URL:
`https://streamdragon.github.io/MATH_VISUAL_APP/`

## Recommended local workspace (important)

For stable Git + VSCode + Android Studio integration on Windows, open and work from:
`C:\code\MATH_VISUAL_APP`

Avoid working directly from UNC paths such as:
`\\wsl.localhost\Ubuntu\home\nlpis\code\MATH_VISUAL_APP`

UNC is a common source of:
1. `Git: Failed to execute git` in VSCode
2. `cmd.exe` path warnings during npm/capacitor tasks
3. random Android Studio/Gradle path issues

## Web + Capacitor workflow (single source of truth)

Author web files in the repository root (`index.html`, css/js/json).
Before Capacitor sync, run:

```bash
npm run sync:web
```

This script rebuilds `www/` from root web assets.

Then sync native projects:

```bash
npm run cap:sync
```

Or sync and open Android Studio in one command:

```bash
npm run cap:open:android
```

## Single deployment flow (no more multiple versions)

The repository now deploys GitHub Pages automatically from `main` via:
`.github/workflows/deploy-pages.yml`

On every push to `main`, the site is redeployed.

## Safe auto-update mechanism

To reduce stale-cache issues (especially inside Google Sites embeds):
1. Deploy workflow stamps each release with a unique build id (`GITHUB_SHA` short).
2. `index.html` assets are loaded with `?v=<build_id>` cache busting.
3. `version.json` is published with the latest build id.
4. Client runtime checks `version.json` with `no-store`; if a newer build exists, it reloads once with `?v=<latest_build>`.

This means users who open an older cached copy are automatically redirected to the newest build.

## One-time GitHub setting

In GitHub repo settings:
1. Open `Settings -> Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`

After this one-time setting, `https://streamdragon.github.io/MATH_VISUAL_APP/`
always serves the latest `main`.
