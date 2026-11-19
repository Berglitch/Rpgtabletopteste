import type {
  AppearanceOption,
  AttackResolution,
  AttributeKey,
  AudioPrefs,
  CharacterAttributes,
  CharacterState,
  ClassDefinition,
  ClassId,
  CombatStatModifiers,
  CombatState,
  DamageType,
  GenderId,
  GridPos,
  RaceDefinition,
  RaceId,
  ReachableCell,
  ReactionEvaluation,
  ReactionSkill,
  SecondaryStats,
  Weapon,
} from './types';

const BUNDLED_IMAGE_MODULES = import.meta.glob('../assets/images/*.{jpg,png}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function resolveImageAsset(filename: string, fallbackFilename?: string): string {
  const direct = BUNDLED_IMAGE_MODULES[`../assets/images/${filename}`];
  if (direct) return direct;
  if (fallbackFilename) {
    const fallback = BUNDLED_IMAGE_MODULES[`../assets/images/${fallbackFilename}`];
    if (fallback) return fallback;
  }
  const firstAvailable = Object.values(BUNDLED_IMAGE_MODULES)[0];
  return firstAvailable ?? '';
}

const heroWarriorValeriusImg = resolveImageAsset('hero_warrior_valerius_1795088249220.jpg');
const goblinArtImg = resolveImageAsset('goblin-art.png');
const mapBattlegroundImg = resolveImageAsset('map-battleground.jpg');

const portraitHumanShieldmaidenImg = resolveImageAsset(
  'portrait_human_shieldmaiden_1795093741610.jpg',
  'hero_warrior_valerius_1795088249220.jpg'
);
const portraitHumanMageImg = resolveImageAsset(
  'portrait_human_mage_male.jpg',
  'portrait_human_mage_f_1795097606578.jpg'
);
const portraitHumanMageFImg = resolveImageAsset(
  'portrait_human_mage_f_1795097606578.jpg',
  'portrait_human_shieldmaiden_1795093741610.jpg'
);

const portraitHighElfWarriorImg = resolveImageAsset(
  'portrait_high_elf_warrior_1795093741297.jpg',
  'hero_warrior_valerius_1795088249220.jpg'
);
const portraitHighElfWarriorFImg = resolveImageAsset(
  'portrait_high_elf_warrior_f_1795097606341.jpg',
  'portrait_high_elf_warrior_1795093741297.jpg'
);
const portraitHighElfMageMImg = resolveImageAsset(
  'portrait_high_elf_mage_m_1795097606699.jpg',
  'portrait_high_elf_warrior_1795093741297.jpg'
);
const portraitHighElfMageImg = resolveImageAsset(
  'portrait_high_elf_mage_female.jpg',
  'portrait_high_elf_mage_m_1795097606699.jpg'
);

const portraitDwarfIroncladImg = resolveImageAsset(
  'portrait_dwarf_ironclad_1795093741247.jpg',
  'hero_warrior_valerius_1795088249220.jpg'
);
const portraitDwarfWomanWarriorImg = resolveImageAsset(
  'portrait_dwarf_woman_warrior_1795097641470.jpg',
  'portrait_dwarf_ironclad_1795093741247.jpg'
);
const portraitDwarfMageImg = resolveImageAsset(
  'portrait_dwarf_mage_male.jpg',
  'portrait_dwarf_woman_mage_1795097640311.jpg'
);
const portraitDwarfWomanMageImg = resolveImageAsset(
  'portrait_dwarf_woman_mage_1795097640311.jpg',
  'portrait_dwarf_ironclad_1795093741247.jpg'
);

const portraitDryadWarriorMImg = resolveImageAsset(
  'portrait_dryad_warrior_m_1795097606457.jpg',
  'portrait_dryad_warden_1795093740540.jpg'
);
const portraitDryadWardenImg = resolveImageAsset(
  'portrait_dryad_warden_1795093740540.jpg',
  'portrait_dryad_warrior_m_1795097606457.jpg'
);
const portraitDryadMageMImg = resolveImageAsset(
  'portrait_dryad_mage_m_1795097610314.jpg',
  'portrait_dryad_warrior_m_1795097606457.jpg'
);
const portraitDryadMageImg = resolveImageAsset(
  'portrait_dryad_mage_female.jpg',
  'portrait_dryad_mage_m_1795097610314.jpg'
);

export const HERO_PORTRAIT_URL = heroWarriorValeriusImg;
export const GOBLIN_PORTRAIT_URL = goblinArtImg;
export const BATTLEGROUND_MAP_URL = mapBattlegroundImg;

export const DEFAULT_WEAPON: Weapon = {
  id: 'iron_longsword',
  name: 'Espada Longa de Ferro',
  rangeCells: 1,
  rangeMeters: 1.5,
  baseMinDamage: 3,
  baseMaxDamage: 4,
};

export const MAGE_STAFF_WEAPON: Weapon = {
  id: 'arcane_staff',
  name: 'Cajado Arcano de Carvalho',
  rangeCells: 1,
  rangeMeters: 1.5,
  baseMinDamage: 1,
  baseMaxDamage: 2,
};

