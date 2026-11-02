// Pure functions for the profile "title block" card: streak maths and SVG rendering.
// No network and no clock in here, so the output is reproducible and testable.

export const PROFILE = {
  name: 'Jiv Tuban',
  role: 'AI Engineer, Traciety',
};

// Two themes because GitHub serves light and dark profiles; the README switches with <picture>.
// Accent is used twice only: the current streak and today's cell. Both mean "now".
export const THEMES = {
  light: {
    paper: '#f4f1ea', ink: '#1d1c1a', muted: '#6b675e', accent: '#c2410c',
    levels: ['#e4e0d5', '#bdb8aa', '#8e897b', '#58554d', '#1d1c1a'],
  },
  dark: {
    paper: '#131210', ink: '#ece8dd', muted: '#9a9588', accent: '#f0662a',
    levels: ['#26241f', '#47443b', '#736d5d', '#a59e8c', '#ece8dd'],
  },
};

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

/**
 * Streaks from a date->count map. A streak is consecutive calendar days with at least one
 * contribution. The current streak survives an empty "today" (the day is not over yet), the same
 * rule GitHub's own graph and most streak widgets use.
 */
export function streaks(days, today) {
  const dates = Object.keys(days).sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of dates) {
    if (days[d] > 0) {
      run = prev && dayDiff(prev, d) === 1 && run > 0 ? run + 1 : 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
    prev = d;
  }
  let current = 0;
  let cursor = today;
  if (!(days[cursor] > 0)) cursor = shift(cursor, -1);
  while (days[cursor] > 0) {
    current += 1;
    cursor = shift(cursor, -1);
  }
  return { current, longest };
}

function dayDiff(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

function shift(date, n) {
  return new Date(Date.parse(date) + n * 86400000).toISOString().slice(0, 10);
}

export const fmt = (n) => n.toLocaleString('en-US');

/** weeks: GitHub calendar weeks, newest last. Each day: { date, contributionCount, contributionLevel }. */
export function renderCard({ theme, allTime, lastYear, current, longest, weeks, rev }) {
  const t = THEMES[theme];
  const W = 888;
  const rowA = 104;
  const rowB = 116;
  const gridTop = rowA + rowB;
  const pitch = 16;
  const cell = 13;
  const gridX = Math.round((W - (weeks.length * pitch - (pitch - cell))) / 2);
  const gridY = gridTop + 52;
  const H = gridY + 7 * pitch + 22;
  const GAP = 20; // transparent space under the card; GitHub ignores <br> after a <picture>

  const today = weeks.at(-1).contributionDays.at(-1).date;

  const label = (x, y, s, anchor = 'start') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family='${MONO}' font-size="16" letter-spacing="0.5" fill="${t.muted}">${s}</text>`;

  const stat = (i, name, value, unit, color) => {
    const x = i * (W / 4);
    return (
      label(x + 18, rowA + 34, name) +
      `<text x="${x + 18}" y="${rowA + 90}" font-family='${MONO}' font-size="48" font-weight="600" fill="${color}">${value}</text>` +
      (unit
        ? `<text x="${x + 18 + String(value).length * 28.8 + 8}" y="${rowA + 90}" font-family='${SANS}' font-size="18" fill="${t.muted}">${unit}</text>`
        : '')
    );
  };

  let squares = '';
  weeks.forEach((w, wi) => {
    w.contributionDays.forEach((d, di) => {
      const isToday = d.date === today;
      const fill = isToday ? t.accent : t.levels[LEVEL[d.contributionLevel] ?? 0];
      squares += `<rect x="${gridX + wi * pitch}" y="${gridY + di * pitch}" width="${cell}" height="${cell}" fill="${fill}"/>`;
    });
  });

  const rules =
    `<line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${rowA}" stroke="${t.ink}" stroke-width="1"/>` +
    `<line x1="0" y1="${rowA}" x2="${W}" y2="${rowA}" stroke="${t.ink}" stroke-width="1"/>` +
    [1, 2, 3].map((i) => `<line x1="${i * (W / 4)}" y1="${rowA}" x2="${i * (W / 4)}" y2="${gridTop}" stroke="${t.ink}" stroke-width="1"/>`).join('') +
    `<line x1="0" y1="${gridTop}" x2="${W}" y2="${gridTop}" stroke="${t.ink}" stroke-width="1"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-labelledby="t d">
<title id="t">${PROFILE.name}, ${PROFILE.role}</title>
<desc id="d">${fmt(allTime)} GitHub contributions all time, ${fmt(lastYear)} in the last 12 months, current streak ${current} days, longest streak ${longest} days.</desc>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${label(18, 34, 'NAME')}
<text x="18" y="82" font-family='${SANS}' font-size="40" font-weight="700" fill="${t.ink}">${PROFILE.name}</text>
${label(W / 2 + 18, 34, 'ROLE')}
<text x="${W / 2 + 18}" y="82" font-family='${SANS}' font-size="28" font-weight="600" fill="${t.ink}">${PROFILE.role}</text>
${stat(0, 'CONTRIBUTIONS', fmt(allTime), '', t.ink)}
${stat(1, 'LAST 12 MONTHS', fmt(lastYear), '', t.ink)}
${stat(2, 'STREAK', current, 'days', t.accent)}
${stat(3, 'LONGEST STREAK', longest, 'days', t.ink)}
${label(18, gridTop + 34, 'LAST 52 WEEKS')}
${label(W - 18, gridTop + 34, `REV ${rev}`, 'end')}
${squares}
${rules}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
