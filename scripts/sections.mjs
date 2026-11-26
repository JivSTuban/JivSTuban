// Work timeline and project cards. Each entry leads with its numbers; the full sentences and links stay in the
// README under "as text". Icons are the PNGs in assets/icons, embedded as data URIs.
// Motion: rows and cards boot in, the rail draws down, the current job's node pulses. All behind
// prefers-reduced-motion: no-preference; the resting state is the finished layout.
import { readFileSync } from 'node:fs';
import { THEMES, SANS, MONO } from './card.mjs';

const W = 888;
const GAP = 20;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ease = 'cubic-bezier(.23,1,.32,1)';

export const WORK = [
  { role: 'AI Engineer', org: 'Traciety, full-time', from: 'APR 2026', to: 'NOW', icon: 'medspa', stats: [['98%', 'lower automation spend'], ['54→97%', 'booking attribution']] },
  { role: 'Software Engineer Intern', org: 'Ayahay', from: 'NOV 2025', to: 'MAR 2026', icon: 'ferry', stats: [['40%', 'lower chatbot latency'], ['57%', 'better retrieval recall']] },
  { role: 'Technical Lead', org: 'Crowdsnare AI', from: 'APR 2025', to: 'OCT 2025', icon: 'car', stats: [['90%', 'booking conversion'], ['11', 'cars sold by an AI agent']] },
  { role: 'AI Automation Developer', org: 'Cinematography for Actors Institute', from: 'JUL 2025', to: 'JAN 2026', icon: 'clapper', stats: [['70%', 'faster email replies'], ['45→85', 'mobile Lighthouse']] },
  { role: 'Full-stack Developer', org: 'Freckles Graphics', from: 'JUL 2024', to: 'MAR 2025', icon: 'print', stats: [['500+', 'orders a day'], ['85%', 'less manual work']] },
];

export const CARDS = [
  { name: 'AutoApply', what: 'job application engine', icon: 'autoapply', stat: ['11', 'people use it'] },
  { name: 'weewoo', what: 'encrypted location sharing', icon: 'privacy', stat: ['0', 'plaintext on the server'] },
  { name: 'Knowledge Base SDK', what: 'open-source RAG SDK', icon: 'sdk', stat: ['OSS', "powers Ayahay's chatbot"] },
  { name: 'Austin McClain', what: 'real estate portfolio', icon: 'house', stat: ['$13.5M', '119+ MLS listings'] },
  { name: "Keilah's Cakes", what: 'bakery storefront', icon: 'cake', stat: ['95+', 'Lighthouse score'] },
  { name: 'OJTech', what: 'internship matching', icon: 'internship', stat: ['NLP', 'job recommendations'] },
  { name: 'Navigram', what: 'social memories on a map', icon: 'map', stat: ['GEO', 'indexed, real-time chat'] },
  { name: 'GAssure', what: 'escrow on Solana', icon: 'escrow', stat: ['#1', 'of 196 teams, GCash'] },
];

const icon = (dir, name, theme, x, y, s) =>
  `<image href="data:image/png;base64,${readFileSync(`${dir}/${name}-${theme}.png`).toString('base64')}" x="${x}" y="${y}" width="${s}" height="${s}"/>`;

const style = (extra = '') => `<style>
@media (prefers-reduced-motion: no-preference){
  .b{animation:boot .5s ${ease} both}
  @keyframes boot{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  ${extra}
}
</style>`;