export const APPEARANCE_OPTIONS: AppearanceOption[] = [
  // Humano
  {
    id: 'human_knight',
    label: 'Cavaleiro de Aço',
    subtitle: 'Armadura forjada e manto real',
    suggestedRaceId: 'human',
    suggestedClassId: 'warrior',
    gender: 'male',
    imageUrl: heroWarriorValeriusImg,
  },
  {
    id: 'human_shieldmaiden',
    label: 'Escudeira Veterana',
    subtitle: 'Placas marcadas de batalha e manto carmesim',
    suggestedRaceId: 'human',
    suggestedClassId: 'warrior',
    gender: 'female',
    imageUrl: portraitHumanShieldmaidenImg,
  },
  {
    id: 'human_mage',
    label: 'Erudito das Runas',
    subtitle: 'Túnica azul-marinho e cajado de safira',
    suggestedRaceId: 'human',
    suggestedClassId: 'mage',
    gender: 'male',
    imageUrl: portraitHumanMageImg,
  },
  {
    id: 'human_mage_f',
    label: 'Arcanista das Runas',
    subtitle: 'Manto arcano dourado e cristal de safira',
    suggestedRaceId: 'human',
    suggestedClassId: 'mage',
    gender: 'female',
    imageUrl: portraitHumanMageFImg,
  },

  // Alto Elfo
  {
    id: 'high_elf_warrior',
    label: 'Lâmina Altiva',
    subtitle: 'Aço prateado com filigrana arcana',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'warrior',
    gender: 'male',
    imageUrl: portraitHighElfWarriorImg,
  },
  {
    id: 'high_elf_warrior_f',
    label: 'Guardiã Prateada',
    subtitle: 'Armadura élfica e estandarte real',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'warrior',
    gender: 'female',
    imageUrl: portraitHighElfWarriorFImg,
  },
  {
    id: 'high_elf_mage_m',
    label: 'Arquimago Estelar',
    subtitle: 'Diadema de prata e vestes rúnicas',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'mage',
    gender: 'male',
    imageUrl: portraitHighElfMageMImg,
  },
  {
    id: 'high_elf_mage',
    label: 'Arquimaga Estelar',
    subtitle: 'Vestes arcanas bordadas a ouro',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'mage',
    gender: 'female',
    imageUrl: portraitHighElfMageImg,
  },

  // Anão
  {
    id: 'dwarf_ironclad',
    label: 'Guardião da Forja',
    subtitle: 'Ferro rúnico temperado na montanha',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'warrior',
    gender: 'male',
    imageUrl: portraitDwarfIroncladImg,
  },
  {
    id: 'dwarf_warrior_f',
    label: 'Escudeira da Forja',
    subtitle: 'Tranças ruivas e placas rúnicas de ferro',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'warrior',
    gender: 'female',
    imageUrl: portraitDwarfWomanWarriorImg,
  },
  {
    id: 'dwarf_mage',
    label: 'Runomante da Montanha',
    subtitle: 'Barba trançada com runas flamejantes',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'mage',
    gender: 'male',
    imageUrl: portraitDwarfMageImg,
  },
  {
    id: 'dwarf_mage_f',
    label: 'Sábia das Runas',
    subtitle: 'Cajado de brasa e manto rúnico da forja',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'mage',
    gender: 'female',
    imageUrl: portraitDwarfWomanMageImg,
  },

  // Dríade
  {
    id: 'dryad_warrior_m',
    label: 'Guardião da Mata',
    subtitle: 'Ombreiras de madeira viva e aço rúnico',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'warrior',
    gender: 'male',
    imageUrl: portraitDryadWarriorMImg,
  },
  {
    id: 'dryad_warden',
    label: 'Sentinela da Mata',
    subtitle: 'Casca viva, bronze antigo e folhas',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'warrior',
    gender: 'female',
    imageUrl: portraitDryadWardenImg,
  },
  {
    id: 'dryad_mage_m',
    label: 'Druida do Bosque',
    subtitle: 'Galhada ancestral e cajado esmeralda',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'mage',
    gender: 'male',
    imageUrl: portraitDryadMageMImg,
  },
  {
    id: 'dryad_mage',
    label: 'Oráculo da Floresta',
    subtitle: 'Cajado vivo e névoa esmeralda',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'mage',
    gender: 'female',
    imageUrl: portraitDryadMageImg,
  },
];

export const RACES: Record<RaceId, RaceDefinition> = {
  human: {
    id: 'human',
    name: 'Humano',
    tagline: 'Determinação inabalável diante da morte',
    defaultPortraitId: 'human_knight',
    passive: {
      name: 'Além do Limite',
      shortEffect: 'Sobrevive com 1 HP · +5 Dano Fís./Mág. (2R)',
      description:
        'Quando um ataque o derrubaria para 0 de vida ou menos, você permanece com 1 de vida e durante 2 rodadas ganha +5 pontos de dano físico e mágico.',
    },
    statHighlights: [
      'Impede queda fatal (1 HP restante)',
      '+5 Dano Físico e Mágico por 2 rodadas',
      'Versátil em classes físicas ou arcanas',
    ],
  },
  high_elf: {
    id: 'high_elf',
    name: 'Alto Elfo',
    tagline: 'Afinidade ancestral com o fluxo arcano',
    defaultPortraitId: 'high_elf_warrior',
    passive: {
      name: 'Maestria Arcana',
      shortEffect: '+2 Mana por nível (desde o Nv. 1)',
      description:
        'Você ganha +2 de Mana por nível (já concedido no nível 1 e novamente toda vez que sobe de nível).',
    },
    statHighlights: [
      '+2 Mana máxima já no nível 1',
      '+2 Mana adicional a cada novo nível',
      'Excelente sinergia com magias de alto custo',
    ],
  },
  dwarf: {
    id: 'dwarf',
    name: 'Anão',
    tagline: 'Resiliência forjada em pedra e aço',
    defaultPortraitId: 'dwarf_ironclad',
    passive: {
      name: 'Pele Rígida',
      shortEffect: '+2 Def. Fís./Mág. (dobra com ≤ 40% HP)',
      description:
        'Recebe passivamente 2 de Defesa Física e 2 de Defesa Mágica; ao ficar com 40% de vida ou menos, o efeito passivo dobra (+4 em ambas as defesas).',
    },
    statHighlights: [
      '+2 Defesa Física e +2 Defesa Mágica passivas',
      'Dobra para +4 / +4 quando ≤ 40% de Vida',
      'Alta mitigação contra golpes físicos e mágicos',
    ],
  },
  dryad: {
    id: 'dryad',
    name: 'Dríade',
    tagline: 'Vitalidade antiga das florestas vivas',
    defaultPortraitId: 'dryad_warden',
    passive: {
      name: 'Sangue Verde',
      shortEffect: '< 50% HP: regenera 2% HP máx./turno (3R)',
      description:
        'Ao ficar com menos de 50% da vida ganha o efeito "Sangue Verde", que dura 3 rodadas e recupera 2% da vida máxima a cada rodada, sempre no início do seu turno.',
    },
    statHighlights: [
      'Ativa automaticamente abaixo de 50% de Vida',
      'Regenera 2% da Vida máxima por 3 rodadas',
      'Cura aplicada sempre no início do seu turno',
    ],
  },
};

