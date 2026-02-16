# MATH_VISUAL_APP

Canonical app URL:
`https://streamdragon.github.io/MATH_VISUAL_APP/`

## Single deployment flow (no more multiple versions)

The repository now deploys GitHub Pages automatically from `main` via:
`.github/workflows/deploy-pages.yml`

On every push to `main`, the site is redeployed.

## One-time GitHub setting

In GitHub repo settings:
1. Open `Settings -> Pages`
2. Under `Build and deployment`, set `Source` to `GitHub Actions`

After this one-time setting, `https://streamdragon.github.io/MATH_VISUAL_APP/`
always serves the latest `main`.
