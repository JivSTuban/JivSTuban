// Certifications as a wall of hexagon badges (the Credly look): the issuer's colour on the rim, the subject's logo
// in the middle, the issuer on a ribbon, the course name under it. The list is the CV's (Tuban_CV.pdf).
// Logos come from assets/tech (see SOURCES.md); PHP has no tile there, so it is drawn here.
// Badges pop in on load and a shine crosses each one in turn; at rest every badge is in place.
import { readFileSync } from 'node:fs';
import { THEMES, SANS, MONO } from './card.mjs';
import { tileSvg } from './stack.mjs';

const W = 888;
const GAP = 20;
const COLS = 5;
const COL = W / COLS;
const ROW = 214;
const ISSUER = {
  anthropic: [{ light: '#D97757', dark: '#D97757' }, 'ANTHROPIC'],
  aws: [{ light: '#FF9900', dark: '#FF9900' }, 'AWS ACADEMY'],
  udemy: [{ light: '#A435F0', dark: '#A435F0' }, 'UDEMY'],
  accenture: [{ light: '#A100FF', dark: '#A100FF' }, 'ACCENTURE'],
  freecodecamp: [{ light: '#0A0A23', dark: '#3B3B4F' }, 'FREECODECAMP'],
  codechum: [{ light: '#1E9BE9', dark: '#1E9BE9' }, 'CODECHUM'],
};

