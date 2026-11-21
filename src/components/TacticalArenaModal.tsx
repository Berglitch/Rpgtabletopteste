import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronUp,
  Compass,
  Crosshair,
  Crown,
  Droplet,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  Heart,
  LocateFixed,
  Megaphone,
  Music,
  Plus,
  RotateCcw,
  ScrollText,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  StepForward,
  Sun,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Wand2,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { gameAudio } from '../game/audio';
import {
  ARCANE_ARMOR_DURATION_ROUNDS,
  ARCANE_ARMOR_MP_COST,
  ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS,
  ARCANE_BOLT_MP_COST,
  ARCANE_BOLT_RANGE_CELLS,
  ARCANE_BOLT_UPGRADED_MP_COST,
  BASIC_ATTACK_EP_COST,
  BOARD_PIXEL_H,
  BOARD_PIXEL_W,
  CELL_METERS,
  CELL_PIXEL_SIZE,
  CONSECRATION_CAST_RANGE_CELLS,
  CONSECRATION_CAST_RANGE_METERS,
  CONSECRATION_HEAL,
  CONSECRATION_MP_COST,
  CONSECRATION_RADIUS_METERS,
  COUNTER_ATTACK_EP_COST,
  CRIT_DAMAGE_BONUS_PCT,
  DAGGER_THROW_BLEED_DAMAGE,
  DAGGER_THROW_BLEED_ROUNDS,
  DAGGER_THROW_BONUS_DAMAGE,
  DAGGER_THROW_EP_COST,
  DAGGER_THROW_RANGE_CELLS,
  DAGGER_THROW_RANGE_METERS,
  DOUBLE_STRIKE_EP_COST,
  DRYAD_GREEN_BLOOD_HEAL_PCT,
  DRYAD_GREEN_BLOOD_HP_THRESHOLD,
  DRYAD_GREEN_BLOOD_ROUNDS,
  DWARF_RIGID_SKIN_LOW_HP_THRESHOLD,
  EXECUTIONER_BASE_BONUS_DAMAGE,
  EXECUTIONER_EP_COST,
  EXECUTIONER_LOW_HP_BONUS_DAMAGE,
  EXECUTIONER_LOW_HP_THRESHOLD,
  FIRE_BREATH_CONE_CELLS,
  FIRE_BREATH_HALF_ANGLE_DEG,
  FIRE_BREATH_MP_COST,
  GALLANT_CHARGE_BONUS_DAMAGE,
  GALLANT_CHARGE_EP_COST,
  GOBLIN_PORTRAIT_URL,
  GRID_COLS,
  GRID_ROWS,
  HUMAN_BEYOND_LIMIT_BONUS_DAMAGE,
  HUMAN_BEYOND_LIMIT_ROUNDS,
  KNIGHT_TAUNT_DEFENSE_BONUS,
  KNIGHT_TAUNT_EP_COST,
  LETHALITY_CRIT_CHANCE,
  LETHALITY_EP_COST,
  LETHALITY_STEALTH_CRIT_DMG_BONUS,
  MAX_MOVE_METERS,
  PASSIVE_EP_REGEN,
  PRIEST_BASIC_EP_COST,
  PRIEST_BASIC_RANGE_CELLS,
  PRIEST_BASIC_RANGE_METERS,
  RAISE_GUARD_PHYSICAL_DEFENSE_BONUS,
  REACTION_SKILLS,
  RESTORING_LIGHT_BASE_HEAL,
  RESTORING_LIGHT_HEAL_UPGRADE_BONUS,
  RESTORING_LIGHT_HEAL_UPGRADE_MP,
  RESTORING_LIGHT_MP_COST,
  RESTORING_LIGHT_REGEN_HEAL_PER_TURN,
  RESTORING_LIGHT_REGEN_ROUNDS,
  RESTORING_LIGHT_REGEN_UPGRADE_MP,
  SACRED_PROTECTION_DURATION_ROUNDS,
  SACRED_PROTECTION_MP_COST,
  SACRED_PROTECTION_SHIELD_HP,
  SLIME_MOTHER_LEAP_AOE_RADIUS_METERS,
  SLIME_MOTHER_LEAP_MAGIC_DAMAGE,
  SLIME_MOTHER_LEAP_PHYSICAL_DAMAGE,
  SLIME_MOTHER_LEAP_POISON_CHANCE,
  SLIME_MOTHER_POISON_HP_PCT,
  SLIME_MOTHER_POISON_ROUNDS,
  SLIME_MOTHER_PORTRAIT_URL,
  SLIME_MOTHER_SUMMON_CHANCE,
  SPRINT_EP_COST,
  STEALTH_BONUS_DAMAGE,
  STEALTH_DETECTION_CHANCE,
  STEALTH_DURATION_ROUNDS,
  STEALTH_EP_COST,
  STEALTH_EXTRA_DAMAGE_TAKEN,
  TACTICAL_OBSTACLES,
  TAUNT_DURATION_ROUNDS,
  TAUNT_RANGE_CELLS,
  calculateKnockbackTrajectory,
  computeEnemyMove,
  computeFacingToward,
  computeSlimeLeapLanding,
  createInitialCombatState,
  createSmallSlimeMinion,
  evaluateReactionSkill,
  findSlimeSummonCell,
  getArcaneBoltDamage,
  getArcaneBoltUpgradedDamage,
  getBackstabCells,
  getCharacterPortraitUrl,
  getConsecrationAreaCells,
  getDistance,
  getDistanceMetersToEnemy,
  getDistanceToEnemy,
  getEnemyCenterPx,
  getEnemyOccupiedCells,
  getFireBreathConeCells,
  getFireBreathDamage,
  getGallantChargeTargets,
  getMageBasicAttackRange,
  getPriestBasicAttackRange,
  getReachableCells,
  getReactionSkillsForClass,
  getScaledHealAmount,
  getSecondaryStats,
  getSlimeLeapSlamAreaCells,
  getWeaponDamageRange,
  isBehindFacing,
  isEnemyCellAt,
  isObstacleCell,
  resolveCombatAttack,
  rollEvasionOnly,
  rollHitAndEvasion,
  rollMageBasicAttackDamage,
  rollPlayerWeaponDamage,
  rollPriestBasicAttackDamage,
  type GallantChargeTarget,
} from '../game/engine';
import type {
  AudioPrefs,
  CharacterState,
  CombatEnemy,
  CombatLogEntry,
  CombatMinion,
  CombatState,
  CombatTone,
  EnemyFacing,
  EnemyId,
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
    | 'shield'
    | 'bleed'
    | 'stealth'
    | 'poison';
}

const CRIT_SPARK_ANGLES = [0, 52, 118, 178, 232, 304];

interface ActiveEnemyTarget {
  id: 'primary' | string;
  isPrimary: boolean;
  name: string;
  x: number;
  y: number;
  sizeCells: number;
  hp: number;
  maxHp: number;
  physicalDefense: number;
  magicDefense: number;
  evasionChance: number;
  facing: EnemyFacing;
  tauntedTurns: number;
  tauntedDefenseBonus: number;
}

function getEnemyVisualPos(enemy: { x: number; y: number; sizeCells: number }): GridPos {
  const offset = (Math.max(1, enemy.sizeCells) - 1) / 2;
  return { x: enemy.x + offset, y: enemy.y + offset };
}

function getActiveTarget(state: CombatState): ActiveEnemyTarget {
  if (state.selectedTargetId !== 'primary') {
    const minion = state.minions.find(
      (m) => m.instanceId === state.selectedTargetId && m.hp > 0
    );
    if (minion) {
      return {
        id: minion.instanceId,
        isPrimary: false,
        name: minion.name,
        x: minion.x,
        y: minion.y,
        sizeCells: 1,
        hp: minion.hp,
        maxHp: minion.maxHp,
        physicalDefense: minion.physicalDefense,
        magicDefense: minion.magicDefense,
        evasionChance: minion.evasionChance,
        facing: minion.facing,
        tauntedTurns: minion.tauntedTurns,
        tauntedDefenseBonus: minion.tauntedDefenseBonus,
      };
    }
  }
  if (state.enemy.hp > 0) {
    return {
      id: 'primary',
      isPrimary: true,
      name: state.enemy.name,
      x: state.enemy.x,
      y: state.enemy.y,
      sizeCells: state.enemy.sizeCells,
      hp: state.enemy.hp,
      maxHp: state.enemy.maxHp,
      physicalDefense: state.enemy.physicalDefense,
      magicDefense: state.enemy.magicDefense,
      evasionChance: state.enemy.evasionChance,
      facing: state.enemy.facing,
      tauntedTurns: state.enemy.tauntedTurns,
      tauntedDefenseBonus: state.enemy.tauntedDefenseBonus,
    };
  }
  const firstAliveMinion = state.minions.find((m) => m.hp > 0);
  if (firstAliveMinion) {
    return {
      id: firstAliveMinion.instanceId,
      isPrimary: false,
      name: firstAliveMinion.name,
      x: firstAliveMinion.x,
      y: firstAliveMinion.y,
      sizeCells: 1,
      hp: firstAliveMinion.hp,
      maxHp: firstAliveMinion.maxHp,
      physicalDefense: firstAliveMinion.physicalDefense,
      magicDefense: firstAliveMinion.magicDefense,
      evasionChance: firstAliveMinion.evasionChance,
      facing: firstAliveMinion.facing,
      tauntedTurns: firstAliveMinion.tauntedTurns,
      tauntedDefenseBonus: firstAliveMinion.tauntedDefenseBonus,
    };
  }
  return {
    id: 'primary',
    isPrimary: true,
    name: state.enemy.name,
    x: state.enemy.x,
    y: state.enemy.y,
    sizeCells: state.enemy.sizeCells,
    hp: state.enemy.hp,
    maxHp: state.enemy.maxHp,
    physicalDefense: state.enemy.physicalDefense,
    magicDefense: state.enemy.magicDefense,
    evasionChance: state.enemy.evasionChance,
    facing: state.enemy.facing,
    tauntedTurns: state.enemy.tauntedTurns,
    tauntedDefenseBonus: state.enemy.tauntedDefenseBonus,
  };
}

function isAllEnemiesDefeated(enemy: CombatEnemy, minions: CombatMinion[]): boolean {
  return enemy.hp <= 0 && minions.every((m) => m.hp <= 0);
}

function resolveNextSelectedTargetId(
  currentId: 'primary' | string,
  enemy: CombatEnemy,
  minions: CombatMinion[]
): 'primary' | string {
  if (currentId === 'primary' && enemy.hp > 0) return 'primary';
  if (currentId !== 'primary' && minions.some((m) => m.instanceId === currentId && m.hp > 0)) {
    return currentId;
  }
  if (enemy.hp > 0) return 'primary';
  const aliveMinion = minions.find((m) => m.hp > 0);
  return aliveMinion ? aliveMinion.instanceId : 'primary';
}

function applyTargetStateUpdate(
  prev: CombatState,
  targetId: 'primary' | string,
  patch: {
    hp?: number;
    bleedTurns?: number;
    bleedDamagePerTurn?: number;
    tauntedTurns?: number;
    tauntedBy?: string | null;
    tauntedDefenseBonus?: number;
  }
): {
  enemy: CombatEnemy;
  minions: CombatMinion[];
  selectedTargetId: 'primary' | string;
  allDefeated: boolean;
} {
  let nextEnemy = prev.enemy;
  let nextMinions = prev.minions;
  if (targetId === 'primary') {
    nextEnemy = {
      ...prev.enemy,
      ...(patch.hp !== undefined ? { hp: patch.hp } : {}),
      ...(patch.bleedTurns !== undefined ? { bleedTurns: patch.bleedTurns } : {}),
      ...(patch.bleedDamagePerTurn !== undefined
        ? { bleedDamagePerTurn: patch.bleedDamagePerTurn }
        : {}),
      ...(patch.tauntedTurns !== undefined ? { tauntedTurns: patch.tauntedTurns } : {}),
      ...(patch.tauntedBy !== undefined ? { tauntedBy: patch.tauntedBy } : {}),
      ...(patch.tauntedDefenseBonus !== undefined
        ? { tauntedDefenseBonus: patch.tauntedDefenseBonus }
        : {}),
    };
  } else {
    nextMinions = prev.minions.map((m) =>
      m.instanceId === targetId
        ? {
            ...m,
            ...(patch.hp !== undefined ? { hp: patch.hp } : {}),
            ...(patch.bleedTurns !== undefined ? { bleedTurns: patch.bleedTurns } : {}),
            ...(patch.bleedDamagePerTurn !== undefined
              ? { bleedDamagePerTurn: patch.bleedDamagePerTurn }
              : {}),
            ...(patch.tauntedTurns !== undefined ? { tauntedTurns: patch.tauntedTurns } : {}),
            ...(patch.tauntedBy !== undefined ? { tauntedBy: patch.tauntedBy } : {}),
            ...(patch.tauntedDefenseBonus !== undefined
              ? { tauntedDefenseBonus: patch.tauntedDefenseBonus }
              : {}),
          }
        : m
    );
  }
  const allDefeated = isAllEnemiesDefeated(nextEnemy, nextMinions);
  const selectedTargetId = resolveNextSelectedTargetId(
    prev.selectedTargetId,
    nextEnemy,
    nextMinions
  );
  return { enemy: nextEnemy, minions: nextMinions, selectedTargetId, allDefeated };
}

type CombatLogFilter = 'all' | 'damage' | 'effects';

function isDamageLogEntry(entry: CombatLogEntry): boolean {
  const hay = `${entry.tag ?? ''} ${entry.text} ${entry.detail ?? ''}`.toUpperCase();
  return (
    entry.tone === 'victory' ||
    entry.tone === 'defeat' ||
    entry.tone === 'reaction' ||
    /DANO|CRÍTIC|SANGRAMENTO|VENENO|GOSMENTO|PANCADA|SALTO|CUSPE|GOLPE|ATAQUE|OPORTUNIDADE|EVASÃO|EVADIU|ERROU|LETALIDADE|ARREMESSO|INVESTIDA|SETA ARCANA|BAFORADA|RAIO DIVINO|APARAR|IMPACTO/.test(
      hay
    )
  );
}

