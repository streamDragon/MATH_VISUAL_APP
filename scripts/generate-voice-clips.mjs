// Regenerates the Hebrew voice clips in public/audio from manifest.json
// using Microsoft Edge's free neural TTS voices (no API key needed).
//
// Usage:
//   node scripts/generate-voice-clips.mjs                 # male voice (Avri)
//   node scripts/generate-voice-clips.mjs --voice hila    # female voice (Hila)
//   node scripts/generate-voice-clips.mjs --only correct-1.mp3,wrong-2.mp3
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { readFile, writeFile, rename, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const TMP_DIR = path.join(AUDIO_DIR, '.tts-tmp');

const VOICES = {
    avri: 'he-IL-AvriNeural',
    hila: 'he-IL-HilaNeural',
};

function parseArgs(argv) {
    const args = { voice: 'avri', only: null };
    for (let i = 2; i < argv.length; i += 1) {
        if (argv[i] === '--voice' && argv[i + 1]) {
            args.voice = argv[i + 1].toLowerCase().replace(/^he-il-|neural$/gi, '');
            i += 1;
        } else if (argv[i] === '--only' && argv[i + 1]) {
            args.only = new Set(argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean));
            i += 1;
        }
    }
    return args;
}

async function main() {
    const args = parseArgs(process.argv);
    const voiceName = VOICES[args.voice];
    if (!voiceName) {
        console.error(`Unknown voice "${args.voice}". Use one of: ${Object.keys(VOICES).join(', ')}`);
        process.exit(1);
    }

    const manifestPath = path.join(AUDIO_DIR, 'manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const entries = manifest.filter((entry) => !args.only || args.only.has(entry.filename));
    if (entries.length === 0) {
        console.error('No manifest entries matched.');
        process.exit(1);
    }

    await mkdir(TMP_DIR, { recursive: true });
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    try {
        for (const entry of entries) {
            const { audioFilePath } = await tts.toFile(TMP_DIR, entry.hebrew);
            await rename(audioFilePath, path.join(AUDIO_DIR, entry.filename));
            console.log(`OK  ${entry.filename}  <-  "${entry.hebrew}"  [${voiceName}]`);
        }
    } finally {
        tts.close();
        await rm(TMP_DIR, { recursive: true, force: true });
    }

    const readme = [
        `Hebrew voice clips generated with Microsoft Edge neural TTS (${voiceName}), free, no API key.`,
        'Regenerate with: node scripts/generate-voice-clips.mjs (see flags at the top of that script).',
        'Phrase list lives in manifest.json — edit it and re-run the script to change the clips.',
        '',
        ...manifest.map((entry) => `${entry.filename} | ${entry.hebrew}`),
        '',
    ].join('\n');
    await writeFile(path.join(AUDIO_DIR, 'README.txt'), readme, 'utf8');
    console.log(`\nDone: ${entries.length} clip(s) written to public/audio with ${voiceName}.`);
}

main().catch((err) => {
    console.error('Voice clip generation failed:', err?.message || err);
    process.exit(1);
});
