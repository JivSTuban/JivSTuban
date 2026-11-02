// Route divider and contact chips. Motion lives in CSS inside the SVG (no JS runs in a
// GitHub README) and is wrapped in prefers-reduced-motion: no-preference, so the resting state is the
// reduced-motion state.
import { readFileSync } from 'node:fs';
import { THEMES, SANS, MONO } from './card.mjs';

const ease = 'cubic-bezier(.23,1,.32,1)';

/** A dimension line with a ferry that sails across it. Used between sections. */
export function renderRoute(theme) {
  const t = THEMES[theme];
  const W = 888;
  const H = 52;
  const ferry =
    `<path d="M0 14 L46 14 L39 24 L7 24 Z" fill="${t.paper}" stroke="${t.ink}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<rect x="10" y="5" width="22" height="9" fill="${t.paper}" stroke="${t.ink}" stroke-width="1.5"/>` +
    `<rect x="20" y="-2" width="6" height="7" fill="${t.accent}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="">
<style>
.sail{transform:translate(120px,0)}
@media (prefers-reduced-motion: no-preference){
  .sail{animation:sail 22s linear infinite}
  .bob{animation:bob 2.6s ease-in-out infinite alternate}
  @keyframes sail{from{transform:translate(-60px,0)}to{transform:translate(${W + 10}px,0)}}
  @keyframes bob{from{transform:translateY(-1.2px)}to{transform:translateY(1.2px)}}
}
</style>
<line x1="8" y1="40" x2="${W - 8}" y2="40" stroke="${t.ink}" stroke-width="1"/>
<line x1="8" y1="33" x2="8" y2="47" stroke="${t.ink}" stroke-width="1.5"/>
<line x1="${W - 8}" y1="33" x2="${W - 8}" y2="47" stroke="${t.ink}" stroke-width="1.5"/>
<g class="sail"><g transform="translate(0 16)"><g class="bob">${ferry}</g></g></g>
</svg>
`;
}

const ICON_DOC = (c) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="60" fill="${c.tile}"/><path d="M80 48h66l42 42v118a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8z" fill="none" stroke="${c.ink}" stroke-width="12" stroke-linejoin="round"/><path d="M146 48v42h42" fill="none" stroke="${c.ink}" stroke-width="12" stroke-linejoin="round"/><path d="M96 130h64M96 158h64M96 186h40" stroke="#c2410c" stroke-width="12" stroke-linecap="round"/></svg>`;

/** Contact chip: a bordered cell with a tile icon and a label, one SVG per link and theme. */
export function renderChip({ theme, label, icon, dir }) {
  const t = THEMES[theme];
  const W = 160;
  const H = 48;
  const variant = theme === 'dark' ? 'Dark' : 'Light';
  const files = { LinkedIn: 'LinkedIn.svg', Email: `Gmail-${variant}.svg`, Portfolio: `Vercel-${variant}.svg` };
  const svg =
    icon === 'CV'
      ? ICON_DOC({ tile: theme === 'dark' ? '#242938' : '#F4F2ED', ink: t.ink })
      : readFileSync(`${dir}/${files[icon]}`, 'utf8');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
<style>
@media (prefers-reduced-motion: no-preference){ .a{animation:in .3s ${ease} both} @keyframes in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}} }
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<g class="a"><image href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" x="10" y="10" width="28" height="28"/>
<text x="48" y="30" font-family='${MONO}' font-size="16" letter-spacing="0.5" fill="${t.ink}">${label}</text></g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