export const RACE_LIST: RaceDefinition[] = [
  RACES.human,
  RACES.high_elf,
  RACES.dwarf,
  RACES.dryad,
];

export const INITIAL_POINTS = 15;
export const GRID_COLS = 16;
export const GRID_ROWS = 10;
export const CELL_METERS = 1.5;
export const DIAGONAL_METERS = 3.0;
export const MAX_MOVE_METERS = 6.0;
export const CELL_PIXEL_SIZE = 52;
export const BOARD_PIXEL_W = GRID_COLS * CELL_PIXEL_SIZE + 6; // 838px
export const BOARD_PIXEL_H = GRID_ROWS * CELL_PIXEL_SIZE + 6; // 526px
export const BASIC_ATTACK_EP_COST = 15;
export const DOUBLE_STRIKE_EP_COST = 30;
export const TAUNT_EP_COST = 30;
export const TAUNT_DURATION_ROUNDS = 2;
export const TAUNT_RANGE_CELLS = 4;
export const TAUNT_RANGE_METERS = 6.0;
export const PASSIVE_EP_REGEN = 20;

// Mage Spell Constants
export const ARCANE_BOLT_MP_COST = 3;
export const ARCANE_BOLT_UPGRADE_EXTRA_MP = 2;
export const ARCANE_BOLT_UPGRADED_MP_COST = ARCANE_BOLT_MP_COST + ARCANE_BOLT_UPGRADE_EXTRA_MP;
export const ARCANE_BOLT_BASE_DAMAGE = 5;
export const ARCANE_BOLT_RANGE_CELLS = 6; // 9,0m
export const ARCANE_BOLT_RANGE_METERS = 9.0;

export const ARCANE_SHIELD_MP_COST = 5;
export const ARCANE_SHIELD_BASE_VALUE = 5;

export const FIRE_BREATH_MP_COST = 9;
export const FIRE_BREATH_BASE_DAMAGE = 12;
export const FIRE_BREATH_CONE_CELLS = 4; // 6,0m
export const FIRE_BREATH_CONE_METERS = 6.0;
export const FIRE_BREATH_HALF_ANGLE_DEG = 36;

export const BASE_CRIT_CHANCE = 1;
export const CRIT_DAMAGE_BONUS_PCT = 50;
export const BASE_EVASION_CHANCE = 1;
export const BASE_HIT_CHANCE = 90;

export const HUMAN_BEYOND_LIMIT_BONUS_DAMAGE = 5;
export const HUMAN_BEYOND_LIMIT_ROUNDS = 2;
export const HIGH_ELF_MP_PER_LEVEL = 2;
export const DWARF_RIGID_SKIN_BASE_DEFENSE = 2;
export const DWARF_RIGID_SKIN_LOW_HP_THRESHOLD = 0.4;
export const DRYAD_GREEN_BLOOD_HP_THRESHOLD = 0.5;
export const DRYAD_GREEN_BLOOD_ROUNDS = 3;
export const DRYAD_GREEN_BLOOD_HEAL_PCT = 0.02;

export const CLASSES: Record<ClassId, ClassDefinition> = {
  warrior: {
    id: 'warrior',
    name: 'Guerreiro',
    tagline: 'Mestre da linha de frente, lâmina firme e controle de campo',
    roleLabel: 'Combatente Corpo a Corpo',
    baseVitals: {
      hp: 20,
      mp: 5,
      ep: 100,
    },
    basicAttackName: 'Golpe Simples',
    basicAttackDescription:
      'Ataque físico corpo a corpo (1,5m) com a espada equipada (15 EP). Pode causar acerto crítico (+50%).',
    startingWeapon: DEFAULT_WEAPON,
    startingSkills: ['Provocar I', 'Golpe Duplo', 'Aparar Ataque 1'],
    skillSummaries: [
      {
        id: 'taunt_1',
        name: 'Provocar I',
        costLabel: '30 EP',
        rangeLabel: '6,0m · 1 alvo',
        description: 'Obriga um inimigo a atacar exclusivamente você durante 2 rodadas.',
      },
      {
        id: 'double_strike',
        name: 'Golpe Duplo',
        costLabel: '30 EP',
        rangeLabel: '1,5m',
        description: 'Desfere dois ataques físicos consecutivos com a espada equipada no mesmo turno.',
      },
      {
        id: 'parry_1',
        name: 'Aparar Ataque 1',
        costLabel: '15 EP · Reação',
        rangeLabel: '1,5m',
        description: 'Realiza um ataque oposto e reduz o dano do golpe inimigo com o resultado obtido.',
      },
    ],
  },
  mage: {
    id: 'mage',
    name: 'Mago',
    tagline: 'Canalizador de mana pura, barreiras arcanas e chamas devastadoras',
    roleLabel: 'Conjurador Arcano',
    baseVitals: {
      hp: 8,
      mp: 25,
      ep: 100,
    },
    basicAttackName: 'Golpe Básico',
    basicAttackDescription:
      'Ataque físico corpo a corpo (1,5m · 15 EP) que causa dano igual a Força + Dano Físico.',
    startingWeapon: MAGE_STAFF_WEAPON,
    startingSkills: ['Seta Arcana', 'Escudo Arcano', 'Baforada de Fogo'],
    skillSummaries: [
      {
        id: 'arcane_bolt',
        name: 'Seta Arcana',
        costLabel: '3 MP (+2 MP = 2 setas)',
        rangeLabel: '9,0m',
        description:
          'Dispara seta de mana pura causando 5 + Dano Mágico. Com +2 de Mana (total 5 MP), dispara 2 setas no mesmo alvo ou divididas entre alvos.',
      },
      {
        id: 'arcane_shield',
        name: 'Escudo Arcano',
        costLabel: '5 MP',
        rangeLabel: 'Pessoal (apenas você)',
        description:
          'Concede 5 + Inteligência de Sobrevida que absorve dano até ser quebrado.',
      },
      {
        id: 'fire_breath',
        name: 'Baforada de Fogo',
        costLabel: '9 MP',
        rangeLabel: 'Cone 6,0m',
        description:
          'Projeta um cone flamejante de 6 metros a partir de você, causando 12 de dano de fogo na área.',
      },
    ],
  },
};

