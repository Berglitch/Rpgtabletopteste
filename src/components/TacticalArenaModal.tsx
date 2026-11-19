import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  ChevronUp,
  Compass,
  Droplet,
  Flame,
  Footprints,
  Heart,
  LocateFixed,
  Megaphone,
  Music,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  StepForward,
  Swords,
  Terminal,
  Trophy,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { gameAudio } from '../game/audio';
import {
  ARCANE_BOLT_MP_COST,
  ARCANE_BOLT_RANGE_CELLS,
  ARCANE_BOLT_UPGRADED_MP_COST,
  ARCANE_SHIELD_MP_COST,
  BASIC_ATTACK_EP_COST,
  BOARD_PIXEL_H,
  BOARD_PIXEL_W,
  CELL_PIXEL_SIZE,
  DOUBLE_STRIKE_EP_COST,
  DRYAD_GREEN_BLOOD_HEAL_PCT,
  DRYAD_GREEN_BLOOD_HP_THRESHOLD,
  DRYAD_GREEN_BLOOD_ROUNDS,
  DWARF_RIGID_SKIN_LOW_HP_THRESHOLD,
  FIRE_BREATH_CONE_CELLS,
  FIRE_BREATH_HALF_ANGLE_DEG,
  FIRE_BREATH_MP_COST,
  GOBLIN_PORTRAIT_URL,
  GRID_COLS,
  GRID_ROWS,
  HUMAN_BEYOND_LIMIT_BONUS_DAMAGE,
  HUMAN_BEYOND_LIMIT_ROUNDS,
  MAX_MOVE_METERS,
  PASSIVE_EP_REGEN,
  REACTION_SKILLS,
  TACTICAL_OBSTACLES,
  TAUNT_DURATION_ROUNDS,
  TAUNT_EP_COST,
  TAUNT_RANGE_CELLS,
  calculateKnockbackTrajectory,
  computeGoblinMove,
  createInitialCombatState,
  evaluateReactionSkill,
  getArcaneBoltDamage,
  getArcaneShieldAmount,
  getCharacterPortraitUrl,
  getDistance,
  getDistanceMeters,
  getFireBreathConeCells,
  getFireBreathDamage,
  getMageBasicAttackRange,
  getReachableCells,
  getReactionSkillsForClass,
  getSecondaryStats,
  isObstacleCell,
  resolveCombatAttack,
  rollEvasionOnly,
  rollHitAndEvasion,
  rollMageBasicAttackDamage,
  rollPlayerWeaponDamage,
} from '../game/engine';
import type {
  AudioPrefs,
  CharacterState,
  CombatLogEntry,
  CombatState,
  CombatTone,
  GridPos,
  PendingAttack,
} from '../game/types';
import { PortraitImage } from './PortraitImage';
import { SpellVfxCanvas, type SpellVfxCanvasHandle } from './SpellVfxCanvas';

interface TacticalArenaModalProps {
  isOpen: boolean;
  character: CharacterState;
  onClose: () => void;
}

interface SlashVfx {
  id: number;
  x: number;
  y: number;
  angleDeg: number;
  kind: 'slash' | 'heavy';
}

interface ParryVfx {
  id: number;
  x: number;
  y: number;
}

interface TauntVfx {
  id: number;
  x: number;
  y: number;
}

interface ArcaneShieldVfx {
  id: number;
  x: number;
  y: number;
}

interface FloatingTextVfx {
  id: number;
  x: number;
  y: number;
  text: string;
  variant:
    | 'damage'
    | 'parry'
    | 'stun'
    | 'crit'
    | 'evade'
    | 'miss'
    | 'taunt'
    | 'heal'
    | 'limit'
    | 'arcane'
    | 'fire'
    | 'shield';
}

interface DustVfx {
  id: number;
  x: number;
  y: number;
  kind: 'footstep' | 'knockback';
}

interface MovingActor {
  who: 'player' | 'enemy';
  left: number;
  top: number;
  transitionMs: number;
  knockback?: boolean;
}

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.2;

