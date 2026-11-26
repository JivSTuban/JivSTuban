import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderStack } from './stack.mjs';
import { renderRoute, renderChip } from './motion.mjs';
import { renderCard } from './card.mjs';
import { renderTyping, renderFetch } from './terminal.mjs';
import { renderOrbit, PROJECTS } from './orbit.mjs';

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
  test(`route ${theme}`, () => assertSafe(renderRoute(theme)));
  for (const icon of ['LinkedIn', 'Email', 'Portfolio', 'CV']) {
    test(`chip ${icon} ${theme}`, () => assertSafe(renderChip({ theme, label: icon, icon, dir })));
  }
  test(`typing ${theme}`, () => assertSafe(renderTyping({ theme, lines: ['one line', 'two, lines'] })));
  test(`fetch ${theme}`, () =>
    assertSafe(renderFetch({ theme, art: logo, rows: [['OS', 'Cebu'], ['Streak', '3 days', true]], accentLines: 3 })));
  test(`orbit ${theme}: one planet per project, no images`, () => {
    const svg = renderOrbit({ theme });
    assert.equal((svg.match(/fill="url\(#g\d+\)"/g) ?? []).length, PROJECTS.length);
    assert.doesNotMatch(svg, /<image/);
    assertSafe(svg);
  });
  test(`card ${theme} animations guarded`, () =>
    assertSafe(renderCard({ theme, allTime: 1, lastYear: 1, current: 1, longest: 1, weeks, rev: '2026-11-02' })));
}
