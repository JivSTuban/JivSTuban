// Animated stack grid: the technology tiles Jiv works with, in one self-contained SVG per theme.
// Tiles are vendored in assets/tech (skill-icons, MIT; glyphs from simple-icons CC0 and devicon/lobe-icons MIT,
// see assets/tech/SOURCES.md). Each tile is embedded as a data URI so ids inside one icon can never clash
// with another, and nothing is fetched from a third party at view time.
import { readFileSync } from 'node:fs';
import { THEMES, SANS, MONO } from './card.mjs';

// kind: v = has -Dark/-Light files, s = single file, g = glyph drawn onto a tile here
const GROUPS = [
  ['AI', [['claude', 'g'], ['openai', 'g'], ['n8n', 'g'], ['playwright', 'g'], ['Python', 'v'], ['TensorFlow', 'v']]],
  ['FRONTEND', [['React', 'v'], ['NextJS', 'v'], ['TypeScript', 's'], ['TailwindCSS', 'v'], ['Angular', 'v'], ['VueJS', 'v'], ['Flutter', 'v'], ['Dart', 'v']]],
  ['BACKEND', [['NestJS', 'v'], ['Spring', 'v'], ['FastAPI', 's'], ['Django', 's'], ['Flask', 'v'], ['Laravel', 'v'], ['DotNet', 's'], ['NodeJS', 'v']]],
  ['CLOUD/DATA', [['AWS', 'v'], ['GCP', 'v'], ['digitalocean', 'g'], ['Supabase', 'v'], ['PostgreSQL', 'v'], ['MySQL', 'v'], ['Docker', 's']]],
  ['TOOLS', [['Git', 's'], ['Github', 'v'], ['VSCode', 'v'], ['Linux', 'v']]],
];

// Glyph tiles: same 256 canvas and corner radius as skill-icons so they sit in the same row.
const GLYPHS = {
  claude: { scale: 160 / 24, fill: '#D97757' },
  n8n: { scale: 160 / 24, fill: '#EA4B71' },
  digitalocean: { scale: 160 / 24, fill: '#0080FF' },
  openai: { scale: 160 / 24, fill: { dark: '#FFFFFF', light: '#111111' } },
  playwright: { scale: 1.3, fill: null }, // already multi-colour
};
const TILE = { dark: '#242938', light: '#F4F2ED' };

const read = (dir, f) => readFileSync(`${dir}/${f}`, 'utf8');
const b64 = (s) => Buffer.from(s).toString('base64');

function glyphTile(dir, name, theme) {
  const g = GLYPHS[name];
  const src = read(dir, `glyph-${name}.svg`);
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/, '');
  const fill = g.fill ? (typeof g.fill === 'string' ? g.fill : g.fill[theme]) : null;
  const offset = (256 - (name === 'playwright' ? 128 * g.scale : 24 * g.scale)) / 2;
  const body = fill ? inner.replace(/<path /g, `<path fill="${fill}" `).replace(/fill="currentColor"/g, '') : inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="${TILE[theme]}" rx="60"/><g transform="translate(${offset} ${offset}) scale(${g.scale})">${body}</g></svg>`;
}

function tileSvg(dir, [name, kind], theme) {
  if (kind === 'g') return glyphTile(dir, name, theme);
  if (kind === 's') return read(dir, `${name}.svg`);
  return read(dir, `${name}-${theme === 'dark' ? 'Dark' : 'Light'}.svg`);
}

export function renderStack({ theme, dir }) {
  const t = THEMES[theme];
  const W = 888;
  const head = 52;
  const labelW = 168;
  const pitch = 84;
  const tile = 64;
  const rowH = 92;
  const H = head + GROUPS.length * rowH + 12;
  const total = GROUPS.reduce((n, g) => n + g[1].length, 0);

  let body = '';
  let i = 0;
  GROUPS.forEach(([label, items], r) => {
    const y = head + r * rowH;
    body += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${t.ink}" stroke-width="1"/>`;
    body += `<text x="18" y="${y + rowH / 2 + 6}" font-family='${MONO}' font-size="16" letter-spacing="0.5" fill="${t.muted}">${label}</text>`;
    items.forEach((item, c) => {
      const x = labelW + c * pitch;
      const ty = y + (rowH - tile) / 2;
      const uri = `data:image/svg+xml;base64,${b64(tileSvg(dir, item, theme))}`;
      // outer <g> positions, inner <g> animates: CSS transform would otherwise replace the position attribute
      body += `<g transform="translate(${x} ${ty})"><g class="t" style="animation-delay:${i * 28}ms">` +
        `<rect x="0.5" y="0.5" width="${tile - 1}" height="${tile - 1}" rx="15" fill="none" stroke="${t.muted}" stroke-opacity="0.35"/>` +
        `<image href="${uri}" width="${tile}" height="${tile}"/>` +
        `<rect class="p" style="animation-delay:${1400 + (c + r) * 300}ms" x="-2" y="-2" width="${tile + 4}" height="${tile + 4}" rx="17" fill="none" stroke="${t.accent}" stroke-width="2.5"/>` +
        `</g></g>`;
      i += 1;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Technology stack: ${GROUPS.map(([l, it]) => `${l.toLowerCase()} (${it.map(([n]) => n).join(', ')})`).join('; ')}</title>
<style>
.p{opacity:0}
@media (prefers-reduced-motion: no-preference){
  .t{animation:rise .3s cubic-bezier(.23,1,.32,1) both}
  .p{animation:ping 10s linear infinite}
  @keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes ping{0%{opacity:0}2%{opacity:1}8%{opacity:1}12%{opacity:0}100%{opacity:0}}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text x="18" y="34" font-family='${MONO}' font-size="16" letter-spacing="0.5" fill="${t.muted}">STACK</text>
<text x="${W - 18}" y="34" text-anchor="end" font-family='${MONO}' font-size="16" letter-spacing="0.5" fill="${t.muted}">${total} TOOLS</text>
${body}
<line x1="${labelW - 12}" y1="${head}" x2="${labelW - 12}" y2="${H}" stroke="${t.ink}" stroke-width="1"/>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