export const CERTS = [
  { issuer: 'anthropic', logo: 'claude', title: ['Claude Code', 'in Action'] },
  { issuer: 'anthropic', logo: 'claude', title: ['Building with', 'the Claude API'] },
  { issuer: 'anthropic', logo: 'mcp', title: ['MCP', 'Introduction'] },
  { issuer: 'anthropic', logo: 'mcp', title: ['MCP', 'Advanced Topics'] },
  { issuer: 'anthropic', logo: 'claude', title: ['Agent Skills'] },
  { issuer: 'anthropic', logo: 'claude', title: ['Subagents'] },
  { issuer: 'aws', logo: 'AWS', title: ['Cloud', 'Architecting'] },
  { issuer: 'aws', logo: 'AWS', title: ['Cloud', 'Foundations'] },
  { issuer: 'udemy', logo: 'Django', title: ['Python & Django', 'Full Stack'] },
  { issuer: 'udemy', logo: 'DotNet', title: ['Web API', 'in .NET 8'] },
  { issuer: 'udemy', logo: 'php', title: ['PHP', 'Full Stack'] },
  { issuer: 'udemy', logo: 'Angular', title: ['Angular', 'Complete Guide'] },
  { issuer: 'accenture', logo: 'accenture', title: ['Digital Skills', 'UX'] },
  { issuer: 'freecodecamp', logo: 'freecodecamp', title: ['Foundational C#', 'with Microsoft'] },
  { issuer: 'codechum', logo: 'codechum', title: ['Java OOP'] },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TILE = { dark: '#242938', light: '#F4F2ED' };
const tile = (bg, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="60" fill="${bg}"/>${inner}</svg>`;
// a 24-unit simple-icons glyph centred on a tile
const glyph = (dir, name, fill, bg) => {
  const inner = readFileSync(`${dir}/glyph-${name}.svg`, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/, '');
  return tile(bg, `<g transform="translate(56 56) scale(6)" fill="${fill}">${inner}</g>`);
};
const hex = (cx, cy, r) =>
  [0, 1, 2, 3, 4, 5].map((k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');

function logoSvg(dir, name, theme) {
  if (name === 'claude') return tileSvg(dir, ['claude', 'g'], theme);
  if (name === 'mcp') return glyph(dir, 'mcp', theme === 'dark' ? '#FFFFFF' : '#111111', TILE[theme]);
  if (name === 'accenture') return glyph(dir, 'accenture', '#A100FF', TILE[theme]);
  if (name === 'freecodecamp') return glyph(dir, 'freecodecamp', '#FFFFFF', '#0A0A23');
  if (name === 'codechum') return tile(TILE[theme], `<image href="data:image/png;base64,${readFileSync(`${dir}/codechum.png`).toString('base64')}" x="28" y="28" width="200" height="200"/>`);
  if (name === 'php') return tile('#777BB4', `<text x="128" y="158" font-family="Verdana, sans-serif" font-size="92" font-weight="700" font-style="italic" text-anchor="middle" fill="#fff">php</text>`);
  if (name === 'AWS' || name === 'Angular') return tileSvg(dir, [name, 'v'], theme);
  return tileSvg(dir, [name, 's'], theme);
}

export function renderCerts({ theme, dir, certs = CERTS }) {
  const t = THEMES[theme];
  const top = 46;
  const rows = Math.ceil(certs.length / COLS);
  const H = top + rows * ROW + 6;
  let body = '';
  let defs = '';
  certs.forEach((c, i) => {
    const x = (i % COLS) * COL;
    const y = top + Math.floor(i / COLS) * ROW;
    const [colors, issuer] = ISSUER[c.issuer];
    const color = colors[theme];
    const cx = x + COL / 2;
    const cy = y + 72;
    defs += `<clipPath id="h${i}"><polygon points="${hex(cx, cy, 56)}"/></clipPath>`;
    let b = `<polygon points="${hex(cx, cy, 63)}" fill="${color}"/><polygon points="${hex(cx, cy, 56)}" fill="${t.paper}"/><polygon points="${hex(cx, cy, 50)}" fill="none" stroke="${color}" stroke-opacity=".35" stroke-width="2"/>`;
    b += `<image href="data:image/svg+xml;base64,${Buffer.from(logoSvg(dir, c.logo, theme)).toString('base64')}" x="${cx - 27}" y="${cy - 35}" width="54" height="54"/>`;
    b += `<g clip-path="url(#h${i})"><rect class="sh" style="animation-delay:${(1.2 + i * 0.5).toFixed(1)}s" x="${cx - 110}" y="${cy - 64}" width="36" height="128" fill="#fff" fill-opacity=".45" transform="skewX(-20)"/></g>`;
    const rw = issuer.length * 7.8 + 20;
    b += `<path d="M${cx - rw / 2 - 7} ${cy + 30}h${rw + 14}l-6 10 6 10h${-(rw + 14)}l6 -10z" fill="${color}"/>`;
    b += `<text x="${cx}" y="${cy + 45}" font-family='${MONO}' font-size="12" font-weight="700" letter-spacing="1" text-anchor="middle" fill="#fff">${esc(issuer)}</text>`;
    c.title.forEach((l, k) => {
      b += `<text x="${cx}" y="${y + 166 + k * 23}" font-family='${SANS}' font-size="${k ? 16 : 18}" font-weight="${k ? 400 : 700}" text-anchor="middle" fill="${k ? t.muted : t.ink}">${esc(l)}</text>`;
    });
    body += `<g class="b" style="animation-delay:${i * 70}ms">${b}</g>`;
  });

  const label = `Certifications: ${certs.map((c) => `${c.title.join(' ')} (${ISSUER[c.issuer][1].toLowerCase()})`).join(', ')}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(label)}">
<defs>${defs}</defs>
<style>
.sh{opacity:0}
@media (prefers-reduced-motion: no-preference){
  .b{animation:pop .45s cubic-bezier(.34,1.56,.64,1) both;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}
  .sh{animation:sh 8s ease-in-out infinite}
  @keyframes sh{0%{opacity:1;transform:translateX(0) skewX(-20deg)}12%{opacity:1;transform:translateX(240px) skewX(-20deg)}13%,100%{opacity:0;transform:translateX(240px) skewX(-20deg)}}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text x="24" y="30" font-family='${MONO}' font-size="13" letter-spacing="1.5" fill="${t.muted}">CERTIFICATIONS</text>
<line x1="0" y1="${top - 4}" x2="${W}" y2="${top - 4}" stroke="${t.ink}" stroke-width="1.5"/>
${body}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
