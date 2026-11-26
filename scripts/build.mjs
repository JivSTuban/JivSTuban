// Builds every generated image the README uses into [outDir]:
//   card-{light,dark}.svg    title block + live stats + activity grid (GitHub GraphQL, needs GH_TOKEN)
//   stack-{light,dark}.svg   animated technology grid
//   chip-<name>-{light,dark}.svg  contact links
//   typing-{light,dark}.svg  terminal prompt typing true lines
//   fetch-{light,dark}.svg   neofetch readout with the ASCII portrait and live stats
//   work-<slug>-{light,dark}.svg  a now-playing strip per job
//   projects-{light,dark}.svg  the projects in a Windows 95 Explorer window
//   GH_TOKEN=... node scripts/build.mjs [outDir]
// The workflow publishes the output to the `output` branch; the README reads it from there.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { renderCard, streaks, fmt, THEMES } from './card.mjs';
import { renderTyping, renderFetch, uptime } from './terminal.mjs';
import { renderEntryCard, WORK, PROJECTS_CARDS } from './cards.mjs';
import { renderExplorer } from './explorer.mjs';
import { renderStack } from './stack.mjs';
import { renderChip } from './motion.mjs';

const LOGIN = 'JivSTuban';
const out = process.argv[2] ?? 'dist';
const token = process.env.GH_TOKEN;
if (!token) throw new Error('GH_TOKEN is required');
const root = new URL('..', import.meta.url).pathname;
const tech = `${root}assets/tech`;

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

const { user } = await gql(`{ user(login: "${LOGIN}") { createdAt repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount } contributionsCollection { ${DAYS} } } }`);
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

const lastYear = recent.totalContributions;
const lines = [
  'I build AI automation for US startups',
  'cut automation spend 98% at Traciety',
  '1st of 196 teams at GCash ImaGnation 2025',
  `${fmt(lastYear)} contributions in the last 12 months`,
  'shipping from Cebu, Philippines, remote',
];
const clock = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' }); // build day in Cebu
const rows = [
  ['OS', 'Cebu, Philippines (UTC+8)'],
  ['Host', 'Traciety, AI Engineer'],
  ['Kernel', 'BS IT, CIT-U, class of 2026'],
  ['Uptime', uptime(user.createdAt, today)],
  ['Packages', `${user.repositories.totalCount} public repos`],
  ['Shell', 'Claude Code, Codex CLI, n8n'],
  ['Award', '1st of 196, GCash ImaGnation 2025'],
  ['Contribs', `${fmt(allTime)} all time, ${fmt(lastYear)} in 12 months`],
  ['Streak', `${current} days, longest ${longest}`, true],
];

mkdirSync(out, { recursive: true });
for (const theme of Object.keys(THEMES)) {
  writeFileSync(`${out}/typing-${theme}.svg`, renderTyping({ theme, lines }));
  writeFileSync(`${out}/fetch-${theme}.svg`, renderFetch({ theme, art: readFileSync(`${root}assets/portrait/ascii-${theme}.txt`, 'utf8'), colors: JSON.parse(readFileSync(`${root}assets/portrait/colors-${theme}.json`, 'utf8')), rows }));
  for (const entry of WORK) writeFileSync(`${out}/work-${entry.slug}-${theme}.svg`, renderEntryCard({ theme, entry }));
  writeFileSync(`${out}/projects-${theme}.svg`, renderExplorer({ projects: PROJECTS_CARDS, clock }));
  writeFileSync(`${out}/stack-${theme}.svg`, renderStack({ theme, dir: tech }));
  for (const [file, label, icon] of [['linkedin', 'LinkedIn', 'LinkedIn'], ['email', 'Email', 'Email'], ['portfolio', 'Portfolio', 'Portfolio'], ['cv', 'CV (PDF)', 'CV']]) {
    writeFileSync(`${out}/chip-${file}-${theme}.svg`, renderChip({ theme, label, icon, dir: tech }));
  }
  const svg = renderCard({ theme, allTime, lastYear, current, longest, weeks: recent.weeks, rev: today });
  writeFileSync(`${out}/card-${theme}.svg`, svg);
}
console.log(JSON.stringify({ allTime, lastYear, current, longest, today }));