export const CLASS_LIST: ClassDefinition[] = [CLASSES.warrior, CLASSES.mage];

export const WARRIOR_ACTIVE_SKILLS = [
  {
    id: 'double_strike',
    name: 'Golpe Duplo',
    epCost: DOUBLE_STRIKE_EP_COST,
    hits: 2,
    rangeMeters: 1.5,
    description:
      'Arte Marcial de Guerreiro: desfere dois ataques físicos consecutivos com a espada equipada no mesmo turno (alcance 1,5m).',
  },
  {
    id: 'taunt_1',
    name: 'Provocar I',
    epCost: TAUNT_EP_COST,
    durationRounds: TAUNT_DURATION_ROUNDS,
    targetCount: 1,
    rangeMeters: TAUNT_RANGE_METERS,
    description:
      'Afeta apenas um inimigo a até 6,0m e o obriga a atacar exclusivamente quem utilizou a habilidade durante 2 rodadas.',
  },
] as const;

export const REACTION_SKILLS: ReactionSkill[] = [
  {
    id: 'parry_1',
    name: 'Aparar Ataque 1',
    epCost: 15,
    requiresWeapon: true,
    requiresAttackRange: true,
    classId: 'warrior',
    description:
      'Você realiza um ataque oposto e usa o resultado do dano para diminuir no dano que vai ser causado.',
  },
];

export const TACTICAL_OBSTACLES: GridPos[] = [
  { x: 3, y: 2 },
  { x: 3, y: 3 },
  { x: 5, y: 6 },
  { x: 5, y: 7 },
  { x: 7, y: 3 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 10, y: 1 },
  { x: 10, y: 2 },
  { x: 11, y: 7 },
  { x: 12, y: 7 },
  { x: 6, y: 8 },
];

export interface AttributeMetadata {
  key: AttributeKey;
  label: string;
  description: string;
  formulaHint?: string;
}

export const ATTRIBUTE_LIST: AttributeMetadata[] = [
  {
    key: 'strength',
    label: 'Força',
    description: 'Aumenta capacidade de carga (+5 kg) e soma diretamente ao Dano Físico de ataques e habilidades.',
    formulaHint: '+5 kg carga · escalona Dano Físico',
  },
  {
    key: 'constitution',
    label: 'Constituição',
    description: 'Aumenta a Vida máxima (+4 HP) e eleva a Defesa Física (+1 a cada 2 pontos).',
    formulaHint: '+4 HP · +1 Defesa Física a cada 2 pts',
  },
  {
    key: 'dexterity',
    label: 'Destreza',
    description:
      'Soma na Iniciativa (+1), eleva Chance de Acerto (+1%) e aumenta Chance Crítica e Evasão (+1% a cada 2 pontos).',
    formulaHint: '+1 Iniciativa · +1% Acerto · Crítico/Evasão',
  },
  {
    key: 'intelligence',
    label: 'Inteligência',
    description: 'Aumenta a Mana máxima (+4 MP), amplia o Dano Mágico (+1/pt) e reforça Escudo Arcano.',
    formulaHint: '+4 MP · +1 Dano Mágico · +1 Escudo Arcano',
  },
  {
    key: 'charisma',
    label: 'Carisma',
    description: 'Capacidade social, coerção, manipulação e descontos com mercadores e taverneiros.',
  },
  {
    key: 'wisdom',
    label: 'Sabedoria',
    description: 'Eleva a Defesa Mágica (+1 a cada 2 pontos), contribui ao Dano Mágico e amplia cura e percepção.',
    formulaHint: '+1 Defesa Mágica e +1 Dano Mágico a cada 2 pts',
  },
];

const CHARACTER_STORAGE_KEY = 'csg_character_sheet_v1';
const AUDIO_STORAGE_KEY = 'csg_audio_prefs_v1';

export function getRaceDefinition(raceId: RaceId): RaceDefinition {
  return RACES[raceId] ?? RACES.human;
}

export function getClassDefinition(classId: ClassId): ClassDefinition {
  return CLASSES[classId] ?? CLASSES.warrior;
}

export function getDefaultWeaponForClass(classId: ClassId): Weapon {
  return { ...getClassDefinition(classId).startingWeapon };
}

export function getGenderLabel(gender: GenderId): string {
  return gender === 'female' ? 'Feminino' : 'Masculino';
}

export function getDefaultPortraitFor(
  raceId: RaceId,
  classId: ClassId,
  gender: GenderId = 'male'
): string {
  const exact = APPEARANCE_OPTIONS.find(
    (opt) =>
      opt.suggestedRaceId === raceId &&
      opt.suggestedClassId === classId &&
      opt.gender === gender
  );
  if (exact) return exact.id;
  const raceGender = APPEARANCE_OPTIONS.find(
    (opt) => opt.suggestedRaceId === raceId && opt.gender === gender
  );
  if (raceGender) return raceGender.id;
  return RACES[raceId]?.defaultPortraitId ?? APPEARANCE_OPTIONS[0].id;
}

export function getAppearanceOption(portraitId: string): AppearanceOption {
  return APPEARANCE_OPTIONS.find((a) => a.id === portraitId) ?? APPEARANCE_OPTIONS[0];
}

export function getCharacterPortraitUrl(character: CharacterState): string {
  return getAppearanceOption(character.portraitId).imageUrl;
}

