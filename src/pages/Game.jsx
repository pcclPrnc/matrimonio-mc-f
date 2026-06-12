import { useEffect, useRef, useState, useCallback } from "react";
import { COLORS, FONTS } from "../designSystem";
import { useSite } from "../context/SiteContext";

// ── Constants ────────────────────────────────────────────────
const CANVAS_W  = 800;
const CANVAS_H  = 400;
const GRAVITY   = 0.5;
const JUMP_VY   = -11;
const LEVEL_W   = 4000;
const WEDDING   = new Date("2026-10-02T00:00:00");

function daysUntil() {
  const ms = WEDDING - new Date();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// ── Level data ───────────────────────────────────────────────
const PLATFORMS = [
  // Terreno diviso per creare la fossa — gap originale 150px, ridotto del 7% → 139px
  { x: 0,    y: 360, w: 1311, h: 40, tipo: "terreno" },
  { x: 1450, y: 360, w: 650,  h: 40, tipo: "terreno" },
  { x: 2100, y: 360, w: 1900, h: 40, tipo: "terreno" },
  // Piattaforme mattone
  { x: 300,  y: 290, w: 120,  h: 20, tipo: "mattone" },
  { x: 500,  y: 230, w: 100,  h: 20, tipo: "mattone" },
  { x: 700,  y: 280, w: 80,   h: 20, tipo: "mattone" },
  { x: 900,  y: 200, w: 140,  h: 20, tipo: "mattone" },
  { x: 1100, y: 260, w: 100,  h: 20, tipo: "mattone" },
  { x: 1600, y: 280, w: 120,  h: 20, tipo: "mattone" },
  { x: 1800, y: 220, w: 100,  h: 20, tipo: "mattone" },
  { x: 2300, y: 280, w: 160,  h: 20, tipo: "mattone" },
  { x: 2586, y: 230, w: 120,  h: 20, tipo: "mattone" },
  { x: 2900, y: 290, w: 100,  h: 20, tipo: "mattone" },
];

const INIT_HEARTS = [
  { x: 360, y: 270 }, { x: 550, y: 210 }, { x: 740, y: 260 },
  { x: 970, y: 180 }, { x: 1150, y: 240 }, { x: 1530, y: 340 },
  { x: 1660, y: 258 }, { x: 1850, y: 198 }, { x: 2360, y: 258 },
  { x: 2660, y: 208 }, { x: 2950, y: 268 }, { x: 3200, y: 338 },
].map(h => ({ ...h, collected: false }));

const INIT_ENEMIES = [
  { x: 420, y: 344, w: 16, h: 16, vx: -1.2, minX: -2000, maxX: 500, calm: false }, // marcia verso il player, scompare a sinistra
  { x: 870, y: 344, w: 16, h: 16, vx: -0.8, minX: 760, maxX: 880, calm: false },
  { x: 1500, y: 344, w: 16, h: 16, vx: 0.7, minX: 1452, maxX: 1700, calm: false },
  { x: 2400, y: 344, w: 16, h: 16, vx: 0.8, minX: 2300, maxX: 2520, calm: false },
  { x: 2850, y: 344, w: 16, h: 16, vx: -0.7, minX: 2720, maxX: 2870, calm: false },
];

const CLOUDS = [
  { x: 80,   y: 38,  w: 110, h: 42 },
  { x: 380,  y: 58,  w: 85,  h: 32 },
  { x: 680,  y: 28,  w: 125, h: 48 },
  { x: 1020, y: 52,  w: 90,  h: 36 },
  { x: 1380, y: 38,  w: 115, h: 44 },
  { x: 1720, y: 62,  w: 88,  h: 33 },
  { x: 2080, y: 32,  w: 105, h: 40 },
  { x: 2440, y: 50,  w: 98,  h: 38 },
  { x: 2820, y: 40,  w: 118, h: 46 },
  { x: 3180, y: 55,  w: 90,  h: 35 },
  { x: 3550, y: 36,  w: 108, h: 42 },
];

// t: 0 = cipresso, 1 = quercia, 2 = ulivo
const TREES = [
  { x:  140, t: 0 }, { x:  240, t: 2 }, { x:  430, t: 1 },
  { x:  610, t: 0 }, { x:  830, t: 2 }, { x: 1060, t: 1 },
  { x: 1510, t: 0 }, { x: 1730, t: 2 }, { x: 1910, t: 1 },
  { x: 2160, t: 0 }, { x: 2460, t: 2 }, { x: 2710, t: 1 },
  { x: 2990, t: 0 }, { x: 3210, t: 2 }, { x: 3460, t: 1 },
  { x: 3700, t: 0 },
];

// ── Player factory ───────────────────────────────────────────
function mkPlayer() {
  return {
    x: 60, y: 305, vx: 0, vy: 0,
    onGround: false, facing: 1,
    frame: 0, frameTick: 0,
    idleTick: 0, breathScale: 1.0, breathDir: -1,
  };
}

// ── Draw: sky gradient ───────────────────────────────────────
function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0,   "#3A7DB5");
  g.addColorStop(0.5, "#87CEEB");
  g.addColorStop(1,   "#C0E8F8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

// ── Draw: cloud ──────────────────────────────────────────────
function drawCloud(ctx, x, y, w, h) {
  ctx.fillStyle = "rgba(255,255,255,0.93)";
  [[0.28, 0.62, 0.27, 0.46],[0.50, 0.44, 0.32, 0.54],[0.73, 0.60, 0.24, 0.43]].forEach(
    ([ex, ey, rx, ry]) => {
      ctx.beginPath();
      ctx.ellipse(x + w * ex, y + h * ey, w * rx, h * ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  );
}

// ── Draw: cipresso (gy = y pavimento canvas) ─────────────────
// Tronco ancorato a gy, fogliame che sale verso l'alto.
function drawCypress(ctx, x, gy) {
  // Tronco — da gy a gy-42
  ctx.fillStyle = "#5C3A1E";
  ctx.fillRect(x - 3, gy - 42, 6, 42);
  ctx.fillStyle = "#4A2E12";
  ctx.fillRect(x - 3, gy - 42, 2, 42); // ombra lato sinistro
  // 9 strati di fogliame che si restringono verso l'alto
  const widths = [20, 18, 16, 14, 12, 10, 8, 6, 4];
  widths.forEach((w, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#2D5A1B" : "#3A6B25";
    ctx.fillRect(x - w / 2, gy - 42 - (i + 1) * 11, w, 13);
  });
  // punta
  ctx.fillStyle = "#4A7A30";
  ctx.fillRect(x - 1, gy - 42 - widths.length * 11 - 6, 3, 8);
}

// ── Draw: quercia (albero tondo, larghe chiome) ───────────────
function drawOak(ctx, x, gy) {
  // Radici emergenti dal terreno
  ctx.fillStyle = "#4A2E10";
  ctx.fillRect(x - 11, gy - 7,  5, 7);
  ctx.fillRect(x +  6, gy - 5,  5, 5);
  ctx.fillRect(x -  3, gy - 3,  6, 3);
  // Tronco — da gy a gy-34
  ctx.fillStyle = "#5C3A1E";
  ctx.fillRect(x - 6, gy - 34, 12, 34);
  ctx.fillStyle = "#4A2E10";
  ctx.fillRect(x - 6, gy - 34,  3, 34); // ombra
  ctx.fillStyle = "#7A5030";
  ctx.fillRect(x + 3, gy - 30,  2, 22); // riflesso
  // Chioma — pixel art a blob sovrapposti
  const base = gy - 34;
  ctx.fillStyle = "#2D5A1B";
  ctx.fillRect(x - 28, base - 30, 56, 34);
  ctx.fillRect(x - 22, base - 44, 44, 18);
  ctx.fillRect(x - 14, base - 52, 28,  12);
  ctx.fillRect(x - 32, base - 18, 16,  20);
  ctx.fillRect(x + 16, base - 18, 16,  20);
  ctx.fillStyle = "#3A6B25";
  ctx.fillRect(x - 24, base - 34, 48,  30);
  ctx.fillRect(x - 18, base - 46, 36,  16);
  ctx.fillRect(x -  8, base - 54, 16,  12);
  ctx.fillRect(x - 28, base - 20, 12,  16);
  ctx.fillRect(x + 16, base - 20, 12,  16);
  // Luci in cima
  ctx.fillStyle = "#4A7A30";
  ctx.fillRect(x - 12, base - 54,  8, 6);
  ctx.fillRect(x +  4, base - 50,  8, 6);
  ctx.fillRect(x -  4, base - 42, 10, 6);
  ctx.fillRect(x - 20, base - 30,  8, 6);
  ctx.fillRect(x + 12, base - 28,  8, 6);
}

// ── Draw: ulivo (piccolo, nodoso, foglie argentate) ───────────
function drawOlive(ctx, x, gy) {
  // Radici nodose
  ctx.fillStyle = "#6B4C2A";
  ctx.fillRect(x - 8, gy - 5, 4, 5);
  ctx.fillRect(x + 4, gy - 4, 4, 4);
  // Tronco tortile — asimmetrico
  ctx.fillStyle = "#6B4C2A";
  ctx.fillRect(x - 4, gy - 30, 8, 30);
  ctx.fillStyle = "#5A3D20";
  ctx.fillRect(x + 2, gy - 30, 3, 30);
  ctx.fillStyle = "#7A5A38";
  ctx.fillRect(x - 4, gy - 28, 2, 20);
  // Rami sporgenti visibili
  ctx.fillStyle = "#6B4C2A";
  ctx.fillRect(x - 14, gy - 24, 11, 4);
  ctx.fillRect(x +  3, gy - 20, 11, 4);
  // Chioma — grappoli irregolari, grigio-verde (foglie argentate)
  ctx.fillStyle = "#4D6B3A";
  ctx.fillRect(x - 22, gy - 56, 20, 28);
  ctx.fillRect(x +  2, gy - 52, 20, 26);
  ctx.fillRect(x - 12, gy - 62, 26, 16);
  ctx.fillRect(x - 18, gy - 44, 12, 16);
  ctx.fillRect(x +  6, gy - 40, 12, 16);
  ctx.fillStyle = "#607A4A";
  ctx.fillRect(x - 20, gy - 54, 16, 24);
  ctx.fillRect(x +  4, gy - 50, 16, 22);
  ctx.fillRect(x - 10, gy - 60, 22, 14);
  // Luci argentate delle foglie d'ulivo
  ctx.fillStyle = "#8EAA70";
  ctx.fillRect(x - 18, gy - 58,  8, 5);
  ctx.fillRect(x +  8, gy - 54,  8, 5);
  ctx.fillRect(x -  6, gy - 64, 10, 5);
  ctx.fillRect(x - 16, gy - 46,  6, 4);
  ctx.fillRect(x + 10, gy - 42,  6, 4);
  ctx.fillStyle = "#A8C488";
  ctx.fillRect(x - 16, gy - 60,  4, 3);
  ctx.fillRect(x +  8, gy - 56,  4, 3);
  ctx.fillRect(x -  4, gy - 66,  5, 3);
  // Olive (piccoli frutti scuri)
  ctx.fillStyle = "#1A3A0A";
  ctx.fillRect(x - 14, gy - 46, 4, 4);
  ctx.fillRect(x +  8, gy - 42, 4, 4);
  ctx.fillRect(x -  4, gy - 54, 4, 4);
}

// ── Draw: brick platform ─────────────────────────────────────
function drawPlatform(ctx, x, y, w, h) {
  ctx.fillStyle = "#C4956A";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#D4A87C";
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = "#8B5E3C";
  for (let row = 0; row * 8 <= h; row++) ctx.fillRect(x, y + row * 8, w, 1);
  const bW = 24;
  for (let row = 0; row * 8 < h; row++) {
    const off = (row % 2) * (bW / 2);
    for (let bx = x - (off % bW); bx < x + w; bx += bW) {
      if (bx > x) ctx.fillRect(bx, y + row * 8, 1, 8);
    }
  }
}

// ── Draw: terrain ────────────────────────────────────────────
function drawTerrain(ctx, x, y, w, h) {
  ctx.fillStyle = "#5D8A3C";
  ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = "#4A6E2E";
  ctx.fillRect(x, y + 7, w, 5);
  ctx.fillStyle = "#A0752A";
  ctx.fillRect(x, y + 12, w, h - 12);
  ctx.fillStyle = "#7A5820";
  for (let dy = 12; dy < h; dy += 8) ctx.fillRect(x, y + dy, w, 1);
}

// ── Draw: castle ─────────────────────────────────────────────
function drawCastle(ctx, cx, groundY) {
  const y = groundY;
  const brickRow = (bx, by, bw, bh) => {
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#6B5A42";
    for (let r = 0; r * 14 < bh; r++) {
      const off = (r % 2) * 12;
      for (let c = bx - (off % 24); c < bx + bw; c += 24)
        if (c > bx) ctx.fillRect(c, by + r * 14, 1, 14);
      ctx.fillRect(bx, by + r * 14, bw, 1);
    }
    ctx.fillStyle = "#A08060";
    ctx.fillRect(bx, by, bw, 2);
  };

  // Main body
  brickRow(cx, y - 110, 200, 110);

  // Battlements main
  ctx.fillStyle = "#8B7355";
  for (let i = 0; i < 5; i++) ctx.fillRect(cx + i * 40, y - 132, 22, 22);

  // Left tower
  brickRow(cx - 22, y - 155, 52, 155);
  ctx.fillStyle = "#8B7355";
  for (let i = 0; i < 3; i++) ctx.fillRect(cx - 22 + i * 17, y - 172, 13, 18);

  // Right tower
  brickRow(cx + 170, y - 155, 52, 155);
  ctx.fillStyle = "#8B7355";
  for (let i = 0; i < 3; i++) ctx.fillRect(cx + 170 + i * 17, y - 172, 13, 18);

  // Arched door
  ctx.fillStyle = "#2C1A0E";
  ctx.fillRect(cx + 78, y - 62, 44, 62);
  ctx.beginPath();
  ctx.arc(cx + 100, y - 62, 22, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#3A2310";
  ctx.fillRect(cx + 90, y - 55, 20, 2);

  // Windows
  [[cx + 18, y - 92],[cx + 164, y - 92]].forEach(([wx, wy]) => {
    ctx.fillStyle = "#C8B99A"; ctx.fillRect(wx, wy, 22, 26);
    ctx.fillStyle = "#2C1A0E"; ctx.fillRect(wx + 3, wy + 3, 16, 20);
    ctx.fillStyle = "#C8B99A";
    ctx.fillRect(wx + 10, wy + 3, 2, 20);
    ctx.fillRect(wx + 3, wy + 12, 16, 2);
  });

  // Ivy
  ctx.fillStyle = "#2D5A1B";
  [[cx + 5, y - 50],[cx + 195, y - 60],[cx + 12, y - 30]].forEach(([vx, vy]) => {
    ctx.beginPath(); ctx.ellipse(vx, vy, 8, 14, -0.4, 0, Math.PI * 2); ctx.fill();
  });
}

// ── Draw: checkpoint flag ────────────────────────────────────
function drawFlag(ctx, x, y, reached) {
  ctx.fillStyle = "#888888";
  ctx.fillRect(x, y - 44, 3, 44);
  ctx.fillStyle = reached ? "#FFD700" : "#CC3333";
  ctx.fillRect(x + 3, y - 44, 20, 14);
  ctx.fillStyle = reached ? "#FFF8DC" : "#FF6666";
  ctx.fillRect(x + 7, y - 41, 8, 8);
  if (reached) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "left";
    ctx.fillText("✓", x + 7, y - 34);
  }
}

// ── Draw: pixel heart ────────────────────────────────────────
const HEART_PX = [
  [1,0],[2,0],[4,0],[5,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],
  [2,4],[3,4],[4,4],
  [3,5],
];
function drawPixelHeart(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  HEART_PX.forEach(([px, py]) => ctx.fillRect(x + px * s, y + py * s, s, s));
}

// ── Draw: enemy agitated heart ───────────────────────────────
function drawMushroom(ctx, x, y, calm, tick) {
  const frame  = Math.floor(tick / 8) % 2;
  const gy     = y + 16;   // piedi a y+16 = terreno (360 quando y=344)
  const mx     = x + 8;    // centro x

  ctx.save();

  // ── Cappello ────────────────────────────────────────────────
  ctx.fillStyle = calm ? "#C8961E" : "#BB2200";
  ctx.fillRect(mx - 4, gy - 20,  8,  2);  // punta
  ctx.fillRect(mx - 6, gy - 18, 12,  2);
  ctx.fillRect(mx - 7, gy - 16, 14,  2);
  ctx.fillRect(mx - 8, gy - 14, 16,  6);  // falda larga
  // ombra laterale sinistra
  ctx.fillStyle = calm ? "#9A6E0A" : "#880000";
  ctx.fillRect(mx - 8, gy - 14,  4,  6);
  // puntini bianchi
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(mx - 6, gy - 17,  3,  3);  // spot sinistra
  ctx.fillRect(mx + 3, gy - 16,  3,  3);  // spot destra

  // ── Occhi (nella falda del cappello) ────────────────────────
  const eyeY = gy - 10;
  ctx.fillStyle = "#FFFFE8";
  ctx.fillRect(mx - 5, eyeY, 3, 3);
  ctx.fillRect(mx + 2, eyeY, 3, 3);
  ctx.fillStyle = "#000000";
  ctx.fillRect(mx - 5, eyeY + 1, 3, 2);
  ctx.fillRect(mx + 2, eyeY + 1, 3, 2);
  if (!calm) {
    // sopracciglia arrabbiate
    ctx.fillStyle = "#440000";
    ctx.fillRect(mx - 6, eyeY - 2, 4, 1);
    ctx.fillRect(mx + 2, eyeY - 2, 4, 1);
    ctx.fillRect(mx - 6, eyeY - 1, 2, 1);
    ctx.fillRect(mx + 4, eyeY - 1, 2, 1);
  }

  // ── Corpo ───────────────────────────────────────────────────
  ctx.fillStyle = calm ? "#D2AA70" : "#C08050";
  ctx.fillRect(mx - 5, gy - 7, 10, 4);
  // boccuccia
  ctx.fillStyle = calm ? "#7A4020" : "#440800";
  ctx.fillRect(mx - 3, gy - 5,  6, 1);

  // ── Piedi alternati ─────────────────────────────────────────
  ctx.fillStyle = "#1A1A1A";
  if (frame === 0) {
    ctx.fillRect(mx - 7, gy - 3, 5, 3);   // piede sinistro avanti
    ctx.fillRect(mx + 2, gy - 3, 5, 3);
  } else {
    ctx.fillRect(mx - 6, gy - 3, 5, 3);
    ctx.fillRect(mx + 1, gy - 3, 5, 3);   // piede destro avanti
  }

  ctx.restore();
}

// ── Draw: groom sprite ───────────────────────────────────────
function drawGroom(ctx, x, y, frame, jumping, impatient, breathScale, facing, faceImg) {
  ctx.save();
  // Apply breath scale from center of sprite
  ctx.translate(x + 10, y + 14);
  ctx.scale(facing, breathScale);
  ctx.translate(-10, -14);

  // ── Legs
  ctx.fillStyle = "#111111";
  if (jumping) {
    ctx.fillRect(4, 20, 12, 8);
    ctx.fillRect(3, 26, 8, 3);
    ctx.fillRect(9, 26, 8, 3);
  } else if (frame === 0) {
    ctx.fillRect(4,  20, 5, 9);
    ctx.fillRect(11, 20, 5, 9);
    ctx.fillRect(3,  28, 7, 3);
    ctx.fillRect(10, 28, 7, 3);
  } else {
    ctx.fillRect(4,  20, 5, 7);
    ctx.fillRect(10, 18, 5, 9);
    ctx.fillRect(3,  26, 7, 3);
    ctx.fillRect(9,  26, 7, 3);
  }

  // ── Tuxedo body
  ctx.fillStyle = "#111111";
  ctx.fillRect(3, 10, 14, 11);
  // White shirt front
  ctx.fillStyle = "#F0F0F0";
  ctx.fillRect(7, 10, 6, 10);
  // Shirt buttons
  ctx.fillStyle = "#CCCCCC";
  ctx.fillRect(9, 12, 2, 1);
  ctx.fillRect(9, 15, 2, 1);
  // Lapels
  ctx.fillStyle = "#1C1C1C";
  ctx.fillRect(3, 10, 4, 9);
  ctx.fillRect(13, 10, 4, 9);
  // Bow-tie
  ctx.fillStyle = "#AA2233";
  ctx.fillRect(7, 11, 3, 2);
  ctx.fillRect(10, 11, 3, 2);
  ctx.fillStyle = "#CC3344";
  ctx.fillRect(9, 12, 2, 1);

  // ── Arms
  if (jumping) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(-3, 8, 6, 5);
    ctx.fillRect(17, 8, 6, 5);
    ctx.fillStyle = "#F4C49C";
    ctx.fillRect(-4, 5, 6, 5);
    ctx.fillRect(18, 5, 6, 5);
  } else if (impatient) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(-2, 10, 5, 7);
    ctx.fillRect(17, 10, 5, 7);
    ctx.fillStyle = "#F4C49C";
    ctx.fillRect(-3, 14, 5, 4);
    ctx.fillRect(16, 8,  6, 4);
    // Watch
    ctx.fillStyle = "#C9A84C";
    ctx.fillRect(16, 8, 5, 4);
    ctx.fillStyle = "#FFF8DC";
    ctx.fillRect(17, 9, 3, 2);
    ctx.fillStyle = "#111";
    ctx.fillRect(18, 10, 1, 1);
  } else {
    ctx.fillStyle = "#111111";
    ctx.fillRect(-2, 10, 5, 7);
    ctx.fillRect(17, 10, 5, 7);
    ctx.fillStyle = "#F4C49C";
    ctx.fillRect(-3, 15, 5, 4);
    ctx.fillRect(18, 15, 5, 4);
  }

  // ── Head
  ctx.fillStyle = "#F4C49C";
  ctx.beginPath();
  ctx.arc(10, 7, 8, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.fillStyle = "#E8B88A";
  ctx.fillRect(1, 5, 2, 4);
  ctx.fillRect(17, 5, 2, 4);

  // Hair
  ctx.fillStyle = "#2A1505";
  ctx.fillRect(3, 0, 14, 5);
  ctx.fillRect(2, 3, 3, 5);
  ctx.fillRect(15, 3, 2, 4);

  // Eyes
  ctx.fillStyle = "#1C0E05";
  if (impatient) {
    // Looking sideways at watch
    ctx.fillRect(12, 6, 2, 2);
    ctx.fillRect(7,  6, 2, 2);
  } else {
    ctx.fillRect(6,  6, 2, 2);
    ctx.fillRect(12, 6, 2, 2);
  }

  // Eyebrows
  ctx.fillStyle = "#2A1505";
  ctx.fillRect(5, 4, 4, 1);
  ctx.fillRect(11, 4, 4, 1);

  // Mouth/smile
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(7, 11, 6, 1);
  ctx.fillRect(6, 10, 2, 1);
  ctx.fillRect(12, 10, 2, 1);

  ctx.restore();

  // Face photo overlay (clipped circle)
  if (faceImg && faceImg.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + (facing < 0 ? 10 : 10), y + 7, 7, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceImg, x + 3, y, 14, 14);
    ctx.restore();
  }
}

// ── Draw: bride sprite (capelli scuri lunghi, senza velo) ────
function drawBride(ctx, x, y, surprised, swayAngle, brideImg) {
  const H  = "#1A0A00";  // capelli scuri
  const H2 = "#2E1408";  // riflesso capelli

  ctx.save();
  ctx.translate(x + 9, y + 15);
  ctx.rotate(swayAngle);
  ctx.translate(-9, -15);

  // ── 1. Gonna A-line ─────────────────────────────────────────
  ctx.fillStyle = "#F8F8FF";
  ctx.fillRect(2, 16, 14, 4);   // vita stretta
  ctx.fillRect(1, 20, 16, 4);   // fianchi
  ctx.fillRect(0, 24, 18, 4);   // orlo
  ctx.fillRect(-1, 27, 20, 3);  // bordo piede
  ctx.fillStyle = "#DCDCF0";    // ombreggiatura laterale
  ctx.fillRect(2, 17, 2, 12);
  ctx.fillRect(14, 17, 2, 12);
  ctx.fillStyle = "#F0F0FA";    // balza
  ctx.fillRect(0, 24, 18, 1);

  // ── 2. Corpetto ─────────────────────────────────────────────
  ctx.fillStyle = "#F2F2FA";
  ctx.fillRect(3, 10, 12, 7);
  ctx.fillStyle = "#E8E8F5";
  ctx.fillRect(3, 12, 2, 5);    // ombra sinistra
  ctx.fillStyle = "#F8F0EC";    // scollo
  ctx.fillRect(6, 10, 6, 3);

  // ── 3. Braccia ──────────────────────────────────────────────
  ctx.fillStyle = "#F4C49C";
  ctx.fillRect(-2, 12, 5, 5);
  ctx.fillRect(15, 12, 5, 5);

  // ── 4. Bouquet bianco ───────────────────────────────────────
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-4, 15, 6, 6);
  ctx.fillStyle = "#F0F0F0"; ctx.fillRect(-3, 16, 4, 4);
  ctx.fillStyle = "#E0E0E0"; ctx.fillRect(-2, 17, 2, 2);
  ctx.fillStyle = "#D4EED4"; ctx.fillRect(-4, 17, 2, 2); // fogliolina
  ctx.fillStyle = "#5D8A3C"; ctx.fillRect(-2, 21, 2, 3); // stelo

  // ── 5. Capelli lunghi ai lati (−35% rispetto alla versione precedente)
  ctx.fillStyle = H;
  // ciocca sinistra: y=2→15
  ctx.fillRect(0,  2, 4, 5);   // larga alla radice
  ctx.fillRect(1,  7, 3, 5);   // media
  ctx.fillRect(1, 12, 2, 3);   // punta affusolata
  // ciocca destra speculare
  ctx.fillRect(14,  2, 4, 5);
  ctx.fillRect(14,  7, 3, 5);
  ctx.fillRect(15, 12, 2, 3);
  // riflesso
  ctx.fillStyle = H2;
  ctx.fillRect(1, 3, 2, 4);
  ctx.fillRect(15, 3, 2, 4);

  // ── 6. Testa ────────────────────────────────────────────────
  ctx.fillStyle = "#F4C49C";
  ctx.beginPath();
  ctx.arc(9, 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#E8B88A";
  ctx.fillRect(1, 5, 2, 4);    // orecchio

  // ── 7. Capelli sulla testa ──────────────────────────────────
  ctx.fillStyle = H;
  ctx.fillRect(3, -1, 12, 4);  // corona
  ctx.fillRect(2,  1, 14, 3);  // più larga al centro
  ctx.fillRect(1,  2, 3,  7);  // ciuffo sinistro
  ctx.fillRect(14, 2, 3,  7);  // ciuffo destro
  ctx.fillStyle = H2;
  ctx.fillRect(6, -1, 6, 2);   // riflesso cima
  ctx.fillRect(3,  0, 2, 2);
  ctx.fillRect(13, 0, 2, 2);

  // ── 8. Occhi + sopracciglia ─────────────────────────────────
  ctx.fillStyle = "#1C0E05";
  if (surprised) {
    ctx.beginPath(); ctx.arc(6,  6, 2,   0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 6, 2,   0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(6,  5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, 5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8B4513";
    ctx.beginPath(); ctx.arc(9, 11, 2.5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(5, 6, 2, 2);
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(6, 10, 6, 1);
    ctx.fillRect(5, 9, 2, 1);
    ctx.fillRect(11, 9, 2, 1);
  }
  ctx.fillStyle = H;
  ctx.fillRect(4, 3, 4, 1);    // sopracciglio sx
  ctx.fillRect(10, 3, 4, 1);   // sopracciglio dx

  ctx.restore();

  // Foto circolare sovrapposta
  if (brideImg && brideImg.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + 9, y + 6, 6, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(brideImg, x + 3, y, 12, 12);
    ctx.restore();
  }
}

// ── Draw: speech bubble ──────────────────────────────────────
function drawBubble(ctx, cx, baseY, text) {
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const tw = ctx.measureText(text).width;
  const bw = tw + 18;
  const bh = 26;
  const bx = cx - bw / 2;
  const by = baseY - bh - 14;

  ctx.fillStyle = "#FFFFF8";
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1.5;

  // Bubble body (manual rounded rect)
  const r = 5;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bw - r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
  ctx.lineTo(bx + bw, by + bh - r);
  ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
  ctx.lineTo(bx + r, by + bh);
  ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
  ctx.lineTo(bx, by + r);
  ctx.arcTo(bx, by, bx + r, by, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.fillStyle = "#FFFFF8";
  ctx.beginPath();
  ctx.moveTo(cx - 6, by + bh);
  ctx.lineTo(cx + 6, by + bh);
  ctx.lineTo(cx + 2, by + bh + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 6, by + bh);
  ctx.lineTo(cx + 2, by + bh + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6, by + bh);
  ctx.lineTo(cx + 2, by + bh + 8);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.fillText(text, cx, by + bh / 2);
}

// ── Game state factory ───────────────────────────────────────
function mkState() {
  return {
    player:           mkPlayer(),
    checkpoint:       { x: 60, y: 305 },
    checkpointPassed: false,
    hearts:           INIT_HEARTS.map(h => ({ ...h })),
    enemies:          INIT_ENEMIES.map(e => ({ ...e })),
    cam:              { x: 0 },
    tick:             0,
    collected:        0,
    bride: {
      x: 3680, y: 360,    // al portone del castello (world x = 3580+100), ancorata al terreno
      visible: false,     // appare solo quando lo sposo raggiunge l'ultimo albero
      emerged: false,     // ha finito di camminare verso l'uscita
      surprised: false,
      walkingOff: false,
      gone: false,
      swayTick: 0,
    },
    bubbleTimer:  0,
    endSequence:  false,
    endTimer:     0,
    particles:    [],
    keys: { left: false, right: false, jump: false, jumpConsumed: true },
  };
}

// ── React component ──────────────────────────────────────────
export default function Game() {
  const { siteData } = useSite();
  const canvasRef    = useRef(null);
  const wrapRef      = useRef(null);
  const stateRef     = useRef(null);
  const rafRef       = useRef(null);
  const groomImg     = useRef(null);
  const brideImg     = useRef(null);

  const [collected,  setCollected]  = useState(0);
  const [showEnd,    setShowEnd]    = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Offscreen sprite caches — built once, reused every frame
  const skyCache         = useRef(null);
  const treeCache        = useRef([]);   // indexed by tree type 0/1/2
  const cloudCache       = useRef([]);   // indexed by CLOUDS order
  const terrainCache     = useRef(null); // full 4000×400 level terrain + platforms + castle
  const heartSpriteCache = useRef(null); // 14×12 pixel heart sprite
  const mushroomCache    = useRef(null); // { angry:[frame0,frame1], calm:[frame0,frame1] }

  // Load face images
  useEffect(() => {
    if (siteData.groom_face_url) {
      const img = new Image();
      img.src = siteData.groom_face_url;
      groomImg.current = img;
    }
    if (siteData.bride_face_url) {
      const img = new Image();
      img.src = siteData.bride_face_url;
      brideImg.current = img;
    }
  }, [siteData.groom_face_url, siteData.bride_face_url]);

  // Pre-render static sprites to offscreen canvases (runs once on mount)
  useEffect(() => {
    // ── Sky ─────────────────────────────────────────────────────
    const skyOC = document.createElement("canvas");
    skyOC.width = CANVAS_W; skyOC.height = CANVAS_H;
    drawSky(skyOC.getContext("2d"));
    skyCache.current = skyOC;

    // ── Trees (3 types) ─────────────────────────────────────────
    // w/h = canvas size, dx = horizontal center, dy = ground y inside canvas
    const treeSpecs = [
      { fn: drawCypress, w: 32,  h: 162, dx: 15, dy: 157 }, // type 0
      { fn: drawOak,     w: 76,  h: 108, dx: 36, dy: 102 }, // type 1
      { fn: drawOlive,   w: 54,  h: 76,  dx: 26, dy: 72  }, // type 2
    ];
    treeCache.current = treeSpecs.map(({ fn, w, h, dx, dy }) => {
      const oc = document.createElement("canvas");
      oc.width = w; oc.height = h;
      fn(oc.getContext("2d"), dx, dy);
      return { canvas: oc, dx, h };
    });

    // ── Clouds (one sprite per cloud) ───────────────────────────
    cloudCache.current = CLOUDS.map(c => {
      const px = Math.ceil(c.w * 0.29) + 2; // horizontal bleed
      const py = Math.ceil(c.h * 0.12) + 2; // vertical bleed
      const oc = document.createElement("canvas");
      oc.width  = c.w + px * 2;
      oc.height = c.h + py * 2;
      drawCloud(oc.getContext("2d"), px, py, c.w, c.h);
      return { canvas: oc, px, py };
    });

    // ── Terrain + platforms + castle (LEVEL_W × CANVAS_H) ────────
    // Bakes all static geometry into one wide offscreen canvas so the
    // render loop does 1 drawImage instead of 50+ fillRect calls per frame.
    // "Air" pixels stay transparent, compositing correctly over sky/trees.
    const terrOC = document.createElement("canvas");
    terrOC.width  = LEVEL_W;
    terrOC.height = CANVAS_H;
    const tctx = terrOC.getContext("2d");
    for (const pl of PLATFORMS) {
      if (pl.tipo === "terreno") drawTerrain(tctx, pl.x, pl.y, pl.w, pl.h);
      else                       drawPlatform(tctx, pl.x, pl.y, pl.w, pl.h);
    }
    drawCastle(tctx, 3580, 360);
    terrainCache.current = terrOC;

    // ── Pixel heart sprite (14 × 12) ─────────────────────────────
    // 27 fillRect per heart → 1 drawImage. With 12 hearts in the level
    // this alone saves ~324 fillRect calls per frame.
    const hOC = document.createElement("canvas");
    hOC.width = 14; hOC.height = 12;
    drawPixelHeart(hOC.getContext("2d"), 0, 0, 2, "#C9A84C");
    heartSpriteCache.current = hOC;

    // ── Mushroom sprites (4 variants: angry/calm × frame 0/1) ─────
    // ~15 fillRect+save/restore per enemy → 1 drawImage.
    // Draw at (x=0, y=4) so the hat-top lands at canvas-y=0 (gy-20=0).
    const mkMush = (calm, tick) => {
      const oc = document.createElement("canvas");
      oc.width = 18; oc.height = 22;
      drawMushroom(oc.getContext("2d"), 0, 4, calm, tick);
      return oc;
    };
    mushroomCache.current = {
      angry: [mkMush(false, 0), mkMush(false, 8)],
      calm:  [mkMush(true,  0), mkMush(true,  8)],
    };
  }, []);

  // Responsive scale
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setCanvasScale(Math.min(1, w / CANVAS_W));
    });
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Update ──────────────────────────────────────────────────
  const update = useCallback((s) => {
    if (s.endSequence) {
      s.endTimer++;

      // Spawn heart particles
      if (s.endTimer % 3 === 0 && s.particles.length < 90) {
        for (let i = 0; i < 4; i++) {
          s.particles.push({
            x:     Math.random() * CANVAS_W,
            y:     -12,
            vx:    (Math.random() - 0.5) * 2.5,
            vy:    Math.random() * 1.5 + 1,
            alpha: 1,
            size:  Math.floor(Math.random() * 3) + 1,
            color: ["#C9A84C","#D4849A","#FF6B8A","#FFB347","#FFD700"][Math.floor(Math.random() * 5)],
          });
        }
      }
      s.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.alpha -= 0.004;
      });
      s.particles = s.particles.filter(p => p.alpha > 0.05);

      if (s.endTimer === 90) setShowEnd(true);
      return;
    }

    s.tick++;
    const p = s.player;
    const k = s.keys;

    // ── Input → velocity
    const spd = 3.2;
    let moving = false;
    if (k.left)  { p.vx = -spd; p.facing = -1; moving = true; }
    if (k.right) { p.vx =  spd; p.facing =  1; moving = true; }
    if (!k.left && !k.right) p.vx *= 0.65;

    if (!k.jumpConsumed && k.jump && p.onGround) {
      p.vy          = JUMP_VY;
      p.onGround    = false;
      k.jumpConsumed = true;
    }

    // ── Idle counter
    p.idleTick = (moving || !p.onGround) ? 0 : p.idleTick + 1;

    // ── Gravity & integrate
    p.vy += GRAVITY;
    p.x  += p.vx;
    p.y  += p.vy;

    // ── AABB platform collision (top + bottom)
    p.onGround = false;
    for (const pl of PLATFORMS) {
      const overlapX   = p.x + 18 > pl.x && p.x + 2 < pl.x + pl.w;
      if (!overlapX) continue;

      // — Atterraggio sul piano superiore (player cade)
      const prevBottom = p.y + 28 - p.vy;
      if (
        prevBottom <= pl.y + 2 &&
        p.y + 28   >= pl.y     &&
        p.vy >= 0
      ) {
        p.y        = pl.y - 28;
        p.vy       = 0;
        p.onGround = true;
      }

      // — Testa contro il soffitto (player sale, solo piattaforme mattone)
      if (pl.tipo === "mattone" && p.vy < 0) {
        const prevTop = p.y - p.vy;          // posizione testa frame precedente
        if (
          prevTop >= pl.y + pl.h - 2 &&      // era sotto il fondo
          p.y     <= pl.y + pl.h             // ora ha attraversato il fondo
        ) {
          p.y  = pl.y + pl.h;               // respingi sotto
          p.vy = 0;                          // azzera velocità verticale
        }
      }
    }

    // ── World bounds
    p.x = Math.max(0, Math.min(LEVEL_W - 20, p.x));

    // ── Void respawn
    if (p.y > CANVAS_H + 60) {
      p.x = s.checkpointPassed ? s.checkpoint.x : 60;
      p.y = s.checkpointPassed ? s.checkpoint.y : 305;
      p.vx = 0; p.vy = 0;
    }

    // ── Walk animation
    p.frameTick++;
    if (p.frameTick >= 8) { p.frameTick = 0; p.frame = (p.frame + 1) % 2; }

    // ── Breathing
    if (p.onGround && !moving) {
      p.breathScale += p.breathDir * 0.003;
      if (p.breathScale < 0.968) p.breathDir =  1;
      if (p.breathScale > 1.000) p.breathDir = -1;
    } else {
      p.breathScale = 1.0;
    }

    // ── Checkpoint at x=2000
    if (!s.checkpointPassed && p.x > 2000) {
      s.checkpointPassed = true;
      s.checkpoint = { x: 2060, y: 305 };
    }

    // ── Camera (smooth follow, player at ~35% from left)
    const targetCam = p.x - CANVAS_W * 0.35;
    s.cam.x += (targetCam - s.cam.x) * 0.12;
    s.cam.x = Math.max(0, Math.min(LEVEL_W - CANVAS_W, s.cam.x));

    // ── Collect hearts
    for (const h of s.hearts) {
      if (!h.collected && Math.abs(p.x + 10 - h.x) < 18 && Math.abs(p.y + 14 - h.y) < 18) {
        h.collected = true;
        s.collected++;
        setCollected(s.collected);
      }
    }

    // ── Enemies patrol, stomp & tocco laterale
    for (const e of s.enemies) {
      if (e.calm) continue;
      e.x += e.vx;
      if (e.x <= e.minX || e.x >= e.maxX) e.vx *= -1;

      const overlapX  = p.x + 18 > e.x     && p.x + 2 < e.x + e.w;
      const overlapY  = p.y + 28 > e.y + 2  && p.y     < e.y + e.h;
      const prevPY    = p.y + 28 - p.vy;
      const isStomping = prevPY <= e.y + 4 && p.vy > 0;

      if (overlapX && overlapY) {
        if (isStomping) {
          // Salta sopra: calma il fungo, rimbalza
          e.calm = true;
          p.vy   = -7;
        } else {
          // Tocco laterale/frontale: respawn all'ultimo checkpoint
          p.x  = s.checkpointPassed ? s.checkpoint.x : 60;
          p.y  = s.checkpointPassed ? s.checkpoint.y : 305;
          p.vx = 0;
          p.vy = 0;
        }
      }
    }

    // ── Bride interaction
    const bride = s.bride;
    if (!bride.gone) {
      // Trigger: lo sposo raggiunge l'ultimo albero prima del castello (x=3460)
      if (!bride.visible && p.x >= 3460) {
        bride.visible = true;
      }

      if (bride.visible) {
        bride.swayTick++;

        // Cammina fuori dal castello verso sinistra fino alla posizione di attesa
        if (!bride.emerged) {
          bride.x -= 1.8;
          if (bride.x <= 3640) {
            bride.x      = 3640;
            bride.emerged = true;
          }
        }

        // Solo dopo essere uscita controlla la distanza dallo sposo
        if (bride.emerged) {
          const dist = Math.abs(p.x + 10 - bride.x);
          if (dist < 60 && !bride.surprised) {
            bride.surprised = true;
            s.bubbleTimer   = 210; // ~3.5 s
          }
        }

        if (s.bubbleTimer > 0) s.bubbleTimer--;

        if (bride.surprised && s.bubbleTimer === 0 && !bride.walkingOff) {
          bride.walkingOff = true;
        }
        if (bride.walkingOff) {
          bride.x += 2.4;
          if (bride.x > LEVEL_W + 120) {
            bride.gone    = true;
            s.endSequence = true;
          }
        }
      }
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────
  const render = useCallback((ctx, s) => {
    const cx   = s.cam.x;
    const p    = s.player;
    const days = daysUntil();

    // Sky — single drawImage instead of gradient + fillRect every frame
    if (skyCache.current) ctx.drawImage(skyCache.current, 0, 0);
    else drawSky(ctx);

    // Clouds – parallax 0.3, sprite cache + culling
    CLOUDS.forEach((c, ci) => {
      const sx = c.x - cx * 0.3;
      if (sx + c.w < -20 || sx > CANVAS_W + 20) return;
      const spr = cloudCache.current[ci];
      if (spr) ctx.drawImage(spr.canvas, sx - spr.px, c.y - spr.py);
      else      drawCloud(ctx, sx, c.y, c.w, c.h);
    });

    // Trees – parallax 0.65, sprite cache
    TREES.forEach(({ x: tx, t }) => {
      const sx = tx - cx * 0.65;
      if (sx < -80 || sx > CANVAS_W + 80) return;
      const spr = treeCache.current[t];
      if (spr) ctx.drawImage(spr.canvas, Math.round(sx - spr.dx), Math.round(360 - spr.h));
      else {
        if (t === 0) drawCypress(ctx, sx, 360);
        else if (t === 1) drawOak(ctx, sx, 360);
        else              drawOlive(ctx, sx, 360);
      }
    });

    // Terrain + platforms + castle — single drawImage from pre-rendered level canvas.
    // Transparent "air" pixels composite correctly over sky/trees already drawn.
    if (terrainCache.current) {
      ctx.drawImage(terrainCache.current,
        Math.round(cx), 0, CANVAS_W, CANVAS_H,
        0, 0, CANVAS_W, CANVAS_H);
    } else {
      for (const pl of PLATFORMS) {
        const sx = pl.x - cx;
        if (sx + pl.w < -10 || sx > CANVAS_W + 10) continue;
        pl.tipo === "terreno"
          ? drawTerrain(ctx, sx, pl.y, pl.w, pl.h)
          : drawPlatform(ctx, sx, pl.y, pl.w, pl.h);
      }
      const castleSX = 3580 - cx;
      if (castleSX < CANVAS_W + 10 && castleSX + 260 > -10) {
        drawCastle(ctx, castleSX, 360);
      }
    }

    // Checkpoint flag
    drawFlag(ctx, 2000 - cx, 360, s.checkpointPassed);

    // Collectible hearts (floating) — sprite cache (saves 27 fillRect × N hearts per frame)
    const heartSpr = heartSpriteCache.current;
    s.hearts.forEach(h => {
      if (!h.collected) {
        const fy = h.y + Math.sin(s.tick * 0.055 + h.x * 0.01) * 4;
        if (heartSpr) ctx.drawImage(heartSpr, Math.round(h.x - cx - 5), Math.round(fy - 6));
        else          drawPixelHeart(ctx, h.x - cx - 5, fy - 6, 2, "#C9A84C");
      }
    });

    // Enemies — sprite cache + off-screen culling
    // sprite drawn at (0,4) in offscreen canvas, so blit at (sx, e.y-4)
    const mushCache = mushroomCache.current;
    const mframe = Math.floor(s.tick / 8) % 2;
    s.enemies.forEach(e => {
      const sx = e.x - cx;
      if (sx + 18 < -10 || sx > CANVAS_W + 10) return;
      const spr = mushCache?.[e.calm ? "calm" : "angry"]?.[mframe];
      if (spr) ctx.drawImage(spr, Math.round(sx), Math.round(e.y - 4));
      else     drawMushroom(ctx, sx, e.y, e.calm, s.tick);
    });

    // Bride — visibile solo dopo che lo sposo raggiunge l'ultimo albero
    if (s.bride.visible && !s.bride.gone) {
      const sway = s.bride.emerged ? Math.sin(s.bride.swayTick * 0.045) * 0.055 : 0;
      const bsx  = s.bride.x - cx;
      const bsy  = s.bride.y - 30;
      ctx.save();
      ctx.translate(bsx + 9, bsy + 15);
      ctx.scale(1.05, 1.05);
      ctx.translate(-(bsx + 9), -(bsy + 15));
      drawBride(ctx, bsx, bsy, s.bride.surprised, sway, brideImg.current);
      ctx.restore();
      if (s.bride.surprised && s.bubbleTimer > 0) {
        drawBubble(ctx, bsx + 9, bsy, "Ci vediamo il 2 ottobre!");
      }
    }

    // Groom (+5% scala, pivot sul centro dello sprite)
    const jumping   = !p.onGround;
    const impatient = p.idleTick > 300;
    const gsx = p.x - cx;
    const gsy = p.y;
    ctx.save();
    ctx.translate(gsx + 10, gsy + 14);
    ctx.scale(1.05, 1.05);
    ctx.translate(-(gsx + 10), -(gsy + 14));
    drawGroom(ctx, gsx, gsy, p.frame, jumping, impatient, p.breathScale, p.facing, groomImg.current);
    ctx.restore();

    // ── HUD bar
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(5, 5, 232, 26);
    if (heartSpr) ctx.drawImage(heartSpr, 12, 10);
    else          drawPixelHeart(ctx, 12, 10, 2, "#C9A84C");
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`x ${s.collected}   —   ${days} giorni!`, 30, 18);

    // ── End sequence overlay
    if (s.endSequence) {
      const alpha = Math.min(0.72, (s.endTimer / 45) * 0.72);
      ctx.fillStyle = `rgba(10,5,20,${alpha})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Particle hearts
      s.particles.forEach(pt => {
        ctx.globalAlpha = pt.alpha;
        drawPixelHeart(ctx, pt.x, pt.y, pt.size, pt.color);
      });
      ctx.globalAlpha = 1;

      if (s.endTimer > 40) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 52px 'Courier New', monospace";
        ctx.fillStyle = "#FFD700";
        ctx.fillText("FINE!  🎉", CANVAS_W / 2, CANVAS_H / 2 - 36);
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`Ancora ${days} giorni al 2 ottobre!`, CANVAS_W / 2, CANVAS_H / 2 + 14);
      }
    }
  }, []);

  // ── Game loop ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    stateRef.current = mkState();

    const onKeyDown = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.key === "ArrowLeft"  || e.key === "a") s.keys.left  = true;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = true;
      if ((e.key === " " || e.key === "ArrowUp" || e.key === "w") && !s.keys.jump) {
        s.keys.jump = true; s.keys.jumpConsumed = false;
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.key === "ArrowLeft"  || e.key === "a") s.keys.left  = false;
      if (e.key === "ArrowRight" || e.key === "d") s.keys.right = false;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        s.keys.jump = false; s.keys.jumpConsumed = true;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    let lastTs = 0;
    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);
      // Cap a 60 fps: salta il frame se è troppo presto (evita sprechi su schermi 90/120 Hz)
      if (ts - lastTs < 15.5) return;
      lastTs = ts;
      if (stateRef.current) {
        update(stateRef.current);
        render(ctx, stateRef.current);
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [update, render]);

  // ── Restart ──────────────────────────────────────────────────
  const restart = () => {
    setShowEnd(false);
    setCollected(0);
    stateRef.current = mkState();
  };

  // ── Mobile press ────────────────────────────────────────────
  const mobilePress = useCallback((key, down) => {
    const s = stateRef.current;
    if (!s) return;
    if (key === "left")  s.keys.left  = down;
    if (key === "right") s.keys.right = down;
    if (key === "jump") {
      if (down) { s.keys.jump = true; s.keys.jumpConsumed = false; }
      else      { s.keys.jump = false; s.keys.jumpConsumed = true; }
    }
  }, []);

  const C = COLORS;
  const days = daysUntil();

  return (
    <main style={{ background: C.cream, minHeight: "100vh", paddingTop: 76, paddingBottom: 48 }}>

      {/* Page header */}
      <div style={{ textAlign: "center", marginBottom: 16, padding: "0 16px" }}>
        <h1 style={{
          fontFamily: FONTS.script,
          color: C.olive,
          fontSize: "clamp(2rem,5vw,3.2rem)",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.2,
        }}>
          Non posso aspettare...
        </h1>
        <p style={{
          fontFamily: FONTS.body,
          color: C.dark,
          fontSize: "clamp(1rem,2.5vw,1.25rem)",
          margin: "6px 0 0",
          fontStyle: "italic",
          opacity: 0.8,
        }}>
          Raggiungila prima del 2 ottobre!
        </p>
        <p style={{
          fontFamily: FONTS.body,
          color: C.gold,
          fontSize: "clamp(0.85rem,2vw,1rem)",
          margin: "4px 0 0",
          letterSpacing: "0.04em",
        }}>
          ♥ {collected} cuori raccolti &nbsp;—&nbsp; ancora {days} giorni
        </p>
      </div>

      {/* Canvas wrapper */}
      <div
        ref={wrapRef}
        style={{
          maxWidth: CANVAS_W,
          margin: "0 auto",
          padding: "0 12px",
          position: "relative",
        }}
      >
        <div style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 6px 32px rgba(0,0,0,0.22)",
          border: `2px solid ${C.gold}`,
          lineHeight: 0,
        }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              imageRendering: "pixelated",
            }}
          />

          {/* "Gioca ancora" button – shown after end */}
          {showEnd && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "10%",
            }}>
              <button
                onClick={restart}
                style={{
                  fontFamily: FONTS.script,
                  fontSize: "1.35rem",
                  background: C.gold,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 32px",
                  cursor: "pointer",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
                  letterSpacing: "0.02em",
                  transition: "transform .1s",
                }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={e   => e.currentTarget.style.transform = "scale(1)"}
              >
                Gioca ancora 💕
              </button>
            </div>
          )}
        </div>

        {/* Desktop instructions */}
        <p style={{
          textAlign: "center",
          fontFamily: FONTS.body,
          color: "#777",
          fontSize: "0.88rem",
          margin: "8px 0 0",
          letterSpacing: "0.03em",
        }}>
          ← → Muoviti &nbsp;·&nbsp; SPAZIO / ↑ Salta &nbsp;·&nbsp;
          Salta sulle ♥ rosse per calmarle
        </p>

        {/* Mobile D-pad */}
        <MobileDPad onPress={mobilePress} />
      </div>
    </main>
  );
}

// ── Mobile D-pad component ───────────────────────────────────
function DBtn({ label, onPress, wide }) {
  const base = {
    width: wide ? 80 : 54,
    height: 54,
    background: "rgba(61,90,62,0.82)",
    color: "#fff",
    border: "2px solid rgba(201,168,76,0.55)",
    borderRadius: 10,
    fontSize: wide ? "0.8rem" : "1.5rem",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    letterSpacing: "0.03em",
    transition: "background 0.08s",
  };
  const handlers = {
    onTouchStart: (e) => { e.preventDefault(); onPress(true);  },
    onTouchEnd:   (e) => { e.preventDefault(); onPress(false); },
    onTouchCancel:(e) => { e.preventDefault(); onPress(false); },
    onMouseDown:  ()  => onPress(true),
    onMouseUp:    ()  => onPress(false),
    onMouseLeave: ()  => onPress(false),
  };
  return <div style={base} {...handlers}>{label}</div>;
}

function MobileDPad({ onPress }) {
  return (
    <>
      <style>{`
        .game-dpad { display: none; }
        @media (max-width: 640px) { .game-dpad { display: flex !important; } }
        @media (hover: none) and (pointer: coarse) { .game-dpad { display: flex !important; } }
      `}</style>
      <div
        className="game-dpad"
        style={{
          marginTop: 16,
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 8px",
          gap: 12,
        }}
      >
        {/* Movement */}
        <div style={{ display: "flex", gap: 8 }}>
          <DBtn label="◀" onPress={(d) => onPress("left",  d)} />
          <DBtn label="▶" onPress={(d) => onPress("right", d)} />
        </div>
        {/* Jump */}
        <DBtn label="SALTA" wide onPress={(d) => onPress("jump", d)}  />
      </div>
    </>
  );
}
