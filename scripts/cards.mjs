// One strip per job, after the Spotify "now playing" cards (github.com/kittinan/spotify-github-profile):
// drawn cover art, the name as the track, the role or what it does as the artist, the figures underneath. Jobs get the
// progress bar with their dates; the current job is the one playing. Every figure on a strip is a fact from the README.
// Motion is CSS behind prefers-reduced-motion: no-preference; the resting state is a paused frame.
import { THEMES, SANS, MONO } from './card.mjs';

const W = 888;
const H = 176;
const GAP = 12;
const C = 140; // cover size
const X = 18 + C + 22; // text column

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const EXTRA = {
  light: { card: '#fbf9f4', line: '#dcd7cb', track: '#e4e0d5' },
  dark: { card: '#1b1a17', line: '#3a372f', track: '#3a372f' },
};

export const WORK = [
  { slug: 'traciety', color: ['#9a3412', '#f59e0b'], eyebrow: 'APR 2026 — NOW', name: ['Traciety'], role: 'AI Engineer, full-time', head: ['Moved the automations', 'off Make.com onto', 'self-hosted n8n.'], figs: [['98%', 'less spend'], ['45', 'clinics'], ['97%', 'attributed']], href: 'https://traciety.com' },
  { slug: 'ayahay', color: ['#155e75', '#22d3ee'], eyebrow: 'NOV 2025 — MAR 2026', name: ['Ayahay'], role: 'Software Engineer Intern', head: ['Rebuilt a multi-tenant', 'RAG chatbot as NestJS', 'microservices.'], figs: [['40%', 'faster'], ['57%', 'more recall']] },
  { slug: 'crowdsnare', color: ['#1e3a8a', '#60a5fa'], eyebrow: 'APR — OCT 2025', name: ['Crowdsnare AI'], role: 'Technical Lead', head: ['Speed-to-lead agents', 'that text, qualify and', 'book car buyers.'], figs: [['90%', 'booked'], ['11', 'cars sold'], ['10+', 'dealers']], href: 'https://crowdsnare.com/' },
  { slug: 'cfai', color: ['#4c1d95', '#c084fc'], eyebrow: 'JUL 2025 — JAN 2026', name: ['Cinematography', 'for Actors Institute'], role: 'AI Automation Developer', head: ['Email replies drafted', 'from 50+ SOPs on', 'Google Cloud Run.'], figs: [['70%', 'faster'], ['85+', 'Lighthouse']] },
  { slug: 'freckles', color: ['#9d174d', '#f9a8d4'], eyebrow: 'JUL 2024 — MAR 2025', name: ['Freckles Graphics'], role: 'Full-stack Developer', head: ['A print workflow for a', '$12M+ a year apparel', 'shop.'], figs: [['500+', 'orders/day'], ['85%', 'less manual']] },
];

