import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderStack } from './stack.mjs';
import { renderCerts, CERTS } from './certs.mjs';
import { renderChip } from './motion.mjs';
import { renderCard } from './card.mjs';
import { renderTyping, renderFetch } from './terminal.mjs';
import { renderEntryCard, WORK, PROJECTS_CARDS } from './cards.mjs';
import { renderExplorer } from './explorer.mjs';

const dir = new URL('../assets/tech', import.meta.url).pathname;
const logo = readFileSync(new URL('../assets/logo/ascii.txt', import.meta.url), 'utf8');
const weeks = [{ contributionDays: [{ date: '2026-11-02', contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' }] }];

// What a GitHub README can safely show: no script, no third-party fetch, motion only when allowed.
function assertSafe(svg) {
  assert.ok(svg.startsWith('<svg') && svg.trimEnd().endsWith('</svg>'));
  assert.doesNotMatch(svg, /<script|onload=|javascript:/i);
  assert.doesNotMatch(svg.replace('xmlns="http://www.w3.org/2000/svg"', ''), /(href|src)="https?:/i);
  if (/@keyframes/.test(svg)) assert.match(svg, /prefers-reduced-motion:\s*no-preference/);
}

for (const theme of ['light', 'dark']) {
  test(`stack ${theme}: 33 tiles, self-contained, motion guarded`, () => {
    const svg = renderStack({ theme, dir });
    assert.equal((svg.match(/<image /g) ?? []).length, 33);
    assertSafe(svg);
  });
  for (const icon of ['LinkedIn', 'Email', 'Portfolio', 'CV']) {
    test(`chip ${icon} ${theme}`, () => assertSafe(renderChip({ theme, label: icon, icon, dir })));
  }
  test(`typing ${theme}`, () => assertSafe(renderTyping({ theme, lines: ['one line', 'two, lines'] })));
  test(`fetch portrait ${theme}`, () =>
    assertSafe(renderFetch({ theme, art: readFileSync(new URL(`../assets/portrait/ascii-${theme}.txt`, import.meta.url), 'utf8'), colors: JSON.parse(readFileSync(new URL(`../assets/portrait/colors-${theme}.json`, import.meta.url), 'utf8')), rows: [['OS', 'Cebu']] })));
  test(`fetch ${theme}`, () =>
    assertSafe(renderFetch({ theme, art: logo, rows: [['OS', 'Cebu'], ['Streak', '3 days', true]], accentLines: 3 })));
  test(`certs ${theme}: one badge per certification`, () => {
    const svg = renderCerts({ theme, dir });
    assert.equal((svg.match(/<image /g) ?? []).length, CERTS.length);
    assertSafe(svg);
  });
  for (const entry of WORK) {
    test(`entry card ${entry.slug} ${theme}: no images, every figure shown`, () => {
      const svg = renderEntryCard({ theme, entry });
      assert.doesNotMatch(svg, /<image /);
      for (const [v] of entry.figs) assert.ok(svg.includes(`>${v.replace('&', '&amp;')}<`), v);
      assertSafe(svg);
    });
  }
  test(`projects explorer ${theme}: every project and figure, one selection each`, () => {
    const svg = renderExplorer({ projects: PROJECTS_CARDS, clock: 'Nov 27' });
    for (const p of PROJECTS_CARDS) {
      assert.ok(svg.includes(`>${p.name.join(' ')}<`), p.slug);
      for (const [v] of p.figs) assert.ok(svg.includes(`>${v}<`), v);
    }
    assert.equal((svg.match(/<g class="s\d+">/g) ?? []).length, PROJECTS_CARDS.length * 2);
    assertSafe(svg);
  });
  test(`card ${theme} animations guarded`, () =>
    assertSafe(renderCard({ theme, allTime: 1, lastYear: 1, current: 1, longest: 1, weeks, rev: '2026-11-02' })));
}