export function getReactionSkillsForClass(classId: ClassId): ReactionSkill[] {
  return REACTION_SKILLS.filter((s) => s.classId === classId);
}

export function buildCharacterRaceSnapshot(raceId: RaceId): CharacterState['race'] {
  const def = getRaceDefinition(raceId);
  return {
    name: def.name,
    passive: {
      name: def.passive.name,
      description: def.passive.description,
    },
  };
}

export function buildCharacterClassSnapshot(classId: ClassId): CharacterState['characterClass'] {
  const def = getClassDefinition(classId);
  return {
    name: def.name,
    baseVitals: { ...def.baseVitals },
  };
}

export function createDefaultCharacter(): CharacterState {
  const raceId: RaceId = 'human';
  const classId: ClassId = 'warrior';
  const gender: GenderId = 'male';
  return {
    name: 'Valerius',
    level: 1,
    raceId,
    classId,
    gender,
    portraitId: getDefaultPortraitFor(raceId, classId, gender),
    hasCompletedCreation: false,
    race: buildCharacterRaceSnapshot(raceId),
    characterClass: buildCharacterClassSnapshot(classId),
    equippedWeapon: getDefaultWeaponForClass(classId),
    attributes: {
      strength: 0,
      constitution: 0,
      dexterity: 0,
      intelligence: 0,
      charisma: 0,
      wisdom: 0,
    },
    unspentPoints: INITIAL_POINTS,
  };
}

interface PersistedCharacterPayload {
  name: string;
  level?: number;
  raceId?: RaceId;
  classId?: ClassId;
  gender?: GenderId;
  portraitId?: string;
  hasCompletedCreation?: boolean;
  attributes: CharacterAttributes;
  weaponEquipped: boolean;
}

const VALID_RACE_IDS: RaceId[] = ['human', 'high_elf', 'dwarf', 'dryad'];
const VALID_CLASS_IDS: ClassId[] = ['warrior', 'mage'];
const VALID_GENDER_IDS: GenderId[] = ['male', 'female'];

export function loadCharacterState(): CharacterState {
  const base = createDefaultCharacter();
  try {
    const raw = window.localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PersistedCharacterPayload>;

    const keys: AttributeKey[] = [
      'strength',
      'constitution',
      'dexterity',
      'intelligence',
      'charisma',
      'wisdom',
    ];
    const sanitizedAttrs: CharacterAttributes = { ...base.attributes };
    let totalSpent = 0;

    for (const key of keys) {
      const val = Number(parsed.attributes?.[key]);
      const clamped = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0;
      sanitizedAttrs[key] = clamped;
      totalSpent += clamped;
    }

    if (totalSpent > INITIAL_POINTS) {
      return base;
    }

    const raceId: RaceId =
      parsed.raceId && VALID_RACE_IDS.includes(parsed.raceId) ? parsed.raceId : 'human';
    const classId: ClassId =
      parsed.classId && VALID_CLASS_IDS.includes(parsed.classId) ? parsed.classId : 'warrior';
    const savedPortrait =
      typeof parsed.portraitId === 'string'
        ? APPEARANCE_OPTIONS.find((a) => a.id === parsed.portraitId)
        : undefined;
    const gender: GenderId =
      parsed.gender && VALID_GENDER_IDS.includes(parsed.gender)
        ? parsed.gender
        : savedPortrait?.gender ?? 'male';
    const portraitId = savedPortrait
      ? savedPortrait.id
      : getDefaultPortraitFor(raceId, classId, gender);
    const level =
      typeof parsed.level === 'number' && Number.isFinite(parsed.level)
        ? Math.max(1, Math.floor(parsed.level))
        : 1;

    return {
      ...base,
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 32) : base.name,
      level,
      raceId,
      classId,
      gender,
      portraitId,
      hasCompletedCreation: parsed.hasCompletedCreation === true,
      race: buildCharacterRaceSnapshot(raceId),
      characterClass: buildCharacterClassSnapshot(classId),
      attributes: sanitizedAttrs,
      unspentPoints: INITIAL_POINTS - totalSpent,
      equippedWeapon:
        parsed.weaponEquipped === false ? null : getDefaultWeaponForClass(classId),
    };
  } catch {
    return base;
  }
}

export function saveCharacterState(character: CharacterState): void {
  try {
    const payload: PersistedCharacterPayload = {
      name: character.name,
      level: character.level,
      raceId: character.raceId,
      classId: character.classId,
      gender: character.gender,
      portraitId: character.portraitId,
      hasCompletedCreation: character.hasCompletedCreation,
      attributes: character.attributes,
      weaponEquipped: character.equippedWeapon !== null,
    };
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage unavailable (private browsing / quota exceeded)
  }
}

export function loadAudioPrefs(): AudioPrefs {
  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return { musicEnabled: true, isMuted: false };
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
      isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : false,
    };
  } catch {
    return { musicEnabled: true, isMuted: false };
  }
}

