import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { BOARD_PIXEL_H, BOARD_PIXEL_W } from '../game/engine';

export interface ArcaneBoltEffectOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curveSign?: number;
  hitImpact: boolean;
  travelMs?: number;
}

export interface FireBreathEffectOptions {
  startX: number;
  startY: number;
  angleRad: number;
  rangePx: number;
  halfAngleRad: number;
}

export interface SpellVfxCanvasHandle {
  playArcaneBolt: (opts: ArcaneBoltEffectOptions) => void;
  playFireBreath: (opts: FireBreathEffectOptions) => void;
  clear: () => void;
}

interface CastSigil {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  baseAngle: number;
}

interface ArcaneBoltInstance {
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  endX: number;
  endY: number;
  elapsed: number;
  duration: number;
  hitImpact: boolean;
  impactSpawned: boolean;
  trail: Array<{ x: number; y: number; alpha: number }>;
  helixPhase: number;
}

interface ArcaneShockwave {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  maxRadius: number;
  kind: 'outer-rune' | 'inner-pulse';
  rotOffset: number;
}

interface ArcaneSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  duration: number;
  size: number;
  kind: 'shard' | 'star' | 'mote';
  hue: 'cyan' | 'indigo' | 'white';
  twinkleSeed: number;
}

interface ArcaneFlash {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  maxRadius: number;
}

interface FireBreathStream {
  startX: number;
  startY: number;
  angleRad: number;
  rangePx: number;
  halfAngleRad: number;
  elapsed: number;
  emitDuration: number;
  totalDuration: number;
  emitAccum: number;
  smokeAccum: number;
  emberAccum: number;
  waveCount: number;
}

interface FlameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  duration: number;
  startSize: number;
  endSize: number;
  turbAmp: number;
  turbFreq: number;
  turbPhase: number;
  perpX: number;
  perpY: number;
  tempOffset: number;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  duration: number;
  startSize: number;
  endSize: number;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  duration: number;
  size: number;
  twinkleSeed: number;
  driftUp: number;
}

interface FireWaveArc {
  startX: number;
  startY: number;
  angleRad: number;
  halfAngleRad: number;
  maxRange: number;
  elapsed: number;
  duration: number;
}

function evalQuadBezier(
  t: number,
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number
) {
  const inv = 1 - t;
  const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x1;
  const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y1;
  const dx = 2 * inv * (cx - x0) + 2 * t * (x1 - cx);
  const dy = 2 * inv * (cy - y0) + 2 * t * (y1 - cy);
  return { x, y, dx, dy };
}