export function TacticalArenaModal({ isOpen, character, onClose }: TacticalArenaModalProps) {
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [bannerKey, setBannerKey] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState<AudioPrefs>(() => gameAudio.getPrefs());
  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
  const [hoveredToken, setHoveredToken] = useState<'player' | 'enemy' | null>(null);
  const [isStandardActionOpen, setIsStandardActionOpen] = useState(false);

  // Camera state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1, smooth: false });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    wasDragged: false,
    startMouseX: 0,
    startMouseY: 0,
    startCamX: 0,
    startCamY: 0,
  });

  // VFX state
  const [slashVfxs, setSlashVfxs] = useState<SlashVfx[]>([]);
  const [parryVfxs, setParryVfxs] = useState<ParryVfx[]>([]);
  const [tauntVfxs, setTauntVfxs] = useState<TauntVfx[]>([]);
  const [arcaneShieldVfxs, setArcaneShieldVfxs] = useState<ArcaneShieldVfx[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextVfx[]>([]);
  const [dustVfxs, setDustVfxs] = useState<DustVfx[]>([]);
  const [movingActor, setMovingActor] = useState<MovingActor | null>(null);
  const [hitTarget, setHitTarget] = useState<'player' | 'enemy' | null>(null);
  const [lungeState, setLungeState] = useState<{
    who: 'player' | 'enemy';
    dx: number;
    dy: number;
    scale: number;
  } | null>(null);
  const [isViewportShaking, setIsViewportShaking] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const spellVfxRef = useRef<SpellVfxCanvasHandle | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const combatRef = useRef<CombatState | null>(null);
  const sessionIdRef = useRef(0);
  const nextIdRef = useRef(1);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const executeGoblinTurnRef = useRef<(sessionId: number) => Promise<void>>(async () => {});
  const resolveIncomingAttackRef = useRef<
    (attack: PendingAttack, reactionId: string) => Promise<void>
  >(async () => {});

  const isMage = character.classId === 'mage';
  const availableReactions = useMemo(
    () => getReactionSkillsForClass(character.classId),
    [character.classId]
  );
  const heroDisplayName = character.name.trim() || 'Valerius';
  const heroPortraitUrl = useMemo(() => getCharacterPortraitUrl(character), [character]);

  const getLivePlayerStats = useCallback(
    (playerState?: CombatState['player']) => {
      const beyondLimitActive = (playerState?.beyondLimitTurns ?? 0) > 0;
      const bonusDamage = beyondLimitActive ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
      const isDwarfLowHp =
        character.raceId === 'dwarf' &&
        !!playerState &&
        playerState.hp > 0 &&
        playerState.hp / playerState.maxHp <= DWARF_RIGID_SKIN_LOW_HP_THRESHOLD;
      return getSecondaryStats(character, {
        bonusPhysicalDamage: bonusDamage,
        bonusMagicDamage: bonusDamage,
        isDwarfLowHp,
      });
    },
    [character]
  );

  const playerStats = useMemo(
    () => getLivePlayerStats(combat?.player),
    [combat?.player, getLivePlayerStats]
  );
  const dmgRange = playerStats.physicalDamage;

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const updateCombat = useCallback((updater: (prev: CombatState) => CombatState) => {
    setCombat((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      combatRef.current = next;
      return next;
    });
  }, []);

  const appendLog = useCallback((tone: CombatTone, text: string, tag?: string, detail?: string) => {
    const id = nextIdRef.current++;
    setCombatLog((prev) => [...prev, { id, tone, tag, text, detail }]);
  }, []);

  // Close Ação Padrão menu or Fire Breath aiming on outside click / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStandardActionOpen(false);
        setHoveredCellKey(null);
        updateCombat((prev) =>
          prev.isFireBreathModeActive || prev.isMoveModeActive
            ? { ...prev, isFireBreathModeActive: false, isMoveModeActive: false }
            : prev
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (!isStandardActionOpen) {
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    const handlePointerDown = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setIsStandardActionOpen(false);
      }
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStandardActionOpen, updateCombat]);

  const clampCameraValues = useCallback((x: number, y: number, zoom: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return { x, y, zoom };
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    if (vw === 0 || vh === 0) return { x, y, zoom };

    const scaledW = BOARD_PIXEL_W * zoom;
    const scaledH = BOARD_PIXEL_H * zoom;
    const margin = 70;

    let cx = x;
    let cy = y;

    if (scaledW <= vw) {
      const center = (vw - scaledW) / 2;
      const slack = Math.min(100, (vw - scaledW) / 2 + 40);
      cx = Math.max(center - slack, Math.min(center + slack, cx));
    } else {
      cx = Math.max(vw - scaledW - margin, Math.min(margin, cx));
    }

    if (scaledH <= vh) {
      const center = (vh - scaledH) / 2;
      const slack = Math.min(80, (vh - scaledH) / 2 + 40);
      cy = Math.max(center - slack, Math.min(center + slack, cy));
    } else {
      cy = Math.max(vh - scaledH - margin, Math.min(margin, cy));
    }

    return { x: cx, y: cy, zoom };
  }, []);

  const centerCamera = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    if (vw === 0 || vh === 0) return;

    const fitZoom = Math.min(1, (vw - 24) / BOARD_PIXEL_W, (vh - 20) / BOARD_PIXEL_H);
    const zoom = Math.max(MIN_ZOOM, Math.min(1, Number(fitZoom.toFixed(2))));
    const x = (vw - BOARD_PIXEL_W * zoom) / 2;
    const y = (vh - BOARD_PIXEL_H * zoom) / 2;
    setCamera({ x, y, zoom, smooth: true });
  }, []);

  const zoomAtPoint = useCallback(
    (targetZoom: number, pivotX: number, pivotY: number, smooth: boolean) => {
      setCamera((prev) => {
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
        const ratio = clampedZoom / prev.zoom;
        const nextX = pivotX - (pivotX - prev.x) * ratio;
        const nextY = pivotY - (pivotY - prev.y) * ratio;
        const clamped = clampCameraValues(nextX, nextY, clampedZoom);
        return { ...clamped, smooth };
      });
    },
    [clampCameraValues]
  );

  const setZoomCentered = useCallback(
    (targetZoom: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      zoomAtPoint(targetZoom, viewport.clientWidth / 2, viewport.clientHeight / 2, true);
    },
    [zoomAtPoint]
  );

  // VFX helpers
  const triggerFloatingStatus = useCallback(
    (targetPos: GridPos, text: string, variant: FloatingTextVfx['variant']) => {
      const cx = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const textId = nextIdRef.current++;
      setFloatingTexts((prev) => [
        ...prev,
        { id: textId, x: cx, y: cy - 22, text, variant },
      ]);
      scheduleTimeout(() => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)), 1080);
    },
    [scheduleTimeout]
  );

  const triggerTauntVfx = useCallback(
    (targetPos: GridPos, durationRounds: number) => {
      gameAudio.playTauntShout();
      const cx = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const tauntId = nextIdRef.current++;
      setTauntVfxs((prev) => [...prev, { id: tauntId, x: cx, y: cy }]);
      scheduleTimeout(() => setTauntVfxs((prev) => prev.filter((v) => v.id !== tauntId)), 650);
      triggerFloatingStatus(targetPos, `PROVOCADO (${durationRounds}R)`, 'taunt');
    },
    [scheduleTimeout, triggerFloatingStatus]
  );

  const triggerSlashVfx = useCallback(
    (
      attackerPos: GridPos,
      targetPos: GridPos,
      damage: number,
      attacker: 'player' | 'enemy',
      target: 'player' | 'enemy',
      customLabel?: string,
      isCritical = false
    ) => {
      gameAudio.playSwordSlash();
      const lx = (targetPos.x - attackerPos.x) * 18;
      const ly = (targetPos.y - attackerPos.y) * 18;
      setLungeState({ who: attacker, dx: lx, dy: ly, scale: isCritical ? 1.2 : 1.12 });
      scheduleTimeout(() => setLungeState(null), 160);

      const cx = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const angleDeg =
        (Math.atan2(targetPos.y - attackerPos.y, targetPos.x - attackerPos.x) * 180) / Math.PI;
      const slashId = nextIdRef.current++;
      const textId = nextIdRef.current++;

      setSlashVfxs((prev) => [
        ...prev,
        { id: slashId, x: cx - 48, y: cy - 48, angleDeg: angleDeg - 25, kind: 'slash' },
      ]);
      setHitTarget(target);
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: textId,
          x: cx,
          y: cy - 18,
          text: customLabel ?? (isCritical ? `CRÍTICO -${damage}!` : `-${damage}`),
          variant: isCritical ? 'crit' : 'damage',
        },
      ]);

      scheduleTimeout(() => setHitTarget((cur) => (cur === target ? null : cur)), 430);
      scheduleTimeout(() => setSlashVfxs((prev) => prev.filter((v) => v.id !== slashId)), 560);
      scheduleTimeout(() => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)), 1050);
    },
    [scheduleTimeout]
  );

  const triggerParryVfx = useCallback(
    (enemyPos: GridPos, playerPos: GridPos, parryRollDmg: number, finalDamage: number) => {
      gameAudio.playParryClang();
      const midX = ((enemyPos.x + playerPos.x) / 2) * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const midY = ((enemyPos.y + playerPos.y) / 2) * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const playerCx = playerPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const playerCy = playerPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;

      const parryId = nextIdRef.current++;
      const textId = nextIdRef.current++;

      setLungeState({
        who: 'player',
        dx: (enemyPos.x - playerPos.x) * 10,
        dy: (enemyPos.y - playerPos.y) * 10,
        scale: 1.1,
      });
      scheduleTimeout(() => setLungeState(null), 220);

      setParryVfxs((prev) => [...prev, { id: parryId, x: midX - 56, y: midY - 56 }]);
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: textId,
          x: playerCx,
          y: playerCy - 24,
          text:
            finalDamage === 0
              ? `APARADO (-${parryRollDmg})`
              : `APAROU -${parryRollDmg} · -${finalDamage} HP`,
          variant: 'parry',
        },
      ]);

      if (finalDamage > 0) {
        setHitTarget('player');
        scheduleTimeout(() => setHitTarget((cur) => (cur === 'player' ? null : cur)), 420);
      }

      scheduleTimeout(() => setParryVfxs((prev) => prev.filter((v) => v.id !== parryId)), 620);
      scheduleTimeout(() => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)), 1120);
    },
    [scheduleTimeout]
  );

  const triggerViewportShake = useCallback(() => {
    setIsViewportShaking(false);
    requestAnimationFrame(() => {
      setIsViewportShaking(true);
    });
    scheduleTimeout(() => setIsViewportShaking(false), 380);
  }, [scheduleTimeout]);

  const triggerHeavyBlowVfx = useCallback(
    (attackerPos: GridPos, targetPos: GridPos, damage: number, showDamageText: boolean) => {
      gameAudio.playHeavySmash();
      triggerViewportShake();
      setLungeState({
        who: 'enemy',
        dx: (targetPos.x - attackerPos.x) * 24,
        dy: (targetPos.y - attackerPos.y) * 24,
        scale: 1.2,
      });
      scheduleTimeout(() => setLungeState(null), 170);

      const cx = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const angleDeg =
        (Math.atan2(targetPos.y - attackerPos.y, targetPos.x - attackerPos.x) * 180) / Math.PI;

      const slashId = nextIdRef.current++;
      setSlashVfxs((prev) => [
        ...prev,
        { id: slashId, x: cx - 58, y: cy - 58, angleDeg: angleDeg - 20, kind: 'heavy' },
      ]);
      scheduleTimeout(() => setSlashVfxs((prev) => prev.filter((v) => v.id !== slashId)), 700);

      if (showDamageText) {
        const textId = nextIdRef.current++;
        setFloatingTexts((prev) => [
          ...prev,
          { id: textId, x: cx, y: cy - 22, text: `-${damage} GOLPE PESADO`, variant: 'damage' },
        ]);
        scheduleTimeout(() => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)), 980);
      }
    },
    [scheduleTimeout]
  );

  // Mage Spell VFX 1: Seta Arcana (Canvas 2D runic circle, curved mana lance, helical ribbons & detonation)
  const triggerArcaneBoltVfx = useCallback(
    (
      fromPos: GridPos,
      toPos: GridPos,
      hitLabel?: string,
      showImpactHit = true,
      curveSign = 0.35
    ) => {
      gameAudio.playArcaneBolt();
      const startX = fromPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const startY = fromPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const endX = toPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const endY = toPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const travelMs = 300;

      spellVfxRef.current?.playArcaneBolt({
        startX,
        startY,
        endX,
        endY,
        curveSign,
        hitImpact: showImpactHit,
        travelMs,
      });

      scheduleTimeout(() => {
        if (showImpactHit) {
          setHitTarget('enemy');
          scheduleTimeout(() => setHitTarget((cur) => (cur === 'enemy' ? null : cur)), 360);
        }

        if (hitLabel) {
          const textId = nextIdRef.current++;
          setFloatingTexts((prev) => [
            ...prev,
            {
              id: textId,
              x: endX,
              y: endY - 22,
              text: hitLabel,
              variant: showImpactHit ? 'arcane' : 'evade',
            },
          ]);
          scheduleTimeout(
            () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
            1060
          );
        }
      }, travelMs);
    },
    [scheduleTimeout]
  );

  // Mage Spell VFX 2: Escudo Arcano (runic hexagonal barrier around caster)
  const triggerArcaneShieldVfx = useCallback(
    (pos: GridPos, shieldAmount: number) => {
      gameAudio.playArcaneShield();
      const cx = pos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = pos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const shieldId = nextIdRef.current++;
      const textId = nextIdRef.current++;

      setArcaneShieldVfxs((prev) => [...prev, { id: shieldId, x: cx, y: cy }]);
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: textId,
          x: cx,
          y: cy - 26,
          text: `+${shieldAmount} SOBREVIDA`,
          variant: 'shield',
        },
      ]);

      scheduleTimeout(() => {
        setArcaneShieldVfxs((prev) => prev.filter((v) => v.id !== shieldId));
      }, 720);
      scheduleTimeout(() => {
        setFloatingTexts((prev) => prev.filter((v) => v.id !== textId));
      }, 1150);
    },
    [scheduleTimeout]
  );

  // Mage Spell VFX 3: Baforada de Fogo (Canvas 2D volumetric roaring dragonfire cone + embers)
  const triggerFireBreathVfx = useCallback(
    (fromPos: GridPos, aimPos: GridPos) => {
      gameAudio.playFireBreath();
      triggerViewportShake();
      const startX = fromPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const startY = fromPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const angleRad = Math.atan2(aimPos.y - fromPos.y, aimPos.x - fromPos.x);

      spellVfxRef.current?.playFireBreath({
        startX,
        startY,
        angleRad,
        rangePx: FIRE_BREATH_CONE_CELLS * CELL_PIXEL_SIZE + 14,
        halfAngleRad: (FIRE_BREATH_HALF_ANGLE_DEG * Math.PI) / 180,
      });
    },
    [triggerViewportShake]
  );

  const animateTokenPath = useCallback(
    (path: GridPos[], who: 'player' | 'enemy', sessionId: number): Promise<void> => {
      return new Promise((resolve) => {
        if (path.length < 2) {
          resolve();
          return;
        }
        const tokenOffset = (CELL_PIXEL_SIZE - 44) / 2;
        const stepDuration = 115;

        setHoveredToken(null);
        setMovingActor({
          who,
          left: path[0].x * CELL_PIXEL_SIZE + tokenOffset,
          top: path[0].y * CELL_PIXEL_SIZE + tokenOffset,
          transitionMs: 0,
        });

        gameAudio.playFootsteps(path.length - 1);

        let stepIdx = 1;
        const advance = () => {
          if (sessionIdRef.current !== sessionId) {
            setMovingActor(null);
            resolve();
            return;
          }
          if (stepIdx >= path.length) {
            setMovingActor(null);
            resolve();
            return;
          }

          const prevPt = path[stepIdx - 1];
          const nextPt = path[stepIdx];
          const dustId = nextIdRef.current++;
          setDustVfxs((prev) => [
            ...prev,
            {
              id: dustId,
              x: prevPt.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
              y: prevPt.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
              kind: 'footstep',
            },
          ]);
          scheduleTimeout(() => setDustVfxs((prev) => prev.filter((d) => d.id !== dustId)), 400);

          setMovingActor({
            who,
            left: nextPt.x * CELL_PIXEL_SIZE + tokenOffset,
            top: nextPt.y * CELL_PIXEL_SIZE + tokenOffset,
            transitionMs: stepDuration,
          });

          stepIdx++;
          scheduleTimeout(advance, stepDuration + 8);
        };

        requestAnimationFrame(() => {
          advance();
        });
      });
    },
    [scheduleTimeout]
  );

  const animateKnockbackPath = useCallback(
    (path: GridPos[], sessionId: number): Promise<void> => {
      return new Promise((resolve) => {
        if (path.length < 2) {
          resolve();
          return;
        }
        const tokenOffset = (CELL_PIXEL_SIZE - 44) / 2;
        const dest = path[path.length - 1];
        const totalDuration = Math.max(220, (path.length - 1) * 78);

        setHoveredToken(null);
        setMovingActor({
          who: 'player',
          left: path[0].x * CELL_PIXEL_SIZE + tokenOffset,
          top: path[0].y * CELL_PIXEL_SIZE + tokenOffset,
          transitionMs: 0,
          knockback: true,
        });

        path.forEach((pt, idx) => {
          if (idx === path.length - 1) return;
          scheduleTimeout(() => {
            if (sessionIdRef.current !== sessionId) return;
            const dustId = nextIdRef.current++;
            setDustVfxs((prev) => [
              ...prev,
              {
                id: dustId,
                x: pt.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
                y: pt.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
                kind: 'knockback',
              },
            ]);
            scheduleTimeout(() => setDustVfxs((prev) => prev.filter((d) => d.id !== dustId)), 580);
          }, idx * 65);
        });

        requestAnimationFrame(() => {
          if (sessionIdRef.current !== sessionId) {
            setMovingActor(null);
            resolve();
            return;
          }
          setMovingActor({
            who: 'player',
            left: dest.x * CELL_PIXEL_SIZE + tokenOffset,
            top: dest.y * CELL_PIXEL_SIZE + tokenOffset,
            transitionMs: totalDuration,
            knockback: true,
          });
        });

        scheduleTimeout(() => {
          setMovingActor(null);
          resolve();
        }, totalDuration + 40);
      });
    },
    [scheduleTimeout]
  );

  const completePlayerMovement = useCallback(
    async (x: number, y: number, path: GridPos[], cost: number, sessionId: number) => {
      if (sessionIdRef.current !== sessionId) return;
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        isAnimatingMove: true,
      }));

      await animateTokenPath(path, 'player', sessionId);
      if (sessionIdRef.current !== sessionId) return;

      updateCombat((prev) => ({
        ...prev,
        isAnimatingMove: false,
        player: {
          ...prev.player,
          x,
          y,
          hasMoved: true,
        },
      }));

      appendLog(
        'player',
        `Você usou Ação de Movimento e percorreu ${cost.toFixed(1).replace('.', ',')}m pelo campo de batalha.`,
        'AÇÃO DE MOVIMENTO'
      );
    },
    [animateTokenPath, appendLog, updateCombat]
  );

  const startPlayerTurn = useCallback(
    (sessionId: number) => {
      if (sessionIdRef.current !== sessionId) return;
      const cur = combatRef.current;
      if (!cur || !cur.isActive) return;

      const nextRound = cur.round + 1;
      const previousEp = cur.player.ep;
      const nextEp = Math.min(cur.player.maxEp, cur.player.ep + PASSIVE_EP_REGEN);
      const actualRegen = nextEp - previousEp;
      const isStunned = cur.player.stunnedTurns > 0;
      const hadTaunt = cur.enemy.tauntedTurns > 0;
      const nextEnemyTauntTurns = Math.max(0, cur.enemy.tauntedTurns - 1);

      // Dryad passive: Sangue Verde heals 2% of max HP at the start of player's turn for 3 rounds
      const hasGreenBloodTick =
        character.raceId === 'dryad' && cur.player.greenBloodTurns > 0 && cur.player.hp > 0;
      const greenBloodHealAmount = hasGreenBloodTick
        ? Math.max(1, Math.round(cur.player.maxHp * DRYAD_GREEN_BLOOD_HEAL_PCT))
        : 0;
      const nextPlayerHp = hasGreenBloodTick
        ? Math.min(cur.player.maxHp, cur.player.hp + greenBloodHealAmount)
        : cur.player.hp;
      const actualGreenBloodHeal = nextPlayerHp - cur.player.hp;
      const nextGreenBloodTurns = hasGreenBloodTick
        ? Math.max(0, cur.player.greenBloodTurns - 1)
        : cur.player.greenBloodTurns;

      setIsStandardActionOpen(false);
      updateCombat((prev) => ({
        ...prev,
        currentTurn: 'player',
        isMoveModeActive: false,
        isFireBreathModeActive: false,
        round: nextRound,
        player: {
          ...prev.player,
          hp: nextPlayerHp,
          ep: nextEp,
          hasMoved: isStunned,
          hasActed: isStunned,
          greenBloodTurns: nextGreenBloodTurns,
        },
        enemy: {
          ...prev.enemy,
          tauntedTurns: nextEnemyTauntTurns,
          tauntedBy: nextEnemyTauntTurns > 0 ? prev.enemy.tauntedBy : null,
        },
      }));

      if (hasGreenBloodTick) {
        triggerFloatingStatus(
          { x: cur.player.x, y: cur.player.y },
          `+${actualGreenBloodHeal} HP · SANGUE VERDE`,
          'heal'
        );
        appendLog(
          'player',
          `Sangue Verde regenerou +${actualGreenBloodHeal} de Vida (2% da Vida máxima).${
            nextGreenBloodTurns > 0
              ? ` Restam ${nextGreenBloodTurns} rodada(s).`
              : ' O efeito se encerrou.'
          }`,
          'SANGUE VERDE'
        );
      }

      if (hadTaunt && nextEnemyTauntTurns === 0) {
        appendLog(
          'info',
          `O efeito de Provocar I sobre o ${cur.enemy.name} chegou ao fim.`,
          'PROVOCAR I'
        );
      }

      if (isStunned) {
        appendLog(
          'warning',
          `Rodada ${nextRound} — Você está atordoado! Seu turno será encerrado automaticamente.`,
          'ATORDOADO',
          actualRegen > 0 ? `+${actualRegen} EP regenerados` : undefined
        );

        scheduleTimeout(() => {
          if (sessionIdRef.current !== sessionId) return;
          const latest = combatRef.current;
          if (!latest || !latest.isActive) return;

          const hadBeyondLimit = latest.player.beyondLimitTurns > 0;
          const nextBeyondLimitTurns = Math.max(0, latest.player.beyondLimitTurns - 1);

          updateCombat((prev) => ({
            ...prev,
            currentTurn: 'enemy',
            isMoveModeActive: false,
            player: {
              ...prev.player,
              stunnedTurns: Math.max(0, prev.player.stunnedTurns - 1),
              beyondLimitTurns: nextBeyondLimitTurns,
            },
          }));

          if (hadBeyondLimit && nextBeyondLimitTurns === 0) {
            appendLog('info', 'O efeito de Além do Limite (+5 de dano) chegou ao fim.', 'ALÉM DO LIMITE');
          }

          appendLog(
            'info',
            'Turno perdido por atordoamento. Você recobrou os sentidos para a próxima rodada.',
            'RECUPERAÇÃO'
          );

          scheduleTimeout(() => {
            if (sessionIdRef.current !== sessionId) return;
            void executeGoblinTurnRef.current(sessionId);
          }, 700);
        }, 1250);
      } else {
        appendLog(
          'player',
          `Seu turno começou (Rodada ${nextRound}).`,
          'SEU TURNO',
          actualRegen > 0 ? `+${actualRegen} EP regenerados` : undefined
        );
      }
    },
    [appendLog, character.raceId, scheduleTimeout, triggerFloatingStatus, updateCombat]
  );

  const executeGoblinTurn = useCallback(
    async (sessionId: number) => {
      if (sessionIdRef.current !== sessionId) return;
      const current = combatRef.current;
      if (!current || !current.isActive) return;

      setIsStandardActionOpen(false);

      if (current.enemy.stunnedTurns > 0) {
        updateCombat((prev) => ({
          ...prev,
          enemy: {
            ...prev.enemy,
            stunnedTurns: Math.max(0, prev.enemy.stunnedTurns - 1),
          },
        }));
        appendLog(
          'warning',
          'O Goblin Espadachim está atordoado e perde o turno automaticamente!',
          'ATORDOADO'
        );
        scheduleTimeout(() => {
          if (sessionIdRef.current !== sessionId) return;
          startPlayerTurn(sessionId);
        }, 900);
        return;
      }

      appendLog('enemy', 'O Goblin Espadachim inicia seu turno.', 'TURNO DO GOBLIN');

      if (current.enemy.tauntedTurns > 0) {
        appendLog(
          'warning',
          `Sob efeito de Provocar I (${current.enemy.tauntedTurns} rodada(s) restante(s)), o ${current.enemy.name} é obrigado a avançar e atacar ${current.enemy.tauntedBy || heroDisplayName}!`,
          'PROVOCADO'
        );
      }

      updateCombat((prev) => ({
        ...prev,
        enemy: {
          ...prev.enemy,
          heavyBlowCooldown: Math.max(0, prev.enemy.heavyBlowCooldown - 1),
        },
      }));

      const afterCd = combatRef.current!;
      const { path: goblinPath, metersSpent } = computeGoblinMove(
        { x: afterCd.enemy.x, y: afterCd.enemy.y },
        { x: afterCd.player.x, y: afterCd.player.y }
      );

      if (goblinPath.length > 1) {
        const enemyStartsAdjacent =
          getDistance(afterCd.player.x, afterCd.player.y, afterCd.enemy.x, afterCd.enemy.y) <= 1;

        if (
          enemyStartsAdjacent &&
          afterCd.player.hp > 0 &&
          afterCd.player.stunnedTurns <= 0 &&
          (isMage || character.equippedWeapon !== null)
        ) {
          const bonusDmg =
            afterCd.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
          const oppBaseDamage = isMage
            ? rollMageBasicAttackDamage(character, bonusDmg)
            : rollPlayerWeaponDamage(character, bonusDmg);
          const oppResult = resolveCombatAttack({
            damageType: 'physical',
            baseDamage: oppBaseDamage,
            attackerHitChance: playerStats.hitChance,
            attackerCritChance: playerStats.critChance,
            defenderEvasionChance: afterCd.enemy.evasionChance,
            defenderPhysicalDefense: afterCd.enemy.physicalDefense,
            defenderMagicDefense: afterCd.enemy.magicDefense,
          });

          if (oppResult.outcome === 'missed') {
            gameAudio.playEvadeWhoosh();
            triggerFloatingStatus({ x: afterCd.enemy.x, y: afterCd.enemy.y }, 'ERROU!', 'miss');
            appendLog(
              'info',
              `Seu Ataque de Oportunidade contra o ${afterCd.enemy.name} errou o alvo!`,
              'ERROU'
            );
          } else if (oppResult.outcome === 'evaded') {
            gameAudio.playEvadeWhoosh();
            triggerFloatingStatus({ x: afterCd.enemy.x, y: afterCd.enemy.y }, 'EVADIU!', 'evade');
            appendLog(
              'warning',
              `O ${afterCd.enemy.name} evadiu do seu Ataque de Oportunidade, ignorando dano e efeitos!`,
              'EVASÃO'
            );
          } else {
            const oppDmg = oppResult.finalDamage;
            const nextEnemyHp = Math.max(0, afterCd.enemy.hp - oppDmg);
            const enemyDefeated = nextEnemyHp <= 0;

            updateCombat((prev) => ({
              ...prev,
              isActive: !enemyDefeated,
              outcome: enemyDefeated ? 'victory' : 'ongoing',
              enemy: {
                ...prev.enemy,
                hp: nextEnemyHp,
              },
            }));

            triggerSlashVfx(
              { x: afterCd.player.x, y: afterCd.player.y },
              { x: afterCd.enemy.x, y: afterCd.enemy.y },
              oppDmg,
              'player',
              'enemy',
              oppResult.isCritical
                ? `CRÍTICO -${oppDmg} OPORTUNIDADE!`
                : `-${oppDmg} OPORTUNIDADE`,
              oppResult.isCritical
            );

            const oppDetails: string[] = [];
            if (oppResult.isCritical) oppDetails.push('CRÍTICO +50%');
            if (oppResult.defenseApplied > 0) oppDetails.push(`-${oppResult.defenseApplied} Def. Fís.`);

            appendLog(
              'player',
              `Você aproveitou a movimentação do Goblin e desferiu um Ataque de Oportunidade causando ${oppDmg} de dano!`,
              'ATAQUE DE OPORTUNIDADE',
              oppDetails.length > 0 ? oppDetails.join(' · ') : undefined
            );

            if (enemyDefeated) {
              appendLog(
                'victory',
                `VITÓRIA! Você derrotou o ${afterCd.enemy.name} com um Ataque de Oportunidade!`,
                'GLÓRIA'
              );
              scheduleTimeout(() => {
                if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
              }, 280);
              return;
            }
          }

          await new Promise<void>((resolve) => scheduleTimeout(resolve, 380));
          if (sessionIdRef.current !== sessionId) return;
        }

        updateCombat((prev) => ({ ...prev, isAnimatingMove: true }));
        await animateTokenPath(goblinPath, 'enemy', sessionId);
        if (sessionIdRef.current !== sessionId) return;

        const finalPos = goblinPath[goblinPath.length - 1];
        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: false,
          enemy: {
            ...prev.enemy,
            x: finalPos.x,
            y: finalPos.y,
          },
        }));

        appendLog(
          'enemy',
          `O Goblin avança pela vegetação (${metersSpent.toFixed(1).replace('.', ',')}m percorridos).`
        );
      }

      if (sessionIdRef.current !== sessionId) return;
      const afterMove = combatRef.current;
      if (!afterMove || !afterMove.isActive) return;

      const regenedEnemyEp = Math.min(afterMove.enemy.maxEp, afterMove.enemy.ep + PASSIVE_EP_REGEN);
      const dist = getDistance(
        afterMove.player.x,
        afterMove.player.y,
        afterMove.enemy.x,
        afterMove.enemy.y
      );

      const heavySkill = afterMove.enemy.skills.heavyBlow;
      const canUseHeavy =
        dist <= 1 && afterMove.enemy.heavyBlowCooldown <= 0 && regenedEnemyEp >= heavySkill.epCost;
      const canUseBasic = dist <= 1 && regenedEnemyEp >= BASIC_ATTACK_EP_COST;

      if (canUseHeavy) {
        const baseHeavyDmg = afterMove.enemy.dmg + heavySkill.bonusAttack;
        const contactOutcome = rollHitAndEvasion(
          afterMove.enemy.hitChance,
          playerStats.evasionChance
        );

        if (contactOutcome !== 'hit') {
          updateCombat((prev) => ({
            ...prev,
            enemy: {
              ...prev.enemy,
              ep: regenedEnemyEp - heavySkill.epCost,
              heavyBlowCooldown: heavySkill.cooldown,
            },
          }));
          gameAudio.playEvadeWhoosh();
          triggerFloatingStatus(
            { x: afterMove.player.x, y: afterMove.player.y },
            contactOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
            contactOutcome === 'evaded' ? 'evade' : 'miss'
          );
          appendLog(
            contactOutcome === 'evaded' ? 'player' : 'info',
            contactOutcome === 'evaded'
              ? `Você EVADIU de "${heavySkill.name}", ignorando todo o dano, o empurrão e o atordoamento!`
              : `O ${afterMove.enemy.name} errou "${heavySkill.name}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          scheduleTimeout(() => {
            if (sessionIdRef.current !== sessionId) return;
            const latest = combatRef.current;
            if (latest && latest.isActive && !latest.awaitingReaction) {
              startPlayerTurn(sessionId);
            }
          }, 950);
          return;
        }

        const isCritical = Math.random() * 100 < afterMove.enemy.critChance;
        const incomingDmg = isCritical ? Math.round(baseHeavyDmg * 1.5) : baseHeavyDmg;
        const pendingHeavy: PendingAttack = {
          attackerName: afterMove.enemy.name,
          attackName: heavySkill.name,
          damageType: 'physical',
          baseDamage: baseHeavyDmg,
          incomingDamage: incomingDmg,
          isCritical,
          isHeavyBlow: true,
          bonusAttack: heavySkill.bonusAttack,
          pushMeters: heavySkill.pushMeters,
          stunRounds: heavySkill.stunRounds,
        };

        if (availableReactions.length === 0) {
          updateCombat((prev) => ({
            ...prev,
            enemy: {
              ...prev.enemy,
              ep: regenedEnemyEp - heavySkill.epCost,
              heavyBlowCooldown: heavySkill.cooldown,
            },
          }));
          appendLog(
            'warning',
            `O Goblin ergue a lâmina e desfere "${heavySkill.name}" (${incomingDmg} dano físico${
              isCritical ? ' · CRÍTICO +50%' : ''
            }, empurrão 6m e atordoamento)!`,
            isCritical ? 'CRÍTICO INIMIGO' : 'SKILL INIMIGA'
          );
          await resolveIncomingAttackRef.current(pendingHeavy, 'none');
          return;
        }

        updateCombat((prev) => ({
          ...prev,
          awaitingReaction: true,
          pendingAttack: pendingHeavy,
          enemy: {
            ...prev.enemy,
            ep: regenedEnemyEp - heavySkill.epCost,
            heavyBlowCooldown: heavySkill.cooldown,
          },
        }));

        gameAudio.playReactionAlert();
        appendLog(
          'warning',
          `O Goblin ergue a lâmina e usa "${heavySkill.name}" (${incomingDmg} dano físico${
            isCritical ? ' · CRÍTICO +50%' : ''
          }, empurrão 6m e atordoamento)!`,
          isCritical ? 'CRÍTICO INIMIGO' : 'SKILL INIMIGA'
        );
        return;
      }

      if (canUseBasic) {
        const attackName = afterMove.enemy.attackName;
        const baseGoblinDmg = afterMove.enemy.dmg;
        const contactOutcome = rollHitAndEvasion(
          afterMove.enemy.hitChance,
          playerStats.evasionChance
        );

        if (contactOutcome !== 'hit') {
          updateCombat((prev) => ({
            ...prev,
            enemy: {
              ...prev.enemy,
              ep: regenedEnemyEp - BASIC_ATTACK_EP_COST,
            },
          }));
          gameAudio.playEvadeWhoosh();
          triggerFloatingStatus(
            { x: afterMove.player.x, y: afterMove.player.y },
            contactOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
            contactOutcome === 'evaded' ? 'evade' : 'miss'
          );
          appendLog(
            contactOutcome === 'evaded' ? 'player' : 'info',
            contactOutcome === 'evaded'
              ? `Você EVADIU de "${attackName}", ignorando completamente o dano e efeitos!`
              : `O ${afterMove.enemy.name} errou "${attackName}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          scheduleTimeout(() => {
            if (sessionIdRef.current !== sessionId) return;
            const latest = combatRef.current;
            if (latest && latest.isActive && !latest.awaitingReaction) {
              startPlayerTurn(sessionId);
            }
          }, 950);
          return;
        }

        const isCritical = Math.random() * 100 < afterMove.enemy.critChance;
        const incomingDmg = isCritical ? Math.round(baseGoblinDmg * 1.5) : baseGoblinDmg;
        const pendingBasic: PendingAttack = {
          attackerName: afterMove.enemy.name,
          attackName,
          damageType: 'physical',
          baseDamage: baseGoblinDmg,
          incomingDamage: incomingDmg,
          isCritical,
          isHeavyBlow: false,
        };

        if (availableReactions.length === 0) {
          updateCombat((prev) => ({
            ...prev,
            enemy: {
              ...prev.enemy,
              ep: regenedEnemyEp - BASIC_ATTACK_EP_COST,
            },
          }));
          await resolveIncomingAttackRef.current(pendingBasic, 'none');
          return;
        }

        updateCombat((prev) => ({
          ...prev,
          awaitingReaction: true,
          pendingAttack: pendingBasic,
          enemy: {
            ...prev.enemy,
            ep: regenedEnemyEp - BASIC_ATTACK_EP_COST,
          },
        }));

        gameAudio.playReactionAlert();
        appendLog(
          'warning',
          `O inimigo prepara "${attackName}" (${incomingDmg} dano físico${
            isCritical ? ' · CRÍTICO +50%' : ''
          }). Escolha sua reação.`,
          isCritical ? 'CRÍTICO IMINENTE' : 'ATAQUE IMINENTE'
        );
        return;
      }

      updateCombat((prev) => ({
        ...prev,
        enemy: {
          ...prev.enemy,
          ep: regenedEnemyEp,
        },
      }));

      appendLog('info', 'O Goblin não alcançou distância de ataque neste turno.');

      scheduleTimeout(() => {
        if (sessionIdRef.current !== sessionId) return;
        const latest = combatRef.current;
        if (latest && latest.isActive && !latest.awaitingReaction) {
          startPlayerTurn(sessionId);
        }
      }, 900);
    },
    [
      animateTokenPath,
      appendLog,
      availableReactions.length,
      character,
      heroDisplayName,
      isMage,
      playerStats.critChance,
      playerStats.evasionChance,
      playerStats.hitChance,
      scheduleTimeout,
      startPlayerTurn,
      triggerFloatingStatus,
      triggerSlashVfx,
      updateCombat,
    ]
  );

  useEffect(() => {
    executeGoblinTurnRef.current = executeGoblinTurn;
  }, [executeGoblinTurn]);

  const startNewCombat = useCallback(() => {
    clearAllTimers();
    const sessionId = ++sessionIdRef.current;

    setSlashVfxs([]);
    setParryVfxs([]);
    setTauntVfxs([]);
    setArcaneShieldVfxs([]);
    spellVfxRef.current?.clear();
    setFloatingTexts([]);
    setDustVfxs([]);
    setMovingActor(null);
    setHitTarget(null);
    setLungeState(null);
    setHoveredCellKey(null);
    setHoveredToken(null);
    setIsStandardActionOpen(false);

    const initial = createInitialCombatState(character);
    combatRef.current = initial;
    setCombat(initial);

    const name = character.name.trim() || 'Valerius';
    const firstActorLine =
      initial.currentTurn === 'player'
        ? `${name} venceu a Iniciativa e age primeiro!`
        : 'O Goblin foi mais rápido e age primeiro!';

    setCombatLog([
      {
        id: nextIdRef.current++,
        tone: 'warning',
        tag: 'COMBATE INICIADO',
        text: `Iniciativa: ${name} [${initial.player.initiativeRoll}] + ${character.attributes.dexterity} = ${initial.player.initiative} · Goblin [${initial.enemy.initiativeRoll}] + ${initial.enemy.dexterity} = ${initial.enemy.initiative}`,
      },
      {
        id: nextIdRef.current++,
        tone: initial.currentTurn === 'player' ? 'player' : 'enemy',
        tag: 'ORDEM',
        text: firstActorLine,
      },
    ]);

    setBannerKey((k) => k + 1);
    setShowBanner(true);
    scheduleTimeout(() => {
      if (sessionIdRef.current === sessionId) setShowBanner(false);
    }, 2650);

    gameAudio.playCombatStartHorn();
    gameAudio.startBattleMusic();
    setAudioPrefs(gameAudio.getPrefs());

    requestAnimationFrame(() => {
      centerCamera();
    });

    if (initial.currentTurn === 'enemy') {
      scheduleTimeout(() => {
        void executeGoblinTurn(sessionId);
      }, 1450);
    }
  }, [centerCamera, character, clearAllTimers, executeGoblinTurn, scheduleTimeout]);

  // Open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startNewCombat();
    } else {
      clearAllTimers();
      sessionIdRef.current++;
      gameAudio.stopBattleMusic();
      setCombat(null);
      combatRef.current = null;
      setIsStandardActionOpen(false);
    }

    return () => {
      clearAllTimers();
      gameAudio.stopBattleMusic();
    };
  }, [isOpen, startNewCombat, clearAllTimers]);

  // Auto-scroll combat log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  // Re-clamp camera on window resize
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      setCamera((prev) => ({
        ...clampCameraValues(prev.x, prev.y, prev.zoom),
        smooth: false,
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampCameraValues, isOpen]);

  // Wheel zoom listener
  useEffect(() => {
    if (!isOpen) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      setCamera((prev) => {
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + delta));
        const ratio = clampedZoom / prev.zoom;
        const nextX = mouseX - (mouseX - prev.x) * ratio;
        const nextY = mouseY - (mouseY - prev.y) * ratio;
        const clamped = clampCameraValues(nextX, nextY, clampedZoom);
        return { ...clamped, smooth: false };
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [clampCameraValues, isOpen]);

  // Global mouse drag tracking for camera pan
  useEffect(() => {
    if (!isOpen) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startMouseX;
      const dy = e.clientY - dragRef.current.startMouseY;
      if (!dragRef.current.wasDragged && Math.hypot(dx, dy) > 4) {
        dragRef.current.wasDragged = true;
        setIsDragging(true);
        setHoveredToken(null);
      }
      if (dragRef.current.wasDragged) {
        setCamera((prev) => ({
          ...clampCameraValues(
            dragRef.current.startCamX + dx,
            dragRef.current.startCamY + dy,
            prev.zoom
          ),
          smooth: false,
        }));
      }
    };

    const onMouseUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
      setTimeout(() => {
        dragRef.current.wasDragged = false;
      }, 0);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [clampCameraValues, isOpen]);

  const handleViewportMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-reaction-overlay="true"]')) return;
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    if (e.button === 1) e.preventDefault();
    dragRef.current = {
      active: true,
      wasDragged: false,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startCamX: camera.x,
      startCamY: camera.y,
    };
  };

  const handleViewportTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-reaction-overlay="true"]')) return;
    if (e.touches.length !== 1) return;
    dragRef.current = {
      active: true,
      wasDragged: false,
      startMouseX: e.touches[0].clientX,
      startMouseY: e.touches[0].clientY,
      startCamX: camera.x,
      startCamY: camera.y,
    };
  };

  const handleViewportTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragRef.current.startMouseX;
    const dy = e.touches[0].clientY - dragRef.current.startMouseY;
    if (!dragRef.current.wasDragged && Math.hypot(dx, dy) > 5) {
      dragRef.current.wasDragged = true;
      setIsDragging(true);
      setHoveredToken(null);
    }
    if (dragRef.current.wasDragged) {
      setCamera((prev) => ({
        ...clampCameraValues(
          dragRef.current.startCamX + dx,
          dragRef.current.startCamY + dy,
          prev.zoom
        ),
        smooth: false,
      }));
    }
  };

  const handleViewportTouchEnd = () => {
    dragRef.current.active = false;
    setIsDragging(false);
    setTimeout(() => {
      dragRef.current.wasDragged = false;
    }, 0);
  };

  // Reachable cells (6.0m limit)
  const reachableMap = useMemo(() => {
    if (
      !combat ||
      !combat.isActive ||
      !combat.isMoveModeActive ||
      combat.currentTurn !== 'player' ||
      combat.player.hasMoved ||
      combat.player.stunnedTurns > 0
    ) {
      return new Map();
    }
    const blocked: GridPos[] = [
      ...TACTICAL_OBSTACLES,
      ...(combat.enemy.hp > 0 ? [{ x: combat.enemy.x, y: combat.enemy.y }] : []),
    ];
    return getReachableCells(combat.player.x, combat.player.y, MAX_MOVE_METERS, blocked);
  }, [combat]);

  const hoveredPathSet = useMemo(() => {
    if (!hoveredCellKey) return new Set<string>();
    const cell = reachableMap.get(hoveredCellKey);
    if (!cell) return new Set<string>();
    return new Set<string>(cell.path.map((p: GridPos) => `${p.x},${p.y}`));
  }, [hoveredCellKey, reachableMap]);

  // Interactive 6m Fire Breath cone preview when aiming
  const hoveredFireConeSet = useMemo(() => {
    if (
      !combat ||
      !combat.isActive ||
      !combat.isFireBreathModeActive ||
      combat.currentTurn !== 'player' ||
      combat.player.hasActed ||
      !hoveredCellKey
    ) {
      return new Set<string>();
    }
    const [hx, hy] = hoveredCellKey.split(',').map(Number);
    if (Number.isNaN(hx) || Number.isNaN(hy)) return new Set<string>();
    if (hx === combat.player.x && hy === combat.player.y) return new Set<string>();
    const cells = getFireBreathConeCells(
      { x: combat.player.x, y: combat.player.y },
      { x: hx, y: hy }
    );
    return new Set<string>(cells.map((c) => `${c.x},${c.y}`));
  }, [combat, hoveredCellKey]);

  const handleToggleMoveMode = () => {
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasMoved ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }
    setIsStandardActionOpen(false);
    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: !prev.isMoveModeActive,
      isFireBreathModeActive: false,
    }));
  };

  // Mage Spell 3 Execution: Baforada de Fogo (9 MP, 6m cone, 12 fire damage)
  const executeFireBreath = (aimCell: GridPos) => {
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      !cur.isFireBreathModeActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (aimCell.x === cur.player.x && aimCell.y === cur.player.y) {
      return;
    }

    if (cur.player.mp < FIRE_BREATH_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Baforada de Fogo! Necessário ${FIRE_BREATH_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      updateCombat((prev) => ({ ...prev, isFireBreathModeActive: false }));
      return;
    }

    const sessionId = sessionIdRef.current;
    const origin = { x: cur.player.x, y: cur.player.y };
    const coneCells = getFireBreathConeCells(origin, aimCell);
    const enemyInCone =
      cur.enemy.hp > 0 &&
      coneCells.some((c) => c.x === cur.enemy.x && c.y === cur.enemy.y);
    const nextPlayerMp = Math.max(0, cur.player.mp - FIRE_BREATH_MP_COST);

    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isFireBreathModeActive: false,
      isMoveModeActive: false,
      player: {
        ...prev.player,
        mp: nextPlayerMp,
        hasActed: true,
      },
    }));

    triggerFireBreathVfx(origin, aimCell);

    if (!enemyInCone) {
      appendLog(
        'player',
        'Você liberou uma Baforada de Fogo em cone de 6,0m, incinerando o terreno à frente (nenhum inimigo na área).',
        'BAFORADA DE FOGO',
        `-${FIRE_BREATH_MP_COST} MP`
      );
      return;
    }

    const bonusMagicDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const baseFireDamage = getFireBreathDamage(bonusMagicDmg);
    const attackResult = resolveCombatAttack({
      damageType: 'magical',
      baseDamage: baseFireDamage,
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: 0,
      defenderEvasionChance: cur.enemy.evasionChance,
      defenderPhysicalDefense: cur.enemy.physicalDefense,
      defenderMagicDefense: cur.enemy.magicDefense,
    });

    scheduleTimeout(() => {
      if (sessionIdRef.current !== sessionId) return;
      const latest = combatRef.current;
      if (!latest || !latest.isActive) return;

      if (attackResult.outcome !== 'hit') {
        gameAudio.playEvadeWhoosh();
        triggerFloatingStatus(
          { x: latest.enemy.x, y: latest.enemy.y },
          attackResult.outcome === 'evaded' ? 'EVADIU!' : 'RESISTIU!',
          attackResult.outcome === 'evaded' ? 'evade' : 'miss'
        );
        appendLog(
          'warning',
          attackResult.outcome === 'evaded'
            ? `O ${latest.enemy.name} evadiu das chamas da Baforada de Fogo!`
            : `As chamas da Baforada de Fogo não acertaram o ${latest.enemy.name}!`,
          'BAFORADA DE FOGO',
          `-${FIRE_BREATH_MP_COST} MP`
        );
        return;
      }

      const finalDmg = attackResult.finalDamage;
      const nextEnemyHp = Math.max(0, latest.enemy.hp - finalDmg);
      const defeated = nextEnemyHp <= 0;

      updateCombat((prev) => ({
        ...prev,
        isActive: !defeated,
        outcome: defeated ? 'victory' : 'ongoing',
        enemy: {
          ...prev.enemy,
          hp: nextEnemyHp,
        },
      }));

      setHitTarget('enemy');
      scheduleTimeout(() => setHitTarget((t) => (t === 'enemy' ? null : t)), 380);

      const ex = latest.enemy.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const ey = latest.enemy.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const textId = nextIdRef.current++;
      setFloatingTexts((prev) => [
        ...prev,
        { id: textId, x: ex, y: ey - 22, text: `-${finalDmg} FOGO`, variant: 'fire' },
      ]);
      scheduleTimeout(
        () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
        1120
      );

      const details = [`-${FIRE_BREATH_MP_COST} MP`];
      if (attackResult.defenseApplied > 0) {
        details.push(`-${attackResult.defenseApplied} Def. Mág.`);
      }

      appendLog(
        'player',
        `Baforada de Fogo envolveu o ${latest.enemy.name} em um cone de 6,0m causando ${finalDmg} de dano de fogo!`,
        'BAFORADA DE FOGO',
        details.join(' · ')
      );

      if (defeated) {
        appendLog(
          'victory',
          `VITÓRIA! Você incinerou o ${latest.enemy.name} com a Baforada de Fogo!`,
          'GLÓRIA'
        );
        scheduleTimeout(() => {
          if (sessionIdRef.current === sessionId) {
            gameAudio.playVictoryFanfare();
          }
        }, 280);
      }
    }, 180);
  };

  const handleCellClick = async (x: number, y: number) => {
    if (dragRef.current.wasDragged) return;
    const cur = combatRef.current;
    if (!cur || !cur.isActive || cur.currentTurn !== 'player' || cur.isAnimatingMove || cur.awaitingReaction) {
      return;
    }

    if (cur.isFireBreathModeActive && !cur.player.hasActed) {
      executeFireBreath({ x, y });
      return;
    }

    if (!cur.isMoveModeActive || cur.player.hasMoved) {
      return;
    }

    const key = `${x},${y}`;
    const cellData = reachableMap.get(key);
    if (!cellData) return;

    const sessionId = sessionIdRef.current;
    setHoveredCellKey(null);

    const isEnemyAdjacent =
      cur.enemy.hp > 0 &&
      cur.enemy.stunnedTurns <= 0 &&
      getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y) <= 1;

    if (isEnemyAdjacent) {
      const oppOutcome = rollHitAndEvasion(cur.enemy.hitChance, playerStats.evasionChance);

      if (oppOutcome !== 'hit') {
        gameAudio.playEvadeWhoosh();
        triggerFloatingStatus(
          { x: cur.player.x, y: cur.player.y },
          oppOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
          oppOutcome === 'evaded' ? 'evade' : 'miss'
        );
        appendLog(
          oppOutcome === 'evaded' ? 'player' : 'info',
          oppOutcome === 'evaded'
            ? `Você EVADIU do Ataque de Oportunidade do ${cur.enemy.name}, ignorando dano e efeitos!`
            : `O ${cur.enemy.name} errou o Ataque de Oportunidade enquanto você se movia!`,
          oppOutcome === 'evaded' ? 'EVASÃO' : 'ATAQUE DE OPORTUNIDADE'
        );
        await completePlayerMovement(x, y, cellData.path, cellData.cost, sessionId);
        return;
      }

      const isCritical = Math.random() * 100 < cur.enemy.critChance;
      const incomingDmg = isCritical ? Math.round(cur.enemy.dmg * 1.5) : cur.enemy.dmg;
      const pendingOpp: PendingAttack = {
        attackerName: cur.enemy.name,
        attackName: 'Ataque de Oportunidade (Espada Curta)',
        damageType: 'physical',
        baseDamage: cur.enemy.dmg,
        incomingDamage: incomingDmg,
        isCritical,
        isHeavyBlow: false,
        isOpportunityAttack: true,
        resumeMoveAfter: {
          x,
          y,
          path: cellData.path,
          cost: cellData.cost,
        },
      };

      if (availableReactions.length === 0) {
        updateCombat((prev) => ({ ...prev, isMoveModeActive: false }));
        await resolveIncomingAttackRef.current(pendingOpp, 'none');
        return;
      }

      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        awaitingReaction: true,
        pendingAttack: pendingOpp,
      }));

      gameAudio.playReactionAlert();
      appendLog(
        'warning',
        `Você usou Ação de Movimento adjacente ao ${cur.enemy.name}! Ele desfere um Ataque de Oportunidade (${incomingDmg} dano físico${
          isCritical ? ' · CRÍTICO +50%' : ''
        }). Escolha sua reação.`,
        'ATAQUE DE OPORTUNIDADE'
      );
      return;
    }

    await completePlayerMovement(x, y, cellData.path, cellData.cost, sessionId);
  };

  // Standard Action 1: Golpe Simples (15 EP, physical attack)
  const handleSimpleStrike = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (!character.equippedWeapon) {
      appendLog('warning', 'Você está desarmado! Empunhe uma arma na ficha para usar Golpe Simples.');
      return;
    }

    if (cur.player.ep < BASIC_ATTACK_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Golpe Simples! Necessário ${BASIC_ATTACK_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y);
    if (dist > character.equippedWeapon.rangeCells) {
      appendLog(
        'warning',
        `Alvo fora de alcance para Golpe Simples! Você está a ${getDistanceMeters(
          cur.player.x,
          cur.player.y,
          cur.enemy.x,
          cur.enemy.y
        )}m (alcance: 1,5m). Use "Ação de Movimento (6m)" para se aproximar.`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - BASIC_ATTACK_EP_COST);
    const bonusDmg = cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const result = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: cur.enemy.evasionChance,
      defenderPhysicalDefense: cur.enemy.physicalDefense,
      defenderMagicDefense: cur.enemy.magicDefense,
    });

    if (result.outcome !== 'hit') {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        { x: cur.enemy.x, y: cur.enemy.y },
        result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        result.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        result.outcome === 'evaded' ? 'warning' : 'info',
        result.outcome === 'evaded'
          ? `O ${cur.enemy.name} EVADIU do seu Golpe Simples, ignorando todo o dano!`
          : `Seu Golpe Simples contra o ${cur.enemy.name} errou o alvo!`,
        result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
        `-${BASIC_ATTACK_EP_COST} EP`
      );
      return;
    }

    const dmg = result.finalDamage;
    const nextEnemyHp = Math.max(0, cur.enemy.hp - dmg);
    const enemyDefeated = nextEnemyHp <= 0;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isActive: !enemyDefeated,
      outcome: enemyDefeated ? 'victory' : 'ongoing',
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        hasActed: true,
      },
      enemy: {
        ...prev.enemy,
        hp: nextEnemyHp,
      },
    }));

    triggerSlashVfx(
      { x: cur.player.x, y: cur.player.y },
      { x: cur.enemy.x, y: cur.enemy.y },
      dmg,
      'player',
      'enemy',
      result.isCritical ? `CRÍTICO -${dmg}!` : `-${dmg}`,
      result.isCritical
    );

    const detailParts = [`-${BASIC_ATTACK_EP_COST} EP`];
    if (result.isCritical) detailParts.push('CRÍTICO +50%');
    if (result.defenseApplied > 0) detailParts.push(`-${result.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Golpe Simples com ${character.equippedWeapon.name} acertou o ${cur.enemy.name} causando ${dmg} de dano físico!`,
      result.isCritical ? 'GOLPE CRÍTICO' : 'GOLPE SIMPLES',
      detailParts.join(' · ')
    );

    if (enemyDefeated) {
      appendLog('victory', `VITÓRIA! Você derrotou o ${cur.enemy.name} na floresta!`, 'GLÓRIA');
      const sessionId = sessionIdRef.current;
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
    }
  };

  // Standard Action 2: Golpe Duplo (30 EP, 2 physical attacks)
  const handleDoubleStrike = async () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (!character.equippedWeapon) {
      appendLog('warning', 'Você está desarmado! Empunhe uma arma na ficha para usar Golpe Duplo.');
      return;
    }

    if (cur.player.ep < DOUBLE_STRIKE_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Golpe Duplo! Necessário ${DOUBLE_STRIKE_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y);
    if (dist > character.equippedWeapon.rangeCells) {
      appendLog(
        'warning',
        `Alvo fora de alcance para Golpe Duplo! Você está a ${getDistanceMeters(
          cur.player.x,
          cur.player.y,
          cur.enemy.x,
          cur.enemy.y
        )}m (alcance: 1,5m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerEp = Math.max(0, cur.player.ep - DOUBLE_STRIKE_EP_COST);

    const bonusDmg1 = cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const hit1 = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg1),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: cur.enemy.evasionChance,
      defenderPhysicalDefense: cur.enemy.physicalDefense,
      defenderMagicDefense: cur.enemy.magicDefense,
    });

    const dmg1 = hit1.outcome === 'hit' ? hit1.finalDamage : 0;
    const hpAfter1 = Math.max(0, cur.enemy.hp - dmg1);
    const defeatedOnFirst = hpAfter1 <= 0;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isAnimatingMove: !defeatedOnFirst,
      isActive: !defeatedOnFirst,
      outcome: defeatedOnFirst ? 'victory' : 'ongoing',
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        hasActed: true,
      },
      enemy: {
        ...prev.enemy,
        hp: hpAfter1,
      },
    }));

    if (hit1.outcome === 'hit') {
      triggerSlashVfx(
        { x: cur.player.x, y: cur.player.y },
        { x: cur.enemy.x, y: cur.enemy.y },
        dmg1,
        'player',
        'enemy',
        hit1.isCritical ? `CRÍTICO -${dmg1} (1º)!` : `-${dmg1} (1º)`,
        hit1.isCritical
      );
      const det1 = [`-${DOUBLE_STRIKE_EP_COST} EP`];
      if (hit1.isCritical) det1.push('CRÍTICO +50%');
      if (hit1.defenseApplied > 0) det1.push(`-${hit1.defenseApplied} Def. Fís.`);
      appendLog(
        'player',
        `Golpe Duplo (1º ataque): acertou o ${cur.enemy.name} causando ${dmg1} de dano físico!`,
        hit1.isCritical ? 'GOLPE DUPLO · CRÍTICO' : 'GOLPE DUPLO',
        det1.join(' · ')
      );
    } else {
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        { x: cur.enemy.x, y: cur.enemy.y },
        hit1.outcome === 'evaded' ? 'EVADIU (1º)' : 'ERROU (1º)',
        hit1.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        hit1.outcome === 'evaded' ? 'warning' : 'info',
        hit1.outcome === 'evaded'
          ? `Golpe Duplo (1º ataque): o ${cur.enemy.name} evadiu do primeiro corte!`
          : `Golpe Duplo (1º ataque): o primeiro corte errou o alvo!`,
        'GOLPE DUPLO',
        `-${DOUBLE_STRIKE_EP_COST} EP`
      );
    }

    if (defeatedOnFirst) {
      appendLog(
        'victory',
        `VITÓRIA! Você derrotou o ${cur.enemy.name} logo no primeiro corte do Golpe Duplo!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
      return;
    }

    await new Promise<void>((resolve) => scheduleTimeout(resolve, 340));
    if (sessionIdRef.current !== sessionId) return;

    const latest = combatRef.current;
    if (!latest || !latest.isActive) return;

    const bonusDmg2 = latest.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const hit2 = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg2),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: latest.enemy.evasionChance,
      defenderPhysicalDefense: latest.enemy.physicalDefense,
      defenderMagicDefense: latest.enemy.magicDefense,
    });

    const dmg2 = hit2.outcome === 'hit' ? hit2.finalDamage : 0;
    const hpAfter2 = Math.max(0, latest.enemy.hp - dmg2);
    const defeatedOnSecond = hpAfter2 <= 0;

    updateCombat((prev) => ({
      ...prev,
      isAnimatingMove: false,
      isActive: !defeatedOnSecond,
      outcome: defeatedOnSecond ? 'victory' : 'ongoing',
      enemy: {
        ...prev.enemy,
        hp: hpAfter2,
      },
    }));

    if (hit2.outcome === 'hit') {
      triggerSlashVfx(
        { x: latest.player.x, y: latest.player.y },
        { x: latest.enemy.x, y: latest.enemy.y },
        dmg2,
        'player',
        'enemy',
        hit2.isCritical ? `CRÍTICO -${dmg2} (2º)!` : `-${dmg2} (2º)`,
        hit2.isCritical
      );
      const det2: string[] = [];
      if (hit2.isCritical) det2.push('CRÍTICO +50%');
      if (hit2.defenseApplied > 0) det2.push(`-${hit2.defenseApplied} Def. Fís.`);
      appendLog(
        'player',
        `Golpe Duplo (2º ataque): segundo corte causou ${dmg2} de dano físico! (Total: ${dmg1 + dmg2} de dano)`,
        hit2.isCritical ? 'GOLPE DUPLO · CRÍTICO' : 'GOLPE DUPLO',
        det2.length > 0 ? det2.join(' · ') : undefined
      );
    } else {
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        { x: latest.enemy.x, y: latest.enemy.y },
        hit2.outcome === 'evaded' ? 'EVADIU (2º)' : 'ERROU (2º)',
        hit2.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        hit2.outcome === 'evaded' ? 'warning' : 'info',
        hit2.outcome === 'evaded'
          ? `Golpe Duplo (2º ataque): o ${latest.enemy.name} evadiu do segundo corte! (Total: ${dmg1} de dano)`
          : `Golpe Duplo (2º ataque): o segundo corte errou o alvo! (Total: ${dmg1} de dano)`,
        'GOLPE DUPLO'
      );
    }

    if (defeatedOnSecond) {
      appendLog(
        'victory',
        `VITÓRIA! Você finalizou o ${latest.enemy.name} com o Golpe Duplo!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
    }
  };

  // Standard Action 3: Provocar I (30 EP, 1 enemy, forces target to attack caster for 2 rounds)
  const handleTaunt = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction ||
      cur.enemy.hp <= 0
    ) {
      return;
    }

    if (cur.player.ep < TAUNT_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Provocar I! Necessário ${TAUNT_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y);
    if (dist > TAUNT_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo fora de alcance para Provocar I! Você está a ${getDistanceMeters(
          cur.player.x,
          cur.player.y,
          cur.enemy.x,
          cur.enemy.y
        )}m (alcance: 6,0m a partir do seu token). Use "Ação de Movimento (6m)" para se aproximar.`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - TAUNT_EP_COST);
    const enemyEvaded = rollEvasionOnly(cur.enemy.evasionChance);

    if (enemyEvaded) {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus({ x: cur.enemy.x, y: cur.enemy.y }, 'EVADIU!', 'evade');
      appendLog(
        'warning',
        `O ${cur.enemy.name} evadiu de Provocar I e ignorou completamente o efeito!`,
        'EVASÃO',
        `-${TAUNT_EP_COST} EP`
      );
      return;
    }

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        hasActed: true,
      },
      enemy: {
        ...prev.enemy,
        tauntedTurns: TAUNT_DURATION_ROUNDS,
        tauntedBy: heroDisplayName,
      },
    }));

    triggerTauntVfx({ x: cur.enemy.x, y: cur.enemy.y }, TAUNT_DURATION_ROUNDS);

    appendLog(
      'player',
      `Provocar I afetou o ${cur.enemy.name}! Ele está OBRIGADO a atacar ${heroDisplayName} pelas próximas ${TAUNT_DURATION_ROUNDS} rodadas.`,
      'PROVOCAR I',
      `-${TAUNT_EP_COST} EP`
    );
  };

  // Mage Standard Action 1: Golpe Básico (15 EP, physical attack = Força + Dano Físico)
  const handleMageBasicAttack = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction ||
      cur.enemy.hp <= 0
    ) {
      return;
    }

    if (cur.player.ep < BASIC_ATTACK_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Golpe Básico! Necessário ${BASIC_ATTACK_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y);
    if (dist > 1) {
      appendLog(
        'warning',
        `Alvo fora de alcance! Você está a ${getDistanceMeters(
          cur.player.x,
          cur.player.y,
          cur.enemy.x,
          cur.enemy.y
        )}m (alcance do Golpe Básico: 1,5m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerEp = Math.max(0, cur.player.ep - BASIC_ATTACK_EP_COST);
    const bonusDmg = cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const baseDamage = rollMageBasicAttackDamage(character, bonusDmg);
    const attackResult = resolveCombatAttack({
      damageType: 'physical',
      baseDamage,
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: cur.enemy.evasionChance,
      defenderPhysicalDefense: cur.enemy.physicalDefense,
      defenderMagicDefense: cur.enemy.magicDefense,
    });

    if (attackResult.outcome !== 'hit') {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        isFireBreathModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        { x: cur.enemy.x, y: cur.enemy.y },
        attackResult.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        attackResult.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        attackResult.outcome === 'evaded' ? 'warning' : 'info',
        attackResult.outcome === 'evaded'
          ? `O ${cur.enemy.name} evadiu do seu Golpe Básico!`
          : `Seu Golpe Básico errou o ${cur.enemy.name}!`,
        'GOLPE BÁSICO',
        `-${BASIC_ATTACK_EP_COST} EP`
      );
      return;
    }

    const finalDmg = attackResult.finalDamage;
    const nextEnemyHp = Math.max(0, cur.enemy.hp - finalDmg);
    const defeated = nextEnemyHp <= 0;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      isActive: !defeated,
      outcome: defeated ? 'victory' : 'ongoing',
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        hasActed: true,
      },
      enemy: {
        ...prev.enemy,
        hp: nextEnemyHp,
      },
    }));

    triggerSlashVfx(
      { x: cur.player.x, y: cur.player.y },
      { x: cur.enemy.x, y: cur.enemy.y },
      finalDmg,
      'player',
      'enemy',
      attackResult.isCritical ? `CRÍTICO -${finalDmg}!` : `-${finalDmg}`,
      attackResult.isCritical
    );

    const details = [`-${BASIC_ATTACK_EP_COST} EP`];
    if (attackResult.isCritical) details.push('CRÍTICO +50%');
    if (attackResult.defenseApplied > 0) details.push(`-${attackResult.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Golpe Básico acertou o ${cur.enemy.name} causando ${finalDmg} de dano físico (Força + Dano Físico)!`,
      attackResult.isCritical ? 'GOLPE BÁSICO · CRÍTICO' : 'GOLPE BÁSICO',
      details.join(' · ')
    );

    if (defeated) {
      appendLog(
        'victory',
        `VITÓRIA! Você derrotou o ${cur.enemy.name} com um Golpe Básico!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
      }, 280);
    }
  };

  // Mage Spell 1: Seta Arcana (3 MP for 1 bolt, +2 MP = 5 MP for 2 bolts, 9m range, 5 + Dano Mágico)
  const handleArcaneBolt = async (upgraded: boolean) => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction ||
      cur.enemy.hp <= 0
    ) {
      return;
    }

    const mpCost = upgraded ? ARCANE_BOLT_UPGRADED_MP_COST : ARCANE_BOLT_MP_COST;
    const boltCount = upgraded ? 2 : 1;

    if (cur.player.mp < mpCost) {
      appendLog(
        'warning',
        `Mana insuficiente para Seta Arcana${upgraded ? ' Aprimorada' : ''}! Necessário ${mpCost} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const dist = getDistance(cur.player.x, cur.player.y, cur.enemy.x, cur.enemy.y);
    if (dist > ARCANE_BOLT_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo fora do alcance de Seta Arcana! Você está a ${getDistanceMeters(
          cur.player.x,
          cur.player.y,
          cur.enemy.x,
          cur.enemy.y
        )}m (alcance: 9,0m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerMp = Math.max(0, cur.player.mp - mpCost);
    const bonusMagicDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const boltBaseDamage = getArcaneBoltDamage(character, bonusMagicDmg);

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      isAnimatingMove: true,
      player: {
        ...prev.player,
        mp: nextPlayerMp,
        hasActed: true,
      },
    }));

    let totalDamageDealt = 0;

    for (let i = 0; i < boltCount; i++) {
      if (sessionIdRef.current !== sessionId) return;
      const latest = combatRef.current;
      if (!latest || !latest.isActive || latest.enemy.hp <= 0) break;

      const boltResult = resolveCombatAttack({
        damageType: 'magical',
        baseDamage: boltBaseDamage,
        attackerHitChance: playerStats.hitChance,
        attackerCritChance: 0,
        defenderEvasionChance: latest.enemy.evasionChance,
        defenderPhysicalDefense: latest.enemy.physicalDefense,
        defenderMagicDefense: latest.enemy.magicDefense,
      });

      const isHit = boltResult.outcome === 'hit';
      const boltDmg = isHit ? boltResult.finalDamage : 0;
      const boltTag = boltCount === 2 ? ` (${i + 1}ª)` : '';
      const floatingLabel = isHit
        ? `-${boltDmg} ARCANO${boltTag}`
        : boltResult.outcome === 'evaded'
        ? `EVADIU${boltTag}`
        : `ERROU${boltTag}`;

      const boltCurveSign = boltCount === 2 ? (i === 0 ? 1 : -1) : 0.35;
      triggerArcaneBoltVfx(
        { x: latest.player.x, y: latest.player.y },
        { x: latest.enemy.x, y: latest.enemy.y },
        floatingLabel,
        isHit,
        boltCurveSign
      );

      await new Promise<void>((resolve) => scheduleTimeout(resolve, 300));
      if (sessionIdRef.current !== sessionId) return;

      if (isHit) {
        totalDamageDealt += boltDmg;
        const nextEnemyHp = Math.max(0, latest.enemy.hp - boltDmg);
        const defeated = nextEnemyHp <= 0;

        updateCombat((prev) => ({
          ...prev,
          isActive: !defeated,
          outcome: defeated ? 'victory' : 'ongoing',
          enemy: {
            ...prev.enemy,
            hp: nextEnemyHp,
          },
        }));

        const details: string[] = [];
        if (i === 0) details.push(`-${mpCost} MP`);
        if (boltResult.defenseApplied > 0) {
          details.push(`-${boltResult.defenseApplied} Def. Mág.`);
        }

        appendLog(
          'player',
          `Seta Arcana${boltCount === 2 ? ` (${i + 1}ª seta)` : ''} perfurou o ${latest.enemy.name} com mana pura causando ${boltDmg} de dano mágico!${
            i === 1 ? ` (Total: ${totalDamageDealt} de dano)` : ''
          }`,
          upgraded ? 'SETA ARCANA ×2' : 'SETA ARCANA',
          details.length > 0 ? details.join(' · ') : undefined
        );

        if (defeated) {
          updateCombat((prev) => ({ ...prev, isAnimatingMove: false }));
          appendLog(
            'victory',
            `VITÓRIA! Você abateu o ${latest.enemy.name} com Seta Arcana!`,
            'GLÓRIA'
          );
          scheduleTimeout(() => {
            if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
          }, 280);
          return;
        }
      } else {
        gameAudio.playEvadeWhoosh();
        appendLog(
          boltResult.outcome === 'evaded' ? 'warning' : 'info',
          boltResult.outcome === 'evaded'
            ? `O ${latest.enemy.name} evadiu da Seta Arcana${boltTag}!`
            : `A Seta Arcana${boltTag} errou o ${latest.enemy.name}!`,
          upgraded ? 'SETA ARCANA ×2' : 'SETA ARCANA',
          i === 0 ? `-${mpCost} MP` : undefined
        );
      }

      if (i === 0 && boltCount === 2) {
        await new Promise<void>((resolve) => scheduleTimeout(resolve, 240));
      }
    }

    if (sessionIdRef.current === sessionId) {
      updateCombat((prev) => ({ ...prev, isAnimatingMove: false }));
    }
  };

  // Mage Spell 2: Escudo Arcano (5 MP, self-only, 5 + Inteligência of Sobrevida until broken)
  const handleArcaneShield = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (cur.player.mp < ARCANE_SHIELD_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Escudo Arcano! Necessário ${ARCANE_SHIELD_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const shieldAmount = getArcaneShieldAmount(character);
    const nextPlayerMp = Math.max(0, cur.player.mp - ARCANE_SHIELD_MP_COST);

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      player: {
        ...prev.player,
        mp: nextPlayerMp,
        hasActed: true,
        arcaneShield: Math.max(prev.player.arcaneShield, shieldAmount),
        arcaneShieldMax: Math.max(prev.player.arcaneShieldMax, shieldAmount),
      },
    }));

    triggerArcaneShieldVfx({ x: cur.player.x, y: cur.player.y }, shieldAmount);

    appendLog(
      'player',
      `Escudo Arcano conjurado! Você recebeu ${shieldAmount} pontos de Sobrevida (5 + ${character.attributes.intelligence} INT) até ser quebrado.`,
      'ESCUDO ARCANO',
      `-${ARCANE_SHIELD_MP_COST} MP`
    );
  };

  // Mage Spell 3: Toggle Baforada de Fogo interactive cone targeting
  const handleToggleFireBreathMode = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (cur.player.mp < FIRE_BREATH_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Baforada de Fogo! Necessário ${FIRE_BREATH_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: !prev.isFireBreathModeActive,
    }));
  };

  const handleEndPlayerTurn = () => {
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    const sessionId = sessionIdRef.current;
    const hadBeyondLimit = cur.player.beyondLimitTurns > 0;
    const nextBeyondLimitTurns = Math.max(0, cur.player.beyondLimitTurns - 1);
    setIsStandardActionOpen(false);
    setHoveredCellKey(null);

    updateCombat((prev) => ({
      ...prev,
      currentTurn: 'enemy',
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      player: {
        ...prev.player,
        beyondLimitTurns: nextBeyondLimitTurns,
      },
    }));
    appendLog('info', 'Você encerra seu turno.', 'FIM DO TURNO');

    if (hadBeyondLimit && nextBeyondLimitTurns === 0) {
      appendLog('info', 'O efeito de Além do Limite (+5 de dano) chegou ao fim.', 'ALÉM DO LIMITE');
    }

    scheduleTimeout(() => {
      void executeGoblinTurn(sessionId);
    }, 850);
  };

  // Reaction resolution
  const applyHeavyBlowKnockbackAndStun = useCallback(
    async (pushMeters: number, stunRounds: number, sessionId: number) => {
      const cur = combatRef.current;
      if (!cur || cur.player.hp <= 0) return;

      const kb = calculateKnockbackTrajectory(
        { x: cur.enemy.x, y: cur.enemy.y },
        { x: cur.player.x, y: cur.player.y },
        pushMeters
      );

      let finalX = cur.player.x;
      let finalY = cur.player.y;

      if (kb.path.length > 1) {
        updateCombat((prev) => ({ ...prev, isAnimatingMove: true }));
        await animateKnockbackPath(kb.path, sessionId);
        if (sessionIdRef.current !== sessionId) return;
        const last = kb.path[kb.path.length - 1];
        finalX = last.x;
        finalY = last.y;
      }

      updateCombat((prev) => ({
        ...prev,
        isAnimatingMove: false,
        player: {
          ...prev.player,
          x: finalX,
          y: finalY,
          stunnedTurns: Math.max(prev.player.stunnedTurns, stunRounds),
        },
      }));

      const cx = finalX * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = finalY * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const stunTextId = nextIdRef.current++;
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: stunTextId,
          x: cx,
          y: cy - 26,
          text:
            kb.metersPushed > 0
              ? `EMPURRADO ${kb.metersPushed.toFixed(1).replace('.', ',')}m · ATORDOADO`
              : 'ATORDOADO (1 RODADA)',
          variant: 'stun',
        },
      ]);
      scheduleTimeout(
        () => setFloatingTexts((prev) => prev.filter((v) => v.id !== stunTextId)),
        1180
      );

      const pushMsg =
        kb.metersPushed > 0
          ? `empurrado ${kb.metersPushed.toFixed(1).replace('.', ',')}m para trás${
              kb.hitObstacle ? ' (barrado por obstáculo/borda)' : ''
            }`
          : 'encurralado contra um obstáculo';

      appendLog(
        'warning',
        `Você foi ${pushMsg} e está ATORDOADO por ${stunRounds} rodada!`,
        'GOLPE PESADO'
      );
    },
    [animateKnockbackPath, appendLog, scheduleTimeout, updateCombat]
  );

  const finishEnemyAttack = useCallback(
    (sessionId: number, isOpportunityAttack = false) => {
      if (sessionIdRef.current !== sessionId) return;
      const cur = combatRef.current;
      if (!cur) return;

      if (cur.player.hp <= 0) {
        updateCombat((prev) => ({
          ...prev,
          isActive: false,
          outcome: 'defeat',
          player: { ...prev.player, hp: 0 },
        }));
        appendLog('defeat', 'DERROTA! Você sucumbiu aos ferimentos.', 'DERROTA');
        scheduleTimeout(() => {
          if (sessionIdRef.current === sessionId) {
            gameAudio.playDefeatSound();
          }
        }, 280);
        return;
      }

      if (isOpportunityAttack) {
        return;
      }

      scheduleTimeout(() => {
        if (sessionIdRef.current !== sessionId) return;
        const latest = combatRef.current;
        if (latest && latest.isActive && !latest.awaitingReaction) {
          startPlayerTurn(sessionId);
        }
      }, 950);
    },
    [appendLog, scheduleTimeout, startPlayerTurn, updateCombat]
  );

  const resolveIncomingAttack = async (attack: PendingAttack, reactionId: string) => {
    const cur = combatRef.current;
    if (!cur || !cur.isActive) return;

    const sessionId = sessionIdRef.current;
    const initialPlayerPos = { x: cur.player.x, y: cur.player.y };
    const enemyPos = { x: cur.enemy.x, y: cur.enemy.y };

    const liveStats = getLivePlayerStats(cur.player);
    const playerDefense =
      attack.damageType === 'physical' ? liveStats.physicalDefense : liveStats.magicDefense;
    const defenseLabel = attack.damageType === 'physical' ? 'Def. Fís.' : 'Def. Mág.';
    const activeBonusDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;

    // Evaluates Escudo Arcano (Sobrevida) absorption + racial survival/threshold passives
    const computePostDamageState = (damageTaken: number) => {
      const currentShield = cur.player.arcaneShield;
      const shieldAbsorbed = Math.min(currentShield, damageTaken);
      const nextArcaneShield = Math.max(0, currentShield - shieldAbsorbed);
      const nextArcaneShieldMax = nextArcaneShield > 0 ? cur.player.arcaneShieldMax : 0;
      const shieldBroken = currentShield > 0 && nextArcaneShield === 0;
      const hpDamage = Math.max(0, damageTaken - shieldAbsorbed);

      const rawNextHp = cur.player.hp - hpDamage;
      let nextHp = Math.max(0, rawNextHp);
      let triggeredBeyondLimit = false;
      let beyondLimitUsed = cur.player.beyondLimitUsed;
      let beyondLimitTurns = cur.player.beyondLimitTurns;

      if (character.raceId === 'human' && !beyondLimitUsed && rawNextHp <= 0) {
        nextHp = 1;
        triggeredBeyondLimit = true;
        beyondLimitUsed = true;
        beyondLimitTurns = HUMAN_BEYOND_LIMIT_ROUNDS;
      }

      let triggeredDwarfDoubled = false;
      let rigidSkinDoubledLogged = cur.player.rigidSkinDoubledLogged;
      if (
        character.raceId === 'dwarf' &&
        !rigidSkinDoubledLogged &&
        nextHp > 0 &&
        nextHp / cur.player.maxHp <= DWARF_RIGID_SKIN_LOW_HP_THRESHOLD
      ) {
        triggeredDwarfDoubled = true;
        rigidSkinDoubledLogged = true;
      }

      let triggeredGreenBlood = false;
      let greenBloodTriggered = cur.player.greenBloodTriggered;
      let greenBloodTurns = cur.player.greenBloodTurns;
      if (
        character.raceId === 'dryad' &&
        !greenBloodTriggered &&
        nextHp > 0 &&
        nextHp / cur.player.maxHp < DRYAD_GREEN_BLOOD_HP_THRESHOLD
      ) {
        triggeredGreenBlood = true;
        greenBloodTriggered = true;
        greenBloodTurns = DRYAD_GREEN_BLOOD_ROUNDS;
      }

      return {
        shieldAbsorbed,
        nextArcaneShield,
        nextArcaneShieldMax,
        shieldBroken,
        hpDamage,
        nextHp,
        triggeredBeyondLimit,
        beyondLimitUsed,
        beyondLimitTurns,
        triggeredDwarfDoubled,
        rigidSkinDoubledLogged,
        triggeredGreenBlood,
        greenBloodTriggered,
        greenBloodTurns,
      };
    };

    const announceTriggeredPassives = (
      post: ReturnType<typeof computePostDamageState>,
      pos: GridPos
    ) => {
      if (post.shieldAbsorbed > 0) {
        triggerFloatingStatus(
          pos,
          post.shieldBroken ? 'ESCUDO QUEBRADO!' : `ESCUDO -${post.shieldAbsorbed}`,
          'shield'
        );
        appendLog(
          'player',
          post.shieldBroken
            ? `Seu Escudo Arcano absorveu ${post.shieldAbsorbed} de dano e foi quebrado!${
                post.hpDamage > 0 ? ` ${post.hpDamage} de dano excedente atingiu sua Vida.` : ''
              }`
            : `Seu Escudo Arcano absorveu ${post.shieldAbsorbed} de dano (${post.nextArcaneShield} de Sobrevida restante)!`,
          'ESCUDO ARCANO'
        );
      }

      if (post.triggeredBeyondLimit) {
        gameAudio.playCombatStartHorn();
        triggerFloatingStatus(pos, 'ALÉM DO LIMITE! (1 HP)', 'limit');
        appendLog(
          'warning',
          `Além do Limite ativado! ${heroDisplayName} resiste com 1 de Vida e ganha +${HUMAN_BEYOND_LIMIT_BONUS_DAMAGE} de Dano Físico e Mágico por ${HUMAN_BEYOND_LIMIT_ROUNDS} rodadas!`,
          'ALÉM DO LIMITE'
        );
      }

      if (post.triggeredDwarfDoubled) {
        triggerFloatingStatus(pos, 'PELE RÍGIDA DOBRADA!', 'parry');
        appendLog(
          'player',
          'Pele Rígida atingiu ≤ 40% de Vida: o bônus passivo dobrou para +4 Defesa Física e +4 Defesa Mágica!',
          'PELE RÍGIDA'
        );
      }

      if (post.triggeredGreenBlood) {
        triggerFloatingStatus(pos, 'SANGUE VERDE (3R)', 'heal');
        appendLog(
          'player',
          `Sangue Verde ativado (< 50% HP)! Você recuperará 2% da Vida máxima no início dos próximos ${DRYAD_GREEN_BLOOD_ROUNDS} turnos.`,
          'SANGUE VERDE'
        );
      }
    };

    let playerAlive = true;

    if (reactionId === 'parry_1') {
      const skill = REACTION_SKILLS.find((s) => s.id === 'parry_1');
      if (skill && evaluateReactionSkill(skill, cur, character).canUse) {
        const parryRollDmg = rollPlayerWeaponDamage(character, activeBonusDmg);
        const afterParry = Math.max(0, attack.incomingDamage - parryRollDmg);
        const defenseApplied = Math.min(playerDefense, afterParry);
        const finalDamage = Math.max(0, afterParry - playerDefense);
        const post = computePostDamageState(finalDamage);
        const nextEp = Math.max(0, cur.player.ep - skill.epCost);
        playerAlive = post.nextHp > 0;

        updateCombat((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            hp: post.nextHp,
            ep: nextEp,
            arcaneShield: post.nextArcaneShield,
            arcaneShieldMax: post.nextArcaneShieldMax,
            beyondLimitUsed: post.beyondLimitUsed,
            beyondLimitTurns: post.beyondLimitTurns,
            rigidSkinDoubledLogged: post.rigidSkinDoubledLogged,
            greenBloodTriggered: post.greenBloodTriggered,
            greenBloodTurns: post.greenBloodTurns,
          },
        }));

        const parryDetail = [
          `-${skill.epCost} EP`,
          ...(defenseApplied > 0 ? [`-${defenseApplied} ${defenseLabel}`] : []),
        ].join(' · ');

        if (finalDamage === 0) {
          appendLog(
            'reaction',
            `Ataque oposto de ${parryRollDmg} contra "${attack.attackName}" (${attack.incomingDamage} dano) reduziu o dano a 0!`,
            'APARAR ATAQUE 1',
            parryDetail
          );
        } else {
          appendLog(
            'reaction',
            `Ataque oposto abateu -${parryRollDmg} de "${attack.attackName}" (${attack.incomingDamage} dano). Você sofreu ${finalDamage} de dano.`,
            'APARAR ATAQUE 1',
            parryDetail
          );
        }

        triggerParryVfx(enemyPos, initialPlayerPos, parryRollDmg, post.hpDamage);
        announceTriggeredPassives(post, initialPlayerPos);

        if (attack.isHeavyBlow && post.nextHp > 0) {
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 340));
          if (sessionIdRef.current !== sessionId) return;
          triggerHeavyBlowVfx(enemyPos, initialPlayerPos, post.hpDamage, false);
          await applyHeavyBlowKnockbackAndStun(
            attack.pushMeters ?? 6.0,
            attack.stunRounds ?? 1,
            sessionId
          );
          if (sessionIdRef.current !== sessionId) return;
        }

        if (attack.isOpportunityAttack) {
          finishEnemyAttack(sessionId, true);
          if (playerAlive && attack.resumeMoveAfter) {
            await new Promise<void>((resolve) => scheduleTimeout(resolve, 380));
            if (sessionIdRef.current !== sessionId) return;
            await completePlayerMovement(
              attack.resumeMoveAfter.x,
              attack.resumeMoveAfter.y,
              attack.resumeMoveAfter.path,
              attack.resumeMoveAfter.cost,
              sessionId
            );
          }
          return;
        }

        finishEnemyAttack(sessionId, false);
        return;
      }
    }

    // Default: "none" (take damage reduced by Physical/Magic Defense, then Escudo Arcano Sobrevida)
    const defenseApplied = Math.min(playerDefense, attack.incomingDamage);
    const goblinDmg = Math.max(0, attack.incomingDamage - playerDefense);
    const post = computePostDamageState(goblinDmg);
    playerAlive = post.nextHp > 0;

    updateCombat((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        hp: post.nextHp,
        arcaneShield: post.nextArcaneShield,
        arcaneShieldMax: post.nextArcaneShieldMax,
        beyondLimitUsed: post.beyondLimitUsed,
        beyondLimitTurns: post.beyondLimitTurns,
        rigidSkinDoubledLogged: post.rigidSkinDoubledLogged,
        greenBloodTriggered: post.greenBloodTriggered,
        greenBloodTurns: post.greenBloodTurns,
      },
    }));

    const impactDetails: string[] = [];
    if (attack.isCritical) impactDetails.push('CRÍTICO +50%');
    if (defenseApplied > 0) impactDetails.push(`-${defenseApplied} ${defenseLabel}`);
    if (post.shieldAbsorbed > 0) impactDetails.push(`-${post.shieldAbsorbed} Sobrevida`);

    appendLog(
      'enemy',
      `O Goblin acerta "${attack.attackName}" causando ${goblinDmg} de dano${
        post.shieldAbsorbed > 0 ? ` (${post.hpDamage} na Vida)` : ''
      } a você!`,
      attack.isOpportunityAttack
        ? 'ATAQUE DE OPORTUNIDADE'
        : attack.isCritical
        ? 'IMPACTO CRÍTICO'
        : 'IMPACTO',
      impactDetails.length > 0 ? impactDetails.join(' · ') : undefined
    );

    if (attack.isHeavyBlow) {
      triggerHeavyBlowVfx(enemyPos, initialPlayerPos, post.hpDamage, post.hpDamage > 0);
      announceTriggeredPassives(post, initialPlayerPos);
      await new Promise<void>((resolve) => scheduleTimeout(resolve, 180));
      if (sessionIdRef.current !== sessionId) return;
      await applyHeavyBlowKnockbackAndStun(
        attack.pushMeters ?? 6.0,
        attack.stunRounds ?? 1,
        sessionId
      );
      if (sessionIdRef.current !== sessionId) return;
    } else {
      triggerSlashVfx(
        enemyPos,
        initialPlayerPos,
        post.hpDamage,
        'enemy',
        'player',
        post.hpDamage === 0 && post.shieldAbsorbed > 0
          ? 'ABSORVIDO!'
          : attack.isOpportunityAttack
          ? `-${post.hpDamage} OPORTUNIDADE`
          : attack.isCritical
          ? `CRÍTICO -${post.hpDamage}!`
          : `-${post.hpDamage}`,
        attack.isCritical && post.hpDamage > 0
      );
      announceTriggeredPassives(post, initialPlayerPos);
    }

    if (attack.isOpportunityAttack) {
      finishEnemyAttack(sessionId, true);
      if (playerAlive && attack.resumeMoveAfter) {
        await new Promise<void>((resolve) => scheduleTimeout(resolve, 380));
        if (sessionIdRef.current !== sessionId) return;
        await completePlayerMovement(
          attack.resumeMoveAfter.x,
          attack.resumeMoveAfter.y,
          attack.resumeMoveAfter.path,
          attack.resumeMoveAfter.cost,
          sessionId
        );
      }
      return;
    }

    finishEnemyAttack(sessionId, false);
  };

  resolveIncomingAttackRef.current = resolveIncomingAttack;

  const handleResolveReaction = async (reactionId: string) => {
    const cur = combatRef.current;
    if (!cur || !cur.awaitingReaction || !cur.pendingAttack || !cur.isActive) return;

    const attack = cur.pendingAttack;
    updateCombat((prev) => ({
      ...prev,
      awaitingReaction: false,
      pendingAttack: null,
    }));

    await resolveIncomingAttack(attack, reactionId);
  };

  if (!isOpen || !combat) return null;

  const isPlayerControlsEnabled =
    combat.currentTurn === 'player' &&
    combat.isActive &&
    !combat.awaitingReaction &&
    !combat.isAnimatingMove;
  const isStunned = combat.player.stunnedTurns > 0;
  const isPlayerActiveGlow =
    combat.isActive && combat.currentTurn === 'player' && combat.player.hp > 0 && !isStunned;

  const distCells = getDistance(combat.player.x, combat.player.y, combat.enemy.x, combat.enemy.y);
  const distMeters = getDistanceMeters(
    combat.player.x,
    combat.player.y,
    combat.enemy.x,
    combat.enemy.y
  );

  const playerHpPct = Math.max(0, (combat.player.hp / combat.player.maxHp) * 100);
  const playerMpPct = Math.max(0, (combat.player.mp / combat.player.maxMp) * 100);
  const playerEpPct = Math.max(0, (combat.player.ep / combat.player.maxEp) * 100);
  const enemyHpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100);
  const enemyEpPct = Math.max(0, (combat.enemy.ep / combat.enemy.maxEp) * 100);

  const initiativeOrder = [
    {
      id: 'player' as const,
      name: heroDisplayName,
      initiative: combat.player.initiative,
      avatar: heroPortraitUrl,
      variant: 'hero' as const,
      isActive: combat.currentTurn === 'player',
      isDead: combat.player.hp <= 0,
    },
    {
      id: 'enemy' as const,
      name: combat.enemy.name,
      initiative: combat.enemy.initiative,
      avatar: GOBLIN_PORTRAIT_URL,
      variant: 'enemy' as const,
      isActive: combat.currentTurn === 'enemy',
      isDead: combat.enemy.hp <= 0,
    },
  ].sort((a, b) => b.initiative - a.initiative);

  const turnStatusLabel =
    combat.outcome === 'victory'
      ? 'Vitória'
      : combat.outcome === 'defeat'
      ? 'Derrota'
      : combat.awaitingReaction
      ? 'Sua Reação'
      : combat.currentTurn === 'player' && isStunned
      ? 'Atordoado'
      : combat.currentTurn === 'player'
      ? `Seu Turno · Rodada ${combat.round}`
      : `Turno do Goblin · Rodada ${combat.round}`;

  const turnStatusStyle =
    combat.outcome === 'victory'
      ? 'bg-[#112e1f] border-[#2e8555] text-[#86efac]'
      : combat.outcome === 'defeat'
      ? 'bg-[#361111] border-[#a83232] text-[#fca5a5]'
      : combat.awaitingReaction
      ? 'bg-[#3d260b] border-[#d9a043] text-[#fde68a]'
      : combat.currentTurn === 'player' && isStunned
      ? 'bg-[#3b2c0a] border-[#eab308] text-[#fef08a]'
      : combat.currentTurn === 'player'
      ? 'bg-[#14301f] border-[#2e8555] text-[#86efac]'
      : 'bg-[#361412] border-[#a83232] text-[#fca5a5]';

  const hoveredCellData = hoveredCellKey ? reachableMap.get(hoveredCellKey) : null;
  const enemyAdjacentForOpportunity =
    combat.enemy.hp > 0 && combat.enemy.stunnedTurns <= 0 && distCells <= 1;
  const enemyInsideHoveredFireCone =
    combat.isFireBreathModeActive &&
    combat.enemy.hp > 0 &&
    hoveredFireConeSet.has(`${combat.enemy.x},${combat.enemy.y}`);

  const moveHintText = !combat.isActive
    ? combat.outcome === 'victory'
      ? 'Combate encerrado — Vitória do campeão'
      : 'Combate encerrado — Você foi derrotado'
    : combat.awaitingReaction
    ? 'Ataque inimigo iminente — escolha sua reação'
    : combat.currentTurn === 'enemy'
    ? 'Aguardando ação do Goblin Espadachim...'
    : isStunned
    ? 'Atordoado — encerrando turno automaticamente...'
    : combat.isFireBreathModeActive
    ? enemyInsideHoveredFireCone
      ? 'Alvo dentro do cone de 6,0m! Clique para lançar Baforada de Fogo (-9 MP)'
      : 'Mire a direção do cone de 6,0m no tabuleiro e clique para lançar Baforada de Fogo'
    : combat.isMoveModeActive
    ? enemyAdjacentForOpportunity
      ? hoveredCellData
        ? `Atenção: Ataque de Oportunidade ao mover ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m!`
        : 'Inimigo adjacente: mover-se provocará Ataque de Oportunidade!'
      : hoveredCellData
      ? `Destino selecionado: ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m (clique para mover)`
      : 'Clique em uma casa azul para se mover (até 6,0m)'
    : combat.player.hasMoved
    ? 'Ação de movimento utilizada nesta rodada'
    : 'Passe o mouse nos tokens para ver recursos e atributos';

  const canOpenStandardAction =
    isPlayerControlsEnabled && !isStunned && !combat.player.hasActed;

  const canSimpleStrike =
    canOpenStandardAction &&
    combat.player.ep >= BASIC_ATTACK_EP_COST &&
    character.equippedWeapon !== null;

  const canDoubleStrike =
    canOpenStandardAction &&
    combat.player.ep >= DOUBLE_STRIKE_EP_COST &&
    character.equippedWeapon !== null;

  const canTaunt =
    canOpenStandardAction &&
    combat.player.ep >= TAUNT_EP_COST &&
    combat.enemy.hp > 0;

  // Mage action availability & live scaling
  const activeBonusDmg =
    combat.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
  const mageBasicRange = getMageBasicAttackRange(character, activeBonusDmg);
  const arcaneBoltDamage = getArcaneBoltDamage(character, activeBonusDmg);
  const arcaneShieldAmount = getArcaneShieldAmount(character);
  const fireBreathDamage = getFireBreathDamage(activeBonusDmg);

  const canMageBasic =
    canOpenStandardAction &&
    combat.player.ep >= BASIC_ATTACK_EP_COST &&
    combat.enemy.hp > 0;
  const isEnemyInMageBasicRange = distCells <= 1;
  const isEnemyInArcaneBoltRange = distCells <= ARCANE_BOLT_RANGE_CELLS;
  const canCastArcaneBolt1 =
    canOpenStandardAction &&
    combat.player.mp >= ARCANE_BOLT_MP_COST &&
    combat.enemy.hp > 0;
  const canCastArcaneBolt2 =
    canOpenStandardAction &&
    combat.player.mp >= ARCANE_BOLT_UPGRADED_MP_COST &&
    combat.enemy.hp > 0;
  const canCastArcaneShield =
    canOpenStandardAction && combat.player.mp >= ARCANE_SHIELD_MP_COST;
  const canCastFireBreath =
    canOpenStandardAction && combat.player.mp >= FIRE_BREATH_MP_COST;

  const isEnemyInAttackRange =
    character.equippedWeapon !== null && distCells <= character.equippedWeapon.rangeCells;
  const isEnemyInTauntRange = distCells <= TAUNT_RANGE_CELLS;

  const getTokenHudStyle = (pos: GridPos): React.CSSProperties => {
    const centerX = pos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const showBelow = pos.y <= 2;
    const topPx = showBelow
      ? (pos.y + 1) * CELL_PIXEL_SIZE + 8
      : pos.y * CELL_PIXEL_SIZE - 8;

    let translateX = '-50%';
    if (pos.x <= 1) translateX = '-18%';
    else if (pos.x >= GRID_COLS - 2) translateX = '-82%';

    return {
      left: `${centerX}px`,
      top: `${topPx}px`,
      transform: showBelow
        ? `translate(${translateX}, 0%)`
        : `translate(${translateX}, -100%)`,
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Arena de Combate Tático"
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
    >
      {/* Animated Combat Start Banner */}
      {showBanner && (
        <div
          key={bannerKey}
          className="fixed top-5 left-1/2 z-[60] pointer-events-none animate-combat-banner"
        >
          <div className="bg-gradient-to-r from-[#3a1210] via-[#2b1a0c] to-[#3a1210] border-2 border-[#d9a043] px-8 py-3 rounded-sm shadow-2xl text-center">
            <h2 className="font-serif text-xl sm:text-2xl font-black tracking-widest text-[#f3d189]">
              COMBATE INICIADO
            </h2>
            <p className="text-xs font-mono tabular-nums text-[#e3d2b8] mt-0.5">
              Iniciativa: {heroDisplayName} ({combat.player.initiative}) vs Goblin (
              {combat.enemy.initiative})
            </p>
          </div>
        </div>
      )}

      <div className="medieval-panel rounded-md max-w-6xl w-full shadow-2xl relative flex flex-col max-h-[96vh]">
        {/* Top Arena Header & Initiative Tracker */}
        <div className="p-3 sm:p-4 border-b border-[#473421] bg-[#130e0a] shrink-0 space-y-2.5 rounded-t-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-sm bg-[#291c0f] border border-[#8c6430] flex items-center justify-center text-[#e5b865] shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-base font-bold text-[#e5b865] leading-tight truncate tracking-wide">
                  Emboscada na Floresta
                </h2>
                <p className="text-xs text-[#a6957e]">
                  Grid 16×10 · Ação de Movimento 6,0m · Distância:{' '}
                  <span className="font-mono tabular-nums text-[#e5b865] font-semibold">
                    {distMeters}m
                  </span>
                </p>
              </div>
            </div>

            {/* Audio, Camera, Restart & Close Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-[#1b140e] border border-[#4a3622] rounded-sm p-1 flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAudioPrefs(gameAudio.toggleMusic())}
                  title="Ligar ou desligar trilha sonora"
                  className={`h-7 px-2.5 rounded-xs font-serif font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    audioPrefs.musicEnabled && !audioPrefs.isMuted
                      ? 'bg-[#36230e] text-[#e5b865] border border-[#8c6430]'
                      : 'bg-[#211912] text-[#8a7863] border border-transparent hover:text-[#ede3d2]'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {audioPrefs.musicEnabled && !audioPrefs.isMuted ? 'Música ON' : 'Música OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAudioPrefs(gameAudio.toggleMuteAll())}
                  title={audioPrefs.isMuted ? 'Ativar áudio' : 'Silenciar todo o áudio'}
                  aria-label={audioPrefs.isMuted ? 'Ativar áudio' : 'Silenciar todo o áudio'}
                  className={`w-7 h-7 rounded-xs flex items-center justify-center transition-colors cursor-pointer ${
                    audioPrefs.isMuted
                      ? 'bg-[#3b1515] text-[#f87171] hover:bg-[#4c1c1c]'
                      : 'bg-[#211912] text-[#60c28c] hover:bg-[#2c2218]'
                  }`}
                >
                  {audioPrefs.isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                <div className="w-px h-4 bg-[#4a3622] mx-0.5" />

                <button
                  type="button"
                  onClick={centerCamera}
                  title="Centralizar câmera no mapa"
                  className="h-7 px-2 rounded-xs bg-[#211912] hover:bg-[#2c2218] text-[#e5b865] font-serif font-semibold flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Centralizar</span>
                </button>

                <div className="w-px h-4 bg-[#4a3622] mx-0.5" />

                <button
                  type="button"
                  onClick={() => setZoomCentered(camera.zoom - ZOOM_STEP)}
                  title="Diminuir zoom"
                  aria-label="Diminuir zoom"
                  className="w-7 h-7 rounded-xs bg-[#211912] hover:bg-[#2c2218] text-[#e6d7be] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomCentered(1)}
                  title="Resetar zoom para 100%"
                  className="font-mono tabular-nums text-[#e5b865] text-xs px-1.5 font-semibold hover:underline cursor-pointer"
                >
                  {Math.round(camera.zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomCentered(camera.zoom + ZOOM_STEP)}
                  title="Aumentar zoom"
                  aria-label="Aumentar zoom"
                  className="w-7 h-7 rounded-xs bg-[#211912] hover:bg-[#2c2218] text-[#e6d7be] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={startNewCombat}
                title="Reiniciar combate"
                className="medieval-btn-iron h-9 px-3 rounded-sm text-xs font-serif font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar arena"
                className="medieval-btn-iron w-9 h-9 rounded-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Initiative Order Bar */}
          <div className="bg-[#1a140e] border border-[#473421] rounded-sm px-3 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="font-serif text-xs font-bold text-[#a6957e] whitespace-nowrap shrink-0">
                Ordem dos Turnos
              </span>
              <div className="flex items-center gap-2.5 shrink-0">
                {initiativeOrder.map((unit) => (
                  <div
                    key={unit.id}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xs border text-xs transition-colors ${
                      unit.isActive && combat.isActive
                        ? 'bg-[#30200f] border-[#c9943b] text-[#f8e7c4]'
                        : 'bg-[#120d09] border-[#3d2d1e] text-[#9c8a74]'
                    } ${unit.isDead ? 'opacity-45 line-through' : ''}`}
                  >
                    <PortraitImage
                      src={unit.avatar}
                      alt={unit.name}
                      variant={unit.variant}
                      className="w-5 h-5 rounded-full object-cover object-top shrink-0"
                    />
                    <span className="font-serif font-bold whitespace-nowrap">{unit.name}</span>
                    <span className="font-mono tabular-nums text-[11px] text-[#e5b865]">
                      Init {unit.initiative}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-xs border font-serif font-bold text-xs tracking-wider whitespace-nowrap shrink-0 ${turnStatusStyle}`}
            >
              {turnStatusLabel}
            </div>
          </div>
        </div>

        {/* Main Scrollable Arena Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#15100c]">
          {/* 16x10 Roll20 Tactical Grid Viewport */}
          <div className="bg-[#110c09] border border-[#4a3622] rounded-sm p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <span className="flex items-center gap-1.5 text-[#c7b59e]">
                <Compass className="w-3.5 h-3.5 text-[#d9a043]" />
                <span>Arraste o mapa · Scroll para zoom · Passe o mouse nos tokens</span>
              </span>
              <span
                className={`font-mono tabular-nums ${
                  combat.isFireBreathModeActive
                    ? 'text-[#fb923c] font-semibold'
                    : combat.isMoveModeActive && enemyAdjacentForOpportunity
                    ? 'text-[#f3c46b] font-semibold'
                    : 'text-[#84c4e6]'
                }`}
              >
                {moveHintText}
              </span>
            </div>

            <div
              ref={viewportRef}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={handleViewportMouseDown}
              onMouseLeave={() => setHoveredToken(null)}
              onTouchStart={handleViewportTouchStart}
              onTouchMove={handleViewportTouchMove}
              onTouchEnd={handleViewportTouchEnd}
              className={`camera-viewport w-full h-[430px] sm:h-[490px] rounded-sm border border-[#4a3622] relative overflow-hidden select-none ${
                isDragging ? 'is-dragging' : ''
              } ${isViewportShaking ? 'viewport-shake' : ''}`}
            >
              {/* Transformable Grid Container */}
              <div
                className={`battle-grid-container select-none ${
                  camera.smooth ? 'smooth-camera' : ''
                }`}
                style={{
                  transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
                }}
              >
                {/* 16x10 Grid Cells */}
                {Array.from({ length: GRID_ROWS }).map((_, row) =>
                  Array.from({ length: GRID_COLS }).map((__, col) => {
                    const key = `${col},${row}`;
                    const obstacle = isObstacleCell(col, row);
                    const reachable = reachableMap.get(key);
                    const inHoveredPath = hoveredPathSet.has(key);
                    const inFireCone = hoveredFireConeSet.has(key);
                    const hasPlayer =
                      combat.player.x === col &&
                      combat.player.y === row &&
                      movingActor?.who !== 'player';
                    const hasEnemy =
                      combat.enemy.x === col &&
                      combat.enemy.y === row &&
                      movingActor?.who !== 'enemy';

                    return (
                      <div
                        key={key}
                        onClick={() => void handleCellClick(col, row)}
                        onMouseEnter={() => {
                          if (reachable || combat.isFireBreathModeActive) {
                            setHoveredCellKey(key);
                          }
                          if (!isDragging) {
                            if (hasPlayer) setHoveredToken('player');
                            else if (hasEnemy) setHoveredToken('enemy');
                          }
                        }}
                        onMouseLeave={() => {
                          if (hoveredCellKey === key) setHoveredCellKey(null);
                          if (hasPlayer) {
                            setHoveredToken((cur) => (cur === 'player' ? null : cur));
                          } else if (hasEnemy) {
                            setHoveredToken((cur) => (cur === 'enemy' ? null : cur));
                          }
                        }}
                        className={`grid-cell flex items-center justify-center ${
                          obstacle ? 'obstacle' : ''
                        } ${reachable ? 'in-move-range' : ''} ${
                          inHoveredPath ? 'in-hover-path' : ''
                        } ${inFireCone ? 'in-fire-cone' : ''} ${
                          inFireCone && hasEnemy ? 'in-fire-cone-target' : ''
                        } ${
                          combat.isFireBreathModeActive && !hasPlayer
                            ? 'cursor-crosshair'
                            : hasPlayer || hasEnemy
                            ? 'cursor-pointer'
                            : ''
                        }`}
                      >
                        {obstacle && (
                          <span
                            aria-label="Obstáculo da floresta"
                            className="text-base opacity-90 drop-shadow pointer-events-none select-none"
                          >
                            🌲
                          </span>
                        )}

                        {reachable && !hasPlayer && !hasEnemy && hoveredCellKey === key && (
                          <span className="font-mono tabular-nums text-[10px] font-bold text-[#fef3c7] bg-[#140e09]/92 border border-[#9e7437]/70 px-1 py-0.5 rounded-xs pointer-events-none">
                            {reachable.cost.toFixed(1).replace('.', ',')}m
                          </span>
                        )}

                        {/* Player Token with Active-Turn Golden Glow & Arcane Shield Ring */}
                        {hasPlayer && (
                          <div
                            className={`token token-player relative overflow-visible ${
                              isPlayerActiveGlow ? 'token-active-turn' : ''
                            } ${combat.player.hp <= 0 ? 'token-defeated' : ''} ${
                              combat.player.stunnedTurns > 0 ? 'token-stunned' : ''
                            } ${hitTarget === 'player' ? 'token-hit-anim' : ''}`}
                            style={
                              lungeState?.who === 'player'
                                ? {
                                    transform: `translate(${lungeState.dx}px, ${lungeState.dy}px) scale(${lungeState.scale})`,
                                  }
                                : undefined
                            }
                          >
                            {isPlayerActiveGlow && <span className="token-turn-halo" aria-hidden="true" />}
                            {combat.player.arcaneShield > 0 && combat.player.hp > 0 && (
                              <span className="token-arcane-shield-ring" aria-hidden="true" />
                            )}

                            <PortraitImage
                              src={heroPortraitUrl}
                              alt={heroDisplayName}
                              variant="hero"
                              className="w-full h-full object-cover object-top rounded-full relative z-10"
                            />

                            {combat.player.stunnedTurns > 0 && combat.player.hp > 0 && (
                              <div className="stun-indicator-wrapper">
                                <div className="stun-orbit-ring">
                                  <svg className="stun-orbit-svg" viewBox="0 0 40 16">
                                    <ellipse
                                      cx="20"
                                      cy="8"
                                      rx="16"
                                      ry="5.5"
                                      fill="none"
                                      stroke="#facc15"
                                      strokeWidth="1.3"
                                      strokeDasharray="3 2"
                                      opacity="0.85"
                                    />
                                    <g className="stun-stars-spin">
                                      <polygon
                                        points="4,8 5.5,6.5 7,8 5.5,9.5"
                                        fill="#fef08a"
                                        stroke="#ca8a04"
                                        strokeWidth="0.6"
                                      />
                                      <polygon
                                        points="20,2 22,0 24,2 22,4"
                                        fill="#ffffff"
                                        stroke="#eab308"
                                        strokeWidth="0.7"
                                      />
                                      <polygon
                                        points="33,9 34.8,7.2 36.6,9 34.8,10.8"
                                        fill="#fde047"
                                        stroke="#ca8a04"
                                        strokeWidth="0.6"
                                      />
                                    </g>
                                  </svg>
                                </div>
                                <span className="stun-tag-label">ATORDOADO</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Enemy Token */}
                        {hasEnemy && (
                          <div
                            className={`token token-enemy relative overflow-visible ${
                              combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0
                                ? 'token-taunted'
                                : ''
                            } ${combat.enemy.hp <= 0 ? 'token-defeated' : ''} ${
                              hitTarget === 'enemy' ? 'token-hit-anim' : ''
                            }`}
                            style={
                              lungeState?.who === 'enemy'
                                ? {
                                    transform: `translate(${lungeState.dx}px, ${lungeState.dy}px) scale(${lungeState.scale})`,
                                  }
                                : undefined
                            }
                          >
                            <PortraitImage
                              src={GOBLIN_PORTRAIT_URL}
                              alt={combat.enemy.name}
                              variant="enemy"
                              className="w-full h-full object-cover object-top rounded-full bg-stone-900 relative z-10"
                            />
                            {combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0 && (
                              <span className="taunt-tag-label">
                                PROVOCADO {combat.enemy.tauntedTurns}R
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* HOVER HUD OVERLAY ABOVE PLAYER TOKEN */}
                {hoveredToken === 'player' && movingActor?.who !== 'player' && (
                  <div
                    className="absolute z-[70] pointer-events-none w-60 bg-[#17110c]/96 border border-[#c9943b] rounded-sm p-3 shadow-2xl backdrop-blur-sm"
                    style={getTokenHudStyle({ x: combat.player.x, y: combat.player.y })}
                  >
                    <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-[#473421]">
                      <span className="font-serif text-xs font-bold text-[#e5b865] truncate">
                        {heroDisplayName}
                      </span>
                      <span className="text-[10px] font-mono text-[#b39d82] shrink-0">
                        {isStunned
                          ? 'ATORDOADO'
                          : isMage
                          ? 'Mago · Arcano'
                          : character.equippedWeapon
                          ? 'Espada · 1,5m'
                          : 'Desarmado'}
                      </span>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#e0665e] font-semibold">
                            <Heart className="w-3 h-3 fill-[#b91c1c] text-[#dc2626]" />
                            Vida
                          </span>
                          <span className="text-[#f0b4ae] font-semibold">
                            {combat.player.hp}/{combat.player.maxHp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#b91c1c] transition-all duration-200"
                            style={{ width: `${playerHpPct}%` }}
                          />
                        </div>
                      </div>

                      {combat.player.arcaneShield > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                            <span className="flex items-center gap-1 text-[#7dd3fc] font-semibold">
                              <Shield className="w-3 h-3 fill-[#0284c7] text-[#38bdf8]" />
                              Sobrevida
                            </span>
                            <span className="text-[#bae6fd] font-semibold">
                              {combat.player.arcaneShield}/{combat.player.arcaneShieldMax}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-200"
                              style={{
                                width: `${
                                  combat.player.arcaneShieldMax > 0
                                    ? Math.min(
                                        100,
                                        (combat.player.arcaneShield / combat.player.arcaneShieldMax) *
                                          100
                                      )
                                    : 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#6bb4dc] font-semibold">
                            <Droplet className="w-3 h-3 fill-[#1d648c] text-[#38bdf8]" />
                            Mana
                          </span>
                          <span className="text-[#b8dcf0] font-semibold">
                            {combat.player.mp}/{combat.player.maxMp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#2476a6] transition-all duration-200"
                            style={{ width: `${playerMpPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#e5b865] font-semibold">
                            <Zap className="w-3 h-3 fill-[#b87c26] text-[#e5b865]" />
                            Energia
                          </span>
                          <span className="text-[#f4dab0] font-semibold">
                            {combat.player.ep}/{combat.player.maxEp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#c9943b] transition-all duration-200"
                            style={{ width: `${playerEpPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-[#3b2c1e] grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono tabular-nums text-[#b39d82]">
                        <span>
                          Dano Fís:{' '}
                          <strong className="text-[#f2dfb9]">
                            {dmgRange.min === dmgRange.max
                              ? dmgRange.min
                              : `${dmgRange.min}–${dmgRange.max}`}
                          </strong>
                        </span>
                        <span>
                          Dano Mág:{' '}
                          <strong className="text-[#93c5fd]">{playerStats.magicDamage}</strong>
                        </span>
                        <span>
                          Def. Fís:{' '}
                          <strong className="text-[#e5b865]">{playerStats.physicalDefense}</strong>
                        </span>
                        <span>
                          Def. Mág:{' '}
                          <strong className="text-[#a5b4fc]">{playerStats.magicDefense}</strong>
                        </span>
                        <span>
                          Crít:{' '}
                          <strong className="text-[#f09a4e]">
                            {playerStats.critChance}% (+{playerStats.critDamageBonus}%)
                          </strong>
                        </span>
                        <span>
                          Evasão:{' '}
                          <strong className="text-[#60c28c]">{playerStats.evasionChance}%</strong>
                        </span>
                        <span className="col-span-2">
                          Acerto:{' '}
                          <strong className="text-[#ede3d2]">{playerStats.hitChance}%</strong>
                        </span>
                      </div>

                      {combat.player.beyondLimitTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3a260a] border border-[#d9a043] text-[10px] font-mono text-[#fef08a]">
                          Além do Limite: +{HUMAN_BEYOND_LIMIT_BONUS_DAMAGE} Dano Fís./Mág. (
                          {combat.player.beyondLimitTurns}R)
                        </div>
                      )}

                      {character.raceId === 'dwarf' &&
                        combat.player.hp > 0 &&
                        combat.player.hp / combat.player.maxHp <= DWARF_RIGID_SKIN_LOW_HP_THRESHOLD && (
                          <div className="px-2 py-1 rounded-xs bg-[#1b2936] border border-[#4992bd] text-[10px] font-mono text-[#bae6fd]">
                            Pele Rígida Dobrada: +4 Def. Fís./Mág.
                          </div>
                        )}

                      {combat.player.greenBloodTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#112e1f] border border-[#2e8555] text-[10px] font-mono text-[#86efac]">
                          Sangue Verde: +2% HP máx./turno ({combat.player.greenBloodTurns}R)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* HOVER HUD OVERLAY ABOVE ENEMY TOKEN */}
                {hoveredToken === 'enemy' && movingActor?.who !== 'enemy' && (
                  <div
                    className="absolute z-[70] pointer-events-none w-60 bg-[#17110c]/96 border border-[#2e8555] rounded-sm p-3 shadow-2xl backdrop-blur-sm"
                    style={getTokenHudStyle({ x: combat.enemy.x, y: combat.enemy.y })}
                  >
                    <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-[#3a2d20]">
                      <span className="font-serif text-xs font-bold text-[#7ad9a4] truncate">
                        {combat.enemy.name}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#e5b865] shrink-0">
                        {distMeters}m
                      </span>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#60c28c] font-semibold">
                            <Heart className="w-3 h-3 fill-[#15803d] text-[#22c55e]" />
                            Vida
                          </span>
                          <span className="text-[#bbf7d0] font-semibold">
                            {combat.enemy.hp}/{combat.enemy.maxHp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#1f7a4c] transition-all duration-200"
                            style={{ width: `${enemyHpPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#e5b865] font-semibold">
                            <Zap className="w-3 h-3 fill-[#b87c26] text-[#e5b865]" />
                            Energia
                          </span>
                          <span className="text-[#f4dab0] font-semibold">
                            {combat.enemy.ep}/{combat.enemy.maxEp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#c9943b] transition-all duration-200"
                            style={{ width: `${enemyEpPct}%` }}
                          />
                        </div>
                      </div>

                      {combat.enemy.tauntedTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3a1210] border border-[#b84035] text-[10px] font-mono text-[#fca5a5]">
                          Provocado por {combat.enemy.tauntedBy || heroDisplayName} (
                          {combat.enemy.tauntedTurns} rodada(s))
                        </div>
                      )}

                      <div className="pt-1 border-t border-[#3b2c1e] grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono tabular-nums text-[#a6957e]">
                        <span>
                          Def. Fís:{' '}
                          <strong className="text-[#e5b865]">{combat.enemy.physicalDefense}</strong>
                        </span>
                        <span>
                          Def. Mág:{' '}
                          <strong className="text-[#a5b4fc]">{combat.enemy.magicDefense}</strong>
                        </span>
                        <span>
                          Crít:{' '}
                          <strong className="text-[#f09a4e]">{combat.enemy.critChance}%</strong>
                        </span>
                        <span>
                          Evasão:{' '}
                          <strong className="text-[#60c28c]">{combat.enemy.evasionChance}%</strong>
                        </span>
                        <span className="col-span-2">
                          Acerto:{' '}
                          <strong className="text-[#ede3d2]">{combat.enemy.hitChance}%</strong>
                        </span>
                      </div>

                      <div className="pt-1 border-t border-[#3b2c1e] flex items-center justify-between text-[10px] font-mono text-[#a6957e]">
                        <span>Golpe Pesado</span>
                        <span
                          className={
                            combat.enemy.heavyBlowCooldown > 0
                              ? 'text-[#a6957e]'
                              : 'text-[#f4b17a] font-semibold'
                          }
                        >
                          {combat.enemy.heavyBlowCooldown > 0
                            ? `Recarga ${combat.enemy.heavyBlowCooldown}t`
                            : 'Pronto (25 EP)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Animated Moving / Knockback Token Actor */}
                {movingActor && (
                  <div
                    className={`token absolute pointer-events-none z-40 overflow-hidden ${
                      movingActor.who === 'player' ? 'token-player' : 'token-enemy'
                    }`}
                    style={{
                      left: `${movingActor.left}px`,
                      top: `${movingActor.top}px`,
                      transition:
                        movingActor.transitionMs > 0
                          ? movingActor.knockback
                            ? `left ${movingActor.transitionMs}ms cubic-bezier(0.12, 0.92, 0.24, 1.06), top ${movingActor.transitionMs}ms cubic-bezier(0.12, 0.92, 0.24, 1.06), transform ${movingActor.transitionMs}ms ease-out`
                            : `left ${movingActor.transitionMs}ms linear, top ${movingActor.transitionMs}ms linear`
                          : 'none',
                      transform: movingActor.knockback ? 'scale(0.92) rotate(-12deg)' : undefined,
                    }}
                  >
                    <PortraitImage
                      src={movingActor.who === 'player' ? heroPortraitUrl : GOBLIN_PORTRAIT_URL}
                      alt={movingActor.who === 'player' ? heroDisplayName : combat.enemy.name}
                      variant={movingActor.who === 'player' ? 'hero' : 'enemy'}
                      className="w-full h-full object-cover object-top rounded-full bg-stone-900"
                    />
                  </div>
                )}

                {/* Footstep & Knockback Dust */}
                {dustVfxs.map((d) => (
                  <div
                    key={d.id}
                    className={d.kind === 'footstep' ? 'footstep-dust' : 'knockback-dust'}
                    style={{ left: `${d.x}px`, top: `${d.y}px` }}
                  />
                ))}

                {/* Slash & Heavy Blow VFX */}
                {slashVfxs.map((v) => (
                  <div
                    key={v.id}
                    className={v.kind === 'heavy' ? 'heavy-blow-vfx' : 'slash-vfx-container'}
                    style={{
                      left: `${v.x}px`,
                      top: `${v.y}px`,
                      transform: `rotate(${v.angleDeg}deg)`,
                    }}
                  >
                    {v.kind === 'heavy' ? (
                      <>
                        <div className="heavy-shockwave-ring" />
                        <svg className="slash-arc-svg" viewBox="0 0 116 116">
                          <defs>
                            <linearGradient id={`hb-${v.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.3" />
                              <stop offset="45%" stopColor="#ef4444" stopOpacity="1" />
                              <stop offset="80%" stopColor="#fb923c" stopOpacity="1" />
                              <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                            </linearGradient>
                          </defs>
                          <path
                            className="slash-blade-main"
                            d="M 12 96 Q 62 60 102 14"
                            fill="none"
                            stroke={`url(#hb-${v.id})`}
                            strokeWidth="15"
                            strokeLinecap="round"
                          />
                          <path
                            className="slash-blade-core"
                            d="M 18 90 Q 60 58 98 18"
                            fill="none"
                            stroke="#fef08a"
                            strokeWidth="5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <div className="slash-impact-burst" />
                        <svg className="slash-arc-svg" viewBox="0 0 96 96">
                          <defs>
                            <linearGradient id={`sl-${v.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                              <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                            </linearGradient>
                          </defs>
                          <path
                            className="slash-blade-main"
                            d="M 12 80 Q 48 52 84 14"
                            fill="none"
                            stroke={`url(#sl-${v.id})`}
                            strokeWidth="10"
                            strokeLinecap="round"
                          />
                          <path
                            className="slash-blade-core"
                            d="M 18 76 Q 48 50 80 18"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </>
                    )}
                    {[-40, 0, 35, 95, -95].map((ang) => (
                      <span
                        key={ang}
                        className="slash-spark"
                        style={{ '--spark-angle': `${ang}deg` } as React.CSSProperties}
                      />
                    ))}
                  </div>
                ))}

                {/* Parry Clash VFX */}
                {parryVfxs.map((p) => (
                  <div
                    key={p.id}
                    className="parry-vfx-container"
                    style={{ left: `${p.x}px`, top: `${p.y}px` }}
                  >
                    <div className="parry-shield-ring" />
                    <svg className="parry-clash-svg" viewBox="0 0 112 112">
                      <path
                        className="parry-enemy-blade"
                        d="M 18 22 L 94 90"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        className="parry-player-blade"
                        d="M 94 22 L 18 90"
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    {[-60, -15, 30, 120, 165, -135].map((ang) => (
                      <span
                        key={ang}
                        className="parry-clash-spark"
                        style={{ '--spark-angle': `${ang}deg` } as React.CSSProperties}
                      />
                    ))}
                  </div>
                ))}

                {/* Taunt Warcry Shockwave VFX */}
                {tauntVfxs.map((t) => (
                  <div
                    key={t.id}
                    className="taunt-vfx-ring"
                    style={{ left: `${t.x}px`, top: `${t.y}px` }}
                  />
                ))}

                {/* 60fps Canvas 2D Spell VFX Layer (Seta Arcana & Baforada de Fogo) */}
                <SpellVfxCanvas ref={spellVfxRef} />

                {/* Mage VFX 2: Escudo Arcano Cast Barrier */}
                {arcaneShieldVfxs.map((sh) => (
                  <div
                    key={sh.id}
                    className="arcane-shield-cast-vfx"
                    style={{ left: `${sh.x}px`, top: `${sh.y}px` }}
                  >
                    <svg className="arcane-shield-cast-svg" viewBox="0 0 110 110">
                      <defs>
                        <radialGradient id={`shg-${sh.id}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
                          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.92" />
                        </radialGradient>
                      </defs>
                      <circle
                        cx="55"
                        cy="55"
                        r="48"
                        fill={`url(#shg-${sh.id})`}
                        stroke="#7dd3fc"
                        strokeWidth="2.5"
                      />
                      <polygon
                        points="55,10 94,32.5 94,77.5 55,100 16,77.5 16,32.5"
                        fill="none"
                        stroke="#e0f2fe"
                        strokeWidth="2"
                        strokeDasharray="8 4"
                      />
                      <circle
                        cx="55"
                        cy="55"
                        r="34"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="5 5"
                      />
                    </svg>
                  </div>
                ))}

                {/* Floating Damage / Crit / Parry / Evade / Taunt / Spell / Stun Texts */}
                {floatingTexts.map((ft) => {
                  const ftClass =
                    ft.variant === 'arcane'
                      ? 'floating-arcane-text'
                      : ft.variant === 'fire'
                      ? 'floating-fire-text'
                      : ft.variant === 'shield'
                      ? 'floating-shield-text'
                      : ft.variant === 'limit'
                      ? 'floating-limit-text'
                      : ft.variant === 'heal'
                      ? 'floating-heal-text'
                      : ft.variant === 'crit'
                      ? 'floating-crit-text'
                      : ft.variant === 'evade'
                      ? 'floating-evade-text'
                      : ft.variant === 'taunt'
                      ? 'floating-taunt-text'
                      : ft.variant === 'damage'
                      ? 'floating-dmg-text'
                      : 'floating-parry-text';

                  return (
                    <div
                      key={ft.id}
                      className={ftClass}
                      style={{
                        left: `${ft.x}px`,
                        top: `${ft.y}px`,
                        color:
                          ft.variant === 'stun'
                            ? '#fef08a'
                            : ft.variant === 'miss'
                            ? '#d6c7b2'
                            : undefined,
                      }}
                    >
                      {ft.text}
                    </div>
                  );
                })}
              </div>

              {/* PRE-IMPACT REACTION SKILL OVERLAY */}
              {combat.awaitingReaction && combat.pendingAttack && (
                <div
                  data-reaction-overlay="true"
                  className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40 flex items-center justify-center p-3"
                >
                  <div className="reaction-modal-card medieval-panel rounded-md max-w-lg w-full p-5">
                    <div className="flex items-start gap-3 pb-3.5 border-b border-[#473421]">
                      <div className="w-10 h-10 rounded-sm bg-[#3a1210] border border-[#b84035] flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-[#f28b82]" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-[#f28b82]">
                          {combat.pendingAttack.isOpportunityAttack
                            ? `Ataque de Oportunidade · ${combat.pendingAttack.incomingDamage} de dano físico`
                            : `Ataque Inimigo Iminente · ${combat.pendingAttack.incomingDamage} de dano físico`}
                          {combat.pendingAttack.isCritical && (
                            <span className="ml-1.5 text-[#fde047]">· CRÍTICO (+50%)</span>
                          )}
                        </p>
                        <h3 className="font-serif text-base font-bold text-[#f3d189] mt-0.5 leading-snug">
                          O {combat.pendingAttack.attackerName} usa &ldquo;
                          {combat.pendingAttack.attackName}&rdquo;. Como você vai reagir?
                        </h3>
                        {playerStats.physicalDefense > 0 && (
                          <p className="text-xs font-mono text-[#86efac] mt-1">
                            Sua Defesa Física reduzirá -{playerStats.physicalDefense} de dano físico
                            automaticamente
                            {character.raceId === 'dwarf' &&
                            combat.player.hp > 0 &&
                            combat.player.hp / combat.player.maxHp <=
                              DWARF_RIGID_SKIN_LOW_HP_THRESHOLD
                              ? ' (Pele Rígida dobrada!).'
                              : '.'}
                          </p>
                        )}
                        {combat.pendingAttack.isHeavyBlow && (
                          <p className="text-xs text-[#f4b17a] mt-1">
                            Efeito adicional: empurra até 6,0m para trás e atordoa por 1 rodada.
                          </p>
                        )}
                        {combat.pendingAttack.isOpportunityAttack && (
                          <p className="text-xs text-[#e5b865] mt-1">
                            Disparado pela Ação de Movimento adjacente ao inimigo. Se sobreviver, seu
                            movimento continua.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <div className="text-xs font-serif text-[#b39d82]">
                        Skills de Reação Disponíveis
                      </div>

                      {availableReactions.map((skill) => {
                        const evalResult = evaluateReactionSkill(skill, combat, character);
                        const reasons: string[] = [];
                        if (!evalResult.checks.notStunned) reasons.push('Atordoado');
                        if (!evalResult.checks.hasWeapon) reasons.push('Requer arma empunhada');
                        if (!evalResult.checks.inRange) reasons.push('Fora do alcance (1,5m)');
                        if (!evalResult.checks.hasEnergy)
                          reasons.push(
                            `Energia insuficiente (${combat.player.ep}/${skill.epCost} EP)`
                          );

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            disabled={!evalResult.canUse}
                            onClick={() => void handleResolveReaction(skill.id)}
                            className={`w-full text-left p-3.5 rounded-sm border transition-colors ${
                              evalResult.canUse
                                ? 'bg-[#122a3a]/85 hover:bg-[#18384d] border-[#4992bd] cursor-pointer'
                                : 'bg-[#1b1510]/70 border-[#3d2e20] opacity-55 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-serif font-bold text-sm text-[#c7e6f7] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#6bb4dc]" />
                                {skill.name}
                              </span>
                              <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                                -{skill.epCost} EP
                              </span>
                            </div>
                            <p className="text-xs text-[#d6c7b2] mt-1 leading-relaxed">
                              {skill.description}
                            </p>
                            {reasons.length > 0 && (
                              <p className="text-xs text-[#f28b82] font-mono mt-1.5">
                                Indisponível: {reasons.join(' · ')}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#473421] flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleResolveReaction('none')}
                        className="medieval-btn-iron min-h-10 px-4 py-2 rounded-sm text-xs font-serif font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Não Reagir (Receber o Golpe)</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VICTORY / DEFEAT OVERLAY */}
              {!combat.isActive && combat.outcome !== 'ongoing' && (
                <div
                  data-reaction-overlay="true"
                  className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-40 flex items-center justify-center p-4"
                >
                  <div className="reaction-modal-card medieval-panel rounded-md max-w-md w-full p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-sm mx-auto flex items-center justify-center border ${
                        combat.outcome === 'victory'
                          ? 'bg-[#112e1f] border-[#2e8555] text-[#86efac]'
                          : 'bg-[#361111] border-[#a83232] text-[#fca5a5]'
                      }`}
                    >
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h3
                      className={`font-serif text-2xl font-bold mt-3 tracking-wide ${
                        combat.outcome === 'victory' ? 'text-[#e5b865]' : 'text-[#f28b82]'
                      }`}
                    >
                      {combat.outcome === 'victory' ? 'Vitória na Arena' : 'Derrota em Combate'}
                    </h3>
                    <p className="text-sm text-[#d6c7b2] mt-1.5">
                      {combat.outcome === 'victory'
                        ? `${heroDisplayName} superou o ${combat.enemy.name} em ${combat.round} rodada(s).`
                        : `${heroDisplayName} caiu na rodada ${combat.round}. Ajuste sua distribuição de atributos e retorne à arena.`}
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={startNewCombat}
                        className="medieval-btn-gold min-h-10 px-5 py-2 rounded-sm font-serif font-bold text-sm transition-colors cursor-pointer"
                      >
                        Lutar Novamente
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="medieval-btn-iron min-h-10 px-4 py-2 rounded-sm text-sm font-serif font-bold transition-colors cursor-pointer"
                      >
                        Voltar à Ficha
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-[#110c09] border border-[#4a3622] rounded-sm p-3">
            <div className="text-xs font-serif font-bold text-[#a6957e] mb-1.5 flex items-center gap-1.5 tracking-wide">
              <Terminal className="w-3.5 h-3.5 text-[#8c6e46]" />
              <span>Crônica do Combate</span>
            </div>
            <div
              ref={logContainerRef}
              className="overflow-y-auto space-y-1 text-xs font-mono max-h-[112px] pr-1"
            >
              {combatLog.map((entry) => {
                const toneClass =
                  entry.tone === 'player'
                    ? 'text-[#7ad9a4]'
                    : entry.tone === 'enemy'
                    ? 'text-[#f28b82]'
                    : entry.tone === 'reaction'
                    ? 'text-[#84c4e6]'
                    : entry.tone === 'warning'
                    ? 'text-[#e5b865]'
                    : entry.tone === 'victory'
                    ? 'text-[#86efac] font-bold'
                    : entry.tone === 'defeat'
                    ? 'text-[#fca5a5] font-bold'
                    : 'text-[#a6957e]';

                return (
                  <div key={entry.id} className={`leading-relaxed ${toneClass}`}>
                    {entry.tag && (
                      <span className="font-bold mr-1.5 opacity-95">[{entry.tag}]</span>
                    )}
                    <span>{entry.text}</span>
                    {entry.detail && (
                      <span className="ml-1.5 text-[#e5b865]/90">({entry.detail})</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Medieval Tactical Action Footer */}
        <div className="p-3 sm:p-4 bg-[#130e0a] border-t border-[#5c4327] shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-b-md relative z-30">
          {/* Round Economy Status */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="text-[#a6957e]">Ação de Movimento (6m):</span>
              <span
                className={`font-bold ${
                  isStunned && combat.currentTurn === 'player'
                    ? 'text-[#fde047]'
                    : combat.player.hasMoved
                    ? 'text-[#6e5f4e]'
                    : 'text-[#60c28c]'
                }`}
              >
                {isStunned && combat.currentTurn === 'player'
                  ? 'Atordoado'
                  : combat.player.hasMoved
                  ? 'Utilizada'
                  : 'Disponível'}
              </span>
            </div>

            <span aria-hidden="true" className="text-[#5c4327]">
              ◈
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#a6957e]">Ação Padrão:</span>
              <span
                className={`font-bold ${
                  isStunned && combat.currentTurn === 'player'
                    ? 'text-[#fde047]'
                    : combat.player.hasActed
                    ? 'text-[#6e5f4e]'
                    : 'text-[#60c28c]'
                }`}
              >
                {isStunned && combat.currentTurn === 'player'
                  ? 'Atordoado'
                  : combat.player.hasActed
                  ? 'Utilizada'
                  : 'Disponível'}
              </span>
            </div>
          </div>

          {/* Primary Tactical Buttons: Ação de Movimento | Ação Padrão (Menu) | Passar Turno */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!isPlayerControlsEnabled || isStunned || combat.player.hasMoved}
              onClick={handleToggleMoveMode}
              className={`min-h-11 px-4 py-2 rounded-sm text-sm font-serif font-bold tracking-wide transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
                combat.isMoveModeActive
                  ? 'bg-[#21648c] border border-[#7dd3fc] text-white'
                  : 'medieval-btn-cobalt'
              }`}
            >
              <Footprints className="w-4 h-4 text-[#9cd7f7]" />
              <span>
                {combat.isMoveModeActive ? 'Cancelar Ação de Movimento' : 'Ação de Movimento (6m)'}
              </span>
            </button>

            {/* Ação Padrão Popover Trigger & Menu */}
            <div ref={actionMenuRef} className="relative">
              {isStandardActionOpen && canOpenStandardAction && (
                <div
                  role="menu"
                  aria-label="Opções da Ação Padrão"
                  className="absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2.5 w-80 sm:w-96 bg-[#19120d] border border-[#c9943b] rounded-sm p-2.5 shadow-2xl z-50 space-y-2 max-h-[70vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[#473421]">
                    <span className="font-serif text-xs font-bold text-[#e5b865] tracking-wider">
                      Ação Padrão · {isMage ? 'Mago' : 'Guerreiro'}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-[#b39d82]">
                      {isMage
                        ? `${combat.player.mp}/${combat.player.maxMp} MP · ${combat.player.ep} EP`
                        : `Energia: ${combat.player.ep}/${combat.player.maxEp} EP`}
                    </span>
                  </div>

                  {isMage ? (
                    <>
                      {/* Mage Action 1: Golpe Básico */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canMageBasic}
                        onClick={handleMageBasicAttack}
                        className="w-full text-left p-2.5 rounded-sm border border-[#73542d] bg-[#241a12] hover:bg-[#312316] hover:border-[#d9a043] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#f5e1b8] flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-[#e5b865]" />
                            Golpe Básico
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -15 EP
                          </span>
                        </div>
                        <p className="text-xs text-[#b39d82] mt-1">
                          Ataque físico: Força + Dano Físico ({mageBasicRange.min}–{mageBasicRange.max}{' '}
                          dano · alcance 1,5m · crítico +50%).
                        </p>
                        {!isEnemyInMageBasicRange && (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para 1,5m)
                          </p>
                        )}
                      </button>

                      {/* Mage Spell 1: Seta Arcana (Base 3 MP & Upgraded +2 MP = 5 MP) */}
                      <div className="p-2.5 rounded-sm border border-[#3b6e9c] bg-[#14202e] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#dbeafe] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                            Seta Arcana
                          </span>
                          <span className="font-mono tabular-nums text-[11px] text-[#7dd3fc] font-semibold">
                            Alcance 9,0m
                          </span>
                        </div>
                        <p className="text-xs text-[#b8d4ea] leading-relaxed">
                          Seta de mana pura causando{' '}
                          <strong className="font-mono text-[#e0f2fe]">
                            {arcaneBoltDamage} dano mágico
                          </strong>{' '}
                          (5 + Dano Mágico). Com +2 MP dispara 2 setas (mesmo alvo ou divididas).
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canCastArcaneBolt1 || !isEnemyInArcaneBoltRange}
                            onClick={() => void handleArcaneBolt(false)}
                            className="px-2.5 py-2 rounded-xs border border-[#4992bd] bg-[#1a334a] hover:bg-[#234563] text-xs font-serif font-bold text-[#e0f2fe] flex items-center justify-between gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>1 Seta</span>
                            <span className="font-mono text-[11px] text-[#7dd3fc]">-3 MP</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canCastArcaneBolt2 || !isEnemyInArcaneBoltRange}
                            onClick={() => void handleArcaneBolt(true)}
                            className="px-2.5 py-2 rounded-xs border border-[#7c6ef6] bg-[#241d4a] hover:bg-[#312863] text-xs font-serif font-bold text-[#e9d5ff] flex items-center justify-between gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>2 Setas</span>
                            <span className="font-mono text-[11px] text-[#c4b5fd]">-5 MP</span>
                          </button>
                        </div>
                        {!isEnemyInArcaneBoltRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865]">
                            Alvo a {distMeters}m (aproxime-se para até 9,0m)
                          </p>
                        ) : combat.player.mp < ARCANE_BOLT_MP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82]">
                            Mana insuficiente ({combat.player.mp}/{ARCANE_BOLT_MP_COST} MP)
                          </p>
                        ) : null}
                      </div>

                      {/* Mage Spell 2: Escudo Arcano */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastArcaneShield}
                        onClick={handleArcaneShield}
                        className="w-full text-left p-2.5 rounded-sm border border-[#2f7899] bg-[#112430] hover:bg-[#173242] hover:border-[#38bdf8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#e0f2fe] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#38bdf8]" />
                            Escudo Arcano
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#7dd3fc] font-semibold">
                            -5 MP
                          </span>
                        </div>
                        <p className="text-xs text-[#b5d4e6] mt-1">
                          Somente em você: ganha{' '}
                          <strong className="font-mono text-[#e0f2fe]">
                            +{arcaneShieldAmount} Sobrevida
                          </strong>{' '}
                          (5 + Inteligência) até ser quebrado.
                        </p>
                        {combat.player.mp < ARCANE_SHIELD_MP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{ARCANE_SHIELD_MP_COST} MP)
                          </p>
                        ) : combat.player.arcaneShield > 0 ? (
                          <p className="text-[11px] font-mono text-[#7dd3fc] mt-1">
                            Sobrevida ativa: {combat.player.arcaneShield}/{combat.player.arcaneShieldMax}
                          </p>
                        ) : null}
                      </button>

                      {/* Mage Spell 3: Baforada de Fogo */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastFireBreath}
                        onClick={handleToggleFireBreathMode}
                        className="w-full text-left p-2.5 rounded-sm border border-[#9e421c] bg-[#2c150e] hover:bg-[#3e1d12] hover:border-[#f97316] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#ffedd5] flex items-center gap-2">
                            <Flame className="w-4 h-4 text-[#fb923c]" />
                            Baforada de Fogo
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#7dd3fc] font-semibold">
                            -9 MP
                          </span>
                        </div>
                        <p className="text-xs text-[#dec0ae] mt-1">
                          Cone de 6,0m a partir de você causando{' '}
                          <strong className="font-mono text-[#fed7aa]">
                            {fireBreathDamage} de dano de fogo
                          </strong>{' '}
                          na área. Clique para mirar no mapa.
                        </p>
                        {combat.player.mp < FIRE_BREATH_MP_COST && (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{FIRE_BREATH_MP_COST} MP)
                          </p>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Warrior Option 1: Golpe Simples */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canSimpleStrike}
                        onClick={handleSimpleStrike}
                        className="w-full text-left p-2.5 rounded-sm border border-[#73542d] bg-[#241a12] hover:bg-[#312316] hover:border-[#d9a043] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#f5e1b8] flex items-center gap-2">
                            <Swords className="w-4 h-4 text-[#e5b865]" />
                            Golpe Simples
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -15 EP
                          </span>
                        </div>
                        <p className="text-xs text-[#b39d82] mt-1">
                          1 ataque físico ({dmgRange.min}–{dmgRange.max} dano · alcance 1,5m ·
                          crítico +50%).
                        </p>
                        {!character.equippedWeapon ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Requer arma empunhada
                          </p>
                        ) : !isEnemyInAttackRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para 1,5m)
                          </p>
                        ) : null}
                      </button>

                      {/* Warrior Option 2: Golpe Duplo */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canDoubleStrike}
                        onClick={() => void handleDoubleStrike()}
                        className="w-full text-left p-2.5 rounded-sm border border-[#7d2a25] bg-[#2a1412] hover:bg-[#3a1a17] hover:border-[#c95448] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fae2d2] flex items-center gap-2">
                            <Flame className="w-4 h-4 text-[#f09a4e]" />
                            Golpe Duplo
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -30 EP
                          </span>
                        </div>
                        <p className="text-xs text-[#c2a496] mt-1">
                          Desfere 2 ataques físicos consecutivos com a espada (alcance 1,5m).
                        </p>
                        {!character.equippedWeapon ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Requer arma empunhada
                          </p>
                        ) : combat.player.ep < DOUBLE_STRIKE_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{DOUBLE_STRIKE_EP_COST} EP)
                          </p>
                        ) : !isEnemyInAttackRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para 1,5m)
                          </p>
                        ) : null}
                      </button>

                      {/* Warrior Option 3: Provocar I */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canTaunt}
                        onClick={handleTaunt}
                        className="w-full text-left p-2.5 rounded-sm border border-[#8a312b] bg-[#271211] hover:bg-[#381817] hover:border-[#e05246] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fde2e2] flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-[#f28b82]" />
                            Provocar I
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -30 EP
                          </span>
                        </div>
                        <p className="text-xs text-[#c7a3a3] mt-1">
                          Afeta 1 inimigo (alcance 6,0m) e o obriga a atacar você durante 2 rodadas.
                        </p>
                        {combat.player.ep < TAUNT_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{TAUNT_EP_COST} EP)
                          </p>
                        ) : !isEnemyInTauntRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para até 6,0m)
                          </p>
                        ) : combat.enemy.tauntedTurns > 0 ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Já ativo ({combat.enemy.tauntedTurns} rodada(s)) — usar renova para 2
                            rodadas
                          </p>
                        ) : null}
                      </button>
                    </>
                  )}
                </div>
              )}

              {combat.isFireBreathModeActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setHoveredCellKey(null);
                    updateCombat((prev) => ({ ...prev, isFireBreathModeActive: false }));
                  }}
                  className="min-h-11 px-5 py-2 rounded-sm text-sm font-serif font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap bg-[#7c2d12] hover:bg-[#9a3412] border border-[#fb923c] text-[#ffedd5] cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-[#fde047]" />
                  <span>Cancelar Baforada de Fogo</span>
                </button>
              ) : (
                <button
                  type="button"
                  aria-expanded={isStandardActionOpen}
                  aria-haspopup="menu"
                  disabled={!canOpenStandardAction}
                  onClick={() => {
                    updateCombat((prev) => ({
                      ...prev,
                      isMoveModeActive: false,
                      isFireBreathModeActive: false,
                    }));
                    setIsStandardActionOpen((prev) => !prev);
                  }}
                  className={`medieval-btn-gold min-h-11 px-5 py-2 rounded-sm text-sm font-serif font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
                    isStandardActionOpen ? 'ring-2 ring-[#f3d189]/80' : ''
                  }`}
                >
                  {isMage ? <Sparkles className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
                  <span>Ação Padrão</span>
                  <ChevronUp
                    className={`w-4 h-4 transition-transform duration-150 ${
                      isStandardActionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!isPlayerControlsEnabled || isStunned}
              onClick={handleEndPlayerTurn}
              className="medieval-btn-iron min-h-11 px-4 py-2 rounded-sm text-sm font-serif font-bold tracking-wide transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Passar Turno</span>
              <StepForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
