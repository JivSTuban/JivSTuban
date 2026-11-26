// Certifications as a wall of hexagon badges (the Credly look): the issuer's colour on the rim, the subject's logo
// in the middle, the issuer on a ribbon. Anthropic Academy gets the wide tile with its count.
// Logos come from assets/tech through the stack's tile helper; PHP has no tile there, so it is drawn here.
// Badges pop in on load and a shine crosses each one in turn; at rest every badge is in place.
import { THEMES, SANS, MONO } from './card.mjs';
import { tileSvg } from './stack.mjs';

const W = 888;
const GAP = 20;
const COL = W / 4;
const ROW = 250;
const ISSUER = { anthropic: ['#D97757', 'ANTHROPIC'], aws: ['#FF9900', 'AWS ACADEMY'], udemy: ['#A435F0', 'UDEMY'] };

export const CERTS = [
  { issuer: 'anthropic', logo: ['claude', 'g'], title: ['Anthropic Academy'], count: '18', sub: 'Jun 2026' },
  { issuer: 'aws', logo: ['AWS', 'v'], title: ['Cloud', 'Architecting'] },
  { issuer: 'aws', logo: ['AWS', 'v'], title: ['Cloud', 'Foundations'] },
  { issuer: 'udemy', logo: ['Django', 's'], title: ['Python & Django', 'Full Stack'] },
  { issuer: 'udemy', logo: ['DotNet', 's'], title: ['Web API', 'in .NET 8'] },
  { issuer: 'udemy', logo: ['php', 'php'], title: ['PHP', 'Full Stack'] },
  { issuer: 'udemy', logo: ['Angular', 'v'], title: ['Angular', 'Complete Guide'] },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PHP = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="60" fill="#777BB4"/><text x="128" y="158" font-family="Verdana, sans-serif" font-size="92" font-weight="700" font-style="italic" text-anchor="middle" fill="#fff">php</text></svg>`;
const hex = (cx, cy, r) =>
  [0, 1, 2, 3, 4, 5].map((k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');

export function renderCerts({ theme, dir, certs = CERTS }) {
  const t = THEMES[theme];
  const top = 46;
  const H = top + ROW * 2;
  let body = '';
  let defs = '';
  let slot = 0;
  certs.forEach((c, i) => {
    const wide = Boolean(c.count);
    const x = (slot % 4) * COL;
    const y = top + Math.floor(slot / 4) * ROW;
    slot += wide ? 2 : 1;
    const [color, issuer] = ISSUER[c.issuer];
    const cx = wide ? x + 100 : x + COL / 2;
    const cy = y + 78;
    const logo = c.logo[1] === 'php' ? PHP : tileSvg(dir, c.logo, theme);
    defs += `<clipPath id="h${i}"><polygon points="${hex(cx, cy, 62)}"/></clipPath>`;
    let b = `<polygon points="${hex(cx, cy, 70)}" fill="${color}"/><polygon points="${hex(cx, cy, 62)}" fill="${t.paper}"/><polygon points="${hex(cx, cy, 56)}" fill="none" stroke="${color}" stroke-opacity=".35" stroke-width="2"/>`;
    b += `<image href="data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}" x="${cx - 30}" y="${cy - 38}" width="60" height="60"/>`;
    b += `<g clip-path="url(#h${i})"><rect class="sh" style="animation-delay:${(1.2 + i * 0.6).toFixed(1)}s" x="${cx - 120}" y="${cy - 70}" width="40" height="140" fill="#fff" fill-opacity=".45" transform="skewX(-20)"/></g>`;
    const rw = issuer.length * 8.4 + 24;
    b += `<path d="M${cx - rw / 2 - 8} ${cy + 34}h${rw + 16}l-6 11 6 11h${-(rw + 16)}l6 -11z" fill="${color}"/>`;
    b += `<text x="${cx}" y="${cy + 50}" font-family='${MONO}' font-size="13" font-weight="700" letter-spacing="1" text-anchor="middle" fill="#fff">${esc(issuer)}</text>`;
    if (wide) {
      const tx = x + 200;
      b += `<text x="${tx}" y="${y + 92}" font-family='${SANS}' font-size="84" font-weight="800" letter-spacing="-3" fill="${t.accent}">${esc(c.count)}</text>`;
      b += `<text x="${tx + c.count.length * 50 + 8}" y="${y + 92}" font-family='${MONO}' font-size="15" letter-spacing="1" fill="${t.muted}">CERTIFICATES</text>`;
      b += `<text x="${tx}" y="${y + 136}" font-family='${SANS}' font-size="24" font-weight="700" fill="${t.ink}">${esc(c.title[0])}</text>`;
      b += `<text x="${tx}" y="${y + 162}" font-family='${MONO}' font-size="15" fill="${t.muted}">${esc(c.sub)}</text>`;
    } else {
      c.title.forEach((l, k) => {
        b += `<text x="${cx}" y="${y + 182 + k * 24}" font-family='${SANS}' font-size="${k ? 17 : 19}" font-weight="${k ? 400 : 700}" text-anchor="middle" fill="${k ? t.muted : t.ink}">${esc(l)}</text>`;
      });
    }
    body += `<g class="b" style="animation-delay:${i * 90}ms">${b}</g>`;
  });

  const label = `Certifications: ${certs.map((c) => `${c.count ? `${c.count} ` : ''}${c.title.join(' ')} (${ISSUER[c.issuer][1].toLowerCase()})`).join(', ')}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(label)}">
<defs>${defs}</defs>
<style>
.sh{opacity:0}
@media (prefers-reduced-motion: no-preference){
  .b{animation:pop .45s cubic-bezier(.34,1.56,.64,1) both;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}
  .sh{animation:sh 6s ease-in-out infinite}
  @keyframes sh{0%{opacity:1;transform:translateX(0) skewX(-20deg)}18%{opacity:1;transform:translateX(260px) skewX(-20deg)}19%,100%{opacity:0;transform:translateX(260px) skewX(-20deg)}}
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
