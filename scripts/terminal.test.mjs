import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uptime, renderTyping, renderFetch } from './terminal.mjs';

test('uptime counts whole months', () => {
  assert.equal(uptime('2024-03-06T08:47:40Z', '2026-11-26'), '2 years, 8 months');
  assert.equal(uptime('2024-03-06T08:47:40Z', '2026-03-05'), '1 year, 11 months');
  assert.equal(uptime('2024-03-06T08:47:40Z', '2025-03-06'), '1 year');
  assert.equal(uptime('2026-11-20T00:00:00Z', '2026-11-26'), 'new');
});

test('typing rests on the first line fully typed and cycles every line', () => {
  const svg = renderTyping({ theme: 'light', lines: ['abc', 'hello, world'] });
  // resting cover sits after 3 characters of the first line: tx = 24 + 13 * 13.2 = 195.6, + 3 * 13.2
  assert.match(svg, /\.cover\{transform:translateX\(235\.2px\)\}/);
  assert.match(svg, /\.p1\{opacity:0\}/);
  assert.match(svg, /@keyframes p1\{/);
  // the deepest step shows the longest line in full
  assert.match(svg, /translateX\(354\.0px\)/);
  assert.equal(svg, renderTyping({ theme: 'light', lines: ['abc', 'hello, world'] }));
});

test('typing escapes markup in a line', () => {
  assert.match(renderTyping({ theme: 'dark', lines: ['a < b & c'] }), /a &lt; b &amp; c/);
});

test('fetch draws every row and the accent only on hot rows', () => {
  const svg = renderFetch({ theme: 'light', art: ' ab\n  cd\n', rows: [['OS', 'Cebu'], ['Streak', '9 days', true]] });
  assert.match(svg, />Cebu</);
  assert.match(svg, /fill="#c2410c">9 days</);
  assert.doesNotMatch(svg, /fill="#c2410c">Cebu</);
});
