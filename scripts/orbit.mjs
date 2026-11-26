// Projects as a solar system: each project is a planet on a tilted orbit around the sun.
// After RepoVerse (github.com/nimaldanyathk/repo-verse, MIT), rebuilt so it works inside a README image:
// no external images, orbits fit the frame, planets start spread out, lit sides face the sun.
// Motion is CSS only. Each orbit is a circle squashed to an ellipse; the planet counter-rotates and
// un-squashes so it stays round. Without motion the planets rest at their start angles.
import { THEMES, MONO } from './card.mjs';

const W = 888;
const H = 420;
const GAP = 20;
const K = 0.4; // orbit tilt: vertical squash

export const PROJECTS = [
  { name: 'AutoApply', line: 'job application engine, 11 users', r: 15, color: ['#3a93bd', '#4a9cc4'] },
  { name: 'weewoo', line: 'end-to-end encrypted location sharing', r: 11, color: ['#d978ab', '#c76699'] },
  { name: 'Knowledge Base SDK', line: 'open-source RAG SDK powering Ayahay', r: 13, color: ['#4f9a46', '#76ad57'] },
  { name: 'Austin McClain', line: '119+ listings worth $13.5M', r: 12, color: ['#8e897b', '#a59e8c'] },
  { name: "Keilah's Cakes", line: 'bakery storefront, 95+ Lighthouse', r: 9, color: ['#eaa7c8', '#f09cc6'] },
  { name: 'OJTech', line: 'internship matching with NLP', r: 10, color: ['#7cc2dc', '#8fd0ea'] },
  { name: 'Navigram', line: 'social memories on a map', r: 11, color: ['#93c56a', '#b4dc84'] },
  { name: 'GAssure', line: '1st of 196 teams, GCash ImaGnation 2025', r: 13, color: ['#d9a441', '#e8b54f'], ring: true },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function mix(hex, to, amount) {
  const a = hex.match(/\w\w/g).map((h) => parseInt(h, 16));
  const b = to.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0')).join('')}`;
}

export function renderOrbit({ theme, projects = PROJECTS }) {
  const t = THEMES[theme];
  const dark = theme === 'dark';
  const cx = W / 2;
  const cy = 190;
  const sun = 38;
  const slot = 4; // seconds each project spends in the readout
  const cycle = projects.length * slot;

  // Stars: fixed pseudo-random field so builds are reproducible.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let stars = '';
  for (let i = 0; i < 46; i++) {
    const x = (rnd() * (W - 20) + 10).toFixed(1);
    const y = (rnd() * (H - 20) + 10).toFixed(1);
    const r = (0.5 + rnd() * 0.9).toFixed(2);
    stars += `<circle class="${i % 3 ? '' : 'tw'}" style="animation-delay:${(rnd() * 4).toFixed(2)}s" cx="${x}" cy="${y}" r="${r}" fill="${t.muted}" opacity=".55"/>`;
  }

  let defs = '';
  let orbits = '';
  let planets = '';
  let css = '';
  let readout = '';
  projects.forEach((p, i) => {
    const rx = 140 + i * 38;
    const period = (26 * Math.pow(rx / 140, 1.5)).toFixed(1);
    const phase = (i * 137.5 + 20) % 360; // golden angle keeps neighbours apart
    const base = p.color[dark ? 1 : 0];
    defs += `<radialGradient id="g${i}" cx="50%" cy="50%" r="60%" fx="18%" fy="50%"><stop offset="0" stop-color="${mix(base, '#ffffff', 0.45)}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${mix(base, '#000000', dark ? 0.7 : 0.45)}"/></radialGradient>`;
    orbits += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx * K).toFixed(1)}" fill="none" stroke="${t.muted}" stroke-width="1" opacity="${dark ? 0.35 : 0.45}"/>`;

    const a = (i / projects.length) * 100;
    const b = ((i + 1) / projects.length) * 100;
    const on = i === 0 ? `0%{opacity:1}${b.toFixed(3)}%{opacity:0}` : `0%{opacity:0}${a.toFixed(3)}%{opacity:1}${b.toFixed(3)}%{opacity:0}`;
    css += `@keyframes on${i}{${on}100%{opacity:${i === 0 ? 1 : 0}}}.on${i}{animation:on${i} ${cycle}s step-end infinite}\n  `;
    css += `.o${i}{animation:spin ${period}s linear infinite}.c${i}{animation:spin ${period}s linear infinite reverse}.d${i}{animation:depth ${period}s ease-in-out ${(-(phase / 360) * period).toFixed(2)}s infinite}\n  `;

    const ring = p.ring
      ? `<ellipse rx="${p.r * 1.9}" ry="${p.r * 0.5}" fill="none" stroke="${mix(base, dark ? '#ffffff' : '#000000', 0.25)}" stroke-width="2" transform="rotate(-18)"/>`
      : '';
    const halo = `<circle class="hl on${i}" r="${p.r + 7}" fill="none" stroke="${t.accent}" stroke-width="1.5" stroke-dasharray="3 3"${i === 0 ? '' : ' opacity="0"'}/>`;
    planets += `<g transform="scale(1 ${K})"><g transform="rotate(${phase.toFixed(1)})"><g class="o${i}"><g transform="translate(${rx} 0)"><g class="c${i}"><g transform="rotate(${(-phase).toFixed(1)}) scale(1 ${(1 / K).toFixed(4)})"><g class="d${i}">${halo}<g transform="rotate(${phase.toFixed(1)})"><g class="o${i}"><circle r="${p.r}" fill="url(#g${i})"/></g></g>${ring}</g></g></g></g></g></g></g>`;

    readout += `<g class="on${i}"${i === 0 ? '' : ' opacity="0"'}><text x="24" y="${H - 40}" font-family='${MONO}' font-size="16" font-weight="700" fill="${t.accent}">&gt; ${esc(p.name)}</text><text x="24" y="${H - 17}" font-family='${MONO}' font-size="14" fill="${t.muted}">${esc(p.line)}</text></g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="Projects: ${esc(projects.map((p) => p.name).join(', '))}">
<defs>
<radialGradient id="sun" cx="50%" cy="50%" r="50%" fx="38%" fy="36%"><stop offset="0" stop-color="${mix(t.accent, '#ffffff', 0.75)}"/><stop offset=".45" stop-color="${mix(t.accent, '#ffd27a', 0.35)}"/><stop offset="1" stop-color="${t.accent}"/></radialGradient>
<radialGradient id="glow"><stop offset=".55" stop-color="${t.accent}" stop-opacity=".35"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
${defs}
</defs>
<style>
@media (prefers-reduced-motion: no-preference){
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes depth{0%,50%,100%{transform:scale(1)}25%{transform:scale(1.14)}75%{transform:scale(.82)}}
  @keyframes tw{0%,100%{opacity:.55}50%{opacity:.1}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
  .tw{animation:tw 4s ease-in-out infinite}
  .glow{animation:pulse 5s ease-in-out infinite}
  ${css}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${stars}
${orbits}
<g transform="translate(${cx} ${cy})">${planets}</g>
<g transform="translate(${cx} ${cy})"><g class="glow"><circle r="${sun + 22}" fill="url(#glow)"/></g></g>
<circle cx="${cx}" cy="${cy}" r="${sun}" fill="url(#sun)"/>
${readout}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