export function saveAudioPrefs(prefs: AudioPrefs): void {
  try {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

// Derived Character Formulas
export function getCalculatedStrength(character: CharacterState): number {
  return character.attributes.strength;
}

export function getMaxHp(character: CharacterState): number {
  return character.characterClass.baseVitals.hp + character.attributes.constitution * 4;
}

export function getHighElfLevelMpBonus(character: CharacterState): number {
  if (character.raceId !== 'high_elf') return 0;
  return Math.max(1, character.level) * HIGH_ELF_MP_PER_LEVEL;
}

export function getMaxMp(character: CharacterState): number {
  return (
    character.characterClass.baseVitals.mp +
    character.attributes.intelligence * 4 +
    getHighElfLevelMpBonus(character)
  );
}

export function getMaxEp(character: CharacterState): number {
  return character.characterClass.baseVitals.ep;
}

export function getCarryCapacity(character: CharacterState): number {
  return 10 + getCalculatedStrength(character) * 5;
}

export function getDwarfDefenseBonus(character: CharacterState, isDwarfLowHp = false): number {
  if (character.raceId !== 'dwarf') return 0;
  return isDwarfLowHp ? DWARF_RIGID_SKIN_BASE_DEFENSE * 2 : DWARF_RIGID_SKIN_BASE_DEFENSE;
}

export function getWeaponDamageRange(
  character: CharacterState,
  bonusPhysicalDamage = 0
): { min: number; max: number } {
  const totalStrength = getCalculatedStrength(character);
  if (!character.equippedWeapon) {
    const unarmed = 1 + Math.floor(totalStrength * 0.5) + bonusPhysicalDamage;
    return { min: unarmed, max: unarmed };
  }
  const bonus = Math.floor(totalStrength * 0.8) + bonusPhysicalDamage;
  return {
    min: character.equippedWeapon.baseMinDamage + bonus,
    max: character.equippedWeapon.baseMaxDamage + bonus,
  };
}

// Mage Basic Attack: physical attack dealing Força + Dano Físico
export function getMageBasicAttackRange(
  character: CharacterState,
  bonusPhysicalDamage = 0
): { min: number; max: number } {
  const phys = getWeaponDamageRange(character, bonusPhysicalDamage);
  const str = getCalculatedStrength(character);
  return {
    min: str + phys.min,
    max: str + phys.max,
  };
}

export function getMagicDamage(character: CharacterState, bonusMagicDamage = 0): number {
  return (
    character.attributes.intelligence +
    Math.floor(character.attributes.wisdom * 0.5) +
    bonusMagicDamage
  );
}

export function getArcaneBoltDamage(character: CharacterState, bonusMagicDamage = 0): number {
  return ARCANE_BOLT_BASE_DAMAGE + getMagicDamage(character, bonusMagicDamage);
}

export function getArcaneShieldAmount(character: CharacterState): number {
  return ARCANE_SHIELD_BASE_VALUE + character.attributes.intelligence;
}

export function getFireBreathDamage(bonusMagicDamage = 0): number {
  return FIRE_BREATH_BASE_DAMAGE + bonusMagicDamage;
}

export function getPhysicalDefense(character: CharacterState, isDwarfLowHp = false): number {
  return Math.floor(character.attributes.constitution / 2) + getDwarfDefenseBonus(character, isDwarfLowHp);
}

export function getMagicDefense(character: CharacterState, isDwarfLowHp = false): number {
  return Math.floor(character.attributes.wisdom / 2) + getDwarfDefenseBonus(character, isDwarfLowHp);
}

export function getCritChance(character: CharacterState): number {
  return Math.min(95, BASE_CRIT_CHANCE + Math.floor(character.attributes.dexterity / 2));
}

export function getEvasionChance(character: CharacterState): number {
  return Math.min(60, BASE_EVASION_CHANCE + Math.floor(character.attributes.dexterity / 2));
}

export function getHitChance(character: CharacterState): number {
  return Math.min(100, BASE_HIT_CHANCE + character.attributes.dexterity);
}

export function getSecondaryStats(
  character: CharacterState,
  modifiers?: CombatStatModifiers
): SecondaryStats {
  const bonusPhysical = modifiers?.bonusPhysicalDamage ?? 0;
  const bonusMagic = modifiers?.bonusMagicDamage ?? 0;
  const isDwarfLowHp = modifiers?.isDwarfLowHp ?? false;

  return {
    physicalDamage: getWeaponDamageRange(character, bonusPhysical),
    magicDamage: getMagicDamage(character, bonusMagic),
    physicalDefense: getPhysicalDefense(character, isDwarfLowHp),
    magicDefense: getMagicDefense(character, isDwarfLowHp),
    critChance: getCritChance(character),
    critDamageBonus: CRIT_DAMAGE_BONUS_PCT,
    evasionChance: getEvasionChance(character),
    hitChance: getHitChance(character),
  };
}

export function rollPlayerWeaponDamage(
  character: CharacterState,
  bonusPhysicalDamage = 0
): number {
  const range = getWeaponDamageRange(character, bonusPhysicalDamage);
  const span = range.max - range.min + 1;
  return Math.floor(Math.random() * span) + range.min;
}

export function rollMageBasicAttackDamage(
  character: CharacterState,
  bonusPhysicalDamage = 0
): number {
  const range = getMageBasicAttackRange(character, bonusPhysicalDamage);
  const span = range.max - range.min + 1;
  return Math.floor(Math.random() * span) + range.min;
}

export function rollHitAndEvasion(
  attackerHitChance: number,
  defenderEvasionChance: number
): 'hit' | 'missed' | 'evaded' {
  const hitRoll = Math.random() * 100;
  if (hitRoll >= attackerHitChance) {
    return 'missed';
  }
  const evadeRoll = Math.random() * 100;
  if (evadeRoll < defenderEvasionChance) {
    return 'evaded';
  }
  return 'hit';
}

export function rollEvasionOnly(defenderEvasionChance: number): boolean {
  return Math.random() * 100 < defenderEvasionChance;
}

export function resolveCombatAttack(params: {
  damageType: DamageType;
  baseDamage: number;
  attackerHitChance: number;
  attackerCritChance: number;
  defenderEvasionChance: number;
  defenderPhysicalDefense: number;
  defenderMagicDefense: number;
  canCritOverride?: boolean;
}): AttackResolution {
  const outcome = rollHitAndEvasion(params.attackerHitChance, params.defenderEvasionChance);

  if (outcome !== 'hit') {
    return {
      outcome,
      damageType: params.damageType,
      baseDamage: params.baseDamage,
      isCritical: false,
      damageAfterCrit: 0,
      defenseApplied: 0,
      finalDamage: 0,
    };
  }

  // Only physical attacks can critically strike unless a skill explicitly allows it
  const canCrit =
    params.canCritOverride !== undefined
      ? params.canCritOverride
      : params.damageType === 'physical';

  const isCritical = canCrit && Math.random() * 100 < params.attackerCritChance;
  const damageAfterCrit = isCritical
    ? Math.round(params.baseDamage * (1 + CRIT_DAMAGE_BONUS_PCT / 100))
    : params.baseDamage;

  const defense =
    params.damageType === 'physical'
      ? params.defenderPhysicalDefense
      : params.defenderMagicDefense;

  const finalDamage = Math.max(0, damageAfterCrit - defense);

  return {
    outcome: 'hit',
    damageType: params.damageType,
    baseDamage: params.baseDamage,
    isCritical,
    damageAfterCrit,
    defenseApplied: Math.min(defense, damageAfterCrit),
    finalDamage,
  };
}

// Grid Geometry & Pathfinding (Exact Chebyshev distance + Dijkstra 1.5m / 3.0m)
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

export function getDistanceMeters(x1: number, y1: number, x2: number, y2: number): string {
  return (getDistance(x1, y1, x2, y2) * CELL_METERS).toFixed(1).replace('.', ',');
}

export function isObstacleCell(x: number, y: number): boolean {
  return TACTICAL_OBSTACLES.some((o) => o.x === x && o.y === y);
}

// Computes all grid cells within a 6.0m (4-cell) cone oriented from origin toward target
export function getFireBreathConeCells(origin: GridPos, target: GridPos): GridPos[] {
  const dxAim = target.x - origin.x;
  const dyAim = target.y - origin.y;
  if (dxAim === 0 && dyAim === 0) return [];

  const aimAngle = Math.atan2(dyAim, dxAim);
  const maxHalfRad = (FIRE_BREATH_HALF_ANGLE_DEG * Math.PI) / 180;
  const cells: GridPos[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (col === origin.x && row === origin.y) continue;
      const dx = col - origin.x;
      const dy = row - origin.y;
      const euclid = Math.hypot(dx, dy);
      if (euclid > FIRE_BREATH_CONE_CELLS + 0.35) continue;

      const cellAngle = Math.atan2(dy, dx);
      let diff = Math.abs(cellAngle - aimAngle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;

      if (diff <= maxHalfRad) {
        cells.push({ x: col, y: row });
      }
    }
  }

  return cells;
}

export function getReachableCells(
  startX: number,
  startY: number,
  maxMeters: number,
  blockedCells: GridPos[]
): Map<string, ReachableCell> {
  const minCost = new Map<string, number>();
  const parentMap = new Map<string, string>();
  const startKey = `${startX},${startY}`;
  const queue: Array<{ x: number; y: number; cost: number }> = [{ x: startX, y: startY, cost: 0 }];
  minCost.set(startKey, 0);

  const directions = [
    { dx: 1, dy: 0, cost: CELL_METERS },
    { dx: -1, dy: 0, cost: CELL_METERS },
    { dx: 0, dy: 1, cost: CELL_METERS },
    { dx: 0, dy: -1, cost: CELL_METERS },
    { dx: 1, dy: 1, cost: DIAGONAL_METERS },
    { dx: 1, dy: -1, cost: DIAGONAL_METERS },
    { dx: -1, dy: 1, cost: DIAGONAL_METERS },
    { dx: -1, dy: -1, cost: DIAGONAL_METERS },
  ];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;
    const curKey = `${current.x},${current.y}`;

    if (current.cost > (minCost.get(curKey) ?? Infinity)) {
      continue;
    }

    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const newCost = current.cost + dir.cost;

      if (nx >= 0 && nx < GRID_COLS && ny >= 0 && ny < GRID_ROWS && newCost <= maxMeters + 0.001) {
        const isBlocked = blockedCells.some((b) => b.x === nx && b.y === ny);
        if (!isBlocked) {
          const key = `${nx},${ny}`;
          if (!minCost.has(key) || newCost < (minCost.get(key) ?? Infinity)) {
            minCost.set(key, newCost);
            parentMap.set(key, curKey);
            queue.push({ x: nx, y: ny, cost: newCost });
          }
        }
      }
    }
  }

  minCost.delete(startKey);

  const result = new Map<string, ReachableCell>();
  for (const [key, cost] of minCost.entries()) {
    const path: GridPos[] = [];
    let trace: string | undefined = key;
    while (trace) {
      const [px, py] = trace.split(',').map(Number);
      path.unshift({ x: px, y: py });
      trace = parentMap.get(trace);
    }
    result.set(key, { cost, path });
  }

  return result;
}

