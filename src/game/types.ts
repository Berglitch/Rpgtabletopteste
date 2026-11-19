export type AttributeKey =
  | 'strength'
  | 'constitution'
  | 'dexterity'
  | 'intelligence'
  | 'charisma'
  | 'wisdom';

export type DamageType = 'physical' | 'magical';

export type RaceId = 'human' | 'high_elf' | 'dwarf' | 'dryad';

export type ClassId = 'warrior' | 'mage';

export type GenderId = 'male' | 'female';

export interface RaceDefinition {
  id: RaceId;
  name: string;
  tagline: string;
  defaultPortraitId: string;
  passive: {
    name: string;
    shortEffect: string;
    description: string;
  };
  statHighlights: string[];
}

export interface ClassSkillSummary {
  id: string;
  name: string;
  costLabel: string;
  rangeLabel: string;
  description: string;
}

export interface ClassDefinition {
  id: ClassId;
  name: string;
  tagline: string;
  roleLabel: string;
  baseVitals: {
    hp: number;
    mp: number;
    ep: number;
  };
  basicAttackName: string;
  basicAttackDescription: string;
  startingWeapon: Weapon;
  startingSkills: string[];
  skillSummaries: ClassSkillSummary[];
}

export interface AppearanceOption {
  id: string;
  label: string;
  subtitle: string;
  suggestedRaceId: RaceId;
  suggestedClassId: ClassId;
  gender: GenderId;
  imageUrl: string;
}

export interface Weapon {
  id: string;
  name: string;
  rangeCells: number;
  rangeMeters: number;
  baseMinDamage: number;
  baseMaxDamage: number;
}

export interface CharacterAttributes {
  strength: number;
  constitution: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
  wisdom: number;
}

export interface SecondaryStats {
  physicalDamage: { min: number; max: number };
  magicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  critChance: number;
  critDamageBonus: number;
  evasionChance: number;
  hitChance: number;
}

export interface CombatStatModifiers {
  bonusPhysicalDamage?: number;
  bonusMagicDamage?: number;
  isDwarfLowHp?: boolean;
}

export interface AttackResolution {
  outcome: 'hit' | 'missed' | 'evaded';
  damageType: DamageType;
  baseDamage: number;
  isCritical: boolean;
  damageAfterCrit: number;
  defenseApplied: number;
  finalDamage: number;
}

export interface CharacterState {
  name: string;
  level: number;
  raceId: RaceId;
  classId: ClassId;
  gender: GenderId;
  portraitId: string;
  hasCompletedCreation: boolean;
  race: {
    name: string;
    passive: {
      name: string;
      description: string;
    };
  };
  characterClass: {
    name: string;
    baseVitals: {
      hp: number;
      mp: number;
      ep: number;
    };
  };
  equippedWeapon: Weapon | null;
  attributes: CharacterAttributes;
  unspentPoints: number;
}

export interface ReactionSkill {
  id: string;
  name: string;
  epCost: number;
  requiresWeapon: boolean;
  requiresAttackRange: boolean;
  classId: ClassId;
  description: string;
}

export interface ReactionEvaluation {
  canUse: boolean;
  checks: {
    hasEnergy: boolean;
    hasWeapon: boolean;
    inRange: boolean;
    notStunned: boolean;
  };
}

export interface GridPos {
  x: number;
  y: number;
}

export interface ReachableCell {
  cost: number;
  path: GridPos[];
}

export interface PendingAttack {
  attackerName: string;
  attackName: string;
  damageType: DamageType;
  baseDamage: number;
  incomingDamage: number;
  isCritical: boolean;
  isHeavyBlow: boolean;
  isOpportunityAttack?: boolean;
  resumeMoveAfter?: {
    x: number;
    y: number;
    path: GridPos[];
    cost: number;
  };
  bonusAttack?: number;
  pushMeters?: number;
  stunRounds?: number;
}

export interface EnemyHeavyBlowSkill {
  id: string;
  name: string;
  epCost: number;
  bonusAttack: number;
  pushMeters: number;
  stunRounds: number;
  cooldown: number;
}

export interface CombatPlayer {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ep: number;
  maxEp: number;
  arcaneShield: number;
  arcaneShieldMax: number;
  x: number;
  y: number;
  initiative: number;
  initiativeRoll: number;
  hasMoved: boolean;
  hasActed: boolean;
  stunnedTurns: number;
  beyondLimitUsed: boolean;
  beyondLimitTurns: number;
  greenBloodTriggered: boolean;
  greenBloodTurns: number;
  rigidSkinDoubledLogged: boolean;
}

export interface CombatEnemy {
  name: string;
  hp: number;
  maxHp: number;
  ep: number;
  maxEp: number;
  dmg: number;
  magicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  critChance: number;
  critDamageBonus: number;
  evasionChance: number;
  hitChance: number;
  attackName: string;
  heavyBlowCooldown: number;
  skills: {
    heavyBlow: EnemyHeavyBlowSkill;
  };
  dexterity: number;
  x: number;
  y: number;
  initiative: number;
  initiativeRoll: number;
  stunnedTurns: number;
  tauntedTurns: number;
  tauntedBy: string | null;
}

export type CombatTone = 'info' | 'player' | 'enemy' | 'reaction' | 'warning' | 'victory' | 'defeat';

export interface CombatLogEntry {
  id: number;
  tone: CombatTone;
  tag?: string;
  text: string;
  detail?: string;
}

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat';

export interface CombatState {
  player: CombatPlayer;
  enemy: CombatEnemy;
  isActive: boolean;
  outcome: CombatOutcome;
  isMoveModeActive: boolean;
  isFireBreathModeActive: boolean;
  isAnimatingMove: boolean;
  awaitingReaction: boolean;
  pendingAttack: PendingAttack | null;
  currentTurn: 'player' | 'enemy';
  round: number;
}

export interface AudioPrefs {
  musicEnabled: boolean;
  isMuted: boolean;
}