function renderFormattedLogText(text: string): React.ReactNode {
  const regex =
    /(\b\d+\s+de\s+dano(?:\s+(?:físico|mágico|extra))?|\bACERTO CRÍTICO\b|\bCRÍTICO\b|\bIMPACTO GOSMENTO\b|\bSALTO GOSMENTO\b|\bCUSPE GOSMENTO\b|\bSLIME PEQUENA\b|\bENVENENADO\b|\bVENENO\b|\bEVADIU\b|\bERROU\b|\bPERCEBEU\b|\bNÃO percebeu\b|\bVITÓRIA!|\bDERROTA!|\+\d+\s*(?:HP|de vida|de dano|Def\. Fís\.|Def\. Mág\.|Destreza))/gi;
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (!part) return null;
    const upper = part.toUpperCase();
    if (/^\d+\s+DE\s+DANO/i.test(part)) {
      return (
        <span key={idx} className="font-mono font-bold text-[#fde047]">
          {part}
        </span>
      );
    }
    if (
      upper.includes('CRÍTICO') ||
      upper === 'IMPACTO GOSMENTO' ||
      upper === 'SALTO GOSMENTO'
    ) {
      return (
        <span key={idx} className="font-bold text-[#fb923c]">
          {part}
        </span>
      );
    }
    if (
      upper === 'VENENO' ||
      upper === 'ENVENENADO' ||
      upper === 'CUSPE GOSMENTO' ||
      upper === 'SLIME PEQUENA'
    ) {
      return (
        <span key={idx} className="font-bold text-[#bef264]">
          {part}
        </span>
      );
    }
    if (upper === 'EVADIU' || upper === 'ERROU') {
      return (
        <span key={idx} className="font-bold text-[#93c5fd]">
          {part}
        </span>
      );
    }
    if (upper === 'PERCEBEU') {
      return (
        <span key={idx} className="font-bold text-[#f87171]">
          {part}
        </span>
      );
    }
    if (upper === 'NÃO PERCEBEU') {
      return (
        <span key={idx} className="font-bold text-[#d8b4fe]">
          {part}
        </span>
      );
    }
    if (part.startsWith('+')) {
      return (
        <span key={idx} className="font-mono font-bold text-[#86efac]">
          {part}
        </span>
      );
    }
    if (upper === 'VITÓRIA!') {
      return (
        <span key={idx} className="font-bold text-[#fde047]">
          {part}
        </span>
      );
    }
    if (upper === 'DERROTA!') {
      return (
        <span key={idx} className="font-bold text-[#f87171]">
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function parseCritFloatingText(raw: string): {
  header: string;
  value: string;
  suffix: string | null;
} {
  const numMatch = raw.match(/-\d+!?/);
  if (!numMatch) {
    return { header: 'CRÍTICO!', value: raw, suffix: null };
  }
  const numStr = numMatch[0].endsWith('!') ? numMatch[0] : `${numMatch[0]}!`;
  const idx = numMatch.index ?? 0;
  const before = raw.slice(0, idx).replace(/[·•]+$/g, '').trim();
  const after = raw
    .slice(idx + numMatch[0].length)
    .replace(/^[!·•\s]+|[!·•\s]+$/g, '')
    .trim();
  const header = before ? `${before.replace(/!+$/, '')}!` : 'CRÍTICO!';
  return {
    header,
    value: numStr,
    suffix: after || null,
  };
}

interface DustVfx {
  id: number;
  x: number;
  y: number;
  kind: 'footstep' | 'knockback';
}

interface MovingActor {
  who: 'player' | 'enemy';
  minionId?: string;
  portraitUrl?: string;
  facing?: EnemyFacing;
  left: number;
  top: number;
  transitionMs: number;
  knockback?: boolean;
}

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.2;

export function TacticalArenaModal({ isOpen, character, onClose }: TacticalArenaModalProps) {
  const [selectedEnemyId, setSelectedEnemyId] = useState<EnemyId>('goblin');
  const selectedEnemyIdRef = useRef<EnemyId>('goblin');
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [isCombatLogOpen, setIsCombatLogOpen] = useState(true);
  const [combatLogFilter, setCombatLogFilter] = useState<CombatLogFilter>('all');
  const [bannerKey, setBannerKey] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [audioPrefs, setAudioPrefs] = useState<AudioPrefs>(() => gameAudio.getPrefs());
  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
  const [hoveredToken, setHoveredToken] = useState<'player' | 'enemy' | string | null>(null);
  const [isStandardActionOpen, setIsStandardActionOpen] = useState(false);
  const [restoringLightBoostHeal, setRestoringLightBoostHeal] = useState(false);
  const [restoringLightAddRegen, setRestoringLightAddRegen] = useState(false);

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
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1,
  });

  // VFX state
  const [slashVfxs, setSlashVfxs] = useState<SlashVfx[]>([]);
  const [parryVfxs, setParryVfxs] = useState<ParryVfx[]>([]);
  const [tauntVfxs, setTauntVfxs] = useState<TauntVfx[]>([]);
  const [arcaneShieldVfxs, setArcaneShieldVfxs] = useState<ArcaneShieldVfx[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextVfx[]>([]);
  const [dustVfxs, setDustVfxs] = useState<DustVfx[]>([]);
  const [movingActor, setMovingActor] = useState<MovingActor | null>(null);
  const [hitTarget, setHitTarget] = useState<'player' | 'enemy' | string | null>(null);
  const [bossLeaping, setBossLeaping] = useState(false);
  const [slimeSlamCells, setSlimeSlamCells] = useState<Set<string>>(new Set());
  const [lungeState, setLungeState] = useState<{
    who: 'player' | 'enemy' | string;
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
  const slimeSummonCounterRef = useRef(0);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const executeGoblinTurnRef = useRef<(sessionId: number) => Promise<void>>(async () => {});
  const executeNextMinionTurnRef = useRef<(sessionId: number) => Promise<void>>(async () => {});
  const resolveIncomingAttackRef = useRef<
    (attack: PendingAttack, reactionId: string) => Promise<void>
  >(async () => {});

  const isMage = character.classId === 'mage';
  const isKnight = character.classId === 'knight';
  const isPriest = character.classId === 'priest';
  const isRogue = character.classId === 'rogue';
  const hasCombat = combat !== null;
  const availableReactions = useMemo(
    () => getReactionSkillsForClass(character.classId),
    [character.classId]
  );
  const heroDisplayName = character.name.trim() || 'Valerius';
  const heroPortraitUrl = useMemo(() => getCharacterPortraitUrl(character), [character]);

  const getLivePlayerStats = useCallback(
    (
      playerState?: CombatState['player'],
      enemyState?: CombatState['enemy'],
      minionsState?: CombatMinion[]
    ) => {
      const beyondLimitActive = (playerState?.beyondLimitTurns ?? 0) > 0;
      const bonusPhysicalDamage = beyondLimitActive ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
      const bonusMagicDamage = beyondLimitActive ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
      const primaryTauntBonus =
        enemyState && enemyState.hp > 0 && enemyState.tauntedTurns > 0
          ? enemyState.tauntedDefenseBonus
          : 0;
      const minionTauntBonus =
        minionsState?.reduce(
          (best, m) =>
            m.hp > 0 && m.tauntedTurns > 0 ? Math.max(best, m.tauntedDefenseBonus) : best,
          0
        ) ?? 0;
      const knightTauntDefBonus = Math.max(primaryTauntBonus, minionTauntBonus);
      const bonusPhysicalDefense =
        ((playerState?.arcaneArmorTurns ?? 0) > 0 ? ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS : 0) +
        knightTauntDefBonus;
      const bonusMagicDefense = knightTauntDefBonus;
      const isDwarfLowHp =
        character.raceId === 'dwarf' &&
        !!playerState &&
        playerState.hp > 0 &&
        playerState.hp / playerState.maxHp <= DWARF_RIGID_SKIN_LOW_HP_THRESHOLD;
      return getSecondaryStats(character, {
        bonusPhysicalDamage,
        bonusMagicDamage,
        bonusPhysicalDefense,
        bonusMagicDefense,
        isDwarfLowHp,
      });
    },
    [character]
  );

  const playerStats = useMemo(
    () => getLivePlayerStats(combat?.player, combat?.enemy, combat?.minions),
    [combat?.player, combat?.enemy, combat?.minions, getLivePlayerStats]
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
    const current = combatRef.current;
    if (!current) return;
    const next = updater(current);
    combatRef.current = next;
    setCombat(next);
  }, []);

  const appendLog = useCallback((tone: CombatTone, text: string, tag?: string, detail?: string) => {
    const id = nextIdRef.current++;
    const round = combatRef.current?.round ?? 1;
    setCombatLog((prev) => [...prev, { id, round, tone, tag, text, detail }]);
  }, []);

  // Close Ação Padrão menu or Fire Breath aiming on outside click / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStandardActionOpen(false);
        setHoveredCellKey(null);
        updateCombat((prev) =>
          prev.isFireBreathModeActive ||
          prev.isMoveModeActive ||
          prev.isGallantChargeModeActive ||
          prev.isConsecrationModeActive
            ? {
                ...prev,
                isFireBreathModeActive: false,
                isMoveModeActive: false,
                isGallantChargeModeActive: false,
                isConsecrationModeActive: false,
              }
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
        { id: textId, x: cx, y: cy - (variant === 'crit' ? 28 : 22), text, variant },
      ]);
      scheduleTimeout(
        () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
        variant === 'crit' ? 1480 : 1080
      );
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
      attacker: 'player' | 'enemy' | string,
      target: 'player' | 'enemy' | string,
      customLabel?: string,
      isCritical = false
    ) => {
      gameAudio.playSwordSlash();
      if (isCritical) {
        gameAudio.playCritImpact();
        setIsViewportShaking(false);
        requestAnimationFrame(() => setIsViewportShaking(true));
        scheduleTimeout(() => setIsViewportShaking(false), 320);
      }
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
          y: cy - (isCritical ? 26 : 18),
          text: customLabel ?? (isCritical ? `CRÍTICO -${damage}!` : `-${damage}`),
          variant: isCritical ? 'crit' : 'damage',
        },
      ]);

      scheduleTimeout(() => setHitTarget((cur) => (cur === target ? null : cur)), 430);
      scheduleTimeout(() => setSlashVfxs((prev) => prev.filter((v) => v.id !== slashId)), 560);
      scheduleTimeout(
        () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
        isCritical ? 1480 : 1050
      );
    },
    [scheduleTimeout]
  );

  const triggerCounterClashVfx = useCallback(
    (enemyPos: GridPos, playerPos: GridPos) => {
      gameAudio.playParryClang();
      const midX = ((enemyPos.x + playerPos.x) / 2) * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const midY = ((enemyPos.y + playerPos.y) / 2) * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const parryId = nextIdRef.current++;

      setParryVfxs((prev) => [...prev, { id: parryId, x: midX - 56, y: midY - 56 }]);
      scheduleTimeout(() => setParryVfxs((prev) => prev.filter((v) => v.id !== parryId)), 620);
    },
    [scheduleTimeout]
  );

  const triggerExecutionerVfx = useCallback(
    (
      attackerPos: GridPos,
      targetPos: GridPos,
      damage: number,
      isCritical: boolean,
      isExecuteBonus: boolean,
      hitTargetKey: 'enemy' | string = 'enemy'
    ) => {
      if (isCritical) {
        gameAudio.playCritImpact();
      } else {
        gameAudio.playHeavySmash();
      }
      setIsViewportShaking(false);
      requestAnimationFrame(() => {
        setIsViewportShaking(true);
      });
      scheduleTimeout(() => setIsViewportShaking(false), 380);

      setLungeState({
        who: 'player',
        dx: (targetPos.x - attackerPos.x) * 24,
        dy: (targetPos.y - attackerPos.y) * 24,
        scale: isExecuteBonus ? 1.26 : 1.2,
      });
      scheduleTimeout(() => setLungeState(null), 190);

      const cx = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const cy = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const angleDeg =
        (Math.atan2(targetPos.y - attackerPos.y, targetPos.x - attackerPos.x) * 180) / Math.PI;

      const slashId = nextIdRef.current++;
      const textId = nextIdRef.current++;

      setSlashVfxs((prev) => [
        ...prev,
        { id: slashId, x: cx - 58, y: cy - 58, angleDeg: angleDeg - 18, kind: 'heavy' },
      ]);

      setHitTarget(hitTargetKey);
      scheduleTimeout(() => setHitTarget((cur) => (cur === hitTargetKey ? null : cur)), 460);

      const label = isCritical
        ? isExecuteBonus
          ? `CARRASCO CRÍTICO -${damage}! (+7)`
          : `CARRASCO CRÍTICO -${damage}!`
        : isExecuteBonus
        ? `CARRASCO -${damage}! (+7)`
        : `CARRASCO -${damage}`;

      setFloatingTexts((prev) => [
        ...prev,
        {
          id: textId,
          x: cx,
          y: cy - 26,
          text: label,
          variant: isCritical ? 'crit' : 'damage',
        },
      ]);

      scheduleTimeout(() => setSlashVfxs((prev) => prev.filter((v) => v.id !== slashId)), 720);
      scheduleTimeout(
        () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
        isCritical ? 1480 : 1120
      );
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
      curveSign = 0.35,
      hitTargetKey: 'enemy' | 'player' | string = 'enemy'
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
          setHitTarget(hitTargetKey);
          scheduleTimeout(() => setHitTarget((cur) => (cur === hitTargetKey ? null : cur)), 360);
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

  // Mage Spell VFX 2: Armadura Arcana (runic armor barrier around caster)
  const triggerArcaneArmorVfx = useCallback(
    (pos: GridPos) => {
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
          text: `+${ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} DEF. FÍS.`,
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

  // Warrior Skill VFX: Golpe Duplo (synchronized lunge + 60fps Canvas 2D twin cross-slash)
  const triggerDoubleStrikeHitVfx = useCallback(
    (
      attackerPos: GridPos,
      targetPos: GridPos,
      strokeIndex: 1 | 2,
      damage: number,
      outcome: 'hit' | 'missed' | 'evaded',
      isCritical: boolean,
      hitTargetKey: 'enemy' | string = 'enemy'
    ) => {
      const attackerX = attackerPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const attackerY = attackerPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const targetX = targetPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const targetY = targetPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
      const dx = targetX - attackerX;
      const dy = targetY - attackerY;
      const dist = Math.hypot(dx, dy) || 1;
      const lungeDist = strokeIndex === 2 ? 19 : 14;
      const lateralSign = strokeIndex === 1 ? -1 : 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      setLungeState({
        who: 'player',
        dx: (dx / dist) * lungeDist + nx * lateralSign * 4,
        dy: (dy / dist) * lungeDist + ny * lateralSign * 4,
        scale: strokeIndex === 2 ? 1.22 : 1.14,
      });
      scheduleTimeout(() => setLungeState(null), 175);

      const didHit = outcome === 'hit';
      if (didHit) {
        gameAudio.playSwordSlash();
        if (isCritical) {
          gameAudio.playCritImpact();
        }
        if (strokeIndex === 2 || isCritical) {
          triggerViewportShake();
        }
      } else {
        gameAudio.playEvadeWhoosh();
      }

      spellVfxRef.current?.playDoubleStrikeHit({
        attackerX,
        attackerY,
        targetX,
        targetY,
        strokeIndex,
        isCritical,
        didHit,
      });

      const textId = nextIdRef.current++;
      const strokeTag = strokeIndex === 1 ? '(1º)' : '(2º)';
      if (didHit) {
        setHitTarget(hitTargetKey);
        scheduleTimeout(() => setHitTarget((cur) => (cur === hitTargetKey ? null : cur)), 240);
        setFloatingTexts((prev) => [
          ...prev,
          {
            id: textId,
            x: targetX + (strokeIndex === 1 ? -10 : 10),
            y: targetY - (strokeIndex === 1 ? 26 : 38),
            text: isCritical ? `CRÍTICO -${damage} ${strokeTag}!` : `-${damage} ${strokeTag}`,
            variant: isCritical ? 'crit' : 'damage',
          },
        ]);
      } else {
        setFloatingTexts((prev) => [
          ...prev,
          {
            id: textId,
            x: targetX + (strokeIndex === 1 ? -10 : 10),
            y: targetY - (strokeIndex === 1 ? 22 : 34),
            text: outcome === 'evaded' ? `EVADIU ${strokeTag}` : `ERROU ${strokeTag}`,
            variant: outcome === 'evaded' ? 'evade' : 'miss',
          },
        ]);
      }

      scheduleTimeout(() => {
        setFloatingTexts((prev) => prev.filter((v) => v.id !== textId));
      }, didHit && isCritical ? 1480 : 1050);
    },
    [scheduleTimeout, triggerViewportShake]
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
    (
      path: GridPos[],
      who: 'player' | 'enemy',
      sessionId: number,
      minionOpts?: { minionId: string; portraitUrl: string; facing: EnemyFacing }
    ): Promise<void> => {
      return new Promise((resolve) => {
        if (path.length < 2) {
          resolve();
          return;
        }
        const sizeCells =
          who === 'enemy' && !minionOpts ? combatRef.current?.enemy.sizeCells ?? 1 : 1;
        const tokenPx = sizeCells > 1 ? 94 : 44;
        const tokenOffset = (CELL_PIXEL_SIZE * sizeCells - tokenPx) / 2;
        const stepDuration = sizeCells > 1 ? 105 : 115;

        setHoveredToken(null);
        setMovingActor({
          who,
          minionId: minionOpts?.minionId,
          portraitUrl: minionOpts?.portraitUrl,
          facing: minionOpts?.facing,
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
              x: (prevPt.x + sizeCells / 2) * CELL_PIXEL_SIZE,
              y: (prevPt.y + sizeCells / 2) * CELL_PIXEL_SIZE,
              kind: 'footstep',
            },
          ]);
          scheduleTimeout(() => setDustVfxs((prev) => prev.filter((d) => d.id !== dustId)), 400);

          setMovingActor({
            who,
            minionId: minionOpts?.minionId,
            portraitUrl: minionOpts?.portraitUrl,
            facing: minionOpts?.facing,
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
      const hadTauntDefBonus = cur.enemy.tauntedDefenseBonus > 0;
      const nextEnemyTauntTurns = Math.max(0, cur.enemy.tauntedTurns - 1);

      // Dryad passive: Sangue Verde heals 2% of max HP at the start of player's turn for 3 rounds
      let runningPlayerHp = cur.player.hp;
      const hasGreenBloodTick =
        character.raceId === 'dryad' && cur.player.greenBloodTurns > 0 && runningPlayerHp > 0;
      const greenBloodHealAmount = hasGreenBloodTick
        ? Math.max(1, Math.round(cur.player.maxHp * DRYAD_GREEN_BLOOD_HEAL_PCT))
        : 0;
      const hpAfterGreenBlood = hasGreenBloodTick
        ? Math.min(cur.player.maxHp, runningPlayerHp + greenBloodHealAmount)
        : runningPlayerHp;
      const actualGreenBloodHeal = hpAfterGreenBlood - runningPlayerHp;
      runningPlayerHp = hpAfterGreenBlood;
      const nextGreenBloodTurns = hasGreenBloodTick
        ? Math.max(0, cur.player.greenBloodTurns - 1)
        : cur.player.greenBloodTurns;

      // Priest Luz Restauradora (+3 MP upgrade): Regeneração heals 3 HP at the start of each turn for 2 rounds
      const hasRegenTick = cur.player.regenerationTurns > 0 && runningPlayerHp > 0;
      const regenHealAmount = hasRegenTick ? cur.player.regenerationHealPerTurn : 0;
      const hpAfterRegen = hasRegenTick
        ? Math.min(cur.player.maxHp, runningPlayerHp + regenHealAmount)
        : runningPlayerHp;
      const actualRegenHeal = hpAfterRegen - runningPlayerHp;
      runningPlayerHp = hpAfterRegen;
      const nextRegenTurns = hasRegenTick
        ? Math.max(0, cur.player.regenerationTurns - 1)
        : cur.player.regenerationTurns;
      const nextRegenHealPerTurn = nextRegenTurns > 0 ? cur.player.regenerationHealPerTurn : 0;

      // Priest Proteção Sagrada: 15-point shield expires after 1 full round (at start of next player turn)
      const hadSacredShield = cur.player.sacredShieldTurns > 0;
      const nextSacredShieldTurns = Math.max(0, cur.player.sacredShieldTurns - 1);
      const expiredSacredShieldHp =
        hadSacredShield && nextSacredShieldTurns === 0 ? cur.player.sacredShieldHp : 0;
      const nextSacredShieldHp = nextSacredShieldTurns > 0 ? cur.player.sacredShieldHp : 0;

      // Mage Armadura Arcana: lasts 2 rounds; expires automatically when remaining turns reach 0
      const hadArcaneArmor = cur.player.arcaneArmorTurns > 0;
      const nextArcaneArmorTurns = Math.max(0, cur.player.arcaneArmorTurns - 1);

      // Rogue Furtividade: lasts 2 rounds; expires automatically at start of turn if remaining turns hit 0
      const hadStealth = cur.player.stealthTurns > 0;
      const nextStealthTurns = Math.max(0, cur.player.stealthTurns - 1);

      // Slime Mãe Poison tick: 1% of target's max HP per round for 2 rounds
      const hasPoisonTick = cur.player.poisonTurns > 0 && runningPlayerHp > 0;
      const poisonDmg = hasPoisonTick
        ? Math.max(1, cur.player.poisonDamagePerTurn || Math.round(cur.player.maxHp * SLIME_MOTHER_POISON_HP_PCT))
        : 0;
      const nextPoisonTurns = hasPoisonTick ? Math.max(0, cur.player.poisonTurns - 1) : 0;
      const nextPoisonDmgPerTurn = nextPoisonTurns > 0 ? cur.player.poisonDamagePerTurn : 0;
      let triggeredBeyondLimitFromPoison = false;
      let nextBeyondLimitUsed = cur.player.beyondLimitUsed;
      let nextBeyondLimitTurns = cur.player.beyondLimitTurns;
      if (hasPoisonTick) {
        const rawHpAfterPoison = runningPlayerHp - poisonDmg;
        if (character.raceId === 'human' && !nextBeyondLimitUsed && rawHpAfterPoison <= 0) {
          runningPlayerHp = 1;
          triggeredBeyondLimitFromPoison = true;
          nextBeyondLimitUsed = true;
          nextBeyondLimitTurns = HUMAN_BEYOND_LIMIT_ROUNDS;
        } else {
          runningPlayerHp = Math.max(0, rawHpAfterPoison);
        }
      }
      const defeatedByPoison = hasPoisonTick && runningPlayerHp <= 0;

      setIsStandardActionOpen(false);
      updateCombat((prev) => ({
        ...prev,
        isActive: !defeatedByPoison,
        outcome: defeatedByPoison ? 'defeat' : prev.outcome,
        currentTurn: 'player',
        isMoveModeActive: false,
        isFireBreathModeActive: false,
        isGallantChargeModeActive: false,
        isConsecrationModeActive: false,
        round: nextRound,
        player: {
          ...prev.player,
          hp: runningPlayerHp,
          ep: nextEp,
          hasMoved: isStunned || defeatedByPoison,
          hasActed: isStunned || defeatedByPoison,
          arcaneArmorTurns: nextArcaneArmorTurns,
          greenBloodTurns: nextGreenBloodTurns,
          regenerationTurns: nextRegenTurns,
          regenerationHealPerTurn: nextRegenHealPerTurn,
          sacredShieldHp: nextSacredShieldHp,
          sacredShieldTurns: nextSacredShieldTurns,
          stealthTurns: nextStealthTurns,
          poisonTurns: defeatedByPoison ? 0 : nextPoisonTurns,
          poisonDamagePerTurn: defeatedByPoison ? 0 : nextPoisonDmgPerTurn,
          beyondLimitUsed: nextBeyondLimitUsed,
          beyondLimitTurns: nextBeyondLimitTurns,
          sprintActiveThisTurn: false,
        },
        enemy: {
          ...prev.enemy,
          tauntedTurns: nextEnemyTauntTurns,
          tauntedBy: nextEnemyTauntTurns > 0 ? prev.enemy.tauntedBy : null,
          tauntedDefenseBonus: nextEnemyTauntTurns > 0 ? prev.enemy.tauntedDefenseBonus : 0,
        },
        minions: prev.minions.map((m) => {
          const nextMTaunt = Math.max(0, m.tauntedTurns - 1);
          return {
            ...m,
            tauntedTurns: nextMTaunt,
            tauntedBy: nextMTaunt > 0 ? m.tauntedBy : null,
            tauntedDefenseBonus: nextMTaunt > 0 ? m.tauntedDefenseBonus : 0,
          };
        }),
      }));

      if (hasPoisonTick) {
        gameAudio.playPoisonSizzle();
        setHitTarget('player');
        scheduleTimeout(() => setHitTarget((t) => (t === 'player' ? null : t)), 360);
        triggerFloatingStatus(
          { x: cur.player.x, y: cur.player.y },
          `-${poisonDmg} VENENO`,
          'poison'
        );
        appendLog(
          'enemy',
          `Veneno corrosivo causou ${poisonDmg} de dano (1% da sua Vida máxima).${
            nextPoisonTurns > 0
              ? ` Restam ${nextPoisonTurns} rodada(s).`
              : ' O veneno se dissipou.'
          }`,
          'VENENO',
          `-${poisonDmg} HP`
        );
        if (triggeredBeyondLimitFromPoison) {
          gameAudio.playCombatStartHorn();
          triggerFloatingStatus(
            { x: cur.player.x, y: cur.player.y },
            'ALÉM DO LIMITE! (1 HP)',
            'limit'
          );
          appendLog(
            'warning',
            `Além do Limite ativado! Você resistiu ao veneno com 1 de Vida e ganhou +${HUMAN_BEYOND_LIMIT_BONUS_DAMAGE} de dano por ${HUMAN_BEYOND_LIMIT_ROUNDS} rodadas!`,
            'ALÉM DO LIMITE'
          );
        }
        if (defeatedByPoison) {
          appendLog('defeat', 'DERROTA! Você sucumbiu ao Veneno corrosivo.', 'DERROTA');
          scheduleTimeout(() => {
            if (sessionIdRef.current === sessionId) gameAudio.playDefeatSound();
          }, 280);
          return;
        }
      }

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

      if (hasRegenTick) {
        const px = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
        const py = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
        gameAudio.playHolyHeal();
        spellVfxRef.current?.playHolyHeal({ x: px, y: py, enhanced: false });
        triggerFloatingStatus(
          { x: cur.player.x, y: cur.player.y },
          actualRegenHeal > 0
            ? `+${actualRegenHeal} HP · REGENERAÇÃO`
            : `REGENERAÇÃO (VIDA CHEIA)`,
          'heal'
        );
        appendLog(
          'player',
          `Regeneração restaurou +${actualRegenHeal} de Vida no início do turno${
            actualRegenHeal < regenHealAmount ? ' (Vida máxima atingida)' : ''
          }.${
            nextRegenTurns > 0
              ? ` Restam ${nextRegenTurns} rodada(s).`
              : ' O efeito se encerrou.'
          }`,
          'REGENERAÇÃO'
        );
      }

      if (hadSacredShield && nextSacredShieldTurns === 0 && expiredSacredShieldHp > 0) {
        appendLog(
          'info',
          `O escudo divino de Proteção Sagrada (${expiredSacredShieldHp} pts restantes) dissipou-se após 1 rodada.`,
          'PROTEÇÃO SAGRADA'
        );
      }

      if (hadArcaneArmor && nextArcaneArmorTurns === 0) {
        appendLog(
          'info',
          `Sua Armadura Arcana dissipou-se após ${ARCANE_ARMOR_DURATION_ROUNDS} rodadas (+${ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} Defesa Física encerrado).`,
          'ARMADURA ARCANA'
        );
      }

      if (hadStealth && nextStealthTurns === 0) {
        appendLog(
          'info',
          'Sua Furtividade chegou ao fim após 2 rodadas — você voltou a ficar visível (bônus de +5 dano e penalidade de +5 dano sofrido encerrados).',
          'FURTIVIDADE'
        );
      }

      if (hadTaunt && nextEnemyTauntTurns === 0) {
        appendLog(
          'info',
          hadTauntDefBonus
            ? `O efeito de Provocar sobre o ${cur.enemy.name} acabou — o bônus de +${KNIGHT_TAUNT_DEFENSE_BONUS} Defesa Física e Mágica foi encerrado.`
            : `O efeito de Provocar sobre o ${cur.enemy.name} chegou ao fim.`,
          'PROVOCAR'
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
            isGallantChargeModeActive: false,
            isConsecrationModeActive: false,
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

  const executeNextMinionTurn = useCallback(
    async (sessionId: number) => {
      if (sessionIdRef.current !== sessionId) return;
      const cur = combatRef.current;
      if (!cur || !cur.isActive) return;

      const queue = cur.pendingMinionTurns;
      if (queue.length === 0) {
        startPlayerTurn(sessionId);
        return;
      }

      const [nextMinionId, ...restQueue] = queue;
      updateCombat((prev) => ({
        ...prev,
        pendingMinionTurns: restQueue,
      }));

      const minion = cur.minions.find((m) => m.instanceId === nextMinionId && m.hp > 0);
      if (!minion) {
        await executeNextMinionTurnRef.current(sessionId);
        return;
      }

      // Bleed tick on Slime Pequena
      if (minion.bleedTurns > 0) {
        const bleedDmg = minion.bleedDamagePerTurn;
        const nextHp = Math.max(0, minion.hp - bleedDmg);
        const nextBleedTurns = Math.max(0, minion.bleedTurns - 1);
        const minionDead = nextHp <= 0;

        let allDefeated = false;
        updateCombat((prev) => {
          const updated = applyTargetStateUpdate(prev, minion.instanceId, {
            hp: nextHp,
            bleedTurns: minionDead ? 0 : nextBleedTurns,
            bleedDamagePerTurn: minionDead || nextBleedTurns === 0 ? 0 : minion.bleedDamagePerTurn,
          });
          allDefeated = updated.allDefeated;
          return {
            ...prev,
            isActive: !updated.allDefeated,
            outcome: updated.allDefeated ? 'victory' : 'ongoing',
            enemy: updated.enemy,
            minions: updated.minions,
            selectedTargetId: updated.selectedTargetId,
          };
        });

        setHitTarget(minion.instanceId);
        scheduleTimeout(() => setHitTarget((t) => (t === minion.instanceId ? null : t)), 360);
        triggerFloatingStatus({ x: minion.x, y: minion.y }, `-${bleedDmg} SANGRAMENTO`, 'bleed');
        appendLog(
          'player',
          `Sangramento causou ${bleedDmg} de dano a ${minion.name}.${
            minionDead
              ? ` ${minion.name} foi derrotada!`
              : nextBleedTurns > 0
              ? ` Restam ${nextBleedTurns} rodada(s).`
              : ' O sangramento estancou.'
          }`,
          'SANGRAMENTO',
          `-${bleedDmg} HP`
        );

        if (allDefeated) {
          appendLog('victory', 'VITÓRIA! Todos os inimigos foram derrotados!', 'GLÓRIA');
          scheduleTimeout(() => {
            if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
          }, 280);
          return;
        }

        if (minionDead) {
          scheduleTimeout(() => {
            void executeNextMinionTurnRef.current(sessionId);
          }, 420);
          return;
        }

        await new Promise<void>((resolve) => scheduleTimeout(resolve, 380));
        if (sessionIdRef.current !== sessionId) return;
      }

      const afterBleed = combatRef.current;
      if (!afterBleed || !afterBleed.isActive) return;
      const liveMinion = afterBleed.minions.find((m) => m.instanceId === nextMinionId && m.hp > 0);
      if (!liveMinion) {
        await executeNextMinionTurnRef.current(sessionId);
        return;
      }

      // Stealth perception check (Slime Pequena does NOT have True Sight -> 50% detection)
      if (afterBleed.player.stealthTurns > 0) {
        const detected = Math.random() * 100 < STEALTH_DETECTION_CHANCE;
        if (!detected) {
          updateCombat((prev) => ({
            ...prev,
            minions: prev.minions.map((m) =>
              m.instanceId === liveMinion.instanceId
                ? { ...m, spitCooldown: Math.max(0, m.spitCooldown - 1) }
                : m
            ),
          }));
          triggerFloatingStatus({ x: liveMinion.x, y: liveMinion.y }, '??? NÃO DETECTOU', 'stealth');
          appendLog(
            'player',
            `${liveMinion.name} não percebeu sua presença invisível (${STEALTH_DETECTION_CHANCE}%)!`,
            'FURTIVIDADE'
          );
          scheduleTimeout(() => {
            void executeNextMinionTurnRef.current(sessionId);
          }, 600);
          return;
        }
        triggerFloatingStatus({ x: liveMinion.x, y: liveMinion.y }, '! DETECTOU !', 'taunt');
      }

      // Decrement ranged spit cooldown
      updateCombat((prev) => ({
        ...prev,
        minions: prev.minions.map((m) =>
          m.instanceId === liveMinion.instanceId
            ? { ...m, spitCooldown: Math.max(0, m.spitCooldown - 1) }
            : m
        ),
      }));

      const afterCd = combatRef.current!;
      const curMinion = afterCd.minions.find((m) => m.instanceId === liveMinion.instanceId);
      if (!curMinion || curMinion.hp <= 0) {
        await executeNextMinionTurnRef.current(sessionId);
        return;
      }

      const extraBlocked: GridPos[] = [
        ...(afterCd.enemy.hp > 0
          ? getEnemyOccupiedCells(
              { x: afterCd.enemy.x, y: afterCd.enemy.y },
              afterCd.enemy.sizeCells
            )
          : []),
        ...afterCd.minions
          .filter((m) => m.hp > 0 && m.instanceId !== curMinion.instanceId)
          .map((m) => ({ x: m.x, y: m.y })),
      ];

      const { path: mPath, metersSpent: mMeters } = computeEnemyMove(
        { x: curMinion.x, y: curMinion.y },
        { x: afterCd.player.x, y: afterCd.player.y },
        curMinion.moveMeters,
        1,
        extraBlocked
      );

      if (mPath.length > 1) {
        const finalPos = mPath[mPath.length - 1];
        const moveFacing = computeFacingToward(
          { x: curMinion.x, y: curMinion.y },
          finalPos,
          curMinion.facing,
          1
        );
        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: true,
          minions: prev.minions.map((m) =>
            m.instanceId === curMinion.instanceId ? { ...m, facing: moveFacing } : m
          ),
        }));

        await animateTokenPath(mPath, 'enemy', sessionId, {
          minionId: curMinion.instanceId,
          portraitUrl: curMinion.portraitUrl,
          facing: moveFacing,
        });
        if (sessionIdRef.current !== sessionId) return;

        const facePlayer = computeFacingToward(
          finalPos,
          { x: afterCd.player.x, y: afterCd.player.y },
          moveFacing,
          1
        );
        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: false,
          minions: prev.minions.map((m) =>
            m.instanceId === curMinion.instanceId
              ? { ...m, x: finalPos.x, y: finalPos.y, facing: facePlayer }
              : m
          ),
        }));
        appendLog(
          'enemy',
          `${curMinion.name} desliza pelo terreno (${mMeters.toFixed(1).replace('.', ',')}m).`,
          'SLIME PEQUENA'
        );
      }

      if (sessionIdRef.current !== sessionId) return;
      const afterMove = combatRef.current;
      if (!afterMove || !afterMove.isActive) return;
      const actingMinion = afterMove.minions.find((m) => m.instanceId === curMinion.instanceId);
      if (!actingMinion || actingMinion.hp <= 0) {
        await executeNextMinionTurnRef.current(sessionId);
        return;
      }

      const dist = getDistance(
        afterMove.player.x,
        afterMove.player.y,
        actingMinion.x,
        actingMinion.y
      );
      const canMelee = dist <= 1;
      const canSpit =
        !canMelee &&
        dist <= actingMinion.spitRangeCells &&
        actingMinion.spitCooldown <= 0 &&
        actingMinion.mp >= actingMinion.spitMpCost;

      if (canMelee) {
        const contactOutcome = rollHitAndEvasion(actingMinion.hitChance, playerStats.evasionChance);
        if (contactOutcome !== 'hit') {
          gameAudio.playEvadeWhoosh();
          triggerFloatingStatus(
            { x: afterMove.player.x, y: afterMove.player.y },
            contactOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
            contactOutcome === 'evaded' ? 'evade' : 'miss'
          );
          appendLog(
            contactOutcome === 'evaded' ? 'player' : 'info',
            contactOutcome === 'evaded'
              ? `Você EVADIU de "${actingMinion.attackName}" de ${actingMinion.name}!`
              : `${actingMinion.name} errou "${actingMinion.attackName}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          scheduleTimeout(() => {
            void executeNextMinionTurnRef.current(sessionId);
          }, 680);
          return;
        }

        const isCritical = Math.random() * 100 < actingMinion.critChance;
        const incomingDmg = isCritical ? Math.round(actingMinion.dmg * 1.5) : actingMinion.dmg;
        const pendingMinionHit: PendingAttack = {
          attackerId: actingMinion.instanceId,
          attackerName: actingMinion.name,
          attackName: actingMinion.attackName,
          damageType: 'physical',
          baseDamage: actingMinion.dmg,
          incomingDamage: incomingDmg,
          isCritical,
          isHeavyBlow: false,
          poisonChance: actingMinion.poisonChance,
          poisonDamagePct: actingMinion.poisonDamagePct,
          poisonRounds: actingMinion.poisonRounds,
        };

        if (availableReactions.length === 0) {
          await resolveIncomingAttackRef.current(pendingMinionHit, 'none');
          return;
        }

        updateCombat((prev) => ({
          ...prev,
          awaitingReaction: true,
          pendingAttack: pendingMinionHit,
        }));
        gameAudio.playReactionAlert();
        appendLog(
          'warning',
          `${actingMinion.name} prepara "${actingMinion.attackName}" (${incomingDmg} dano físico${
            isCritical ? ' · CRÍTICO +50%' : ''
          } · ${actingMinion.poisonChance}% Veneno). Escolha sua reação.`,
          'ATAQUE IMINENTE'
        );
        return;
      }

      if (canSpit) {
        updateCombat((prev) => ({
          ...prev,
          minions: prev.minions.map((m) =>
            m.instanceId === actingMinion.instanceId
              ? {
                  ...m,
                  mp: Math.max(0, m.mp - m.spitMpCost),
                  spitCooldown: m.spitCooldownMax,
                }
              : m
          ),
        }));

        const contactOutcome = rollHitAndEvasion(actingMinion.hitChance, playerStats.evasionChance);
        gameAudio.playPoisonSizzle();
        spellVfxRef.current?.playArcaneBolt({
          startX: actingMinion.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
          startY: actingMinion.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
          endX: afterMove.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
          endY: afterMove.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
          curveSign: 0.25,
          hitImpact: contactOutcome === 'hit',
          travelMs: 260,
        });
        await new Promise<void>((resolve) => scheduleTimeout(resolve, 260));
        if (sessionIdRef.current !== sessionId) return;

        if (contactOutcome !== 'hit') {
          gameAudio.playEvadeWhoosh();
          triggerFloatingStatus(
            { x: afterMove.player.x, y: afterMove.player.y },
            contactOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
            contactOutcome === 'evaded' ? 'evade' : 'miss'
          );
          appendLog(
            contactOutcome === 'evaded' ? 'player' : 'info',
            contactOutcome === 'evaded'
              ? `Você EVADIU do "${actingMinion.spitName}" de ${actingMinion.name}!`
              : `${actingMinion.name} errou "${actingMinion.spitName}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          scheduleTimeout(() => {
            void executeNextMinionTurnRef.current(sessionId);
          }, 680);
          return;
        }

        const pendingSpit: PendingAttack = {
          attackerId: actingMinion.instanceId,
          attackerName: actingMinion.name,
          attackName: actingMinion.spitName,
          damageType: 'magical',
          baseDamage: actingMinion.spitDamage,
          incomingDamage: actingMinion.spitDamage,
          isCritical: false,
          isHeavyBlow: false,
          poisonChance: actingMinion.spitPoisonChance,
          poisonDamagePct: actingMinion.poisonDamagePct,
          poisonRounds: actingMinion.poisonRounds,
        };

        if (availableReactions.length === 0) {
          await resolveIncomingAttackRef.current(pendingSpit, 'none');
          return;
        }

        updateCombat((prev) => ({
          ...prev,
          awaitingReaction: true,
          pendingAttack: pendingSpit,
        }));
        gameAudio.playReactionAlert();
        appendLog(
          'warning',
          `${actingMinion.name} dispara "${actingMinion.spitName}" (${actingMinion.spitDamage} dano mágico · ${actingMinion.spitPoisonChance}% Veneno). Escolha sua reação.`,
          'CUSPE GOSMENTO'
        );
        return;
      }

      scheduleTimeout(() => {
        void executeNextMinionTurnRef.current(sessionId);
      }, 520);
    },
    [
      animateTokenPath,
      appendLog,
      availableReactions.length,
      playerStats.evasionChance,
      scheduleTimeout,
      startPlayerTurn,
      triggerFloatingStatus,
      updateCombat,
    ]
  );

  useEffect(() => {
    executeNextMinionTurnRef.current = executeNextMinionTurn;
  }, [executeNextMinionTurn]);

  const executeGoblinTurn = useCallback(
    async (sessionId: number) => {
      if (sessionIdRef.current !== sessionId) return;
      const current = combatRef.current;
      if (!current || !current.isActive) return;

      setIsStandardActionOpen(false);
      const enemyArticle = current.enemy.isBoss ? 'A' : 'O';
      const enemyArticleLower = current.enemy.isBoss ? 'a' : 'o';

      // Snapshot living minions at start of enemy phase so newly summoned slimes act next round
      const livingMinionIdsAtStart = current.minions
        .filter((m) => m.hp > 0)
        .map((m) => m.instanceId);
      updateCombat((prev) => ({
        ...prev,
        pendingMinionTurns: livingMinionIdsAtStart,
      }));

      const proceedAfterBossTurn = (delayMs = 850) => {
        scheduleTimeout(() => {
          if (sessionIdRef.current !== sessionId) return;
          const latest = combatRef.current;
          if (!latest || !latest.isActive || latest.awaitingReaction) return;
          if (latest.pendingMinionTurns.length > 0) {
            void executeNextMinionTurnRef.current(sessionId);
          } else {
            startPlayerTurn(sessionId);
          }
        }, delayMs);
      };

      // If primary boss is already defeated and only Slimes Pequenas remain
      if (current.enemy.hp <= 0) {
        if (livingMinionIdsAtStart.length > 0) {
          void executeNextMinionTurnRef.current(sessionId);
        } else {
          startPlayerTurn(sessionId);
        }
        return;
      }

      // Rogue Arremesso de Adaga Bleed tick at start of enemy turn (3 flat dmg/round for 3 rounds, NEVER crits)
      if (current.enemy.bleedTurns > 0 && current.enemy.hp > 0) {
        const bleedDmg = current.enemy.bleedDamagePerTurn;
        const nextEnemyHp = Math.max(0, current.enemy.hp - bleedDmg);
        const nextBleedTurns = Math.max(0, current.enemy.bleedTurns - 1);
        const bossDeadFromBleed = nextEnemyHp <= 0;

        let allDefeated = false;
        updateCombat((prev) => {
          const updated = applyTargetStateUpdate(prev, 'primary', {
            hp: nextEnemyHp,
            bleedTurns: bossDeadFromBleed ? 0 : nextBleedTurns,
            bleedDamagePerTurn:
              bossDeadFromBleed || nextBleedTurns === 0 ? 0 : prev.enemy.bleedDamagePerTurn,
          });
          allDefeated = updated.allDefeated;
          return {
            ...prev,
            isActive: !updated.allDefeated,
            outcome: updated.allDefeated ? 'victory' : 'ongoing',
            enemy: {
              ...updated.enemy,
              tankBusterCharging: bossDeadFromBleed ? false : updated.enemy.tankBusterCharging,
              tankBusterTarget: bossDeadFromBleed ? null : updated.enemy.tankBusterTarget,
            },
            minions: updated.minions,
            selectedTargetId: updated.selectedTargetId,
          };
        });

        setHitTarget('enemy');
        scheduleTimeout(() => setHitTarget((cur) => (cur === 'enemy' ? null : cur)), 380);
        triggerFloatingStatus(
          getEnemyVisualPos(current.enemy),
          `-${bleedDmg} SANGRAMENTO`,
          'bleed'
        );
        appendLog(
          'player',
          `Sangramento causou ${bleedDmg} de dano a ${enemyArticleLower} ${current.enemy.name} (não pode causar crítico).${
            bossDeadFromBleed
              ? ` ${enemyArticle} ${current.enemy.name} tombou!`
              : nextBleedTurns > 0
              ? ` Restam ${nextBleedTurns} rodada(s).`
              : ' O sangramento estancou.'
          }`,
          'SANGRAMENTO',
          `-${bleedDmg} HP`
        );

        if (allDefeated) {
          appendLog(
            'victory',
            `VITÓRIA! ${enemyArticle} ${current.enemy.name} sucumbiu ao Sangramento!`,
            'GLÓRIA'
          );
          scheduleTimeout(() => {
            if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
          }, 280);
          return;
        }

        if (bossDeadFromBleed) {
          appendLog(
            'warning',
            `${enemyArticle} ${current.enemy.name} caiu, mas ainda restam Slimes Pequenas vivas no campo!`,
            'COMBATE ATIVO'
          );
          proceedAfterBossTurn(520);
          return;
        }

        await new Promise<void>((resolve) => scheduleTimeout(resolve, 460));
        if (sessionIdRef.current !== sessionId) return;
      }

      const afterBleed = combatRef.current;
      if (!afterBleed || !afterBleed.isActive) return;

      if (afterBleed.enemy.stunnedTurns > 0) {
        updateCombat((prev) => ({
          ...prev,
          enemy: {
            ...prev.enemy,
            stunnedTurns: Math.max(0, prev.enemy.stunnedTurns - 1),
          },
        }));
        appendLog(
          'warning',
          `${enemyArticle} ${afterBleed.enemy.name} está atordoado e perde o turno automaticamente!`,
          'ATORDOADO'
        );
        proceedAfterBossTurn(850);
        return;
      }

      // Stealth Perception Check (Bosses with True Sight ALWAYS see through invisibility!)
      if (afterBleed.player.stealthTurns > 0) {
        if (afterBleed.enemy.trueSight) {
          triggerFloatingStatus(
            getEnemyVisualPos(afterBleed.enemy),
            'VISÃO VERDADEIRA!',
            'taunt'
          );
          appendLog(
            'warning',
            `Visão Verdadeira: ${enemyArticleLower} ${afterBleed.enemy.name} enxerga perfeitamente através da sua invisibilidade!`,
            'VISÃO VERDADEIRA'
          );
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 420));
          if (sessionIdRef.current !== sessionId) return;
        } else {
          const perceivedPresence = Math.random() * 100 < STEALTH_DETECTION_CHANCE;
          if (!perceivedPresence) {
            const passiveEp = Math.min(afterBleed.enemy.maxEp, afterBleed.enemy.ep + PASSIVE_EP_REGEN);
            updateCombat((prev) => ({
              ...prev,
              enemy: {
                ...prev.enemy,
                ep: passiveEp,
                heavyBlowCooldown: Math.max(0, prev.enemy.heavyBlowCooldown - 1),
                tankBusterCooldown: Math.max(0, prev.enemy.tankBusterCooldown - 1),
                leapSlamCooldown: Math.max(0, prev.enemy.leapSlamCooldown - 1),
              },
            }));
            triggerFloatingStatus(
              getEnemyVisualPos(afterBleed.enemy),
              '??? NÃO DETECTOU',
              'stealth'
            );
            appendLog(
              'player',
              `${enemyArticle} ${afterBleed.enemy.name} vasculhou o campo de batalha mas NÃO percebeu sua presença invisível (${STEALTH_DETECTION_CHANCE}%)! Ele permanece desorientado e não consegue localizar nem atacar você neste turno.`,
              'FURTIVIDADE',
              'Oculto nas Sombras'
            );
            proceedAfterBossTurn(900);
            return;
          }

          triggerFloatingStatus(
            getEnemyVisualPos(afterBleed.enemy),
            '! DETECTOU !',
            'taunt'
          );
          appendLog(
            'warning',
            `${enemyArticle} ${afterBleed.enemy.name} ouviu seus passos e PERCEBEU sua presença mesmo invisível (${STEALTH_DETECTION_CHANCE}%)! Ele avança na sua direção!`,
            'PERCEPÇÃO'
          );
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 480));
          if (sessionIdRef.current !== sessionId) return;
        }
      }

      const preAction = combatRef.current;
      if (!preAction || !preAction.isActive) return;

      const livingMinionCells = preAction.minions
        .filter((m) => m.hp > 0)
        .map((m) => ({ x: m.x, y: m.y }));

      // =========================================================================
      // BOSS CHARGED ATTACK PHASE B: UNLEASH "IMPACTO GOSMENTO" (NO SPOILER TEXT)
      // =========================================================================
      if (preAction.enemy.tankBusterCharging && preAction.enemy.skills.tankBuster) {
        const tbSkill = preAction.enemy.skills.tankBuster;
        const playerPos = { x: preAction.player.x, y: preAction.player.y };
        const enemyPos = { x: preAction.enemy.x, y: preAction.enemy.y };
        const distNow = getDistanceToEnemy(playerPos, enemyPos, preAction.enemy.sizeCells);
        const startPos = preAction.enemy.tankBusterTargetStartPos;
        const targetMovedAway =
          distNow > 1 &&
          (distNow > preAction.enemy.tankBusterStartDist ||
            !startPos ||
            startPos.x !== playerPos.x ||
            startPos.y !== playerPos.y);

        const chaseMeters = targetMovedAway
          ? preAction.enemy.moveMeters * tbSkill.chaseMoveMultiplier
          : preAction.enemy.moveMeters;

        if (targetMovedAway) {
          triggerFloatingStatus(
            getEnemyVisualPos(preAction.enemy),
            `PERSEGUIÇÃO 2× (${chaseMeters.toFixed(0)}m)!`,
            'taunt'
          );
          appendLog(
            'warning',
            `${enemyArticle} ${preAction.enemy.name} acelera ferozmente (2× deslocamento: ${chaseMeters.toFixed(1).replace('.', ',')}m) avançando sobre você!`,
            'PERSEGUIÇÃO'
          );
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 400));
          if (sessionIdRef.current !== sessionId) return;
        }

        if (distNow > 1) {
          const { path: chasePath, metersSpent: chaseSpent } = computeEnemyMove(
            enemyPos,
            playerPos,
            chaseMeters,
            preAction.enemy.sizeCells,
            livingMinionCells
          );
          if (chasePath.length > 1) {
            const finalPos = chasePath[chasePath.length - 1];
            updateCombat((prev) => ({
              ...prev,
              isAnimatingMove: true,
              enemy: {
                ...prev.enemy,
                facing: computeFacingToward(
                  { x: prev.enemy.x, y: prev.enemy.y },
                  finalPos,
                  prev.enemy.facing,
                  prev.enemy.sizeCells
                ),
              },
            }));
            await animateTokenPath(chasePath, 'enemy', sessionId);
            if (sessionIdRef.current !== sessionId) return;

            updateCombat((prev) => ({
              ...prev,
              isAnimatingMove: false,
              enemy: {
                ...prev.enemy,
                x: finalPos.x,
                y: finalPos.y,
                facing: computeFacingToward(
                  finalPos,
                  { x: prev.player.x, y: prev.player.y },
                  prev.enemy.facing,
                  prev.enemy.sizeCells
                ),
              },
            }));
            appendLog(
              'enemy',
              `${enemyArticle} ${preAction.enemy.name} avança impiedosamente (${chaseSpent.toFixed(1).replace('.', ',')}m)!`
            );
          }
        }

        const afterChase = combatRef.current;
        if (!afterChase || !afterChase.isActive) return;

        const distAfterChase = getDistanceToEnemy(
          { x: afterChase.player.x, y: afterChase.player.y },
          { x: afterChase.enemy.x, y: afterChase.enemy.y },
          afterChase.enemy.sizeCells
        );

        const regenedBossEp = Math.min(
          afterChase.enemy.maxEp,
          afterChase.enemy.ep + PASSIVE_EP_REGEN
        );

        if (distAfterChase <= 1) {
          const tbDamage = Math.max(
            1,
            Math.round(afterChase.player.maxHp * tbSkill.damagePctOfTargetMaxHp)
          );
          const pendingTb: PendingAttack = {
            attackerId: 'primary',
            attackerName: afterChase.enemy.name,
            attackName: tbSkill.name,
            damageType: 'physical',
            baseDamage: tbDamage,
            incomingDamage: tbDamage,
            isCritical: false,
            isHeavyBlow: false,
            isTankBuster: true,
          };

          updateCombat((prev) => ({
            ...prev,
            awaitingReaction: availableReactions.length > 0,
            pendingAttack: availableReactions.length > 0 ? pendingTb : null,
            enemy: {
              ...prev.enemy,
              ep: regenedBossEp,
              tankBusterCharging: false,
              tankBusterTarget: null,
              tankBusterTargetStartPos: null,
              tankBusterStartDist: 0,
              tankBusterCooldown: tbSkill.cooldown,
              facing: computeFacingToward(
                { x: prev.enemy.x, y: prev.enemy.y },
                { x: prev.player.x, y: prev.player.y },
                prev.enemy.facing,
                prev.enemy.sizeCells
              ),
            },
          }));

          if (availableReactions.length === 0) {
            await resolveIncomingAttackRef.current(pendingTb, 'none');
            return;
          }

          gameAudio.playReactionAlert();
          appendLog(
            'warning',
            `${enemyArticle} ${afterChase.enemy.name} descarrega "${tbSkill.name}" (${tbDamage} dano físico)! Escolha sua reação.`,
            'IMPACTO GOSMENTO'
          );
          return;
        }

        updateCombat((prev) => ({
          ...prev,
          enemy: {
            ...prev.enemy,
            ep: regenedBossEp,
            tankBusterCharging: false,
            tankBusterTarget: null,
            tankBusterTargetStartPos: null,
            tankBusterStartDist: 0,
            tankBusterCooldown: tbSkill.cooldown,
          },
        }));
        appendLog(
          'info',
          `${enemyArticle} ${afterChase.enemy.name} não alcançou distância para "${tbSkill.name}".`,
          'IMPACTO GOSMENTO'
        );
        proceedAfterBossTurn(850);
        return;
      }

      // =========================================================================
      // BOSS CHARGED ATTACK PHASE A: SILENT CHARGE (VISUAL WARNING OVER TOKEN ONLY!)
      // =========================================================================
      const tbSkillAvail =
        !!preAction.enemy.skills.tankBuster && preAction.enemy.tankBusterCooldown <= 0;
      const leapSkillAvail =
        !!preAction.enemy.skills.leapSlam && preAction.enemy.leapSlamCooldown <= 0;
      const distToPlayerNow = getDistanceToEnemy(
        { x: preAction.player.x, y: preAction.player.y },
        { x: preAction.enemy.x, y: preAction.enemy.y },
        preAction.enemy.sizeCells
      );
      const maxNormalCells = Math.floor(preAction.enemy.moveMeters / CELL_METERS);

      // If both Impacto Gosmento and Salto Gosmento are off cooldown, vary selection (50% each)
      const preferLeapOverCharge = leapSkillAvail && Math.random() < 0.5;

      if (
        tbSkillAvail &&
        !preferLeapOverCharge &&
        distToPlayerNow <= maxNormalCells
      ) {
        const regenedBossEp = Math.min(
          preAction.enemy.maxEp,
          preAction.enemy.ep + PASSIVE_EP_REGEN
        );

        updateCombat((prev) => ({
          ...prev,
          enemy: {
            ...prev.enemy,
            ep: regenedBossEp,
            leapSlamCooldown: Math.max(0, prev.enemy.leapSlamCooldown - 1),
            tankBusterCharging: true,
            tankBusterTarget: 'player',
            tankBusterTargetStartPos: { x: prev.player.x, y: prev.player.y },
            tankBusterStartDist: distToPlayerNow,
            facing: computeFacingToward(
              { x: prev.enemy.x, y: prev.enemy.y },
              { x: prev.player.x, y: prev.player.y },
              prev.enemy.facing,
              prev.enemy.sizeCells
            ),
          },
        }));

        // ONLY visual warning indicator over the player token's head — NO combat log spoiler!
        gameAudio.playTankBusterTelegraph();
        triggerViewportShake();

        proceedAfterBossTurn(950);
        return;
      }

      appendLog(
        'enemy',
        `${enemyArticle} ${preAction.enemy.name} inicia seu turno.`,
        preAction.enemy.isBoss ? 'TURNO DO CHEFE' : 'TURNO DO GOBLIN'
      );

      // =========================================================================
      // SLIME MÃE PASSIVE: 25% CHANCE EVERY TURN TO SUMMON A SLIME PEQUENA
      // =========================================================================
      if (
        preAction.enemy.summonChance > 0 &&
        livingMinionCells.length < preAction.enemy.maxMinions &&
        Math.random() * 100 < preAction.enemy.summonChance
      ) {
        const spawnCell = findSlimeSummonCell(
          { x: preAction.enemy.x, y: preAction.enemy.y },
          preAction.enemy.sizeCells,
          livingMinionCells,
          { x: preAction.player.x, y: preAction.player.y }
        );
        if (spawnCell) {
          slimeSummonCounterRef.current += 1;
          const summonFacing = computeFacingToward(
            spawnCell,
            { x: preAction.player.x, y: preAction.player.y },
            preAction.enemy.facing,
            1
          );
          const newSlime = createSmallSlimeMinion(
            slimeSummonCounterRef.current,
            spawnCell,
            summonFacing
          );
          updateCombat((prev) => ({
            ...prev,
            minions: [...prev.minions, newSlime],
          }));
          livingMinionCells.push(spawnCell);
          gameAudio.playPoisonSizzle();
          triggerFloatingStatus(spawnCell, 'SLIME INVOCADA!', 'poison');
          appendLog(
            'warning',
            `${enemyArticle} ${preAction.enemy.name} se divide e invoca ${newSlime.name} (${newSlime.maxHp} HP · ${newSlime.maxMp} MP · Investida Ácida / Cuspe Gosmento)!`,
            'INVOCAÇÃO',
            `${SLIME_MOTHER_SUMMON_CHANCE}% chance/turno`
          );
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 420));
          if (sessionIdRef.current !== sessionId) return;
        }
      }

      const afterSummon = combatRef.current;
      if (!afterSummon || !afterSummon.isActive) return;

      if (afterSummon.enemy.tauntedTurns > 0) {
        const tauntLabel =
          afterSummon.enemy.tauntedDefenseBonus > 0
            ? `Provocar (+${afterSummon.enemy.tauntedDefenseBonus} Def. Fís./Mág. ativa)`
            : 'Provocar';
        appendLog(
          'warning',
          `Sob efeito de ${tauntLabel} (${afterSummon.enemy.tauntedTurns} rodada(s) restante(s)), ${enemyArticleLower} ${afterSummon.enemy.name} é obrigado a avançar e atacar ${afterSummon.enemy.tauntedBy || heroDisplayName}!`,
          'PROVOCADO'
        );
      }

      updateCombat((prev) => ({
        ...prev,
        enemy: {
          ...prev.enemy,
          heavyBlowCooldown: Math.max(0, prev.enemy.heavyBlowCooldown - 1),
          tankBusterCooldown: Math.max(0, prev.enemy.tankBusterCooldown - 1),
          leapSlamCooldown: Math.max(0, prev.enemy.leapSlamCooldown - 1),
        },
      }));

      const afterCd = combatRef.current!;

      // =========================================================================
      // SLIME MÃE SKILL: SALTO GOSMENTO (6m LEAP + 6m AoE SLAM, 5 PHYS + 5 MAG, 15% POISON, 3t CD)
      // =========================================================================
      const leapSkill = afterCd.enemy.skills.leapSlam;
      if (leapSkill && afterCd.enemy.leapSlamCooldown <= 0) {
        const currentMinionCells = afterCd.minions
          .filter((m) => m.hp > 0)
          .map((m) => ({ x: m.x, y: m.y }));
        const leapPlan = computeSlimeLeapLanding(
          { x: afterCd.enemy.x, y: afterCd.enemy.y },
          { x: afterCd.player.x, y: afterCd.player.y },
          currentMinionCells,
          afterCd.enemy.sizeCells,
          leapSkill.leapRangeMeters,
          leapSkill.aoeRadiusMeters
        );

        if (leapPlan) {
          const leapFacing = computeFacingToward(
            leapPlan.landingPos,
            { x: afterCd.player.x, y: afterCd.player.y },
            afterCd.enemy.facing,
            afterCd.enemy.sizeCells
          );

          setBossLeaping(true);
          updateCombat((prev) => ({
            ...prev,
            isAnimatingMove: true,
            enemy: {
              ...prev.enemy,
              facing: leapFacing,
            },
          }));

          // Relocate at apex of jump if leaping to a new spot (up to 6m)
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 300));
          if (sessionIdRef.current !== sessionId) {
            setBossLeaping(false);
            return;
          }

          if (leapPlan.didRelocate) {
            updateCombat((prev) => ({
              ...prev,
              enemy: {
                ...prev.enemy,
                x: leapPlan.landingPos.x,
                y: leapPlan.landingPos.y,
                facing: leapFacing,
              },
            }));
          }

          // Impact crash & 6,0m AoE shockwave highlight
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 220));
          if (sessionIdRef.current !== sessionId) {
            setBossLeaping(false);
            return;
          }

          const aoeCells = getSlimeLeapSlamAreaCells(
            leapPlan.landingPos,
            afterCd.enemy.sizeCells,
            leapSkill.aoeRadiusMeters
          );
          setSlimeSlamCells(new Set(aoeCells.map((c) => `${c.x},${c.y}`)));
          scheduleTimeout(() => setSlimeSlamCells(new Set()), 950);
          scheduleTimeout(() => setBossLeaping(false), 180);

          gameAudio.playSlimeImpact();
          triggerViewportShake();
          triggerFloatingStatus(
            getEnemyVisualPos({
              x: leapPlan.landingPos.x,
              y: leapPlan.landingPos.y,
              sizeCells: afterCd.enemy.sizeCells,
            }),
            'SALTO GOSMENTO! (6m)',
            'poison'
          );

          const regenedLeapEp = Math.min(
            afterCd.enemy.maxEp,
            afterCd.enemy.ep + PASSIVE_EP_REGEN
          );
          const contactOutcome = rollHitAndEvasion(
            afterCd.enemy.hitChance,
            playerStats.evasionChance
          );

          if (contactOutcome !== 'hit') {
            updateCombat((prev) => ({
              ...prev,
              isAnimatingMove: false,
              enemy: {
                ...prev.enemy,
                ep: regenedLeapEp,
                leapSlamCooldown: leapSkill.cooldown,
              },
            }));
            gameAudio.playEvadeWhoosh();
            triggerFloatingStatus(
              { x: afterCd.player.x, y: afterCd.player.y },
              contactOutcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
              contactOutcome === 'evaded' ? 'evade' : 'miss'
            );
            appendLog(
              contactOutcome === 'evaded' ? 'player' : 'info',
              contactOutcome === 'evaded'
                ? `A ${afterCd.enemy.name} executou "${leapSkill.name}" (área ${SLIME_MOTHER_LEAP_AOE_RADIUS_METERS.toFixed(0)}m), mas você EVADIU do impacto!`
                : `A ${afterCd.enemy.name} executou "${leapSkill.name}" (área ${SLIME_MOTHER_LEAP_AOE_RADIUS_METERS.toFixed(0)}m), mas o impacto não atingiu você!`,
              contactOutcome === 'evaded' ? 'EVASÃO' : 'SALTO GOSMENTO',
              `Recarga ${leapSkill.cooldown}t`
            );
            proceedAfterBossTurn(900);
            return;
          }

          const pendingLeap: PendingAttack = {
            attackerId: 'primary',
            attackerName: afterCd.enemy.name,
            attackName: leapSkill.name,
            damageType: 'physical',
            baseDamage: leapSkill.physicalDamage,
            incomingDamage: leapSkill.physicalDamage,
            secondaryMagicDamage: leapSkill.magicDamage,
            isCritical: false,
            isHeavyBlow: false,
            isLeapSlam: true,
            poisonChance: leapSkill.poisonChance,
            poisonDamagePct: SLIME_MOTHER_POISON_HP_PCT,
            poisonRounds: SLIME_MOTHER_POISON_ROUNDS,
          };

          updateCombat((prev) => ({
            ...prev,
            isAnimatingMove: false,
            awaitingReaction: availableReactions.length > 0,
            pendingAttack: availableReactions.length > 0 ? pendingLeap : null,
            enemy: {
              ...prev.enemy,
              ep: regenedLeapEp,
              leapSlamCooldown: leapSkill.cooldown,
            },
          }));

          const leapDesc = leapPlan.didRelocate
            ? `salta ${leapPlan.leapMeters.toFixed(1).replace('.', ',')}m e cai com força`
            : 'salta alto e cai no mesmo lugar';

          if (availableReactions.length === 0) {
            appendLog(
              'warning',
              `${enemyArticle} ${afterCd.enemy.name} ${leapDesc} usando "${leapSkill.name}" em área de ${leapSkill.aoeRadiusMeters.toFixed(0)}m (${SLIME_MOTHER_LEAP_PHYSICAL_DAMAGE} Fís. + ${SLIME_MOTHER_LEAP_MAGIC_DAMAGE} Mág. · ${SLIME_MOTHER_LEAP_POISON_CHANCE}% Veneno)!`,
              'SALTO GOSMENTO',
              `Recarga ${leapSkill.cooldown}t`
            );
            await resolveIncomingAttackRef.current(pendingLeap, 'none');
            return;
          }

          gameAudio.playReactionAlert();
          appendLog(
            'warning',
            `${enemyArticle} ${afterCd.enemy.name} ${leapDesc} com "${leapSkill.name}" (área ${leapSkill.aoeRadiusMeters.toFixed(0)}m · ${SLIME_MOTHER_LEAP_PHYSICAL_DAMAGE} dano físico + ${SLIME_MOTHER_LEAP_MAGIC_DAMAGE} dano mágico · ${SLIME_MOTHER_LEAP_POISON_CHANCE}% Veneno). Escolha sua reação!`,
            'SALTO GOSMENTO',
            `Recarga ${leapSkill.cooldown}t`
          );
          return;
        }
      }

      const blockedForBossMove = afterCd.minions
        .filter((m) => m.hp > 0)
        .map((m) => ({ x: m.x, y: m.y }));
      const { path: enemyPath, metersSpent } = computeEnemyMove(
        { x: afterCd.enemy.x, y: afterCd.enemy.y },
        { x: afterCd.player.x, y: afterCd.player.y },
        afterCd.enemy.moveMeters,
        afterCd.enemy.sizeCells,
        blockedForBossMove
      );

      if (enemyPath.length > 1) {
        const enemyStartsAdjacent =
          getDistanceToEnemy(
            { x: afterCd.player.x, y: afterCd.player.y },
            { x: afterCd.enemy.x, y: afterCd.enemy.y },
            afterCd.enemy.sizeCells
          ) <= 1;

        if (
          enemyStartsAdjacent &&
          afterCd.player.hp > 0 &&
          afterCd.player.stunnedTurns <= 0 &&
          (isMage || isPriest || character.equippedWeapon !== null)
        ) {
          const wasStealthedOpp = afterCd.player.stealthTurns > 0;
          const bonusDmg =
            (afterCd.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0) +
            (wasStealthedOpp ? STEALTH_BONUS_DAMAGE : 0);
          const oppBaseDamage = isMage
            ? rollMageBasicAttackDamage(character, bonusDmg)
            : isPriest
            ? rollPriestBasicAttackDamage(character, bonusDmg)
            : rollPlayerWeaponDamage(character, bonusDmg);
          const oppResult = resolveCombatAttack({
            damageType: isPriest ? 'magical' : 'physical',
            baseDamage: oppBaseDamage,
            attackerHitChance: playerStats.hitChance,
            attackerCritChance: isPriest ? 0 : playerStats.critChance,
            defenderEvasionChance: afterCd.enemy.evasionChance,
            defenderPhysicalDefense: afterCd.enemy.physicalDefense,
            defenderMagicDefense: afterCd.enemy.magicDefense,
          });
          const enemyVisPos = getEnemyVisualPos(afterCd.enemy);

          if (isPriest) {
            const pCx = afterCd.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
            const pCy = afterCd.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
            const eCenter = getEnemyCenterPx(
              { x: afterCd.enemy.x, y: afterCd.enemy.y },
              afterCd.enemy.sizeCells
            );
            gameAudio.playDivineLaser();
            spellVfxRef.current?.playDivineBeam({
              startX: pCx,
              startY: pCy,
              endX: eCenter.x,
              endY: eCenter.y,
              didHit: oppResult.outcome === 'hit',
            });
          }

          if (oppResult.outcome === 'missed') {
            if (wasStealthedOpp) {
              updateCombat((prev) => ({
                ...prev,
                player: { ...prev.player, stealthTurns: 0 },
              }));
            }
            if (!isPriest) gameAudio.playEvadeWhoosh();
            triggerFloatingStatus(enemyVisPos, 'ERROU!', 'miss');
            appendLog(
              'info',
              `Seu Ataque de Oportunidade contra ${enemyArticleLower} ${afterCd.enemy.name} errou o alvo!${
                wasStealthedOpp ? ' Você saiu da invisibilidade.' : ''
              }`,
              'ERROU'
            );
          } else if (oppResult.outcome === 'evaded') {
            if (wasStealthedOpp) {
              updateCombat((prev) => ({
                ...prev,
                player: { ...prev.player, stealthTurns: 0 },
              }));
            }
            if (!isPriest) gameAudio.playEvadeWhoosh();
            triggerFloatingStatus(enemyVisPos, 'EVADIU!', 'evade');
            appendLog(
              'warning',
              `${enemyArticle} ${afterCd.enemy.name} evadiu do seu Ataque de Oportunidade, ignorando dano e efeitos!${
                wasStealthedOpp ? ' Você saiu da invisibilidade.' : ''
              }`,
              'EVASÃO'
            );
          } else {
            const oppDmg = oppResult.finalDamage;
            const nextEnemyHp = Math.max(0, afterCd.enemy.hp - oppDmg);
            const enemyDefeated = nextEnemyHp <= 0;
            let allDefeated = false;

            updateCombat((prev) => {
              const updated = applyTargetStateUpdate(prev, 'primary', { hp: nextEnemyHp });
              allDefeated = updated.allDefeated;
              return {
                ...prev,
                isActive: !updated.allDefeated,
                outcome: updated.allDefeated ? 'victory' : 'ongoing',
                player: {
                  ...prev.player,
                  stealthTurns: wasStealthedOpp ? 0 : prev.player.stealthTurns,
                },
                enemy: updated.enemy,
                minions: updated.minions,
                selectedTargetId: updated.selectedTargetId,
              };
            });

            if (isPriest) {
              setHitTarget('enemy');
              scheduleTimeout(() => setHitTarget((cur) => (cur === 'enemy' ? null : cur)), 380);
              triggerFloatingStatus(enemyVisPos, `-${oppDmg} DIVINO · OPORT.`, 'limit');
            } else {
              triggerSlashVfx(
                { x: afterCd.player.x, y: afterCd.player.y },
                enemyVisPos,
                oppDmg,
                'player',
                'enemy',
                oppResult.isCritical
                  ? `CRÍTICO -${oppDmg} OPORTUNIDADE!`
                  : `-${oppDmg} OPORTUNIDADE`,
                oppResult.isCritical
              );
            }

            const oppDetails: string[] = [];
            if (wasStealthedOpp) oppDetails.push(`+${STEALTH_BONUS_DAMAGE} Furtividade`);
            if (oppResult.isCritical) oppDetails.push('CRÍTICO +50%');
            if (oppResult.defenseApplied > 0) {
              oppDetails.push(
                isPriest
                  ? `-${oppResult.defenseApplied} Def. Mág.`
                  : `-${oppResult.defenseApplied} Def. Fís.`
              );
            }

            appendLog(
              'player',
              `Você aproveitou a movimentação de ${afterCd.enemy.name} e desferiu um Ataque de Oportunidade causando ${oppDmg} de dano${
                isPriest ? ' mágico' : ''
              }!${wasStealthedOpp ? ' (Saiu da Furtividade)' : ''}`,
              'ATAQUE DE OPORTUNIDADE',
              oppDetails.length > 0 ? oppDetails.join(' · ') : undefined
            );

            if (allDefeated) {
              appendLog(
                'victory',
                `VITÓRIA! Você derrotou ${enemyArticleLower} ${afterCd.enemy.name} com um Ataque de Oportunidade!`,
                'GLÓRIA'
              );
              scheduleTimeout(() => {
                if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
              }, 280);
              return;
            }
            if (enemyDefeated) {
              proceedAfterBossTurn(520);
              return;
            }
          }

          await new Promise<void>((resolve) => scheduleTimeout(resolve, 380));
          if (sessionIdRef.current !== sessionId) return;
        }

        const finalPos = enemyPath[enemyPath.length - 1];
        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: true,
          enemy: {
            ...prev.enemy,
            facing: computeFacingToward(
              { x: prev.enemy.x, y: prev.enemy.y },
              finalPos,
              prev.enemy.facing,
              prev.enemy.sizeCells
            ),
          },
        }));
        await animateTokenPath(enemyPath, 'enemy', sessionId);
        if (sessionIdRef.current !== sessionId) return;

        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: false,
          enemy: {
            ...prev.enemy,
            x: finalPos.x,
            y: finalPos.y,
            facing: computeFacingToward(
              finalPos,
              { x: prev.player.x, y: prev.player.y },
              prev.enemy.facing,
              prev.enemy.sizeCells
            ),
          },
        }));

        appendLog(
          'enemy',
          afterCd.enemy.isBoss
            ? `A ${afterCd.enemy.name} desliza pesadamente pelo campo (${metersSpent.toFixed(1).replace('.', ',')}m percorridos).`
            : `O ${afterCd.enemy.name} avança pela vegetação (${metersSpent.toFixed(1).replace('.', ',')}m percorridos).`
        );
      }

      if (sessionIdRef.current !== sessionId) return;
      const afterMove = combatRef.current;
      if (!afterMove || !afterMove.isActive) return;

      const regenedEnemyEp = Math.min(afterMove.enemy.maxEp, afterMove.enemy.ep + PASSIVE_EP_REGEN);
      const dist = getDistanceToEnemy(
        { x: afterMove.player.x, y: afterMove.player.y },
        { x: afterMove.enemy.x, y: afterMove.enemy.y },
        afterMove.enemy.sizeCells
      );

      const heavySkill = afterMove.enemy.skills.heavyBlow;
      const canUseHeavy =
        !!heavySkill &&
        dist <= 1 &&
        afterMove.enemy.heavyBlowCooldown <= 0 &&
        regenedEnemyEp >= heavySkill.epCost;
      const canUseBasic = dist <= 1 && regenedEnemyEp >= BASIC_ATTACK_EP_COST;

      // Turn enemy to face the player when attacking
      if (canUseHeavy || canUseBasic) {
        updateCombat((prev) => ({
          ...prev,
          enemy: {
            ...prev.enemy,
            facing: computeFacingToward(
              { x: prev.enemy.x, y: prev.enemy.y },
              { x: prev.player.x, y: prev.player.y },
              prev.enemy.facing,
              prev.enemy.sizeCells
            ),
          },
        }));
      }

      if (canUseHeavy && heavySkill) {
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
              : `${enemyArticle} ${afterMove.enemy.name} errou "${heavySkill.name}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          proceedAfterBossTurn(900);
          return;
        }

        const isCritical = Math.random() * 100 < afterMove.enemy.critChance;
        const incomingDmg = isCritical ? Math.round(baseHeavyDmg * 1.5) : baseHeavyDmg;
        const pendingHeavy: PendingAttack = {
          attackerId: 'primary',
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
            `${enemyArticle} ${afterMove.enemy.name} ergue a lâmina e desfere "${heavySkill.name}" (${incomingDmg} dano físico${
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
          `${enemyArticle} ${afterMove.enemy.name} ergue a lâmina e usa "${heavySkill.name}" (${incomingDmg} dano físico${
            isCritical ? ' · CRÍTICO +50%' : ''
          }, empurrão 6m e atordoamento)!`,
          isCritical ? 'CRÍTICO INIMIGO' : 'SKILL INIMIGA'
        );
        return;
      }

      if (canUseBasic) {
        const attackName = afterMove.enemy.attackName;
        const baseEnemyDmg = afterMove.enemy.dmg;
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
              : `${enemyArticle} ${afterMove.enemy.name} errou "${attackName}"!`,
            contactOutcome === 'evaded' ? 'EVASÃO' : 'ERROU'
          );
          proceedAfterBossTurn(900);
          return;
        }

        const isCritical = Math.random() * 100 < afterMove.enemy.critChance;
        const incomingDmg = isCritical ? Math.round(baseEnemyDmg * 1.5) : baseEnemyDmg;
        const pendingBasic: PendingAttack = {
          attackerId: 'primary',
          attackerName: afterMove.enemy.name,
          attackName,
          damageType: 'physical',
          baseDamage: baseEnemyDmg,
          incomingDamage: incomingDmg,
          isCritical,
          isHeavyBlow: false,
          poisonChance: afterMove.enemy.poisonChance,
          poisonDamagePct: afterMove.enemy.poisonDamagePct,
          poisonRounds: afterMove.enemy.poisonRounds,
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
          `${enemyArticle} ${afterMove.enemy.name} prepara "${attackName}" (${incomingDmg} dano físico${
            isCritical ? ' · CRÍTICO +50%' : ''
          }${afterMove.enemy.poisonChance > 0 ? ` · ${afterMove.enemy.poisonChance}% Veneno` : ''}). Escolha sua reação.`,
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

      appendLog('info', `${enemyArticle} ${afterMove.enemy.name} não alcançou distância de ataque neste turno.`);
      proceedAfterBossTurn(850);
    },
    [
      animateTokenPath,
      appendLog,
      availableReactions.length,
      character,
      heroDisplayName,
      isMage,
      isPriest,
      playerStats.critChance,
      playerStats.evasionChance,
      playerStats.hitChance,
      scheduleTimeout,
      startPlayerTurn,
      triggerFloatingStatus,
      triggerSlashVfx,
      triggerViewportShake,
      updateCombat,
    ]
  );

  useEffect(() => {
    executeGoblinTurnRef.current = executeGoblinTurn;
  }, [executeGoblinTurn]);

  const startNewCombat = useCallback(
    (overrideEnemyId?: EnemyId) => {
      clearAllTimers();
      const sessionId = ++sessionIdRef.current;
      const targetEnemyId = overrideEnemyId ?? selectedEnemyIdRef.current;
      selectedEnemyIdRef.current = targetEnemyId;
      setSelectedEnemyId(targetEnemyId);
      slimeSummonCounterRef.current = 0;

      setSlashVfxs([]);
      setParryVfxs([]);
      setTauntVfxs([]);
      setArcaneShieldVfxs([]);
      spellVfxRef.current?.clear();
      setFloatingTexts([]);
      setDustVfxs([]);
      setMovingActor(null);
      setHitTarget(null);
      setBossLeaping(false);
      setSlimeSlamCells(new Set());
      setLungeState(null);
      setHoveredCellKey(null);
      setHoveredToken(null);
      setIsStandardActionOpen(false);
      setRestoringLightBoostHeal(false);
      setRestoringLightAddRegen(false);

      const initial = createInitialCombatState(character, targetEnemyId);
      combatRef.current = initial;
      setCombat(initial);

      const name = character.name.trim() || 'Valerius';
      const enemyName = initial.enemy.name;
      const firstActorLine =
        initial.currentTurn === 'player'
          ? `${name} venceu a Iniciativa e age primeiro!`
          : initial.enemy.isBoss
          ? `A ${enemyName} foi mais rápida e age primeiro!`
          : `O ${enemyName} foi mais rápido e age primeiro!`;

      const initialLogs: CombatLogEntry[] = [
        {
          id: nextIdRef.current++,
          round: 1,
          tone: 'warning',
          tag: initial.enemy.isBoss ? 'COMBATE DE CHEFE' : 'COMBATE INICIADO',
          text: `Iniciativa: ${name} [${initial.player.initiativeRoll}] + ${character.attributes.dexterity} = ${initial.player.initiative} · ${enemyName} [${initial.enemy.initiativeRoll}] + ${initial.enemy.dexterity} = ${initial.enemy.initiative}`,
        },
        {
          id: nextIdRef.current++,
          round: 1,
          tone: initial.currentTurn === 'player' ? 'player' : 'enemy',
          tag: 'ORDEM',
          text: firstActorLine,
        },
      ];

      if (initial.enemy.isBoss) {
        initialLogs.push({
          id: nextIdRef.current++,
          round: 1,
          tone: 'warning',
          tag: 'CHEFE ABISSAL',
          text: `${enemyName} (${initial.enemy.maxHp} HP · Grande 2×2 · Mov. 9,0m): Visão Verdadeira (enxerga invisibilidade), Pancada Ácida (10% Veneno), Salto Gosmento (alcance 6m + área 6m · 5 Fís. + 5 Mág. · 15% Veneno · recarga 3t) e 25% de chance/turno de invocar Slime Pequena.`,
        });
      }

      setCombatLog(initialLogs);

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
    },
    [centerCamera, character, clearAllTimers, executeGoblinTurn, scheduleTimeout]
  );

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

  // Auto-scroll combat log when entries arrive or filter/visibility changes
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog, combatLogFilter, isCombatLogOpen]);

  // Re-center camera cleanly when combat log panel toggles width
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      centerCamera();
    });
    return () => cancelAnimationFrame(raf);
  }, [isCombatLogOpen, isOpen, centerCamera]);

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

  // Wheel zoom listener (re-runs once combat initializes so viewportRef is mounted)
  useEffect(() => {
    if (!isOpen || !hasCombat) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setCamera((prev) => {
        const clampedZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, Number((prev.zoom * zoomFactor).toFixed(3)))
        );
        const ratio = clampedZoom / prev.zoom;
        const nextX = mouseX - (mouseX - prev.x) * ratio;
        const nextY = mouseY - (mouseY - prev.y) * ratio;
        const clamped = clampCameraValues(nextX, nextY, clampedZoom);
        return { ...clamped, smooth: false };
      });
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [clampCameraValues, hasCombat, isOpen]);

  // Keyboard zoom shortcuts (+ / - / 0)
  useEffect(() => {
    if (!isOpen || !hasCombat) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        e.preventDefault();
        const viewport = viewportRef.current;
        if (!viewport) return;
        const cx = viewport.clientWidth / 2;
        const cy = viewport.clientHeight / 2;
        setCamera((prev) => {
          const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP));
          const ratio = clampedZoom / prev.zoom;
          return {
            ...clampCameraValues(cx - (cx - prev.x) * ratio, cy - (cy - prev.y) * ratio, clampedZoom),
            smooth: true,
          };
        });
      } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        e.preventDefault();
        const viewport = viewportRef.current;
        if (!viewport) return;
        const cx = viewport.clientWidth / 2;
        const cy = viewport.clientHeight / 2;
        setCamera((prev) => {
          const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom - ZOOM_STEP));
          const ratio = clampedZoom / prev.zoom;
          return {
            ...clampCameraValues(cx - (cx - prev.x) * ratio, cy - (cy - prev.y) * ratio, clampedZoom),
            smooth: true,
          };
        });
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomCentered(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clampCameraValues, hasCombat, isOpen, setZoomCentered]);

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
    if ((e.target as HTMLElement).closest('[data-viewport-control="true"]')) return;
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
    if ((e.target as HTMLElement).closest('[data-viewport-control="true"]')) return;
    if (e.touches.length === 2) {
      dragRef.current.active = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = {
        active: true,
        startDistance: Math.max(1, dist),
        startZoom: camera.zoom,
      };
      return;
    }
    if (e.touches.length !== 1) return;
    pinchRef.current.active = false;
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
    if (pinchRef.current.active && e.touches.length === 2) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const targetZoom = pinchRef.current.startZoom * (dist / pinchRef.current.startDistance);
      setCamera((prev) => {
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
        const ratio = clampedZoom / prev.zoom;
        const nextX = midX - (midX - prev.x) * ratio;
        const nextY = midY - (midY - prev.y) * ratio;
        return { ...clampCameraValues(nextX, nextY, clampedZoom), smooth: false };
      });
      return;
    }
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
    pinchRef.current.active = false;
    dragRef.current.active = false;
    setIsDragging(false);
    setTimeout(() => {
      dragRef.current.wasDragged = false;
    }, 0);
  };

  // Dynamic movement limit: standard 6.0m; Disparada = 12.0m (double); Furtividade keeps normal movement
  const currentMoveLimitMeters = useMemo(() => {
    if (!combat) return MAX_MOVE_METERS;
    return combat.player.sprintActiveThisTurn ? MAX_MOVE_METERS * 2 : MAX_MOVE_METERS;
  }, [combat]);

  // Reachable cells (dynamic movement limit)
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
      ...(combat.enemy.hp > 0
        ? getEnemyOccupiedCells(
            { x: combat.enemy.x, y: combat.enemy.y },
            combat.enemy.sizeCells
          )
        : []),
      ...combat.minions
        .filter((m) => m.hp > 0)
        .map((m) => ({ x: m.x, y: m.y })),
    ];
    return getReachableCells(combat.player.x, combat.player.y, currentMoveLimitMeters, blocked);
  }, [combat, currentMoveLimitMeters]);

  // Cells behind the selected enemy's back (highlighted for Rogue positioning / Letalidade)
  const backstabCellsSet = useMemo(() => {
    if (!isRogue || !combat || !combat.isActive) {
      return new Set<string>();
    }
    const activeTgt = getActiveTarget(combat);
    if (activeTgt.hp <= 0) return new Set<string>();
    return new Set(
      getBackstabCells(
        { x: activeTgt.x, y: activeTgt.y },
        activeTgt.facing,
        activeTgt.sizeCells
      ).map((c) => `${c.x},${c.y}`)
    );
  }, [combat, isRogue]);

  const isPlayerBehindEnemy = useMemo(() => {
    if (!isRogue || !combat) return false;
    const activeTgt = getActiveTarget(combat);
    if (activeTgt.hp <= 0) return false;
    return isBehindFacing(
      { x: combat.player.x, y: combat.player.y },
      { x: activeTgt.x, y: activeTgt.y },
      activeTgt.facing,
      activeTgt.sizeCells
    );
  }, [combat, isRogue]);

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

  // Knight Investida Galante straight-line 9m (6-cell) valid landing squares
  const gallantChargeMap = useMemo<Map<string, GallantChargeTarget>>(() => {
    if (
      !combat ||
      !combat.isActive ||
      !combat.isGallantChargeModeActive ||
      combat.currentTurn !== 'player' ||
      combat.player.hasActed ||
      combat.player.stunnedTurns > 0
    ) {
      return new Map();
    }
    return getGallantChargeTargets(
      { x: combat.player.x, y: combat.player.y },
      { x: combat.enemy.x, y: combat.enemy.y },
      combat.enemy.hp > 0,
      combat.enemy.sizeCells
    );
  }, [combat]);

  // Resolves a clicked or hovered cell to a valid charge landing square;
  // also supports clicking/hovering directly on any enemy footprint cell if on a valid charge line.
  const resolveChargeTargetForCell = useCallback(
    (
      x: number,
      y: number,
      map: Map<string, GallantChargeTarget>,
      enemy?: CombatState['enemy']
    ): { targetX: number; targetY: number; chargeData: GallantChargeTarget } | null => {
      const direct = map.get(`${x},${y}`);
      if (direct) {
        return { targetX: x, targetY: y, chargeData: direct };
      }

      if (
        enemy &&
        enemy.hp > 0 &&
        isEnemyCellAt(x, y, { x: enemy.x, y: enemy.y }, enemy.sizeCells)
      ) {
        // Prefer passing 1 square directly behind the enemy; fallback to stopping right in front of the enemy
        let bestThrough: { key: string; data: GallantChargeTarget } | null = null;
        let bestFront: { key: string; data: GallantChargeTarget } | null = null;

        for (const [key, data] of map.entries()) {
          if (data.passedThroughEnemy) {
            if (!bestThrough || data.distanceMeters < bestThrough.data.distanceMeters) {
              bestThrough = { key, data };
            }
          } else if (data.hitsEnemy) {
            if (!bestFront || data.distanceMeters > bestFront.data.distanceMeters) {
              bestFront = { key, data };
            }
          }
        }

        const chosen = bestThrough ?? bestFront;
        if (chosen) {
          const [tx, ty] = chosen.key.split(',').map(Number);
          return { targetX: tx, targetY: ty, chargeData: chosen.data };
        }
      }

      return null;
    },
    []
  );

  const hoveredChargeResolved = useMemo(() => {
    if (!hoveredCellKey || !combat || !combat.isGallantChargeModeActive) return null;
    const [hx, hy] = hoveredCellKey.split(',').map(Number);
    return resolveChargeTargetForCell(hx, hy, gallantChargeMap, combat.enemy);
  }, [hoveredCellKey, combat, gallantChargeMap, resolveChargeTargetForCell]);

  const hoveredChargePathSet = useMemo(() => {
    if (!hoveredChargeResolved) return new Set<string>();
    return new Set<string>(
      hoveredChargeResolved.chargeData.path.map((p: GridPos) => `${p.x},${p.y}`)
    );
  }, [hoveredChargeResolved]);

  // Priest Consagração: valid cast centers within 6.0m (4 cells) and 4.0m AoE circle preview
  const consecrationRangeSet = useMemo(() => {
    if (
      !combat ||
      !combat.isActive ||
      !combat.isConsecrationModeActive ||
      combat.currentTurn !== 'player' ||
      combat.player.hasActed ||
      combat.player.stunnedTurns > 0
    ) {
      return new Set<string>();
    }
    const valid = new Set<string>();
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (getDistance(combat.player.x, combat.player.y, col, row) <= CONSECRATION_CAST_RANGE_CELLS) {
          valid.add(`${col},${row}`);
        }
      }
    }
    return valid;
  }, [combat]);

  const hoveredConsecrationAreaSet = useMemo(() => {
    if (
      !combat ||
      !combat.isActive ||
      !combat.isConsecrationModeActive ||
      combat.currentTurn !== 'player' ||
      combat.player.hasActed ||
      !hoveredCellKey ||
      !consecrationRangeSet.has(hoveredCellKey)
    ) {
      return new Set<string>();
    }
    const [hx, hy] = hoveredCellKey.split(',').map(Number);
    if (Number.isNaN(hx) || Number.isNaN(hy)) return new Set<string>();
    const areaCells = getConsecrationAreaCells({ x: hx, y: hy });
    return new Set<string>(areaCells.map((c) => `${c.x},${c.y}`));
  }, [combat, consecrationRangeSet, hoveredCellKey]);

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
      isGallantChargeModeActive: false,
      isConsecrationModeActive: false,
    }));
  };

  // Knight Skill: Toggle Investida Galante straight-line 9m charge attack (20 EP, +5 Physical Attack during charge, passes through enemies)
  const handleToggleGallantChargeMode = () => {
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

    if (cur.player.ep < GALLANT_CHARGE_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Investida Galante! Necessário ${GALLANT_CHARGE_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const targets = getGallantChargeTargets(
      { x: cur.player.x, y: cur.player.y },
      { x: cur.enemy.x, y: cur.enemy.y },
      cur.enemy.hp > 0,
      cur.enemy.sizeCells
    );
    if (targets.size === 0) {
      appendLog('warning', 'Não há caminho livre em linha reta para executar Investida Galante.');
      return;
    }

    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      isGallantChargeModeActive: !prev.isGallantChargeModeActive,
    }));
  };

  const executeGallantCharge = async (x: number, y: number) => {
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      !cur.isGallantChargeModeActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    const resolved = resolveChargeTargetForCell(x, y, gallantChargeMap, cur.enemy);
    if (!resolved) return;
    const { targetX, targetY, chargeData } = resolved;

    if (cur.player.ep < GALLANT_CHARGE_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Investida Galante! Necessário ${GALLANT_CHARGE_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      updateCombat((prev) => ({ ...prev, isGallantChargeModeActive: false }));
      return;
    }

    const sessionId = sessionIdRef.current;
    const origin = { x: cur.player.x, y: cur.player.y };
    const startX = origin.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const startY = origin.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const endX = targetX * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const endY = targetY * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const enemyCenter = getEnemyCenterPx(
      { x: cur.enemy.x, y: cur.enemy.y },
      cur.enemy.sizeCells
    );
    const enemyCenterX = enemyCenter.x;
    const enemyCenterY = enemyCenter.y;
    const tokenOffset = (CELL_PIXEL_SIZE - 44) / 2;
    const rushDurationMs = Math.max(210, (chargeData.path.length - 1) * 58);

    setHoveredCellKey(null);
    setHoveredToken(null);

    updateCombat((prev) => ({
      ...prev,
      isGallantChargeModeActive: false,
      isMoveModeActive: false,
      isAnimatingMove: true,
      player: {
        ...prev.player,
        ep: Math.max(0, prev.player.ep - GALLANT_CHARGE_EP_COST),
      },
    }));

    gameAudio.playSwordSlash();
    triggerViewportShake();
    spellVfxRef.current?.playGallantCharge({
      startX,
      startY,
      endX,
      endY,
      passedThroughEnemy: chargeData.hitsEnemy,
      enemyX: enemyCenterX,
      enemyY: enemyCenterY,
    });

    // Rapid straight-line token dash (passes smoothly through enemies without Opportunity Attack)
    setMovingActor({
      who: 'player',
      left: origin.x * CELL_PIXEL_SIZE + tokenOffset,
      top: origin.y * CELL_PIXEL_SIZE + tokenOffset,
      transitionMs: 0,
    });

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        if (sessionIdRef.current !== sessionId) {
          setMovingActor(null);
          resolve();
          return;
        }
        setMovingActor({
          who: 'player',
          left: targetX * CELL_PIXEL_SIZE + tokenOffset,
          top: targetY * CELL_PIXEL_SIZE + tokenOffset,
          transitionMs: rushDurationMs,
        });
        scheduleTimeout(() => {
          setMovingActor(null);
          resolve();
        }, rushDurationMs + 30);
      });
    });

    if (sessionIdRef.current !== sessionId) return;

    const latest = combatRef.current;
    if (!latest || !latest.isActive) return;

    const distStr = chargeData.distanceMeters.toFixed(1).replace('.', ',');

    // Investida Galante strikes the enemy during the charge with +5 Physical Attack
    if (chargeData.hitsEnemy && latest.enemy.hp > 0) {
      const liveStats = getLivePlayerStats(latest.player, latest.enemy, latest.minions);
      const bonusDmg =
        (latest.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0) +
        GALLANT_CHARGE_BONUS_DAMAGE;
      const result = resolveCombatAttack({
        damageType: 'physical',
        baseDamage: rollPlayerWeaponDamage(character, bonusDmg),
        attackerHitChance: liveStats.hitChance,
        attackerCritChance: liveStats.critChance,
        defenderEvasionChance: latest.enemy.evasionChance,
        defenderPhysicalDefense: latest.enemy.physicalDefense,
        defenderMagicDefense: latest.enemy.magicDefense,
      });

      if (result.outcome !== 'hit') {
        updateCombat((prev) => ({
          ...prev,
          isAnimatingMove: false,
          player: {
            ...prev.player,
            x: targetX,
            y: targetY,
            hasActed: true,
          },
        }));
        gameAudio.playEvadeWhoosh();
        triggerFloatingStatus(
          getEnemyVisualPos(latest.enemy),
          result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
          result.outcome === 'evaded' ? 'evade' : 'miss'
        );
        appendLog(
          result.outcome === 'evaded' ? 'warning' : 'info',
          result.outcome === 'evaded'
            ? `Investida Galante (${distStr}m): ${latest.enemy.name} EVADIU do golpe durante a investida!`
            : `Investida Galante (${distStr}m): você avançou em linha reta, mas o golpe contra ${latest.enemy.name} errou o alvo!`,
          result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
          `-${GALLANT_CHARGE_EP_COST} EP`
        );
        return;
      }

      const dmg = result.finalDamage;
      const nextEnemyHp = Math.max(0, latest.enemy.hp - dmg);
      const enemyDefeated = nextEnemyHp <= 0;
      const allDefeatedAfter = enemyDefeated && latest.minions.every((m) => m.hp <= 0);

      updateCombat((prev) => {
        const updated = applyTargetStateUpdate(prev, 'primary', {
          hp: nextEnemyHp,
          tauntedTurns: enemyDefeated ? 0 : prev.enemy.tauntedTurns,
          tauntedBy: enemyDefeated ? null : prev.enemy.tauntedBy,
          tauntedDefenseBonus: enemyDefeated ? 0 : prev.enemy.tauntedDefenseBonus,
        });
        return {
          ...prev,
          isAnimatingMove: false,
          isActive: !updated.allDefeated,
          outcome: updated.allDefeated ? 'victory' : 'ongoing',
          player: {
            ...prev.player,
            x: targetX,
            y: targetY,
            hasActed: true,
          },
          enemy: updated.enemy,
          minions: updated.minions,
          selectedTargetId: updated.selectedTargetId,
        };
      });

      triggerSlashVfx(
        origin,
        getEnemyVisualPos(latest.enemy),
        dmg,
        'player',
        'enemy',
        result.isCritical ? `CRÍTICO -${dmg}!` : `-${dmg}`,
        result.isCritical
      );

      const detailParts = [
        `-${GALLANT_CHARGE_EP_COST} EP`,
        `+${GALLANT_CHARGE_BONUS_DAMAGE} Ataque Fís.`,
      ];
      if (result.isCritical) detailParts.push('CRÍTICO +50%');
      if (result.defenseApplied > 0) detailParts.push(`-${result.defenseApplied} Def. Fís.`);

      appendLog(
        'player',
        `Investida Galante! Você avançou ${distStr}m em linha reta${
          chargeData.passedThroughEnemy
            ? ` atravessando ${latest.enemy.name}`
            : ` contra ${latest.enemy.name}`
        } e golpeou causando ${dmg} de dano físico!`,
        result.isCritical ? 'INVESTIDA CRÍTICA' : 'INVESTIDA GALANTE',
        detailParts.join(' · ')
      );

      if (allDefeatedAfter) {
        appendLog(
          'victory',
          `VITÓRIA! Você derrotou ${latest.enemy.name} com a Investida Galante!`,
          'GLÓRIA'
        );
        scheduleTimeout(() => {
          if (sessionIdRef.current === sessionId) {
            gameAudio.playVictoryFanfare();
          }
        }, 280);
      } else if (enemyDefeated) {
        appendLog(
          'player',
          `${latest.enemy.name} foi derrotado(a)! Elimine as Slimes Pequenas restantes para vencer.`,
          'ABATE'
        );
      }
      return;
    }

    // Reposition charge when no enemy was along the trajectory
    updateCombat((prev) => ({
      ...prev,
      isAnimatingMove: false,
      player: {
        ...prev.player,
        x: targetX,
        y: targetY,
        hasActed: true,
      },
    }));

    appendLog(
      'player',
      `Investida Galante! Você avançou ${distStr}m em linha reta sem inimigos no trajeto.`,
      'INVESTIDA GALANTE',
      `-${GALLANT_CHARGE_EP_COST} EP`
    );
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
      getEnemyOccupiedCells({ x: cur.enemy.x, y: cur.enemy.y }, cur.enemy.sizeCells).some((ec) =>
        coneCells.some((c) => c.x === ec.x && c.y === ec.y)
      );
    const minionsInCone = cur.minions.filter(
      (m) => m.hp > 0 && coneCells.some((c) => c.x === m.x && c.y === m.y)
    );
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

    if (!enemyInCone && minionsInCone.length === 0) {
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
    const baseFireDamage = getFireBreathDamage(character, bonusMagicDmg);

    const primaryResult = enemyInCone
      ? resolveCombatAttack({
          damageType: 'magical',
          baseDamage: baseFireDamage,
          attackerHitChance: playerStats.hitChance,
          attackerCritChance: 0,
          defenderEvasionChance: cur.enemy.evasionChance,
          defenderPhysicalDefense: cur.enemy.physicalDefense,
          defenderMagicDefense: cur.enemy.magicDefense,
        })
      : null;

    const minionResults = minionsInCone.map((m) => ({
      minion: m,
      result: resolveCombatAttack({
        damageType: 'magical',
        baseDamage: baseFireDamage,
        attackerHitChance: playerStats.hitChance,
        attackerCritChance: 0,
        defenderEvasionChance: m.evasionChance,
        defenderPhysicalDefense: m.physicalDefense,
        defenderMagicDefense: m.magicDefense,
      }),
    }));

    scheduleTimeout(() => {
      if (sessionIdRef.current !== sessionId) return;
      const latest = combatRef.current;
      if (!latest || !latest.isActive) return;

      const hitSummaries: string[] = [];
      const missSummaries: string[] = [];
      const defeatedNames: string[] = [];
      let nextEnemy = latest.enemy;
      let nextMinions = latest.minions;
      let anyHit = false;
      let firstDefApplied = 0;

      if (primaryResult && latest.enemy.hp > 0) {
        if (primaryResult.outcome === 'hit') {
          anyHit = true;
          const finalDmg = primaryResult.finalDamage;
          if (firstDefApplied === 0) firstDefApplied = primaryResult.defenseApplied;
          const nextHp = Math.max(0, latest.enemy.hp - finalDmg);
          nextEnemy = { ...latest.enemy, hp: nextHp };
          if (nextHp <= 0) defeatedNames.push(latest.enemy.name);
          hitSummaries.push(`${latest.enemy.name} (-${finalDmg})`);

          setHitTarget('enemy');
          scheduleTimeout(() => setHitTarget((t) => (t === 'enemy' ? null : t)), 380);
          const enemyPx = getEnemyCenterPx(
            { x: latest.enemy.x, y: latest.enemy.y },
            latest.enemy.sizeCells
          );
          const textId = nextIdRef.current++;
          setFloatingTexts((prev) => [
            ...prev,
            { id: textId, x: enemyPx.x, y: enemyPx.y - 22, text: `-${finalDmg} FOGO`, variant: 'fire' },
          ]);
          scheduleTimeout(
            () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
            1120
          );
        } else {
          missSummaries.push(
            `${latest.enemy.name} (${primaryResult.outcome === 'evaded' ? 'evadiu' : 'resistiu'})`
          );
          triggerFloatingStatus(
            getEnemyVisualPos(latest.enemy),
            primaryResult.outcome === 'evaded' ? 'EVADIU!' : 'RESISTIU!',
            primaryResult.outcome === 'evaded' ? 'evade' : 'miss'
          );
        }
      }

      if (minionResults.length > 0) {
        const dmgByMinionId = new Map<string, number>();
        for (const entry of minionResults) {
          const liveM = latest.minions.find((m) => m.instanceId === entry.minion.instanceId && m.hp > 0);
          if (!liveM) continue;
          if (entry.result.outcome === 'hit') {
            anyHit = true;
            const finalDmg = entry.result.finalDamage;
            dmgByMinionId.set(liveM.instanceId, finalDmg);
            const nextHp = Math.max(0, liveM.hp - finalDmg);
            if (nextHp <= 0) defeatedNames.push(liveM.name);
            hitSummaries.push(`${liveM.name} (-${finalDmg})`);

            const mPx = getEnemyCenterPx({ x: liveM.x, y: liveM.y }, 1);
            const textId = nextIdRef.current++;
            setFloatingTexts((prev) => [
              ...prev,
              { id: textId, x: mPx.x, y: mPx.y - 22, text: `-${finalDmg} FOGO`, variant: 'fire' },
            ]);
            scheduleTimeout(
              () => setFloatingTexts((prev) => prev.filter((v) => v.id !== textId)),
              1120
            );
          } else {
            missSummaries.push(
              `${liveM.name} (${entry.result.outcome === 'evaded' ? 'evadiu' : 'resistiu'})`
            );
            triggerFloatingStatus(
              { x: liveM.x, y: liveM.y },
              entry.result.outcome === 'evaded' ? 'EVADIU!' : 'RESISTIU!',
              entry.result.outcome === 'evaded' ? 'evade' : 'miss'
            );
          }
        }
        nextMinions = latest.minions.map((m) => {
          const taken = dmgByMinionId.get(m.instanceId);
          return taken !== undefined ? { ...m, hp: Math.max(0, m.hp - taken) } : m;
        });
      }

      if (!anyHit) {
        gameAudio.playEvadeWhoosh();
        appendLog(
          'warning',
          `As chamas da Baforada de Fogo não acertaram nenhum alvo (${missSummaries.join(', ')})!`,
          'BAFORADA DE FOGO',
          `-${FIRE_BREATH_MP_COST} MP`
        );
        return;
      }

      const allDefeated = isAllEnemiesDefeated(nextEnemy, nextMinions);
      const nextSelected = resolveNextSelectedTargetId(
        latest.selectedTargetId,
        nextEnemy,
        nextMinions
      );

      updateCombat((prev) => ({
        ...prev,
        isActive: !allDefeated,
        outcome: allDefeated ? 'victory' : 'ongoing',
        enemy: nextEnemy,
        minions: nextMinions,
        selectedTargetId: nextSelected,
      }));

      const details = [`-${FIRE_BREATH_MP_COST} MP`];
      if (firstDefApplied > 0) details.push(`-${firstDefApplied} Def. Mág.`);

      appendLog(
        'player',
        `Baforada de Fogo incinerou em cone de 6,0m: ${hitSummaries.join(', ')}${
          missSummaries.length > 0 ? ` · Sem efeito em: ${missSummaries.join(', ')}` : ''
        }!`,
        'BAFORADA DE FOGO',
        details.join(' · ')
      );

      if (allDefeated) {
        appendLog(
          'victory',
          'VITÓRIA! Você incinerou todos os inimigos com a Baforada de Fogo!',
          'GLÓRIA'
        );
        scheduleTimeout(() => {
          if (sessionIdRef.current === sessionId) {
            gameAudio.playVictoryFanfare();
          }
        }, 280);
      } else if (defeatedNames.length > 0) {
        appendLog(
          'player',
          `Abatidos pelas chamas: ${defeatedNames.join(', ')}!`,
          'ABATE'
        );
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

    if (cur.isConsecrationModeActive && !cur.player.hasActed) {
      executeConsecration({ x, y });
      return;
    }

    if (cur.isGallantChargeModeActive && !cur.player.hasActed) {
      await executeGallantCharge(x, y);
      return;
    }

    if (!cur.isMoveModeActive || cur.player.hasMoved) {
      // Clicking on a living minion or the primary enemy selects it as active target
      const clickedMinion = cur.minions.find((m) => m.hp > 0 && m.x === x && m.y === y);
      if (clickedMinion) {
        updateCombat((prev) => ({ ...prev, selectedTargetId: clickedMinion.instanceId }));
        return;
      }
      if (
        cur.enemy.hp > 0 &&
        isEnemyCellAt(x, y, { x: cur.enemy.x, y: cur.enemy.y }, cur.enemy.sizeCells)
      ) {
        updateCombat((prev) => ({ ...prev, selectedTargetId: 'primary' }));
        return;
      }
      return;
    }

    const key = `${x},${y}`;
    const cellData = reachableMap.get(key);
    if (!cellData) return;

    const sessionId = sessionIdRef.current;
    setHoveredCellKey(null);

    const primaryCanOpp =
      cur.enemy.hp > 0 &&
      cur.enemy.stunnedTurns <= 0 &&
      !cur.enemy.tankBusterCharging &&
      getDistanceToEnemy(
        { x: cur.player.x, y: cur.player.y },
        { x: cur.enemy.x, y: cur.enemy.y },
        cur.enemy.sizeCells
      ) <= 1;

    const adjacentMinionOpp = !primaryCanOpp
      ? cur.minions.find(
          (m) =>
            m.hp > 0 &&
            m.stunnedTurns <= 0 &&
            getDistanceToEnemy({ x: cur.player.x, y: cur.player.y }, { x: m.x, y: m.y }, 1) <= 1
        )
      : undefined;

    if (primaryCanOpp || adjacentMinionOpp) {
      const oppAttacker = primaryCanOpp
        ? {
            id: 'primary' as const,
            name: cur.enemy.name,
            attackName: cur.enemy.attackName,
            dmg: cur.enemy.dmg,
            hitChance: cur.enemy.hitChance,
            critChance: cur.enemy.critChance,
            trueSight: Boolean(cur.enemy.trueSight),
            visualPos: getEnemyVisualPos(cur.enemy),
            poisonChance: cur.enemy.poisonChance,
            poisonDamagePct: cur.enemy.poisonDamagePct,
            poisonRounds: cur.enemy.poisonRounds,
          }
        : {
            id: adjacentMinionOpp!.instanceId,
            name: adjacentMinionOpp!.name,
            attackName: adjacentMinionOpp!.attackName,
            dmg: adjacentMinionOpp!.dmg,
            hitChance: adjacentMinionOpp!.hitChance,
            critChance: adjacentMinionOpp!.critChance,
            trueSight: false,
            visualPos: { x: adjacentMinionOpp!.x, y: adjacentMinionOpp!.y },
            poisonChance: adjacentMinionOpp!.poisonChance,
            poisonDamagePct: adjacentMinionOpp!.poisonDamagePct,
            poisonRounds: adjacentMinionOpp!.poisonRounds,
          };

      // If player is invisible, True Sight bosses ALWAYS detect; normal enemies/minions have 50% chance
      if (cur.player.stealthTurns > 0) {
        if (oppAttacker.trueSight) {
          triggerFloatingStatus(oppAttacker.visualPos, 'VISÃO VERDADEIRA!', 'taunt');
          appendLog(
            'warning',
            `${oppAttacker.name} enxerga através da invisibilidade (Visão Verdadeira) e desfere um Ataque de Oportunidade!`,
            'VISÃO VERDADEIRA'
          );
        } else {
          const detectedMovement = Math.random() * 100 < STEALTH_DETECTION_CHANCE;
          if (!detectedMovement) {
            triggerFloatingStatus(oppAttacker.visualPos, '??? NÃO PERCEBEU', 'stealth');
            appendLog(
              'player',
              `Você deslizou pelas sombras sem ser notado! ${oppAttacker.name} não percebeu sua movimentação (${STEALTH_DETECTION_CHANCE}%) e não realizou Ataque de Oportunidade.`,
              'FURTIVIDADE'
            );
            await completePlayerMovement(x, y, cellData.path, cellData.cost, sessionId);
            return;
          }
          triggerFloatingStatus(oppAttacker.visualPos, '! DETECTOU !', 'taunt');
          appendLog(
            'warning',
            `${oppAttacker.name} percebeu sua presença invisível (${STEALTH_DETECTION_CHANCE}%) ao se mover e desfere um Ataque de Oportunidade!`,
            'PERCEPÇÃO'
          );
        }
      }

      const oppOutcome = rollHitAndEvasion(oppAttacker.hitChance, playerStats.evasionChance);

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
            ? `Você EVADIU do Ataque de Oportunidade de ${oppAttacker.name}, ignorando dano e efeitos!`
            : `${oppAttacker.name} errou o Ataque de Oportunidade enquanto você se movia!`,
          oppOutcome === 'evaded' ? 'EVASÃO' : 'ATAQUE DE OPORTUNIDADE'
        );
        await completePlayerMovement(x, y, cellData.path, cellData.cost, sessionId);
        return;
      }

      const isCritical = Math.random() * 100 < oppAttacker.critChance;
      const incomingDmg = isCritical ? Math.round(oppAttacker.dmg * 1.5) : oppAttacker.dmg;
      const pendingOpp: PendingAttack = {
        attackerId: oppAttacker.id,
        attackerName: oppAttacker.name,
        attackName: `Ataque de Oportunidade (${oppAttacker.attackName})`,
        damageType: 'physical',
        baseDamage: oppAttacker.dmg,
        incomingDamage: incomingDmg,
        isCritical,
        isHeavyBlow: false,
        isOpportunityAttack: true,
        poisonChance: oppAttacker.poisonChance,
        poisonDamagePct: oppAttacker.poisonDamagePct,
        poisonRounds: oppAttacker.poisonRounds,
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
        `Você usou Ação de Movimento adjacente a ${oppAttacker.name}! Ataque de Oportunidade (${incomingDmg} dano físico${
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

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > character.equippedWeapon.rangeCells) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para Golpe Simples! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: 1,5m). Use "Ação de Movimento (6m)" para se aproximar.`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - BASIC_ATTACK_EP_COST);
    const wasStealthed = cur.player.stealthTurns > 0;
    const stealthDmgBonus = wasStealthed ? STEALTH_BONUS_DAMAGE : 0;
    const bonusDmg =
      (cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0) + stealthDmgBonus;
    const result = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    if (result.outcome !== 'hit') {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        targetVisualPos,
        result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        result.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        result.outcome === 'evaded' ? 'warning' : 'info',
        result.outcome === 'evaded'
          ? `${target.name} EVADIU do seu Golpe Simples, ignorando todo o dano!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`
          : `Seu Golpe Simples contra ${target.name} errou o alvo!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`,
        result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
        `-${BASIC_ATTACK_EP_COST} EP`
      );
      return;
    }

    const dmg = result.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - dmg);
    const targetDefeated = nextTargetHp <= 0;
    const willWin =
      targetDefeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
      return {
        ...prev,
        isMoveModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerSlashVfx(
      { x: cur.player.x, y: cur.player.y },
      targetVisualPos,
      dmg,
      'player',
      hitKey,
      result.isCritical
        ? `CRÍTICO -${dmg}!`
        : wasStealthed
        ? `FURTIVO -${dmg}!`
        : `-${dmg}`,
      result.isCritical
    );

    const detailParts = [`-${BASIC_ATTACK_EP_COST} EP`];
    if (wasStealthed) detailParts.push(`+${STEALTH_BONUS_DAMAGE} Furtividade`);
    if (result.isCritical) detailParts.push('CRÍTICO +50%');
    if (result.defenseApplied > 0) detailParts.push(`-${result.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Golpe Simples com ${character.equippedWeapon.name} acertou ${target.name} causando ${dmg} de dano físico!${
        wasStealthed ? ' (Saiu da Furtividade)' : ''
      }`,
      result.isCritical ? 'GOLPE CRÍTICO' : wasStealthed ? 'ATAQUE FURTIVO' : 'GOLPE SIMPLES',
      detailParts.join(' · ')
    );

    if (willWin) {
      appendLog('victory', `VITÓRIA! Você derrotou ${target.name} e venceu o combate!`, 'GLÓRIA');
      const sessionId = sessionIdRef.current;
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
    } else if (targetDefeated) {
      appendLog('player', `${target.name} foi derrotado(a)!`, 'ABATE');
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

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > character.equippedWeapon.rangeCells) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para Golpe Duplo! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: 1,5m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerEp = Math.max(0, cur.player.ep - DOUBLE_STRIKE_EP_COST);
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    const bonusDmg1 = cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const hit1 = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg1),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });

    const dmg1 = hit1.outcome === 'hit' ? hit1.finalDamage : 0;
    const hpAfter1 = Math.max(0, target.hp - dmg1);
    const defeatedOnFirst = hpAfter1 <= 0;
    const allDefeatedOnFirst =
      defeatedOnFirst &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: hpAfter1 });
      return {
        ...prev,
        isMoveModeActive: false,
        isAnimatingMove: !defeatedOnFirst,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerDoubleStrikeHitVfx(
      { x: cur.player.x, y: cur.player.y },
      targetVisualPos,
      1,
      dmg1,
      hit1.outcome,
      hit1.isCritical,
      hitKey
    );

    if (hit1.outcome === 'hit') {
      const det1 = [`-${DOUBLE_STRIKE_EP_COST} EP`];
      if (hit1.isCritical) det1.push('CRÍTICO +50%');
      if (hit1.defenseApplied > 0) det1.push(`-${hit1.defenseApplied} Def. Fís.`);
      appendLog(
        'player',
        `Golpe Duplo (1º ataque): acertou ${target.name} causando ${dmg1} de dano físico!`,
        hit1.isCritical ? 'GOLPE DUPLO · CRÍTICO' : 'GOLPE DUPLO',
        det1.join(' · ')
      );
    } else {
      appendLog(
        hit1.outcome === 'evaded' ? 'warning' : 'info',
        hit1.outcome === 'evaded'
          ? `Golpe Duplo (1º ataque): ${target.name} evadiu do primeiro corte!`
          : `Golpe Duplo (1º ataque): o primeiro corte errou o alvo!`,
        'GOLPE DUPLO',
        `-${DOUBLE_STRIKE_EP_COST} EP`
      );
    }

    if (defeatedOnFirst) {
      if (allDefeatedOnFirst) {
        appendLog(
          'victory',
          `VITÓRIA! Você derrotou ${target.name} logo no primeiro corte do Golpe Duplo!`,
          'GLÓRIA'
        );
        scheduleTimeout(() => {
          if (sessionIdRef.current === sessionId) {
            gameAudio.playVictoryFanfare();
          }
        }, 280);
      } else {
        appendLog('player', `${target.name} foi derrotado(a) no 1º corte do Golpe Duplo!`, 'ABATE');
      }
      return;
    }

    await new Promise<void>((resolve) => scheduleTimeout(resolve, 250));
    if (sessionIdRef.current !== sessionId) return;

    const latest = combatRef.current;
    if (!latest || !latest.isActive) return;

    const latestTargetHp = target.isPrimary
      ? latest.enemy.hp
      : latest.minions.find((m) => m.instanceId === target.id)?.hp ?? 0;
    if (latestTargetHp <= 0) {
      updateCombat((prev) => ({ ...prev, isAnimatingMove: false }));
      return;
    }

    const bonusDmg2 = latest.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const hit2 = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg2),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });

    const dmg2 = hit2.outcome === 'hit' ? hit2.finalDamage : 0;
    const hpAfter2 = Math.max(0, latestTargetHp - dmg2);
    const defeatedOnSecond = hpAfter2 <= 0;
    const allDefeatedOnSecond =
      defeatedOnSecond &&
      (target.isPrimary
        ? latest.minions.every((m) => m.hp <= 0)
        : latest.enemy.hp <= 0 &&
          latest.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: hpAfter2 });
      return {
        ...prev,
        isAnimatingMove: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerDoubleStrikeHitVfx(
      { x: latest.player.x, y: latest.player.y },
      targetVisualPos,
      2,
      dmg2,
      hit2.outcome,
      hit2.isCritical,
      hitKey
    );

    if (hit2.outcome === 'hit') {
      const det2: string[] = [];
      if (hit2.isCritical) det2.push('CRÍTICO +50%');
      if (hit2.defenseApplied > 0) det2.push(`-${hit2.defenseApplied} Def. Fís.`);
      appendLog(
        'player',
        `Golpe Duplo (2º ataque): segundo corte causou ${dmg2} de dano físico em ${target.name}! (Total: ${dmg1 + dmg2} de dano)`,
        hit2.isCritical ? 'GOLPE DUPLO · CRÍTICO' : 'GOLPE DUPLO',
        det2.length > 0 ? det2.join(' · ') : undefined
      );
    } else {
      appendLog(
        hit2.outcome === 'evaded' ? 'warning' : 'info',
        hit2.outcome === 'evaded'
          ? `Golpe Duplo (2º ataque): ${target.name} evadiu do segundo corte! (Total: ${dmg1} de dano)`
          : `Golpe Duplo (2º ataque): o segundo corte errou o alvo! (Total: ${dmg1} de dano)`,
        'GOLPE DUPLO'
      );
    }

    if (allDefeatedOnSecond) {
      appendLog(
        'victory',
        `VITÓRIA! Você finalizou ${target.name} com o Golpe Duplo!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
    } else if (defeatedOnSecond) {
      appendLog('player', `${target.name} foi derrotado(a) com o Golpe Duplo!`, 'ABATE');
    }
  };

  // Warrior Standard Action 3: Carrasco (40 EP, basic attack +5 dmg, or +7 if enemy <= 50% HP)
  const handleExecutionerStrike = () => {
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

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    if (!character.equippedWeapon) {
      appendLog('warning', 'Você está desarmado! Empunhe uma arma na ficha para usar Carrasco.');
      return;
    }

    if (cur.player.ep < EXECUTIONER_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Carrasco! Necessário ${EXECUTIONER_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > character.equippedWeapon.rangeCells) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para Carrasco! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: 1,5m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerEp = Math.max(0, cur.player.ep - EXECUTIONER_EP_COST);
    const isEnemyLowHp = target.hp <= target.maxHp * EXECUTIONER_LOW_HP_THRESHOLD;
    const executeBonus = isEnemyLowHp
      ? EXECUTIONER_LOW_HP_BONUS_DAMAGE
      : EXECUTIONER_BASE_BONUS_DAMAGE;
    const passiveBonus =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    const result = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, passiveBonus + executeBonus),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
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
        targetVisualPos,
        result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        result.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        result.outcome === 'evaded' ? 'warning' : 'info',
        result.outcome === 'evaded'
          ? `${target.name} evadiu do seu golpe Carrasco e ignorou completamente o dano!`
          : `Seu golpe Carrasco errou ${target.name}!`,
        result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
        `-${EXECUTIONER_EP_COST} EP`
      );
      return;
    }

    const dmg = result.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - dmg);
    const targetDefeated = nextTargetHp <= 0;
    const willWin =
      targetDefeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
      return {
        ...prev,
        isMoveModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerExecutionerVfx(
      { x: cur.player.x, y: cur.player.y },
      targetVisualPos,
      dmg,
      result.isCritical,
      isEnemyLowHp,
      hitKey
    );

    const details = [
      `-${EXECUTIONER_EP_COST} EP`,
      isEnemyLowHp
        ? `+${EXECUTIONER_LOW_HP_BONUS_DAMAGE} Carrasco (≤50% HP)`
        : `+${EXECUTIONER_BASE_BONUS_DAMAGE} Carrasco`,
    ];
    if (result.isCritical) details.push('CRÍTICO +50%');
    if (result.defenseApplied > 0) details.push(`-${result.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      isEnemyLowHp
        ? `Carrasco (Execução ≤50% HP)! Você golpeou ${target.name} com fúria implacável causando ${dmg} de dano físico!`
        : `Carrasco! Você desferiu um golpe poderoso contra ${target.name} causando ${dmg} de dano físico!`,
      result.isCritical ? 'CARRASCO · CRÍTICO' : 'CARRASCO',
      details.join(' · ')
    );

    if (willWin) {
      appendLog(
        'victory',
        `VITÓRIA! Você executou ${target.name} com Carrasco!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) {
          gameAudio.playVictoryFanfare();
        }
      }, 280);
    } else if (targetDefeated) {
      appendLog('player', `${target.name} foi executado(a) com Carrasco!`, 'ABATE');
    }
  };

  // Knight Standard Action 3: Provocar (35 EP +3 Def. Física e Mágica contra o provocado)
  const handleTaunt = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !isKnight ||
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

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const tauntEpCost = KNIGHT_TAUNT_EP_COST;
    const tauntName = 'Provocar';
    const tauntDefBonus = KNIGHT_TAUNT_DEFENSE_BONUS;

    if (cur.player.ep < tauntEpCost) {
      appendLog(
        'warning',
        `Energia insuficiente para ${tauntName}! Necessário ${tauntEpCost} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > TAUNT_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para ${tauntName}! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: 6,0m a partir do seu token). Use "Ação de Movimento (6m)" para se aproximar.`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - tauntEpCost);
    const enemyEvaded = rollEvasionOnly(target.evasionChance);
    const targetVisualPos = getEnemyVisualPos(target);

    if (enemyEvaded) {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        isGallantChargeModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(targetVisualPos, 'EVADIU!', 'evade');
      appendLog(
        'warning',
        `${target.name} evadiu de ${tauntName} e ignorou completamente o efeito!`,
        'EVASÃO',
        `-${tauntEpCost} EP`
      );
      return;
    }

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, {
        tauntedTurns: TAUNT_DURATION_ROUNDS,
        tauntedBy: heroDisplayName,
        tauntedDefenseBonus: tauntDefBonus,
      });
      return {
        ...prev,
        isMoveModeActive: false,
        isGallantChargeModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerTauntVfx(targetVisualPos, TAUNT_DURATION_ROUNDS);
    triggerFloatingStatus(
      { x: cur.player.x, y: cur.player.y },
      `+${tauntDefBonus} DEF. FÍS./MÁG.`,
      'shield'
    );

    appendLog(
      'player',
      `${tauntName} afetou ${target.name}! Ele está OBRIGADO a atacar ${heroDisplayName} por ${TAUNT_DURATION_ROUNDS} rodadas, e você ganha +${tauntDefBonus} de Defesa Física e Mágica contra ele enquanto o efeito durar.`,
      tauntName.toUpperCase(),
      `-${tauntEpCost} EP · +${tauntDefBonus} Def. Fís./Mág. (${TAUNT_DURATION_ROUNDS}R)`
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
      cur.awaitingReaction
    ) {
      return;
    }

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    if (cur.player.ep < BASIC_ATTACK_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Golpe Básico! Necessário ${BASIC_ATTACK_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > 1) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
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
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

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
        targetVisualPos,
        attackResult.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        attackResult.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        attackResult.outcome === 'evaded' ? 'warning' : 'info',
        attackResult.outcome === 'evaded'
          ? `${target.name} evadiu do seu Golpe Básico!`
          : `Seu Golpe Básico errou ${target.name}!`,
        'GOLPE BÁSICO',
        `-${BASIC_ATTACK_EP_COST} EP`
      );
      return;
    }

    const finalDmg = attackResult.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - finalDmg);
    const defeated = nextTargetHp <= 0;
    const willWin =
      defeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
      return {
        ...prev,
        isMoveModeActive: false,
        isFireBreathModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    triggerSlashVfx(
      { x: cur.player.x, y: cur.player.y },
      targetVisualPos,
      finalDmg,
      'player',
      hitKey,
      attackResult.isCritical ? `CRÍTICO -${finalDmg}!` : `-${finalDmg}`,
      attackResult.isCritical
    );

    const details = [`-${BASIC_ATTACK_EP_COST} EP`];
    if (attackResult.isCritical) details.push('CRÍTICO +50%');
    if (attackResult.defenseApplied > 0) details.push(`-${attackResult.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Golpe Básico acertou ${target.name} causando ${finalDmg} de dano físico (Força + Dano Físico)!`,
      attackResult.isCritical ? 'GOLPE BÁSICO · CRÍTICO' : 'GOLPE BÁSICO',
      details.join(' · ')
    );

    if (willWin) {
      appendLog(
        'victory',
        `VITÓRIA! Você derrotou ${target.name} com um Golpe Básico!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
      }, 280);
    } else if (defeated) {
      appendLog('player', `${target.name} foi derrotado(a)!`, 'ABATE');
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
      cur.awaitingReaction
    ) {
      return;
    }

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const mpCost = upgraded ? ARCANE_BOLT_UPGRADED_MP_COST : ARCANE_BOLT_MP_COST;
    const boltCount = upgraded ? 2 : 1;

    if (cur.player.mp < mpCost) {
      appendLog(
        'warning',
        `Mana insuficiente para Seta Arcana${upgraded ? ' Aprimorada' : ''}! Necessário ${mpCost} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > ARCANE_BOLT_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora do alcance de Seta Arcana! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: 9,0m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerMp = Math.max(0, cur.player.mp - mpCost);
    const bonusMagicDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const boltBaseDamage = upgraded
      ? getArcaneBoltUpgradedDamage(character, bonusMagicDmg)
      : getArcaneBoltDamage(character, bonusMagicDmg);
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

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
      if (!latest || !latest.isActive) break;
      const liveHp = target.isPrimary
        ? latest.enemy.hp
        : latest.minions.find((m) => m.instanceId === target.id)?.hp ?? 0;
      if (liveHp <= 0) break;

      const boltResult = resolveCombatAttack({
        damageType: 'magical',
        baseDamage: boltBaseDamage,
        attackerHitChance: playerStats.hitChance,
        attackerCritChance: 0,
        defenderEvasionChance: target.evasionChance,
        defenderPhysicalDefense: target.physicalDefense,
        defenderMagicDefense: target.magicDefense,
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
        targetVisualPos,
        floatingLabel,
        isHit,
        boltCurveSign,
        hitKey
      );

      await new Promise<void>((resolve) => scheduleTimeout(resolve, 300));
      if (sessionIdRef.current !== sessionId) return;

      if (isHit) {
        totalDamageDealt += boltDmg;
        const nextTargetHp = Math.max(0, liveHp - boltDmg);
        const defeated = nextTargetHp <= 0;
        const allDefeated =
          defeated &&
          (target.isPrimary
            ? latest.minions.every((m) => m.hp <= 0)
            : latest.enemy.hp <= 0 &&
              latest.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

        updateCombat((prev) => {
          const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
          return {
            ...prev,
            isActive: !updated.allDefeated,
            outcome: updated.allDefeated ? 'victory' : 'ongoing',
            enemy: updated.enemy,
            minions: updated.minions,
            selectedTargetId: updated.selectedTargetId,
          };
        });

        const details: string[] = [];
        if (i === 0) details.push(`-${mpCost} MP`);
        if (upgraded && i === 0) details.push('50% dano/seta');
        if (boltResult.defenseApplied > 0) {
          details.push(`-${boltResult.defenseApplied} Def. Mág.`);
        }

        appendLog(
          'player',
          `Seta Arcana${boltCount === 2 ? ` (${i + 1}ª seta)` : ''} perfurou ${target.name} com mana pura causando ${boltDmg} de dano mágico!${
            i === 1 ? ` (Total: ${totalDamageDealt} de dano)` : ''
          }`,
          upgraded ? 'SETA ARCANA ×2' : 'SETA ARCANA',
          details.length > 0 ? details.join(' · ') : undefined
        );

        if (defeated) {
          updateCombat((prev) => ({ ...prev, isAnimatingMove: false }));
          if (allDefeated) {
            appendLog(
              'victory',
              `VITÓRIA! Você abateu ${target.name} com Seta Arcana!`,
              'GLÓRIA'
            );
            scheduleTimeout(() => {
              if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
            }, 280);
          } else {
            appendLog('player', `${target.name} foi abatido(a) com Seta Arcana!`, 'ABATE');
          }
          return;
        }
      } else {
        gameAudio.playEvadeWhoosh();
        appendLog(
          boltResult.outcome === 'evaded' ? 'warning' : 'info',
          boltResult.outcome === 'evaded'
            ? `${target.name} evadiu da Seta Arcana${boltTag}!`
            : `A Seta Arcana${boltTag} errou ${target.name}!`,
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

  // Mage Spell 2: Armadura Arcana (5 MP, self-only, +5 Physical Defense for 2 rounds)
  const handleArcaneArmor = () => {
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

    if (cur.player.mp < ARCANE_ARMOR_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Armadura Arcana! Necessário ${ARCANE_ARMOR_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const nextPlayerMp = Math.max(0, cur.player.mp - ARCANE_ARMOR_MP_COST);
    const wasAlreadyActive = cur.player.arcaneArmorTurns > 0;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      player: {
        ...prev.player,
        mp: nextPlayerMp,
        hasActed: true,
        arcaneArmorTurns: ARCANE_ARMOR_DURATION_ROUNDS,
      },
    }));

    triggerArcaneArmorVfx({ x: cur.player.x, y: cur.player.y });

    appendLog(
      'player',
      wasAlreadyActive
        ? `Armadura Arcana renovada! +${ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} de Defesa Física por mais ${ARCANE_ARMOR_DURATION_ROUNDS} rodadas.`
        : `Armadura Arcana conjurada! Você ganhou +${ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} de Defesa Física por ${ARCANE_ARMOR_DURATION_ROUNDS} rodadas.`,
      'ARMADURA ARCANA',
      `-${ARCANE_ARMOR_MP_COST} MP · ${ARCANE_ARMOR_DURATION_ROUNDS}R`
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

  // Priest Basic Attack: Raio Divino (30 EP, 9.0m, magical divine energy beam from the Grimoire)
  const handlePriestBasicAttack = () => {
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

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    if (cur.player.ep < PRIEST_BASIC_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Raio Divino! Necessário ${PRIEST_BASIC_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > PRIEST_BASIC_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para Raio Divino! Você está a ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (alcance: ${PRIEST_BASIC_RANGE_METERS.toFixed(1).replace('.', ',')}m).`
      );
      return;
    }

    const sessionId = sessionIdRef.current;
    const nextPlayerEp = Math.max(0, cur.player.ep - PRIEST_BASIC_EP_COST);
    const bonusMagicDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const baseDamage = rollPriestBasicAttackDamage(character, bonusMagicDmg);
    const attackResult = resolveCombatAttack({
      damageType: 'magical',
      baseDamage,
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: 0,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    const startX = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const startY = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const enemyCenter = getEnemyCenterPx({ x: target.x, y: target.y }, target.sizeCells);
    const endX = enemyCenter.x;
    const endY = enemyCenter.y;
    const didHit = attackResult.outcome === 'hit';

    gameAudio.playDivineLaser();
    spellVfxRef.current?.playDivineBeam({
      startX,
      startY,
      endX,
      endY,
      didHit,
    });

    if (!didHit) {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        isConsecrationModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
      }));
      triggerFloatingStatus(
        targetVisualPos,
        attackResult.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        attackResult.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        attackResult.outcome === 'evaded' ? 'warning' : 'info',
        attackResult.outcome === 'evaded'
          ? `${target.name} evadiu do seu feixe de Raio Divino!`
          : `Seu feixe de Raio Divino passou raspando por ${target.name}!`,
        'RAIO DIVINO',
        `-${PRIEST_BASIC_EP_COST} EP`
      );
      return;
    }

    const finalDmg = attackResult.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - finalDmg);
    const defeated = nextTargetHp <= 0;
    const willWin =
      defeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
      return {
        ...prev,
        isMoveModeActive: false,
        isConsecrationModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    setHitTarget(hitKey);
    scheduleTimeout(() => setHitTarget((t) => (t === hitKey ? null : t)), 360);
    triggerFloatingStatus(targetVisualPos, `-${finalDmg} DIVINO`, 'limit');

    const details = [`-${PRIEST_BASIC_EP_COST} EP`];
    if (attackResult.defenseApplied > 0) details.push(`-${attackResult.defenseApplied} Def. Mág.`);

    const weaponLabel = character.equippedWeapon?.name ?? 'Grimório Sagrado';
    appendLog(
      'player',
      `Raio Divino disparado pelo ${weaponLabel} atingiu ${target.name} causando ${finalDmg} de dano mágico!`,
      'RAIO DIVINO',
      details.join(' · ')
    );

    if (willWin) {
      appendLog(
        'victory',
        `VITÓRIA! Você purificou ${target.name} com o Raio Divino!`,
        'GLÓRIA'
      );
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
      }, 280);
    } else if (defeated) {
      appendLog('player', `${target.name} foi purificado(a) com o Raio Divino!`, 'ABATE');
    }
  };

  // Priest Spell 1: Luz Restauradora (4 MP base = +10 HP; +2 MP = +5 HP; +3 MP = Regeneração +3 HP/turno por 2 rodadas)
  const handleCastRestoringLight = () => {
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

    const totalMpCost =
      RESTORING_LIGHT_MP_COST +
      (restoringLightBoostHeal ? RESTORING_LIGHT_HEAL_UPGRADE_MP : 0) +
      (restoringLightAddRegen ? RESTORING_LIGHT_REGEN_UPGRADE_MP : 0);
    const baseHealPower =
      RESTORING_LIGHT_BASE_HEAL +
      (restoringLightBoostHeal ? RESTORING_LIGHT_HEAL_UPGRADE_BONUS : 0);
    const totalHealPower = getScaledHealAmount(baseHealPower, character);
    const scaledRegenHeal = getScaledHealAmount(RESTORING_LIGHT_REGEN_HEAL_PER_TURN, character);

    if (cur.player.mp < totalMpCost) {
      appendLog(
        'warning',
        `Mana insuficiente para Luz Restauradora! Necessário ${totalMpCost} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const nextPlayerMp = Math.max(0, cur.player.mp - totalMpCost);
    const nextHp = Math.min(cur.player.maxHp, cur.player.hp + totalHealPower);
    const actualHeal = nextHp - cur.player.hp;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isConsecrationModeActive: false,
      player: {
        ...prev.player,
        hp: nextHp,
        mp: nextPlayerMp,
        hasActed: true,
        regenerationTurns: restoringLightAddRegen
          ? RESTORING_LIGHT_REGEN_ROUNDS
          : prev.player.regenerationTurns,
        regenerationHealPerTurn: restoringLightAddRegen
          ? scaledRegenHeal
          : prev.player.regenerationHealPerTurn,
      },
    }));

    const px = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const py = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    gameAudio.playHolyHeal();
    spellVfxRef.current?.playHolyHeal({
      x: px,
      y: py,
      enhanced: restoringLightBoostHeal || restoringLightAddRegen,
    });

    const floatParts: string[] = [actualHeal > 0 ? `+${actualHeal} HP` : 'VIDA CHEIA'];
    if (restoringLightAddRegen) floatParts.push(`REGEN ${RESTORING_LIGHT_REGEN_ROUNDS}R`);
    triggerFloatingStatus({ x: cur.player.x, y: cur.player.y }, floatParts.join(' · '), 'heal');

    const detailParts = [`-${totalMpCost} MP`, `Cura ${totalHealPower} HP`];
    if (playerStats.healingBonus > 0) detailParts.push(`+${playerStats.healingBonus} Sab.`);
    if (restoringLightBoostHeal) detailParts.push('+5 Cura');
    if (restoringLightAddRegen) {
      detailParts.push(
        `Regeneração +${scaledRegenHeal} HP/turno (${RESTORING_LIGHT_REGEN_ROUNDS}R)`
      );
    }

    appendLog(
      'player',
      `Luz Restauradora banhou ${heroDisplayName}, restaurando +${actualHeal} de Vida${
        actualHeal < totalHealPower ? ` (máximo ${cur.player.maxHp} HP)` : ''
      }${
        restoringLightAddRegen
          ? ` e concedendo Regeneração (+${scaledRegenHeal} HP no início do turno por ${RESTORING_LIGHT_REGEN_ROUNDS} rodadas)`
          : ''
      }!`,
      'LUZ RESTAURADORA',
      detailParts.join(' · ')
    );
  };

  // Priest Spell 2: Toggle Consagração interactive 6.0m range / 4.0m radius targeting
  const handleToggleConsecrationMode = () => {
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

    if (cur.player.mp < CONSECRATION_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Consagração! Necessário ${CONSECRATION_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isFireBreathModeActive: false,
      isGallantChargeModeActive: false,
      isConsecrationModeActive: !prev.isConsecrationModeActive,
    }));
  };

  const executeConsecration = (centerCell: GridPos) => {
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      !cur.isConsecrationModeActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasActed ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    const castDist = getDistance(cur.player.x, cur.player.y, centerCell.x, centerCell.y);
    if (castDist > CONSECRATION_CAST_RANGE_CELLS) {
      appendLog(
        'warning',
        `Ponto fora do alcance de Consagração (máximo ${CONSECRATION_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m a partir de você).`
      );
      return;
    }

    if (cur.player.mp < CONSECRATION_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Consagração! Necessário ${CONSECRATION_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      updateCombat((prev) => ({ ...prev, isConsecrationModeActive: false }));
      return;
    }

    const areaCells = getConsecrationAreaCells(centerCell);
    const playerInArea = areaCells.some((c) => c.x === cur.player.x && c.y === cur.player.y);
    const nextPlayerMp = Math.max(0, cur.player.mp - CONSECRATION_MP_COST);
    const scaledConsecrationHeal = getScaledHealAmount(CONSECRATION_HEAL, character);
    const nextHp = playerInArea
      ? Math.min(cur.player.maxHp, cur.player.hp + scaledConsecrationHeal)
      : cur.player.hp;
    const actualHeal = nextHp - cur.player.hp;

    setHoveredCellKey(null);
    updateCombat((prev) => ({
      ...prev,
      isConsecrationModeActive: false,
      isMoveModeActive: false,
      player: {
        ...prev.player,
        hp: nextHp,
        mp: nextPlayerMp,
        hasActed: true,
      },
    }));

    const centerX = centerCell.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const centerY = centerCell.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const radiusPx = (CONSECRATION_RADIUS_METERS / CELL_METERS) * CELL_PIXEL_SIZE;
    gameAudio.playHolyHeal();
    spellVfxRef.current?.playConsecration({
      x: centerX,
      y: centerY,
      radiusPx,
    });

    if (playerInArea) {
      triggerFloatingStatus(
        { x: cur.player.x, y: cur.player.y },
        actualHeal > 0 ? `+${actualHeal} HP · CONSAGRAÇÃO` : 'CONSAGRAÇÃO (VIDA CHEIA)',
        'heal'
      );
      const consecrationDetail = [
        `-${CONSECRATION_MP_COST} MP`,
        `Cura ${scaledConsecrationHeal} HP`,
      ];
      if (playerStats.healingBonus > 0) {
        consecrationDetail.push(`+${playerStats.healingBonus} Sab.`);
      }
      appendLog(
        'player',
        `Consagração iluminou um raio de ${CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m, curando +${actualHeal} de Vida em ${heroDisplayName}${
          actualHeal < scaledConsecrationHeal ? ` (máximo ${cur.player.maxHp} HP)` : ''
        }!`,
        'CONSAGRAÇÃO',
        consecrationDetail.join(' · ')
      );
    } else {
      triggerFloatingStatus(centerCell, 'CONSAGRAÇÃO 4,0m', 'heal');
      appendLog(
        'player',
        `Você consagrou uma área de ${CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m de raio (nenhum aliado dentro do círculo de cura).`,
        'CONSAGRAÇÃO',
        `-${CONSECRATION_MP_COST} MP`
      );
    }
  };

  // Priest Spell 3: Proteção Sagrada (5 MP, 15 points of temporary shield lasting 1 round)
  const handleCastSacredProtection = () => {
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

    if (cur.player.mp < SACRED_PROTECTION_MP_COST) {
      appendLog(
        'warning',
        `Mana insuficiente para Proteção Sagrada! Necessário ${SACRED_PROTECTION_MP_COST} MP (atual: ${cur.player.mp} MP).`
      );
      return;
    }

    const nextPlayerMp = Math.max(0, cur.player.mp - SACRED_PROTECTION_MP_COST);

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      isConsecrationModeActive: false,
      player: {
        ...prev.player,
        mp: nextPlayerMp,
        hasActed: true,
        sacredShieldHp: SACRED_PROTECTION_SHIELD_HP,
        sacredShieldTurns: SACRED_PROTECTION_DURATION_ROUNDS,
      },
    }));

    const px = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const py = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    gameAudio.playSacredShield();
    spellVfxRef.current?.playSacredShield({ x: px, y: py });
    triggerFloatingStatus(
      { x: cur.player.x, y: cur.player.y },
      `+${SACRED_PROTECTION_SHIELD_HP} ESCUDO SAGRADO`,
      'limit'
    );

    appendLog(
      'player',
      `Proteção Sagrada envolve ${heroDisplayName} com um escudo divino de ${SACRED_PROTECTION_SHIELD_HP} pontos de sobrevida durante ${SACRED_PROTECTION_DURATION_ROUNDS} rodada!`,
      'PROTEÇÃO SAGRADA',
      `-${SACRED_PROTECTION_MP_COST} MP · ${SACRED_PROTECTION_SHIELD_HP} Escudo (1R)`
    );
  };

  // Rogue Skill 1: Arremesso de Adaga (20 EP, 6.0m ranged physical attack + 3 flat Bleed dmg/round for 3 rounds, Bleed cannot crit)
  const handleDaggerThrow = () => {
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
      appendLog(
        'warning',
        'Você está desarmado! Empunhe suas adagas na ficha para usar Arremesso de Adaga.'
      );
      return;
    }

    if (cur.player.ep < DAGGER_THROW_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Arremesso de Adaga! Necessário ${DAGGER_THROW_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const dist = getDistanceToEnemy(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.sizeCells
    );
    if (dist > DAGGER_THROW_RANGE_CELLS) {
      appendLog(
        'warning',
        `Alvo (${target.name}) fora de alcance para Arremesso de Adaga! Distância atual: ${getDistanceMetersToEnemy(
          { x: cur.player.x, y: cur.player.y },
          { x: target.x, y: target.y },
          target.sizeCells
        )}m (máximo ${DAGGER_THROW_RANGE_METERS.toFixed(1).replace('.', ',')}m).`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - DAGGER_THROW_EP_COST);
    const wasStealthed = cur.player.stealthTurns > 0;
    const bonusDmg =
      (cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0) +
      DAGGER_THROW_BONUS_DAMAGE;
    const result = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: playerStats.critChance,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    const pCx = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const pCy = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const enemyPx = getEnemyCenterPx({ x: target.x, y: target.y }, target.sizeCells);
    gameAudio.playDaggerThrow();
    spellVfxRef.current?.playDaggerThrow({
      startX: pCx,
      startY: pCy,
      endX: enemyPx.x,
      endY: enemyPx.y,
      didHit: result.outcome === 'hit',
    });

    if (result.outcome !== 'hit') {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
      }));
      scheduleTimeout(() => {
        triggerFloatingStatus(
          targetVisualPos,
          result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
          result.outcome === 'evaded' ? 'evade' : 'miss'
        );
      }, 180);
      appendLog(
        result.outcome === 'evaded' ? 'warning' : 'info',
        result.outcome === 'evaded'
          ? `${target.name} EVADIU do seu Arremesso de Adaga, evitando o dano e o sangramento!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`
          : `Seu Arremesso de Adaga contra ${target.name} errou o alvo!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`,
        result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
        `-${DAGGER_THROW_EP_COST} EP`
      );
      return;
    }

    const dmg = result.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - dmg);
    const targetDefeated = nextTargetHp <= 0;
    const willWin =
      targetDefeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, {
        hp: nextTargetHp,
        bleedTurns: targetDefeated ? 0 : DAGGER_THROW_BLEED_ROUNDS,
        bleedDamagePerTurn: targetDefeated ? 0 : DAGGER_THROW_BLEED_DAMAGE,
      });
      return {
        ...prev,
        isMoveModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    const sessionId = sessionIdRef.current;
    scheduleTimeout(() => {
      if (sessionIdRef.current !== sessionId) return;
      if (result.isCritical) {
        gameAudio.playCritImpact();
        triggerViewportShake();
      }
      setHitTarget(hitKey);
      scheduleTimeout(() => setHitTarget((t) => (t === hitKey ? null : t)), 360);
      triggerFloatingStatus(
        targetVisualPos,
        result.isCritical
          ? `CRÍTICO -${dmg}! · SANGRAMENTO`
          : `-${dmg} · SANGRAMENTO ${DAGGER_THROW_BLEED_ROUNDS}R`,
        result.isCritical ? 'crit' : 'bleed'
      );
    }, 180);

    const detailParts = [
      `-${DAGGER_THROW_EP_COST} EP`,
      `+${DAGGER_THROW_BONUS_DAMAGE} Dano Fís.`,
      `Sangramento ${DAGGER_THROW_BLEED_DAMAGE}/rodada (${DAGGER_THROW_BLEED_ROUNDS}R)`,
    ];
    if (result.isCritical) detailParts.push('CRÍTICO +50%');
    if (result.defenseApplied > 0) detailParts.push(`-${result.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Arremesso de Adaga cravou em ${target.name} causando ${dmg} de dano físico (+${DAGGER_THROW_BONUS_DAMAGE}) e infligindo Sangramento (${DAGGER_THROW_BLEED_DAMAGE} de dano/rodada por ${DAGGER_THROW_BLEED_ROUNDS} rodadas, sem crítico)!${
        wasStealthed ? ' (Saiu da Furtividade)' : ''
      }`,
      result.isCritical ? 'ARREMESSO CRÍTICO' : 'ARREMESSO DE ADAGA',
      detailParts.join(' · ')
    );

    if (willWin) {
      appendLog('victory', `VITÓRIA! Você derrotou ${target.name} com um Arremesso de Adaga!`, 'GLÓRIA');
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
      }, 320);
    } else if (targetDefeated) {
      appendLog('player', `${target.name} foi abatido(a) pelo Arremesso de Adaga!`, 'ABATE');
    }
  };

  // Rogue Skill 2: Furtividade (20 EP, 2 rounds invisibility, +5 basic attack dmg, +5 extra dmg taken, half movement)
  const handleCastStealth = () => {
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

    if (cur.player.ep < STEALTH_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Furtividade! Necessário ${STEALTH_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - STEALTH_EP_COST);
    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: false,
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        hasActed: true,
        stealthTurns: STEALTH_DURATION_ROUNDS,
      },
    }));

    const px = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const py = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    gameAudio.playStealthVanish();
    spellVfxRef.current?.playStealthSmoke({ x: px, y: py });
    triggerFloatingStatus(
      { x: cur.player.x, y: cur.player.y },
      `INVISÍVEL (${STEALTH_DURATION_ROUNDS}R)`,
      'stealth'
    );

    appendLog(
      'player',
      `${heroDisplayName} desapareceu nas sombras com Furtividade por ${STEALTH_DURATION_ROUNDS} rodadas! Inimigos têm ${STEALTH_DETECTION_CHANCE}% de chance de perceber sua presença. Próximo ataque básico +${STEALTH_BONUS_DAMAGE} dano físico, mas sofre +${STEALTH_EXTRA_DAMAGE_TAKEN} dano extra enquanto invisível.`,
      'FURTIVIDADE',
      `-${STEALTH_EP_COST} EP · ${STEALTH_DURATION_ROUNDS} rodadas · ${STEALTH_DETECTION_CHANCE}% Percepção`
    );
  };

  // Rogue Skill 3: Disparada (15 EP, doubles movement to 12.0m; does NOT consume Ação Padrão)
  const handleCastSprint = () => {
    setIsStandardActionOpen(false);
    const cur = combatRef.current;
    if (
      !cur ||
      !cur.isActive ||
      cur.currentTurn !== 'player' ||
      cur.player.hasMoved ||
      cur.player.sprintActiveThisTurn ||
      cur.player.stunnedTurns > 0 ||
      cur.isAnimatingMove ||
      cur.awaitingReaction
    ) {
      return;
    }

    if (cur.player.ep < SPRINT_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Disparada! Necessário ${SPRINT_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - SPRINT_EP_COST);
    const newMeters = MAX_MOVE_METERS * 2;

    updateCombat((prev) => ({
      ...prev,
      isMoveModeActive: true,
      player: {
        ...prev.player,
        ep: nextPlayerEp,
        sprintActiveThisTurn: true,
      },
    }));

    const px = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const py = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    gameAudio.playSprintDash();
    spellVfxRef.current?.playSprintBurst({ x: px, y: py });
    triggerFloatingStatus(
      { x: cur.player.x, y: cur.player.y },
      `DISPARADA · ${newMeters.toFixed(1).replace('.', ',')}m`,
      'stealth'
    );

    appendLog(
      'player',
      `Disparada ativada! Seu deslocamento dobrou para ${newMeters.toFixed(1).replace('.', ',')}m neste turno.`,
      'DISPARADA',
      `-${SPRINT_EP_COST} EP`
    );
  };

  // Rogue Skill 4: Letalidade (35 EP, ONLY usable behind enemy's back, 50% crit chance, +25% crit dmg if invisible)
  const handleCastLethality = () => {
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
      appendLog(
        'warning',
        'Você está desarmado! Empunhe suas adagas na ficha para usar Letalidade.'
      );
      return;
    }

    if (cur.player.ep < LETHALITY_EP_COST) {
      appendLog(
        'warning',
        `Energia insuficiente para Letalidade! Necessário ${LETHALITY_EP_COST} EP (atual: ${cur.player.ep} EP).`
      );
      return;
    }

    const target = getActiveTarget(cur);
    if (target.hp <= 0) return;

    const behindEnemy = isBehindFacing(
      { x: cur.player.x, y: cur.player.y },
      { x: target.x, y: target.y },
      target.facing,
      target.sizeCells
    );
    if (!behindEnemy) {
      appendLog(
        'warning',
        `Letalidade só pode ser usada nas costas de ${target.name}! Posicione-se em uma das casas atrás da direção para onde o inimigo está olhando.`
      );
      return;
    }

    const nextPlayerEp = Math.max(0, cur.player.ep - LETHALITY_EP_COST);
    const wasStealthed = cur.player.stealthTurns > 0;
    const dexDmgBonus = character.attributes.dexterity;
    const bonusDmg =
      (cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0) + dexDmgBonus;
    const effectiveCritChance = Math.max(playerStats.critChance, LETHALITY_CRIT_CHANCE);
    const effectiveCritDmgPct = wasStealthed
      ? CRIT_DAMAGE_BONUS_PCT + LETHALITY_STEALTH_CRIT_DMG_BONUS
      : CRIT_DAMAGE_BONUS_PCT;
    const targetVisualPos = getEnemyVisualPos(target);
    const hitKey = target.isPrimary ? 'enemy' : target.id;

    const result = resolveCombatAttack({
      damageType: 'physical',
      baseDamage: rollPlayerWeaponDamage(character, bonusDmg),
      attackerHitChance: playerStats.hitChance,
      attackerCritChance: effectiveCritChance,
      critDamageBonusPctOverride: effectiveCritDmgPct,
      defenderEvasionChance: target.evasionChance,
      defenderPhysicalDefense: target.physicalDefense,
      defenderMagicDefense: target.magicDefense,
    });

    if (result.outcome !== 'hit') {
      updateCombat((prev) => ({
        ...prev,
        isMoveModeActive: false,
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
      }));
      gameAudio.playEvadeWhoosh();
      triggerFloatingStatus(
        targetVisualPos,
        result.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
        result.outcome === 'evaded' ? 'evade' : 'miss'
      );
      appendLog(
        result.outcome === 'evaded' ? 'warning' : 'info',
        result.outcome === 'evaded'
          ? `${target.name} EVADIU do seu golpe de Letalidade pelas costas!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`
          : `Sua Letalidade contra ${target.name} errou o alvo!${
              wasStealthed ? ' Você saiu da invisibilidade.' : ''
            }`,
        result.outcome === 'evaded' ? 'EVASÃO' : 'ERROU',
        `-${LETHALITY_EP_COST} EP`
      );
      return;
    }

    const dmg = result.finalDamage;
    const nextTargetHp = Math.max(0, target.hp - dmg);
    const targetDefeated = nextTargetHp <= 0;
    const willWin =
      targetDefeated &&
      (target.isPrimary
        ? cur.minions.every((m) => m.hp <= 0)
        : cur.enemy.hp <= 0 &&
          cur.minions.every((m) => m.instanceId === target.id || m.hp <= 0));

    updateCombat((prev) => {
      const updated = applyTargetStateUpdate(prev, target.id, { hp: nextTargetHp });
      return {
        ...prev,
        isMoveModeActive: false,
        isActive: !updated.allDefeated,
        outcome: updated.allDefeated ? 'victory' : 'ongoing',
        player: {
          ...prev.player,
          ep: nextPlayerEp,
          hasActed: true,
          stealthTurns: 0,
        },
        enemy: updated.enemy,
        minions: updated.minions,
        selectedTargetId: updated.selectedTargetId,
      };
    });

    const pCx = cur.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const pCy = cur.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
    const enemyPx = getEnemyCenterPx({ x: target.x, y: target.y }, target.sizeCells);
    const eCx = enemyPx.x;
    const eCy = enemyPx.y;
    const lungeDx = eCx - pCx;
    const lungeDy = eCy - pCy;
    const lungeLen = Math.hypot(lungeDx, lungeDy) || 1;

    // Aggressive assassin phantom lunge straight through the target's back
    setLungeState({
      who: 'player',
      dx: (lungeDx / lungeLen) * 26,
      dy: (lungeDy / lungeLen) * 26,
      scale: result.isCritical ? 1.3 : 1.22,
    });
    scheduleTimeout(() => setLungeState(null), 220);

    gameAudio.playBackstabCrit(result.isCritical);
    if (result.isCritical) {
      scheduleTimeout(() => gameAudio.playCritImpact(), 75);
    }
    spellVfxRef.current?.playLethalityStrike({
      attackerX: pCx,
      attackerY: pCy,
      targetX: eCx,
      targetY: eCy,
      isCritical: result.isCritical,
      fromStealth: wasStealthed,
      didHit: true,
    });
    setHitTarget(hitKey);
    scheduleTimeout(() => setHitTarget((t) => (t === hitKey ? null : t)), 480);
    triggerViewportShake();
    triggerFloatingStatus(
      targetVisualPos,
      result.isCritical
        ? `LETALIDADE CRÍTICA -${dmg}!`
        : `LETALIDADE -${dmg}`,
      result.isCritical ? 'crit' : 'damage'
    );

    const detailParts = [`-${LETHALITY_EP_COST} EP`, `${effectiveCritChance}% Crít.`];
    if (dexDmgBonus > 0) detailParts.push(`+${dexDmgBonus} Destreza`);
    if (result.isCritical) {
      detailParts.push(
        wasStealthed
          ? `CRÍTICO +${effectiveCritDmgPct}% (+25% Furtividade)`
          : `CRÍTICO +${effectiveCritDmgPct}%`
      );
    }
    if (result.defenseApplied > 0) detailParts.push(`-${result.defenseApplied} Def. Fís.`);

    appendLog(
      'player',
      `Letalidade atingiu as costas de ${target.name} causando ${dmg} de dano físico${
        dexDmgBonus > 0 ? ` (+${dexDmgBonus} Destreza)` : ''
      }${result.isCritical ? ' em um ACERTO CRÍTICO devastador' : ''}!${
        wasStealthed ? ' (Saiu da Furtividade)' : ''
      }`,
      result.isCritical ? 'LETALIDADE CRÍTICA' : 'LETALIDADE',
      detailParts.join(' · ')
    );

    if (willWin) {
      appendLog(
        'victory',
        `VITÓRIA! Você executou ${target.name} pelas costas com Letalidade!`,
        'GLÓRIA'
      );
      const sessionId = sessionIdRef.current;
      scheduleTimeout(() => {
        if (sessionIdRef.current === sessionId) gameAudio.playVictoryFanfare();
      }, 300);
    } else if (targetDefeated) {
      appendLog('player', `${target.name} foi executado(a) pelas costas com Letalidade!`, 'ABATE');
    }
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
      isGallantChargeModeActive: false,
      isConsecrationModeActive: false,
      player: {
        ...prev.player,
        beyondLimitTurns: nextBeyondLimitTurns,
        sprintActiveThisTurn: false,
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
        pushMeters,
        cur.enemy.sizeCells
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
          pendingMinionTurns: [],
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
          if (latest.pendingMinionTurns.length > 0) {
            void executeNextMinionTurnRef.current(sessionId);
          } else {
            startPlayerTurn(sessionId);
          }
        }
      }, 650);
    },
    [appendLog, scheduleTimeout, startPlayerTurn, updateCombat]
  );

  const resolveIncomingAttack = async (attack: PendingAttack, reactionId: string) => {
    const cur = combatRef.current;
    if (!cur || !cur.isActive) return;

    const sessionId = sessionIdRef.current;
    const initialPlayerPos = { x: cur.player.x, y: cur.player.y };
    const attackerId: 'primary' | string = attack.attackerId ?? 'primary';
    const attackingMinion =
      attackerId !== 'primary'
        ? cur.minions.find((m) => m.instanceId === attackerId)
        : undefined;
    const enemyPos = attackingMinion
      ? { x: attackingMinion.x, y: attackingMinion.y }
      : getEnemyVisualPos(cur.enemy);
    const attackerLungeKey: 'enemy' | string = attackingMinion
      ? attackingMinion.instanceId
      : 'enemy';
    const enemyName = attack.attackerName;

    const liveStats = getLivePlayerStats(cur.player, cur.enemy, cur.minions);
    const activeBonusDmg =
      cur.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
    const stealthExtraDmg = cur.player.stealthTurns > 0 ? STEALTH_EXTRA_DAMAGE_TAKEN : 0;

    // Supports physical, magical, and hybrid (e.g. Salto Gosmento: 5 phys + 5 mag) mitigation
    const computeMitigatedDamage = (extraPhysDef = 0) => {
      if (attack.secondaryMagicDamage && attack.secondaryMagicDamage > 0) {
        const physIncoming = attack.incomingDamage + stealthExtraDmg;
        const physDef = liveStats.physicalDefense + extraPhysDef;
        const physDefApplied = Math.min(physDef, physIncoming);
        const physFinal = Math.max(0, physIncoming - physDef);
        const magIncoming = attack.secondaryMagicDamage;
        const magDef = liveStats.magicDefense;
        const magDefApplied = Math.min(magDef, magIncoming);
        const magFinal = Math.max(0, magIncoming - magDef);
        return {
          totalIncoming: physIncoming + magIncoming,
          totalDamage: physFinal + magFinal,
          physDefApplied,
          magDefApplied,
          totalDefApplied: physDefApplied + magDefApplied,
          isHybrid: true,
        };
      }
      const totalIncoming = attack.incomingDamage + stealthExtraDmg;
      const baseDef =
        attack.damageType === 'physical'
          ? liveStats.physicalDefense + extraPhysDef
          : liveStats.magicDefense;
      const defApplied = Math.min(baseDef, totalIncoming);
      return {
        totalIncoming,
        totalDamage: Math.max(0, totalIncoming - baseDef),
        physDefApplied: attack.damageType === 'physical' ? defApplied : 0,
        magDefApplied: attack.damageType === 'magical' ? defApplied : 0,
        totalDefApplied: defApplied,
        isHybrid: false,
      };
    };

    const appendDefenseDetails = (
      details: string[],
      mit: ReturnType<typeof computeMitigatedDamage>
    ) => {
      if (mit.isHybrid) {
        details.push(
          `${attack.incomingDamage} Fís. + ${attack.secondaryMagicDamage} Mág.`
        );
      }
      if (mit.physDefApplied > 0) details.push(`-${mit.physDefApplied} Def. Fís.`);
      if (mit.magDefApplied > 0) details.push(`-${mit.magDefApplied} Def. Mág.`);
    };

    const getImpactTag = (shieldBlockedAll: boolean): string => {
      if (attack.isTankBuster) return 'IMPACTO GOSMENTO';
      if (attack.isLeapSlam) return 'SALTO GOSMENTO';
      if (attack.isOpportunityAttack) return 'ATAQUE DE OPORTUNIDADE';
      if (shieldBlockedAll) return 'ESCUDO SAGRADO';
      if (attack.isCritical) return 'IMPACTO CRÍTICO';
      return 'IMPACTO';
    };

    // Evaluates Sacred Shield absorption and racial survival/threshold passives after defense-mitigated damage
    const computePostDamageState = (damageTaken: number) => {
      const totalPostDefenseDamage = Math.max(0, damageTaken);
      const currentShield = Math.max(0, cur.player.sacredShieldHp);
      const shieldAbsorbed = Math.min(currentShield, totalPostDefenseDamage);
      const nextSacredShieldHp = currentShield - shieldAbsorbed;
      const nextSacredShieldTurns = nextSacredShieldHp > 0 ? cur.player.sacredShieldTurns : 0;
      const hpDamage = totalPostDefenseDamage - shieldAbsorbed;
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
        nextSacredShieldHp,
        nextSacredShieldTurns,
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
      if (post.shieldAbsorbed > 0 && post.nextSacredShieldHp === 0) {
        appendLog(
          'info',
          `O escudo de Proteção Sagrada absorveu ${post.shieldAbsorbed} de dano e se rompeu.`,
          'PROTEÇÃO SAGRADA'
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

    const maybeApplyPoison = (alive: boolean) => {
      if (!alive || !attack.poisonChance || attack.poisonChance <= 0) return;
      if (Math.random() * 100 < attack.poisonChance) {
        const poisonPct = attack.poisonDamagePct ?? SLIME_MOTHER_POISON_HP_PCT;
        const poisonRounds = attack.poisonRounds ?? SLIME_MOTHER_POISON_ROUNDS;
        const poisonDmg = Math.max(1, Math.round(cur.player.maxHp * poisonPct));
        updateCombat((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            poisonTurns: poisonRounds,
            poisonDamagePerTurn: poisonDmg,
          },
        }));
        gameAudio.playPoisonSizzle();
        triggerFloatingStatus(
          initialPlayerPos,
          `ENVENENADO (${poisonRounds}R)!`,
          'poison'
        );
        appendLog(
          'warning',
          `Veneno aplicado (${attack.poisonChance}% de chance)! Você sofrerá ${poisonDmg} de dano (1% da Vida máxima) por rodada durante ${poisonRounds} rodadas.`,
          'VENENO',
          `-${poisonDmg} HP/rodada · ${poisonRounds}R`
        );
      }
    };

    let playerAlive = true;

    if (reactionId === 'counter_attack') {
      const skill = REACTION_SKILLS.find((s) => s.id === 'counter_attack');
      if (skill && evaluateReactionSkill(skill, cur, character).canUse) {
        // 1. Resolve incoming enemy attack normally first (player pays 15 EP to react)
        const mit = computeMitigatedDamage(0);
        const post = computePostDamageState(mit.totalDamage);
        const nextEp = Math.max(0, cur.player.ep - skill.epCost);
        playerAlive = post.nextHp > 0;

        updateCombat((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            hp: post.nextHp,
            ep: nextEp,
            sacredShieldHp: post.nextSacredShieldHp,
            sacredShieldTurns: post.nextSacredShieldTurns,
            beyondLimitUsed: post.beyondLimitUsed,
            beyondLimitTurns: post.beyondLimitTurns,
            rigidSkinDoubledLogged: post.rigidSkinDoubledLogged,
            greenBloodTriggered: post.greenBloodTriggered,
            greenBloodTurns: post.greenBloodTurns,
          },
        }));

        const impactDetails: string[] = [];
        if (attack.isCritical) impactDetails.push('CRÍTICO +50%');
        if (stealthExtraDmg > 0) impactDetails.push(`+${stealthExtraDmg} Furtividade`);
        appendDefenseDetails(impactDetails, mit);
        if (post.shieldAbsorbed > 0) {
          impactDetails.push(
            `-${post.shieldAbsorbed} Escudo Sagrado (${post.nextSacredShieldHp} rest.)`
          );
        }

        appendLog(
          post.shieldAbsorbed > 0 && post.hpDamage === 0 ? 'reaction' : 'enemy',
          post.shieldAbsorbed > 0 && post.hpDamage === 0
            ? `${enemyName} acerta "${attack.attackName}", mas Proteção Sagrada absorveu todos os ${post.shieldAbsorbed} de dano!`
            : `${enemyName} acerta "${attack.attackName}" causando ${post.hpDamage} de dano — você se prepara para o Contra-Ataque!`,
          getImpactTag(post.shieldAbsorbed > 0 && post.hpDamage === 0),
          impactDetails.length > 0 ? impactDetails.join(' · ') : undefined
        );

        if (attack.isTankBuster || attack.isLeapSlam) {
          gameAudio.playSlimeImpact();
          triggerViewportShake();
        }
        triggerSlashVfx(
          enemyPos,
          initialPlayerPos,
          post.hpDamage,
          attackerLungeKey,
          'player',
          post.hpDamage === 0 && mit.totalDefApplied > 0
            ? 'BLOQUEADO!'
            : attack.isTankBuster
            ? `IMPACTO GOSMENTO -${post.hpDamage}!`
            : attack.isLeapSlam
            ? `SALTO GOSMENTO -${post.hpDamage}`
            : attack.isCritical
            ? `CRÍTICO -${post.hpDamage}!`
            : `-${post.hpDamage}`,
          (attack.isCritical || attack.isTankBuster) && post.hpDamage > 0
        );
        announceTriggeredPassives(post, initialPlayerPos);
        maybeApplyPoison(playerAlive);

        // 2. If warrior survived the hit, unleash a half-damage basic attack against the actual attacker!
        let attackerDefeatedByCounter = false;
        const attackerAliveNow = attackingMinion ? attackingMinion.hp > 0 : cur.enemy.hp > 0;
        if (playerAlive && attackerAliveNow) {
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 280));
          if (sessionIdRef.current !== sessionId) return;

          const latestForCounter = combatRef.current;
          const liveTarget =
            latestForCounter && latestForCounter.isActive
              ? attackerId === 'primary'
                ? latestForCounter.enemy.hp > 0
                  ? {
                      id: 'primary' as const,
                      name: latestForCounter.enemy.name,
                      hp: latestForCounter.enemy.hp,
                      evasionChance: latestForCounter.enemy.evasionChance,
                      physicalDefense: latestForCounter.enemy.physicalDefense,
                      magicDefense: latestForCounter.enemy.magicDefense,
                      visualPos: getEnemyVisualPos(latestForCounter.enemy),
                      hitKey: 'enemy' as const,
                    }
                  : null
                : (() => {
                    const lm = latestForCounter.minions.find(
                      (m) => m.instanceId === attackerId && m.hp > 0
                    );
                    return lm
                      ? {
                          id: lm.instanceId,
                          name: lm.name,
                          hp: lm.hp,
                          evasionChance: lm.evasionChance,
                          physicalDefense: lm.physicalDefense,
                          magicDefense: lm.magicDefense,
                          visualPos: { x: lm.x, y: lm.y },
                          hitKey: lm.instanceId,
                        }
                      : null;
                  })()
              : null;

          if (latestForCounter && liveTarget) {
            const counterPassiveBonus =
              post.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : activeBonusDmg;
            const counterResult = resolveCombatAttack({
              damageType: 'physical',
              baseDamage: rollPlayerWeaponDamage(character, counterPassiveBonus),
              attackerHitChance: playerStats.hitChance,
              attackerCritChance: playerStats.critChance,
              defenderEvasionChance: liveTarget.evasionChance,
              defenderPhysicalDefense: liveTarget.physicalDefense,
              defenderMagicDefense: liveTarget.magicDefense,
            });

            triggerCounterClashVfx(liveTarget.visualPos, initialPlayerPos);

            if (counterResult.outcome === 'hit') {
              const fullDmg = counterResult.finalDamage;
              const counterDmg = fullDmg > 0 ? Math.max(1, Math.floor(fullDmg / 2)) : 0;
              const nextTargetHp = Math.max(0, liveTarget.hp - counterDmg);
              attackerDefeatedByCounter = nextTargetHp <= 0;
              const allDefeatedByCounter =
                attackerDefeatedByCounter &&
                (liveTarget.id === 'primary'
                  ? latestForCounter.minions.every((m) => m.hp <= 0)
                  : latestForCounter.enemy.hp <= 0 &&
                    latestForCounter.minions.every(
                      (m) => m.instanceId === liveTarget.id || m.hp <= 0
                    ));

              updateCombat((prev) => {
                const updated = applyTargetStateUpdate(prev, liveTarget.id, {
                  hp: nextTargetHp,
                });
                return {
                  ...prev,
                  isActive: !updated.allDefeated,
                  outcome: updated.allDefeated ? 'victory' : 'ongoing',
                  enemy: updated.enemy,
                  minions: updated.minions,
                  selectedTargetId: updated.selectedTargetId,
                };
              });

              triggerSlashVfx(
                initialPlayerPos,
                liveTarget.visualPos,
                counterDmg,
                'player',
                liveTarget.hitKey,
                counterResult.isCritical
                  ? `CRÍTICO -${counterDmg} CONTRA-ATAQUE!`
                  : `-${counterDmg} CONTRA-ATAQUE`,
                counterResult.isCritical && counterDmg > 0
              );

              const counterDetails = [
                `-${COUNTER_ATTACK_EP_COST} EP`,
                `50% dano (${fullDmg} → ${counterDmg})`,
              ];
              if (counterResult.isCritical) counterDetails.push('CRÍTICO +50%');
              if (counterResult.defenseApplied > 0) {
                counterDetails.push(`-${counterResult.defenseApplied} Def. Fís.`);
              }

              appendLog(
                'reaction',
                `Contra-Ataque! Você revidou imediatamente com um ataque básico causando ${counterDmg} de dano físico (metade do dano) a ${liveTarget.name}!`,
                counterResult.isCritical ? 'CONTRA-ATAQUE · CRÍTICO' : 'CONTRA-ATAQUE',
                counterDetails.join(' · ')
              );

              if (allDefeatedByCounter) {
                appendLog(
                  'victory',
                  `VITÓRIA! Você abateu ${liveTarget.name} com seu Contra-Ataque!`,
                  'GLÓRIA'
                );
                scheduleTimeout(() => {
                  if (sessionIdRef.current === sessionId) {
                    gameAudio.playVictoryFanfare();
                  }
                }, 280);
                return;
              } else if (attackerDefeatedByCounter) {
                appendLog(
                  'player',
                  `${liveTarget.name} foi abatido(a) pelo seu Contra-Ataque!`,
                  'ABATE'
                );
              }
            } else {
              gameAudio.playEvadeWhoosh();
              triggerFloatingStatus(
                liveTarget.visualPos,
                counterResult.outcome === 'evaded' ? 'EVADIU!' : 'ERROU!',
                counterResult.outcome === 'evaded' ? 'evade' : 'miss'
              );
              appendLog(
                counterResult.outcome === 'evaded' ? 'warning' : 'info',
                counterResult.outcome === 'evaded'
                  ? `Contra-Ataque: ${liveTarget.name} evadiu do seu revide!`
                  : `Contra-Ataque: seu revide errou ${liveTarget.name}!`,
                'CONTRA-ATAQUE',
                `-${COUNTER_ATTACK_EP_COST} EP`
              );
            }
          }
        }

        // 3. Apply Heavy Blow knockback/stun if enemy is still alive and player survived
        if (attack.isHeavyBlow && playerAlive && !attackerDefeatedByCounter) {
          await new Promise<void>((resolve) => scheduleTimeout(resolve, 320));
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
    } else if (reactionId === 'raise_guard') {
      const skill = REACTION_SKILLS.find((s) => s.id === 'raise_guard');
      if (skill && evaluateReactionSkill(skill, cur, character).canUse) {
        const mit = computeMitigatedDamage(RAISE_GUARD_PHYSICAL_DEFENSE_BONUS);
        const post = computePostDamageState(mit.totalDamage);
        const nextEp = Math.max(0, cur.player.ep - skill.epCost);
        playerAlive = post.nextHp > 0;

        updateCombat((prev) => ({
          ...prev,
          player: {
            ...prev.player,
            hp: post.nextHp,
            ep: nextEp,
            sacredShieldHp: post.nextSacredShieldHp,
            sacredShieldTurns: post.nextSacredShieldTurns,
            beyondLimitUsed: post.beyondLimitUsed,
            beyondLimitTurns: post.beyondLimitTurns,
            rigidSkinDoubledLogged: post.rigidSkinDoubledLogged,
            greenBloodTriggered: post.greenBloodTriggered,
            greenBloodTurns: post.greenBloodTurns,
          },
        }));

        const guardDetails: string[] = [
          `-${skill.epCost} EP`,
          `+${RAISE_GUARD_PHYSICAL_DEFENSE_BONUS} Def. Fís.`,
        ];
        if (stealthExtraDmg > 0) guardDetails.push(`+${stealthExtraDmg} Furtividade`);
        appendDefenseDetails(guardDetails, mit);
        if (post.shieldAbsorbed > 0) {
          guardDetails.push(`-${post.shieldAbsorbed} Escudo Sagrado`);
        }

        if (post.hpDamage === 0) {
          appendLog(
            'reaction',
            `Levantar Guarda bloqueou completamente "${attack.attackName}" (${mit.totalIncoming} dano)!`,
            'LEVANTAR GUARDA',
            guardDetails.join(' · ')
          );
        } else {
          appendLog(
            'reaction',
            `Levantar Guarda concedeu +${RAISE_GUARD_PHYSICAL_DEFENSE_BONUS} de Defesa Física contra "${attack.attackName}" (${mit.totalIncoming} dano). Você sofreu ${post.hpDamage} de dano.`,
            'LEVANTAR GUARDA',
            guardDetails.join(' · ')
          );
        }

        if (attack.isTankBuster || attack.isLeapSlam) {
          gameAudio.playSlimeImpact();
          triggerViewportShake();
        }
        gameAudio.playParryClang();
        const playerCx = initialPlayerPos.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
        const playerCy = initialPlayerPos.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2;
        spellVfxRef.current?.playRaiseGuard({ x: playerCx, y: playerCy });
        triggerFloatingStatus(
          initialPlayerPos,
          post.hpDamage === 0
            ? 'GUARDA! BLOQUEADO!'
            : attack.isTankBuster
            ? `MITIGADO · -${post.hpDamage} HP`
            : `GUARDA +${RAISE_GUARD_PHYSICAL_DEFENSE_BONUS} DEF · -${post.hpDamage} HP`,
          'parry'
        );
        if (post.hpDamage > 0) {
          setHitTarget('player');
          scheduleTimeout(() => setHitTarget((t) => (t === 'player' ? null : t)), 420);
        }
        announceTriggeredPassives(post, initialPlayerPos);
        maybeApplyPoison(playerAlive);

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

    // Default: "none" (take damage reduced by Physical/Magic Defense, then absorbed by Proteção Sagrada)
    const mit = computeMitigatedDamage(0);
    const post = computePostDamageState(mit.totalDamage);
    playerAlive = post.nextHp > 0;

    updateCombat((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        hp: post.nextHp,
        sacredShieldHp: post.nextSacredShieldHp,
        sacredShieldTurns: post.nextSacredShieldTurns,
        beyondLimitUsed: post.beyondLimitUsed,
        beyondLimitTurns: post.beyondLimitTurns,
        rigidSkinDoubledLogged: post.rigidSkinDoubledLogged,
        greenBloodTriggered: post.greenBloodTriggered,
        greenBloodTurns: post.greenBloodTurns,
      },
    }));

    const impactDetails: string[] = [];
    if (attack.isCritical) impactDetails.push('CRÍTICO +50%');
    if (stealthExtraDmg > 0) impactDetails.push(`+${stealthExtraDmg} Furtividade`);
    appendDefenseDetails(impactDetails, mit);
    if (post.shieldAbsorbed > 0) {
      impactDetails.push(
        `-${post.shieldAbsorbed} Escudo Sagrado (${post.nextSacredShieldHp} rest.)`
      );
    }

    appendLog(
      post.shieldAbsorbed > 0 && post.hpDamage === 0 ? 'reaction' : 'enemy',
      post.shieldAbsorbed > 0 && post.hpDamage === 0
        ? `${enemyName} acerta "${attack.attackName}", mas Proteção Sagrada absorveu todos os ${post.shieldAbsorbed} de dano (0 dano na Vida)!`
        : post.shieldAbsorbed > 0
        ? `${enemyName} acerta "${attack.attackName}": Proteção Sagrada absorveu ${post.shieldAbsorbed} de dano e você sofreu ${post.hpDamage} de dano na Vida!`
        : `${enemyName} acerta "${attack.attackName}" causando ${post.hpDamage} de dano a você!`,
      getImpactTag(post.shieldAbsorbed > 0 && post.hpDamage === 0),
      impactDetails.length > 0 ? impactDetails.join(' · ') : undefined
    );

    if (attack.isTankBuster) {
      gameAudio.playSlimeImpact();
      triggerViewportShake();
      triggerHeavyBlowVfx(enemyPos, initialPlayerPos, post.hpDamage, false);
      triggerFloatingStatus(
        initialPlayerPos,
        post.hpDamage === 0 ? 'BLOQUEADO!' : `IMPACTO GOSMENTO -${post.hpDamage}!`,
        post.hpDamage > 0 ? 'crit' : 'shield'
      );
      announceTriggeredPassives(post, initialPlayerPos);
      maybeApplyPoison(playerAlive);
    } else if (attack.isLeapSlam) {
      gameAudio.playSlimeImpact();
      triggerViewportShake();
      setHitTarget('player');
      scheduleTimeout(() => setHitTarget((t) => (t === 'player' ? null : t)), 420);
      triggerFloatingStatus(
        initialPlayerPos,
        post.hpDamage === 0
          ? 'SALTO BLOQUEADO!'
          : `SALTO GOSMENTO -${post.hpDamage}`,
        post.hpDamage > 0 ? 'poison' : 'shield'
      );
      announceTriggeredPassives(post, initialPlayerPos);
      maybeApplyPoison(playerAlive);
    } else if (attack.isHeavyBlow) {
      triggerHeavyBlowVfx(enemyPos, initialPlayerPos, post.hpDamage, post.hpDamage > 0);
      if (post.shieldAbsorbed > 0 && post.hpDamage === 0) {
        triggerFloatingStatus(
          initialPlayerPos,
          `ESCUDO ABSORVEU -${post.shieldAbsorbed}!`,
          'limit'
        );
      }
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
        attackerLungeKey,
        'player',
        post.shieldAbsorbed > 0 && post.hpDamage === 0
          ? `ESCUDO -${post.shieldAbsorbed}!`
          : post.shieldAbsorbed > 0
          ? `ESCUDO -${post.shieldAbsorbed} · -${post.hpDamage} HP`
          : post.hpDamage === 0 && mit.totalDefApplied > 0
          ? 'BLOQUEADO!'
          : attack.isOpportunityAttack
          ? `-${post.hpDamage} OPORTUNIDADE`
          : attack.isCritical
          ? `CRÍTICO -${post.hpDamage}!`
          : `-${post.hpDamage}`,
        attack.isCritical && post.hpDamage > 0
      );
      announceTriggeredPassives(post, initialPlayerPos);
      maybeApplyPoison(playerAlive);
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

  const activeTarget = getActiveTarget(combat);
  const livingMinions = combat.minions.filter((m) => m.hp > 0);
  const hoveredMinion =
    hoveredToken && hoveredToken !== 'player' && hoveredToken !== 'enemy'
      ? combat.minions.find((m) => m.instanceId === hoveredToken && m.hp > 0) ?? null
      : null;

  const distCells = getDistanceToEnemy(
    { x: combat.player.x, y: combat.player.y },
    { x: activeTarget.x, y: activeTarget.y },
    activeTarget.sizeCells
  );
  const distMeters = getDistanceMetersToEnemy(
    { x: combat.player.x, y: combat.player.y },
    { x: activeTarget.x, y: activeTarget.y },
    activeTarget.sizeCells
  );
  const primaryDistMeters = getDistanceMetersToEnemy(
    { x: combat.player.x, y: combat.player.y },
    { x: combat.enemy.x, y: combat.enemy.y },
    combat.enemy.sizeCells
  );

  const playerHpPct = Math.max(0, (combat.player.hp / combat.player.maxHp) * 100);
  const playerMpPct = Math.max(0, (combat.player.mp / combat.player.maxMp) * 100);
  const playerEpPct = Math.max(0, (combat.player.ep / combat.player.maxEp) * 100);
  const enemyHpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100);
  const enemyMpPct =
    combat.enemy.maxMp > 0 ? Math.max(0, (combat.enemy.mp / combat.enemy.maxMp) * 100) : 0;
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
      avatar: combat.enemy.portraitUrl,
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
      : combat.enemy.isBoss
      ? `Turno da Slime Mãe · Rodada ${combat.round}`
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
  const hoveredChargeData = hoveredChargeResolved?.chargeData ?? null;
  const primaryAdjacentForOpp =
    combat.enemy.hp > 0 &&
    combat.enemy.stunnedTurns <= 0 &&
    !combat.enemy.tankBusterCharging &&
    getDistanceToEnemy(
      { x: combat.player.x, y: combat.player.y },
      { x: combat.enemy.x, y: combat.enemy.y },
      combat.enemy.sizeCells
    ) <= 1;
  const minionAdjacentForOpp = livingMinions.some(
    (m) =>
      m.stunnedTurns <= 0 &&
      getDistanceToEnemy({ x: combat.player.x, y: combat.player.y }, { x: m.x, y: m.y }, 1) <= 1
  );
  const enemyAdjacentForOpportunity = primaryAdjacentForOpp || minionAdjacentForOpp;
  const enemyWillBeHitByCharge =
    combat.isGallantChargeModeActive &&
    combat.enemy.hp > 0 &&
    !!hoveredChargeData?.hitsEnemy;
  const enemyInsideHoveredFireCone =
    combat.isFireBreathModeActive &&
    ((combat.enemy.hp > 0 &&
      getEnemyOccupiedCells(
        { x: combat.enemy.x, y: combat.enemy.y },
        combat.enemy.sizeCells
      ).some((c) => hoveredFireConeSet.has(`${c.x},${c.y}`))) ||
      livingMinions.some((m) => hoveredFireConeSet.has(`${m.x},${m.y}`)));
  const playerInsideHoveredConsecration =
    combat.isConsecrationModeActive &&
    hoveredConsecrationAreaSet.has(`${combat.player.x},${combat.player.y}`);

  const consecrationScaledHeal = getScaledHealAmount(CONSECRATION_HEAL, character);

  const moveHintText = !combat.isActive
    ? combat.outcome === 'victory'
      ? 'Combate encerrado — Vitória do campeão'
      : 'Combate encerrado — Você foi derrotado'
    : combat.awaitingReaction
    ? 'Ataque inimigo iminente — escolha sua reação'
    : combat.currentTurn === 'enemy'
    ? `Aguardando ação inimiga...`
    : isStunned
    ? 'Atordoado — encerrando turno automaticamente...'
    : combat.isConsecrationModeActive
    ? hoveredCellKey && consecrationRangeSet.has(hoveredCellKey)
      ? playerInsideHoveredConsecration
        ? `Consagração (raio 4,0m): você está no círculo! Clique para curar +${consecrationScaledHeal} HP (-${CONSECRATION_MP_COST} MP)`
        : `Consagração (raio 4,0m): clique para consagrar este ponto (você está fora da área · -${CONSECRATION_MP_COST} MP)`
      : `Escolha o centro de Consagração a até ${CONSECRATION_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m (cura +${consecrationScaledHeal} HP em raio de ${CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m · -${CONSECRATION_MP_COST} MP)`
    : combat.isGallantChargeModeActive
    ? hoveredChargeData
      ? hoveredChargeData.hitsEnemy
        ? `Investida Galante: ${hoveredChargeData.distanceMeters.toFixed(1).replace('.', ',')}m — ATINGE ${combat.enemy.name} com +${GALLANT_CHARGE_BONUS_DAMAGE} Ataque Físico! (-${GALLANT_CHARGE_EP_COST} EP)`
        : `Investida Galante: avançar ${hoveredChargeData.distanceMeters.toFixed(1).replace('.', ',')}m em linha reta (sem inimigo no trajeto · -${GALLANT_CHARGE_EP_COST} EP)`
      : 'Escolha uma casa dourada em linha reta (até 9,0m · atravessa e golpeia inimigos com +5 Ataque Físico)'
    : combat.isFireBreathModeActive
    ? enemyInsideHoveredFireCone
      ? 'Alvo dentro do cone de 6,0m! Clique para lançar Baforada de Fogo (-9 MP)'
      : 'Mire a direção do cone de 6,0m no tabuleiro e clique para lançar Baforada de Fogo'
    : combat.isMoveModeActive
    ? enemyAdjacentForOpportunity
      ? combat.player.stealthTurns > 0
        ? primaryAdjacentForOpp && combat.enemy.trueSight
          ? hoveredCellData
            ? `Visão Verdadeira ativa: Ataque de Oportunidade garantido ao mover ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m!`
            : `${combat.enemy.name} enxerga através da invisibilidade (Ataque de Oportunidade ao mover)!`
          : hoveredCellData
          ? `Furtividade ativa: ${STEALTH_DETECTION_CHANCE}% de chance de Ataque de Oportunidade ao mover ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m`
          : `Furtividade ativa: inimigo adjacente tem ${STEALTH_DETECTION_CHANCE}% de chance de perceber sua movimentação`
        : hoveredCellData
        ? `Atenção: Ataque de Oportunidade ao mover ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m!`
        : 'Inimigo adjacente: mover-se provocará Ataque de Oportunidade!'
      : hoveredCellData
      ? `Destino selecionado: ${hoveredCellData.cost.toFixed(1).replace('.', ',')}m (clique para mover)`
      : `Clique em uma casa azul para se mover (até ${currentMoveLimitMeters.toFixed(1).replace('.', ',')}m${
          isRogue ? ' · casas roxas = costas do alvo' : ''
        })`
    : livingMinions.length > 0
    ? `Alvo: ${activeTarget.name} (${distMeters}m) · Clique em um inimigo para trocar de alvo`
    : combat.player.hasMoved
    ? 'Ação de movimento utilizada nesta rodada'
    : 'Passe o mouse nos tokens para ver recursos e atributos';

  const canOpenStandardAction =
    isPlayerControlsEnabled && !isStunned && !combat.player.hasActed;

  const canSimpleStrike =
    canOpenStandardAction &&
    combat.player.ep >= BASIC_ATTACK_EP_COST &&
    character.equippedWeapon !== null &&
    activeTarget.hp > 0;

  const canDoubleStrike =
    canOpenStandardAction &&
    combat.player.ep >= DOUBLE_STRIKE_EP_COST &&
    character.equippedWeapon !== null &&
    activeTarget.hp > 0;

  const canExecutioner =
    canOpenStandardAction &&
    combat.player.ep >= EXECUTIONER_EP_COST &&
    character.equippedWeapon !== null &&
    activeTarget.hp > 0;

  const canTaunt =
    isKnight &&
    canOpenStandardAction &&
    combat.player.ep >= KNIGHT_TAUNT_EP_COST &&
    activeTarget.hp > 0;

  const canGallantCharge =
    canOpenStandardAction && combat.player.ep >= GALLANT_CHARGE_EP_COST;

  // Rogue action availability
  const isEnemyInDaggerThrowRange = distCells <= DAGGER_THROW_RANGE_CELLS;
  const canDaggerThrow =
    canOpenStandardAction &&
    combat.player.ep >= DAGGER_THROW_EP_COST &&
    character.equippedWeapon !== null &&
    activeTarget.hp > 0;
  const canCastStealth =
    canOpenStandardAction && combat.player.ep >= STEALTH_EP_COST;
  const canCastSprint =
    isPlayerControlsEnabled &&
    !isStunned &&
    !combat.player.hasMoved &&
    !combat.player.sprintActiveThisTurn &&
    combat.player.ep >= SPRINT_EP_COST;
  const canCastLethality =
    canOpenStandardAction &&
    combat.player.ep >= LETHALITY_EP_COST &&
    character.equippedWeapon !== null &&
    activeTarget.hp > 0 &&
    isPlayerBehindEnemy;

  // Warrior, Mage, Knight & Priest action availability & live scaling
  const activeBonusDmg =
    combat.player.beyondLimitTurns > 0 ? HUMAN_BEYOND_LIMIT_BONUS_DAMAGE : 0;
  const isEnemyExecutionerLowHp =
    activeTarget.hp > 0 && activeTarget.hp <= activeTarget.maxHp * EXECUTIONER_LOW_HP_THRESHOLD;
  const executionerActiveBonus = isEnemyExecutionerLowHp
    ? EXECUTIONER_LOW_HP_BONUS_DAMAGE
    : EXECUTIONER_BASE_BONUS_DAMAGE;
  const warriorExecutionerRange = getWeaponDamageRange(
    character,
    activeBonusDmg + executionerActiveBonus
  );
  const warriorExecutionerText =
    warriorExecutionerRange.min === warriorExecutionerRange.max
      ? `${warriorExecutionerRange.min}`
      : `${warriorExecutionerRange.min}–${warriorExecutionerRange.max}`;
  const knightGallantChargeRange = getWeaponDamageRange(
    character,
    activeBonusDmg + GALLANT_CHARGE_BONUS_DAMAGE
  );
  const knightGallantChargeText =
    knightGallantChargeRange.min === knightGallantChargeRange.max
      ? `${knightGallantChargeRange.min}`
      : `${knightGallantChargeRange.min}–${knightGallantChargeRange.max}`;
  const mageBasicRange = getMageBasicAttackRange(character, activeBonusDmg);
  const arcaneBoltDamage = getArcaneBoltDamage(character, activeBonusDmg);
  const arcaneBoltUpgradedDamage = getArcaneBoltUpgradedDamage(character, activeBonusDmg);
  const fireBreathDamage = getFireBreathDamage(character, activeBonusDmg);

  const priestBasicRange = getPriestBasicAttackRange(character, activeBonusDmg);
  const priestBasicText =
    priestBasicRange.min === priestBasicRange.max
      ? `${priestBasicRange.min}`
      : `${priestBasicRange.min}–${priestBasicRange.max}`;
  const isEnemyInPriestBasicRange = distCells <= PRIEST_BASIC_RANGE_CELLS;
  const canPriestBasic =
    canOpenStandardAction &&
    combat.player.ep >= PRIEST_BASIC_EP_COST &&
    activeTarget.hp > 0;
  const restoringLightTotalMp =
    RESTORING_LIGHT_MP_COST +
    (restoringLightBoostHeal ? RESTORING_LIGHT_HEAL_UPGRADE_MP : 0) +
    (restoringLightAddRegen ? RESTORING_LIGHT_REGEN_UPGRADE_MP : 0);
  const restoringLightBaseScaledHeal = getScaledHealAmount(RESTORING_LIGHT_BASE_HEAL, character);
  const restoringLightUpgradedScaledHeal = getScaledHealAmount(
    RESTORING_LIGHT_BASE_HEAL + RESTORING_LIGHT_HEAL_UPGRADE_BONUS,
    character
  );
  const restoringLightRegenScaledHeal = getScaledHealAmount(
    RESTORING_LIGHT_REGEN_HEAL_PER_TURN,
    character
  );
  const restoringLightTotalHeal = restoringLightBoostHeal
    ? restoringLightUpgradedScaledHeal
    : restoringLightBaseScaledHeal;
  const canCastRestoringLight =
    canOpenStandardAction && combat.player.mp >= restoringLightTotalMp;
  const canCastConsecration =
    canOpenStandardAction && combat.player.mp >= CONSECRATION_MP_COST;
  const canCastSacredProtection =
    canOpenStandardAction && combat.player.mp >= SACRED_PROTECTION_MP_COST;

  const canMageBasic =
    canOpenStandardAction &&
    combat.player.ep >= BASIC_ATTACK_EP_COST &&
    activeTarget.hp > 0;
  const isEnemyInMageBasicRange = distCells <= 1;
  const isEnemyInArcaneBoltRange = distCells <= ARCANE_BOLT_RANGE_CELLS;
  const canCastArcaneBolt1 =
    canOpenStandardAction &&
    combat.player.mp >= ARCANE_BOLT_MP_COST &&
    activeTarget.hp > 0;
  const canCastArcaneBolt2 =
    canOpenStandardAction &&
    combat.player.mp >= ARCANE_BOLT_UPGRADED_MP_COST &&
    activeTarget.hp > 0;
  const canCastArcaneArmor =
    canOpenStandardAction && combat.player.mp >= ARCANE_ARMOR_MP_COST;
  const canCastFireBreath =
    canOpenStandardAction && combat.player.mp >= FIRE_BREATH_MP_COST;

  const isEnemyInAttackRange =
    character.equippedWeapon !== null && distCells <= character.equippedWeapon.rangeCells;
  const isEnemyInTauntRange = distCells <= TAUNT_RANGE_CELLS;
  const moveMetersFormatted = currentMoveLimitMeters.toFixed(1).replace('.', ',');
  const enemyFacingLabel =
    combat.enemy.facing === 'right' ? '→ Direita' : '← Esquerda';

  const filteredCombatLog =
    combatLogFilter === 'all'
      ? combatLog
      : combatLogFilter === 'damage'
      ? combatLog.filter(isDamageLogEntry)
      : combatLog.filter((entry) => !isDamageLogEntry(entry));

  const totalDamageToEnemy =
    Math.max(0, combat.enemy.maxHp - combat.enemy.hp) +
    combat.minions.reduce((sum, m) => sum + Math.max(0, m.maxHp - m.hp), 0);
  const totalCritsInLog = combatLog.filter((entry) =>
    /CRÍTIC/i.test(`${entry.tag ?? ''} ${entry.detail ?? ''}`)
  ).length;

  const getTokenHudStyle = (pos: GridPos, sizeCells = 1): React.CSSProperties => {
    const centerX = (pos.x + sizeCells / 2) * CELL_PIXEL_SIZE;
    const showBelow = pos.y <= 2;
    const topPx = showBelow
      ? (pos.y + sizeCells) * CELL_PIXEL_SIZE + 8
      : pos.y * CELL_PIXEL_SIZE - 8;

    let translateX = '-50%';
    if (pos.x <= 1) translateX = '-18%';
    else if (pos.x + sizeCells - 1 >= GRID_COLS - 2) translateX = '-82%';

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
          <div
            className={`border-2 px-8 py-3 rounded-sm shadow-2xl text-center ${
              combat.enemy.isBoss
                ? 'bg-gradient-to-r from-[#0d2818] via-[#2b1a0c] to-[#0d2818] border-[#4ade80]'
                : 'bg-gradient-to-r from-[#3a1210] via-[#2b1a0c] to-[#3a1210] border-[#d9a043]'
            }`}
          >
            <h2
              className={`font-serif text-xl sm:text-2xl font-black tracking-widest ${
                combat.enemy.isBoss ? 'text-[#86efac]' : 'text-[#f3d189]'
              }`}
            >
              {combat.enemy.isBoss ? 'BATALHA DE CHEFE' : 'COMBATE INICIADO'}
            </h2>
            <p className="text-xs font-mono tabular-nums text-[#e3d2b8] mt-0.5">
              Iniciativa: {heroDisplayName} ({combat.player.initiative}) vs {combat.enemy.name} (
              {combat.enemy.initiative})
            </p>
          </div>
        </div>
      )}

      <div className="medieval-panel rounded-md max-w-[1400px] w-full shadow-2xl relative flex flex-col h-[95vh] max-h-[96vh]">
        {/* Top Arena Header & Initiative Tracker */}
        <div className="p-3 sm:p-4 border-b border-[#473421] bg-[#130e0a] shrink-0 space-y-2.5 rounded-t-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-sm border flex items-center justify-center shrink-0 ${
                  combat.enemy.isBoss
                    ? 'bg-[#0f291a] border-[#22c55e] text-[#4ade80]'
                    : 'bg-[#291c0f] border-[#8c6430] text-[#e5b865]'
                }`}
              >
                {combat.enemy.isBoss ? (
                  <Crown className="w-4 h-4" />
                ) : (
                  <Swords className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-base font-bold text-[#e5b865] leading-tight truncate tracking-wide">
                  {combat.enemy.isBoss ? 'Covil da Slime Mãe' : 'Emboscada na Floresta'}
                </h2>
                <p className="text-xs text-[#a6957e]">
                  Grid 16×10 ·{' '}
                  {combat.enemy.isBoss
                    ? 'Chefe Grande (2×2) · Desloc. 9,0m'
                    : 'Ação de Movimento 6,0m'}{' '}
                  · Distância:{' '}
                  <span className="font-mono tabular-nums text-[#e5b865] font-semibold">
                    {distMeters}m
                  </span>
                </p>
              </div>
            </div>

            {/* Encounter Selector + Audio, Camera, Restart & Close Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Encounter Switcher: Goblin vs Boss Slime Mãe */}
              <div
                role="group"
                aria-label="Selecionar encontro"
                className="bg-[#1b140e] border border-[#4a3622] rounded-sm p-1 flex items-center gap-1 text-xs"
              >
                <button
                  type="button"
                  onClick={() => startNewCombat('goblin')}
                  title="Enfrentar Goblin Espadachim (Inimigo padrão)"
                  className={`h-7 px-2.5 rounded-xs font-serif font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
                    selectedEnemyId === 'goblin'
                      ? 'bg-[#36230e] border-[#c9943b] text-[#f3d189]'
                      : 'bg-[#211912] border-transparent text-[#8a7863] hover:text-[#ede3d2]'
                  }`}
                >
                  <PortraitImage
                    src={GOBLIN_PORTRAIT_URL}
                    alt="Goblin"
                    variant="enemy"
                    className="w-4 h-4 rounded-full object-cover object-top shrink-0"
                  />
                  <span>Goblin</span>
                </button>
                <button
                  type="button"
                  onClick={() => startNewCombat('slime_mother')}
                  title="Enfrentar Boss: Slime Mãe (400 HP · Grande 2×2 · Chefe Abissal)"
                  className={`h-7 px-2.5 rounded-xs font-serif font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
                    selectedEnemyId === 'slime_mother'
                      ? 'bg-[#102e1d] border-[#22c55e] text-[#86efac]'
                      : 'bg-[#211912] border-transparent text-[#8a7863] hover:text-[#bbf7d0]'
                  }`}
                >
                  <PortraitImage
                    src={SLIME_MOTHER_PORTRAIT_URL}
                    alt="Slime Mãe"
                    variant="enemy"
                    className="w-4 h-4 rounded-full object-cover object-top shrink-0"
                  />
                  <Crown className="w-3 h-3 text-[#4ade80] shrink-0" />
                  <span>Boss: Slime Mãe</span>
                </button>
              </div>
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
                onClick={() => setIsCombatLogOpen((v) => !v)}
                title={isCombatLogOpen ? 'Ocultar Log de Combate' : 'Mostrar Log de Combate'}
                className={`h-9 px-3 rounded-sm text-xs font-serif font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
                  isCombatLogOpen
                    ? 'bg-[#30200f] border-[#c9943b] text-[#f3d189]'
                    : 'medieval-btn-iron'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Log</span>
                <span className="font-mono tabular-nums text-[10px] px-1 py-0.2 bg-[#140e0a] border border-[#5c4327] rounded-xs text-[#e5b865]">
                  {combatLog.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => startNewCombat()}
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

          {/* Boss Encounter Status Bar */}
          {combat.enemy.isBoss && (
            <div className="rounded-sm px-3 py-2 border flex flex-wrap items-center justify-between gap-3 transition-colors bg-[#0f1f16] border-[#245938]">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Crown className="w-4 h-4 text-[#4ade80]" />
                  <span className="font-serif text-xs font-bold text-[#bbf7d0] whitespace-nowrap">
                    {combat.enemy.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#132f1e] border border-[#22c55e]/50 text-[#86efac] whitespace-nowrap">
                    Grande 2×2
                  </span>
                </div>

                {/* Boss HP Bar */}
                <div className="flex-1 min-w-[140px] max-w-[320px]">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                    <span className="text-[#86efac] font-bold">
                      HP {combat.enemy.hp}/{combat.enemy.maxHp}
                    </span>
                    <span className="text-[#7dd3fc]">
                      MP {combat.enemy.mp}/{combat.enemy.maxMp}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#08120c] border border-[#1d452c] rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#15803d] via-[#22c55e] to-[#4ade80] transition-all duration-300"
                      style={{ width: `${enemyHpPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#171229] border border-[#8b5cf6]/60 text-[#ddd6fe]">
                  <Eye className="w-3 h-3 text-[#c4b5fd]" />
                  Visão Verdadeira
                </span>

                {combat.enemy.skills.leapSlam && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs border ${
                      combat.enemy.leapSlamCooldown > 0
                        ? 'bg-[#1c1712] border-[#4a3622] text-[#a6957e]'
                        : 'bg-[#122e1c] border-[#4ade80]/60 text-[#bef264] font-semibold'
                    }`}
                  >
                    Salto Gosmento:{' '}
                    {combat.enemy.leapSlamCooldown > 0
                      ? `Recarga ${combat.enemy.leapSlamCooldown}t`
                      : 'Pronto'}
                  </span>
                )}

                {combat.enemy.maxMinions > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs border ${
                      livingMinions.length > 0
                        ? 'bg-[#132f1e] border-[#22c55e]/70 text-[#86efac] font-semibold'
                        : 'bg-[#141c17] border-[#294734] text-[#9ebaa8]'
                    }`}
                  >
                    Slimes Pequenas: {livingMinions.length}/{combat.enemy.maxMinions}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Split Arena Body (Grid + Always-Visible Combat Log Sidebar) */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 p-3 bg-[#15100c] overflow-y-auto lg:overflow-hidden">
          {/* 16x10 Roll20 Tactical Grid Viewport */}
          <div className="flex-1 min-w-0 flex flex-col bg-[#110c09] border border-[#4a3622] rounded-sm p-2.5 sm:p-3 min-h-[390px] lg:min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2 shrink-0">
              <span className="flex items-center gap-1.5 text-[#c7b59e]">
                <Compass className="w-3.5 h-3.5 text-[#d9a043]" />
                <span>Arraste o mapa · Scroll para zoom · Passe o mouse nos tokens</span>
              </span>
              <span
                className={`font-mono tabular-nums ${
                  combat.isConsecrationModeActive
                    ? 'text-[#fde68a] font-semibold'
                    : combat.isGallantChargeModeActive
                    ? 'text-[#fde047] font-semibold'
                    : combat.isFireBreathModeActive
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
              className={`camera-viewport flex-1 w-full min-h-[340px] sm:min-h-[400px] lg:min-h-0 rounded-sm border border-[#4a3622] relative overflow-hidden select-none ${
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
                    const chargeTarget = gallantChargeMap.get(key);
                    const inHoveredPath = hoveredPathSet.has(key);
                    const inChargePath = hoveredChargePathSet.has(key);
                    const inFireCone = hoveredFireConeSet.has(key);
                    const inConsecrationRange = consecrationRangeSet.has(key);
                    const inConsecrationArea = hoveredConsecrationAreaSet.has(key);
                    const isConsecrationCenter =
                      combat.isConsecrationModeActive &&
                      inConsecrationRange &&
                      hoveredCellKey === key;
                    const hasPlayer =
                      combat.player.x === col &&
                      combat.player.y === row &&
                      movingActor?.who !== 'player';
                    const isEnemyFootprint =
                      isEnemyCellAt(
                        col,
                        row,
                        { x: combat.enemy.x, y: combat.enemy.y },
                        combat.enemy.sizeCells
                      ) && movingActor?.who !== 'enemy';
                    const hasSmallEnemy = combat.enemy.sizeCells === 1 && isEnemyFootprint;
                    const hasBossFootprint =
                      combat.enemy.sizeCells > 1 && isEnemyFootprint && combat.enemy.hp > 0;
                    const cellMinion = combat.minions.find(
                      (m) =>
                        m.hp > 0 &&
                        m.x === col &&
                        m.y === row &&
                        movingActor?.minionId !== m.instanceId
                    );
                    const hasAnyEnemyHere = isEnemyFootprint || Boolean(cellMinion);
                    const inSlimeSlamAoe = slimeSlamCells.has(key);

                    return (
                      <div
                        key={key}
                        onClick={() => void handleCellClick(col, row)}
                        onMouseEnter={() => {
                          if (
                            reachable ||
                            chargeTarget ||
                            combat.isFireBreathModeActive ||
                            inConsecrationRange ||
                            (combat.isGallantChargeModeActive && isEnemyFootprint)
                          ) {
                            setHoveredCellKey(key);
                          }
                          if (!isDragging) {
                            if (hasPlayer) setHoveredToken('player');
                            else if (cellMinion) setHoveredToken(cellMinion.instanceId);
                            else if (isEnemyFootprint) setHoveredToken('enemy');
                          }
                        }}
                        onMouseLeave={() => {
                          if (hoveredCellKey === key) setHoveredCellKey(null);
                          if (hasPlayer) {
                            setHoveredToken((cur) => (cur === 'player' ? null : cur));
                          } else if (cellMinion) {
                            setHoveredToken((cur) =>
                              cur === cellMinion.instanceId ? null : cur
                            );
                          } else if (isEnemyFootprint) {
                            setHoveredToken((cur) => (cur === 'enemy' ? null : cur));
                          }
                        }}
                        className={`grid-cell flex items-center justify-center ${
                          obstacle ? 'obstacle' : ''
                        } ${hasBossFootprint ? 'boss-footprint-cell' : ''} ${
                          inSlimeSlamAoe ? 'in-slime-slam-aoe' : ''
                        } ${reachable ? 'in-move-range' : ''} ${
                          isRogue && combat.isMoveModeActive && backstabCellsSet.has(key)
                            ? 'in-backstab-zone'
                            : ''
                        } ${inHoveredPath ? 'in-hover-path' : ''} ${
                          chargeTarget ? 'in-charge-range' : ''
                        } ${inChargePath ? 'in-charge-path' : ''} ${
                          enemyWillBeHitByCharge && isEnemyFootprint ? 'in-charge-target' : ''
                        } ${inFireCone ? 'in-fire-cone' : ''} ${
                          inFireCone && hasAnyEnemyHere ? 'in-fire-cone-target' : ''
                        } ${inConsecrationRange ? 'in-consecration-range' : ''} ${
                          inConsecrationArea ? 'in-consecration-aoe' : ''
                        } ${isConsecrationCenter ? 'in-consecration-center' : ''} ${
                          inConsecrationArea && hasPlayer ? 'in-consecration-ally' : ''
                        } ${
                          (combat.isFireBreathModeActive && !hasPlayer) || inConsecrationRange
                            ? 'cursor-crosshair'
                            : hasPlayer || hasAnyEnemyHere
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

                        {reachable && !hasPlayer && !hasAnyEnemyHere && hoveredCellKey === key && (
                          <span className="font-mono tabular-nums text-[10px] font-bold text-[#fef3c7] bg-[#140e09]/92 border border-[#9e7437]/70 px-1 py-0.5 rounded-xs pointer-events-none">
                            {reachable.cost.toFixed(1).replace('.', ',')}m
                          </span>
                        )}

                        {chargeTarget &&
                          !hasPlayer &&
                          !hasAnyEnemyHere &&
                          hoveredCellKey === key && (
                            <span
                              className={`font-mono tabular-nums text-[10px] font-bold px-1 py-0.5 rounded-xs pointer-events-none ${
                                chargeTarget.hitsEnemy
                                  ? 'text-[#fef08a] bg-[#5c1614]/95 border border-[#fbbf24]'
                                  : 'text-[#fef08a] bg-[#2a1a08]/95 border border-[#f59e0b]'
                              }`}
                            >
                              {chargeTarget.distanceMeters.toFixed(1).replace('.', ',')}m
                              {chargeTarget.hitsEnemy ? ' ⚔' : ''}
                            </span>
                          )}

                        {isConsecrationCenter && !hasPlayer && !hasAnyEnemyHere && (
                          <span className="font-mono tabular-nums text-[9px] font-bold text-[#fef9c3] bg-[#362609]/95 border border-[#fde047] px-1 py-0.5 rounded-xs pointer-events-none whitespace-nowrap">
                            +{consecrationScaledHeal} HP
                          </span>
                        )}

                        {/* Player Token with Active-Turn Golden Glow, Arcane Armor, Sacred Shield, Stealth & Poison */}
                        {hasPlayer && (
                          <div
                            className={`token token-player relative overflow-visible ${
                              isPlayerActiveGlow ? 'token-active-turn' : ''
                            } ${
                              combat.player.stealthTurns > 0 && combat.player.hp > 0
                                ? 'token-stealthed'
                                : ''
                            } ${
                              combat.player.poisonTurns > 0 && combat.player.hp > 0
                                ? 'token-poisoned'
                                : ''
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
                            {combat.player.arcaneArmorTurns > 0 && combat.player.hp > 0 && (
                              <span className="token-arcane-shield-ring" aria-hidden="true" />
                            )}
                            {combat.player.sacredShieldHp > 0 && combat.player.hp > 0 && (
                              <span className="token-sacred-shield-ring" aria-hidden="true" />
                            )}

                            <PortraitImage
                              src={heroPortraitUrl}
                              alt={heroDisplayName}
                              variant="hero"
                              className="w-full h-full object-cover object-top rounded-full relative z-10"
                            />

                            {combat.player.stealthTurns > 0 && combat.player.hp > 0 && (
                              <span className="stealth-tag-label">
                                INVISÍVEL {combat.player.stealthTurns}R
                              </span>
                            )}

                            {combat.player.poisonTurns > 0 && combat.player.hp > 0 && (
                              <span className="poison-tag-label">
                                VENENO {combat.player.poisonTurns}R
                              </span>
                            )}

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

                        {/* Standard 1x1 Enemy Token (Portrait flips horizontally to match facing direction) */}
                        {hasSmallEnemy && (
                          <div
                            className={`token token-enemy relative overflow-visible ${
                              combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0
                                ? 'token-taunted'
                                : ''
                            } ${
                              combat.enemy.bleedTurns > 0 && combat.enemy.hp > 0
                                ? 'token-bleeding'
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
                              src={combat.enemy.portraitUrl}
                              alt={combat.enemy.name}
                              variant="enemy"
                              className={`w-full h-full object-cover object-top rounded-full bg-stone-900 relative z-10 transition-transform duration-200 ${
                                combat.enemy.facing === 'right' ? '-scale-x-100' : 'scale-x-100'
                              }`}
                            />
                            {combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0 && (
                              <span className="taunt-tag-label">
                                PROVOCADO {combat.enemy.tauntedTurns}R
                              </span>
                            )}
                            {combat.enemy.bleedTurns > 0 && combat.enemy.hp > 0 && (
                              <span className="bleed-tag-label">
                                SANGRANDO {combat.enemy.bleedTurns}R
                              </span>
                            )}
                          </div>
                        )}

                        {/* Summoned 1x1 Slime Pequena Minion Token */}
                        {cellMinion && (
                          <div
                            className={`token token-enemy token-slime-minion relative overflow-visible ${
                              activeTarget.id === cellMinion.instanceId &&
                              (combat.enemy.hp > 0 || livingMinions.length > 1)
                                ? 'token-target-selected'
                                : ''
                            } ${cellMinion.tauntedTurns > 0 ? 'token-taunted' : ''} ${
                              cellMinion.bleedTurns > 0 ? 'token-bleeding' : ''
                            } ${hitTarget === cellMinion.instanceId ? 'token-hit-anim' : ''}`}
                            style={
                              lungeState?.who === cellMinion.instanceId
                                ? {
                                    transform: `translate(${lungeState.dx}px, ${lungeState.dy}px) scale(${lungeState.scale})`,
                                  }
                                : undefined
                            }
                          >
                            <PortraitImage
                              src={cellMinion.portraitUrl}
                              alt={cellMinion.name}
                              variant="enemy"
                              className={`w-full h-full object-cover object-center rounded-full bg-[#0d1f14] relative z-10 transition-transform duration-200 ${
                                cellMinion.facing === 'right' ? '-scale-x-100' : 'scale-x-100'
                              }`}
                            />
                            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20 px-1 py-0 rounded-xs bg-[#09180f]/95 border border-[#4ade80]/70 font-mono text-[8px] font-bold text-[#bef264] whitespace-nowrap pointer-events-none">
                              {cellMinion.hp}/{cellMinion.maxHp}
                            </span>
                            {cellMinion.tauntedTurns > 0 && (
                              <span className="taunt-tag-label">
                                PROVOCADO {cellMinion.tauntedTurns}R
                              </span>
                            )}
                            {cellMinion.bleedTurns > 0 && (
                              <span className="bleed-tag-label">
                                SANGRANDO {cellMinion.bleedTurns}R
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* LARGE 2×2 BOSS TOKEN OVERLAY (Slime Mãe occupies 4 grid cells) */}
                {combat.enemy.sizeCells > 1 && movingActor?.who !== 'enemy' && (
                  <div
                    className="boss-token-footprint"
                    style={{
                      left: `${combat.enemy.x * CELL_PIXEL_SIZE}px`,
                      top: `${combat.enemy.y * CELL_PIXEL_SIZE}px`,
                      width: `${combat.enemy.sizeCells * CELL_PIXEL_SIZE}px`,
                      height: `${combat.enemy.sizeCells * CELL_PIXEL_SIZE}px`,
                    }}
                  >
                    <div
                      className={`token token-enemy token-boss-large relative overflow-visible ${
                        bossLeaping ? 'token-boss-leaping' : ''
                      } ${
                        activeTarget.isPrimary && livingMinions.length > 0 && combat.enemy.hp > 0
                          ? 'token-target-selected'
                          : ''
                      } ${
                        combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0
                          ? 'token-taunted'
                          : ''
                      } ${
                        combat.enemy.bleedTurns > 0 && combat.enemy.hp > 0
                          ? 'token-bleeding'
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
                        src={combat.enemy.portraitUrl}
                        alt={combat.enemy.name}
                        variant="enemy"
                        className={`w-full h-full object-cover object-center rounded-full bg-stone-900 relative z-10 transition-transform duration-200 ${
                          combat.enemy.facing === 'right' ? '-scale-x-100' : 'scale-x-100'
                        }`}
                      />
                      {combat.enemy.tauntedTurns > 0 && combat.enemy.hp > 0 && (
                        <span className="taunt-tag-label">
                          PROVOCADO {combat.enemy.tauntedTurns}R
                        </span>
                      )}
                      {combat.enemy.bleedTurns > 0 && combat.enemy.hp > 0 && (
                        <span className="bleed-tag-label">
                          SANGRANDO {combat.enemy.bleedTurns}R
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* VISUAL DANGER WARNING INDICATOR OVER TARGET TOKEN HEAD (NO TEXT SPOILERS) */}
                {combat.enemy.tankBusterCharging &&
                  combat.enemy.tankBusterTarget === 'player' &&
                  combat.enemy.hp > 0 &&
                  combat.player.hp > 0 && (
                    <div
                      className="tank-buster-overlay"
                      style={{
                        left: `${
                          movingActor?.who === 'player'
                            ? movingActor.left + 22
                            : combat.player.x * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2
                        }px`,
                        top: `${
                          movingActor?.who === 'player'
                            ? movingActor.top + 22
                            : combat.player.y * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2
                        }px`,
                      }}
                    >
                      <span className="tank-buster-shock" aria-hidden="true" />
                      <span className="tank-buster-ring-outer" aria-hidden="true" />
                      <span className="tank-buster-ring-inner" aria-hidden="true" />
                      <div className="tank-buster-chevrons" aria-hidden="true">
                        <span className="tank-buster-chevron-arrow" />
                        <span className="tank-buster-chevron-arrow tank-buster-chevron-arrow-gold" />
                      </div>
                      <span className="tank-buster-warning-pill">⚠ PERIGO!</span>
                    </div>
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
                          : isPriest
                          ? 'Sacerdote · 9,0m'
                          : isRogue
                          ? character.equippedWeapon
                            ? 'Ladino · 1,5m'
                            : 'Desarmado'
                          : isKnight
                          ? character.equippedWeapon
                            ? 'Cavaleiro · 1,5m'
                            : 'Desarmado'
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

                      {combat.player.sacredShieldHp > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                            <span className="flex items-center gap-1 text-[#fde047] font-semibold">
                              <Shield className="w-3 h-3 fill-[#ca8a04] text-[#fde047]" />
                              Escudo Sagrado
                            </span>
                            <span className="text-[#fef08a] font-semibold">
                              {combat.player.sacredShieldHp}/{SACRED_PROTECTION_SHIELD_HP} (
                              {combat.player.sacredShieldTurns}R)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                            <div
                              className="h-full bg-[#eab308] transition-all duration-200"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (combat.player.sacredShieldHp / SACRED_PROTECTION_SHIELD_HP) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {combat.player.arcaneArmorTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#102536] border border-[#38bdf8]/70 flex items-center justify-between text-[10px] font-mono text-[#bae6fd]">
                          <span className="flex items-center gap-1 font-semibold">
                            <Shield className="w-3 h-3 fill-[#0284c7] text-[#38bdf8]" />
                            Armadura Arcana
                          </span>
                          <span className="font-bold text-[#7dd3fc]">
                            +{ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} Def. Fís. (
                            {combat.player.arcaneArmorTurns}R)
                          </span>
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
                        <span>
                          Acerto:{' '}
                          <strong className="text-[#ede3d2]">{playerStats.hitChance}%</strong>
                        </span>
                        <span>
                          Cura:{' '}
                          <strong className="text-[#6ee7b7]">
                            +{playerStats.healingBonus}
                          </strong>
                        </span>
                      </div>

                      {combat.player.stealthTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#211338] border border-[#a855f7] text-[10px] font-mono text-[#e9d5ff]">
                          Furtividade ({combat.player.stealthTurns}R): +{STEALTH_BONUS_DAMAGE} dano
                          básico · +{STEALTH_EXTRA_DAMAGE_TAKEN} dano sofrido
                        </div>
                      )}

                      {combat.player.sprintActiveThisTurn && (
                        <div className="px-2 py-1 rounded-xs bg-[#172838] border border-[#38bdf8] text-[10px] font-mono text-[#bae6fd]">
                          Disparada ativa: alcance {moveMetersFormatted}m neste turno
                        </div>
                      )}

                      {combat.enemy.hp > 0 &&
                        combat.enemy.tauntedTurns > 0 &&
                        combat.enemy.tauntedDefenseBonus > 0 && (
                          <div className="px-2 py-1 rounded-xs bg-[#2c2210] border border-[#d9a043] text-[10px] font-mono text-[#f3d189]">
                            Provocar: +{combat.enemy.tauntedDefenseBonus} Def. Fís./Mág. (ativo ·{' '}
                            {combat.enemy.tauntedTurns}R)
                          </div>
                        )}

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

                      {combat.player.regenerationTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#142c1a] border border-[#4ade80]/70 text-[10px] font-mono text-[#bbf7d0]">
                          Regeneração: +{combat.player.regenerationHealPerTurn} HP/turno (
                          {combat.player.regenerationTurns}R)
                        </div>
                      )}

                      {combat.player.greenBloodTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#112e1f] border border-[#2e8555] text-[10px] font-mono text-[#86efac]">
                          Sangue Verde: +2% HP máx./turno ({combat.player.greenBloodTurns}R)
                        </div>
                      )}

                      {combat.player.poisonTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#152e10] border border-[#65a30d] text-[10px] font-mono text-[#bef264]">
                          Veneno: -{combat.player.poisonDamagePerTurn} HP/rodada (
                          {combat.player.poisonTurns}R · 1% HP máx.)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* HOVER HUD OVERLAY ABOVE ENEMY TOKEN */}
                {hoveredToken === 'enemy' && movingActor?.who !== 'enemy' && (
                  <div
                    className={`absolute z-[70] pointer-events-none w-64 bg-[#17110c]/96 border rounded-sm p-3 shadow-2xl backdrop-blur-sm ${
                      combat.enemy.isBoss ? 'border-[#22c55e]' : 'border-[#2e8555]'
                    }`}
                    style={getTokenHudStyle(
                      { x: combat.enemy.x, y: combat.enemy.y },
                      combat.enemy.sizeCells
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-[#3a2d20]">
                      <div className="min-w-0">
                        <span className="font-serif text-xs font-bold text-[#7ad9a4] truncate block">
                          {combat.enemy.name}
                        </span>
                        {combat.enemy.isBoss && (
                          <span className="text-[10px] font-mono text-[#a6957e]">
                            Grande 2×2 · Mov. {combat.enemy.moveMeters.toFixed(1).replace('.', ',')}m
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-[#e5b865] shrink-0">
                        {primaryDistMeters}m
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

                      {combat.enemy.maxMp > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                            <span className="flex items-center gap-1 text-[#6bb4dc] font-semibold">
                              <Droplet className="w-3 h-3 fill-[#1d648c] text-[#38bdf8]" />
                              Mana
                            </span>
                            <span className="text-[#b8dcf0] font-semibold">
                              {combat.enemy.mp}/{combat.enemy.maxMp}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                            <div
                              className="h-full bg-[#2476a6] transition-all duration-200"
                              style={{ width: `${enemyMpPct}%` }}
                            />
                          </div>
                        </div>
                      )}

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

                      {combat.enemy.trueSight && (
                        <div className="px-2 py-1 rounded-xs bg-[#171229] border border-[#8b5cf6]/70 text-[10px] font-mono text-[#ddd6fe] flex items-center gap-1.5">
                          <Eye className="w-3 h-3 text-[#c4b5fd] shrink-0" />
                          <span>Visão Verdadeira (enxerga invisibilidade)</span>
                        </div>
                      )}

                      {combat.enemy.tauntedTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3a1210] border border-[#b84035] text-[10px] font-mono text-[#fca5a5]">
                          Provocado por {combat.enemy.tauntedBy || heroDisplayName} (
                          {combat.enemy.tauntedTurns} rodada(s))
                        </div>
                      )}

                      {combat.enemy.bleedTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3d0e14] border border-[#e11d48] text-[10px] font-mono text-[#fecdd3]">
                          Sangramento: -{combat.enemy.bleedDamagePerTurn} HP/rodada (
                          {combat.enemy.bleedTurns}R · sem crítico)
                        </div>
                      )}

                      {combat.enemy.attributes && (
                        <div className="pt-1 border-t border-[#3b2c1e] grid grid-cols-3 gap-1 text-[10px] font-mono tabular-nums text-[#b39d82]">
                          <span>
                            FOR <strong className="text-[#f2dfb9]">{combat.enemy.attributes.strength}</strong>
                          </span>
                          <span>
                            CON <strong className="text-[#f2dfb9]">{combat.enemy.attributes.constitution}</strong>
                          </span>
                          <span>
                            DES <strong className="text-[#f2dfb9]">{combat.enemy.attributes.dexterity}</strong>
                          </span>
                          <span>
                            INT <strong className="text-[#93c5fd]">{combat.enemy.attributes.intelligence}</strong>
                          </span>
                          <span>
                            CAR <strong className="text-[#f2dfb9]">{combat.enemy.attributes.charisma}</strong>
                          </span>
                          <span>
                            SAB <strong className="text-[#a5b4fc]">{combat.enemy.attributes.wisdom}</strong>
                          </span>
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
                        <span>
                          Acerto:{' '}
                          <strong className="text-[#ede3d2]">{combat.enemy.hitChance}%</strong>
                        </span>
                        <span>
                          Olhando:{' '}
                          <strong className="text-[#fbbf24]">{enemyFacingLabel}</strong>
                        </span>
                      </div>

                      {combat.enemy.isBoss ? (
                        <div className="pt-1 border-t border-[#3b2c1e] space-y-1 text-[10px] font-mono text-[#a6957e]">
                          <div className="flex items-center justify-between">
                            <span>{combat.enemy.attackName}</span>
                            <span className="text-[#bef264]">10% Veneno</span>
                          </div>
                          {combat.enemy.skills.leapSlam && (
                            <div className="flex items-center justify-between gap-2">
                              <span>Salto Gosmento</span>
                              <span
                                className={
                                  combat.enemy.leapSlamCooldown > 0
                                    ? 'text-[#a6957e]'
                                    : 'text-[#bef264] font-semibold'
                                }
                              >
                                {combat.enemy.leapSlamCooldown > 0
                                  ? `Recarga ${combat.enemy.leapSlamCooldown}t`
                                  : '5 Fís. + 5 Mág. · 6m'}
                              </span>
                            </div>
                          )}
                          {combat.enemy.summonChance > 0 && (
                            <div className="flex items-center justify-between gap-2">
                              <span>Invocação</span>
                              <span className="text-[#86efac]">
                                {combat.enemy.summonChance}%/turno · Slime Peq.
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
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
                      )}
                    </div>
                  </div>
                )}

                {/* HOVER HUD OVERLAY ABOVE SUMMONED SLIME PEQUENA MINION */}
                {hoveredMinion && movingActor?.minionId !== hoveredMinion.instanceId && (
                  <div
                    className="absolute z-[70] pointer-events-none w-64 bg-[#14110c]/96 border border-[#4ade80] rounded-sm p-3 shadow-2xl backdrop-blur-sm"
                    style={getTokenHudStyle({ x: hoveredMinion.x, y: hoveredMinion.y }, 1)}
                  >
                    <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-[#2c3b28]">
                      <div className="min-w-0">
                        <span className="font-serif text-xs font-bold text-[#86efac] truncate block">
                          {hoveredMinion.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#9ebaa8]">
                          1×1 · Mov. {hoveredMinion.moveMeters.toFixed(1).replace('.', ',')}m ·
                          Clique p/ mirar
                        </span>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-[#e5b865] shrink-0">
                        {getDistanceMetersToEnemy(
                          { x: combat.player.x, y: combat.player.y },
                          { x: hoveredMinion.x, y: hoveredMinion.y },
                          1
                        )}
                        m
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
                            {hoveredMinion.hp}/{hoveredMinion.maxHp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#22c55e] transition-all duration-200"
                            style={{
                              width: `${Math.max(
                                0,
                                (hoveredMinion.hp / hoveredMinion.maxHp) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-0.5">
                          <span className="flex items-center gap-1 text-[#6bb4dc] font-semibold">
                            <Droplet className="w-3 h-3 fill-[#1d648c] text-[#38bdf8]" />
                            Mana
                          </span>
                          <span className="text-[#b8dcf0] font-semibold">
                            {hoveredMinion.mp}/{hoveredMinion.maxMp}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0e0a07] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#2476a6] transition-all duration-200"
                            style={{
                              width: `${
                                hoveredMinion.maxMp > 0
                                  ? Math.max(0, (hoveredMinion.mp / hoveredMinion.maxMp) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {hoveredMinion.tauntedTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3a1210] border border-[#b84035] text-[10px] font-mono text-[#fca5a5]">
                          Provocada ({hoveredMinion.tauntedTurns}R)
                        </div>
                      )}

                      {hoveredMinion.bleedTurns > 0 && (
                        <div className="px-2 py-1 rounded-xs bg-[#3d0e14] border border-[#e11d48] text-[10px] font-mono text-[#fecdd3]">
                          Sangramento: -{hoveredMinion.bleedDamagePerTurn} HP/rodada (
                          {hoveredMinion.bleedTurns}R)
                        </div>
                      )}

                      <div className="pt-1 border-t border-[#2c3b28] grid grid-cols-3 gap-1 text-[10px] font-mono tabular-nums text-[#b39d82]">
                        <span>
                          FOR <strong className="text-[#f2dfb9]">{hoveredMinion.attributes.strength}</strong>
                        </span>
                        <span>
                          CON <strong className="text-[#f2dfb9]">{hoveredMinion.attributes.constitution}</strong>
                        </span>
                        <span>
                          DES <strong className="text-[#f2dfb9]">{hoveredMinion.attributes.dexterity}</strong>
                        </span>
                        <span>
                          INT <strong className="text-[#93c5fd]">{hoveredMinion.attributes.intelligence}</strong>
                        </span>
                        <span>
                          CAR <strong className="text-[#f2dfb9]">{hoveredMinion.attributes.charisma}</strong>
                        </span>
                        <span>
                          SAB <strong className="text-[#a5b4fc]">{hoveredMinion.attributes.wisdom}</strong>
                        </span>
                      </div>

                      <div className="pt-1 border-t border-[#2c3b28] grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono tabular-nums text-[#a6957e]">
                        <span>
                          Def. Fís:{' '}
                          <strong className="text-[#e5b865]">{hoveredMinion.physicalDefense}</strong>
                        </span>
                        <span>
                          Def. Mág:{' '}
                          <strong className="text-[#a5b4fc]">{hoveredMinion.magicDefense}</strong>
                        </span>
                        <span>
                          Crít:{' '}
                          <strong className="text-[#f09a4e]">{hoveredMinion.critChance}%</strong>
                        </span>
                        <span>
                          Evasão:{' '}
                          <strong className="text-[#60c28c]">{hoveredMinion.evasionChance}%</strong>
                        </span>
                      </div>

                      <div className="pt-1 border-t border-[#2c3b28] space-y-1 text-[10px] font-mono text-[#a6957e]">
                        <div className="flex items-center justify-between">
                          <span>{hoveredMinion.attackName}</span>
                          <span className="text-[#bef264]">
                            {hoveredMinion.dmg} Fís. · {hoveredMinion.poisonChance}% Ven.
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{hoveredMinion.spitName}</span>
                          <span
                            className={
                              hoveredMinion.spitCooldown > 0
                                ? 'text-[#a6957e]'
                                : 'text-[#7dd3fc] font-semibold'
                            }
                          >
                            {hoveredMinion.spitCooldown > 0
                              ? `Recarga ${hoveredMinion.spitCooldown}t`
                              : `${hoveredMinion.spitDamage} Mág. · 4,5m`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Animated Moving / Knockback Token Actor */}
                {movingActor && (
                  <div
                    className={`token absolute pointer-events-none z-40 overflow-hidden ${
                      movingActor.who === 'player'
                        ? 'token-player'
                        : movingActor.minionId
                        ? 'token-enemy token-slime-minion'
                        : combat.enemy.sizeCells > 1
                        ? 'token-enemy token-boss-large'
                        : 'token-enemy'
                    }`}
                    style={{
                      left: `${movingActor.left}px`,
                      top: `${movingActor.top}px`,
                      width:
                        movingActor.who === 'enemy' &&
                        !movingActor.minionId &&
                        combat.enemy.sizeCells > 1
                          ? '94px'
                          : undefined,
                      height:
                        movingActor.who === 'enemy' &&
                        !movingActor.minionId &&
                        combat.enemy.sizeCells > 1
                          ? '94px'
                          : undefined,
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
                      src={
                        movingActor.who === 'player'
                          ? heroPortraitUrl
                          : movingActor.portraitUrl ?? combat.enemy.portraitUrl
                      }
                      alt={movingActor.who === 'player' ? heroDisplayName : combat.enemy.name}
                      variant={movingActor.who === 'player' ? 'hero' : 'enemy'}
                      className={`w-full h-full object-cover object-top rounded-full bg-stone-900 ${
                        movingActor.who === 'enemy' &&
                        (movingActor.facing ?? combat.enemy.facing) === 'right'
                          ? '-scale-x-100'
                          : ''
                      }`}
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

                {/* Mage VFX 2: Armadura Arcana Cast Barrier */}
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

                {/* Floating Damage / Crit / Parry / Evade / Taunt / Spell / Bleed / Stealth / Stun Texts */}
                {floatingTexts.map((ft) => {
                  const ftClass =
                    ft.variant === 'arcane'
                      ? 'floating-arcane-text'
                      : ft.variant === 'fire'
                      ? 'floating-fire-text'
                      : ft.variant === 'shield'
                      ? 'floating-shield-text'
                      : ft.variant === 'bleed'
                      ? 'floating-bleed-text'
                      : ft.variant === 'poison'
                      ? 'floating-poison-text'
                      : ft.variant === 'stealth'
                      ? 'floating-stealth-text'
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

                  if (ft.variant === 'crit') {
                    const parsed = parseCritFloatingText(ft.text);
                    return (
                      <div
                        key={ft.id}
                        className="floating-crit-text"
                        style={{
                          left: `${ft.x}px`,
                          top: `${ft.y}px`,
                        }}
                      >
                        <span className="crit-starburst" aria-hidden="true" />
                        {CRIT_SPARK_ANGLES.map((deg) => (
                          <span
                            key={deg}
                            className="crit-spark-ray"
                            aria-hidden="true"
                            style={{ '--crit-angle': `${deg}deg` } as React.CSSProperties}
                          />
                        ))}
                        <span className="crit-badge-tag">{parsed.header}</span>
                        <span className="crit-number-main">{parsed.value}</span>
                        {parsed.suffix && <span className="crit-sub-tag">{parsed.suffix}</span>}
                      </div>
                    );
                  }

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

              {/* FLOATING VIEWPORT ZOOM CONTROLS (Bottom-Right) */}
              <div
                data-viewport-control="true"
                className="absolute bottom-3 right-3 z-30 flex items-center gap-1 bg-[#140f0b]/92 border border-[#5c4327] rounded-sm p-1 shadow-xl backdrop-blur-xs"
              >
                <button
                  type="button"
                  onClick={() => setZoomCentered(camera.zoom - ZOOM_STEP)}
                  disabled={camera.zoom <= MIN_ZOOM + 0.01}
                  title="Diminuir zoom (-)"
                  aria-label="Diminuir zoom do grid"
                  className="w-8 h-8 rounded-xs bg-[#241b13] hover:bg-[#35281c] border border-[#4a3622] text-[#e6d7be] flex items-center justify-center transition-colors disabled:opacity-35 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomCentered(1)}
                  title="Redefinir zoom para 100% (0)"
                  className="px-2 h-8 rounded-xs bg-[#1b140e] hover:bg-[#2c2218] border border-[#4a3622] text-[#e5b865] font-mono tabular-nums text-xs font-bold min-w-[3.25rem] transition-colors cursor-pointer"
                >
                  {Math.round(camera.zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomCentered(camera.zoom + ZOOM_STEP)}
                  disabled={camera.zoom >= MAX_ZOOM - 0.01}
                  title="Aumentar zoom (+)"
                  aria-label="Aumentar zoom do grid"
                  className="w-8 h-8 rounded-xs bg-[#241b13] hover:bg-[#35281c] border border-[#4a3622] text-[#e6d7be] flex items-center justify-center transition-colors disabled:opacity-35 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={centerCamera}
                  title="Centralizar mapa"
                  aria-label="Centralizar mapa"
                  className="w-8 h-8 rounded-xs bg-[#241b13] hover:bg-[#35281c] border border-[#4a3622] text-[#d9a043] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LocateFixed className="w-4 h-4" />
                </button>
              </div>

              {/* PRE-IMPACT REACTION SKILL OVERLAY */}
              {combat.awaitingReaction && combat.pendingAttack && (
                <div
                  data-reaction-overlay="true"
                  className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40 flex items-center justify-center p-3"
                >
                  <div className="reaction-modal-card medieval-panel rounded-md max-w-lg w-full p-5">
                    <div className="flex items-start gap-3 pb-3.5 border-b border-[#473421]">
                      <div className="w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 bg-[#3a1210] border-[#b84035]">
                        <ShieldAlert className="w-5 h-5 text-[#f28b82]" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-[#f28b82]">
                          {combat.pendingAttack.isOpportunityAttack
                            ? 'Ataque de Oportunidade'
                            : 'Ataque Inimigo Iminente'}{' '}
                          ·{' '}
                          {combat.pendingAttack.secondaryMagicDamage &&
                          combat.pendingAttack.secondaryMagicDamage > 0
                            ? `${combat.pendingAttack.incomingDamage} dano físico + ${combat.pendingAttack.secondaryMagicDamage} dano mágico`
                            : combat.pendingAttack.damageType === 'magical'
                            ? `${combat.pendingAttack.incomingDamage} de dano mágico`
                            : `${combat.pendingAttack.incomingDamage} de dano físico`}
                          {combat.pendingAttack.isCritical && (
                            <span className="ml-1.5 text-[#fde047]">· CRÍTICO (+50%)</span>
                          )}
                        </p>
                        <h3 className="font-serif text-base font-bold text-[#f3d189] mt-0.5 leading-snug">
                          {combat.pendingAttack.attackerName} usa &ldquo;
                          {combat.pendingAttack.attackName}&rdquo;. Como você vai reagir?
                        </h3>
                        {playerStats.physicalDefense > 0 &&
                          (combat.pendingAttack.damageType === 'physical' ||
                            (combat.pendingAttack.secondaryMagicDamage ?? 0) > 0) && (
                            <p className="text-xs font-mono text-[#86efac] mt-1">
                              Sua Defesa Física reduzirá -{playerStats.physicalDefense} de dano
                              físico automaticamente
                              {character.raceId === 'dwarf' &&
                              combat.player.hp > 0 &&
                              combat.player.hp / combat.player.maxHp <=
                                DWARF_RIGID_SKIN_LOW_HP_THRESHOLD
                                ? ' (Pele Rígida dobrada!).'
                                : '.'}
                            </p>
                          )}
                        {playerStats.magicDefense > 0 &&
                          (combat.pendingAttack.damageType === 'magical' ||
                            (combat.pendingAttack.secondaryMagicDamage ?? 0) > 0) && (
                            <p className="text-xs font-mono text-[#a5b4fc] mt-1">
                              Sua Defesa Mágica reduzirá -{playerStats.magicDefense} de dano mágico
                              automaticamente.
                            </p>
                          )}
                        {combat.player.sacredShieldHp > 0 && (
                          <p className="text-xs font-mono text-[#fde047] mt-1">
                            Proteção Sagrada ativa: absorverá até {combat.player.sacredShieldHp}{' '}
                            pontos de dano antes da sua Vida.
                          </p>
                        )}
                        {combat.player.stealthTurns > 0 && (
                          <p className="text-xs font-mono text-[#d8b4fe] mt-1">
                            Furtividade ativa: você sofrerá +{STEALTH_EXTRA_DAMAGE_TAKEN} de dano
                            extra enquanto estiver invisível.
                          </p>
                        )}
                        {combat.pendingAttack.poisonChance && combat.pendingAttack.poisonChance > 0 && (
                          <p className="text-xs text-[#bef264] mt-1">
                            Efeito adicional: {combat.pendingAttack.poisonChance}% de chance de
                            infligir Veneno (1% da Vida máxima/rodada por 2 rodadas).
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
                                {skill.id === 'counter_attack' ? (
                                  <Swords className="w-4 h-4 text-[#f09a4e]" />
                                ) : (
                                  <Shield className="w-4 h-4 text-[#6bb4dc]" />
                                )}
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
                        onClick={() => startNewCombat()}
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

          {/* Always-Visible Tactical Combat Log Sidebar */}
          {isCombatLogOpen && (
            <aside
              aria-label="Log de Combate"
              className="w-full lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col bg-[#110c09] border border-[#523b23] rounded-sm overflow-hidden max-h-[260px] lg:max-h-none"
            >
              {/* Log Header & Filter Tabs */}
              <div className="px-3 py-2.5 bg-[#18110c] border-b border-[#4a3622] shrink-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ScrollText className="w-4 h-4 text-[#e5b865] shrink-0" />
                    <h3 className="font-serif text-xs font-bold text-[#e5b865] tracking-wider uppercase truncate">
                      Log de Combate
                    </h3>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-[#a6957e] shrink-0">
                    Rodada {combat.round} · {combatLog.length} reg.
                  </span>
                </div>

                {/* Live Battle Telemetry Strip */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono tabular-nums">
                  <div className="bg-[#120d09] border border-[#3b2c1e] rounded-xs px-2 py-1">
                    <div className="text-[#8f7e69] uppercase text-[9px]">Dano Causado</div>
                    <div className="text-[#7ad9a4] font-bold text-xs">{totalDamageToEnemy}</div>
                  </div>
                  <div className="bg-[#120d09] border border-[#3b2c1e] rounded-xs px-2 py-1">
                    <div className="text-[#8f7e69] uppercase text-[9px]">Críticos</div>
                    <div className="text-[#fde047] font-bold text-xs">{totalCritsInLog}</div>
                  </div>
                  <div className="bg-[#120d09] border border-[#3b2c1e] rounded-xs px-2 py-1">
                    <div className="text-[#8f7e69] uppercase text-[9px]">HP Inimigo</div>
                    <div className="text-[#fca5a5] font-bold text-xs">
                      {combat.enemy.hp}/{combat.enemy.maxHp}
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-[#110c09] p-0.5 rounded-xs border border-[#3b2c1e]">
                  {(
                    [
                      { id: 'all', label: 'Tudo' },
                      { id: 'damage', label: 'Dano / Crít.' },
                      { id: 'effects', label: 'Efeitos' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCombatLogFilter(tab.id)}
                      className={`py-1 px-1.5 rounded-xs text-[11px] font-serif font-bold transition-colors cursor-pointer ${
                        combatLogFilter === tab.id
                          ? 'bg-[#332210] text-[#f3d189] border border-[#8c6430]'
                          : 'text-[#8f7e69] hover:text-[#e6d7be] border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Combat Log Feed */}
              <div
                ref={logContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 text-xs"
              >
                {filteredCombatLog.length === 0 ? (
                  <div className="text-center py-8 text-[#7d6c58] font-mono text-[11px]">
                    Nenhum evento nesta categoria ainda.
                  </div>
                ) : (
                  filteredCombatLog.map((entry) => {
                    const isCritEntry = /CRÍTIC/i.test(`${entry.tag ?? ''} ${entry.detail ?? ''}`);
                    const isStealthEntry = /FURTIVIDADE/i.test(entry.tag ?? '');
                    const isBleedEntry = /SANGRAMENTO/i.test(entry.tag ?? '');

                    const cardAccent = isCritEntry
                      ? 'border-l-[#facc15] bg-[#24160a] border-[#6b4214]'
                      : isStealthEntry
                      ? 'border-l-[#a855f7] bg-[#1a1126] border-[#4c2866]'
                      : isBleedEntry
                      ? 'border-l-[#dc2626] bg-[#220e0e] border-[#5c1e1e]'
                      : entry.tone === 'player'
                      ? 'border-l-[#34d399] bg-[#15130f] border-[#2f3a2e]'
                      : entry.tone === 'enemy'
                      ? 'border-l-[#ef4444] bg-[#1c100f] border-[#4a2323]'
                      : entry.tone === 'reaction'
                      ? 'border-l-[#38bdf8] bg-[#101821] border-[#26465f]'
                      : entry.tone === 'warning'
                      ? 'border-l-[#f59e0b] bg-[#1e160c] border-[#593c18]'
                      : entry.tone === 'victory'
                      ? 'border-l-[#fde047] bg-[#231d0c] border-[#85641b]'
                      : entry.tone === 'defeat'
                      ? 'border-l-[#f87171] bg-[#290e0e] border-[#7f1d1d]'
                      : 'border-l-[#6e5c47] bg-[#15100c] border-[#33271c]';

                    const tagColor = isCritEntry
                      ? 'text-[#fde047]'
                      : isStealthEntry
                      ? 'text-[#d8b4fe]'
                      : isBleedEntry
                      ? 'text-[#fca5a5]'
                      : entry.tone === 'player'
                      ? 'text-[#7ad9a4]'
                      : entry.tone === 'enemy'
                      ? 'text-[#f28b82]'
                      : entry.tone === 'reaction'
                      ? 'text-[#7dd3fc]'
                      : entry.tone === 'warning'
                      ? 'text-[#f3c46b]'
                      : entry.tone === 'victory'
                      ? 'text-[#fde047]'
                      : entry.tone === 'defeat'
                      ? 'text-[#fca5a5]'
                      : 'text-[#a6957e]';

                    const detailTokens = entry.detail
                      ? entry.detail
                          .split(' · ')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];

                    return (
                      <div
                        key={entry.id}
                        className={`rounded-xs border border-l-[3px] px-2.5 py-2 space-y-1 ${cardAccent}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono tabular-nums text-[10px] text-[#8a7863] shrink-0">
                              R{entry.round ?? 1}
                            </span>
                            {entry.tag ? (
                              <span
                                className={`font-serif font-bold text-[10px] tracking-wider uppercase truncate ${tagColor}`}
                              >
                                {entry.tag}
                              </span>
                            ) : (
                              <span className="font-serif font-bold text-[10px] tracking-wider uppercase text-[#8a7863]">
                                REGISTRO
                              </span>
                            )}
                          </div>
                          {isCritEntry && (
                            <span className="font-serif font-black text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-xs bg-[#7f1d1d] border border-[#fde047] text-[#fef08a] shrink-0">
                              CRÍTICO
                            </span>
                          )}
                        </div>

                        <p className="text-[11.5px] leading-snug text-[#e6dac6]">
                          {renderFormattedLogText(entry.text)}
                        </p>

                        {detailTokens.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {detailTokens.map((tok, i) => {
                              const tokStyle = /CRÍTIC/i.test(tok)
                                ? 'bg-[#3b1c0a] border-[#d97706] text-[#fde047]'
                                : /Def\.|Escudo|Sangramento/i.test(tok)
                                ? 'bg-[#211314] border-[#6b2d2d] text-[#fca5a5]'
                                : /\+\d+|Cura/i.test(tok)
                                ? 'bg-[#102419] border-[#266341] text-[#86efac]'
                                : 'bg-[#1a140e] border-[#453423] text-[#d6c2a3]';
                              return (
                                <span
                                  key={i}
                                  className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded-xs border ${tokStyle}`}
                                >
                                  {tok}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Sticky Medieval Tactical Action Footer */}
        <div className="p-3 sm:p-4 bg-[#130e0a] border-t border-[#5c4327] shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-b-md relative z-30">
          {/* Round Economy Status */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="text-[#a6957e]">Ação de Movimento ({moveMetersFormatted}m):</span>
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

          {/* Primary Tactical Buttons: Ação de Movimento | Disparada (Ladino) | Ação Padrão (Menu) | Passar Turno */}
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
                {combat.isMoveModeActive
                  ? 'Cancelar Ação de Movimento'
                  : `Ação de Movimento (${moveMetersFormatted}m)`}
              </span>
            </button>

            {isRogue && (
              <button
                type="button"
                disabled={!canCastSprint}
                onClick={handleCastSprint}
                title={`Dobra seu deslocamento para 12,0m neste turno (-${SPRINT_EP_COST} EP)`}
                className={`min-h-11 px-3.5 py-2 rounded-sm text-sm font-serif font-bold tracking-wide transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer border ${
                  combat.player.sprintActiveThisTurn
                    ? 'bg-[#1a364c] border-[#38bdf8] text-[#e0f2fe]'
                    : 'bg-[#261938] hover:bg-[#34224d] border-[#8b5cf6] text-[#f3e8ff]'
                }`}
              >
                <Wind className="w-4 h-4 text-[#c4b5fd]" />
                <span>
                  {combat.player.sprintActiveThisTurn
                    ? `Disparada (${moveMetersFormatted}m)`
                    : 'Disparada'}
                </span>
                {!combat.player.sprintActiveThisTurn && (
                  <span className="font-mono text-[11px] text-[#e5b865]">-{SPRINT_EP_COST} EP</span>
                )}
              </button>
            )}

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
                      Ação Padrão ·{' '}
                      {isMage
                        ? 'Mago'
                        : isPriest
                        ? 'Sacerdote'
                        : isRogue
                        ? 'Ladino'
                        : isKnight
                        ? 'Cavaleiro'
                        : 'Guerreiro'}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-[#b39d82]">
                      {isMage || isPriest
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
                          (5 + Dano Mágico). Com +2 MP dispara 2 setas com metade do dano em cada (
                          <strong className="font-mono text-[#e9d5ff]">
                            2×{arcaneBoltUpgradedDamage}
                          </strong>
                          ).
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canCastArcaneBolt1 || !isEnemyInArcaneBoltRange}
                            onClick={() => void handleArcaneBolt(false)}
                            className="px-2.5 py-2 rounded-xs border border-[#4992bd] bg-[#1a334a] hover:bg-[#234563] text-xs font-serif font-bold text-[#e0f2fe] flex items-center justify-between gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>1 Seta ({arcaneBoltDamage})</span>
                            <span className="font-mono text-[11px] text-[#7dd3fc]">-3 MP</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!canCastArcaneBolt2 || !isEnemyInArcaneBoltRange}
                            onClick={() => void handleArcaneBolt(true)}
                            className="px-2.5 py-2 rounded-xs border border-[#7c6ef6] bg-[#241d4a] hover:bg-[#312863] text-xs font-serif font-bold text-[#e9d5ff] flex items-center justify-between gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>2 Setas (2×{arcaneBoltUpgradedDamage})</span>
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

                      {/* Mage Spell 2: Armadura Arcana */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastArcaneArmor}
                        onClick={handleArcaneArmor}
                        className="w-full text-left p-2.5 rounded-sm border border-[#2f7899] bg-[#112430] hover:bg-[#173242] hover:border-[#38bdf8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#e0f2fe] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#38bdf8]" />
                            Armadura Arcana
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#7dd3fc] font-semibold">
                            -{ARCANE_ARMOR_MP_COST} MP · {ARCANE_ARMOR_DURATION_ROUNDS}R
                          </span>
                        </div>
                        <p className="text-xs text-[#b5d4e6] mt-1">
                          Somente em você: concede{' '}
                          <strong className="font-mono text-[#e0f2fe]">
                            +{ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} em Defesa Física
                          </strong>{' '}
                          durante{' '}
                          <strong className="font-mono text-[#e0f2fe]">
                            {ARCANE_ARMOR_DURATION_ROUNDS} rodadas
                          </strong>
                          .
                        </p>
                        {combat.player.mp < ARCANE_ARMOR_MP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{ARCANE_ARMOR_MP_COST} MP)
                          </p>
                        ) : combat.player.arcaneArmorTurns > 0 ? (
                          <p className="text-[11px] font-mono text-[#7dd3fc] mt-1">
                            Ativa ({combat.player.arcaneArmorTurns} rodada(s) restante(s)) — usar
                            renova para {ARCANE_ARMOR_DURATION_ROUNDS} rodadas
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
                          (12 + Dano Mágico) na área. Clique para mirar no mapa.
                        </p>
                        {combat.player.mp < FIRE_BREATH_MP_COST && (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{FIRE_BREATH_MP_COST} MP)
                          </p>
                        )}
                      </button>
                    </>
                  ) : isPriest ? (
                    <>
                      {/* Priest Basic Attack: Raio Divino (Grimoire divine beam) */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canPriestBasic || !isEnemyInPriestBasicRange}
                        onClick={handlePriestBasicAttack}
                        className="w-full text-left p-2.5 rounded-sm border border-[#9e7d34] bg-[#261f10] hover:bg-[#362c15] hover:border-[#fde047] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fef9c3] flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#fde047]" />
                            Raio Divino
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{PRIEST_BASIC_EP_COST} EP · {priestBasicText} Mág.
                          </span>
                        </div>
                        <p className="text-xs text-[#d6c7a5] mt-1">
                          Dispara um leve feixe de energia divina pelo{' '}
                          {character.equippedWeapon?.name ?? 'Grimório Sagrado'} (alcance{' '}
                          {PRIEST_BASIC_RANGE_METERS.toFixed(1).replace('.', ',')}m · dano mágico).
                        </p>
                        {!isEnemyInPriestBasicRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para até{' '}
                            {PRIEST_BASIC_RANGE_METERS.toFixed(1).replace('.', ',')}m)
                          </p>
                        ) : combat.player.ep < PRIEST_BASIC_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{PRIEST_BASIC_EP_COST} EP)
                          </p>
                        ) : null}
                      </button>

                      {/* Priest Spell 1: Luz Restauradora with combinable +2 PM and +3 PM upgrades */}
                      <div className="p-2.5 rounded-sm border border-[#2f7d52] bg-[#102418] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#dcfce7] flex items-center gap-2">
                            <Sun className="w-4 h-4 text-[#4ade80]" />
                            Luz Restauradora
                          </span>
                          <span className="font-mono tabular-nums text-[11px] text-[#7dd3fc] font-semibold">
                            Base -{RESTORING_LIGHT_MP_COST} MP
                          </span>
                        </div>
                        <p className="text-xs text-[#b5d9c2] leading-relaxed">
                          Cura{' '}
                          <strong className="font-mono text-[#dcfce7]">
                            {restoringLightBaseScaledHeal} HP
                          </strong>
                          {playerStats.healingBonus > 0 && (
                            <span className="font-mono text-[#86efac]">
                              {' '}
                              (+{playerStats.healingBonus} Sab.)
                            </span>
                          )}{' '}
                          do alvo. Combine aprimoramentos antes de conjurar:
                        </p>

                        <div className="grid grid-cols-1 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRestoringLightBoostHeal((v) => !v)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xs border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                              restoringLightBoostHeal
                                ? 'bg-[#1d422a] border-[#4ade80] text-[#ecfdf5]'
                                : 'bg-[#0c1a12] border-[#284f38] text-[#9ec4ab] hover:border-[#4ade80]/60'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 font-serif font-semibold">
                              <Plus className="w-3.5 h-3.5 text-[#4ade80]" />
                              +{RESTORING_LIGHT_HEAL_UPGRADE_BONUS} cura base (total{' '}
                              {restoringLightUpgradedScaledHeal} HP)
                            </span>
                            <span className="font-mono text-[11px] font-bold text-[#7dd3fc] shrink-0">
                              +{RESTORING_LIGHT_HEAL_UPGRADE_MP} PM
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRestoringLightAddRegen((v) => !v)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xs border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                              restoringLightAddRegen
                                ? 'bg-[#1d422a] border-[#4ade80] text-[#ecfdf5]'
                                : 'bg-[#0c1a12] border-[#284f38] text-[#9ec4ab] hover:border-[#4ade80]/60'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 font-serif font-semibold">
                              <Plus className="w-3.5 h-3.5 text-[#fde047]" />
                              Regeneração (+{restoringLightRegenScaledHeal} HP/turno ·{' '}
                              {RESTORING_LIGHT_REGEN_ROUNDS} rodadas)
                            </span>
                            <span className="font-mono text-[11px] font-bold text-[#7dd3fc] shrink-0">
                              +{RESTORING_LIGHT_REGEN_UPGRADE_MP} PM
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          role="menuitem"
                          disabled={!canCastRestoringLight}
                          onClick={handleCastRestoringLight}
                          className="w-full px-3 py-2 rounded-xs border border-[#4ade80] bg-[#164a2c] hover:bg-[#1e603a] text-xs font-serif font-bold text-[#ecfdf5] flex items-center justify-between gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span>
                            Conjurar (+{restoringLightTotalHeal} HP
                            {restoringLightAddRegen ? ' + Regeneração' : ''})
                          </span>
                          <span className="font-mono text-[11px] text-[#bae6fd]">
                            -{restoringLightTotalMp} MP
                          </span>
                        </button>

                        {combat.player.mp < restoringLightTotalMp && (
                          <p className="text-[11px] font-mono text-[#f28b82]">
                            Mana insuficiente ({combat.player.mp}/{restoringLightTotalMp} MP)
                          </p>
                        )}
                      </div>

                      {/* Priest Spell 2: Consagração (7 MP, 6m cast range, 4m radius, +10 HP base scaled by Wisdom) */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastConsecration}
                        onClick={handleToggleConsecrationMode}
                        className="w-full text-left p-2.5 rounded-sm border border-[#b58c32] bg-[#29200e] hover:bg-[#3a2d13] hover:border-[#fde047] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fef9c3] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#fde047]" />
                            Consagração
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#7dd3fc] font-semibold">
                            -{CONSECRATION_MP_COST} MP
                          </span>
                        </div>
                        <p className="text-xs text-[#decba2] mt-1">
                          Alcance{' '}
                          <strong className="font-mono text-[#fef08a]">
                            {CONSECRATION_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m
                          </strong>{' '}
                          · cura{' '}
                          <strong className="font-mono text-[#86efac]">
                            +{consecrationScaledHeal} HP
                          </strong>
                          {playerStats.healingBonus > 0 && (
                            <span className="font-mono text-[#86efac]">
                              {' '}
                              (+{playerStats.healingBonus} Sab.)
                            </span>
                          )}{' '}
                          em raio de{' '}
                          <strong className="font-mono text-[#fef08a]">
                            {CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m
                          </strong>
                          . Clique para escolher o centro no mapa.
                        </p>
                        {combat.player.mp < CONSECRATION_MP_COST && (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{CONSECRATION_MP_COST} MP)
                          </p>
                        )}
                      </button>

                      {/* Priest Spell 3: Proteção Sagrada (5 MP, 15 Shield HP for 1 round) */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastSacredProtection}
                        onClick={handleCastSacredProtection}
                        className="w-full text-left p-2.5 rounded-sm border border-[#a8822e] bg-[#241b0b] hover:bg-[#332610] hover:border-[#facc15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fef3c7] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#facc15]" />
                            Proteção Sagrada
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#7dd3fc] font-semibold">
                            -{SACRED_PROTECTION_MP_COST} MP
                          </span>
                        </div>
                        <p className="text-xs text-[#d6c297] mt-1">
                          Concede{' '}
                          <strong className="font-mono text-[#fef08a]">
                            {SACRED_PROTECTION_SHIELD_HP} pontos de escudo (sobrevida)
                          </strong>{' '}
                          ao alvo durante {SACRED_PROTECTION_DURATION_ROUNDS} rodada.
                        </p>
                        {combat.player.sacredShieldHp > 0 ? (
                          <p className="text-[11px] font-mono text-[#fde047] mt-1">
                            Ativo ({combat.player.sacredShieldHp}/{SACRED_PROTECTION_SHIELD_HP} pts)
                            — conjurar restaura para {SACRED_PROTECTION_SHIELD_HP} pts
                          </p>
                        ) : combat.player.mp < SACRED_PROTECTION_MP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Mana insuficiente ({combat.player.mp}/{SACRED_PROTECTION_MP_COST} MP)
                          </p>
                        ) : null}
                      </button>
                    </>
                  ) : isRogue ? (
                    <>
                      {/* Rogue Option 1: Golpe Simples */}
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
                            {combat.player.stealthTurns > 0 && (
                              <span className="font-mono text-[10px] text-[#d8b4fe] bg-[#2a1842] border border-[#a855f7] px-1.5 py-0.5 rounded-xs">
                                +{STEALTH_BONUS_DAMAGE} Furtivo
                              </span>
                            )}
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -15 EP
                          </span>
                        </div>
                        <p className="text-xs text-[#b39d82] mt-1">
                          1 ataque físico ({dmgRange.min + (combat.player.stealthTurns > 0 ? STEALTH_BONUS_DAMAGE : 0)}–
                          {dmgRange.max + (combat.player.stealthTurns > 0 ? STEALTH_BONUS_DAMAGE : 0)}{' '}
                          dano · alcance 1,5m · crítico +50%).
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

                      {/* Rogue Option 2: Arremesso de Adaga */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canDaggerThrow || !isEnemyInDaggerThrowRange}
                        onClick={handleDaggerThrow}
                        className="w-full text-left p-2.5 rounded-sm border border-[#9f1239] bg-[#2b1118] hover:bg-[#3d1722] hover:border-[#f43f5e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#ffe4e6] flex items-center gap-2">
                            <Crosshair className="w-4 h-4 text-[#fb7185]" />
                            Arremesso de Adaga
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{DAGGER_THROW_EP_COST} EP · {DAGGER_THROW_RANGE_METERS.toFixed(1).replace('.', ',')}m
                          </span>
                        </div>
                        <p className="text-xs text-[#d6b3bc] mt-1">
                          Lança uma adaga ({dmgRange.min + DAGGER_THROW_BONUS_DAMAGE}–
                          {dmgRange.max + DAGGER_THROW_BONUS_DAMAGE} dano físico · +
                          {DAGGER_THROW_BONUS_DAMAGE}) e aplica{' '}
                          <strong className="font-mono text-[#fda4af]">
                            Sangramento ({DAGGER_THROW_BLEED_DAMAGE} dano/rodada por{' '}
                            {DAGGER_THROW_BLEED_ROUNDS}R · sem crítico)
                          </strong>
                          .
                        </p>
                        {!character.equippedWeapon ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Requer arma empunhada
                          </p>
                        ) : combat.player.ep < DAGGER_THROW_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{DAGGER_THROW_EP_COST} EP)
                          </p>
                        ) : !isEnemyInDaggerThrowRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para até{' '}
                            {DAGGER_THROW_RANGE_METERS.toFixed(1).replace('.', ',')}m)
                          </p>
                        ) : null}
                      </button>

                      {/* Rogue Option 3: Furtividade */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastStealth}
                        onClick={handleCastStealth}
                        className="w-full text-left p-2.5 rounded-sm border border-[#7e22ce] bg-[#1e1233] hover:bg-[#2b1a47] hover:border-[#c084fc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#f3e8ff] flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-[#c084fc]" />
                            Furtividade
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{STEALTH_EP_COST} EP · {STEALTH_DURATION_ROUNDS}R
                          </span>
                        </div>
                        <p className="text-xs text-[#cbb8de] mt-1">
                          Invisível por {STEALTH_DURATION_ROUNDS} rodadas ({STEALTH_DETECTION_CHANCE}% de
                          chance do inimigo perceber você · sai ao atacar): próximo ataque básico{' '}
                          <strong className="font-mono text-[#e9d5ff]">
                            +{STEALTH_BONUS_DAMAGE} dano físico
                          </strong>
                          , mas sofre +{STEALTH_EXTRA_DAMAGE_TAKEN} dano extra.
                        </p>
                        {combat.player.stealthTurns > 0 ? (
                          <p className="text-[11px] font-mono text-[#d8b4fe] mt-1">
                            Invisível ({combat.player.stealthTurns}R restantes) — usar renova para 2
                            rodadas
                          </p>
                        ) : combat.player.ep < STEALTH_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{STEALTH_EP_COST} EP)
                          </p>
                        ) : null}
                      </button>

                      {/* Rogue Option 4: Letalidade */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastLethality}
                        onClick={handleCastLethality}
                        className="w-full text-left p-2.5 rounded-sm border border-[#a21caf] bg-[#2a112d] hover:bg-[#3c1840] hover:border-[#e879f9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fae8ff] flex items-center gap-2">
                            <Flame className="w-4 h-4 text-[#f0abfc]" />
                            Letalidade
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{LETHALITY_EP_COST} EP · {LETHALITY_CRIT_CHANCE}% Crít.
                          </span>
                        </div>
                        <p className="text-xs text-[#d9b8df] mt-1">
                          Apenas nas <strong className="text-[#f5d0fe]">costas do inimigo</strong>{' '}
                          (1,5m): ataque com{' '}
                          <strong className="font-mono text-[#f5d0fe]">
                            {dmgRange.min + character.attributes.dexterity}–
                            {dmgRange.max + character.attributes.dexterity} dano (+
                            {character.attributes.dexterity} Des.)
                          </strong>{' '}
                          e <strong className="font-mono text-[#f5d0fe]">50% de crítico</strong>.
                          Invisível ganha{' '}
                          <strong className="font-mono text-[#fde047]">
                            +{LETHALITY_STEALTH_CRIT_DMG_BONUS}% dano crítico
                          </strong>{' '}
                          (+{CRIT_DAMAGE_BONUS_PCT + LETHALITY_STEALTH_CRIT_DMG_BONUS}% total).
                        </p>
                        {!character.equippedWeapon ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Requer arma empunhada
                          </p>
                        ) : combat.player.ep < LETHALITY_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{LETHALITY_EP_COST} EP)
                          </p>
                        ) : !isPlayerBehindEnemy ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Requer estar nas costas do {combat.enemy.name} (olhando {enemyFacingLabel}
                            )
                          </p>
                        ) : (
                          <p className="text-[11px] font-mono text-[#86efac] mt-1">
                            Posição nas costas confirmada!{' '}
                            {combat.player.stealthTurns > 0
                              ? '(Bônus furtivo: +75% dano crítico!)'
                              : ''}
                          </p>
                        )}
                      </button>

                      {/* Rogue Option 5: Disparada (also quick-accessible beside Ação de Movimento) */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canCastSprint}
                        onClick={handleCastSprint}
                        className="w-full text-left p-2.5 rounded-sm border border-[#3b6e9c] bg-[#132230] hover:bg-[#1a3044] hover:border-[#38bdf8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#e0f2fe] flex items-center gap-2">
                            <Wind className="w-4 h-4 text-[#7dd3fc]" />
                            Disparada
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{SPRINT_EP_COST} EP · Livre
                          </span>
                        </div>
                        <p className="text-xs text-[#b5d4e6] mt-1">
                          Não consome Ação Padrão: dobra seu deslocamento para 12,0m neste turno.
                        </p>
                        {combat.player.hasMoved ? (
                          <p className="text-[11px] font-mono text-[#a6957e] mt-1">
                            Ação de Movimento já utilizada neste turno
                          </p>
                        ) : combat.player.sprintActiveThisTurn ? (
                          <p className="text-[11px] font-mono text-[#7dd3fc] mt-1">
                            Disparada já está ativa ({moveMetersFormatted}m)
                          </p>
                        ) : combat.player.ep < SPRINT_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{SPRINT_EP_COST} EP)
                          </p>
                        ) : null}
                      </button>
                    </>
                  ) : isKnight ? (
                    <>
                      {/* Knight Option 1: Golpe Simples */}
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

                      {/* Knight Option 2: Investida Galante */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canGallantCharge}
                        onClick={handleToggleGallantChargeMode}
                        className="w-full text-left p-2.5 rounded-sm border border-[#a3782c] bg-[#291f10] hover:bg-[#3b2c15] hover:border-[#f3d189] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fef08a] flex items-center gap-2">
                            <Wind className="w-4 h-4 text-[#fbbf24]" />
                            Investida Galante
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{GALLANT_CHARGE_EP_COST} EP · {knightGallantChargeText} Fís.
                          </span>
                        </div>
                        <p className="text-xs text-[#d6c29f] mt-1">
                          Avança até <strong className="font-mono text-[#fef08a]">9,0m</strong> em
                          linha reta (pode atravessar inimigos) e golpeia o inimigo no trajeto com{' '}
                          <strong className="font-mono text-[#fef08a]">
                            +{GALLANT_CHARGE_BONUS_DAMAGE} de Ataque Físico
                          </strong>
                          .
                        </p>
                        {combat.player.ep < GALLANT_CHARGE_EP_COST && (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{GALLANT_CHARGE_EP_COST} EP)
                          </p>
                        )}
                      </button>

                      {/* Knight Option 3: Provocar */}
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
                            Provocar
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{KNIGHT_TAUNT_EP_COST} EP
                          </span>
                        </div>
                        <p className="text-xs text-[#c7a3a3] mt-1">
                          Obriga 1 inimigo (6,0m) a atacar você por 2 rodadas e concede{' '}
                          <strong className="font-mono text-[#fde68a]">
                            +{KNIGHT_TAUNT_DEFENSE_BONUS} Def. Física e Mágica
                          </strong>{' '}
                          enquanto o Provocar durar.
                        </p>
                        {combat.player.ep < KNIGHT_TAUNT_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{KNIGHT_TAUNT_EP_COST} EP)
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

                      {/* Warrior Option 3: Carrasco */}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canExecutioner}
                        onClick={handleExecutionerStrike}
                        className={`w-full text-left p-2.5 rounded-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                          isEnemyExecutionerLowHp
                            ? 'border-[#e11d48] bg-[#301018] hover:bg-[#431521] hover:border-[#fb7185]'
                            : 'border-[#8a312b] bg-[#271211] hover:bg-[#381817] hover:border-[#e05246]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-serif font-bold text-sm text-[#fde2e2] flex items-center gap-2">
                            <Skull className="w-4 h-4 text-[#fb7185]" />
                            Carrasco
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#e5b865] font-semibold">
                            -{EXECUTIONER_EP_COST} EP · {warriorExecutionerText} Fís.
                          </span>
                        </div>
                        <p className="text-xs text-[#c7a3a3] mt-1">
                          Golpe poderoso: ataque básico{' '}
                          <strong className="font-mono text-[#fda4af]">
                            +{EXECUTIONER_BASE_BONUS_DAMAGE} dano
                          </strong>{' '}
                          (sobe para{' '}
                          <strong className="font-mono text-[#fb7185]">
                            +{EXECUTIONER_LOW_HP_BONUS_DAMAGE}
                          </strong>{' '}
                          se o inimigo estiver com ≤50% de vida · alcance 1,5m).
                        </p>
                        {!character.equippedWeapon ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Requer arma empunhada
                          </p>
                        ) : combat.player.ep < EXECUTIONER_EP_COST ? (
                          <p className="text-[11px] font-mono text-[#f28b82] mt-1">
                            Energia insuficiente ({combat.player.ep}/{EXECUTIONER_EP_COST} EP)
                          </p>
                        ) : !isEnemyInAttackRange ? (
                          <p className="text-[11px] font-mono text-[#e5b865] mt-1">
                            Alvo a {distMeters}m (aproxime-se para 1,5m)
                          </p>
                        ) : isEnemyExecutionerLowHp ? (
                          <p className="text-[11px] font-mono text-[#fb7185] font-semibold mt-1">
                            Alvo com ≤50% HP — bônus de Execução +{EXECUTIONER_LOW_HP_BONUS_DAMAGE} ATIVO!
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
              ) : combat.isGallantChargeModeActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setHoveredCellKey(null);
                    updateCombat((prev) => ({ ...prev, isGallantChargeModeActive: false }));
                  }}
                  className="min-h-11 px-5 py-2 rounded-sm text-sm font-serif font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap bg-[#6b4810] hover:bg-[#855a14] border border-[#facc15] text-[#fef9c3] cursor-pointer"
                >
                  <Wind className="w-4 h-4 text-[#fde047]" />
                  <span>Cancelar Investida Galante</span>
                </button>
              ) : combat.isConsecrationModeActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setHoveredCellKey(null);
                    updateCombat((prev) => ({ ...prev, isConsecrationModeActive: false }));
                  }}
                  className="min-h-11 px-5 py-2 rounded-sm text-sm font-serif font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap bg-[#5e4710] hover:bg-[#785a14] border border-[#fde047] text-[#fef9c3] cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-[#fde047]" />
                  <span>Cancelar Consagração</span>
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
                      isGallantChargeModeActive: false,
                      isConsecrationModeActive: false,
                    }));
                    setIsStandardActionOpen((prev) => !prev);
                  }}
                  className={`medieval-btn-gold min-h-11 px-5 py-2 rounded-sm text-sm font-serif font-bold tracking-wider transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${
                    isStandardActionOpen ? 'ring-2 ring-[#f3d189]/80' : ''
                  }`}
                >
                  {isMage ? (
                    <Sparkles className="w-4 h-4" />
                  ) : isPriest ? (
                    <Sun className="w-4 h-4" />
                  ) : isRogue ? (
                    <EyeOff className="w-4 h-4" />
                  ) : isKnight ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Swords className="w-4 h-4" />
                  )}
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
