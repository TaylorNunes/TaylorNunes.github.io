(() => {
const NS = 'http://www.w3.org/2000/svg';
const W = 1440, H = 220;
const svg = document.getElementById('art');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rand = rng(11);
const pick = (arr, r) => arr[Math.min(arr.length - 1, Math.floor(r * arr.length))];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map(s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
const shade = c => mix(c, '#1c2a1e', .28), light = c => mix(c, '#fbf6c8', .2);
const f1 = v => v.toFixed(1);

/* ---------- Leaf shapes (stem tip at 0,0, blade pointing up) ---------- */
const MAPLE = 'M0-19L2.2-14.6 5.6-16.6 4.6-11.6 9.6-12.4 6.6-8.2 8.2-6.2 3-5.8 2.2-2.6 0.7-4.8 0.7 0-0.7 0-0.7-4.8-2.2-2.6-3-5.8-8.2-6.2-6.6-8.2-9.6-12.4-4.6-11.6-5.6-16.6-2.2-14.6Z';
const REDBUD = 'M0.5 0L0.5-3C2-1.2 8-2 8-8C8-12 3-14 0-17C-3-14-8-12-8-8C-8-2-2-1.2-0.5-3L-0.5 0Z';
const RBFLOWER = 'M0 0L-2.6-3.2C-4.6-3.6-4.8-6.2-2.8-6.4C-1.4-6.4-1.2-4.6-2.2-3.4ZM0 0L0.4-4.2C-0.6-5.8 0.4-8 1.8-7.4C3-6.8 2.4-5 1.1-4.2ZM0 0L2.8-2C3.4-3.8 5.8-3.6 5.6-1.8C5.4-0.6 3.8-0.8 3-1.6Z';

/* ---------- Palettes ---------- */
const PAL = {
  mapleFlower: ['#c8483a', '#b33a34', '#d9604a'],
  springGreen: ['#9ccf62', '#8cc556', '#aad66f', '#86bd50'],
  summerGreen: ['#4f9846', '#5aa24c', '#478c40', '#62a952'],
  lateSummer:  ['#7f9c3e', '#8ea445', '#76933b'],
  autumn:      ['#e8862a', '#d65a26', '#efa233', '#c63c2a', '#e6b03c', '#dd7428'],
  redbudFlower:['#c9418a', '#d8559c', '#b83a7e', '#e070ad'],
  redbudSpring:['#a2cf66', '#93c65a', '#b0d873'],
  redbudSummer:['#5a9e4c', '#64a855', '#53954a'],
  redbudAutumn:['#e8c547', '#d9b23a', '#efcf5d'],
  pine:        ['#3f6e58', '#467760', '#3a6652'],
};
const SKY = {
  spring: ['#b7defa', '#f6f1ec'], summer: ['#7ec3f0', '#e4f4fd'],
  autumn: ['#f1c993', '#fcebd6'], winter: ['#bdcad8', '#eef2f6'],
};
const LAND = { // far ridge, mid ridge, near hill, front ground
  spring: ['#a8bfd4', '#9fc49b', '#8cc46d', '#7dba5e'],
  summer: ['#8eaec8', '#6e9e73', '#67a756', '#5c9d4b'],
  autumn: ['#b7b2c6', '#c8965c', '#b4a04e', '#a39848'],
  winter: ['#b7c5d5', '#d3dde7', '#e7edf3', '#f6f9fb'],
};
const EARLY_AUTUMN = ['#9fb4c6', '#7d9e66', '#94ab50', '#8ca64a'];

/* ---------- Static scene ---------- */
const defs = el('defs', {}, svg);
el('path', { id: 'maple', d: MAPLE }, defs);
el('path', { id: 'redbud', d: REDBUD }, defs);
el('path', { id: 'rbflower', d: RBFLOWER }, defs);
const sky = el('linearGradient', { id: 'sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
const skyTop = el('stop', { offset: '0%' }, sky), skyBot = el('stop', { offset: '100%' }, sky);
const glow = el('radialGradient', { id: 'glow' }, defs);
const glowIn = el('stop', { offset: '0%', 'stop-opacity': .55 }, glow);
el('stop', { offset: '100%', 'stop-opacity': 0, 'stop-color': '#fff' }, glow);

el('rect', { width: W, height: H, fill: 'url(#sky)' }, svg);
const sunGlow = el('circle', { cx: 1180, cy: 52, r: 70, fill: 'url(#glow)' }, svg);
const sun = el('circle', { cx: 1180, cy: 52, r: 20 }, svg);
const clouds = el('g', {}, svg);
[[80, 52, .55, 130, 0], [460, 34, .45, 160, -70], [880, 66, .4, 110, -40]].forEach(([x, y, s, dur, delay]) => {
  const g = el('g', { class: 'cloud', style: `animation-duration:${dur}s;animation-delay:${delay}s` }, clouds);
  const c = el('g', { transform: `translate(${x} ${y}) scale(${s})`, class: 'cloudFill' }, g);
  [[0, 0, 46, 20], [36, -12, 34, 22], [70, 2, 40, 17], [-36, 6, 30, 13]].forEach(([cx, cy, rx, ry]) => el('ellipse', { cx, cy, rx, ry }, c));
});
const birds = el('g', {}, svg);
[[0, 58, 40], [30, 70, 40], [-20, 76, 55]].forEach(([dx, y, dur], i) => {
  const g = el('g', { class: 'bird', style: `animation-duration:${dur}s;animation-delay:${-i * 11}s` }, birds);
  el('path', { d: `M${dx} ${y} q4 -5 8 0 q4 -5 8 0`, fill: 'none', stroke: '#3d4a52', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, g);
});
const ridgeFar = el('path', { d: 'M0 122 C90 104 170 112 260 100 S430 86 540 104 S720 92 830 84 S1010 104 1120 92 S1320 80 1440 100 L1440 220 L0 220Z' }, svg);
const ridgeMid = el('path', { d: 'M0 150 C140 134 260 146 400 132 S640 140 780 128 S1040 146 1180 134 S1360 130 1440 140 L1440 220 L0 220Z' }, svg);
const hill = el('path', { d: 'M0 180 C200 166 380 182 600 170 S960 164 1200 176 S1380 168 1440 174 L1440 220 L0 220Z' }, svg);
const piles = el('g', {}, svg);
const treesG = el('g', {}, svg);
const front = el('path', { d: 'M0 202 C260 194 520 206 780 198 S1180 192 1440 200 L1440 220 L0 220Z' }, svg);
const grassG = el('g', {}, svg);
const flowersG = el('g', {}, svg);

/* ---------- Trees ---------- */
const TREES = window.__TREES || [
  { x: 70,   y: 198, h: 112, type: 'maple' },
  { x: 205,  y: 195, h: 150, type: 'pine' },
  { x: 355,  y: 198, h: 102, type: 'maple' },
  { x: 505,  y: 197, h: 80,  type: 'redbud' },
  { x: 650,  y: 199, h: 124, type: 'maple' },
  { x: 805,  y: 195, h: 142, type: 'pine' },
  { x: 950,  y: 198, h: 106, type: 'maple' },
  { x: 1100, y: 199, h: 120, type: 'maple' },
  { x: 1250, y: 195, h: 148, type: 'pine' },
  { x: 1392, y: 197, h: 96,  type: 'maple' },
];
const leaves = [], clumps = [], snowBits = [], pileEls = [];
const D2R = Math.PI / 180;

/* Growth rules. Angles in degrees: 0 = up, positive = leaning right. */
const SPECIES = {
  // Sugar maple: stout trunk, 2–3 ascending scaffold limbs, dense rounded-oval crown
  maple: {
    trunk: h => [h * .19, h * .078], depth: 5, taper: .64, bend: 16, jitter: 12, clumpDepth: 3,
    kids: d => d === 0 ? 3 : d === 1 ? (rand() < .5 ? 3 : 2) : 2,
    spread: d => [24, 30, 36, 42, 46][d],
    ratio: d => d === 0 ? 1.0 : .75 + (rand() - .5) * .1,
    tropism: (a, d) => a * (d < 2 ? .84 : .97),
    clumpShape: 0.86, leafHref: '#maple', leafSize: .62,
  },
  // Eastern redbud: short trunk splitting low into zig-zagging limbs; broad, rounded-flat crown
  redbud: {
    trunk: h => [h * .16, h * .08], depth: 5, taper: .66, bend: 26, jitter: 18, clumpDepth: 3,
    kids: d => d === 0 ? 3 : 2,
    spread: d => [52, 40, 36, 36, 38][d],
    ratio: d => d === 0 ? 1.35 : .74 + (rand() - .5) * .12,
    tropism: (a, d) => d < 2 ? clamp(a * 1.12, -78, 78) : a * .95,
    clumpShape: 0.62, leafHref: '#redbud', leafSize: .5,
  },
};

// One foliage clump: shadow → body → highlight, each a soft ellipse ringed with real leaf shapes
function clumpShape(parent, cx, cy, rx, ry, href, leafS, seedR) {
  const g = el('g', {}, parent);
  const n = Math.max(6, Math.round(Math.PI * (rx + ry) / (19 * leafS * .85)));
  el('ellipse', { cx: f1(cx), cy: f1(cy), rx: f1(rx * .84), ry: f1(ry * .84) }, g);
  for (let i = 0; i < n; i++) {
    const a = (i + seedR() * .5) / n * Math.PI * 2;
    const px = cx + Math.cos(a) * rx * .7, py = cy + Math.sin(a) * ry * .7;
    const rot = a / D2R + 90 + (seedR() - .5) * 30;
    el('use', { href, transform: `translate(${f1(px)} ${f1(py)}) rotate(${rot.toFixed(0)}) scale(${(leafS * (.8 + seedR() * .35)).toFixed(3)})` }, g);
  }
  return g;
}
function blob(parent, cx, cy, rx, ry, r) {
  const n = 7; let d = '';
  const pts = [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2, k = .85 + r() * .3; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
  pts.forEach((p, i) => { const q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += (i ? '' : `M${f1((pts[n - 1][0] + p[0]) / 2)} ${f1((pts[n - 1][1] + p[1]) / 2)}`) + `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`; });
  return el('path', { d: d + 'Z' }, parent);
}

function growTree(t, sg) {
  const P = SPECIES[t.type], { x, y, h } = t, segs = [], twigs = [], groups = [];
  function grow(sx, sy, ang, len, w, d, grp) {
    const bend = (rand() - .5) * P.bend;
    const ex = sx + Math.sin(ang * D2R) * len, ey = sy - Math.cos(ang * D2R) * len;
    const mx = sx + Math.sin((ang + bend) * D2R) * len * .5, my = sy - Math.cos((ang + bend) * D2R) * len * .5;
    segs.push({ sx, sy, mx, my, ex, ey, w, d, ang });
    if (d === P.clumpDepth) { grp = { tips: [], twigs: [] }; groups.push(grp); }
    if (grp) grp.tips.push([ex, ey]);
    if (d >= P.depth - 2) { const tw = { sx, sy, ex, ey, ang, d }; twigs.push(tw); if (grp) grp.twigs.push(tw); }
    if (d >= P.depth) return;
    const n = P.kids(d);
    for (let i = 0; i < n; i++) {
      const f = n === 1 ? 0 : i / (n - 1) - .5;
      const a = P.tropism(ang + f * 2 * P.spread(d) + (rand() - .5) * P.jitter, d);
      grow(ex, ey, a, len * P.ratio(d), w * P.taper, d + 1, grp);
    }
  }
  const [tl, tw] = P.trunk(h);
  grow(x, y, (rand() - .5) * 4, tl, tw, 0, null);

  const bark = t.type === 'redbud' ? '#4f3a33' : '#5f4130';
  const branchG = el('g', {}, sg), snowG = el('g', {}, sg), looseG = el('g', {}, sg), crownG = el('g', {}, sg);
  el('path', { d: `M${x - tw * 1.25} ${y}Q${x - tw * .6} ${y - tw * .5} ${x - tw * .5} ${y - tw * 2.2}L${x + tw * .5} ${y - tw * 2.2}Q${x + tw * .6} ${y - tw * .5} ${x + tw * 1.25} ${y}Z`, fill: bark }, branchG);
  segs.forEach(g => {
    const d = `M${f1(g.sx)} ${f1(g.sy)}Q${f1(g.mx)} ${f1(g.my)} ${f1(g.ex)} ${f1(g.ey)}`;
    el('path', { d, fill: 'none', stroke: bark, 'stroke-width': Math.max(.55, g.w).toFixed(2), 'stroke-linecap': 'round' }, branchG);
    if (g.d <= 3 && Math.abs(g.ang) > 22)
      snowBits.push(el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': Math.max(.6, g.w * .55).toFixed(2), 'stroke-linecap': 'round', transform: `translate(0 ${(-g.w * .55).toFixed(2)})` }, snowG));
  });

  // Loose leaves hang from the twigs by their stems. They show at the crown's edge in summer,
  // and they are what is left once the clumps thin out (autumn) or before they fill in (spring).
  const base = h / 125, leafS = base * P.leafSize;
  const addLeaf = (kind, href, px, py, rot, sc, grp) => {
    const b = { node: el('use', { href, class: 'leafu' }, looseG), kind, type: t.type, px, py, rot, s: sc, u: rand(), c: rand(), c2: rand(), dark: rand() < .35, k: -1, grp };
    leaves.push(b); return b;
  };
  groups.forEach(grp => grp.twigs.forEach(tg => {
    for (let i = 0; i < 3; i++) {
      const f = i === 0 ? 1 : 1 - i * .3;
      const px = tg.sx + (tg.ex - tg.sx) * f, py = tg.sy + (tg.ey - tg.sy) * f;
      const off = i === 0 ? (rand() - .5) * 30 : (i % 2 ? 1 : -1) * (35 + rand() * 30);
      let rot = tg.ang + off;
      if (rot > 120) rot = 120 + (rot - 120) * .3;
      if (rot < -120) rot = -120 + (rot + 120) * .3;
      addLeaf('leaf', P.leafHref, px, py, rot, leafS * (.85 + rand() * .3), grp);
    }
  }));
  if (t.type === 'redbud') segs.forEach(g => {
    if (g.d < 1) return;
    const n = Math.max(1, Math.round(Math.hypot(g.ex - g.sx, g.ey - g.sy) / 4));
    for (let i = 0; i < n; i++) {
      const f = (i + .5) / n;
      addLeaf('flower', '#rbflower', g.sx + (g.ex - g.sx) * f, g.sy + (g.ey - g.sy) * f, g.ang + (i % 2 ? 70 : -70) + (rand() - .5) * 40, base * (.75 + rand() * .35), null);
    }
  });

  // Foliage clumps: one per scaffold branch, sized to cover that branch's twigs, plus a fill clump
  const all = twigs.map(t => [t.ex, t.ey]);
  const mean = pts => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
  const [mx, my] = mean(all);
  const spanX = Math.max(...all.map(p => Math.abs(p[0] - mx)));
  const defsC = [{ cx: mx, cy: my + h * .04, rx: spanX * .48, ry: spanX * .46 * P.clumpShape, core: true }];
  groups.forEach(grp => {
    const [cx, cy] = mean(grp.tips);
    const r = Math.max(...grp.tips.map(p => Math.hypot(p[0] - cx, (p[1] - cy) / P.clumpShape))) * .7 + 7 * base;
    defsC.push({ cx, cy, rx: r, ry: r * P.clumpShape, grp });
  });
  defsC.sort((a, b) => (a.core ? -1 : b.core ? 1 : a.cy - b.cy));
  defsC.forEach(c => {
    const cg = el('g', { class: 'leafu' }, crownG);
    const sr = rng(Math.floor(rand() * 1e9));
    const sh = clumpShape(cg, c.cx + c.rx * .05, c.cy + c.ry * .16, c.rx, c.ry, P.leafHref, leafS, sr);
    const bd = clumpShape(cg, c.cx, c.cy, c.rx * .97, c.ry * .95, P.leafHref, leafS, sr);
    const hl = blob(cg, c.cx - c.rx * .28, c.cy - c.ry * .36, c.rx * .36, c.ry * .26, sr);
    clumps.push({ node: cg, sh, bd, hl, type: t.type, ...c, u: c.core ? .42 : rand(), c: rand(), c2: rand() });
  });
  pileEls.push({ type: t.type, node: el('ellipse', { cx: x + 3, cy: y + 3, rx: h * .42, ry: h * .045 }, piles) });
}

/* Eastern white pine */
function padPath(cx, cy, w, ht, r, side) {
  // a horizontal plate of needles: lumpy top, needle-fringed underside, tip turned slightly up
  const l = cx - w / 2, rr = cx + w / 2, up = ht * .5;
  const lt = side < 0 ? up : 0, rt = side > 0 ? up : 0;
  let d = `M${f1(l)} ${f1(cy - lt)}`;
  const bumps = 2 + Math.floor(r() * 2);
  for (let i = 0; i < bumps; i++) {
    const x0 = l + w * i / bumps, x1 = l + w * (i + 1) / bumps;
    const yb = cy - ht * (.75 + r() * .45);
    const y1 = cy - (i === bumps - 1 ? rt : ht * .25);
    d += `Q${f1((x0 + x1) / 2)} ${f1(yb - ht * .35)} ${f1(x1)} ${f1(y1)}`;
  }
  const n = Math.max(6, Math.round(w / 2.2));
  for (let i = 1; i <= n; i++) {
    const xx = rr - w * i / n, base = cy - (side > 0 ? rt : lt) * (1 - Math.abs(i / n - (side > 0 ? 0 : 1)));
    const yy = i % 2 ? cy + ht * (.3 + r() * .35) : cy + ht * .02;
    d += `L${f1(xx)} ${f1(Math.max(yy, base))}`;
  }
  return d + 'Z';
}
function growPine(t, sg, g) {
  // Eastern white pine: tall straight leader; a few widely spaced tiers of long, level limbs;
  // each limb carries a soft, cloud-like plate of needles; uneven, slightly one-sided crown
  const { x, y, h } = t;
  const topX = x + h * (rand() - .5) * .06;
  el('path', { d: `M${x - h * .034} ${y}L${topX - h * .007} ${y - h}L${topX + h * .007} ${y - h}L${x + h * .034} ${y}Z`, fill: '#56402f' }, g);
  const branchG = el('g', {}, sg), padG = el('g', {}, sg);
  const pads = [];
  const tiers = []; for (let f = .28 + rand() * .04; f < .86; f += .075 + rand() * .045) tiers.push(f);
  const bias = rand() < .5 ? -1 : 1;
  tiers.forEach((f, wi) => {
    const by = y - f * h, bx = x + (topX - x) * f, taper = 1.12 - (f - .3) * 1.2;
    [-1, 1].forEach(side => {
      if (rand() < (side === bias ? .08 : .22) && wi > 0 && wi < tiers.length - 1) return;
      const len = h * (.22 + rand() * .16) * taper * (side === bias ? 1.15 : .88);
      const lift = -.06 + f * .32;
      const ex = bx + side * len, ey = by - len * (lift + (rand() - .5) * .08);
      el('path', { d: `M${f1(bx)} ${f1(by)}Q${f1(bx + side * len * .5)} ${f1(by - len * .03)} ${f1(ex)} ${f1(ey)}`, fill: 'none', stroke: '#56402f', 'stroke-width': Math.max(1, h * .014 * taper).toFixed(2), 'stroke-linecap': 'round' }, branchG);
      // needle plate covers the outer ~75% of the limb, thickest near the tip
      pads.push({ x0: bx + side * len * .06, x1: ex + side * len * .18, y0: by + h * .006, y1: ey + h * .004, ht: h * (.06 + rand() * .018) * (.75 + taper * .35), side });
      // smaller plates layered just above, so each tier reads as a soft, thick cloud of needles
      pads.push({ x0: bx + side * len * .2, x1: ex - side * len * .02, y0: by - h * .04, y1: ey - h * .035, ht: h * .045, side });
    });
  });
  // leader: a few small plates near the top
  for (let k = 0; k < 4; k++) {
    const f = .86 + k * .04, side = k % 2 ? 1 : -1, cx = x + (topX - x) * f;
    pads.push({ x0: cx - side * h * .035, x1: cx + side * h * (.1 - k * .02), y0: y - f * h, y1: y - f * h - h * .01, ht: h * .05, side });
  }
  pads.sort((a, b) => a.y0 - b.y0);
  pads.forEach(p => {
    const c = pick(PAL.pine, rand()), pg = el('g', {}, padG);
    const P = (dy, sc, htk) => plate(p, dy, sc, htk);
    el('path', { d: P(p.ht * .3, 1, 1), fill: shade(c) }, pg);
    el('path', { d: P(0, .97, .95), fill: c }, pg);
    el('path', { d: P(-p.ht * .35, .7, .55), fill: light(c), opacity: .7 }, pg);
    snowBits.push(el('path', { d: P(-p.ht * .55, .8, .4), fill: '#ffffff' }, pg));
  });
}
// a lumpy needle plate between (x0,y0) and (x1,y1): rounded lumps on top, fine needle fringe underneath
function plate(p, dy, sc, htk) {
  const r = rng(Math.round(p.x0 * 13 + p.y0 * 7));
  const mxp = (p.x0 + p.x1) / 2, wx = (p.x1 - p.x0) * sc;
  const ax = mxp - wx / 2, bx = mxp + wx / 2, ay = p.y0 + dy, by = p.y1 + dy, ht = p.ht * htk;
  const lumps = Math.max(3, Math.round(Math.abs(wx) / (p.ht * 1.1)));
  const at = f => [ax + (bx - ax) * f, ay + (by - ay) * f];
  let d = `M${f1(ax)} ${f1(ay)}`;
  for (let i = 0; i < lumps; i++) {
    const [x2, y2] = at((i + 1) / lumps), [xm, ym] = at((i + .5) / lumps);
    const bump = ht * (.42 + r() * .22) * (1 - Math.abs((i + .5) / lumps - .55) * .5);
    d += `Q${f1(xm)} ${f1(ym - bump * 2)} ${f1(x2)} ${f1(y2 - (i === lumps - 1 ? ht * .15 : 0))}`;
  }
  const n = Math.max(6, Math.round(Math.abs(wx) / 2.6));
  for (let i = 1; i <= n; i++) {
    const [xx, yy] = at(1 - i / n), edge = Math.sin(Math.PI * (1 - i / n));
    d += `L${f1(xx)} ${f1(yy + (i % 2 ? ht * (.12 + r() * .16) * (.4 + edge) : ht * .06))}`;
  }
  return d + 'Z';
}

TREES.forEach((t, ti) => {
  rand = rng(101 + ti * 7919);   // each tree has its own fixed shape
  const g = el('g', {}, treesG);
  const sg = el('g', { class: 'sway ' + ['', 'b', 'c'][ti % 3], style: `transform-origin:${t.x}px ${t.y}px` }, g);
  if (t.type === 'pine') growPine(t, sg, g); else growTree(t, sg);
});
rand = rng(5);

/* ---------- Grass & flowers ---------- */
const grassGroups = ['', 'b', 'c'].map(c => el('g', { class: 'grass ' + c }, grassG));
const groundY = x => 199 + Math.sin(x / 210) * 2.5 - Math.sin(x / 600) * 2;
for (let i = 0; i < 300; i++) {
  const x = i * (W / 300) + rand() * 4, y = groundY(x) + 4 + rand() * 18, bh = 4 + rand() * 5, lean = (rand() - .5) * 4;
  el('path', { d: `M${f1(x)} ${f1(y)} Q${f1(x + lean / 2)} ${f1(y - bh / 2)} ${f1(x + lean)} ${f1(y - bh)}`, fill: 'none', 'stroke-width': 1.4, 'stroke-linecap': 'round', class: 'blade' }, grassGroups[i % 3]);
}
const flowers = [];
for (let i = 0; i < 40; i++) {
  const x = rand() * W, y = groundY(x) + 6 + rand() * 14;
  const f = el('g', {}, flowersG);
  el('circle', { cx: x, cy: y, r: 1.8 + rand() * .8, class: 'petal' }, f);
  el('circle', { cx: x, cy: y, r: .7, fill: '#f4c542' }, f);
  flowers.push({ g: f, c: rand(), u: rand() });
}

/* ---------- Season state ---------- */
function autoSeason(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth();
  let s, a, b;
  if (m >= 2 && m <= 4) { s = 'spring'; a = new Date(y, 2, 1); b = new Date(y, 5, 1); }
  else if (m >= 5 && m <= 7) { s = 'summer'; a = new Date(y, 5, 1); b = new Date(y, 8, 1); }
  else if (m >= 8 && m <= 10) { s = 'autumn'; a = new Date(y, 8, 1); b = new Date(y, 11, 1); }
  else { s = 'winter'; a = m === 11 ? new Date(y, 11, 1) : new Date(y - 1, 11, 1); b = new Date(a.getFullYear() + 1, 2, 1); }
  return { season: s, p: clamp((d - a) / (b - a)) };
}
let state = autoSeason(), mode = 'auto';
const q = new URLSearchParams(location.search);
if (q.get('season')) { mode = q.get('season'); state = { season: mode, p: q.has('p') ? +q.get('p') : .5 }; }

// How far each leaf/clump has turned in autumn (staggered so trees change unevenly)
const turnAmt = (p, c2) => clamp(p * 2.3 - c2 * .9);
const autumnCol = (b, rb) => mix(pick(rb ? PAL.lateSummer : PAL.lateSummer, b.c), pick(rb ? PAL.redbudAutumn : PAL.autumn, b.c), turnAmt(state.p, b.c2));

function clumpLook(c, s, p) {
  const rb = c.type === 'redbud';
  if (s === 'winter') return null;
  if (s === 'summer') return pick(rb ? PAL.redbudSummer : PAL.summerGreen, c.c);
  if (s === 'spring') {
    const dens = rb ? (p - .55) / .35 : (p - .38) / .45;
    return c.u < dens ? pick(rb ? PAL.redbudSpring : PAL.springGreen, c.c) : null;
  }
  const dens = 1 - Math.pow(p, 1.1) * 1.08;    // whole clumps drop out as autumn goes on
  return c.u < dens ? autumnCol(c, rb) : null;
}
function leafLook(b, s, p) {
  const rb = b.type === 'redbud';
  if (b.kind === 'flower') {
    if (s !== 'spring') return null;
    const dens = p < .45 ? Math.min(1, .25 + p * 2.2) : Math.max(0, 1 - (p - .45) / .2);
    return b.u < dens ? { f: pick(PAL.redbudFlower, b.c), k: p < .12 ? .7 : 1 } : null;
  }
  if (s === 'winter') return null;
  if (s === 'summer') return b.u < .92 ? { f: pick(rb ? PAL.redbudSummer : PAL.summerGreen, b.c) } : null;
  if (s === 'spring') {
    if (rb) { const dens = (p - .35) / .4; return b.u < dens ? { f: pick(PAL.redbudSpring, b.c), k: .45 + .55 * clamp((p - .35) * 2) } : null; }
    if (p < .18) return b.u < .4 ? { f: pick(PAL.mapleFlower, b.c), k: .4 } : null;
    const dens = .3 + .7 * clamp((p - .18) * 2);
    return b.u < dens ? { f: pick(PAL.springGreen, b.c), k: .45 + .55 * clamp((p - .1) * 1.6) } : null;
  }
  const dens = 1 - .97 * Math.pow(p, 1.35);
  return b.u < dens ? { f: autumnCol(b, rb) } : null;
}

let leafDensity = 1;
function apply() {
  const { season: s, p } = state;
  document.body.dataset.season = s;
  skyTop.setAttribute('stop-color', SKY[s][0]); skyBot.setAttribute('stop-color', SKY[s][1]);
  let land = LAND[s];
  if (s === 'autumn') land = land.map((c, i) => mix(EARLY_AUTUMN[i], c, Math.min(1, p * 1.4)));
  [ridgeFar, ridgeMid, hill, front].forEach((e, i) => e.setAttribute('fill', land[i]));
  const sunC = { spring: '#fff3b0', summer: '#ffe26a', autumn: '#ffc56b', winter: '#f4f6f8' }[s];
  sun.setAttribute('fill', sunC); glowIn.setAttribute('stop-color', sunC);
  [sun, sunGlow].forEach(e => e.setAttribute('cy', s === 'autumn' ? 62 : s === 'winter' ? 68 : 50));
  clouds.querySelectorAll('.cloudFill').forEach(c => c.setAttribute('fill', s === 'winter' ? '#e3e8ee' : '#ffffff'));
  birds.style.opacity = (s === 'spring' || s === 'summer') ? 1 : 0;

  let on = 0, total = 0;
  clumps.forEach(c => {
    const col = clumpLook(c, s, p);
    c.on = !!col;
    if (col) { c.sh.setAttribute('fill', shade(col)); c.bd.setAttribute('fill', col); c.hl.setAttribute('fill', light(col)); c.col = col; }
    c.node.style.opacity = col ? 1 : 0;
  });
  leaves.forEach(b => {
    const L = leafLook(b, s, p);
    if (b.kind === 'leaf') total++;
    b.on = !!L;
    if (L) {
      if (b.kind === 'leaf') on++;
      const k = L.k || 1;
      if (k !== b.k) { b.node.setAttribute('transform', `translate(${f1(b.px)} ${f1(b.py)}) rotate(${b.rot.toFixed(0)}) scale(${(b.s * k).toFixed(3)})`); b.k = k; }
      b.node.setAttribute('fill', b.dark ? mix(L.f, '#1c2a1e', .18) : L.f);
      b.col = L.f;
      b.node.style.opacity = 1;
    } else b.node.style.opacity = 0;
  });
  leafDensity = on / total;
  snowBits.forEach(n => n.style.opacity = s === 'winter' ? .95 : 0);
  pileEls.forEach(({ type, node }) => {
    if (s === 'autumn') { node.setAttribute('fill', type === 'redbud' ? '#d9b23a' : '#d9742c'); node.style.opacity = Math.min(.85, p * 1.1); }
    else if (s === 'spring' && type === 'redbud') { node.setAttribute('fill', '#d8559c'); node.style.opacity = Math.max(0, Math.min(p, .6 - p)) * 1.2; }
    else node.style.opacity = 0;
  });
  const blade = { spring: '#5fae46', summer: '#4b973d', autumn: mix('#7f9c3e', '#a68f45', p), winter: '#c8d3cf' }[s];
  grassG.querySelectorAll('.blade').forEach(b => b.setAttribute('stroke', blade));
  grassG.style.opacity = s === 'winter' ? .35 : 1;
  flowers.forEach(f => {
    const show = (s === 'spring' && f.u < p) || (s === 'summer' && f.u < .8);
    f.g.querySelector('.petal').setAttribute('fill', s === 'spring' ? (f.c < .5 ? '#ffffff' : '#c9b3f0') : pick(['#ffffff', '#f6d84a', '#c9a7ef', '#f39bb6'], f.c));
    f.g.style.opacity = show ? 1 : 0;
  });

  document.querySelectorAll('.seasons button').forEach(btn => btn.setAttribute('aria-pressed', btn.dataset.s === mode));
  if (prog) prog.value = p;
  const phase = p < .34 ? 'early' : p < .67 ? 'mid' : 'late';
  const note = document.getElementById('seasonNote');
  if (note) note.textContent = mode === 'auto' ? `It's ${phase} ${s} in the banner, matching today's date.` : `Showing ${phase} ${s}.`;
}

const prog = document.getElementById('prog');
document.querySelectorAll('.seasons button').forEach(btn => btn.addEventListener('click', () => {
  mode = btn.dataset.s;
  state = mode === 'auto' ? autoSeason() : { season: mode, p: mode === state.season ? state.p : .5 };
  particles.length = 0; apply();
}));
if (prog) prog.addEventListener('input', () => {
  if (mode === 'auto') mode = state.season;
  state = { season: state.season, p: +prog.value }; apply();
});
const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

/* ---------- Particles: falling leaves, redbud petals, snow ---------- */
const cv = document.getElementById('fx'), ctx = cv.getContext('2d');
const MAPLE_P = new Path2D(MAPLE), REDBUD_P = new Path2D(REDBUD), PETAL_P = new Path2D('M0-4C2.4-3 2.8 1.6 0 4C-2.8 1.6-2.4-3 0-4Z');
const particles = [];
let k = 1, ox = 0, oy = 0, vx0 = 0, vx1 = W, dpr = 1;
function resize() {
  const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  k = Math.max(r.width / W, r.height / H); ox = (r.width - W * k) / 2; oy = r.height - H * k;
  vx0 = -ox / k; vx1 = vx0 + r.width / k;
}
addEventListener('resize', resize); resize();

// leaves fall from wherever there is foliage right now: a loose leaf or the edge of a clump
function fallPoint(kind) {
  for (let tries = 0; tries < 16; tries++) {
    if (kind === 'leaf' && Math.random() < .5) {
      const c = clumps[Math.floor(Math.random() * clumps.length)];
      if (c.on && c.type !== 'pine') { const a = Math.random() * Math.PI * 2; return { x: c.cx + Math.cos(a) * c.rx * .8, y: c.cy + Math.sin(a) * c.ry * .8, col: c.col, type: c.type }; }
      continue;
    }
    const b = leaves[Math.floor(Math.random() * leaves.length)];
    if (b.on && b.kind === kind) return { x: b.px, y: b.py, col: b.col, type: b.type };
  }
  return null;
}
const landY = x => Math.min(H - 2, groundY(x) + 2 + Math.random() * 18);
function spawn(s) {
  if (s === 'autumn') {
    const f = fallPoint('leaf'); if (!f) return;
    particles.push({ kind: 'leaf', shape: f.type === 'redbud' ? REDBUD_P : MAPLE_P, x: f.x, y: f.y - 8, vy: 11 + Math.random() * 9, vx: 3 + Math.random() * 6, sz: .5 + Math.random() * .25, rot: Math.random() * 6, vr: (Math.random() - .5) * 3, ph: Math.random() * 6, col: f.col, land: landY(f.x), a: 1 });
  } else if (s === 'spring') {
    const f = fallPoint('flower'); if (!f) return;
    particles.push({ kind: 'petal', x: f.x, y: f.y, vy: 7 + Math.random() * 6, vx: 8 + Math.random() * 8, sz: .45 + Math.random() * .25, rot: Math.random() * 6, vr: (Math.random() - .5) * 4, ph: Math.random() * 6, col: pick(PAL.redbudFlower, Math.random()), land: landY(f.x), a: 1 });
  } else if (s === 'winter') {
    const x = vx0 - 20 + Math.random() * (vx1 - vx0 + 40);
    particles.push({ kind: 'snow', x, y: -6 - Math.random() * 20, vy: 10 + Math.random() * 14, vx: 2, sz: .8 + Math.random() * 1.6, ph: Math.random() * 6, land: landY(x), a: .9 });
  } else {
    const x = vx0 + Math.random() * (vx1 - vx0);
    particles.push({ kind: 'mote', x, y: 130 + Math.random() * 70, vy: -3 - Math.random() * 3, vx: 4, sz: 1 + Math.random(), ph: Math.random() * 6, life: 0, a: 0 });
  }
}
function rate() {
  const { season: s, p } = state;
  const wide = (vx1 - vx0) / W;
  if (s === 'autumn') return wide * (leafDensity > .03 ? .6 + 3.4 * p : .2);
  if (s === 'spring') return p > .65 ? 0 : .3 + 1.2 * Math.min(1, p * 2);
  if (s === 'winter') return wide * (7 + 8 * Math.sin(Math.PI * p));
  return wide * .8;
}
let last = performance.now(), acc = 0, visible = true;
new IntersectionObserver(e => visible = e[0].isIntersecting).observe(cv);
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (visible && !document.hidden) {
    acc += rate() * dt;
    while (acc > 1 && particles.length < 220) { spawn(state.season); acc--; }
    if (acc > 1) acc = 0;
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
    ctx.clearRect(vx0 - 50, -50, vx1 - vx0 + 100, H + 100);
    const t = now / 1000;
    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      if (q.kind === 'mote') {
        q.life += dt; q.a = Math.min(1, q.life) * Math.max(0, 1 - (q.life - 6) / 2);
        q.x += (q.vx + Math.sin(t + q.ph) * 5) * dt; q.y += q.vy * dt;
        if (q.life > 8) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = q.a * .8; ctx.fillStyle = '#fff6c4';
        ctx.beginPath(); ctx.arc(q.x, q.y, q.sz, 0, 7); ctx.fill(); continue;
      }
      if (!q.landed) {
        q.x += (q.vx + Math.sin(t * 1.6 + q.ph) * (q.kind === 'snow' ? 6 : 16)) * dt;
        q.y += q.vy * dt; if (q.rot !== undefined) q.rot += q.vr * dt;
        if (q.y >= q.land) { q.landed = true; q.y = q.land; }
      } else {
        q.a -= dt / (q.kind === 'snow' ? 1.2 : 4);
        if (q.a <= 0) { particles.splice(i, 1); continue; }
      }
      if (q.x > vx1 + 40) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, q.a);
      if (q.kind === 'snow') {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(q.x, q.y, q.sz, 0, 7); ctx.fill();
      } else {
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
        ctx.scale(q.sz, q.sz * (q.landed ? .5 : .3 + .7 * Math.abs(Math.cos(t * 2.4 + q.ph))));
        ctx.translate(0, q.kind === 'leaf' ? 9 : 0);
        ctx.fillStyle = q.col; ctx.fill(q.kind === 'leaf' ? q.shape : PETAL_P);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
}
apply();
if (!reduce) requestAnimationFrame(frame);
})();