export const PROJECTS_CARDS = [
  { slug: 'autoapply', color: ['#1e4f6b', '#4a9cc4'], eyebrow: 'MULTI-TENANT · PLAYWRIGHT', name: ['AutoApply'], head: ['Reads a resume, scores', 'the fit, fills and sends', 'the application.'], figs: [['11', 'users'], ['377', 'tests']] },
  { slug: 'weewoo', color: ['#7a2e55', '#e58bbb'], eyebrow: 'FLUTTER · LIBSODIUM', name: ['weewoo'], head: ['Location sharing and', 'chat, end-to-end', 'encrypted.'], figs: [['36', 'RLS policies'], ['223', 'tests']] },
  { slug: 'kbsdk', color: ['#2a5a25', '#76ad57'], eyebrow: 'OPEN SOURCE · TYPESCRIPT', name: ['Knowledge Base', 'SDK'], head: ['Train on your docs,', 'stream answers into a', 'whitelabel chat.'], figs: [['RAG', 'pgvector'], ['SSE', 'streaming']], href: 'https://github.com/JivSTuban/knowledge-base-sdk' },
  { slug: 'austin', color: ['#4a463d', '#b3ab97'], eyebrow: 'REAL ESTATE · REACT', name: ['Austin McClain'], head: ['A realtor portfolio fed', 'by automated MLS', 'listings.'], figs: [['119+', 'listings'], ['$13.5M', 'in value']], href: 'https://austinmcclain.com' },
  { slug: 'keilah', color: ['#8a3f63', '#f3b6d3'], eyebrow: 'STOREFRONT · NEXT.JS', name: ["Keilah's Cakes"], head: ['A bakery storefront', 'with a fast image', 'pipeline.'], figs: [['95+', 'Lighthouse']], href: 'https://keilahs.shop' },
  { slug: 'ojtech', color: ['#1f5f78', '#8fd0ea'], eyebrow: 'SPRING BOOT · GEMINI', name: ['OJTech'], head: ['Matches students to', 'internships with NLP', 'recommendations.'], figs: [['NLP', 'matching']] },
  { slug: 'navigram', color: ['#3d6324', '#b4dc84'], eyebrow: 'SPRING BOOT · WEBSOCKETS', name: ['Navigram'], head: ['Memories pinned to', 'places, with real-time', 'chat.'], figs: [['GEO', 'indexed'], ['LIVE', 'chat']] },
  { slug: 'gassure', color: ['#7a5414', '#f0c25a'], eyebrow: 'SOLANA · REACT', name: ['GAssure'], head: ['Escrow that holds the', 'money until the item', 'arrives.'], figs: [['#1', 'of 196 teams'], ['980', 'students']] },
];


/** Album-style cover, s wide at (x, y): the entry's colours, rings off one corner, its name set in the bottom left. */
function cover(entry, x, y, s = C) {
  const [dark, light] = entry.color;
  const seed = [...entry.slug].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7);
  const cx = seed % 2 ? C * 0.78 : C * 0.22;
  const cy = C * (0.18 + (seed % 5) * 0.06);
  const rings = [1, 2, 3, 4].map((k) => `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${16 + k * 17}" fill="none" stroke="#fff" stroke-opacity="${(0.32 - k * 0.06).toFixed(2)}" stroke-width="1.5"/>`).join('');
  const words = entry.name.join(' ').split(' ');
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= 13) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  const title = lines
    .slice(-3)
    .map((l, i, a) => `<text x="12" y="${C - 14 - (a.length - 1 - i) * 17}" font-family='${SANS}' font-size="15" font-weight="800" letter-spacing="-0.2" fill="#fff">${esc(l)}</text>`)
    .join('');
  return `<defs><linearGradient id="cv" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${light}"/></linearGradient><clipPath id="cc"><rect width="${C}" height="${C}" rx="10"/></clipPath></defs>
<g transform="translate(${x} ${y}) scale(${(s / C).toFixed(4)})"><g clip-path="url(#cc)"><rect width="${C}" height="${C}" fill="url(#cv)"/><g class="rg" style="transform-origin:${cx.toFixed(1)}px ${cy.toFixed(1)}px"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="22" fill="#fff" fill-opacity=".22"/>${rings}</g><rect y="${C * 0.55}" width="${C}" height="${C * 0.45}" fill="#000" fill-opacity=".18"/>${title}</g></g>`;
}

/** "Mon YYYY" pair from an eyebrow like "APR — OCT 2025" or "APR 2026 — NOW". */
function span(eyebrow) {
  const [a, b] = eyebrow.split(' — ');
  const year = b.match(/\d{4}/)?.[0];
  return [/\d/.test(a) || !year ? a : `${a} ${year}`, b];
}