export const SpellVfxCanvas = forwardRef<SpellVfxCanvasHandle>(function SpellVfxCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const stateRef = useRef({
    castSigils: [] as CastSigil[],
    arcaneBolts: [] as ArcaneBoltInstance[],
    arcaneShockwaves: [] as ArcaneShockwave[],
    arcaneSparks: [] as ArcaneSpark[],
    arcaneFlashes: [] as ArcaneFlash[],
    fireStreams: [] as FireBreathStream[],
    flameParticles: [] as FlameParticle[],
    smokeParticles: [] as SmokeParticle[],
    emberParticles: [] as EmberParticle[],
    fireWaveArcs: [] as FireWaveArc[],
  });

  const hasActiveEffects = () => {
    const s = stateRef.current;
    return (
      s.castSigils.length > 0 ||
      s.arcaneBolts.length > 0 ||
      s.arcaneShockwaves.length > 0 ||
      s.arcaneSparks.length > 0 ||
      s.arcaneFlashes.length > 0 ||
      s.fireStreams.length > 0 ||
      s.flameParticles.length > 0 ||
      s.smokeParticles.length > 0 ||
      s.emberParticles.length > 0 ||
      s.fireWaveArcs.length > 0
    );
  };

  const spawnArcaneImpact = (x: number, y: number) => {
    const s = stateRef.current;

    s.arcaneFlashes.push({
      x,
      y,
      elapsed: 0,
      duration: 240,
      maxRadius: 74,
    });

    s.arcaneShockwaves.push(
      {
        x,
        y,
        elapsed: 0,
        duration: 520,
        maxRadius: 68,
        kind: 'outer-rune',
        rotOffset: Math.random() * Math.PI * 2,
      },
      {
        x,
        y,
        elapsed: 0,
        duration: 360,
        maxRadius: 48,
        kind: 'inner-pulse',
        rotOffset: 0,
      }
    );

    // High-velocity crystalline mana shards
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = 150 + Math.random() * 210;
      s.arcaneSparks.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        elapsed: 0,
        duration: 340 + Math.random() * 240,
        size: 6 + Math.random() * 6,
        kind: 'shard',
        hue: i % 3 === 0 ? 'white' : i % 3 === 1 ? 'cyan' : 'indigo',
        twinkleSeed: Math.random() * 20,
      });
    }

    // Twinkling arcane star fragments
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 115;
      s.arcaneSparks.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 18,
        elapsed: 0,
        duration: 480 + Math.random() * 320,
        size: 3.5 + Math.random() * 3.5,
        kind: 'star',
        hue: i % 2 === 0 ? 'cyan' : 'white',
        twinkleSeed: Math.random() * 20,
      });
    }

    // Rising ethereal mana motes
    for (let i = 0; i < 10; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20;
      s.arcaneSparks.push({
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        vx: (Math.random() - 0.5) * 32,
        vy: -35 - Math.random() * 55,
        elapsed: 0,
        duration: 560 + Math.random() * 360,
        size: 2.5 + Math.random() * 2.5,
        kind: 'mote',
        hue: i % 2 === 0 ? 'indigo' : 'cyan',
        twinkleSeed: Math.random() * 20,
      });
    }
  };

  const renderFrame = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = null;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      rafRef.current = null;
      return;
    }

    const dtMs = lastTimeRef.current ? Math.min(34, now - lastTimeRef.current) : 16.6;
    const dt = dtMs / 1000;
    lastTimeRef.current = now;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(BOARD_PIXEL_W * dpr);
    const targetH = Math.round(BOARD_PIXEL_H * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, BOARD_PIXEL_W, BOARD_PIXEL_H);

    const s = stateRef.current;

    // ---------------------------------------------------------
    // 1. FIRE BREATH: Ground Scorch Glow + Spawning Particles
    // ---------------------------------------------------------
    for (let i = s.fireStreams.length - 1; i >= 0; i--) {
      const fs = s.fireStreams[i];
      fs.elapsed += dtMs;

      // Ground molten scorch wedge (fades in quickly, cools smoothly)
      const heatIn = Math.min(1, fs.elapsed / 160);
      const heatOut =
        fs.elapsed <= fs.emitDuration
          ? 1
          : Math.max(0, 1 - (fs.elapsed - fs.emitDuration) / (fs.totalDuration - fs.emitDuration));
      const scorchAlpha = heatIn * heatOut;

      if (scorchAlpha > 0.01) {
        ctx.save();
        ctx.translate(fs.startX, fs.startY);
        ctx.rotate(fs.angleRad);

        // Dark charred base underneath flames
        ctx.globalCompositeOperation = 'source-over';
        const darkGrad = ctx.createRadialGradient(12, 0, 6, 12, 0, fs.rangePx * 1.05);
        darkGrad.addColorStop(0, `rgba(60, 12, 4, ${0.32 * scorchAlpha})`);
        darkGrad.addColorStop(0.55, `rgba(45, 10, 4, ${0.24 * scorchAlpha})`);
        darkGrad.addColorStop(1, 'rgba(20, 6, 4, 0)');
        ctx.fillStyle = darkGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, fs.rangePx * 1.05, -fs.halfAngleRad * 1.04, fs.halfAngleRad * 1.04);
        ctx.closePath();
        ctx.fill();

        // Molten glowing ground illumination
        ctx.globalCompositeOperation = 'lighter';
        const glowGrad = ctx.createRadialGradient(14, 0, 4, 14, 0, fs.rangePx * 1.02);
        glowGrad.addColorStop(0, `rgba(255, 236, 153, ${0.65 * scorchAlpha})`);
        glowGrad.addColorStop(0.28, `rgba(249, 115, 22, ${0.42 * scorchAlpha})`);
        glowGrad.addColorStop(0.7, `rgba(220, 38, 38, ${0.22 * scorchAlpha})`);
        glowGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, fs.rangePx * 1.02, -fs.halfAngleRad, fs.halfAngleRad);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Emit flame, smoke, ember & shockwave particles while breathing
      if (fs.elapsed <= fs.emitDuration) {
        // Directional shockwave arcs at 0ms, 120ms, 240ms, 360ms
        const expectedWaves = Math.floor(fs.elapsed / 120) + 1;
        while (fs.waveCount < expectedWaves && fs.waveCount < 4) {
          fs.waveCount++;
          s.fireWaveArcs.push({
            startX: fs.startX,
            startY: fs.startY,
            angleRad: fs.angleRad,
            halfAngleRad: fs.halfAngleRad * 0.96,
            maxRange: fs.rangePx * 1.04,
            elapsed: 0,
            duration: 340,
          });
        }

        // Volumetric flame tongues (~340 particles/sec during 500ms stream)
        fs.emitAccum += dtMs;
        while (fs.emitAccum >= 3.2) {
          fs.emitAccum -= 3.2;
          // Bell-shaped angle bias so core of cone is richest while edges still roar
          const randSpread = ((Math.random() + Math.random()) - 1) * fs.halfAngleRad * 0.96;
          const dir = fs.angleRad + randSpread;
          const speed = (fs.rangePx / 0.48) * (0.72 + Math.random() * 0.52);
          const ox = fs.startX + Math.cos(fs.angleRad) * (10 + Math.random() * 14);
          const oy = fs.startY + Math.sin(fs.angleRad) * (10 + Math.random() * 14);

          s.flameParticles.push({
            x: ox,
            y: oy,
            vx: Math.cos(dir) * speed,
            vy: Math.sin(dir) * speed,
            elapsed: 0,
            duration: 330 + Math.random() * 230,
            startSize: 9 + Math.random() * 7,
            endSize: 28 + Math.random() * 22,
            turbAmp: 16 + Math.random() * 28,
            turbFreq: 14 + Math.random() * 12,
            turbPhase: Math.random() * Math.PI * 2,
            perpX: -Math.sin(dir),
            perpY: Math.cos(dir),
            tempOffset: (Math.random() - 0.5) * 0.14,
          });
        }

        // Subtle dark smoke billows for depth contrast
        fs.smokeAccum += dtMs;
        while (fs.smokeAccum >= 18) {
          fs.smokeAccum -= 18;
          const spread = (Math.random() * 2 - 1) * fs.halfAngleRad * 1.05;
          const dir = fs.angleRad + spread;
          const speed = (fs.rangePx / 0.58) * (0.65 + Math.random() * 0.45);
          s.smokeParticles.push({
            x: fs.startX + Math.cos(dir) * 26,
            y: fs.startY + Math.sin(dir) * 26,
            vx: Math.cos(dir) * speed,
            vy: Math.sin(dir) * speed,
            elapsed: 0,
            duration: 520 + Math.random() * 280,
            startSize: 14 + Math.random() * 8,
            endSize: 42 + Math.random() * 18,
          });
        }

        // Flying sparks & glowing embers
        fs.emberAccum += dtMs;
        while (fs.emberAccum >= 8) {
          fs.emberAccum -= 8;
          const spread = (Math.random() * 2 - 1) * fs.halfAngleRad * 1.12;
          const dir = fs.angleRad + spread;
          const speed = (fs.rangePx / 0.44) * (0.65 + Math.random() * 0.72);
          s.emberParticles.push({
            x: fs.startX + Math.cos(fs.angleRad) * 14 + (Math.random() - 0.5) * 8,
            y: fs.startY + Math.sin(fs.angleRad) * 14 + (Math.random() - 0.5) * 8,
            vx: Math.cos(dir) * speed,
            vy: Math.sin(dir) * speed,
            elapsed: 0,
            duration: 520 + Math.random() * 520,
            size: 1.6 + Math.random() * 2.4,
            twinkleSeed: Math.random() * 30,
            driftUp: 18 + Math.random() * 34,
          });
        }
      }

      if (fs.elapsed >= fs.totalDuration) {
        s.fireStreams.splice(i, 1);
      }
    }

    // ---------------------------------------------------------
    // 2. DARK SMOKE BILLOWS (under fire for dramatic contrast)
    // ---------------------------------------------------------
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = s.smokeParticles.length - 1; i >= 0; i--) {
      const p = s.smokeParticles[i];
      p.elapsed += dtMs;
      if (p.elapsed >= p.duration) {
        s.smokeParticles.splice(i, 1);
        continue;
      }
      const u = p.elapsed / p.duration;
      const drag = Math.pow(0.22, dt);
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt - 10 * dt;

      const r = p.startSize + (p.endSize - p.startSize) * Math.pow(u, 0.7);
      const alpha = Math.sin(u * Math.PI) * 0.28;
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, r);
      g.addColorStop(0, `rgba(24, 12, 8, ${alpha})`);
      g.addColorStop(0.6, `rgba(38, 16, 10, ${alpha * 0.55})`);
      g.addColorStop(1, 'rgba(18, 8, 6, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ---------------------------------------------------------
    // 3. VOLUMETRIC FLAME STREAM (Additive Blackbody Fire)
    // ---------------------------------------------------------
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = s.flameParticles.length - 1; i >= 0; i--) {
      const p = s.flameParticles[i];
      p.elapsed += dtMs;
      if (p.elapsed >= p.duration) {
        s.flameParticles.splice(i, 1);
        continue;
      }
      const u = p.elapsed / p.duration;
      const drag = Math.pow(0.16, dt);
      p.vx *= drag;
      p.vy *= drag;

      const turb = Math.sin(u * p.turbFreq + p.turbPhase) * p.turbAmp;
      p.x += (p.vx + p.perpX * turb) * dt;
      p.y += (p.vy + p.perpY * turb) * dt;

      const r = p.startSize + (p.endSize - p.startSize) * Math.pow(u, 0.62);
      const tColor = Math.max(0, Math.min(1, u + p.tempOffset));
      const fadeIn = Math.min(1, u / 0.12);
      const fadeOut = Math.pow(1 - u, 1.35);
      const alpha = fadeIn * fadeOut * 0.68;

      let cInner: string;
      let cMid: string;
      let cOuter: string;
      if (tColor < 0.24) {
        cInner = `rgba(255, 255, 240, ${alpha})`;
        cMid = `rgba(254, 240, 138, ${alpha * 0.85})`;
        cOuter = `rgba(251, 146, 60, 0)`;
      } else if (tColor < 0.55) {
        cInner = `rgba(254, 215, 102, ${alpha * 0.95})`;
        cMid = `rgba(249, 115, 22, ${alpha * 0.78})`;
        cOuter = `rgba(220, 38, 38, 0)`;
      } else {
        cInner = `rgba(234, 88, 12, ${alpha * 0.85})`;
        cMid = `rgba(185, 28, 28, ${alpha * 0.6})`;
        cOuter = `rgba(127, 29, 29, 0)`;
      }

      // Elongate flame tongue slightly along motion direction
      const moveAngle = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(moveAngle);
      ctx.scale(1.38, 0.86);

      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, cInner);
      g.addColorStop(0.42, cMid);
      g.addColorStop(1, cOuter);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Muzzle Ignition Flare at Mage's hands while breathing fire
    for (const fs of s.fireStreams) {
      if (fs.elapsed > fs.emitDuration + 90) continue;
      const u = fs.elapsed / (fs.emitDuration + 90);
      const pulse = 0.88 + 0.12 * Math.sin(fs.elapsed * 0.045);
      const alpha = Math.sin(Math.min(1, u) * Math.PI) * 0.95;
      const mx = fs.startX + Math.cos(fs.angleRad) * 16;
      const my = fs.startY + Math.sin(fs.angleRad) * 16;
      const flareR = 38 * pulse;

      const fg = ctx.createRadialGradient(mx, my, 2, mx, my, flareR);
      fg.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      fg.addColorStop(0.32, `rgba(254, 240, 138, ${alpha * 0.85})`);
      fg.addColorStop(0.65, `rgba(249, 115, 22, ${alpha * 0.45})`);
      fg.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(mx, my, flareR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Directional Heat-Blast Shockwave Arcs rippling down the 6m cone
    for (let i = s.fireWaveArcs.length - 1; i >= 0; i--) {
      const w = s.fireWaveArcs[i];
      w.elapsed += dtMs;
      if (w.elapsed >= w.duration) {
        s.fireWaveArcs.splice(i, 1);
        continue;
      }
      const u = w.elapsed / w.duration;
      const eased = 1 - Math.pow(1 - u, 2.2);
      const radius = 16 + (w.maxRange - 16) * eased;
      const alpha = (1 - u) * Math.min(1, u / 0.15) * 0.72;

      ctx.save();
      ctx.translate(w.startX, w.startY);
      ctx.rotate(w.angleRad);
      ctx.strokeStyle = `rgba(253, 224, 71, ${alpha})`;
      ctx.lineWidth = 4 * (1 - u * 0.65);
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -w.halfAngleRad, w.halfAngleRad);
      ctx.stroke();
      ctx.restore();
    }

    // Blazing Embers & Swirling Cinders
    for (let i = s.emberParticles.length - 1; i >= 0; i--) {
      const e = s.emberParticles[i];
      e.elapsed += dtMs;
      if (e.elapsed >= e.duration) {
        s.emberParticles.splice(i, 1);
        continue;
      }
      const u = e.elapsed / e.duration;
      const drag = Math.pow(0.14, dt);
      e.vx *= drag;
      e.vy *= drag;
      e.x += e.vx * dt + Math.sin(e.elapsed * 0.015 + e.twinkleSeed) * 24 * dt;
      e.y += e.vy * dt - e.driftUp * dt;

      const flicker = 0.65 + 0.35 * Math.sin(e.elapsed * 0.032 + e.twinkleSeed);
      const alpha = Math.pow(1 - u, 1.1) * flicker;
      const r = e.size * (1 - u * 0.4);

      ctx.fillStyle = u < 0.3 ? `rgba(255, 251, 235, ${alpha})` : `rgba(251, 146, 60, ${alpha})`;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ---------------------------------------------------------
    // 4. ARCANE BOLT: Casting Runic Sigil at Mage's Feet
    // ---------------------------------------------------------
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = s.castSigils.length - 1; i >= 0; i--) {
      const sig = s.castSigils[i];
      sig.elapsed += dtMs;
      if (sig.elapsed >= sig.duration) {
        s.castSigils.splice(i, 1);
        continue;
      }
      const u = sig.elapsed / sig.duration;
      const alpha = Math.min(1, u / 0.16) * Math.pow(1 - u, 1.25);
      const scale = 0.65 + Math.sin(Math.min(1, u * 1.4) * (Math.PI / 2)) * 0.42;
      const rot = sig.baseAngle + u * Math.PI * 0.9;

      ctx.save();
      ctx.translate(sig.x, sig.y);
      ctx.scale(scale, scale);

      // Soft ambient mana halo
      const bg = ctx.createRadialGradient(0, 0, 2, 0, 0, 38);
      bg.addColorStop(0, `rgba(186, 230, 253, ${0.42 * alpha})`);
      bg.addColorStop(0.55, `rgba(56, 189, 248, ${0.26 * alpha})`);
      bg.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.fill();

      // Rotating outer segmented rune ring
      ctx.rotate(rot);
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.85 * alpha})`;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([9, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();

      // Counter-rotating hexagram star
      ctx.rotate(-rot * 1.8);
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.75 * alpha})`;
      ctx.lineWidth = 1.3;
      for (let tri = 0; tri < 2; tri++) {
        ctx.beginPath();
        for (let k = 0; k <= 3; k++) {
          const a = (k / 3) * Math.PI * 2 + (tri * Math.PI) / 3;
          const px = Math.cos(a) * 21;
          const py = Math.sin(a) * 21;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 5. ARCANE BOLT: Sweeping Mana Lance + Helical Ribbons
    // ---------------------------------------------------------
    for (let i = s.arcaneBolts.length - 1; i >= 0; i--) {
      const b = s.arcaneBolts[i];
      b.elapsed += dtMs;
      const rawT = Math.min(1, b.elapsed / b.duration);
      // Smooth acceleration into impact
      const t = 0.35 * rawT + 0.65 * (rawT * rawT);

      const pos = evalQuadBezier(t, b.startX, b.startY, b.ctrlX, b.ctrlY, b.endX, b.endY);
      b.trail.push({ x: pos.x, y: pos.y, alpha: 1 });
      if (b.trail.length > 22) b.trail.shift();
      for (const pt of b.trail) {
        pt.alpha = Math.max(0, pt.alpha - dt * 4.2);
      }

      // Emit shimmering stardust wake along flight path
      if (rawT < 1) {
        const perpLen = Math.hypot(pos.dx, pos.dy) || 1;
        const nx = -pos.dy / perpLen;
        const ny = pos.dx / perpLen;
        for (let k = 0; k < 2; k++) {
          const side = (Math.random() - 0.5) * 46;
          s.arcaneSparks.push({
            x: pos.x + (Math.random() - 0.5) * 6,
            y: pos.y + (Math.random() - 0.5) * 6,
            vx: nx * side - (pos.dx / perpLen) * (18 + Math.random() * 28),
            vy: ny * side - (pos.dy / perpLen) * (18 + Math.random() * 28),
            elapsed: 0,
            duration: 240 + Math.random() * 240,
            size: 2.2 + Math.random() * 2.5,
            kind: k === 0 ? 'star' : 'mote',
            hue: k === 0 ? 'cyan' : 'indigo',
            twinkleSeed: Math.random() * 20,
          });
        }
      }

      // Draw multi-pass glowing tapered ribbon trail
      if (b.trail.length > 1) {
        for (let j = 1; j < b.trail.length; j++) {
          const prev = b.trail[j - 1];
          const curr = b.trail[j];
          const frac = j / (b.trail.length - 1);
          const a = frac * curr.alpha;
          if (a <= 0.01) continue;

          // Outer indigo plasma wake
          ctx.strokeStyle = `rgba(99, 102, 241, ${a * 0.55})`;
          ctx.lineWidth = 2 + frac * 15;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();

          // Mid electric cyan beam
          ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.92})`;
          ctx.lineWidth = 1.2 + frac * 7.5;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();

          // Pure white core filament
          ctx.strokeStyle = `rgba(240, 249, 255, ${a})`;
          ctx.lineWidth = 0.6 + frac * 2.8;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }

        // Helical twin mana spirals braiding around the trail
        for (let strand = 0; strand < 2; strand++) {
          ctx.strokeStyle =
            strand === 0 ? 'rgba(186, 230, 253, 0.72)' : 'rgba(165, 180, 252, 0.72)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let j = 1; j < b.trail.length; j++) {
            const p0 = b.trail[j - 1];
            const p1 = b.trail[j];
            const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
            const nx = -(p1.y - p0.y) / segLen;
            const ny = (p1.x - p0.x) / segLen;
            const frac = j / (b.trail.length - 1);
            const amp = Math.sin(frac * Math.PI) * 9;
            const wave = Math.sin(frac * 10 - b.elapsed * 0.03 + b.helixPhase + strand * Math.PI);
            const wx = p1.x + nx * wave * amp;
            const wy = p1.y + ny * wave * amp;
            if (j === 1) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
      }

      // Draw faceted luminous arcane spearhead
      if (rawT < 1) {
        const ang = Math.atan2(pos.dy, pos.dx);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(ang);

        // Radial bloom orb around tip
        const headGlow = ctx.createRadialGradient(0, 0, 1, 0, 0, 26);
        headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        headGlow.addColorStop(0.28, 'rgba(125, 211, 252, 0.92)');
        headGlow.addColorStop(0.65, 'rgba(99, 102, 241, 0.45)');
        headGlow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Faceted crystalline arrowhead
        ctx.fillStyle = '#f0f9ff';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-4, -6.5);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-4, 6.5);
        ctx.closePath();
        ctx.fill();

        // Cross lens-flare glint
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(18, 0);
        ctx.moveTo(0, -11);
        ctx.lineTo(0, 11);
        ctx.stroke();

        ctx.restore();
      }

      // Trigger detonation upon arrival
      if (rawT >= 1 && !b.impactSpawned) {
        b.impactSpawned = true;
        if (b.hitImpact) {
          spawnArcaneImpact(b.endX, b.endY);
        }
      }

      // Keep bolt slightly past arrival so trail finishes decaying cleanly
      if (b.elapsed >= b.duration + 180) {
        s.arcaneBolts.splice(i, 1);
      }
    }

    // ---------------------------------------------------------
    // 6. ARCANE IMPACT FLASH, RUNE SHOCKWAVES & CRYSTAL SHARDS
    // ---------------------------------------------------------
    for (let i = s.arcaneFlashes.length - 1; i >= 0; i--) {
      const fl = s.arcaneFlashes[i];
      fl.elapsed += dtMs;
      if (fl.elapsed >= fl.duration) {
        s.arcaneFlashes.splice(i, 1);
        continue;
      }
      const u = fl.elapsed / fl.duration;
      const r = fl.maxRadius * (0.45 + 0.55 * Math.pow(u, 0.45));
      const a = Math.pow(1 - u, 1.8);

      const g = ctx.createRadialGradient(fl.x, fl.y, 2, fl.x, fl.y, r);
      g.addColorStop(0, `rgba(255, 255, 255, ${a})`);
      g.addColorStop(0.35, `rgba(125, 211, 252, ${a * 0.9})`);
      g.addColorStop(0.7, `rgba(99, 102, 241, ${a * 0.45})`);
      g.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = s.arcaneShockwaves.length - 1; i >= 0; i--) {
      const sw = s.arcaneShockwaves[i];
      sw.elapsed += dtMs;
      if (sw.elapsed >= sw.duration) {
        s.arcaneShockwaves.splice(i, 1);
        continue;
      }
      const u = sw.elapsed / sw.duration;
      const eased = 1 - Math.pow(1 - u, 2.5);
      const r = 6 + (sw.maxRadius - 6) * eased;
      const a = Math.pow(1 - u, 1.35);

      ctx.save();
      ctx.translate(sw.x, sw.y);
      if (sw.kind === 'outer-rune') {
        ctx.rotate(sw.rotOffset + u * 1.4);
        ctx.strokeStyle = `rgba(125, 211, 252, ${a * 0.92})`;
        ctx.lineWidth = 3.2 * (1 - u * 0.6);
        ctx.setLineDash([12, 6, 4, 6]);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(240, 249, 255, ${a})`;
        ctx.lineWidth = 4.5 * (1 - u * 0.75);
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (let i = s.arcaneSparks.length - 1; i >= 0; i--) {
      const sp = s.arcaneSparks[i];
      sp.elapsed += dtMs;
      if (sp.elapsed >= sp.duration) {
        s.arcaneSparks.splice(i, 1);
        continue;
      }
      const u = sp.elapsed / sp.duration;
      const drag = sp.kind === 'shard' ? Math.pow(0.06, dt) : Math.pow(0.28, dt);
      sp.vx *= drag;
      sp.vy *= drag;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;

      const twinkle = 0.65 + 0.35 * Math.sin(sp.elapsed * 0.03 + sp.twinkleSeed);
      const alpha = Math.pow(1 - u, 1.25) * twinkle;
      const color =
        sp.hue === 'white'
          ? `rgba(248, 250, 252, ${alpha})`
          : sp.hue === 'cyan'
          ? `rgba(56, 189, 248, ${alpha})`
          : `rgba(165, 180, 252, ${alpha})`;

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.fillStyle = color;
      ctx.shadowColor = sp.hue === 'indigo' ? '#818cf8' : '#38bdf8';
      ctx.shadowBlur = 8;

      if (sp.kind === 'shard') {
        const ang = Math.atan2(sp.vy, sp.vx);
        ctx.rotate(ang);
        const len = sp.size * (1.2 - u * 0.6);
        const w = 2.2 * (1 - u * 0.5);
        ctx.beginPath();
        ctx.moveTo(len, 0);
        ctx.lineTo(0, -w);
        ctx.lineTo(-len * 0.65, 0);
        ctx.lineTo(0, w);
        ctx.closePath();
        ctx.fill();
      } else if (sp.kind === 'star') {
        // 4-point arcane sparkle star
        const sz = sp.size * (1 - u * 0.45);
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.lineTo(sz * 0.28, -sz * 0.28);
        ctx.lineTo(sz, 0);
        ctx.lineTo(sz * 0.28, sz * 0.28);
        ctx.lineTo(0, sz);
        ctx.lineTo(-sz * 0.28, sz * 0.28);
        ctx.lineTo(-sz, 0);
        ctx.lineTo(-sz * 0.28, -sz * 0.28);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, sp.size * (1 - u * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    if (hasActiveEffects()) {
      rafRef.current = requestAnimationFrame(renderFrame);
    } else {
      ctx.clearRect(0, 0, BOARD_PIXEL_W, BOARD_PIXEL_H);
      rafRef.current = null;
      lastTimeRef.current = 0;
    }
  };

  const ensureLoop = () => {
    if (rafRef.current === null) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(renderFrame);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      playArcaneBolt: ({
        startX,
        startY,
        endX,
        endY,
        curveSign = 0.35,
        hitImpact,
        travelMs = 310,
      }) => {
        const s = stateRef.current;
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = -dy / dist;
        const ny = dx / dist;
        const bend = Math.min(58, Math.max(18, dist * 0.24)) * curveSign;

        const ctrlX = (startX + endX) / 2 + nx * bend;
        const ctrlY = (startY + endY) / 2 + ny * bend;

        s.castSigils.push({
          x: startX,
          y: startY,
          elapsed: 0,
          duration: 440,
          baseAngle: Math.atan2(dy, dx),
        });

        s.arcaneBolts.push({
          startX,
          startY,
          ctrlX,
          ctrlY,
          endX,
          endY,
          elapsed: 0,
          duration: travelMs,
          hitImpact,
          impactSpawned: false,
          trail: [{ x: startX, y: startY, alpha: 1 }],
          helixPhase: Math.random() * Math.PI * 2,
        });

        ensureLoop();
      },

      playFireBreath: ({ startX, startY, angleRad, rangePx, halfAngleRad }) => {
        const s = stateRef.current;
        s.fireStreams.push({
          startX,
          startY,
          angleRad,
          rangePx,
          halfAngleRad,
          elapsed: 0,
          emitDuration: 520,
          totalDuration: 1380,
          emitAccum: 3.2,
          smokeAccum: 18,
          emberAccum: 8,
          waveCount: 0,
        });
        ensureLoop();
      },

      clear: () => {
        const s = stateRef.current;
        s.castSigils = [];
        s.arcaneBolts = [];
        s.arcaneShockwaves = [];
        s.arcaneSparks = [];
        s.arcaneFlashes = [];
        s.fireStreams = [];
        s.flameParticles = [];
        s.smokeParticles = [];
        s.emberParticles = [];
        s.fireWaveArcs = [];
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        lastTimeRef.current = 0;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-[58]"
      style={{ width: `${BOARD_PIXEL_W}px`, height: `${BOARD_PIXEL_H}px` }}
    />
  );
});
