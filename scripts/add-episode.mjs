#!/usr/bin/env node
/**
 * Adds a new episode to src/content/episodes/.
 *
 * Usage:
 *   node scripts/add-episode.mjs '<json>'
 *
 * Input JSON shape:
 * {
 *   "title": "School Name - City",
 *   "season": 1,
 *   "seasonName": "2025/26",
 *   "mainVideoUrl": "https://youtu.be/XXXXXXXXXXX",
 *   "choreographies": [
 *     { "title": "Choreo Title", "videoUrl": "https://youtu.be/AAA" }
 *   ]
 * }
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EPISODES_DIR = join(__dirname, '..', 'src', 'content', 'episodes');

// --- YouTube ID extraction ---

const YT_PATTERNS = [
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/,
  /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
];

function extractYouTubeId(url) {
  for (const pattern of YT_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  // Treat bare 11-char strings as IDs directly
  if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();
  throw new Error(`Cannot extract YouTube ID from: ${url}`);
}

// --- Slug generation ---

const ACCENT_MAP = {
  à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  ñ: 'n', ç: 'c',
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâãäèéêëìíîïòóôõöùúûüñç]/g, c => ACCENT_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- ID auto-increment ---

function getNextId() {
  const files = readdirSync(EPISODES_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) return 1;
  const ids = files.map(f => {
    const data = JSON.parse(readFileSync(join(EPISODES_DIR, f), 'utf8'));
    return typeof data.id === 'number' ? data.id : 0;
  });
  return Math.max(...ids) + 1;
}

// --- Validation ---

function validateInput(data) {
  const required = ['title', 'mainVideoUrl', 'choreographies'];
  for (const field of required) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }
  if (!Array.isArray(data.choreographies) || data.choreographies.length === 0) {
    throw new Error('choreographies must be a non-empty array');
  }
  for (const c of data.choreographies) {
    if (!c.title) throw new Error('Each choreography must have a title');
    if (!c.videoUrl) throw new Error('Each choreography must have a videoUrl');
  }
}

// --- Main ---

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/add-episode.mjs \'<json>\'');
    process.exit(1);
  }

  let input;
  try {
    input = JSON.parse(arg);
  } catch {
    console.error('Invalid JSON input');
    process.exit(1);
  }

  validateInput(input);

  const slug = generateSlug(input.title);
  const outPath = join(EPISODES_DIR, `${slug}.json`);

  if (existsSync(outPath)) {
    console.error(`Error: ${slug}.json already exists. Delete it first to overwrite.`);
    process.exit(1);
  }

  const id = getNextId();

  const episode = {
    id,
    season: input.season ?? 1,
    seasonName: input.seasonName ?? '2025/26',
    title: input.title,
    slug,
    mainVideoId: extractYouTubeId(input.mainVideoUrl),
    choreographies: input.choreographies.map(c => ({
      title: c.title,
      videoId: extractYouTubeId(c.videoUrl),
    })),
  };

  if (input.thumbnail) {
    episode.thumbnail = input.thumbnail;
  }

  writeFileSync(outPath, JSON.stringify(episode, null, 2) + '\n');

  console.log(`\nEpisodio creato: src/content/episodes/${slug}.json`);
  console.log(`  ID:        ${id}`);
  console.log(`  Titolo:    ${episode.title}`);
  console.log(`  Slug:      ${slug}`);
  console.log(`  Video:     ${episode.mainVideoId}`);
  console.log(`  Coreo:     ${episode.choreographies.map(c => c.title).join(', ')}`);
  console.log(`\nProssimi passi:`);
  console.log(`  npm run build   # verifica schema`);
  console.log(`  git add src/content/episodes/${slug}.json`);
  console.log(`  git commit -m "feat: add episode ${slug}"`);
  console.log(`  git push        # deploy su Netlify`);
}

main();
