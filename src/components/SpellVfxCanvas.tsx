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

export interface DoubleStrikeHitOptions {
  attackerX: number;
  attackerY: number;
  targetX: number;
  targetY: number;
  strokeIndex: 1 | 2;
  isCritical: boolean;
  didHit: boolean;
}

export interface GallantChargeOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  passedThroughEnemy: boolean;
  enemyX?: number;
  enemyY?: number;
}

export interface RaiseGuardOptions {
  x: number;
  y: number;
}

export interface DivineBeamOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  didHit: boolean;
}

export interface HolyHealOptions {
  x: number;
  y: number;
  enhanced?: boolean;
}

export interface ConsecrationOptions {
  x: number;
  y: number;
  radiusPx: number;
}

export interface SacredShieldOptions {
  x: number;
  y: number;
}

export interface DaggerThrowOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  didHit: boolean;
}

export interface StealthSmokeOptions {
  x: number;
  y: number;
}

export interface SprintBurstOptions {
  x: number;
  y: number;
}

export interface LethalityStrikeOptions {
  attackerX: number;
  attackerY: number;
  targetX: number;
  targetY: number;
  isCritical: boolean;
  fromStealth: boolean;
  didHit: boolean;
}

export interface SpellVfxCanvasHandle {
  playArcaneBolt: (opts: ArcaneBoltEffectOptions) => void;
  playFireBreath: (opts: FireBreathEffectOptions) => void;
  playDoubleStrikeHit: (opts: DoubleStrikeHitOptions) => void;
  playGallantCharge: (opts: GallantChargeOptions) => void;
  playRaiseGuard: (opts: RaiseGuardOptions) => void;
  playDivineBeam: (opts: DivineBeamOptions) => void;
  playHolyHeal: (opts: HolyHealOptions) => void;
  playConsecration: (opts: ConsecrationOptions) => void;
  playSacredShield: (opts: SacredShieldOptions) => void;
  playDaggerThrow: (opts: DaggerThrowOptions) => void;
  playStealthSmoke: (opts: StealthSmokeOptions) => void;
  playSprintBurst: (opts: SprintBurstOptions) => void;
  playLethalityStrike: (opts: LethalityStrikeOptions) => void;
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

interface SwordArcSlash {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  elapsed: number;
  duration: number;
  strokeIndex: 1 | 2;
  isCritical: boolean;
  didHit: boolean;
}

interface SlashScar {
  x: number;
  y: number;
  angleRad: number;
  length: number;
  elapsed: number;
  duration: number;
  isFinisher: boolean;
  isCritical: boolean;
}

interface SteelSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  elapsed: number;
  duration: number;
  length: number;
  hue: 'white' | 'gold' | 'crimson';
}

interface MartialShockwave {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  maxRadius: number;
  isCritical: boolean;
}

interface GallantChargeBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  elapsed: number;
  duration: number;
}

interface RaiseGuardShield {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
}

interface DivineBeamEffect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  didHit: boolean;
  elapsed: number;
  duration: number;
}

interface HolyHealEffect {
  x: number;
  y: number;
  enhanced: boolean;
  elapsed: number;
  duration: number;
}

interface ConsecrationEffect {
  x: number;
  y: number;
  radiusPx: number;
  elapsed: number;
  duration: number;
}

interface SacredShieldEffect {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
}

interface HolyMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  elapsed: number;
  duration: number;
  tint: 'gold' | 'ivory' | 'emerald';
}

interface ThrownDaggerEffect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  didHit: boolean;
  impactSpawned: boolean;
  elapsed: number;
  duration: number;
}

interface ShadowWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  startSize: number;
  endSize: number;
  elapsed: number;
  duration: number;
  tint: 'shadow' | 'violet' | 'crimson' | 'wind';
}

interface SprintRingEffect {
  x: number;
  y: number;
  elapsed: number;
  duration: number;
}

interface LethalityStrikeEffect {
  attackerX: number;
  attackerY: number;
  targetX: number;
  targetY: number;
  angle: number;
  isCritical: boolean;
  fromStealth: boolean;
  didHit: boolean;
  impactSpawned: boolean;
  elapsed: number;
  duration: number;
  speedlineAngles: number[];
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
    swordArcSlashes: [] as SwordArcSlash[],
    slashScars: [] as SlashScar[],
    steelSparks: [] as SteelSpark[],
    martialShockwaves: [] as MartialShockwave[],
    gallantChargeBeams: [] as GallantChargeBeam[],
    raiseGuardShields: [] as RaiseGuardShield[],
    divineBeams: [] as DivineBeamEffect[],
    holyHeals: [] as HolyHealEffect[],
    consecrations: [] as ConsecrationEffect[],
    sacredShields: [] as SacredShieldEffect[],
    holyMotes: [] as HolyMote[],
    thrownDaggers: [] as ThrownDaggerEffect[],
    shadowWisps: [] as ShadowWisp[],
    sprintRings: [] as SprintRingEffect[],
    lethalityStrikes: [] as LethalityStrikeEffect[],
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
      s.fireWaveArcs.length > 0 ||
      s.swordArcSlashes.length > 0 ||
      s.slashScars.length > 0 ||
      s.steelSparks.length > 0 ||
      s.martialShockwaves.length > 0 ||
      s.gallantChargeBeams.length > 0 ||
      s.raiseGuardShields.length > 0 ||
      s.divineBeams.length > 0 ||
      s.holyHeals.length > 0 ||
      s.consecrations.length > 0 ||
      s.sacredShields.length > 0 ||
      s.holyMotes.length > 0 ||
      s.thrownDaggers.length > 0 ||
      s.shadowWisps.length > 0 ||
      s.sprintRings.length > 0 ||
      s.lethalityStrikes.length > 0
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

