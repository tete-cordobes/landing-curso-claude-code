#!/usr/bin/env node
/**
 * update-changelog.js
 * Parses GitHub release notes and updates changelog.html automatically.
 *
 * Usage: node update-changelog.js <version> <date> <release-notes-file>
 * Example: node update-changelog.js 2.1.93 2026-04-05 /tmp/release-notes.md
 */

const fs = require('fs');
const path = require('path');

const MAX_CHANGES = 8;
const MAX_CHANGE_LEN = 65;

function parseReleaseNotes(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('- '));
  const added = [], changed = [], improved = [], fixed = [], removed = [], other = [];

  for (const line of lines) {
    const c = line.slice(2);
    if (c.startsWith('Added ')) added.push(c.slice(6));
    else if (c.startsWith('Changed ')) changed.push(c.slice(8));
    else if (c.startsWith('Improved ')) improved.push(c.slice(9));
    else if (c.startsWith('Fixed ')) fixed.push(c.slice(6));
    else if (c.startsWith('Removed ')) removed.push('Eliminado: ' + c.slice(8));
    else if (c.startsWith('Hardened ')) fixed.push(c.slice(9));
    else if (c.startsWith('Documented ')) other.push(c);
    else other.push(c);
  }

  // Priority: added > changed > removed > improved > fixed (max 2) > other
  const ordered = [
    ...added,
    ...changed,
    ...removed,
    ...improved,
    ...fixed.slice(0, 2),
    ...other,
  ];

  return ordered.slice(0, MAX_CHANGES).map(shorten);
}

function shorten(s) {
  // Strip backticks
  s = s.replace(/`([^`]*)`/g, '$1');
  // Remove verbose clauses
  s = s.replace(/ — .*/, '');
  s = s.replace(/, allowing .*/, '');
  s = s.replace(/, which .*/, '');
  s = s.replace(/ that could .*/, '');
  s = s.replace(/ when .*/, '');
  s = s.replace(/ instead of .*/, '');
  s = s.replace(/ including .*/, '');
  s = s.replace(/ by routing .*/, '');
  s = s.replace(/ via .*/, '');
  s = s.replace(/ to disable .*/, '');
  s = s.replace(/ to keep .*/, '');
  s = s.replace(/ for (?:agent|tool|users?) .*/, '');
  // Clean trailing punctuation
  s = s.replace(/[,:;]\s*$/, '');
  s = s.replace(/ after .*/, '');
  // Trim whitespace
  s = s.trim();
  // Final truncation
  if (s.length > MAX_CHANGE_LEN) s = s.slice(0, MAX_CHANGE_LEN - 3) + '...';
  return s;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function spanishDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  const m = ['enero','febrero','marzo','abril','mayo','junio',
             'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getUTCDate()} de ${m[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function updateFile(version, date, changes) {
  const htmlPath = path.resolve(__dirname, '..', 'changelog.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // --- 1. Insert into releases array (before final ]; ) ---
  const entry = `{v:"${version}",c:[${changes.map(c => `"${esc(c)}"`).join(',')}]}`;

  const releasesStart = html.indexOf('const releases=[');
  if (releasesStart === -1) {
    console.error('ERROR: could not locate releases array');
    process.exit(1);
  }
  const releasesEnd = html.indexOf('];', releasesStart);
  if (releasesEnd === -1) {
    console.error('ERROR: could not locate end of releases array');
    process.exit(1);
  }
  // Find last } before ]; — robust, doesn't care about ] inside strings
  const lastBrace = html.lastIndexOf('}', releasesEnd);
  // Derive indent from the spaces before ];
  const lineStart = html.lastIndexOf('\n', releasesEnd) + 1;
  const indent = html.slice(lineStart, releasesEnd);
  html = html.slice(0, lastBrace + 1) + `,\n${indent}${entry}` + html.slice(lastBrace + 1);

  // --- 2. Insert into dates object ---
  // Find the pattern: "X.Y.Z":"YYYY-MM-DD"};
  const datesEnd = html.lastIndexOf('"};');
  if (datesEnd === -1) {
    console.error('ERROR: could not locate end of dates object');
    process.exit(1);
  }
  const dateInsert = `,"${version}":"${date}"`;
  html = html.slice(0, datesEnd + 1) + dateInsert + html.slice(datesEnd + 1);

  // --- 3. Update hero section ---
  const heroTitle = changes[0] || `Actualización v${version}`;
  const heroDate = spanishDate(date);

  html = html.replace(
    /<div class="latest-ver">v[\d.]+ — <span>[^<]*<\/span><\/div>/,
    `<div class="latest-ver">v${version} — <span>${heroTitle}</span></div>`
  );
  html = html.replace(
    /<div class="latest-date">[^<]*<\/div>/,
    `<div class="latest-date">${heroDate}</div>`
  );

  // Replace hero changes (the 4 latest-change divs inside latest-changes)
  const heroChangesHtml = changes.slice(0, 4).map(c =>
    `                    <div class="latest-change"><span class="lc-dot"></span>${c}</div>`
  ).join('\n');
  html = html.replace(
    /(<div class="latest-changes">)\n[\s\S]*?(\n\s*<\/div>\n\s*<\/div>\n\s*<\/section>)/,
    `$1\n${heroChangesHtml}$2`
  );

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`✅ changelog.html updated: v${version} (${changes.length} changes)`);
}

// --- Main ---
const [,, version, date, notesFile] = process.argv;
if (!version || !date || !notesFile) {
  console.error('Usage: node update-changelog.js <version> <date> <release-notes-file>');
  process.exit(1);
}
const notes = fs.readFileSync(notesFile, 'utf8');
const changes = parseReleaseNotes(notes);
if (!changes.length) {
  console.log('⚠️  No changes found in release notes — skipping');
  process.exit(0);
}
console.log(`📝 v${version} — ${changes.length} changes parsed:`);
changes.forEach(c => console.log(`   • ${c}`));
updateFile(version, date, changes);
