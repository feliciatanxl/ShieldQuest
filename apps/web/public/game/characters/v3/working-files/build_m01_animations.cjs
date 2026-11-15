// M01 walk/run sprite sheets, re-posed from the drawing code in build_shieldquest_anchors.js.
// Run: node build_m01_animations.cjs   (writes ../animations/, idle PNGs untouched)
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const out = path.join(__dirname, '..', 'animations');
fs.mkdirSync(out, { recursive: true });

const rgb = h => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255]; };
const canvas = (w, h) => ({ w, h, p: new Uint8Array(w * h * 4) });
let OX = 0, OY = 0; // translation for the upper body (bob / lean)
function dot(a, x, y, c) { x = Math.round(x + OX); y = Math.round(y + OY); if (x < 0 || y < 0 || x >= a.w || y >= a.h) return; a.p.set(typeof c === 'string' ? rgb(c) : c, (y * a.w + x) * 4); }
function rect(a, x, y, w, h, c) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(a, xx, yy, c); }
function poly(a, pts, c) { const ys = pts.map(p => p[1]), lo = Math.floor(Math.min(...ys)), hi = Math.ceil(Math.max(...ys)); for (let y = lo; y <= hi; y++) for (let x = 0; x < a.w; x++) { let hit = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const q = pts[i], r = pts[j]; if ((q[1] > y) !== (r[1] > y) && x < (r[0] - q[0]) * (y - q[1]) / (r[1] - q[1]) + q[0]) hit = !hit; } if (hit) dot(a, x, y, c); } }
function line(a, x1, y1, x2, y2, c) { const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); for (let i = 0; i <= n; i++) dot(a, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, c); }
function ell(a, cx, cy, rx, ry, c) { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) dot(a, x, y, c); }
// Thick segment (capsule) with radius r: used for swinging limbs.
function seg(a, x1, y1, x2, y2, r, c) {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1;
  for (let y = Math.floor(Math.min(y1, y2) - r); y <= Math.ceil(Math.max(y1, y2) + r); y++)
    for (let x = Math.floor(Math.min(x1, x2) - r); x <= Math.ceil(Math.max(x1, x2) + r); x++) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L2));
      if ((x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2 <= r * r) dot(a, x, y, c);
    }
}
const crcT = Array.from({ length: 256 }, (_, i) => { for (let k = 0; k < 8; k++) i = i & 1 ? 0xedb88320 ^ (i >>> 1) : i >>> 1; return i >>> 0; });
const crc = b => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, b) => { const n = Buffer.from(t), s = Buffer.alloc(4), cc = Buffer.alloc(4); s.writeUInt32BE(b.length); cc.writeUInt32BE(crc(Buffer.concat([n, b]))); return Buffer.concat([s, n, b, cc]); };
function png(a, file) { const raw = Buffer.alloc(a.h * (1 + a.w * 4)); for (let y = 0; y < a.h; y++) Buffer.from(a.p.subarray(y * a.w * 4, (y + 1) * a.w * 4)).copy(raw, y * (a.w * 4 + 1) + 1); const h = Buffer.alloc(13); h.writeUInt32BE(a.w, 0); h.writeUInt32BE(a.h, 4); h[8] = 8; h[9] = 6; fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', h), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); }

const c = { skin: ['#604037', '#85533f', '#b87955', '#dca074'], hair: '#282a38', hairHi: '#484456', top: '#91b5c8', topHi: '#bfd8e0', topShade: '#688da7', pant: '#58574e', pantHi: '#747367', pantFar: '#46453e', shoe: '#f3e9d8', accent: '#42b8aa' };
const K = '#292c3d', S = c.skin[2], Sl = c.skin[1], Sh = c.skin[3];

function shoe(a, x, y, side) {
  rect(a, x, y, side ? 17 : 18, 9, K); rect(a, x + 2, y + 1, side ? 13 : 14, 5, c.shoe);
  rect(a, x + 3, y + 2, 10, 1, c.topHi); rect(a, x + 1, y + 6, side ? 16 : 17, 2, c.accent); rect(a, x + 2, y + 3, 9, 1, '#c7d0c8');
}
function pocket(a, x, y, w) { rect(a, x, y, w, 7, K); rect(a, x + 1, y + 1, w - 2, 5, c.pantHi); rect(a, x + 2, y + 2, w - 4, 1, c.topShade); rect(a, x + 3, y + 5, 2, 1, K); }
// Side arm from a shoulder pivot; `ang` = swing (rad, + = forward), `bend` = elbow bend (rad).
function sideArm(a, px, py, sg, ang, bend, far) {
  const ex = px + sg * Math.sin(ang) * 9, ey = py + Math.cos(ang) * 9;
  const fa = ang + bend, hx = ex + sg * Math.sin(fa) * 8, hy = ey + Math.cos(fa) * 8;
  seg(a, px, py, ex, ey, 3.5, K); seg(a, ex, ey, hx, hy, 3.5, K);
  seg(a, ex, ey, hx, hy, 2.4, far ? Sl : S); seg(a, px, py, ex, ey, 2.4, far ? c.topShade : c.top);
}
// Front/back arm: shoulder fixed under the torso, hand moves with the swing.
function frontArm(a, sx, hx, hy, ex, ey, band) {
  seg(a, sx, 46, ex, ey, 3.5, K); seg(a, ex, ey, hx, hy, 3.5, K);
  seg(a, sx, 46, ex, ey, 2.5, S); seg(a, ex, ey, hx, hy, 2.5, S);
  if (band) { rect(a, Math.round(hx) - 2, Math.round(hy) - 4, 5, 2, K); rect(a, Math.round(hx) - 2, Math.round(hy) - 4, 4, 1, c.accent); }
}

// pose: { s: stride phase -1..1 (near/left leg forward when +), liftA, liftB, bob, lean, run }
function draw(dir, pose) {
  const a = canvas(64, 96), back = dir === 'back', side = dir === 'left' || dir === 'right', sg = dir === 'left' ? -1 : 1, center = side ? 32 + sg * 2 : 32;
  const { s, liftA, liftB, bob, lean, run } = pose;
  OX = 0; OY = 0;
  // ---- legs and shoes (feet stay on baseline y=91 unless lifted)
  if (side) {
    const stride = run ? 9 : 6;
    const legs = [{ hip: 32 - sg * 1, f: -s, lift: liftB, far: true }, { hip: 32 + sg * 2, f: s, lift: liftA, far: false }];
    for (const L of legs) {
      const fx = L.hip + sg * L.f * stride, fy = 84 - L.lift;
      const kx = (L.hip + fx) / 2 + sg * (L.lift * 0.6), ky = 72 - L.lift * 0.5; // knee pushes forward when lifted
      seg(a, L.hip, 62, kx, ky, 5.5, K); seg(a, kx, ky, fx, fy, 5.5, K);
      const col = L.far ? c.pantFar : c.pant;
      seg(a, L.hip, 62, kx, ky, 3.6, col); seg(a, kx, ky, fx, fy, 3.6, col);
      if (!L.far) { seg(a, L.hip - sg, 64, kx - sg, ky, 0.8, c.pantHi); pocket(a, Math.round(L.hip + (kx - L.hip) * 0.5) - 3, Math.round(66 + (ky - 66) * 0.3), 6); }
      shoe(a, Math.round(fx) - 8, Math.round(fy) - 2, true);
    }
  } else {
    [[18, liftA, 20, 66], [36, liftB, 39, 68]].forEach(([x, L, px, py]) => {
      const h = 24 - L;
      rect(a, x, 60, 11, h, K); rect(a, x + 2, 62, 7, h - 5, c.pant); rect(a, x + 2, 64, 2, Math.min(13, h - 9), c.pantHi); rect(a, x + 4, 76 - L, 3, 5, c.pantHi);
      pocket(a, px, py - Math.round(L / 3), 8);
    });
    shoe(a, 14, 82 - liftA, false); shoe(a, 34, 82 - liftB, false);
    if (!back) { dot(a, 24, 75 - liftA, c.pantHi); dot(a, 40, 77 - liftB, c.pantHi); }
  }
  // ---- upper body, translated by bob/lean
  OX = lean; OY = bob;
  // front/back arms: each swings opposite its leg (s>0 = left leg forward => right arm forward)
  const arms = [[16, -s, 1], [49, s, -1]].map(([sx, k, inw]) => run
    // run: elbow bent, forward fist pumps up across the chest, back fist drops by the hip
    ? { sx, k, ex: sx - inw * 4, ey: 52, hx: sx + inw * (k > 0 ? 9 * k : -1), hy: 58 - (k > 0 ? 9 * k : -2 * k) }
    : { sx, k, ex: sx - inw * 0.5, ey: 52, hx: sx + inw * 2 * Math.max(k, 0), hy: 59 - 4 * Math.max(k, 0) - 1.5 * Math.max(-k, 0) });
  if (side) sideArm(a, 32 - sg * 2, 44, sg, -s * (run ? 0.9 : 0.55), run ? -sg * 0 + 1.3 : 0.15, true);
  else {
    // left arm swings opposite the left leg (s>0 = left leg forward => left arm back)
    arms.forEach((m, i) => frontArm(a, m.sx, m.hx, m.hy, m.ex, m.ey, i === 1 && !back));
  }
  poly(a, side ? [[24, 38], [40, 38], [47, 45], [45, 53], [42, 51], [43, 64], [22, 64], [22, 51], [19, 53], [20, 45]] :
    [[21, 38], [43, 38], [50, 42], [54, 50], [48, 54], [45, 50], [46, 64], [18, 64], [19, 50], [16, 54], [10, 50], [14, 42]], K);
  poly(a, side ? [[25, 40], [39, 40], [44, 45], [43, 50], [40, 48], [41, 62], [24, 62], [24, 48], [21, 50], [22, 45]] :
    [[22, 40], [42, 40], [48, 44], [51, 49], [47, 51], [43, 47], [44, 62], [20, 62], [21, 47], [17, 51], [13, 49], [17, 44]], c.top);
  rect(a, side ? 25 : 22, 43, 3, 14, c.topHi); rect(a, side ? 39 : 41, 47, 2, 11, c.topShade); rect(a, 24, 60, 16, 2, c.topShade);
  // head
  rect(a, 29, 34, 7, 7, K); rect(a, 30, 34, 5, 6, S);
  ell(a, center, 26, side ? 14 : 16, 17, K); ell(a, center, 26, side ? 12 : 14, 15, c.hair);
  if (back) { rect(a, center - 11, 27, 22, 10, c.hair); rect(a, center - 8, 16, 15, 3, c.hairHi); }
  else if (side) {
    poly(a, sg === 1 ? [[26, 20], [36, 19], [43, 24], [44, 29], [40, 34], [29, 34], [25, 29]] : [[20, 24], [27, 19], [38, 20], [41, 29], [35, 34], [24, 34], [20, 29]], K);
    ell(a, center + sg * 2, 27, 10, 10, S); rect(a, center + sg * 4, 22, 4, 6, Sh);
    rect(a, center + sg * 4, 26, 2, 4, K); dot(a, center + sg * 4, 26, '#ffffff');
    rect(a, center + sg * 6, 31, 2, 1, Sl); rect(a, center - sg * 8, 20, 5, 12, c.hair);
    rect(a, center - 8, 14, 13, 4, c.hairHi); rect(a, center - sg * 7, 32, 5, 7, c.hair);
  } else {
    poly(a, [[25, 19], [39, 19], [44, 23], [43, 32], [39, 36], [27, 36], [21, 31], [21, 24]], K);
    poly(a, [[25, 20], [39, 20], [42, 23], [41, 31], [38, 34], [28, 34], [24, 30], [23, 24]], S);
    rect(a, 26, 22, 13, 4, Sh); rect(a, 25, 29, 4, 2, Sl); rect(a, 38, 29, 4, 2, Sl);
    rect(a, 27, 26, 3, 4, K); rect(a, 36, 26, 3, 4, K); dot(a, 28, 26, '#ffffff'); dot(a, 37, 26, '#ffffff');
    rect(a, 26, 31, 3, 1, '#e88989'); rect(a, 38, 31, 3, 1, '#e88989');
    for (const [x, y] of [[22, 17], [26, 14], [31, 15], [36, 13], [41, 16]]) rect(a, x, y, 5, 5, c.hair);
    rect(a, 25, 15, 9, 2, c.hairHi);
    rect(a, 27, 24, 3, 1, c.hair); rect(a, 36, 24, 3, 1, c.hair); rect(a, 30, 31, 6, 1, K); rect(a, 31, 32, 4, 1, Sh);
  }
  if (!back) { line(a, 28, 39, 31, 50, c.accent); line(a, 36, 39, 33, 50, c.accent); rect(a, 29, 49, 8, 8, K); rect(a, 30, 50, 6, 6, '#fff8e9'); rect(a, 31, 51, 4, 2, c.accent); }
  if (!back) { dot(a, 25, 47, c.topHi); dot(a, 26, 48, c.topHi); line(a, 23, 57, 25, 59, c.topShade); dot(a, 40, 57, c.topShade); dot(a, 41, 58, c.topShade); }
  if (back) { rect(a, 23, 42, 18, 2, c.topShade); rect(a, 24, 49, 16, 2, c.topHi); rect(a, 24, 56, 14, 2, c.topShade); }
  rect(a, 22, 57, 4, 2, c.topShade); rect(a, 40, 57, 3, 2, c.topShade);
  if (!back) { rect(a, 24, 46, 3, 4, c.topHi); rect(a, 38, 43, 4, 3, c.topShade); }
  if (!side && !back && run) arms.forEach(m => { if (m.k > 0.3) { seg(a, m.ex, m.ey, m.hx, m.hy, 3.5, K); seg(a, m.ex, m.ey, m.hx, m.hy, 2.5, S); } });
  // near arm swings over the torso in side view, opposite the near leg
  if (side) sideArm(a, 32 + sg * 1, 44, sg, -s * (run ? 0.9 : 0.55) * -1, run ? 1.3 : 0.15, false);
  OX = 0; OY = 0;
  return a;
}

// Gait cycles. Walk: 6 frames, one foot always planted, 1px bob.
// Run: 8 frames, bigger stride, high knee lift, flight frames (both feet up), 2px bounce, forward lean.
function walkPose(i, n) {
  const p = (i / n) * Math.PI * 2, s = Math.sin(p), c2 = Math.cos(p);
  return { s, liftA: Math.round(Math.max(0, c2) * 3), liftB: Math.round(Math.max(0, -c2) * 3), bob: -Math.round((1 - Math.abs(s)) * 1), lean: 0, run: false };
}
function runPose(i, n, dir) {
  const p = (i / n) * Math.PI * 2, s = Math.sin(p), c2 = Math.cos(p), sg = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const flight = Math.abs(s) < 0.5 ? 2 : 0;
  return { s, liftA: Math.round(Math.max(0, c2) * 7) + flight, liftB: Math.round(Math.max(0, -c2) * 7) + flight, bob: -Math.round((1 - Math.abs(s)) * 2) - (flight ? 1 : 0) + 1, lean: sg, run: true };
}

const dirs = ['front', 'back', 'left', 'right']; // rows: down, up, left, right
function sheet(name, n, poseFn) {
  const sh = canvas(64 * n, 96 * dirs.length);
  dirs.forEach((d, row) => { for (let i = 0; i < n; i++) { const f = draw(d, poseFn(i, n, d)); for (let y = 0; y < 96; y++) sh.p.set(f.p.subarray(y * 256, y * 256 + 256), ((row * 96 + y) * sh.w + i * 64) * 4); } });
  png(sh, path.join(out, name));
  return sh;
}
const walk = sheet('M01_walk.png', 6, walkPose), run = sheet('M01_run.png', 8, runPose);

// Self-check: every frame stays inside the 64x96 cell and keeps a foot on baseline y=91 or lifted.
function check(sh, n, name) {
  dirs.forEach((d, row) => { for (let i = 0; i < n; i++) {
    let lowest = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 64; x++) if (sh.p[((row * 96 + y) * sh.w + i * 64 + x) * 4 + 3]) lowest = Math.max(lowest, y);
    if (lowest > 91 || lowest < 80) throw new Error(`${name} ${d} frame ${i}: lowest pixel y=${lowest}`);
  } });
}
check(walk, 6, 'walk'); check(run, 8, 'run');
// Walk frames must never leave the ground (one foot planted at y=90..91).
dirs.forEach((d, row) => { for (let i = 0; i < 6; i++) { let low = 0; for (let x = 0; x < 64; x++) for (let y = 88; y < 96; y++) if (walk.p[((row * 96 + y) * walk.w + i * 64 + x) * 4 + 3]) low = Math.max(low, y); if (low !== 90) throw new Error(`walk ${d} ${i} foot y=${low}`); } });

fs.writeFileSync(path.join(out, 'M01_animations.json'), JSON.stringify({
  character: 'M01', frame: [64, 96], baseline: 91, spacing: 0, margin: 0,
  rows: ['down (front)', 'up (back)', 'left', 'right'],
  sheets: { walk: { file: 'M01_walk.png', frames: 6, fps: 8 }, run: { file: 'M01_run.png', frames: 8, fps: 12 } },
  idle: 'characters/male/M01_{front,back,left,right}.png (unchanged)',
}, null, 2));
console.log('ok: M01_walk.png (6x4), M01_run.png (8x4)');