    // ---------------------------------------------------------
    // 7. WARRIOR GOLPE DUPLO: Twin Crescent Cleaves, X-Scars & Sparks
    // ---------------------------------------------------------
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 7a. Expanding Martial Shockwaves & Cross-Flash on Impact
    for (let i = s.martialShockwaves.length - 1; i >= 0; i--) {
      const mw = s.martialShockwaves[i];
      mw.elapsed += dtMs;
      if (mw.elapsed >= mw.duration) {
        s.martialShockwaves.splice(i, 1);
        continue;
      }
      const u = mw.elapsed / mw.duration;
      const eased = 1 - Math.pow(1 - u, 2.6);
      const r = 8 + (mw.maxRadius - 8) * eased;
      const a = Math.pow(1 - u, 1.45);

      // Core warm impact bloom
      if (u < 0.45) {
        const flashA = Math.pow(1 - u / 0.45, 1.8) * 0.9;
        const flashR = mw.maxRadius * (0.42 + u * 0.6);
        const g = ctx.createRadialGradient(mw.x, mw.y, 1, mw.x, mw.y, flashR);
        g.addColorStop(0, `rgba(255, 255, 245, ${flashA})`);
        g.addColorStop(0.35, mw.isCritical ? `rgba(253, 224, 71, ${flashA * 0.88})` : `rgba(251, 146, 60, ${flashA * 0.85})`);
        g.addColorStop(0.75, `rgba(220, 38, 38, ${flashA * 0.4})`);
        g.addColorStop(1, 'rgba(185, 28, 28, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mw.x, mw.y, flashR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer crimson-amber ring
      ctx.save();
      ctx.strokeStyle = mw.isCritical
        ? `rgba(253, 224, 71, ${a * 0.95})`
        : `rgba(251, 146, 60, ${a * 0.88})`;
      ctx.lineWidth = (mw.isCritical ? 4.2 : 3.2) * (1 - u * 0.65);
      ctx.shadowColor = mw.isCritical ? '#facc15' : '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(mw.x, mw.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7b. Sweeping Tapered Steel Crescent Blade Arcs
    for (let i = s.swordArcSlashes.length - 1; i >= 0; i--) {
      const sl = s.swordArcSlashes[i];
      sl.elapsed += dtMs;
      if (sl.elapsed >= sl.duration) {
        s.swordArcSlashes.splice(i, 1);
        continue;
      }
      const u = sl.elapsed / sl.duration;
      const headFrac = Math.min(1, Math.pow(u / 0.56, 0.72));
      const tailFrac = Math.max(0, (u - 0.14) / 0.86);
      const alpha = Math.min(1, u / 0.1) * Math.pow(1 - u, 1.15);

      if (headFrac <= tailFrac + 0.01) continue;

      const segments = 22;
      const outerPts: Array<{ x: number; y: number }> = [];
      const innerPts: Array<{ x: number; y: number }> = [];
      const midPts: Array<{ x: number; y: number }> = [];

      const maxWidth = sl.strokeIndex === 2 ? (sl.isCritical ? 22 : 18) : (sl.isCritical ? 18 : 14);
      for (let k = 0; k <= segments; k++) {
        const localT = k / segments; // 0 = tail, 1 = leading blade tip
        const frac = tailFrac + (headFrac - tailFrac) * localT;
        const ang = sl.startAngle + (sl.endAngle - sl.startAngle) * frac;
        // Razor sharp at leading tip & trailing tail, widest near 75% toward tip
        const profile = Math.sin(Math.pow(localT, 0.7) * Math.PI);
        const halfThick = maxWidth * 0.5 * profile * (1 - u * 0.35);
        const rOuter = sl.radius + halfThick * 1.15;
        const rInner = Math.max(4, sl.radius - halfThick * 0.9);
        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);

        outerPts.push({ x: sl.centerX + cosA * rOuter, y: sl.centerY + sinA * rOuter });
        innerPts.push({ x: sl.centerX + cosA * rInner, y: sl.centerY + sinA * rInner });
        midPts.push({
          x: sl.centerX + cosA * (sl.radius + halfThick * 0.35),
          y: sl.centerY + sinA * (sl.radius + halfThick * 0.35),
        });
      }

      const drawCrescentPath = () => {
        ctx.beginPath();
        ctx.moveTo(outerPts[0].x, outerPts[0].y);
        for (let k = 1; k < outerPts.length; k++) {
          ctx.lineTo(outerPts[k].x, outerPts[k].y);
        }
        for (let k = innerPts.length - 1; k >= 0; k--) {
          ctx.lineTo(innerPts[k].x, innerPts[k].y);
        }
        ctx.closePath();
      };

      ctx.save();
      // Pass 1: Crimson-amber battle fury outer glow
      drawCrescentPath();
      ctx.fillStyle = !sl.didHit
        ? `rgba(148, 163, 184, ${alpha * 0.35})`
        : sl.strokeIndex === 2
        ? `rgba(220, 38, 38, ${alpha * 0.65})`
        : `rgba(234, 88, 12, ${alpha * 0.58})`;
      ctx.shadowColor = sl.strokeIndex === 2 ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = sl.isCritical ? 20 : 14;
      ctx.fill();

      // Pass 2: Molten gold-steel blade body
      ctx.fillStyle = !sl.didHit
        ? `rgba(226, 232, 240, ${alpha * 0.6})`
        : sl.isCritical
        ? `rgba(254, 240, 138, ${alpha * 0.92})`
        : `rgba(251, 191, 36, ${alpha * 0.85})`;
      ctx.fill();

      // Pass 3: Razor-bright white steel leading edge filament
      ctx.strokeStyle = `rgba(255, 255, 250, ${alpha * 0.98})`;
      ctx.lineWidth = sl.isCritical ? 3.2 : 2.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k < midPts.length; k++) {
        if (k === 0) ctx.moveTo(midPts[k].x, midPts[k].y);
        else ctx.lineTo(midPts[k].x, midPts[k].y);
      }
      ctx.stroke();

      // Subtle trailing wind-cut speed line outside the crescent
      const windR = sl.radius + maxWidth * 0.72;
      const windStart = sl.startAngle + (sl.endAngle - sl.startAngle) * Math.min(1, tailFrac + 0.12);
      const windEnd = sl.startAngle + (sl.endAngle - sl.startAngle) * headFrac;
      ctx.strokeStyle =
        sl.strokeIndex === 2
          ? `rgba(254, 215, 170, ${alpha * 0.62})`
          : `rgba(253, 230, 138, ${alpha * 0.55})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(sl.centerX, sl.centerY, windR, windStart, windEnd, sl.endAngle < sl.startAngle);
      ctx.stroke();

      ctx.restore();
    }

    // 7c. Glowing Diagonal Slash Scars (forming a fiery X-cross across the target!)
    for (let i = s.slashScars.length - 1; i >= 0; i--) {
      const sc = s.slashScars[i];
      sc.elapsed += dtMs;
      if (sc.elapsed >= sc.duration) {
        s.slashScars.splice(i, 1);
        continue;
      }
      const u = sc.elapsed / sc.duration;
      const cutGrow = Math.min(1, u / 0.14);
      const alpha = Math.pow(1 - u, 1.35);
      const halfLen = (sc.length * 0.5) * cutGrow;
      const thickness = (sc.isFinisher ? 5.2 : 4.0) * (1 - u * 0.65);

      ctx.save();
      ctx.translate(sc.x, sc.y);
      ctx.rotate(sc.angleRad);

      // Outer crimson/gold scar glow
      ctx.fillStyle = sc.isFinisher
        ? `rgba(239, 68, 68, ${alpha * 0.85})`
        : `rgba(249, 115, 22, ${alpha * 0.82})`;
      ctx.shadowColor = sc.isCritical ? '#facc15' : '#ef4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(-halfLen, 0);
      ctx.quadraticCurveTo(0, -thickness * 1.4, halfLen, 0);
      ctx.quadraticCurveTo(0, thickness * 1.4, -halfLen, 0);
      ctx.closePath();
      ctx.fill();

      // White-hot inner cut line
      ctx.fillStyle = `rgba(255, 253, 240, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(-halfLen * 0.9, 0);
      ctx.quadraticCurveTo(0, -thickness * 0.55, halfLen * 0.9, 0);
      ctx.quadraticCurveTo(0, thickness * 0.55, -halfLen * 0.9, 0);
      ctx.closePath();
      ctx.fill();

      // Finisher center cross-glint starburst
      if (sc.isFinisher && u < 0.48) {
        const starA = Math.pow(1 - u / 0.48, 1.5);
        const sz = (sc.isCritical ? 24 : 18) * (0.65 + u);
        ctx.fillStyle = `rgba(255, 255, 255, ${starA})`;
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.lineTo(sz * 0.18, -sz * 0.18);
        ctx.lineTo(sz, 0);
        ctx.lineTo(sz * 0.18, sz * 0.18);
        ctx.lineTo(0, sz);
        ctx.lineTo(-sz * 0.18, sz * 0.18);
        ctx.lineTo(-sz, 0);
        ctx.lineTo(-sz * 0.18, -sz * 0.18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 7d. High-Velocity Forged-Steel Impact Sparks
    for (let i = s.steelSparks.length - 1; i >= 0; i--) {
      const sp = s.steelSparks[i];
      sp.elapsed += dtMs;
      if (sp.elapsed >= sp.duration) {
        s.steelSparks.splice(i, 1);
        continue;
      }
      const u = sp.elapsed / sp.duration;
      const drag = Math.pow(0.08, dt);
      sp.vx *= drag;
      sp.vy *= drag;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt + 28 * dt;

      const alpha = Math.pow(1 - u, 1.2);
      const ang = Math.atan2(sp.vy, sp.vx);
      const len = sp.length * (1.1 - u * 0.65);

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(ang);
      ctx.strokeStyle =
        sp.hue === 'white'
          ? `rgba(255, 255, 245, ${alpha})`
          : sp.hue === 'gold'
          ? `rgba(253, 224, 71, ${alpha})`
          : `rgba(249, 115, 22, ${alpha})`;
      ctx.lineWidth = sp.hue === 'white' ? 2.2 : 1.7;
      ctx.lineCap = 'round';
      ctx.shadowColor = sp.hue === 'crimson' ? '#ef4444' : '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.5, 0);
      ctx.stroke();
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 8. KNIGHT: INVESTIDA GALANTE (Golden Lance Dash Trail)
    // ---------------------------------------------------------
    for (let i = s.gallantChargeBeams.length - 1; i >= 0; i--) {
      const cb = s.gallantChargeBeams[i];
      cb.elapsed += dtMs;
      if (cb.elapsed >= cb.duration) {
        s.gallantChargeBeams.splice(i, 1);
        continue;
      }
      const u = cb.elapsed / cb.duration;
      const headFrac = Math.min(1, u / 0.42);
      const tailFrac = Math.max(0, (u - 0.25) / 0.75);
      const alpha = Math.min(1, u / 0.12) * Math.pow(1 - u, 1.35);

      const dx = cb.endX - cb.startX;
      const dy = cb.endY - cb.startY;
      const len = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dy, dx);
      const nx = -dy / len;
      const ny = dx / len;

      const x0 = cb.startX + dx * tailFrac;
      const y0 = cb.startY + dy * tailFrac;
      const x1 = cb.startX + dx * headFrac;
      const y1 = cb.startY + dy * headFrac;

      ctx.save();
      // Broad heraldic golden wind corridor
      const beamGrad = ctx.createLinearGradient(x0, y0, x1, y1);
      beamGrad.addColorStop(0, `rgba(217, 119, 6, 0)`);
      beamGrad.addColorStop(0.55, `rgba(251, 191, 36, ${alpha * 0.65})`);
      beamGrad.addColorStop(1, `rgba(254, 249, 195, ${alpha * 0.95})`);
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 26 * (1 - u * 0.45);
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Core white-gold lance streak
      ctx.strokeStyle = `rgba(255, 253, 240, ${alpha * 0.95})`;
      ctx.lineWidth = 5.5 * (1 - u * 0.55);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Twin parallel wind speed ribbons flanking the Knight
      for (const side of [-1, 1]) {
        const offset = side * (16 + u * 8);
        ctx.strokeStyle = `rgba(253, 224, 71, ${alpha * 0.68})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x0 + nx * offset, y0 + ny * offset);
        ctx.lineTo(x1 + nx * offset * 0.65, y1 + ny * offset * 0.65);
        ctx.stroke();
      }

      // Spearhead chevron burst at the leading edge
      if (u < 0.72) {
        ctx.translate(x1, y1);
        ctx.rotate(ang);
        ctx.strokeStyle = `rgba(255, 255, 240, ${alpha})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-18, -20);
        ctx.lineTo(12, 0);
        ctx.lineTo(-18, 20);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 9. KNIGHT: LEVANTAR GUARDA (Radiant Kite-Shield Barrier)
    // ---------------------------------------------------------
    for (let i = s.raiseGuardShields.length - 1; i >= 0; i--) {
      const rg = s.raiseGuardShields[i];
      rg.elapsed += dtMs;
      if (rg.elapsed >= rg.duration) {
        s.raiseGuardShields.splice(i, 1);
        continue;
      }
      const u = rg.elapsed / rg.duration;
      const popIn = Math.min(1, u / 0.18);
      const fadeOut = Math.pow(1 - u, 1.35);
      const alpha = popIn * fadeOut;
      const scale = 0.62 + 0.45 * (1 - Math.pow(1 - popIn, 3)) + u * 0.14;

      ctx.save();
      ctx.translate(rg.x, rg.y);

      // Expanding golden bastion ring
      const ringR = 16 + u * 44;
      ctx.strokeStyle = `rgba(253, 224, 71, ${alpha * 0.85})`;
      ctx.lineWidth = 3.5 * (1 - u * 0.6);
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();

      // Radiant heraldic kite shield emblem over the Knight
      ctx.scale(scale, scale);
      const shGrad = ctx.createRadialGradient(0, -6, 2, 0, 2, 34);
      shGrad.addColorStop(0, `rgba(255, 251, 235, ${alpha * 0.72})`);
      shGrad.addColorStop(0.55, `rgba(245, 158, 11, ${alpha * 0.45})`);
      shGrad.addColorStop(1, `rgba(180, 83, 9, ${alpha * 0.1})`);

      ctx.fillStyle = shGrad;
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.98})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(22, -18);
      ctx.quadraticCurveTo(22, 10, 0, 28);
      ctx.quadraticCurveTo(-22, 10, -22, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner heraldic cross filigree
      ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.92})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.moveTo(-13, -4);
      ctx.lineTo(13, -4);
      ctx.stroke();

      ctx.restore();
    }

    // ---------------------------------------------------------
    // 10. PRIEST: RAIO DIVINO (Slender Sacred Laser Beam)
    // ---------------------------------------------------------
    for (let i = s.divineBeams.length - 1; i >= 0; i--) {
      const db = s.divineBeams[i];
      db.elapsed += dtMs;
      if (db.elapsed >= db.duration) {
        s.divineBeams.splice(i, 1);
        continue;
      }
      const u = db.elapsed / db.duration;
      const extendFrac = Math.min(1, u / 0.24);
      const fade = u < 0.2 ? u / 0.2 : Math.pow(1 - (u - 0.2) / 0.8, 1.35);

      const curEndX = db.startX + (db.endX - db.startX) * extendFrac;
      const curEndY = db.startY + (db.endY - db.startY) * extendFrac;

      ctx.save();
      // Soft outer golden halo beam
      const grad = ctx.createLinearGradient(db.startX, db.startY, curEndX, curEndY);
      grad.addColorStop(0, `rgba(254, 249, 195, ${fade * 0.45})`);
      grad.addColorStop(0.5, `rgba(250, 204, 21, ${fade * 0.78})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${fade * 0.95})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 11 * (1 - u * 0.55);
      ctx.lineCap = 'round';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(db.startX, db.startY);
      ctx.lineTo(curEndX, curEndY);
      ctx.stroke();

      // Focused ivory-white divine core laser
      ctx.strokeStyle = `rgba(255, 255, 250, ${fade})`;
      ctx.lineWidth = 3.2 * (1 - u * 0.45);
      ctx.beginPath();
      ctx.moveTo(db.startX, db.startY);
      ctx.lineTo(curEndX, curEndY);
      ctx.stroke();

      // Small caster grimoire origin flash
      if (u < 0.55) {
        const orgA = (1 - u / 0.55) * 0.9;
        const orgGrad = ctx.createRadialGradient(db.startX, db.startY, 0, db.startX, db.startY, 16);
        orgGrad.addColorStop(0, `rgba(255, 255, 245, ${orgA})`);
        orgGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = orgGrad;
        ctx.beginPath();
        ctx.arc(db.startX, db.startY, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Radiant 4-point cross starburst on impact
      if (db.didHit && u >= 0.16) {
        const hitU = (u - 0.16) / 0.84;
        const hitA = Math.pow(1 - hitU, 1.3);
        const sz = 16 + hitU * 18;
        ctx.translate(db.endX, db.endY);
        ctx.fillStyle = `rgba(255, 255, 245, ${hitA})`;
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.lineTo(sz * 0.16, -sz * 0.16);
        ctx.lineTo(sz, 0);
        ctx.lineTo(sz * 0.16, sz * 0.16);
        ctx.lineTo(0, sz);
        ctx.lineTo(-sz * 0.16, sz * 0.16);
        ctx.lineTo(-sz, 0);
        ctx.lineTo(-sz * 0.16, -sz * 0.16);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(253, 224, 71, ${hitA * 0.85})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10 + hitU * 26, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 11. PRIEST: LUZ RESTAURADORA (Ascending Golden Heal Pillar)
    // ---------------------------------------------------------
    for (let i = s.holyHeals.length - 1; i >= 0; i--) {
      const hh = s.holyHeals[i];
      hh.elapsed += dtMs;
      if (hh.elapsed >= hh.duration) {
        s.holyHeals.splice(i, 1);
        continue;
      }
      const u = hh.elapsed / hh.duration;
      const alpha = Math.sin(Math.PI * Math.min(1, u * 1.1)) * Math.pow(1 - u, 0.55);

      ctx.save();
      ctx.translate(hh.x, hh.y);

      // Soft celestial light column
      const colW = (hh.enhanced ? 34 : 26) * (0.85 + u * 0.3);
      const colGrad = ctx.createLinearGradient(0, 26, 0, -56);
      colGrad.addColorStop(0, `rgba(250, 204, 21, ${alpha * 0.12})`);
      colGrad.addColorStop(0.45, `rgba(254, 249, 195, ${alpha * 0.52})`);
      colGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = colGrad;
      ctx.fillRect(-colW / 2, -56, colW, 82);

      // Expanding sacred blessing ring
      ctx.strokeStyle = hh.enhanced
        ? `rgba(110, 231, 183, ${alpha * 0.9})`
        : `rgba(254, 240, 138, ${alpha * 0.92})`;
      ctx.lineWidth = 2.6 * (1 - u * 0.5);
      ctx.shadowColor = hh.enhanced ? '#34d399' : '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + u * (hh.enhanced ? 42 : 34), 0, Math.PI * 2);
      ctx.stroke();

      // Inner radiant cross crest
      const crossSz = 12 + u * 6;
      ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.9})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -crossSz);
      ctx.lineTo(0, crossSz);
      ctx.moveTo(-crossSz * 0.72, -crossSz * 0.15);
      ctx.lineTo(crossSz * 0.72, -crossSz * 0.15);
      ctx.stroke();
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 12. PRIEST: CONSAGRAÇÃO (4.0m Sacred Circle AoE Blessing)
    // ---------------------------------------------------------
    for (let i = s.consecrations.length - 1; i >= 0; i--) {
      const cs = s.consecrations[i];
      cs.elapsed += dtMs;
      if (cs.elapsed >= cs.duration) {
        s.consecrations.splice(i, 1);
        continue;
      }
      const u = cs.elapsed / cs.duration;
      const expand = Math.min(1, u / 0.24);
      const easeOut = 1 - Math.pow(1 - expand, 3);
      const r = cs.radiusPx * easeOut;
      const alpha = Math.min(1, u / 0.12) * Math.pow(1 - u, 0.95);

      ctx.save();
      ctx.translate(cs.x, cs.y);

      // Ground golden sanctuary wash
      const wash = ctx.createRadialGradient(0, 0, 4, 0, 0, Math.max(8, r));
      wash.addColorStop(0, `rgba(255, 253, 235, ${alpha * 0.42})`);
      wash.addColorStop(0.55, `rgba(250, 204, 21, ${alpha * 0.26})`);
      wash.addColorStop(0.88, `rgba(245, 158, 11, ${alpha * 0.34})`);
      wash.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = wash;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(8, r), 0, Math.PI * 2);
      ctx.fill();

      // Outer concentric sacred rings
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha * 0.95})`;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(6, r), 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 245, ${alpha * 0.65})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(4, r * 0.78), 0, Math.PI * 2);
      ctx.stroke();

      // Rotating 8-point consecrated star geometry
      ctx.rotate(u * 0.55);
      ctx.strokeStyle = `rgba(254, 249, 195, ${alpha * 0.72})`;
      ctx.lineWidth = 1.6;
      for (let k = 0; k < 2; k++) {
        ctx.save();
        ctx.rotate((k * Math.PI) / 4);
        const sq = r * 0.54;
        ctx.strokeRect(-sq, -sq, sq * 2, sq * 2);
        ctx.restore();
      }
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 13. PRIEST: PROTEÇÃO SAGRADA (Radiant 15 HP Over-Shield Dome)
    // ---------------------------------------------------------
    for (let i = s.sacredShields.length - 1; i >= 0; i--) {
      const ss = s.sacredShields[i];
      ss.elapsed += dtMs;
      if (ss.elapsed >= ss.duration) {
        s.sacredShields.splice(i, 1);
        continue;
      }
      const u = ss.elapsed / ss.duration;
      const pop = Math.min(1, u / 0.22);
      const alpha = pop * Math.pow(1 - u, 1.15);
      const radius = 18 + (1 - Math.pow(1 - pop, 3)) * 18 + u * 8;

      ctx.save();
      ctx.translate(ss.x, ss.y);

      const domeGrad = ctx.createRadialGradient(0, -6, 2, 0, 0, radius);
      domeGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.55})`);
      domeGrad.addColorStop(0.6, `rgba(254, 240, 138, ${alpha * 0.35})`);
      domeGrad.addColorStop(1, `rgba(250, 204, 21, ${alpha * 0.75})`);
      ctx.fillStyle = domeGrad;
      ctx.strokeStyle = `rgba(255, 253, 235, ${alpha})`;
      ctx.lineWidth = 2.8;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Secondary angelic halo expanding outward
      ctx.strokeStyle = `rgba(254, 249, 195, ${alpha * 0.72})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 8 + u * 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // ---------------------------------------------------------
    // 14. RISING HOLY MOTES (Shared across Priest Blessings)
    // ---------------------------------------------------------
    for (let i = s.holyMotes.length - 1; i >= 0; i--) {
      const m = s.holyMotes[i];
      m.elapsed += dtMs;
      if (m.elapsed >= m.duration) {
        s.holyMotes.splice(i, 1);
        continue;
      }
      const u = m.elapsed / m.duration;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const alpha = Math.sin(Math.PI * u);
      ctx.save();
      ctx.fillStyle =
        m.tint === 'emerald'
          ? `rgba(110, 231, 183, ${alpha})`
          : m.tint === 'ivory'
          ? `rgba(255, 255, 245, ${alpha})`
          : `rgba(253, 224, 71, ${alpha})`;
      ctx.shadowColor = m.tint === 'emerald' ? '#34d399' : '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * (1 - u * 0.35), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 15. ROGUE: ARREMESSO DE ADAGA (Spinning Steel Blade + Crimson Wake)
    // ---------------------------------------------------------
    for (let i = s.thrownDaggers.length - 1; i >= 0; i--) {
      const dg = s.thrownDaggers[i];
      dg.elapsed += dtMs;
      const u = Math.min(1, dg.elapsed / dg.duration);
      const px = dg.startX + (dg.endX - dg.startX) * u;
      const py = dg.startY + (dg.endY - dg.startY) * u;
      const ang = Math.atan2(dg.endY - dg.startY, dg.endX - dg.startX);

      // Motion streak behind dagger
      ctx.save();
      const tailX = dg.startX + (dg.endX - dg.startX) * Math.max(0, u - 0.32);
      const tailY = dg.startY + (dg.endY - dg.startY) * Math.max(0, u - 0.32);
      const grad = ctx.createLinearGradient(tailX, tailY, px, py);
      grad.addColorStop(0, 'rgba(220, 38, 38, 0)');
      grad.addColorStop(0.55, 'rgba(248, 113, 113, 0.55)');
      grad.addColorStop(1, 'rgba(248, 250, 252, 0.95)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Spinning steel dagger silhouette
      ctx.translate(px, py);
      ctx.rotate(ang + u * Math.PI * 6);
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(13, 0);
      ctx.lineTo(-2, -3.5);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-2, 3.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.stroke();
      ctx.restore();

      if (u >= 1 && !dg.impactSpawned) {
        dg.impactSpawned = true;
        if (dg.didHit) {
          // Crimson bleed droplets bursting on target
          for (let k = 0; k < 14; k++) {
            const a = Math.random() * Math.PI * 2;
            const spd = 45 + Math.random() * 130;
            s.shadowWisps.push({
              x: dg.endX,
              y: dg.endY,
              vx: Math.cos(a) * spd,
              vy: Math.sin(a) * spd,
              startSize: 3 + Math.random() * 3,
              endSize: 8 + Math.random() * 6,
              elapsed: 0,
              duration: 340 + Math.random() * 220,
              tint: 'crimson',
            });
          }
          s.slashScars.push({
            x: dg.endX,
            y: dg.endY,
            angleRad: ang + 0.35,
            length: 42,
            elapsed: 0,
            duration: 420,
            isFinisher: true,
            isCritical: false,
          });
        }
      }

      if (dg.elapsed >= dg.duration + 60) {
        s.thrownDaggers.splice(i, 1);
      }
    }

    // ---------------------------------------------------------
    // 16. ROGUE: DISPARADA SPEED RINGS
    // ---------------------------------------------------------
    for (let i = s.sprintRings.length - 1; i >= 0; i--) {
      const sr = s.sprintRings[i];
      sr.elapsed += dtMs;
      if (sr.elapsed >= sr.duration) {
        s.sprintRings.splice(i, 1);
        continue;
      }
      const u = sr.elapsed / sr.duration;
      const r = 12 + u * 44;
      const a = Math.pow(1 - u, 1.3);
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${a * 0.9})`;
      ctx.lineWidth = 3 * (1 - u * 0.6);
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(sr.x, sr.y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(167, 243, 208, ${a * 0.7})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(sr.x, sr.y, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 17. ROGUE: SHADOW SMOKE, BLEED DROPS & WIND WISPS
    // ---------------------------------------------------------
    for (let i = s.shadowWisps.length - 1; i >= 0; i--) {
      const w = s.shadowWisps[i];
      w.elapsed += dtMs;
      if (w.elapsed >= w.duration) {
        s.shadowWisps.splice(i, 1);
        continue;
      }
      const u = w.elapsed / w.duration;
      const drag = Math.pow(0.18, dt);
      w.vx *= drag;
      w.vy *= drag;
      w.x += w.vx * dt;
      w.y += w.vy * dt;

      const r = w.startSize + (w.endSize - w.startSize) * u;
      const a = Math.sin(Math.PI * Math.min(1, u)) * 0.78;
      ctx.save();
      ctx.globalCompositeOperation = w.tint === 'shadow' ? 'source-over' : 'lighter';
      const g = ctx.createRadialGradient(w.x, w.y, 1, w.x, w.y, r);
      if (w.tint === 'crimson') {
        g.addColorStop(0, `rgba(248, 113, 113, ${a})`);
        g.addColorStop(0.55, `rgba(185, 28, 28, ${a * 0.75})`);
        g.addColorStop(1, 'rgba(127, 29, 29, 0)');
      } else if (w.tint === 'violet') {
        g.addColorStop(0, `rgba(196, 181, 253, ${a * 0.8})`);
        g.addColorStop(0.55, `rgba(109, 40, 217, ${a * 0.55})`);
        g.addColorStop(1, 'rgba(46, 16, 101, 0)');
      } else if (w.tint === 'wind') {
        g.addColorStop(0, `rgba(167, 243, 208, ${a * 0.9})`);
        g.addColorStop(0.6, `rgba(16, 185, 129, ${a * 0.45})`);
        g.addColorStop(1, 'rgba(6, 78, 59, 0)');
      } else {
        g.addColorStop(0, `rgba(15, 23, 42, ${a * 0.85})`);
        g.addColorStop(0.65, `rgba(30, 27, 75, ${a * 0.55})`);
        g.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---------------------------------------------------------
    // 18. ROGUE: LETALIDADE (Signature Shadow-Dash Assassin Backstab)
    // ---------------------------------------------------------
    for (let i = s.lethalityStrikes.length - 1; i >= 0; i--) {
      const ls = s.lethalityStrikes[i];
      ls.elapsed += dtMs;
      if (ls.elapsed >= ls.duration) {
        s.lethalityStrikes.splice(i, 1);
        continue;
      }

      const u = ls.elapsed / ls.duration;
      const cosA = Math.cos(ls.angle);
      const sinA = Math.sin(ls.angle);
      const perpX = -sinA;
      const perpY = cosA;

      // Trigger high-velocity directional blood/shadow burst at moment of blade impact
      if (!ls.impactSpawned && u >= 0.14) {
        ls.impactSpawned = true;
        if (ls.didHit) {
          // Staggered shockwave blast
          s.martialShockwaves.push({
            x: ls.targetX,
            y: ls.targetY,
            elapsed: 0,
            duration: ls.isCritical ? 520 : 380,
            maxRadius: ls.isCritical ? 92 : 64,
            isCritical: ls.isCritical,
          });

          // Directional blood-mist & shadow shards spraying THROUGH the enemy's back
          const sprayCount = ls.isCritical ? 28 : 18;
          for (let k = 0; k < sprayCount; k++) {
            const spread = (Math.random() - 0.5) * 1.35;
            const ang = ls.angle + spread;
            const spd = 120 + Math.random() * (ls.isCritical ? 290 : 210);
            s.shadowWisps.push({
              x: ls.targetX + cosA * 6,
              y: ls.targetY + sinA * 6,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              startSize: 3.5 + Math.random() * 3.5,
              endSize: 12 + Math.random() * 9,
              elapsed: 0,
              duration: 340 + Math.random() * 280,
              tint:
                k % 4 === 0
                  ? 'shadow'
                  : ls.fromStealth && k % 3 === 0
                  ? 'violet'
                  : 'crimson',
            });
          }

          // Sharp metallic/crimson-gold impact sparks
          const sparkCount = ls.isCritical ? 22 : 12;
          for (let k = 0; k < sparkCount; k++) {
            const ang = ls.angle + (Math.random() - 0.5) * 2.2;
            const spd = 160 + Math.random() * (ls.isCritical ? 340 : 230);
            s.steelSparks.push({
              x: ls.targetX,
              y: ls.targetY,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              length: 10 + Math.random() * (ls.isCritical ? 16 : 10),
              elapsed: 0,
              duration: 240 + Math.random() * 200,
              hue: ls.isCritical && k % 2 === 0 ? 'gold' : k % 3 === 0 ? 'crimson' : 'white',
            });
          }
        }
      }

      // Phase 1: Dark Shadow-Vortex Backplate & Phantom Dash Streak (0 -> 0.42)
      if (u < 0.46) {
        const dashU = Math.min(1, u / 0.24);
        const fadeOut = u < 0.22 ? 1 : Math.max(0, 1 - (u - 0.22) / 0.24);
        const overshoot = ls.isCritical ? 54 : 40;
        const startX = ls.attackerX - cosA * 12;
        const startY = ls.attackerY - sinA * 12;
        const endX = ls.targetX + cosA * overshoot;
        const endY = ls.targetY + sinA * overshoot;
        const curX = startX + (endX - startX) * (1 - Math.pow(1 - dashU, 3));
        const curY = startY + (endY - startY) * (1 - Math.pow(1 - dashU, 3));

        ctx.save();
        // Dark shadow veil around impact for dramatic contrast
        const shadowAura = ctx.createRadialGradient(
          ls.targetX,
          ls.targetY,
          4,
          ls.targetX,
          ls.targetY,
          ls.isCritical ? 76 : 58
        );
        shadowAura.addColorStop(0, `rgba(12, 5, 22, ${0.72 * fadeOut})`);
        shadowAura.addColorStop(0.55, `rgba(46, 16, 101, ${0.4 * fadeOut})`);
        shadowAura.addColorStop(1, 'rgba(12, 5, 22, 0)');
        ctx.fillStyle = shadowAura;
        ctx.beginPath();
        ctx.arc(ls.targetX, ls.targetY, ls.isCritical ? 76 : 58, 0, Math.PI * 2);
        ctx.fill();

        // Phantom shadow-crimson warp streak piercing through the target
        const streakGrad = ctx.createLinearGradient(startX, startY, curX, curY);
        streakGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        streakGrad.addColorStop(
          0.35,
          ls.fromStealth
            ? `rgba(139, 92, 246, ${0.75 * fadeOut})`
            : `rgba(153, 27, 27, ${0.75 * fadeOut})`
        );
        streakGrad.addColorStop(0.82, `rgba(239, 68, 68, ${0.95 * fadeOut})`);
        streakGrad.addColorStop(1, `rgba(255, 255, 255, ${fadeOut})`);

        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = ls.isCritical ? 14 * fadeOut : 10 * fadeOut;
        ctx.lineCap = 'round';
        ctx.shadowColor = ls.fromStealth ? '#a855f7' : '#ef4444';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Thin razor white-hot inner line
        ctx.strokeStyle = `rgba(255, 251, 235, ${0.92 * fadeOut})`;
        ctx.lineWidth = 2.6 * fadeOut;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.restore();
      }

      // Phase 2: Gleaming Curved Assassin Dagger Thrust & Violent Rip (0.03 -> 0.46)
      if (u >= 0.03 && u <= 0.48) {
        const dU = (u - 0.03) / 0.45;
        let tipX = ls.targetX;
        let tipY = ls.targetY;
        let daggerRot = ls.angle;
        let daggerAlpha = 1;

        if (dU < 0.28) {
          // Rapid plunge straight into target's back
          const p = 1 - Math.pow(1 - dU / 0.28, 3);
          tipX = ls.attackerX + (ls.targetX + cosA * 14 - ls.attackerX) * p;
          tipY = ls.attackerY + (ls.targetY + sinA * 14 - ls.attackerY) * p;
        } else if (dU < 0.46) {
          // Brief visceral tension pause inside the back
          const jitter = Math.sin(dU * 140) * 1.8;
          tipX = ls.targetX + cosA * 14 + perpX * jitter;
          tipY = ls.targetY + sinA * 14 + perpY * jitter;
        } else {
          // Violent diagonal rip out!
          const rU = (dU - 0.46) / 0.54;
          const easeR = 1 - Math.pow(1 - rU, 2);
          tipX = ls.targetX + cosA * (14 + easeR * 22) + perpX * (easeR * 28);
          tipY = ls.targetY + sinA * (14 + easeR * 22) + perpY * (easeR * 28);
          daggerRot = ls.angle + easeR * 0.85;
          daggerAlpha = Math.max(0, 1 - rU * 1.15);
        }

        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(daggerRot);
        ctx.globalAlpha = daggerAlpha;

        // Curved assassin blade silhouette (scale up slightly on crit)
        const bladeScale = ls.isCritical ? 1.32 : 1.15;
        ctx.scale(bladeScale, bladeScale);

        ctx.shadowColor = ls.isCritical ? '#facc15' : ls.fromStealth ? '#c084fc' : '#ef4444';
        ctx.shadowBlur = 16;

        // Outer luminous steel blade
        const bladeGrad = ctx.createLinearGradient(-28, 0, 18, 0);
        bladeGrad.addColorStop(0, '#334155');
        bladeGrad.addColorStop(0.5, '#e2e8f0');
        bladeGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.quadraticCurveTo(4, -6.5, -14, -4);
        ctx.lineTo(-14, 2.5);
        ctx.quadraticCurveTo(2, 4.5, 18, 0);
        ctx.closePath();
        ctx.fill();

        // Crimson glowing blood-groove along the dagger fuller
        ctx.strokeStyle = ls.isCritical ? '#fde047' : '#ef4444';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-10, -0.5);
        ctx.lineTo(10, -0.3);
        ctx.stroke();

        // Swept dark-iron assassin crossguard & pommel
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-14, -7.5);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-14, 7.5);
        ctx.stroke();

        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-24, 0);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-25, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Phase 3: Impact Core Flash, Execution Diamond Seal & Speedlines (0.13 -> 0.52)
      if (ls.didHit && u >= 0.13 && u <= 0.56) {
        const fU = (u - 0.13) / 0.43;
        const flashAlpha = Math.pow(1 - fU, 1.8);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(ls.targetX, ls.targetY);

        // Blinding crimson-white flash core
        const flashR = (ls.isCritical ? 68 : 48) * (0.4 + fU * 0.9);
        const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, flashR);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        coreGrad.addColorStop(
          0.35,
          ls.isCritical
            ? `rgba(253, 224, 71, ${flashAlpha * 0.85})`
            : `rgba(248, 113, 113, ${flashAlpha * 0.85})`
        );
        coreGrad.addColorStop(
          0.7,
          ls.fromStealth
            ? `rgba(147, 51, 234, ${flashAlpha * 0.45})`
            : `rgba(185, 28, 28, ${flashAlpha * 0.45})`
        );
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, flashR, 0, Math.PI * 2);
        ctx.fill();

        // Sharp rotating Assassin Diamond Execution Seal
        const sealR = (ls.isCritical ? 46 : 34) * (0.55 + Math.sin(Math.min(1, fU * 1.6) * Math.PI * 0.5) * 0.65);
        ctx.save();
        ctx.rotate(ls.angle + fU * 0.45);
        ctx.strokeStyle = ls.isCritical
          ? `rgba(254, 240, 138, ${flashAlpha * 0.95})`
          : `rgba(252, 165, 165, ${flashAlpha * 0.9})`;
        ctx.lineWidth = ls.isCritical ? 2.6 : 1.9;
        ctx.beginPath();
        ctx.moveTo(sealR, 0);
        ctx.lineTo(0, sealR * 0.68);
        ctx.lineTo(-sealR, 0);
        ctx.lineTo(0, -sealR * 0.68);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // High-impact radial speedlines shooting outward
        const lineAlpha = Math.pow(Math.max(0, 1 - fU * 1.35), 1.5);
        if (lineAlpha > 0.02) {
          for (let k = 0; k < ls.speedlineAngles.length; k++) {
            const ang = ls.speedlineAngles[k];
            const inner = 14 + fU * 26;
            const outer = (ls.isCritical ? 78 : 54) + fU * 48;
            ctx.strokeStyle =
              ls.isCritical && k % 2 === 0
                ? `rgba(254, 240, 138, ${lineAlpha * 0.92})`
                : ls.fromStealth && k % 3 === 0
                ? `rgba(192, 132, 252, ${lineAlpha * 0.85})`
                : `rgba(248, 113, 113, ${lineAlpha * 0.88})`;
            ctx.lineWidth = ls.isCritical ? 2.4 : 1.7;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * inner, Math.sin(ang) * inner);
            ctx.lineTo(Math.cos(ang) * outer, Math.sin(ang) * outer);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Phase 4: Massive Signature Crimson/Obsidian X-Laceration & Shadow Crescents (0.15 -> 1.0)
      if (ls.didHit && u >= 0.15) {
        const sU = (u - 0.15) / 0.85;
        const openEase = Math.min(1, sU / 0.16);
        const fade = Math.pow(Math.max(0, 1 - Math.max(0, sU - 0.25) / 0.75), 1.45);
        const cuts = [
          {
            ang: ls.angle + 0.58,
            len: (ls.isCritical ? 124 : 94) * (0.45 + 0.55 * openEase),
            width: ls.isCritical ? 14 : 10,
            delay: 0,
          },
          {
            ang: ls.angle - 0.58,
            len: (ls.isCritical ? 116 : 86) * (0.45 + 0.55 * Math.min(1, Math.max(0, (sU - 0.05) / 0.16))),
            width: ls.isCritical ? 12 : 9,
            delay: 0.05,
          },
        ];

        for (const cut of cuts) {
          if (sU < cut.delay) continue;
          const halfL = cut.len * 0.5;
          const halfW = cut.width * 0.5 * (0.35 + 0.65 * fade);

          ctx.save();
          ctx.translate(ls.targetX, ls.targetY);
          ctx.rotate(cut.ang);

          // Dark obsidian outer tear edge (brutal contrast)
          ctx.fillStyle = `rgba(10, 4, 18, ${fade * 0.88})`;
          ctx.beginPath();
          ctx.moveTo(-halfL - 6, 0);
          ctx.quadraticCurveTo(0, -halfW * 1.9, halfL + 6, 0);
          ctx.quadraticCurveTo(0, halfW * 1.9, -halfL - 6, 0);
          ctx.closePath();
          ctx.fill();

          // Blazing crimson / stealth-violet slash body
          ctx.globalCompositeOperation = 'lighter';
          const slashGrad = ctx.createLinearGradient(-halfL, 0, halfL, 0);
          slashGrad.addColorStop(0, 'rgba(127, 29, 29, 0)');
          slashGrad.addColorStop(
            0.25,
            ls.fromStealth
              ? `rgba(168, 85, 247, ${fade * 0.92})`
              : `rgba(220, 38, 38, ${fade * 0.95})`
          );
          slashGrad.addColorStop(
            0.5,
            ls.isCritical
              ? `rgba(253, 224, 71, ${fade})`
              : `rgba(248, 113, 113, ${fade})`
          );
          slashGrad.addColorStop(
            0.75,
            ls.fromStealth
              ? `rgba(168, 85, 247, ${fade * 0.92})`
              : `rgba(220, 38, 38, ${fade * 0.95})`
          );
          slashGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');

          ctx.fillStyle = slashGrad;
          ctx.shadowColor = ls.isCritical ? '#facc15' : '#ef4444';
          ctx.shadowBlur = ls.isCritical ? 22 : 14;
          ctx.beginPath();
          ctx.moveTo(-halfL, 0);
          ctx.quadraticCurveTo(0, -halfW * 1.25, halfL, 0);
          ctx.quadraticCurveTo(0, halfW * 1.25, -halfL, 0);
          ctx.closePath();
          ctx.fill();

          // Razor white-hot inner wound fissure
          ctx.fillStyle = `rgba(255, 255, 255, ${fade * 0.95})`;
          ctx.beginPath();
          ctx.moveTo(-halfL * 0.78, 0);
          ctx.quadraticCurveTo(0, -halfW * 0.42, halfL * 0.78, 0);
          ctx.quadraticCurveTo(0, halfW * 0.42, -halfL * 0.78, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }

        // Extra swirling phantom crescent arcs when triggered from Furtividade
        if (ls.fromStealth && sU < 0.72) {
          const arcU = sU / 0.72;
          const arcAlpha = Math.sin(Math.PI * arcU) * 0.85;
          const arcR = 26 + arcU * 40;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(ls.targetX, ls.targetY);
          ctx.rotate(ls.angle + arcU * 2.2);
          ctx.strokeStyle = `rgba(192, 132, 252, ${arcAlpha})`;
          ctx.lineWidth = (ls.isCritical ? 4.5 : 3.2) * (1 - arcU * 0.5);
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(0, 0, arcR, -0.85, 0.85);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, arcR, Math.PI - 0.85, Math.PI + 0.85);
          ctx.stroke();
          ctx.restore();
        }
      }
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

      playDoubleStrikeHit: ({
        attackerX,
        attackerY,
        targetX,
        targetY,
        strokeIndex,
        isCritical,
        didHit,
      }) => {
        const s = stateRef.current;
        const baseAngle = Math.atan2(targetY - attackerY, targetX - attackerX);
        // Anchor crescent slightly behind the target so the blade sweeps cleanly across it
        const centerX = attackerX + (targetX - attackerX) * 0.55;
        const centerY = attackerY + (targetY - attackerY) * 0.55;
        const radius = Math.max(30, Math.hypot(targetX - centerX, targetY - centerY) + 14);

        const sweepHalf = strokeIndex === 2 ? 1.52 : 1.38;
        const startAngle = strokeIndex === 1 ? baseAngle - sweepHalf : baseAngle + sweepHalf;
        const endAngle = strokeIndex === 1 ? baseAngle + sweepHalf * 0.85 : baseAngle - sweepHalf * 0.85;

        s.swordArcSlashes.push({
          centerX,
          centerY,
          radius,
          startAngle,
          endAngle,
          elapsed: 0,
          duration: strokeIndex === 2 ? 290 : 250,
          strokeIndex,
          isCritical,
          didHit,
        });

        if (didHit) {
          // Cross-slash scars at +42deg (stroke 1) and -42deg (stroke 2) relative to attack axis
          const scarAngle = baseAngle + (strokeIndex === 1 ? 0.72 : -0.72);
          s.slashScars.push({
            x: targetX,
            y: targetY,
            angleRad: scarAngle,
            length: strokeIndex === 2 ? (isCritical ? 64 : 56) : (isCritical ? 54 : 46),
            elapsed: 0,
            duration: strokeIndex === 1 ? 520 : 480,
            isFinisher: strokeIndex === 2,
            isCritical,
          });

          if (strokeIndex === 2 || isCritical) {
            s.martialShockwaves.push({
              x: targetX,
              y: targetY,
              elapsed: 0,
              duration: isCritical ? 420 : 340,
              maxRadius: isCritical ? 66 : 52,
              isCritical,
            });
          }

          // Directional steel sparks spraying off the blade exit angle
          const sparkCount = strokeIndex === 2 ? (isCritical ? 26 : 20) : (isCritical ? 18 : 13);
          const exitDir = scarAngle + (strokeIndex === 1 ? 0 : Math.PI);
          for (let i = 0; i < sparkCount; i++) {
            const spread =
              i < sparkCount * 0.65
                ? (Math.random() - 0.5) * 1.15
                : Math.random() * Math.PI * 2;
            const ang = exitDir + spread;
            const speed = 135 + Math.random() * (strokeIndex === 2 ? 250 : 195);
            s.steelSparks.push({
              x: targetX + (Math.random() - 0.5) * 10,
              y: targetY + (Math.random() - 0.5) * 10,
              vx: Math.cos(ang) * speed,
              vy: Math.sin(ang) * speed,
              elapsed: 0,
              duration: 240 + Math.random() * 240,
              length: 7 + Math.random() * 11,
              hue: i % 4 === 0 ? 'white' : i % 3 === 0 ? 'crimson' : 'gold',
            });
          }
        }

        ensureLoop();
      },

      playGallantCharge: ({
        startX,
        startY,
        endX,
        endY,
        passedThroughEnemy,
        enemyX,
        enemyY,
      }) => {
        const s = stateRef.current;
        s.gallantChargeBeams.push({
          startX,
          startY,
          endX,
          endY,
          elapsed: 0,
          duration: 560,
        });

        // Golden sparks spraying along the charge corridor
        const dx = endX - startX;
        const dy = endY - startY;
        const baseAng = Math.atan2(dy, dx);
        for (let i = 0; i < 24; i++) {
          const frac = Math.random();
          const px = startX + dx * frac + (Math.random() - 0.5) * 18;
          const py = startY + dy * frac + (Math.random() - 0.5) * 18;
          const ang = baseAng + Math.PI + (Math.random() - 0.5) * 1.1;
          const speed = 75 + Math.random() * 170;
          s.steelSparks.push({
            x: px,
            y: py,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            elapsed: 0,
            duration: 280 + Math.random() * 260,
            length: 9 + Math.random() * 12,
            hue: i % 3 === 0 ? 'white' : 'gold',
          });
        }

        // Arrival bastion shockwave at destination
        s.martialShockwaves.push({
          x: endX,
          y: endY,
          elapsed: 0,
          duration: 420,
          maxRadius: 56,
          isCritical: true,
        });

        // Extra heraldic shockwave when cutting right through an enemy!
        if (passedThroughEnemy && enemyX !== undefined && enemyY !== undefined) {
          s.martialShockwaves.push({
            x: enemyX,
            y: enemyY,
            elapsed: 0,
            duration: 440,
            maxRadius: 62,
            isCritical: true,
          });
        }

        ensureLoop();
      },

      playRaiseGuard: ({ x, y }) => {
        const s = stateRef.current;
        s.raiseGuardShields.push({
          x,
          y,
          elapsed: 0,
          duration: 640,
        });

        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
          const speed = 110 + Math.random() * 150;
          s.steelSparks.push({
            x: x + Math.cos(ang) * 10,
            y: y + Math.sin(ang) * 10,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            elapsed: 0,
            duration: 260 + Math.random() * 220,
            length: 7 + Math.random() * 9,
            hue: i % 2 === 0 ? 'white' : 'gold',
          });
        }

        ensureLoop();
      },

      playDivineBeam: ({ startX, startY, endX, endY, didHit }) => {
        const s = stateRef.current;
        s.divineBeams.push({
          startX,
          startY,
          endX,
          endY,
          didHit,
          elapsed: 0,
          duration: 420,
        });

        // Subtle luminous motes drifting along the divine laser trajectory
        const dx = endX - startX;
        const dy = endY - startY;
        for (let i = 0; i < 14; i++) {
          const frac = 0.15 + Math.random() * 0.85;
          s.holyMotes.push({
            x: startX + dx * frac + (Math.random() - 0.5) * 10,
            y: startY + dy * frac + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 32,
            vy: -18 - Math.random() * 32,
            size: 1.8 + Math.random() * 2.2,
            elapsed: 0,
            duration: 360 + Math.random() * 260,
            tint: i % 2 === 0 ? 'ivory' : 'gold',
          });
        }
        ensureLoop();
      },

      playHolyHeal: ({ x, y, enhanced = false }) => {
        const s = stateRef.current;
        s.holyHeals.push({
          x,
          y,
          enhanced,
          elapsed: 0,
          duration: 760,
        });

        const moteCount = enhanced ? 24 : 16;
        for (let i = 0; i < moteCount; i++) {
          s.holyMotes.push({
            x: x + (Math.random() - 0.5) * 38,
            y: y + 18 - Math.random() * 24,
            vx: (Math.random() - 0.5) * 24,
            vy: -42 - Math.random() * 55,
            size: 2.0 + Math.random() * 2.6,
            elapsed: 0,
            duration: 520 + Math.random() * 340,
            tint: enhanced && i % 3 === 0 ? 'emerald' : i % 2 === 0 ? 'gold' : 'ivory',
          });
        }
        ensureLoop();
      },

      playConsecration: ({ x, y, radiusPx }) => {
        const s = stateRef.current;
        s.consecrations.push({
          x,
          y,
          radiusPx,
          elapsed: 0,
          duration: 1180,
        });

        for (let i = 0; i < 36; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = Math.random() * radiusPx * 0.92;
          s.holyMotes.push({
            x: x + Math.cos(ang) * dist,
            y: y + Math.sin(ang) * dist,
            vx: (Math.random() - 0.5) * 16,
            vy: -38 - Math.random() * 58,
            size: 2.2 + Math.random() * 2.8,
            elapsed: 0,
            duration: 620 + Math.random() * 480,
            tint: i % 4 === 0 ? 'emerald' : i % 2 === 0 ? 'gold' : 'ivory',
          });
        }
        ensureLoop();
      },

      playSacredShield: ({ x, y }) => {
        const s = stateRef.current;
        s.sacredShields.push({
          x,
          y,
          elapsed: 0,
          duration: 740,
        });

        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2;
          s.holyMotes.push({
            x: x + Math.cos(ang) * 20,
            y: y + Math.sin(ang) * 20,
            vx: Math.cos(ang) * 36,
            vy: Math.sin(ang) * 36 - 14,
            size: 2.2 + Math.random() * 2.0,
            elapsed: 0,
            duration: 460 + Math.random() * 260,
            tint: i % 2 === 0 ? 'ivory' : 'gold',
          });
        }
        ensureLoop();
      },

      playDaggerThrow: ({ startX, startY, endX, endY, didHit }) => {
        const s = stateRef.current;
        const dist = Math.hypot(endX - startX, endY - startY);
        s.thrownDaggers.push({
          startX,
          startY,
          endX,
          endY,
          didHit,
          impactSpawned: false,
          elapsed: 0,
          duration: Math.max(180, Math.min(320, dist * 0.95)),
        });
        ensureLoop();
      },

      playStealthSmoke: ({ x, y }) => {
        const s = stateRef.current;
        for (let i = 0; i < 20; i++) {
          const ang = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
          const speed = 35 + Math.random() * 95;
          s.shadowWisps.push({
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 14,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed - 12,
            startSize: 10 + Math.random() * 8,
            endSize: 28 + Math.random() * 14,
            elapsed: 0,
            duration: 520 + Math.random() * 280,
            tint: i % 3 === 0 ? 'violet' : 'shadow',
          });
        }
        ensureLoop();
      },

      playSprintBurst: ({ x, y }) => {
        const s = stateRef.current;
        s.sprintRings.push({ x, y, elapsed: 0, duration: 420 });
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2;
          const speed = 75 + Math.random() * 110;
          s.shadowWisps.push({
            x,
            y,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            startSize: 5 + Math.random() * 4,
            endSize: 14 + Math.random() * 6,
            elapsed: 0,
            duration: 320 + Math.random() * 160,
            tint: 'wind',
          });
        }
        ensureLoop();
      },

      playLethalityStrike: ({
        attackerX,
        attackerY,
        targetX,
        targetY,
        isCritical,
        fromStealth,
        didHit,
      }) => {
        const s = stateRef.current;
        const baseAngle = Math.atan2(targetY - attackerY, targetX - attackerX);

        // Pre-compute balanced radial speedline angles for crisp impact flash
        const lineCount = isCritical ? 16 : 10;
        const speedlineAngles: number[] = [];
        for (let k = 0; k < lineCount; k++) {
          speedlineAngles.push(
            (k / lineCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.22
          );
        }

        // Launch shadow wisps from attacker's departure point (shadow blink feel)
        const departCount = fromStealth ? 14 : 8;
        for (let k = 0; k < departCount; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 25 + Math.random() * 65;
          s.shadowWisps.push({
            x: attackerX + (Math.random() - 0.5) * 12,
            y: attackerY + (Math.random() - 0.5) * 12,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            startSize: 7 + Math.random() * 5,
            endSize: 20 + Math.random() * 10,
            elapsed: 0,
            duration: 380 + Math.random() * 200,
            tint: fromStealth && k % 2 === 0 ? 'violet' : 'shadow',
          });
        }

        s.lethalityStrikes.push({
          attackerX,
          attackerY,
          targetX,
          targetY,
          angle: baseAngle,
          isCritical,
          fromStealth,
          didHit,
          impactSpawned: false,
          elapsed: 0,
          duration: isCritical ? 920 : 780,
          speedlineAngles,
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
        s.swordArcSlashes = [];
        s.slashScars = [];
        s.steelSparks = [];
        s.martialShockwaves = [];
        s.gallantChargeBeams = [];
        s.raiseGuardShields = [];
        s.divineBeams = [];
        s.holyHeals = [];
        s.consecrations = [];
        s.sacredShields = [];
        s.holyMotes = [];
        s.thrownDaggers = [];
        s.shadowWisps = [];
        s.sprintRings = [];
        s.lethalityStrikes = [];
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