export function calculateKnockbackTrajectory(
  attackerPos: GridPos,
  targetPos: GridPos,
  pushMeters: number
): { path: GridPos[]; metersPushed: number; hitObstacle: boolean } {
  const stepX = Math.sign(targetPos.x - attackerPos.x);
  const stepY = Math.sign(targetPos.y - attackerPos.y);

  if (stepX === 0 && stepY === 0) {
    return { path: [{ ...targetPos }], metersPushed: 0, hitObstacle: false };
  }

  const isDiagonal = stepX !== 0 && stepY !== 0;
  const costPerCell = isDiagonal ? DIAGONAL_METERS : CELL_METERS;
  const path: GridPos[] = [{ x: targetPos.x, y: targetPos.y }];

  let currX = targetPos.x;
  let currY = targetPos.y;
  let metersPushed = 0;
  let hitObstacle = false;

  while (metersPushed + costPerCell <= pushMeters + 0.001) {
    const nx = currX + stepX;
    const ny = currY + stepY;

    if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) {
      hitObstacle = true;
      break;
    }

    const blocked =
      isObstacleCell(nx, ny) || (nx === attackerPos.x && ny === attackerPos.y);

    if (blocked) {
      hitObstacle = true;
      break;
    }

    currX = nx;
    currY = ny;
    metersPushed += costPerCell;
    path.push({ x: currX, y: currY });
  }

  return { path, metersPushed, hitObstacle };
}

