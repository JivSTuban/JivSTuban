// The terminal pieces at the top of the README: a prompt that types true lines, and a neofetch-style readout.
// Motion is CSS inside the SVG, wrapped in prefers-reduced-motion: no-preference; the resting state shows
// the first line fully typed and every readout row in place.
// The portraits in assets/portrait are the GitHub avatar, cut out with macOS Vision person segmentation,
// scaled to 52x26 with ffmpeg and mapped to ' .:-=+*#%@' (light: dark pixels dense; dark: bright pixels dense).
import { THEMES, MONO } from './card.mjs';

const W = 888;
const GAP = 20; // space under each image; GitHub ignores <br> after a <picture>
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Years and months between an ISO timestamp and a YYYY-MM-DD date, e.g. "2 years, 8 months". */
export function uptime(createdAt, today) {
  const a = new Date(createdAt);
  const b = new Date(`${today}T23:59:59Z`);
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const part = (n, s) => `${n} ${s}${n === 1 ? '' : 's'}`;
  return [y && part(y, 'year'), m && part(m, 'month')].filter(Boolean).join(', ') || 'new';
}

/**
 * The prompt types each line at a human pace (uneven keystrokes, a beat after commas), holds it,
 * deletes it with a held backspace and moves to the next. A paper-coloured cover with the caret on its
 * edge slides right one character at a time, so every step is a whole character.
 */
export function renderTyping({ theme, lines }) {
  const t = THEMES[theme];
  const H = 64;
  const size = 22;
  const cw = 13.2; // 0.6em; textLength pins every font to this pitch
  const x0 = 24;
  const prompt = 'jiv@cebu ~ %';
  const tx = x0 + (prompt.length + 1) * cw;
  const base = 42;

  // [ms, characters shown] steps for the whole cycle
  const steps = [];
  const spans = [];
  let ms = 0;
  lines.forEach((line, p) => {
    const start = ms;
    steps.push([ms, 0]);
    ms += 350;
    [...line].forEach((ch, i) => {
      ms += 48 + ((i * 37 + p * 11) % 7) * 11 + (/[,.]/.test(line[i - 1] ?? '') ? 260 : 0) + (line[i - 1] === ' ' ? 30 : 0);
      steps.push([ms, i + 1]);
    });
    ms += 2600;
    for (let k = line.length - 1; k >= 0; k--) {
      ms += 22;
      steps.push([ms, k]);
    }
    ms += 250;
    spans.push([start, ms]);
  });
  const total = ms;
  const pct = (v) => `${((v / total) * 100).toFixed(3)}%`;
  const at = (k) => `transform:translateX(${(tx + k * cw).toFixed(1)}px)`;

  const type = steps.map(([v, k]) => `${pct(v)}{${at(k)}}`).join('') + `100%{${at(0)}}`;
  const shows = spans
    .map(([a, b], p) => `@keyframes p${p}{0%{opacity:${p === 0 ? 1 : 0}}${pct(a)}{opacity:1}${pct(b)}{opacity:0}100%{opacity:${p === 0 ? 1 : 0}}}.p${p}{animation:p${p} ${total}ms step-end infinite}`)
    .join('\n  ');

  const text = (x, s, fill, cls = '') =>
    `<text${cls ? ` class="${cls}"` : ''} x="${x}" y="${base}" font-family='${MONO}' font-size="${size}" textLength="${(s.length * cw).toFixed(1)}" fill="${fill}">${esc(s)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(lines.join('. '))}">
<style>
.p0{opacity:1}${lines.map((_, p) => (p ? ` .p${p}{opacity:0}` : '')).join('')}
.cover{${at(lines[0].length)}}
@media (prefers-reduced-motion: no-preference){
  .cover{animation:type ${total}ms step-end infinite}
  .caret{animation:blink 1.06s step-end infinite}
  @keyframes type{${type}}
  @keyframes blink{0%{opacity:1}50%{opacity:0}}
  ${shows}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${text(x0, 'jiv@cebu', t.accent)}${text(x0 + 9 * cw, '~ %', t.muted)}
${lines.map((l, p) => text(tx, l, t.ink, `p${p}`)).join('\n')}
<g class="cover"><rect width="${W}" height="${H}" fill="${t.paper}"/><rect class="caret" x="0" y="${base - 18}" width="${cw - 1}" height="23" fill="${t.ink}" opacity=".75"/></g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}

/**
 * neofetch: the ASCII portrait on the left, key/value rows on the right, a palette strip under them.
 * rows: [key, value, accent?]. Rows and portrait lines boot in top to bottom.
 */
export function renderFetch({ theme, art, rows }) {
  const t = THEMES[theme];
  const lines = art.replace(/\n+$/, '').split('\n');
  const artSize = 11;
  const artPitch = 6.6;
  const artLead = 12.4;
  const ax = 28;
  const ix = 418;
  const size = 16;
  const cw = 9.6;
  const lead = 27;
  const keyCols = 10;
  const top = 46;
  const infoH = (rows.length + 3) * lead;
  const H = Math.max(Math.round(lines.length * artLead + 56), infoH + top);
  const ay = Math.round((H - lines.length * artLead) / 2 + artLead * 0.8);

  const artSvg = lines
    .map((l, i) => {
      const lead0 = l.length - l.trimStart().length;
      const s = l.trimStart();
      if (!s) return '';
      return `<text class="b" style="animation-delay:${i * 28}ms" x="${(ax + lead0 * artPitch).toFixed(1)}" y="${(ay + i * artLead).toFixed(1)}" font-family='${MONO}' font-size="${artSize}" textLength="${(s.length * artPitch).toFixed(1)}" fill="${t.ink}" xml:space="preserve">${esc(s)}</text>`;
    })
    .join('');

  const txt = (x, y, s, fill, extra = '') =>
    `<text x="${x}" y="${y}" font-family='${MONO}' font-size="${size}" textLength="${(s.length * cw).toFixed(1)}" fill="${fill}"${extra}>${esc(s)}</text>`;
  const row = (i, inner) => `<g class="b" style="animation-delay:${200 + i * 70}ms">${inner}</g>`;

  const head = row(0, txt(ix, top, 'jiv', t.ink, ' font-weight="700"') + txt(ix + 3 * cw, top, '@', t.accent, ' font-weight="700"') + txt(ix + 4 * cw, top, 'cebu', t.ink, ' font-weight="700"'));
  const rule = row(1, `<line x1="${ix}" y1="${top + 12}" x2="${ix + 8 * cw}" y2="${top + 12}" stroke="${t.muted}" stroke-width="1.5"/>`);
  const body = rows
    .map(([k, v, hot], i) => row(i + 2, txt(ix, top + (i + 1) * lead + 8, k, t.muted) + txt(ix + keyCols * cw, top + (i + 1) * lead + 8, v, hot ? t.accent : t.ink)))
    .join('\n');
  const swatches = [...t.levels.slice(1), t.accent, ...(theme === 'dark' ? ['#c76699', '#76ad57', '#4a9cc4'] : ['#d978ab', '#4f9a46', '#3a93bd'])];
  const sy = top + (rows.length + 1) * lead + 4;
  const palette = row(rows.length + 2, swatches.map((c, i) => `<rect x="${ix + i * 30}" y="${sy}" width="26" height="16" fill="${c}"/>`).join(''));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(rows.map(([k, v]) => `${k} ${v}`).join('. '))}">
<style>
@media (prefers-reduced-motion: no-preference){
  .b{animation:boot .32s cubic-bezier(.23,1,.32,1) both}
  @keyframes boot{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${artSvg}
${head}
${rule}
${body}
${palette}
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
