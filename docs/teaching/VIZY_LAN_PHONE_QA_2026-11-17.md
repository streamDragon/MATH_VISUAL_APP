# Vizy: same-Wi-Fi computer/phone QA
Date: 17 November 2026. Owner: Agent 3 (visual).

## Goal
Edit Vizy on the development PC, use Vite hot module reload on a real Android phone in the same Wi-Fi network, verify the same live UI, and fix regressions before a release. This workflow does not replace mobile-device testing or the main branch release gate.

## Start on the PC
Run `powershell -ExecutionPolicy Bypass -File scripts/vizy-lan-start.ps1` from the project root. The launcher detects the active IPv4 address and prints `http://<PC-IP>:4197/learn.html`. Both the PC and phone must be on the same trusted Wi-Fi. While the dev server stays running, page edits should normally reload in the phone browser. No APK is needed for this browser-preview workflow.

Observed on 17 Nov 2026: PC IPv4 `192.168.1.104` on Wi-Fi, server `0.0.0.0:4197`. HTTP 200 for `/learn.html` and `/problem-map.html?lesson=increasing` using the LAN IP. This IP may change.

## Automated verification
Run `set VIZY_LAN_URL=http://192.168.1.104:4197` in cmd.exe, or in PowerShell `$env:VIZY_LAN_URL='http://192.168.1.104:4197'`, then `node scripts/vizy-lan-qa.cjs`. It checks the LAN HTTP entry points, 320/390px WebKit layout, local fonts, three-icon navigation, mascot, journey, tools drawer, focus transfer, library, inquiry overlay, and blocked internal requests. All assertions passed on the PC accessing its own LAN address on 17 Nov 2026. No real-phone network connection was observed or verified.

## Important Windows network condition
The Wi-Fi network profile on the PC was classified **Public** at time of audit. The remote command session had **no administrator rights** and could not inspect or change inbound firewall rules. The LAN-IP HTTP test made on the PC proves local binding only, not reachability from another device.

If the phone cannot open the URL while on the same Wi-Fi, an authorized PC administrator should first verify network isolation and Windows Defender Firewall. On a trusted home Wi-Fi, switch to a Private profile and allow **only TCP 4197** inbound for the local subnet and only for the needed network profile. Do not disable the entire firewall or expose a dev server to the internet. After testing, stop the server. If a browser preview works but an installed APK does not, troubleshoot Android release/WebView caching and native permissions separately.

## Release safety
Work on `main` only, preserve other agents' uncommitted files, record before/after QA, and do not publish or push to production while global integration tests are failing.
