#!/usr/bin/env node

/**
 * LingTube CLI — Generate learning materials from a YouTube video.
 *
 * Usage:
 *   node cli/generate.js <YouTube URL> [--lang en]
 *
 * This script:
 *   1. Fetches the YouTube transcript
 *   2. Calls Claude Code (via `claude -p`) to analyze the transcript
 *   3. Saves all results as a JSON file in data/<videoId>.json
 *
 * No API key needed — uses your existing Claude Code subscription.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import {
  buildClozePromptPair,
  buildFSIDrillsPromptPair,
  buildKeySentencesPromptPair,
  formatTranscriptForAnalysis,
} from 'lingtube-shared/prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// ── Helpers ──────────────────────────────────────────────

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchVideoTitle(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return data.title || videoId;
    }
  } catch {}
  return videoId;
}

async function fetchTranscript(videoId, lang = 'en') {
  const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang });
  return segments.map((seg) => ({
    text: seg.text,
    start: Math.round((seg.offset / 1000) * 100) / 100,
    duration: Math.round((seg.duration / 1000) * 100) / 100,
  }));
}

function chunkSegments(segments, chunkSize = 400) {
  const chunks = [];
  for (let i = 0; i < segments.length; i += chunkSize) {
    chunks.push(segments.slice(i, i + chunkSize));
  }
  return chunks;
}

async function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', '--output-format', 'text'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Claude CLI failed: ${err.message}`));
    });

    // Write prompt to stdin and close
    child.stdin.write(prompt);
    child.stdin.end();

    // Timeout after 10 minutes
    setTimeout(() => {
      child.kill();
      reject(new Error('Claude CLI timed out after 10 minutes'));
    }, 600_000);
  });
}

function extractJSON(text) {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Try extracting from markdown code block
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }

  // Try finding JSON object/array boundaries
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  throw new Error('Could not extract JSON from Claude response');
}

function combinePromptSections(system, user) {
  return `${system}\n\n${user}`;
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((a) => !a.startsWith('--'));
  const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en';

  if (!url) {
    console.log('Usage: node cli/generate.js <YouTube URL> [--lang en]');
    console.log('Example: node cli/generate.js https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    process.exit(1);
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    console.error('Invalid YouTube URL');
    process.exit(1);
  }

  const outputPath = path.join(DATA_DIR, `${videoId}.json`);
  const skipFsi = args.includes('--skip-fsi');

  // Helper: save checkpoint after each major step
  const saveCheckpoint = (data) => {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  };

  // Step 0: Fetch video title
  console.log(`\n🎬 Fetching video info for ${videoId}...`);
  const title = await fetchVideoTitle(videoId);
  console.log(`   ✓ Title: ${title}`);

  // Step 1: Fetch transcript
  console.log(`\n📥 Fetching transcript...`);
  let segments;
  try {
    segments = await fetchTranscript(videoId, lang);
    console.log(`   ✓ Got ${segments.length} segments`);
  } catch (err) {
    console.error(`   ✗ Failed: ${err.message}`);
    process.exit(1);
  }

  // Step 2: Extract key sentences (chunked for long videos)
  const chunks = chunkSegments(segments);
  console.log(`\n🔍 Extracting key sentences (${chunks.length} chunk${chunks.length > 1 ? 's' : ''}, via Claude Code)...`);
  let sentences = [];
  let sentenceCounter = 1;
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = formatTranscriptForAnalysis(chunks[i]);
    const segmentCount = chunkText.split('\n').length;
    const targetSentences = Math.max(10, Math.min(30, Math.round(segmentCount / 15)));
    const { system, user } = buildKeySentencesPromptPair({
      transcript: chunkText,
      chunkIndex: i,
      totalChunks: chunks.length,
      targetSentences,
    });
    console.log(`   📄 Processing chunk ${i + 1}/${chunks.length} (segments ${i * 400 + 1}-${Math.min((i + 1) * 400, segments.length)})...`);
    try {
      const raw = await callClaude(combinePromptSections(system, user));
      const parsed = extractJSON(raw);
      const chunkSentences = (parsed.sentences || []).map((s) => ({
        ...s,
        id: `s${sentenceCounter++}`,
      }));
      sentences.push(...chunkSentences);
      console.log(`   ✓ Got ${chunkSentences.length} sentences from chunk ${i + 1}`);
    } catch (err) {
      console.warn(`   ⚠ Chunk ${i + 1} failed: ${err.message}`);
    }
  }
  console.log(`   ✅ Total: ${sentences.length} key sentences`);

  if (sentences.length === 0) {
    console.error('   ✗ No sentences extracted from any chunk');
    process.exit(1);
  }

  // Save checkpoint after sentences
  let result = {
    videoId,
    title,
    lang,
    generatedAt: new Date().toISOString(),
    segments,
    sentences,
    clozeExercises: [],
    fsiDrills: [],
  };
  saveCheckpoint(result);
  console.log(`   💾 Saved checkpoint with ${sentences.length} sentences`);

  // Step 3 & 4: Generate cloze and FSI in batches of 10 sentences
  const BATCH_SIZE = 10;
  let clozeExercises = [];
  let fsiDrills = [];

  const batches = [];
  for (let i = 0; i < sentences.length; i += BATCH_SIZE) {
    batches.push(sentences.slice(i, i + BATCH_SIZE));
  }

  console.log(`\n📝 Generating cloze tests (${batches.length} batch${batches.length > 1 ? 'es' : ''})...`);
  for (let i = 0; i < batches.length; i++) {
    console.log(`   📄 Batch ${i + 1}/${batches.length}...`);
    try {
      const { system, user } = buildClozePromptPair(batches[i]);
      const raw = await callClaude(combinePromptSections(system, user));
      const parsed = extractJSON(raw);
      clozeExercises.push(...(parsed.exercises || []));
      console.log(`   ✓ Got ${(parsed.exercises || []).length} exercises`);
      // Save checkpoint after each batch
      result.clozeExercises = clozeExercises;
      saveCheckpoint(result);
    } catch (err) {
      console.warn(`   ⚠ Batch ${i + 1} failed: ${err.message}`);
    }
  }
  console.log(`   ✅ Total: ${clozeExercises.length} cloze exercises`);

  if (skipFsi) {
    console.log(`\n⏭  Skipping FSI drill generation (--skip-fsi)`);
  } else {
    console.log(`\n🎯 Generating FSI drills (${batches.length} batch${batches.length > 1 ? 'es' : ''})...`);
    for (let i = 0; i < batches.length; i++) {
      console.log(`   📄 Batch ${i + 1}/${batches.length}...`);
      try {
        const { system, user } = buildFSIDrillsPromptPair({
          sentences: batches[i],
        });
        const raw = await callClaude(combinePromptSections(system, user));
        const parsed = extractJSON(raw);
        fsiDrills.push(...(parsed.drills || []));
        console.log(`   ✓ Got ${(parsed.drills || []).length} drills`);
        // Save checkpoint after each batch
        result.fsiDrills = fsiDrills;
        saveCheckpoint(result);
      } catch (err) {
        console.warn(`   ⚠ Batch ${i + 1} failed: ${err.message}`);
      }
    }
    console.log(`   ✅ Total: ${fsiDrills.length} FSI drills`);
  }

  // Final save (already saved via checkpoints, but ensure latest)
  saveCheckpoint(result);

  console.log(`\n✅ Done! Saved to ${path.relative(process.cwd(), outputPath)}`);
  console.log(`   ${sentences.length} sentences · ${clozeExercises.length} cloze · ${fsiDrills.length} FSI drills`);
  console.log(`\n   Start the web app with: npm run dev`);
  console.log(`   Then open: http://localhost:5173/video/${videoId}\n`);
}

main();
