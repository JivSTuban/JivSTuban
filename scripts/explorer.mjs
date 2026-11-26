// Projects as a Windows 95 Explorer window, after the "classic" theme of github.com/wmrDev/github-profile-readme-generator:
// a teal desktop, one window with the project list on the right and a Windows 98-style info pane on the left. A cursor
// steps down the list every 2 seconds; the selected row turns navy and the pane shows that project.
// Motion is CSS behind prefers-reduced-motion: no-preference; at rest the first project is selected.
// The palette is the Windows one in both themes, so light and dark get the same picture.
import { MONO } from './card.mjs';

const W = 888;
const H = 600;
const GAP = 20;
const STEP = 2; // seconds per project
const UI = 'Tahoma, Verdana, "Segoe UI", sans-serif';
const C = { desk: '#008080', face: '#c0c0c0', hi: '#ffffff', shadow: '#808080', dark: '#404040', navy: '#000080', blue: '#1084d0', ink: '#000000' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (x, y, s, { size = 16, fill = C.ink, font = UI, weight = 400, anchor = 'start', ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family='${font}' font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${ls}" fill="${fill}">${esc(s)}</text>`;
// raised (up) or sunken bevel
const bevel = (x, y, w, h, up = true) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.face}"/><path d="M${x + 1} ${y + h - 1}V${y + 1}H${x + w - 1}" fill="none" stroke="${up ? C.hi : C.shadow}" stroke-width="2"/><path d="M${x + w - 1} ${y + 1}V${y + h - 1}H${x + 1}" fill="none" stroke="${up ? C.dark : C.hi}" stroke-width="2"/>`;
const folder = (x, y) => `<path d="M${x} ${y + 4}h11l4 5h17v19h-32z" fill="#f7d14a" stroke="#806000" stroke-width="1.5"/><path d="M${x} ${y + 12}h32" stroke="#fff4b0" stroke-width="1.5"/>`;

/** projects: [{ slug, name[], eyebrow, head[], figs[[v, l]], color[dark, light] }]; clock: text for the taskbar. */
export function renderExplorer({ projects, clock }) {
  const n = projects.length;
  const loop = n * STEP;
  const px = 24, pw = 282; // info pane
  const lx = px + pw + 2, lw = 864 - lx; // list
  const rowY = 118, rowH = 52;

  // one class per project, visible during its 2 seconds of the loop
  const css = projects
    .map((_, i) => `.s${i}{animation:sel ${loop}s step-end ${i ? -(loop - i * STEP) : 0}s infinite}`)
    .join('');
  const rest = projects.map((_, i) => `.s${i}{opacity:${i ? 0 : 1}}`).join('');
  const cursorFrames = projects.map((_, i) => `${((i / n) * 100).toFixed(3)}%{transform:translateY(${i * rowH}px)}`).join('');

  let list = bevel(lx, 86, 254, 28) + bevel(lx + 254, 86, lw - 254, 28) + T(lx + 10, 106, 'Name', { size: 15 }) + T(lx + 264, 106, 'Stats', { size: 15 });
  let pane = '';
  projects.forEach((p, i) => {
    const y = rowY + i * rowH;
    const name = p.name.join(' ');
    const stats = p.figs.map(([v, l]) => `${v} ${l}`).join(', ');
    const statSize = stats.length > 28 ? 13 : 14;
    const row = (fill) => folder(lx + 10, y + 9) + T(lx + 52, y + 33, name, { size: 19, fill }) + T(lx + 264, y + 32, stats, { size: statSize, font: MONO, fill });
    list += row(C.ink);
    list += `<g class="s${i}"><rect x="${lx + 2}" y="${y + 3}" width="${lw - 4}" height="${rowH - 6}" fill="${C.navy}"/>${row('#fff')}<rect x="${lx + 3}" y="${y + 4}" width="${lw - 6}" height="${rowH - 8}" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 2"/></g>`;

    // info pane for this project: a banner in its colours, the name, the stack, what it does, the figures
    const [a, b] = p.color;
    const nameSize = Math.min(30, Math.floor((pw - 28) / (name.length * 0.56)));
    pane += `<g class="s${i}"><defs><linearGradient id="b${i}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect x="${px + 12}" y="96" width="${pw - 24}" height="92" fill="url(#b${i})"/>${[1, 2, 3].map((k) => `<circle cx="${px + pw - 60}" cy="126" r="${k * 16}" fill="none" stroke="#fff" stroke-opacity="${0.4 - k * 0.1}" stroke-width="2"/>`).join('')}${folder(px + 24, 146)}
${T(px + 14, 228, name, { size: nameSize, weight: 700 })}
${T(px + 14, 252, p.eyebrow, { size: 12, font: MONO, fill: C.shadow, ls: 0.5 })}
<line x1="${px + 14}" y1="266" x2="${px + pw - 14}" y2="266" stroke="${C.face}" stroke-width="2"/>
${p.head.map((l, k) => T(px + 14, 294 + k * 24, l, { size: 17 })).join('')}
${p.figs.map(([v, l], k) => T(px + 14, 404 + k * 52, v, { size: 30, weight: 700, fill: C.navy }) + T(px + 14, 424 + k * 52, l, { size: 14, font: MONO, fill: C.shadow })).join('')}</g>`;
  });

  const cursor = `<g class="cur" style="transform:translateY(0)"><path transform="translate(${lx + 236} ${rowY + 18})" d="M0 0V22L6 16L10 25L14 23L10 15H18Z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></g>`;
  const flag = [['#f25022', 0, 0], ['#7fba00', 9, 0], ['#00a4ef', 0, 9], ['#ffb900', 9, 9]].map(([c, dx, dy]) => `<rect x="${16 + dx}" y="${H - 30 + dy}" width="8" height="8" fill="${c}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="Projects: ${esc(projects.map((p) => `${p.name.join(' ')} (${p.figs.map(([v, l]) => `${v} ${l}`).join(', ')})`).join('; '))}">
<style>
${rest}
@media (prefers-reduced-motion: no-preference){
  @keyframes sel{0%{opacity:1}${((1 / n) * 100).toFixed(3)}%{opacity:0}100%{opacity:0}}
  ${css}
  @keyframes cur{${cursorFrames}100%{transform:translateY(0)}}
  .cur{animation:cur ${loop}s step-end infinite}
}
</style>
<rect width="${W}" height="${H}" fill="${C.desk}"/>
${bevel(16, 14, 856, 530)}
<defs><linearGradient id="tb" x1="0" x2="1"><stop offset="0" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient></defs>
<rect x="21" y="19" width="846" height="30" fill="url(#tb)"/>${folder(28, 21)}
${T(68, 41, 'C:\\Jiv\\Projects', { size: 18, weight: 700, fill: '#fff' })}
${['_', '□', '×'].map((c, i) => bevel(784 + i * 26, 24, 22, 20) + T(795 + i * 26, 40, c, { size: 14, weight: 700, anchor: 'middle' })).join('')}
${['File', 'Edit', 'View', 'Help'].map((m, i) => T(30 + i * 60, 72, m, { size: 16 })).join('')}
<rect x="22" y="84" width="844" height="452" fill="#fff"/><path d="M23 535V85H865" fill="none" stroke="${C.shadow}" stroke-width="2"/><path d="M865 85V535H23" fill="none" stroke="${C.hi}" stroke-width="2"/>
<line x1="${px + pw + 1}" y1="86" x2="${px + pw + 1}" y2="534" stroke="${C.face}" stroke-width="2"/>
${pane}
${list}
${cursor}
${bevel(0, H - 40, W, 40)}${bevel(6, H - 35, 104, 30)}${flag}${T(64, H - 14, 'Start', { size: 17, weight: 700, anchor: 'middle' })}
${bevel(116, H - 35, 190, 30, false)}${folder(124, H - 33)}${T(162, H - 14, 'Projects', { size: 15, weight: 700 })}
${bevel(W - 120, H - 35, 114, 30, false)}${T(W - 63, H - 14, clock, { size: 15, anchor: 'middle' })}
</svg>
`;
}