/** dir: assets/icons */
export function renderWork({ theme, dir, jobs = WORK }) {
  const t = THEMES[theme];
  const row = 172;
  const top = 26;
  const H = top + jobs.length * row;
  const rx = 172; // rail
  const cx = 280; // content
  const first = top + 22;
  const last = top + (jobs.length - 1) * row + 22;

  const rows = jobs
    .map((j, i) => {
      const y = top + i * row;
      const now = j.to === 'NOW';
      const node = now
        ? `<circle class="ping" cx="${rx}" cy="${y + 22}" r="8" fill="none" stroke="${t.accent}" stroke-width="2"/><circle cx="${rx}" cy="${y + 22}" r="8" fill="${t.accent}"/>`
        : `<circle cx="${rx}" cy="${y + 22}" r="7" fill="${t.paper}" stroke="${t.ink}" stroke-width="2"/>`;
      const stats = j.stats
        .map(
          ([v, l], k) =>
            `<text x="${cx + k * 300}" y="${y + 116}" font-family='${MONO}' font-size="42" font-weight="700" fill="${t.ink}">${esc(v)}</text>` +
            `<text x="${cx + k * 300}" y="${y + 146}" font-family='${SANS}' font-size="21" fill="${t.muted}">${esc(l)}</text>`,
        )
        .join('');
      const sep = i < jobs.length - 1 ? `<line x1="${rx + 28}" y1="${y + row - 8}" x2="${W - 24}" y2="${y + row - 8}" stroke="${t.muted}" stroke-width="1" opacity=".35"/>` : '';
      return `<g class="b" style="animation-delay:${150 + i * 110}ms">
<text x="24" y="${y + 29}" font-family='${MONO}' font-size="19" fill="${t.muted}">${j.from}</text>
<text x="24" y="${y + 56}" font-family='${MONO}' font-size="19" fill="${now ? t.accent : t.muted}">${j.to}</text>
${icon(dir, j.icon, theme, rx + 26, y - 6, 60)}
<text x="${cx}" y="${y + 24}" font-family='${SANS}' font-size="26" font-weight="700" fill="${t.ink}">${esc(j.role)}</text>
<text x="${cx}" y="${y + 54}" font-family='${SANS}' font-size="21" fill="${t.muted}">${esc(j.org)}</text>
${stats}${sep}</g>
${node}`;
    })
    .join('\n');

  const len = last - first;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(jobs.map((j) => `${j.role}, ${j.org}, ${j.from} to ${j.to}: ${j.stats.map((s) => s.join(' ')).join(', ')}`).join('. '))}">
${style(`.rail{stroke-dasharray:${len};animation:draw 1.1s ${ease} both}
  @keyframes draw{from{stroke-dashoffset:${len}}to{stroke-dashoffset:0}}
  .ping{transform-box:fill-box;transform-origin:center;animation:ping 2.4s ease-out infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(2.6);opacity:0}}`)}
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<line class="rail" x1="${rx}" y1="${first}" x2="${rx}" y2="${last}" stroke="${t.ink}" stroke-width="2"/>
${rows}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}

/** Two-column grid of project cards. dir: assets/icons */
export function renderProjects({ theme, dir, cards = CARDS }) {
  const t = THEMES[theme];
  const cw = W / 2;
  const ch = 184;
  const H = Math.ceil(cards.length / 2) * ch;

  const cells = cards
    .map((c, i) => {
      const x = (i % 2) * cw;
      const y = Math.floor(i / 2) * ch;
      const [v, l] = c.stat;
      const vw = v.length * 27.6; // 0.6em at 46px
      return `<g class="b" style="animation-delay:${150 + i * 70}ms">
${icon(dir, c.icon, theme, x + 22, y + 22, 56)}
<text x="${x + 94}" y="${y + 46}" font-family='${SANS}' font-size="26" font-weight="700" fill="${t.ink}">${esc(c.name)}</text>
<text x="${x + 94}" y="${y + 74}" font-family='${SANS}' font-size="20" fill="${t.muted}">${esc(c.what)}</text>
<text x="${x + 24}" y="${y + 150}" font-family='${MONO}' font-size="46" font-weight="700" fill="${t.ink}">${esc(v)}</text>
<text x="${x + 24 + vw + 14}" y="${y + 148}" font-family='${SANS}' font-size="21" fill="${t.muted}">${esc(l)}</text></g>`;
    })
    .join('\n');

  const rules =
    `<line x1="${cw}" y1="0" x2="${cw}" y2="${H}" stroke="${t.ink}" stroke-width="1"/>` +
    Array.from({ length: Math.ceil(cards.length / 2) - 1 }, (_, r) => `<line x1="0" y1="${(r + 1) * ch}" x2="${W}" y2="${(r + 1) * ch}" stroke="${t.ink}" stroke-width="1"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(cards.map((c) => `${c.name}, ${c.what}: ${c.stat.join(' ')}`).join('. '))}">
${style()}
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${cells}
${rules}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