/** One strip. entry: { name[], role?, eyebrow, head[], figs[[value, label]], color[dark, light] }. */
export function renderEntryCard({ theme, entry }) {
  const t = { ...THEMES[theme], ...EXTRA[theme] };
  const job = Boolean(entry.role);
  const playing = job && entry.eyebrow.endsWith('NOW');
  const name = entry.name.join(' ');
  const nameSize = Math.min(32, Math.floor((W - X - 90) / (name.length * 0.58)));

  const eyebrow = job ? (playing ? 'NOW PLAYING' : 'PLAYED') : entry.eyebrow;
  const sub = job ? entry.role : entry.head.join(' ');

  // top right: an equalizer on the track that is playing (each bar its own tempo), a play button on the rest
  const bars = [0.55, 0.9, 0.4, 0.75, 0.6];
  const eqX = W - 24 - bars.length * 9;
  const eq = playing
    ? bars.map((h, i) => `<rect class="q q${i}" x="${eqX + i * 9}" y="24" width="5" height="22" rx="1.5" fill="${t.accent}" style="transform:scaleY(${h})"/>`).join('')
    : `<circle cx="${W - 42}" cy="36" r="18" fill="${t.accent}"/><path d="M${W - 48} 27 L${W - 33} 36 L${W - 48} 45 Z" fill="${t.paper}"/>`;
  const eqCss = bars.map((h, i) => `.q${i}{animation:q ${(0.7 + ((i * 37) % 5) * 0.13).toFixed(2)}s ease-in-out ${(-i * 0.21).toFixed(2)}s infinite alternate}`).join('');

  let fx = X;
  const figs = entry.figs
    .map(([v, l]) => {
      const out = `<text x="${fx}" y="${job ? 128 : 134}" font-family='${MONO}' font-size="20" font-weight="700" fill="${t.accent}">${esc(v)}</text><text x="${fx + v.length * 12 + 8}" y="${job ? 128 : 134}" font-family='${MONO}' font-size="19" fill="${t.ink}">${esc(l)}</text>`;
      fx += v.length * 12 + 8 + l.length * 11.4 + 30;
      return out;
    })
    .join('');

  // progress bar: dates on either side, full when the job is over, moving while it is current
  const bx = X + 96;
  const bw = W - 24 - 96 - bx;
  let progress = '';
  if (job) {
    const [from, to] = span(entry.eyebrow);
    const at = playing ? 0.62 : 1;
    progress = `<text x="${X}" y="${158}" font-family='${MONO}' font-size="14" fill="${t.muted}">${esc(from)}</text>
<text x="${W - 24}" y="${158}" font-family='${MONO}' font-size="14" text-anchor="end" fill="${t.muted}">${esc(to)}</text>
<rect x="${bx}" y="151" width="${bw}" height="5" rx="2.5" fill="${t.track}"/>
<rect class="${playing ? 'fill' : ''}" x="${bx}" y="151" width="${bw}" height="5" rx="2.5" fill="${playing ? t.accent : t.muted}" style="transform-box:fill-box;transform-origin:0 50%;transform:scaleX(${at})"/>
${playing ? `<g class="knob" style="transform:translateX(${(bw * at).toFixed(1)}px)"><circle cx="${bx}" cy="153.5" r="7" fill="${t.ink}"/></g>` : ''}`;
  }

  const label = `${name}${job ? `, ${entry.role}` : ''}, ${entry.eyebrow.toLowerCase()}. ${entry.head.join(' ')} ${entry.figs.map(([v, l]) => `${v} ${l}`).join(', ')}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(label)}">
<style>
@media (prefers-reduced-motion: no-preference){
  @keyframes q{from{transform:scaleY(.2)}to{transform:scaleY(1)}}
  ${eqCss}
  @keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes knob{from{transform:translateX(0)}to{transform:translateX(${bw}px)}}
  .fill{animation:fill 40s linear -24.8s infinite}
  .knob{animation:knob 40s linear -24.8s infinite}
}
.q{transform-box:fill-box;transform-origin:50% 100%}
</style>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="16" fill="${t.card}" stroke="${t.line}" stroke-width="1.5"/>
${cover(entry, 18, 18)}
<text x="${X}" y="40" font-family='${MONO}' font-size="14" font-weight="${playing ? 700 : 400}" letter-spacing="1.5" fill="${playing ? t.accent : t.muted}">${esc(eyebrow)}</text>
${eq}
<text x="${X}" y="${job ? 78 : 82}" font-family='${SANS}' font-size="${nameSize}" font-weight="800" letter-spacing="-0.6" fill="${t.ink}">${esc(name)}</text>
<text x="${X}" y="${job ? 104 : 110}" font-family='${SANS}' font-size="20" fill="${t.muted}">${esc(sub)}</text>
${figs}
${progress}
</svg>
`;
}

