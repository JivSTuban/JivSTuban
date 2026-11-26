// One card per job and per project, after Chan Meng's project cards (chanmeng.org/blog/animated-svg-project-cards):
// the left panel says who and what with a few figures, the right panel is a small window where the work plays out.
// Scenes are illustrations of the product, drawn in vectors; every figure on a card is a fact from the README.
// Motion is CSS keyframes on one loop per card, behind prefers-reduced-motion: no-preference. The resting state
// is the finished scene, so a still image (or reduced motion) shows the end of the story.
import { THEMES, SANS, MONO } from './card.mjs';

const W = 888;
const H = 400;
const GAP = 20;
const SX = 340; // stage window
const SY = 22;
const SW = W - SX - 22;
const SH = H - 44;
const IX = SX + 16; // stage content origin
const IY = SY + 50;
const L = 12; // loop seconds

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const EXTRA = {
  light: { card: '#fbf9f4', line: '#dcd7cb', green: '#4f9a46', blue: '#3a93bd', pink: '#d978ab' },
  dark: { card: '#1b1a17', line: '#3a372f', green: '#76ad57', blue: '#4a9cc4', pink: '#c76699' },
};

/** Keyframes builder: each call returns a class that plays `frames` ([second, declarations]) on the shared loop. */
function motion() {
  let css = '';
  let rest = '';
  let n = 0;
  const pct = (s) => `${((s / L) * 100).toFixed(2)}%`;
  const add = (frames, { timing = 'ease-out', base = '' } = {}) => {
    const id = `m${n++}`;
    css += `@keyframes ${id}{${frames.map(([s, d]) => `${pct(s)}{${d}}`).join('')}}.${id}{animation:${id} ${L}s ${timing} infinite}\n  `;
    if (base) rest += `.${id}{${base}}`;
    return id;
  };
  const end = L - 0.5;
  return {
    add,
    // fade in at s, stay to the end of the loop
    on: (s, until = end) =>
      add([[0, 'opacity:0;transform:translateY(6px)'], [s, 'opacity:0;transform:translateY(6px)'], [s + 0.35, 'opacity:1;transform:none'], [until, 'opacity:1;transform:none'], [Math.min(until + 0.3, L), 'opacity:0'], [L, 'opacity:0']]),
    // visible only between a and b (used for "before" states; hidden at rest)
    between: (a, b) =>
      add(
        a === 0
          ? [[0, 'opacity:1'], [b, 'opacity:1'], [b + 0.3, 'opacity:0'], [L - 0.3, 'opacity:0'], [L, 'opacity:1']]
          : [[0, 'opacity:0'], [a, 'opacity:0'], [a + 0.2, 'opacity:1'], [b, 'opacity:1'], [b + 0.3, 'opacity:0'], [L, 'opacity:0']],
        { base: 'opacity:0' },
      ),
    // horizontal grow from `from` to 1 (or shrink to `to`) between a and b, origin at the left edge
    scaleX: (a, b, from, to) =>
      add([[0, `transform:scaleX(${from})`], [a, `transform:scaleX(${from})`], [b, `transform:scaleX(${to})`], [end, `transform:scaleX(${to})`], [L, `transform:scaleX(${from})`]], { timing: 'ease-in-out', base: `transform:scaleX(${to})` }),
    move: (a, b, dx, dy) =>
      add([[0, 'transform:translate(0,0)'], [a, 'transform:translate(0,0)'], [b, `transform:translate(${dx}px,${dy}px)`], [end, `transform:translate(${dx}px,${dy}px)`], [L, 'transform:translate(0,0)']], { timing: 'ease-in-out', base: `transform:translate(${dx}px,${dy}px)` }),
    // a cover in the window colour, anchored at the text's right end, that shrinks one character at a time
    type: (a, b, chars) =>
      add([[0, 'transform:scaleX(1)'], [a, `transform:scaleX(1);animation-timing-function:steps(${Math.max(1, chars)},end)`], [b, 'transform:scaleX(0)'], [end, 'transform:scaleX(0)'], [L, 'transform:scaleX(1)']], { timing: 'linear', base: 'transform:scaleX(0)' }),
    css: () => css,
    rest: () => rest,
  };
}

