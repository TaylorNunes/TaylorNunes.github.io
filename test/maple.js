const canvas = document.getElementById("mapleCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ---- Tree parameters ----
const MAX_DEPTH = 8;
const LEAF_COLORS = ["#ffb347", "#ff6f61", "#ff3b3f", "#c42448", "#a02135"];

// Recursive branch drawing
function drawBranch(x, y, length, angle, depth, time) {
  if (depth < 0 || length < 2) return;

  // wind sway (slightly stronger in outer branches)
  const swayStrength = (MAX_DEPTH - depth + 1) * 0.004;
  const sway = Math.sin(time * 0.001 + depth * 0.8) * swayStrength * Math.PI;

  const a = angle + sway;

  const x2 = x + Math.cos(a) * length;
  const y2 = y + Math.sin(a) * length;

  // Branch style: thicker at base, thinner at tips
  ctx.lineWidth = Math.max(1, (depth + 1) * 0.9);
  ctx.strokeStyle = "#3a1f1b";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (depth === 0 || length < 10) {
    drawLeaf(x2, y2, a, depth, time);
    return;
  }

  // Split into sub-branches
  const nextLength = length * (0.7 + Math.random() * 0.05);
  const spread = 0.25 + Math.random() * 0.05; // radians

  // main left/right branches
  drawBranch(x2, y2, nextLength, a - spread, depth - 1, time);
  drawBranch(x2, y2, nextLength, a + spread, depth - 1, time);

  // Occasionally add a third small off-shoot for a more organic canopy
  if (Math.random() < 0.2 && depth > 2) {
    drawBranch(x2, y2, nextLength * 0.7, a + (Math.random() - 0.5) * 0.4, depth - 2, time);
  }
}

// Stylized leaf
function drawLeaf(x, y, angle, depth, time) {
  const color = LEAF_COLORS[(depth + Math.floor(time * 0.005)) % LEAF_COLORS.length];
  const size = 4 + (MAX_DEPTH - depth) * 0.8;

  // slight flutter animation
  const flutter = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.4;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + flutter);

  ctx.fillStyle = color;
  ctx.beginPath();
  // simple "maple-ish" leaf: a pointed oval made of two curves
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size, -size * 0.3, 0, size);
  ctx.quadraticCurveTo(-size, -size * 0.3, 0, -size);
  ctx.fill();

  ctx.restore();
}

function drawScene(time) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  // clear
  ctx.clearRect(0, 0, w, h);

  // subtle ground
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  // draw multiple maples with slight variations
  const treeCount = 3;
  for (let i = 0; i < treeCount; i++) {
    const offsetX = w * (0.25 + 0.25 * i);
    const baseHeight = h * 0.85;

    ctx.save();
    ctx.translate(offsetX, baseHeight);

    const baseLength = h * (0.22 + i * 0.02);
    const trunkAngle = -Math.PI / 2 + (i - 1) * 0.08; // spread out trunks a bit

    drawBranch(0, 0, baseLength, trunkAngle, MAX_DEPTH, time);
    ctx.restore();
  }

  requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);
