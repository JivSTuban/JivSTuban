import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streaks, renderCard } from './card.mjs';

test('current streak survives an empty today', () => {
  const days = { '2026-11-01': 2, '2026-11-02': 1, '2026-11-03': 0 };
  assert.deepEqual(streaks(days, '2026-11-03'), { current: 2, longest: 2 });
});

test('a gap breaks the streak and longest keeps the best run', () => {
  const days = { '2026-10-28': 1, '2026-10-29': 1, '2026-10-30': 1, '2026-10-31': 0, '2026-11-01': 4, '2026-11-02': 1 };
  assert.deepEqual(streaks(days, '2026-11-02'), { current: 2, longest: 3 });
});

test('an empty yesterday and today means no current streak', () => {
  const days = { '2026-10-30': 1, '2026-11-01': 0, '2026-11-02': 0 };
  assert.equal(streaks(days, '2026-11-02').current, 0);
});

test('render is deterministic and escapes nothing user-supplied', () => {
  const weeks = [{ contributionDays: [{ date: '2026-11-02', contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' }] }];
  const args = { theme: 'dark', allTime: 2906, lastYear: 2349, current: 45, longest: 45, weeks, rev: '2026-11-02' };
  assert.equal(renderCard(args), renderCard(args));
  assert.match(renderCard(args), /2,906/);
});