/** Drawing helpers bound to a theme and a motion builder. Coordinates are stage-local. */
function kit(t, m) {
  const font = (mono) => (mono ? MONO : SANS);
  const text = (x, y, s, { size = 14, fill = t.ink, mono = false, weight = 400, anchor = 'start', cls = '' } = {}) =>
    `<text${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" font-family='${font(mono)}' font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}"${mono ? ` textLength="${(s.length * size * 0.6).toFixed(1)}"` : ''}>${esc(s)}</text>`;
  const box = (x, y, w, h, { fill = 'none', stroke = t.line, r = 6, sw = 1.5, cls = '' } = {}) =>
    `<rect${cls ? ` class="${cls}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const g = (cls, inner) => `<g class="${cls}">${inner}</g>`;
  // typed mono text: the text plus a cover in the window colour
  const typed = (x, y, s, a, b, { size = 14, fill = t.ink, bg = t.card } = {}) => {
    const w = s.length * size * 0.6;
    return text(x, y, s, { size, fill, mono: true }) + `<rect class="${m.type(a, b, s.length)}" style="transform-box:fill-box;transform-origin:100% 50%" x="${x - 1}" y="${y - size}" width="${w + 2}" height="${size + 6}" fill="${bg}"/>`;
  };
  const bar = (x, y, w, h, fill, cls = '', r = 3) => `<rect${cls ? ` class="${cls}"` : ''} style="transform-box:fill-box;transform-origin:0 50%" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const lines = (x, y, widths, { gap = 14, h = 7, fill = t.line } = {}) => widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="3" fill="${fill}"/>`).join('');
  const chip = (x, y, s, { fill = t.paper, stroke = t.line, color = t.ink, size = 12, cls = '' } = {}) => {
    const w = s.length * size * 0.6 + 16;
    return `<g${cls ? ` class="${cls}"` : ''}>${box(x, y, w, size + 12, { fill, stroke, r: (size + 12) / 2, sw: 1.2 })}${text(x + 8, y + size + 3, s, { size, mono: true, fill: color })}</g>`;
  };
  const check = (x, y, c = t.accent, s = 1) => `<path d="M${x} ${y + 5 * s} l${4 * s} ${4 * s} l${8 * s} -${9 * s}" fill="none" stroke="${c}" stroke-width="${2 * s}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return { text, box, g, typed, bar, lines, chip, check };
}

// Each scene returns stage-local SVG for a 492 x 300 area. `t` has the theme plus EXTRA, `k` the helpers, `m` motion.
const SCENES = {
  traciety(t, k, m) {
    const names = ['Webhook', 'Enrich', 'OpenAI', 'Sheets'];
    let s = '';
    names.forEach((n, i) => {
      const x = i * 128;
      s += k.box(x, 6, 104, 46, { fill: t.paper, stroke: t.ink, r: 8 });
      s += `<circle cx="${x + 16}" cy="29" r="6" fill="${[t.pink, t.blue, t.green, t.accent][i]}"/>`;
      s += k.text(x + 28, 34, n, { size: 14, weight: 600 });
      s += k.box(x, 6, 104, 46, { stroke: t.accent, r: 8, sw: 2.5, cls: m.add([[0, 'opacity:0'], [0.6 + i * 0.7, 'opacity:0'], [0.8 + i * 0.7, 'opacity:1'], [1.6 + i * 0.7, 'opacity:0'], [L, 'opacity:0']], { base: 'opacity:0' }) });
      if (i < 3) s += `<line x1="${x + 104}" y1="29" x2="${x + 128}" y2="29" stroke="${t.ink}" stroke-width="1.5"/>`;
    });
    s += k.g(m.add([[0, 'transform:translateX(0);opacity:0'], [0.5, 'transform:translateX(0);opacity:1'], [2.9, 'transform:translateX(384px);opacity:1'], [3.1, 'transform:translateX(384px);opacity:0'], [L, 'opacity:0']], { timing: 'linear', base: 'opacity:0' }), `<circle cx="52" cy="62" r="4" fill="${t.accent}"/>`);
    s += k.text(0, 106, 'AUTOMATION SPEND', { size: 12, mono: true, fill: t.muted });
    s += k.box(0, 116, 492, 24, { fill: t.line, stroke: 'none', r: 4 });
    s += k.bar(0, 116, 492, 24, t.ink, m.scaleX(3.4, 5.4, 1, 0.02), 4);
    s += k.g(m.between(0, 3.6), k.text(12, 133, 'Make.com', { size: 13, mono: true, fill: t.paper }));
    s += k.g(m.on(5.4), k.text(24, 133, 'self-hosted n8n', { size: 13, mono: true }) + k.text(492, 133, '−98%', { size: 16, mono: true, weight: 700, fill: t.accent, anchor: 'end' }));
    s += k.text(0, 186, 'BOOKING ATTRIBUTION', { size: 12, mono: true, fill: t.muted });
    s += k.box(0, 196, 492, 24, { fill: t.line, stroke: 'none', r: 4 });
    s += k.bar(0, 196, 492, 24, t.green, m.scaleX(6.2, 8.4, 0.54, 0.97), 4);
    s += k.g(m.between(0, 6.6), k.text(482, 213, '54%', { size: 14, mono: true, weight: 700, fill: t.paper, anchor: 'end' }));
    s += k.g(m.on(8.2), k.text(470, 213, '97%', { size: 14, mono: true, weight: 700, fill: t.paper, anchor: 'end' }));
    s += k.text(0, 262, '45 clinics on automated stat sheets', { size: 14, fill: t.muted });
    return s;
  },

  ayahay(t, k, m) {
    let s = '';
    const q = 'Trips to Bohol tomorrow?';
    s += k.g(m.on(0.4), k.box(492 - 236, 0, 236, 38, { fill: t.ink, stroke: 'none', r: 14 }) + k.text(492 - 222, 24, q, { size: 14, fill: t.paper }));
    s += k.text(0, 70, 'RETRIEVE', { size: 12, mono: true, fill: t.muted });
    ['schedules.pdf', 'fares.md', 'routes.csv'].forEach((f, i) => {
      const x = 80 + i * 138;
      s += k.chip(x, 54, f, { size: 12 });
      s += k.g(m.add([[0, 'opacity:0'], [1.2 + i * 0.5, 'opacity:0'], [1.4 + i * 0.5, 'opacity:1'], [L - 0.5, 'opacity:1'], [L, 'opacity:0']], { base: 'opacity:1' }), k.box(x, 54, f.length * 7.2 + 16, 24, { stroke: t.accent, r: 12, sw: 2 }));
    });
    s += k.g(m.on(2.9), k.box(0, 98, 330, 104, { fill: t.paper, stroke: t.line, r: 14 }) + k.typed(16, 126, "Here are tomorrow's", 3.1, 4.3) + k.typed(16, 148, 'trips, with fares:', 4.3, 5.1) + k.g(m.on(5.2), k.lines(16, 164, [220, 180], { gap: 14, fill: t.line })));
    s += k.text(0, 244, 'P50 LATENCY', { size: 12, mono: true, fill: t.muted });
    s += k.box(110, 230, 382, 20, { fill: t.line, stroke: 'none', r: 4 });
    s += k.bar(110, 230, 382, 20, t.blue, m.scaleX(6.4, 8.2, 1, 0.6), 4);
    s += k.g(m.on(8.2), k.text(492, 282, '−40% latency · +57% recall', { size: 15, mono: true, weight: 700, fill: t.accent, anchor: 'end' }));
    return s;
  },

  crowdsnare(t, k, m) {
    let s = '';
    s += k.g(m.on(0.3), k.box(0, 0, 176, 92, { fill: t.paper, stroke: t.ink, r: 10 }) + `<circle cx="18" cy="22" r="5" fill="${t.accent}"/>` + k.text(30, 27, 'NEW LEAD', { size: 12, mono: true, fill: t.accent }) + k.text(14, 54, 'Used SUV inquiry', { size: 15, weight: 600 }) + k.text(14, 76, 'from a Facebook ad', { size: 13, fill: t.muted }));
    s += k.g(m.on(1.1), k.box(196, 0, 296, 58, { fill: t.ink, stroke: 'none', r: 14 }) + k.typed(212, 24, "Hi! It's still here.", 1.3, 2.4, { bg: t.ink, fill: t.paper }) + k.typed(212, 44, 'Want to see it Saturday?', 2.4, 3.6, { bg: t.ink, fill: t.paper }));
    s += k.g(m.on(4.4), k.box(292, 72, 200, 38, { fill: t.paper, stroke: t.line, r: 14 }) + k.text(308, 96, 'Yes, 10am works', { size: 14 }));
    s += k.text(0, 150, 'SATURDAY', { size: 12, mono: true, fill: t.muted });
    ['9:00', '10:00', '11:00', '12:00', '1:00', '2:00'].forEach((h, i) => {
      const x = i * 83;
      s += k.box(x, 160, 76, 54, { fill: t.paper, stroke: t.line, r: 6 }) + k.text(x + 10, 182, h, { size: 13, mono: true, fill: t.muted });
      if (h === '10:00') s += k.g(m.on(5.6), k.box(x, 160, 76, 54, { fill: t.accent, stroke: 'none', r: 6 }) + k.text(x + 10, 182, h, { size: 13, mono: true, fill: t.paper }) + k.text(x + 10, 204, 'booked', { size: 13, weight: 600, fill: t.paper }));
    });
    s += k.g(m.on(6.4), k.text(0, 262, 'Booked by the agent, no human in the loop', { size: 14, fill: t.muted }));
    return s;
  },

  cfai(t, k, m) {
    let s = '';
    s += k.text(0, 12, 'INBOX', { size: 12, mono: true, fill: t.muted });
    s += k.g(m.on(0.4), k.box(0, 22, 184, 50, { fill: t.paper, stroke: t.ink, r: 8 }) + `<circle cx="14" cy="38" r="4" fill="${t.accent}"/>` + k.text(24, 42, 'Class schedule?', { size: 13, weight: 600 }) + k.lines(24, 54, [120], { h: 6 }));
    [84, 140].forEach((y) => (s += k.box(0, y, 184, 48, { fill: t.paper, stroke: t.line, r: 8 }) + k.lines(14, y + 14, [130, 90], { h: 6, gap: 13 })));
    s += k.box(200, 22, 292, 170, { fill: t.paper, stroke: t.line, r: 8 });
    s += k.text(214, 44, 'DRAFT', { size: 12, mono: true, fill: t.muted });
    [[236, 1.2], [210, 1.7], [250, 2.2], [160, 2.7]].forEach(([w, a], i) => (s += k.bar(214, 58 + i * 16, w, 8, t.ink, m.scaleX(a, a + 0.5, 0, 1))));
    s += k.chip(214, 130, 'SOP 12', { cls: m.on(3.4) }) + k.chip(290, 130, 'SOP 31', { cls: m.on(3.7) });
    s += k.g(m.on(4.6), k.box(388, 156, 92, 26, { fill: t.accent, stroke: 'none', r: 13 }) + k.text(434, 174, 'Sent', { size: 13, weight: 700, fill: t.paper, anchor: 'middle' }));
    // Lighthouse gauge
    const cx = 440;
    const cy = 248;
    const r = 30;
    const c = 2 * Math.PI * r;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.line}" stroke-width="7"/>`;
    s += `<circle class="${m.add([[0, `stroke-dashoffset:${(c * 0.55).toFixed(1)}`], [6, `stroke-dashoffset:${(c * 0.55).toFixed(1)}`], [8, `stroke-dashoffset:${(c * 0.15).toFixed(1)}`], [L - 0.5, `stroke-dashoffset:${(c * 0.15).toFixed(1)}`], [L, `stroke-dashoffset:${(c * 0.55).toFixed(1)}`]], { timing: 'ease-in-out', base: `stroke-dashoffset:${(c * 0.15).toFixed(1)}` })}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.green}" stroke-width="7" stroke-dasharray="${c.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    s += k.g(m.between(0, 6.4), k.text(cx, cy + 6, '45', { size: 18, mono: true, weight: 700, anchor: 'middle' }));
    s += k.g(m.on(7.8), k.text(cx, cy + 6, '85', { size: 18, mono: true, weight: 700, anchor: 'middle' }));
    s += k.text(0, 244, '70% faster replies, grounded in 50+ SOPs', { size: 14, fill: t.muted });
    s += k.text(0, 266, 'Mobile Lighthouse', { size: 14, fill: t.muted });
    return s;
  },

  freckles(t, k, m) {
    let s = '';
    s += k.text(0, 12, 'TODAY', { size: 12, mono: true, fill: t.muted });
    ['Tee · Black · L', 'Hoodie · Sand · M', 'Tee · White · S', 'Tote · Natural', 'Tee · Navy · XL'].forEach((o, i) => {
      const y = 24 + i * 46;
      s += k.box(0, y, 280, 38, { fill: t.paper, stroke: t.line, r: 8 });
      s += k.text(12, y + 24, `#${10480 + i}`, { size: 13, mono: true, fill: t.muted }) + k.text(76, y + 24, o, { size: 14 });
      s += k.g(m.between(0, 1 + i * 1.1), k.chip(206, y + 7, 'queued', { size: 11 }));
      s += k.g(m.on(1.2 + i * 1.1), k.chip(206, y + 7, 'printed', { size: 11, fill: t.green, stroke: t.green, color: t.paper }));
    });
    // printer bed with a moving head
    s += k.box(304, 24, 188, 220, { fill: t.paper, stroke: t.ink, r: 10 });
    s += `<path d="M352 110 l22 -16 h44 l22 16 l-14 18 l-10 -6 v68 h-60 v-68 l-10 6 z" fill="none" stroke="${t.ink}" stroke-width="2" stroke-linejoin="round"/>`;
    s += k.bar(374, 134, 44, 30, t.accent, m.scaleX(0.6, 5.6, 0, 1), 2);
    s += `<line x1="316" y1="60" x2="480" y2="60" stroke="${t.ink}" stroke-width="2"/>`;
    s += k.g(m.add([[0, 'transform:translateX(0)'], [1.4, 'transform:translateX(110px)'], [2.8, 'transform:translateX(0)'], [4.2, 'transform:translateX(110px)'], [5.6, 'transform:translateX(0)'], [L, 'transform:translateX(0)']], { timing: 'ease-in-out' }), k.box(324, 50, 40, 20, { fill: t.ink, stroke: 'none', r: 4 }));
    s += k.text(398, 272, '500+ orders a day', { size: 14, weight: 600, anchor: 'middle' });
    return s;
  },

  autoapply(t, k, m) {
    let s = '';
    s += k.box(0, 0, 150, 190, { fill: t.paper, stroke: t.ink, r: 8 });
    s += k.text(14, 26, 'resume.pdf', { size: 13, mono: true, fill: t.muted }) + k.lines(14, 42, [110, 90, 120, 70, 100, 84, 112], { gap: 14 });
    s += k.text(14, 176, 'FIT', { size: 12, mono: true, fill: t.muted });
    s += k.box(44, 166, 92, 12, { fill: t.line, stroke: 'none', r: 4 }) + k.bar(44, 166, 92, 12, t.green, m.scaleX(0.4, 1.6, 0, 0.86), 4);
    const fields = [['Name', 'Ana Reyes'], ['Email', 'ana@mail.com'], ['Resume', 'resume.pdf'], ['Why us?', 'I ship automation...']];
    fields.forEach(([label, v], i) => {
      const y = i * 50;
      s += k.text(170, y + 12, label.toUpperCase(), { size: 11, mono: true, fill: t.muted });
      s += k.box(170, y + 18, 322, 26, { fill: t.paper, stroke: t.line, r: 5 });
      s += k.typed(180, y + 36, v, 1.8 + i * 1, 2.6 + i * 1, { size: 13, bg: t.paper });
    });
    s += k.box(170, 208, 322, 36, { fill: t.ink, stroke: 'none', r: 8 }) + k.text(331, 231, 'Submit', { size: 14, weight: 700, fill: t.paper, anchor: 'middle' });
    s += k.g(m.on(6.4), k.box(170, 208, 322, 36, { fill: t.accent, stroke: 'none', r: 8 }) + k.check(290, 216, t.paper) + k.text(312, 231, 'Submitted', { size: 14, weight: 700, fill: t.paper }));
    s += k.g(m.on(7.2), k.text(0, 232, 'via Playwright', { size: 13, mono: true, fill: t.muted }));
    return s;
  },

  weewoo(t, k, m) {
    let s = '';
    s += k.box(0, 0, 300, 250, { fill: t.paper, stroke: t.ink, r: 10 });
    for (let i = 1; i < 6; i++) s += `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="250" stroke="${t.line}" stroke-width="1"/><line x1="0" y1="${i * 42}" x2="300" y2="${i * 42}" stroke="${t.line}" stroke-width="1"/>`;
    s += `<path d="M60 200 C 110 160, 150 190, 190 120 S 250 70, 250 60" fill="none" stroke="${t.blue}" stroke-width="3" stroke-dasharray="6 6"/>`;
    s += `<circle cx="250" cy="60" r="9" fill="${t.pink}" stroke="${t.paper}" stroke-width="3"/>`;
    s += k.g(m.move(0.4, 5, 190, -140), `<circle cx="60" cy="200" r="9" fill="${t.blue}" stroke="${t.paper}" stroke-width="3"/>`);
    s += k.g(m.on(1.6), k.box(70, 214, 120, 26, { fill: t.ink, stroke: 'none', r: 13 }) + k.text(130, 232, 'on my way', { size: 13, fill: t.paper, anchor: 'middle' }));
    s += k.text(318, 14, 'SERVER SEES', { size: 12, mono: true, fill: t.muted });
    let seed = 2654435761;
    const hex = () => Array.from({ length: 12 }, () => '0123456789abcdef'[((seed = (seed * 1103515245 + 12345) % 2147483648) >> 16) % 16]).join('');
    for (let i = 0; i < 9; i++) s += k.g(m.on(0.6 + i * 0.5), k.text(318, 40 + i * 24, `${hex()}…`, { size: 13, mono: true, fill: t.muted }));
    s += `<g transform="translate(372 254)"><rect x="-14" y="-4" width="28" height="22" rx="4" fill="${t.ink}"/><path d="M-8 -4 v-6 a8 8 0 0 1 16 0 v6" fill="none" stroke="${t.ink}" stroke-width="3"/></g>`;
    s += k.text(396, 268, 'ciphertext only', { size: 13, fill: t.muted });
    return s;
  },

  kbsdk(t, k, m) {
    let s = '';
    s += k.box(0, 0, 492, 128, { fill: t.paper, stroke: t.ink, r: 8 });
    s += k.typed(14, 26, "await client.train({ agentId: 'support-bot',", 0.3, 1.6, { size: 13, bg: t.paper });
    s += k.typed(14, 46, '  files: [faq, policies] });', 1.6, 2.4, { size: 13, bg: t.paper });
    s += k.g(m.on(2.6), k.check(14, 60, t.green) + k.text(34, 72, 'trained · pgvector', { size: 13, mono: true, fill: t.green }));
    s += k.typed(14, 104, "client.streamQuery({ query: 'refunds?' })", 3.4, 4.8, { size: 13, bg: t.paper });
    s += k.box(150, 144, 342, 120, { fill: t.paper, stroke: t.line, r: 14 });
    s += `<circle cx="176" cy="170" r="10" fill="${t.blue}"/>`;
    s += k.text(194, 175, 'Support', { size: 14, weight: 600 });
    s += k.g(m.on(5), k.typed(166, 204, 'Refunds go back to your', 5.2, 6.4, { bg: t.paper }) + k.typed(166, 226, 'card within 5-7 days.', 6.4, 7.4, { bg: t.paper }));
    s += k.chip(166, 236, 'policies.md', { size: 11, cls: m.on(7.6) });
    s += k.text(0, 200, 'whitelabel', { size: 13, mono: true, fill: t.muted }) + k.text(0, 220, 'chat widget', { size: 13, mono: true, fill: t.muted });
    return s;
  },

  austin(t, k, m) {
    let s = '';
    s += k.g(m.on(0.2), k.chip(0, 0, 'MLS sync', { size: 12, stroke: t.ink }));
    s += k.g(m.on(4.6), k.check(98, 6, t.green) + k.text(116, 18, '119+ listings', { size: 13, mono: true, fill: t.green }));
    for (let i = 0; i < 6; i++) {
      const x = (i % 3) * 166;
      const y = 40 + Math.floor(i / 3) * 112;
      const house = `<path d="M${x + 58} ${y + 50} l22 -18 l22 18 v22 h-44 z" fill="none" stroke="${t.paper}" stroke-width="2" stroke-linejoin="round"/>`;
      s += k.g(m.on(0.6 + i * 0.6), k.box(x, y, 158, 102, { fill: t.paper, stroke: t.line, r: 8 }) + `<rect x="${x}" y="${y}" width="158" height="62" rx="8" fill="${[t.blue, t.green, t.muted, t.pink, t.blue, t.green][i]}" opacity=".8"/>` + house + k.lines(x + 12, y + 72, [90, 60], { gap: 12 }));
    }
    return s;
  },

  keilah(t, k, m) {
    let s = '';
    s += k.box(0, 0, 330, 34, { fill: t.paper, stroke: t.line, r: 8 }) + k.text(14, 22, "Keilah's Cakes", { size: 14, weight: 700 });
    s += k.box(282, 7, 38, 20, { fill: t.ink, stroke: 'none', r: 10 });
    s += k.g(m.between(0, 3.4), k.text(301, 22, '0', { size: 12, mono: true, fill: t.paper, anchor: 'middle' }));
    s += k.g(m.on(3.4), k.text(301, 22, '1', { size: 12, mono: true, fill: t.paper, anchor: 'middle' }));
    for (let i = 0; i < 3; i++) {
      const x = i * 112;
      const cake = `<g transform="translate(${x + 30} 66)"><rect x="0" y="30" width="44" height="18" rx="3" fill="${t.pink}"/><rect x="6" y="14" width="32" height="16" rx="3" fill="${t.paper}" stroke="${t.pink}" stroke-width="2"/><line x1="22" y1="2" x2="22" y2="14" stroke="${t.accent}" stroke-width="2"/></g>`;
      s += k.g(m.on(0.3 + i * 0.3), k.box(x, 48, 104, 170, { fill: t.paper, stroke: t.line, r: 8 }) + cake + k.lines(x + 12, 134, [70, 44], { gap: 14 }) + k.box(x + 12, 176, 80, 28, { fill: t.ink, stroke: 'none', r: 6 }) + k.text(x + 52, 195, 'Add', { size: 13, weight: 600, fill: t.paper, anchor: 'middle' }));
    }
    s += k.g(m.add([[0, 'opacity:0'], [2.9, 'opacity:0'], [3.0, 'opacity:1'], [3.4, 'opacity:0'], [L, 'opacity:0']], { base: 'opacity:0' }), k.box(124, 224, 80, 28, { fill: t.accent, stroke: 'none', r: 6 }));
    const cx = 420;
    const cy = 120;
    const r = 46;
    const c = 2 * Math.PI * r;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.line}" stroke-width="9"/>`;
    s += `<circle class="${m.add([[0, `stroke-dashoffset:${c.toFixed(1)}`], [4, `stroke-dashoffset:${c.toFixed(1)}`], [6.2, `stroke-dashoffset:${(c * 0.05).toFixed(1)}`], [L - 0.5, `stroke-dashoffset:${(c * 0.05).toFixed(1)}`], [L, `stroke-dashoffset:${c.toFixed(1)}`]], { timing: 'ease-out', base: `stroke-dashoffset:${(c * 0.05).toFixed(1)}` })}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.green}" stroke-width="9" stroke-dasharray="${c.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    s += k.g(m.on(6), k.text(cx, cy + 9, '95+', { size: 26, mono: true, weight: 700, anchor: 'middle' }));
    s += k.text(cx, cy + 74, 'Lighthouse', { size: 14, fill: t.muted, anchor: 'middle' });
    return s;
  },

  ojtech(t, k, m) {
    let s = '';
    s += k.box(0, 0, 170, 250, { fill: t.paper, stroke: t.ink, r: 10 });
    s += `<circle cx="85" cy="50" r="26" fill="${t.line}"/>`;
    s += k.lines(40, 90, [90, 60], { gap: 14 });
    ['React', 'Spring', 'SQL', 'Python'].forEach((sk, i) => (s += k.chip(14 + (i % 2) * 74, 134 + Math.floor(i / 2) * 34, sk, { size: 11 })));
    s += k.text(190, 12, 'MATCHES', { size: 12, mono: true, fill: t.muted });
    [0.92, 0.81, 0.67, 0.48].forEach((v, i) => {
      const y = 24 + i * 58;
      s += k.box(190, y, 302, 48, { fill: t.paper, stroke: i === 0 ? t.ink : t.line, r: 8 });
      s += k.lines(204, y + 12, [110], { h: 7 });
      s += k.box(204, y + 28, 200, 8, { fill: t.line, stroke: 'none', r: 4 }) + k.bar(204, y + 28, 200, 8, i === 0 ? t.accent : t.blue, m.scaleX(0.6 + i * 0.3, 2.2 + i * 0.3, 0, v), 4);
      s += k.g(m.on(2.2 + i * 0.3), k.text(478, y + 36, `${Math.round(v * 100)}%`, { size: 14, mono: true, weight: 700, anchor: 'end' }));
    });
    s += k.g(m.on(3.6), k.chip(388, 30, 'best', { size: 11, fill: t.accent, stroke: t.accent, color: t.paper }));
    return s;
  },

  navigram(t, k, m) {
    let s = '';
    s += k.box(0, 0, 492, 250, { fill: t.paper, stroke: t.ink, r: 10 });
    s += `<path d="M0 170 C 80 150, 120 200, 200 180 S 330 110, 492 140 V 250 H 0 Z" fill="${t.blue}" opacity=".18"/>`;
    s += `<path d="M40 40 L130 90 L240 70 L330 120 L440 60" fill="none" stroke="${t.line}" stroke-width="3"/>`;
    [[80, 70, t.pink], [190, 120, t.accent], [300, 60, t.green], [410, 150, t.blue]].forEach(([x, y, c], i) => {
      s += k.g(m.on(0.4 + i * 0.6), `<path d="M${x} ${y} c-10 -12 -14 -18 -14 -24 a14 14 0 0 1 28 0 c0 6 -4 12 -14 24 z" fill="${c}"/><circle cx="${x}" cy="${y - 25}" r="5" fill="${t.paper}"/>`);
    });
    s += k.g(m.on(3.2), k.box(206, 132, 160, 86, { fill: t.card, stroke: t.ink, r: 10 }) + `<rect x="216" y="142" width="60" height="44" rx="6" fill="${t.accent}" opacity=".7"/>` + k.text(286, 158, 'Sunset', { size: 13, weight: 700 }) + k.text(286, 176, 'Moalboal', { size: 12, fill: t.muted }) + k.lines(216, 196, [120], { h: 6 }));
    s += k.g(m.on(5), k.box(0, 262, 220, 30, { fill: t.ink, stroke: 'none', r: 15 }) + k.typed(14, 282, 'meet you here at 5?', 5.2, 6.6, { size: 13, bg: t.ink, fill: t.paper }));
    return s;
  },

  gassure(t, k, m) {
    let s = '';
    const node = (x, label, sub) => k.box(x, 40, 120, 90, { fill: t.paper, stroke: t.ink, r: 10 }) + k.text(x + 60, 78, label, { size: 15, weight: 700, anchor: 'middle' }) + k.text(x + 60, 100, sub, { size: 12, mono: true, fill: t.muted, anchor: 'middle' });
    s += node(0, 'Buyer', 'GCash user') + node(186, 'Escrow', 'on Solana') + node(372, 'Seller', 'ships item');
    s += `<line x1="120" y1="85" x2="186" y2="85" stroke="${t.ink}" stroke-width="1.5"/><line x1="306" y1="85" x2="372" y2="85" stroke="${t.ink}" stroke-width="1.5"/>`;
    const coin = `<circle cx="60" cy="160" r="13" fill="${t.accent}"/><text x="60" y="165" font-family='${MONO}' font-size="13" font-weight="700" text-anchor="middle" fill="${t.paper}">₱</text>`;
    s += k.g(m.add([[0, 'transform:translateX(0)'], [0.8, 'transform:translateX(0)'], [2.2, 'transform:translateX(186px)'], [6.2, 'transform:translateX(186px)'], [7.6, 'transform:translateX(372px)'], [L - 0.5, 'transform:translateX(372px)'], [L, 'transform:translateX(0)']], { timing: 'ease-in-out', base: 'transform:translateX(372px)' }), coin);
    s += k.g(m.add([[0, 'opacity:0'], [2.2, 'opacity:0'], [2.4, 'opacity:1'], [6.2, 'opacity:1'], [6.4, 'opacity:0'], [L, 'opacity:0']], { base: 'opacity:0' }), k.chip(204, 190, 'funds held', { size: 12, stroke: t.ink }));
    s += k.chip(388, 190, 'shipped', { size: 12, cls: m.on(3.4) });
    s += k.g(m.on(4.8), k.check(16, 196, t.green) + k.text(36, 206, 'received', { size: 13, mono: true, fill: t.green }));
    s += k.g(m.on(7.6), k.chip(380, 228, 'released', { size: 12, fill: t.green, stroke: t.green, color: t.paper }));
    s += k.text(0, 270, 'Middle-man scams blocked: no one is paid before delivery', { size: 13, fill: t.muted });
    return s;
  },
};

export const WORK = [
  { slug: 'traciety', scene: 'traciety', eyebrow: 'APR 2026 — NOW', name: ['Traciety'], role: 'AI Engineer, full-time', head: ['Moved the automations', 'off Make.com onto', 'self-hosted n8n.'], figs: [['98%', 'LESS SPEND'], ['45', 'CLINICS'], ['97%', 'ATTRIBUTED']], title: 'n8n · bookings', href: 'https://traciety.com' },
  { slug: 'ayahay', scene: 'ayahay', eyebrow: 'NOV 2025 — MAR 2026', name: ['Ayahay'], role: 'Software Engineer Intern', head: ['Rebuilt a multi-tenant', 'RAG chatbot as NestJS', 'microservices.'], figs: [['40%', 'FASTER'], ['57%', 'MORE RECALL']], title: 'ayahay · assistant' },
  { slug: 'crowdsnare', scene: 'crowdsnare', eyebrow: 'APR — OCT 2025', name: ['Crowdsnare AI'], role: 'Technical Lead', head: ['Speed-to-lead agents', 'that text, qualify and', 'book car buyers.'], figs: [['90%', 'BOOKED'], ['11', 'CARS SOLD'], ['10+', 'DEALERS']], title: 'speed-to-lead agent', href: 'https://crowdsnare.com/' },
  { slug: 'cfai', scene: 'cfai', eyebrow: 'JUL 2025 — JAN 2026', name: ['Cinematography', 'for Actors Institute'], role: 'AI Automation Developer', head: ['Email replies drafted', 'from 50+ SOPs on', 'Google Cloud Run.'], figs: [['70%', 'FASTER'], ['85+', 'LIGHTHOUSE']], title: 'inbox · auto-reply' },
  { slug: 'freckles', scene: 'freckles', eyebrow: 'JUL 2024 — MAR 2025', name: ['Freckles Graphics'], role: 'Full-stack Developer', head: ['A print workflow for a', '$12M+ a year apparel', 'shop.'], figs: [['500+', 'ORDERS/DAY'], ['85%', 'LESS MANUAL']], title: 'print queue' },
];

export const PROJECTS_CARDS = [
  { slug: 'autoapply', scene: 'autoapply', eyebrow: 'MULTI-TENANT · PLAYWRIGHT', name: ['AutoApply'], head: ['Reads a resume, scores', 'the fit, fills and sends', 'the application.'], figs: [['11', 'USERS'], ['377', 'TESTS']], title: 'autoapply · apply' },
  { slug: 'weewoo', scene: 'weewoo', eyebrow: 'FLUTTER · LIBSODIUM', name: ['weewoo'], head: ['Location sharing and', 'chat, end-to-end', 'encrypted.'], figs: [['36', 'RLS POLICIES'], ['223', 'TESTS']], title: 'weewoo · live' },
  { slug: 'kbsdk', scene: 'kbsdk', eyebrow: 'OPEN SOURCE · TYPESCRIPT', name: ['Knowledge Base', 'SDK'], head: ['Train on your docs,', 'stream answers into a', 'whitelabel chat.'], figs: [['RAG', 'PGVECTOR'], ['SSE', 'STREAMING']], title: 'knowledge-base-sdk', href: 'https://github.com/JivSTuban/knowledge-base-sdk' },
  { slug: 'austin', scene: 'austin', eyebrow: 'REAL ESTATE · REACT', name: ['Austin McClain'], head: ['A realtor portfolio fed', 'by automated MLS', 'listings.'], figs: [['119+', 'LISTINGS'], ['$13.5M', 'IN VALUE']], title: 'austinmcclain.com', href: 'https://austinmcclain.com' },
  { slug: 'keilah', scene: 'keilah', eyebrow: 'STOREFRONT · NEXT.JS', name: ["Keilah's Cakes"], head: ['A bakery storefront', 'with a fast image', 'pipeline.'], figs: [['95+', 'LIGHTHOUSE']], title: 'keilahs.shop', href: 'https://keilahs.shop' },
  { slug: 'ojtech', scene: 'ojtech', eyebrow: 'SPRING BOOT · GEMINI', name: ['OJTech'], head: ['Matches students to', 'internships with NLP', 'recommendations.'], figs: [['NLP', 'MATCHING']], title: 'ojtech · matches' },
  { slug: 'navigram', scene: 'navigram', eyebrow: 'SPRING BOOT · WEBSOCKETS', name: ['Navigram'], head: ['Memories pinned to', 'places, with real-time', 'chat.'], figs: [['GEO', 'INDEXED'], ['LIVE', 'CHAT']], title: 'navigram · map' },
  { slug: 'gassure', scene: 'gassure', eyebrow: 'SOLANA · REACT', name: ['GAssure'], head: ['Escrow that holds the', 'money until the item', 'arrives.'], figs: [['#1', 'OF 196 TEAMS'], ['980', 'STUDENTS']], title: 'gassure · escrow' },
];

/** One card. entry: { name[], role?, eyebrow, head[], figs[[value, label]], scene, title }. */
export function renderEntryCard({ theme, entry }) {
  const t = { ...THEMES[theme], ...EXTRA[theme] };
  const m = motion();
  const k = kit(t, m);
  const stage = SCENES[entry.scene](t, k, m);

  // left panel
  const two = entry.name.length > 1;
  const nameSize = Math.min(two ? 28 : 38, Math.floor(296 / (Math.max(...entry.name.map((l) => l.length)) * 0.56)));
  const name = entry.name.map((l, i) => `<text x="28" y="${two ? 80 + i * 32 : 94}" font-family='${SANS}' font-size="${nameSize}" font-weight="700" letter-spacing="-0.5" fill="${t.ink}">${esc(l)}</text>`).join('');
  const drop = two ? 10 : 0;
  const headY = (entry.role ? 162 : 148) + drop;
  const role = entry.role ? `<text x="28" y="${140 + drop}" font-family='${SANS}' font-size="18" font-weight="600" fill="${t.muted}">${esc(entry.role)}</text>` : '';
  const head = entry.head.map((l, i) => `<text x="28" y="${headY + 6 + i * 27}" font-family='${SANS}' font-size="21" fill="${t.ink}">${esc(l)}</text>`).join('');
  let fx = 28;
  const figs = entry.figs
    .map(([v, l]) => {
      const w = Math.max(v.length * 19.2, l.length * 7.8) + 22;
      const out = `<text x="${fx}" y="338" font-family='${MONO}' font-size="32" font-weight="700" fill="${t.ink}">${esc(v)}</text><text x="${fx}" y="362" font-family='${MONO}' font-size="13" letter-spacing="0.5" fill="${t.muted}">${esc(l)}</text>`;
      fx += w;
      return out;
    })
    .join('');

  const label = `${entry.name.join(' ')}${entry.role ? `, ${entry.role}` : ''}, ${entry.eyebrow.toLowerCase()}. ${entry.head.join(' ')} ${entry.figs.map(([v, l]) => `${v} ${l.toLowerCase()}`).join(', ')}.`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + GAP}" viewBox="0 0 ${W} ${H + GAP}" role="img" aria-label="${esc(label)}">
<style>
${m.rest()}
@media (prefers-reduced-motion: no-preference){
  ${m.css()}
}
</style>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<text x="28" y="40" font-family='${MONO}' font-size="14" letter-spacing="1.5" fill="${t.muted}">${esc(entry.eyebrow)}</text>
${name}${role}${head}${figs}
<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="12" fill="${t.card}" stroke="${t.ink}" stroke-width="1.5"/>
<line x1="${SX}" y1="${SY + 34}" x2="${SX + SW}" y2="${SY + 34}" stroke="${t.line}" stroke-width="1.5"/>
${[0, 1, 2].map((i) => `<circle cx="${SX + 20 + i * 16}" cy="${SY + 17}" r="5" fill="${t.line}"/>`).join('')}
<text x="${SX + SW / 2}" y="${SY + 22}" font-family='${MONO}' font-size="13" text-anchor="middle" fill="${t.muted}">${esc(entry.title)}</text>
<g transform="translate(${IX} ${IY})">${stage}</g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" fill="none" stroke="${t.ink}" stroke-width="1.5"/>
</svg>
`;
}
