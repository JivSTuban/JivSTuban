// Builds card-light.svg and card-dark.svg from the GitHub GraphQL API.
//   GH_TOKEN=... node scripts/build.mjs [outDir]
// The workflow publishes the output to the `output` branch; the README reads it from there.
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderCard, streaks, THEMES } from './card.mjs';

const LOGIN = 'JivSTuban';
const out = process.argv[2] ?? 'dist';
const token = process.env.GH_TOKEN;
if (!token) throw new Error('GH_TOKEN is required');

async function gql(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GraphQL failed: ${res.status} ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

const DAYS = 'contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } }';

const { user } = await gql(`{ user(login: "${LOGIN}") { createdAt contributionsCollection { ${DAYS} } } }`);
const recent = user.contributionsCollection.contributionCalendar;

// contributionsCollection spans at most one year, so walk back to account creation in 1-year windows.
// Windows can overlap by a day, so days are keyed by date instead of summed per window.
const windows = [];
for (let from = Date.parse(user.createdAt); from < Date.now(); from += 365 * 86400000) {
  const to = Math.min(from + 365 * 86400000, Date.now());
  windows.push(`w${windows.length}: contributionsCollection(from: "${new Date(from).toISOString()}", to: "${new Date(to).toISOString()}") { ${DAYS} }`);
}
const all = (await gql(`{ user(login: "${LOGIN}") { ${windows.join(' ')} } }`)).user;

// The windowed queries stop at yesterday, so the default calendar (which includes today) is merged in too.
const days = {};
for (const w of [...Object.values(all), { contributionCalendar: recent }]) {
  for (const week of w.contributionCalendar.weeks) {
    for (const d of week.contributionDays) days[d.date] = Math.max(days[d.date] ?? 0, d.contributionCount);
  }
}

const today = recent.weeks.at(-1).contributionDays.at(-1).date;
const { current, longest } = streaks(days, today);
const allTime = Object.values(days).reduce((a, b) => a + b, 0);

mkdirSync(out, { recursive: true });
for (const theme of Object.keys(THEMES)) {
  const svg = renderCard({ theme, allTime, lastYear: recent.totalContributions, current, longest, weeks: recent.weeks, rev: today });
  writeFileSync(`${out}/card-${theme}.svg`, svg);
}
console.log(JSON.stringify({ allTime, lastYear: recent.totalContributions, current, longest, today }));