export function computeGoblinMove(
  enemyPos: GridPos,
  playerPos: GridPos
): { path: GridPos[]; metersSpent: number } {
  let dist = getDistance(playerPos.x, playerPos.y, enemyPos.x, enemyPos.y);
  if (dist <= 1) {
    return { path: [{ ...enemyPos }], metersSpent: 0 };
  }

  let metersSpent = 0;
  const goblinPath: GridPos[] = [{ x: enemyPos.x, y: enemyPos.y }];
  let simX = enemyPos.x;
  let simY = enemyPos.y;

  while (metersSpent < MAX_MOVE_METERS && dist > 1) {
    let stepX = 0;
    let stepY = 0;

    if (playerPos.x > simX) stepX = 1;
    else if (playerPos.x < simX) stepX = -1;

    if (playerPos.y > simY) stepY = 1;
    else if (playerPos.y < simY) stepY = -1;

    const isDiagonal = stepX !== 0 && stepY !== 0;
    let stepCost = isDiagonal ? DIAGONAL_METERS : CELL_METERS;

    if (metersSpent + stepCost > MAX_MOVE_METERS && isDiagonal) {
      if (Math.abs(playerPos.x - simX) >= Math.abs(playerPos.y - simY)) {
        stepY = 0;
      } else {
        stepX = 0;
      }
      stepCost = CELL_METERS;
    }

    if (metersSpent + stepCost > MAX_MOVE_METERS) break;

    const nextX = simX + stepX;
    const nextY = simY + stepY;
    const isObs = isObstacleCell(nextX, nextY);
    const isPlayerCell = nextX === playerPos.x && nextY === playerPos.y;

    if (!isObs && !isPlayerCell) {
      simX = nextX;
      simY = nextY;
      goblinPath.push({ x: simX, y: simY });
      metersSpent += stepCost;
      dist = getDistance(playerPos.x, playerPos.y, simX, simY);
    } else {
      break;
    }
  }

  if (dist > 1) {
    const blocked = [...TACTICAL_OBSTACLES, playerPos];
    const reachable = getReachableCells(enemyPos.x, enemyPos.y, MAX_MOVE_METERS, blocked);
    let bestKey: string | null = null;
    let bestDist = dist;
    let bestCost = Infinity;

    for (const [key, data] of reachable.entries()) {
      const end = data.path[data.path.length - 1];
      const d = getDistance(playerPos.x, playerPos.y, end.x, end.y);
      if (d < bestDist || (d === bestDist && data.cost < bestCost)) {
        bestDist = d;
        bestCost = data.cost;
        bestKey = key;
      }
    }

    if (bestKey && bestDist < dist) {
      const best = reachable.get(bestKey)!;
      return { path: best.path, metersSpent: best.cost };
    }
  }

  return { path: goblinPath, metersSpent };
}

export function evaluateReactionSkill(
  skill: ReactionSkill,
  combatState: CombatState,
  character: CharacterState
): ReactionEvaluation {
  const hasEnergy = combatState.player.ep >= skill.epCost;
  const hasWeapon = !skill.requiresWeapon || character.equippedWeapon !== null;
  const dist = getDistance(
    combatState.player.x,
    combatState.player.y,
    combatState.enemy.x,
    combatState.enemy.y
  );
  const weaponRange = character.equippedWeapon ? character.equippedWeapon.rangeCells : 0;
  const inRange =
    !skill.requiresAttackRange || (character.equippedWeapon !== null && dist <= weaponRange);
  const notStunned = combatState.player.stunnedTurns <= 0;

  return {
    canUse: hasEnergy && hasWeapon && inRange && notStunned,
    checks: { hasEnergy, hasWeapon, inRange, notStunned },
  };
}

export function createInitialCombatState(character: CharacterState): CombatState {
  const maxHp = getMaxHp(character);
  const maxMp = getMaxMp(character);
  const maxEp = getMaxEp(character);

  const playerRoll = Math.floor(Math.random() * 20) + 1;
  const playerTotalInit = playerRoll + character.attributes.dexterity;

  const goblinDex = 2;
  const goblinRoll = Math.floor(Math.random() * 20) + 1;
  const goblinTotalInit = goblinRoll + goblinDex;

  return {
    player: {
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      ep: maxEp,
      maxEp,
      arcaneShield: 0,
      arcaneShieldMax: 0,
      x: 2,
      y: 5,
      initiative: playerTotalInit,
      initiativeRoll: playerRoll,
      hasMoved: false,
      hasActed: false,
      stunnedTurns: 0,
      beyondLimitUsed: false,
      beyondLimitTurns: 0,
      greenBloodTriggered: false,
      greenBloodTurns: 0,
      rigidSkinDoubledLogged: false,
    },
    enemy: {
      name: 'Goblin Espadachim',
      hp: 40,
      maxHp: 40,
      ep: 100,
      maxEp: 100,
      dmg: 2,
      magicDamage: 0,
      physicalDefense: 1,
      magicDefense: 0,
      critChance: BASE_CRIT_CHANCE,
      critDamageBonus: CRIT_DAMAGE_BONUS_PCT,
      evasionChance: BASE_EVASION_CHANCE,
      hitChance: BASE_HIT_CHANCE,
      attackName: 'Golpe de Espada Curta',
      heavyBlowCooldown: 0,
      skills: {
        heavyBlow: {
          id: 'heavy_blow',
          name: 'Golpe Pesado',
          epCost: 25,
          bonusAttack: 4,
          pushMeters: 6.0,
          stunRounds: 1,
          cooldown: 3,
        },
      },
      dexterity: goblinDex,
      x: 13,
      y: 5,
      initiative: goblinTotalInit,
      initiativeRoll: goblinRoll,
      stunnedTurns: 0,
      tauntedTurns: 0,
      tauntedBy: null,
    },
    isActive: true,
    outcome: 'ongoing',
    isMoveModeActive: false,
    isFireBreathModeActive: false,
    isAnimatingMove: false,
    awaitingReaction: false,
    pendingAttack: null,
    currentTurn: playerTotalInit >= goblinTotalInit ? 'player' : 'enemy',
    round: 1,
  };
}
