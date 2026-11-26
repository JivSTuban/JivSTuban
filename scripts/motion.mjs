// Contact chips. Motion lives in CSS inside the SVG (no JS runs in a
// GitHub README) and is wrapped in prefers-reduced-motion: no-preference, so the resting state is the
// reduced-motion state.
import { readFileSync } from 'node:fs';
import { THEMES, SANS, MONO } from './card.mjs';

const ease = 'cubic-bezier(.23,1,.32,1)';

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
