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
  EnemyFacing,
  EnemyId,
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
const slimeMotherArtImg = resolveImageAsset(
  'boss_slime_mother_1795267714359.jpg',
  'goblin-art.png'
);
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

// Knight Portraits (4 races x 2 genders)
const portraitKnightHumanMImg = resolveImageAsset(
  'knight_human_m_1795255480181.jpg',
  'hero_warrior_valerius_1795088249220.jpg'
);
const portraitKnightHumanFImg = resolveImageAsset(
  'knight_human_f_1795255480271.jpg',
  'portrait_human_shieldmaiden_1795093741610.jpg'
);
const portraitKnightElfMImg = resolveImageAsset(
  'knight_elf_m_1795255480517.jpg',
  'portrait_high_elf_warrior_1795093741297.jpg'
);
const portraitKnightElfFImg = resolveImageAsset(
  'knight_elf_f_1795255480273.jpg',
  'portrait_high_elf_warrior_f_1795097606341.jpg'
);
const portraitKnightDwarfMImg = resolveImageAsset(
  'knight_dwarf_m_1795255480409.jpg',
  'portrait_dwarf_ironclad_1795093741247.jpg'
);
const portraitKnightDwarfFImg = resolveImageAsset(
  'knight_dwarf_f_1795255480046.jpg',
  'portrait_dwarf_woman_warrior_1795097641470.jpg'
);
const portraitKnightDryadMImg = resolveImageAsset(
  'knight_dryad_m_1795255480274.jpg',
  'portrait_dryad_warrior_m_1795097606457.jpg'
);
const portraitKnightDryadFImg = resolveImageAsset(
  'knight_dryad_f_1795255480488.jpg',
  'portrait_dryad_warden_1795093740540.jpg'
);

// Priest Portraits (4 races x 2 genders)
const portraitPriestHumanMImg = resolveImageAsset(
  'priest_human_m_1795258515545.jpg',
  'portrait_human_mage_male.jpg'
);
const portraitPriestHumanFImg = resolveImageAsset(
  'priest_human_f_1795258514128.jpg',
  'portrait_human_mage_f_1795097606578.jpg'
);
const portraitPriestElfMImg = resolveImageAsset(
  'priest_elf_m_1795258514091.jpg',
  'portrait_high_elf_mage_m_1795097606699.jpg'
);
const portraitPriestElfFImg = resolveImageAsset(
  'priest_elf_f_1795258514646.jpg',
  'portrait_high_elf_mage_female.jpg'
);
const portraitPriestDwarfMImg = resolveImageAsset(
  'priest_dwarf_m_1795258515411.jpg',
  'portrait_dwarf_mage_male.jpg'
);
const portraitPriestDwarfFImg = resolveImageAsset(
  'priest_dwarf_f_1795258514155.jpg',
  'portrait_dwarf_woman_mage_1795097640311.jpg'
);
const portraitPriestDryadMImg = resolveImageAsset(
  'priest_dryad_m_1795258514944.jpg',
  'portrait_dryad_mage_m_1795097610314.jpg'
);
const portraitPriestDryadFImg = resolveImageAsset(
  'priest_dryad_f_1795258515265.jpg',
  'portrait_dryad_mage_female.jpg'
);

// Rogue Portraits (4 races x 2 genders)
const portraitRogueHumanMImg = resolveImageAsset(
  'rogue_human_m_1795260512944.jpg',
  'hero_warrior_valerius_1795088249220.jpg'
);
const portraitRogueHumanFImg = resolveImageAsset(
  'rogue_human_f_1795260512471.jpg',
  'portrait_human_shieldmaiden_1795093741610.jpg'
);
const portraitRogueElfMImg = resolveImageAsset(
  'rogue_elf_m_1795260513421.jpg',
  'portrait_high_elf_warrior_1795093741297.jpg'
);
const portraitRogueElfFImg = resolveImageAsset(
  'rogue_elf_f_1795260512882.jpg',
  'portrait_high_elf_warrior_f_1795097606341.jpg'
);
const portraitRogueDwarfMImg = resolveImageAsset(
  'rogue_dwarf_m_1795260511889.jpg',
  'portrait_dwarf_ironclad_1795093741247.jpg'
);
const portraitRogueDwarfFImg = resolveImageAsset(
  'rogue_dwarf_f_1795260512240.jpg',
  'portrait_dwarf_woman_warrior_1795097641470.jpg'
);
const portraitRogueDryadMImg = resolveImageAsset(
  'rogue_dryad_m_1795260512473.jpg',
  'portrait_dryad_warrior_m_1795097606457.jpg'
);
const portraitRogueDryadFImg = resolveImageAsset(
  'rogue_dryad_f_1795260512595.jpg',
  'portrait_dryad_warden_1795093740540.jpg'
);

export const HERO_PORTRAIT_URL = heroWarriorValeriusImg;
export const GOBLIN_PORTRAIT_URL = goblinArtImg;
export const SLIME_MOTHER_PORTRAIT_URL = slimeMotherArtImg;
export const SLIME_MINION_PORTRAIT_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#17381f"/>
        <stop offset="100%" stop-color="#07120a"/>
      </radialGradient>
      <radialGradient id="ooze" cx="42%" cy="32%" r="64%">
        <stop offset="0%" stop-color="#bef264"/>
        <stop offset="48%" stop-color="#4ade80"/>
        <stop offset="85%" stop-color="#15803d"/>
        <stop offset="100%" stop-color="#0f3d1e"/>
      </radialGradient>
      <radialGradient id="core" cx="50%" cy="55%" r="45%">
        <stop offset="0%" stop-color="#d9f99d" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="120" height="120" fill="url(#bg)"/>
    <ellipse cx="60" cy="96" rx="38" ry="11" fill="#052e16" opacity="0.85"/>
    <path d="M22 86 C20 56, 36 28, 60 28 C84 28, 100 56, 98 86 C97 96, 82 100, 60 100 C38 100, 23 96, 22 86 Z" fill="url(#ooze)" stroke="#86efac" stroke-width="2.5"/>
    <ellipse cx="60" cy="68" rx="26" ry="20" fill="url(#core)"/>
    <ellipse cx="44" cy="46" rx="10" ry="6" transform="rotate(-24 44 46)" fill="#ecfccb" opacity="0.65"/>
    <circle cx="80" cy="52" r="4" fill="#d9f99d" opacity="0.45"/>
    <circle cx="36" cy="76" r="3.5" fill="#bef264" opacity="0.5"/>
    <ellipse cx="47" cy="64" rx="5.5" ry="7" fill="#052e16"/>
    <ellipse cx="73" cy="64" rx="5.5" ry="7" fill="#052e16"/>
    <circle cx="48.5" cy="62" r="2.3" fill="#fde047"/>
    <circle cx="74.5" cy="62" r="2.3" fill="#fde047"/>
    <path d="M51 77 Q60 83 69 77" fill="none" stroke="#052e16" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`
)}`;
export const BATTLEGROUND_MAP_URL = mapBattlegroundImg;

export const DEFAULT_WEAPON: Weapon = {
  id: 'iron_longsword',
  name: 'Espada Longa de Ferro',
  rangeCells: 1,
  rangeMeters: 1.5,
  baseMinDamage: 3,
  baseMaxDamage: 4,
};

export const KNIGHT_WEAPON: Weapon = {
  id: 'knight_sword_shield',
  name: 'Espada & Escudo de Cavaleiro',
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

export const PRIEST_GRIMOIRE_WEAPON: Weapon = {
  id: 'sacred_grimoire',
  name: 'Grimório Sagrado',
  rangeCells: 6,
  rangeMeters: 9.0,
  baseMinDamage: 2,
  baseMaxDamage: 3,
};

export const ROGUE_DAGGER_WEAPON: Weapon = {
  id: 'twin_steel_daggers',
  name: 'Adagas Gêmeas de Aço',
  rangeCells: 1,
  rangeMeters: 1.5,
  baseMinDamage: 3,
  baseMaxDamage: 4,
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

  // Cavaleiros (4 raças × 2 gêneros)
  {
    id: 'human_knight_order',
    label: 'Paladino da Bastilha',
    subtitle: 'Escudo heráldico e armadura completa',
    suggestedRaceId: 'human',
    suggestedClassId: 'knight',
    gender: 'male',
    imageUrl: portraitKnightHumanMImg,
  },
  {
    id: 'human_knight_order_f',
    label: 'Cavaleira da Bastilha',
    subtitle: 'Placas douradas e escudo real',
    suggestedRaceId: 'human',
    suggestedClassId: 'knight',
    gender: 'female',
    imageUrl: portraitKnightHumanFImg,
  },
  {
    id: 'high_elf_knight',
    label: 'Cavaleiro do Sol',
    subtitle: 'Aço prateado e escudo élfico dourado',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'knight',
    gender: 'male',
    imageUrl: portraitKnightElfMImg,
  },
  {
    id: 'high_elf_knight_f',
    label: 'Cavaleira do Sol',
    subtitle: 'Couraça élfica e estandarte prateado',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'knight',
    gender: 'female',
    imageUrl: portraitKnightElfFImg,
  },
  {
    id: 'dwarf_knight',
    label: 'Baluarte de Granito',
    subtitle: 'Escudo-torre rúnico e aço da montanha',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'knight',
    gender: 'male',
    imageUrl: portraitKnightDwarfMImg,
  },
  {
    id: 'dwarf_knight_f',
    label: 'Baluarte da Forja',
    subtitle: 'Placas rúnicas e escudo real de ferro',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'knight',
    gender: 'female',
    imageUrl: portraitKnightDwarfFImg,
  },
  {
    id: 'dryad_knight',
    label: 'Cavaleiro do Carvalho',
    subtitle: 'Escudo vivo e couraça de bronze antigo',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'knight',
    gender: 'male',
    imageUrl: portraitKnightDryadMImg,
  },
  {
    id: 'dryad_knight_f',
    label: 'Cavaleira do Carvalho',
    subtitle: 'Armadura de casca viva e escudo dourado',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'knight',
    gender: 'female',
    imageUrl: portraitKnightDryadFImg,
  },

  // Sacerdotes (4 raças × 2 gêneros)
  {
    id: 'human_priest',
    label: 'Clérigo da Catedral',
    subtitle: 'Vestes douradas e grimório sagrado iluminado',
    suggestedRaceId: 'human',
    suggestedClassId: 'priest',
    gender: 'male',
    imageUrl: portraitPriestHumanMImg,
  },
  {
    id: 'human_priest_f',
    label: 'Sacerdotisa da Aurora',
    subtitle: 'Manto clerical marfim e grimório dourado',
    suggestedRaceId: 'human',
    suggestedClassId: 'priest',
    gender: 'female',
    imageUrl: portraitPriestHumanFImg,
  },
  {
    id: 'high_elf_priest',
    label: 'Hierofante Celestial',
    subtitle: 'Vestes élficas solares e tomo de luz',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'priest',
    gender: 'male',
    imageUrl: portraitPriestElfMImg,
  },
  {
    id: 'high_elf_priest_f',
    label: 'Sacerdotisa Celestial',
    subtitle: 'Diadema solar e grimório iluminado',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'priest',
    gender: 'female',
    imageUrl: portraitPriestElfFImg,
  },
  {
    id: 'dwarf_priest',
    label: 'Sacerdote das Runas',
    subtitle: 'Manto rúnico dourado e grimório forjado',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'priest',
    gender: 'male',
    imageUrl: portraitPriestDwarfMImg,
  },
  {
    id: 'dwarf_priest_f',
    label: 'Sacerdotisa da Forja',
    subtitle: 'Tranças ruivas com ouro e grimório sagrado',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'priest',
    gender: 'female',
    imageUrl: portraitPriestDwarfFImg,
  },
  {
    id: 'dryad_priest',
    label: 'Ancião da Luz Viva',
    subtitle: 'Galhada dourada e grimório de madeira viva',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'priest',
    gender: 'male',
    imageUrl: portraitPriestDryadMImg,
  },
  {
    id: 'dryad_priest_f',
    label: 'Sacerdotisa do Bosque',
    subtitle: 'Coroa de folhas douradas e grimório botânico',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'priest',
    gender: 'female',
    imageUrl: portraitPriestDryadFImg,
  },

  // Ladinos (4 raças × 2 gêneros)
  {
    id: 'human_rogue',
    label: 'Sombra das Vielas',
    subtitle: 'Capuz negro, couro escuro e adagas gêmeas',
    suggestedRaceId: 'human',
    suggestedClassId: 'rogue',
    gender: 'male',
    imageUrl: portraitRogueHumanMImg,
  },
  {
    id: 'human_rogue_f',
    label: 'Lâmina da Noite',
    subtitle: 'Manto sombrio, cinto de facas e punhal de aço',
    suggestedRaceId: 'human',
    suggestedClassId: 'rogue',
    gender: 'female',
    imageUrl: portraitRogueHumanFImg,
  },
  {
    id: 'high_elf_rogue',
    label: 'Espectro Prateado',
    subtitle: 'Couro élfico noturno e adagas prateadas',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'rogue',
    gender: 'male',
    imageUrl: portraitRogueElfMImg,
  },
  {
    id: 'high_elf_rogue_f',
    label: 'Assassina do Crepúsculo',
    subtitle: 'Capuz prateado e lâminas silenciosas',
    suggestedRaceId: 'high_elf',
    suggestedClassId: 'rogue',
    gender: 'female',
    imageUrl: portraitRogueElfFImg,
  },
  {
    id: 'dwarf_rogue',
    label: 'Espreitador das Minas',
    subtitle: 'Barba trançada e adagas forjadas em ferro negro',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'rogue',
    gender: 'male',
    imageUrl: portraitRogueDwarfMImg,
  },
  {
    id: 'dwarf_rogue_f',
    label: 'Sabotadora da Rocha',
    subtitle: 'Couro reforçado e punhais de arremesso',
    suggestedRaceId: 'dwarf',
    suggestedClassId: 'rogue',
    gender: 'female',
    imageUrl: portraitRogueDwarfFImg,
  },
  {
    id: 'dryad_rogue',
    label: 'Predador das Raízes',
    subtitle: 'Manto de musgo sombrio e adagas de espinho',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'rogue',
    gender: 'male',
    imageUrl: portraitRogueDryadMImg,
  },
  {
    id: 'dryad_rogue_f',
    label: 'Caçadora da Névoa',
    subtitle: 'Folhagem noturna e lâminas de obsidiana',
    suggestedRaceId: 'dryad',
    suggestedClassId: 'rogue',
    gender: 'female',
    imageUrl: portraitRogueDryadFImg,
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
export const EXECUTIONER_EP_COST = 30;
export const EXECUTIONER_BASE_BONUS_DAMAGE = 5;
export const EXECUTIONER_LOW_HP_BONUS_DAMAGE = 7;
export const EXECUTIONER_LOW_HP_THRESHOLD = 0.5;
export const COUNTER_ATTACK_EP_COST = 15;
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

export const ARCANE_ARMOR_MP_COST = 5;
export const ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS = 5;
export const ARCANE_ARMOR_DURATION_ROUNDS = 2;

export const FIRE_BREATH_MP_COST = 9;
export const FIRE_BREATH_BASE_DAMAGE = 12;
export const FIRE_BREATH_CONE_CELLS = 4; // 6,0m
export const FIRE_BREATH_CONE_METERS = 6.0;
export const FIRE_BREATH_HALF_ANGLE_DEG = 36;

// Knight Skill Constants
export const KNIGHT_TAUNT_EP_COST = TAUNT_EP_COST + 5; // 35 EP
export const KNIGHT_TAUNT_DEFENSE_BONUS = 3; // +3 Def. Física e +3 Def. Mágica contra o provocado
export const RAISE_GUARD_EP_COST = 25;
export const RAISE_GUARD_PHYSICAL_DEFENSE_BONUS = 5;
export const GALLANT_CHARGE_EP_COST = 30;
export const GALLANT_CHARGE_RANGE_CELLS = 6; // 9,0m
export const GALLANT_CHARGE_RANGE_METERS = 9.0;
export const GALLANT_CHARGE_BONUS_DAMAGE = 5;

// Priest Skill Constants
export const PRIEST_BASIC_EP_COST = 30;
export const PRIEST_BASIC_RANGE_CELLS = 6; // 9,0m
export const PRIEST_BASIC_RANGE_METERS = 9.0;

export const RESTORING_LIGHT_MP_COST = 4;
export const RESTORING_LIGHT_BASE_HEAL = 10;
export const RESTORING_LIGHT_HEAL_UPGRADE_MP = 2;
export const RESTORING_LIGHT_HEAL_UPGRADE_BONUS = 5;
export const RESTORING_LIGHT_REGEN_UPGRADE_MP = 3;
export const RESTORING_LIGHT_REGEN_HEAL_PER_TURN = 3;
export const RESTORING_LIGHT_REGEN_ROUNDS = 2;

export const CONSECRATION_MP_COST = 7;
export const CONSECRATION_HEAL = 10;
export const CONSECRATION_CAST_RANGE_CELLS = 4; // 6,0m
export const CONSECRATION_CAST_RANGE_METERS = 6.0;
export const CONSECRATION_RADIUS_METERS = 4.0;

export const SACRED_PROTECTION_MP_COST = 5;
export const SACRED_PROTECTION_SHIELD_HP = 15;
export const SACRED_PROTECTION_DURATION_ROUNDS = 1;

// Rogue Skill Constants
export const DAGGER_THROW_EP_COST = 20;
export const DAGGER_THROW_BONUS_DAMAGE = 4;
export const DAGGER_THROW_RANGE_CELLS = 4; // 6,0m
export const DAGGER_THROW_RANGE_METERS = 6.0;
export const DAGGER_THROW_BLEED_DAMAGE = 3;
export const DAGGER_THROW_BLEED_ROUNDS = 3;

export const STEALTH_EP_COST = 20;
export const STEALTH_DURATION_ROUNDS = 2;
export const STEALTH_BONUS_DAMAGE = 5;
export const STEALTH_EXTRA_DAMAGE_TAKEN = 5;
export const STEALTH_DETECTION_CHANCE = 50;

export const SPRINT_EP_COST = 15;

export const LETHALITY_EP_COST = 35;
export const LETHALITY_CRIT_CHANCE = 50;
export const LETHALITY_STEALTH_CRIT_DMG_BONUS = 25;

export const BASE_CRIT_CHANCE = 1;
export const CRIT_DAMAGE_BONUS_PCT = 50;
export const BASE_EVASION_CHANCE = 1;
export const BASE_HIT_CHANCE = 90;

// Boss: Slime Mãe Constants
export const SLIME_MOTHER_MAX_HP = 400;
export const SLIME_MOTHER_MAX_MP = 35;
export const SLIME_MOTHER_MOVE_METERS = 9.0;
export const SLIME_MOTHER_SIZE_CELLS = 2; // Grande: ocupa 2x2 (4 espaços)
export const SLIME_MOTHER_BASIC_DAMAGE = 6; // Ataque padrão escalado com Força 5
export const SLIME_MOTHER_POISON_CHANCE = 10; // 10% de chance
export const SLIME_MOTHER_POISON_HP_PCT = 0.01; // 1% da vida do alvo
export const SLIME_MOTHER_POISON_ROUNDS = 2;
export const SLIME_MOTHER_TANK_BUSTER_HP_PCT = 0.8; // 80% da vida do alvo
export const SLIME_MOTHER_TANK_BUSTER_COOLDOWN = 5;
export const SLIME_MOTHER_TANK_BUSTER_CHASE_MULTIPLIER = 2; // Dobro de deslocamento se o alvo se afastar
export const SLIME_MOTHER_SUMMON_CHANCE = 25; // 25% por turno de invocar Slime Pequena
export const SLIME_MOTHER_MAX_MINIONS = 3;
export const SLIME_MOTHER_LEAP_RANGE_METERS = 6.0;
export const SLIME_MOTHER_LEAP_RANGE_CELLS = 4;
export const SLIME_MOTHER_LEAP_AOE_RADIUS_METERS = 6.0;
export const SLIME_MOTHER_LEAP_PHYSICAL_DAMAGE = 5;
export const SLIME_MOTHER_LEAP_MAGIC_DAMAGE = 5;
export const SLIME_MOTHER_LEAP_POISON_CHANCE = 15;
export const SLIME_MOTHER_LEAP_COOLDOWN = 3;

export const SMALL_SLIME_MAX_HP = 35;
export const SMALL_SLIME_MAX_MP = 15;
export const SMALL_SLIME_MAX_EP = 60;
export const SMALL_SLIME_MOVE_METERS = 6.0;
export const SMALL_SLIME_BASIC_DAMAGE = 3;
export const SMALL_SLIME_POISON_CHANCE = 10;
export const SMALL_SLIME_SPIT_MP_COST = 5;
export const SMALL_SLIME_SPIT_RANGE_CELLS = 3; // 4,5m
export const SMALL_SLIME_SPIT_DAMAGE = 3;
export const SMALL_SLIME_SPIT_POISON_CHANCE = 15;
export const SMALL_SLIME_SPIT_COOLDOWN = 2;

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
    startingSkills: ['Golpe Duplo', 'Carrasco', 'Contra-Ataque'],
    skillSummaries: [
      {
        id: 'double_strike',
        name: 'Golpe Duplo',
        costLabel: '30 EP',
        rangeLabel: '1,5m',
        description: 'Desfere dois ataques físicos consecutivos com a espada equipada no mesmo turno.',
      },
      {
        id: 'executioner',
        name: 'Carrasco',
        costLabel: '30 EP',
        rangeLabel: '1,5m · +5 / +7 Dano',
        description:
          'Ataque poderoso causando o dano do ataque básico +5 de dano bônus. Se o inimigo estiver com 50% de vida ou menos, o bônus aumenta para +7.',
      },
      {
        id: 'counter_attack',
        name: 'Contra-Ataque',
        costLabel: '15 EP · Reação',
        rangeLabel: '1,5m · 50% Dano',
        description:
          'Ao sofrer um ataque inimigo, desfere um ataque básico contra o alvo causando metade do dano.',
      },
    ],
  },
  mage: {
    id: 'mage',
    name: 'Mago',
    tagline: 'Canalizador de mana pura, armadura rúnica e chamas devastadoras',
    roleLabel: 'Conjurador Arcano',
    baseVitals: {
      hp: 8,
      mp: 15,
      ep: 100,
    },
    basicAttackName: 'Golpe Básico',
    basicAttackDescription:
      'Ataque físico corpo a corpo (1,5m · 15 EP) que causa dano igual a Força + Dano Físico.',
    startingWeapon: MAGE_STAFF_WEAPON,
    startingSkills: ['Seta Arcana', 'Armadura Arcana', 'Baforada de Fogo'],
    skillSummaries: [
      {
        id: 'arcane_bolt',
        name: 'Seta Arcana',
        costLabel: '3 MP (+2 MP = 2 setas)',
        rangeLabel: '9,0m',
        description:
          'Dispara seta de mana pura causando 5 + Dano Mágico. Com +2 de Mana (total 5 MP), dispara 2 setas com metade do dano em cada seta.',
      },
      {
        id: 'arcane_armor',
        name: 'Armadura Arcana',
        costLabel: '5 MP',
        rangeLabel: 'Pessoal · 2 rodadas',
        description:
          'Conjura placas de mana sobre si mesmo, concedendo +5 de Defesa Física por 2 rodadas.',
      },
      {
        id: 'fire_breath',
        name: 'Baforada de Fogo',
        costLabel: '9 MP',
        rangeLabel: 'Cone 6,0m',
        description:
          'Projeta um cone flamejante de 6 metros a partir de você, causando 12 + Dano Mágico de fogo na área.',
      },
    ],
  },
  knight: {
    id: 'knight',
    name: 'Cavaleiro',
    tagline: 'Muralha de aço, escudo erguido e investidas que rompem a linha inimiga',
    roleLabel: 'Guardião de Vanguarda',
    baseVitals: {
      hp: 20,
      mp: 5,
      ep: 100,
    },
    basicAttackName: 'Golpe Simples',
    basicAttackDescription:
      'Ataque físico corpo a corpo (1,5m) com a espada equipada (15 EP). Pode causar acerto crítico (+50%).',
    startingWeapon: KNIGHT_WEAPON,
    startingSkills: ['Provocar', 'Levantar Guarda', 'Investida Galante'],
    skillSummaries: [
      {
        id: 'knight_taunt',
        name: 'Provocar',
        costLabel: '35 EP',
        rangeLabel: '6,0m · 1 alvo',
        description:
          'Obriga 1 inimigo a atacar você por 2 rodadas e concede +3 de Defesa Física e +3 de Defesa Mágica contra o inimigo enquanto o Provocar estiver ativo.',
      },
      {
        id: 'raise_guard',
        name: 'Levantar Guarda',
        costLabel: '25 EP · Reação',
        rangeLabel: 'Pessoal',
        description:
          'Ergue a guarda em reação contra um ataque inimigo, concedendo +5 de Defesa Física contra o próximo golpe.',
      },
      {
        id: 'gallant_charge',
        name: 'Investida Galante',
        costLabel: '30 EP',
        rangeLabel: 'Ataque · Linha reta 9,0m',
        description:
          'Avança em linha reta até 9 metros em uma direção, podendo atravessar inimigos, e desfere um golpe com +5 de Ataque Físico durante a investida.',
      },
    ],
  },
  priest: {
    id: 'priest',
    name: 'Sacerdote',
    tagline: 'Portador do grimório sagrado, cura restauradora e escudos de luz divina',
    roleLabel: 'Curandeiro & Suporte Divino',
    baseVitals: {
      hp: 12,
      mp: 10,
      ep: 100,
    },
    basicAttackName: 'Raio Divino',
    basicAttackDescription:
      'Dispara um leve feixe de energia divina pelo grimório (9,0m · 30 EP), causando dano mágico (Grimório + Dano Mágico).',
    startingWeapon: PRIEST_GRIMOIRE_WEAPON,
    startingSkills: ['Luz Restauradora', 'Consagração', 'Proteção Sagrada'],
    skillSummaries: [
      {
        id: 'restoring_light',
        name: 'Luz Restauradora',
        costLabel: '4 MP (+2/+3 MP)',
        rangeLabel: 'Alvo · Cura',
        description:
          'Cura 10 de HP do alvo (escala com Sabedoria: +1 cura flat/3 pts). Aprimoramentos: +2 MP aumenta a cura em +5 HP; +3 MP concede Regeneração (+3 HP no início do turno por 2 rodadas).',
      },
      {
        id: 'consecration',
        name: 'Consagração',
        costLabel: '7 MP',
        rangeLabel: '6,0m · Raio 4,0m',
        description:
          'Consagra uma área de 4 metros de raio a até 6 metros de distância, curando 10 pontos de vida no interior do círculo (+1 cura flat/3 pts de Sabedoria).',
      },
      {
        id: 'sacred_protection',
        name: 'Proteção Sagrada',
        costLabel: '5 MP',
        rangeLabel: 'Alvo · 1 rodada',
        description:
          'Concede um escudo divino de 15 pontos de sobrevida ao alvo durante 1 rodada.',
      },
    ],
  },
  rogue: {
    id: 'rogue',
    name: 'Ladino',
    tagline: 'Assassino das sombras, mobilidade extrema, sangramento e golpes letais pelas costas',
    roleLabel: 'Assassino & Infiltrador',
    baseVitals: {
      hp: 16,
      mp: 5,
      ep: 100,
    },
    basicAttackName: 'Golpe Simples',
    basicAttackDescription:
      'Ataque físico corpo a corpo (1,5m · 15 EP) com as adagas. Enquanto invisível, causa +5 de dano físico adicional e encerra a furtividade.',
    startingWeapon: ROGUE_DAGGER_WEAPON,
    startingSkills: ['Arremesso de Adaga', 'Furtividade', 'Disparada', 'Letalidade'],
    skillSummaries: [
      {
        id: 'dagger_throw',
        name: 'Arremesso de Adaga',
        costLabel: '20 EP',
        rangeLabel: '6,0m · +4 Dano · Sangramento',
        description:
          'Lança uma adaga causando dano físico padrão +4 e Sangramento (3 de dano por rodada durante 3 rodadas; o sangramento não causa acerto crítico).',
      },
      {
        id: 'stealth',
        name: 'Furtividade',
        costLabel: '20 EP',
        rangeLabel: 'Pessoal · 2 rodadas',
        description:
          'Fica invisível por 2 rodadas (mantendo deslocamento normal): inimigos têm 50% de chance de perceber sua presença. Seu próximo ataque básico causa +5 de dano físico, mas você sofre +5 de dano extra enquanto invisível. Atacar encerra a invisibilidade.',
      },
      {
        id: 'sprint',
        name: 'Disparada',
        costLabel: '15 EP',
        rangeLabel: 'Movimento · 2×',
        description:
          'Permite andar até o dobro do deslocamento (12,0m) neste turno sem consumir sua Ação Padrão.',
      },
      {
        id: 'lethality',
        name: 'Letalidade',
        costLabel: '35 EP',
        rangeLabel: '1,5m · Costas · +Des.',
        description:
          'Usável apenas nas costas do inimigo: desfere um ataque somando sua Destreza ao dano, com 50% de chance crítica. Se estiver invisível, ganha também +25% de dano crítico (+75% total).',
      },
    ],
  },
};

export const CLASS_LIST: ClassDefinition[] = [
  CLASSES.warrior,
  CLASSES.knight,
  CLASSES.rogue,
  CLASSES.mage,
  CLASSES.priest,
];

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
    id: 'executioner',
    name: 'Carrasco',
    epCost: EXECUTIONER_EP_COST,
    bonusDamage: EXECUTIONER_BASE_BONUS_DAMAGE,
    lowHpBonusDamage: EXECUTIONER_LOW_HP_BONUS_DAMAGE,
    lowHpThreshold: EXECUTIONER_LOW_HP_THRESHOLD,
    rangeMeters: 1.5,
    description:
      'Ataque poderoso que causa o dano do ataque básico +5 de dano adicional; se o inimigo estiver com 50% de vida ou menos, o bônus sobe para +7 (alcance 1,5m).',
  },
] as const;

export const REACTION_SKILLS: ReactionSkill[] = [
  {
    id: 'counter_attack',
    name: 'Contra-Ataque',
    epCost: COUNTER_ATTACK_EP_COST,
    requiresWeapon: true,
    requiresAttackRange: true,
    classId: 'warrior',
    description:
      'Ao sofrer um ataque, você desfere um ataque básico contra o alvo causando apenas metade do dano.',
  },
  {
    id: 'raise_guard',
    name: 'Levantar Guarda',
    epCost: RAISE_GUARD_EP_COST,
    requiresWeapon: false,
    requiresAttackRange: false,
    classId: 'knight',
    description:
      'Você ergue o escudo em guarda firme, ganhando +5 de Defesa Física contra o próximo ataque.',
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
    description: 'Aumenta a Mana máxima (+4 MP) e amplia o Dano Mágico (+1/pt).',
    formulaHint: '+4 MP · +1 Dano Mágico',
  },
  {
    key: 'charisma',
    label: 'Carisma',
    description: 'Capacidade social, coerção, manipulação e descontos com mercadores e taverneiros.',
  },
  {
    key: 'wisdom',
    label: 'Sabedoria',
    description:
      'A cada 3 pontos concede +1 de Cura flat; a cada 2 pontos concede +1 Dano Mágico e +1 Defesa Mágica, além de ampliar percepção.',
    formulaHint: '+1 Cura flat/3 pts · +1 Dano Mág. e +1 Def. Mág./2 pts',
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
const VALID_CLASS_IDS: ClassId[] = ['warrior', 'mage', 'knight', 'priest', 'rogue'];
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
    Math.floor(character.attributes.wisdom / 2) +
    bonusMagicDamage
  );
}

export function getWisdomHealingBonus(character: CharacterState): number {
  return Math.floor(character.attributes.wisdom / 3);
}

export function getScaledHealAmount(baseHeal: number, character: CharacterState): number {
  return baseHeal + getWisdomHealingBonus(character);
}

export function getArcaneBoltDamage(character: CharacterState, bonusMagicDamage = 0): number {
  return ARCANE_BOLT_BASE_DAMAGE + getMagicDamage(character, bonusMagicDamage);
}

export function getArcaneBoltUpgradedDamage(
  character: CharacterState,
  bonusMagicDamage = 0
): number {
  return Math.max(1, Math.floor(getArcaneBoltDamage(character, bonusMagicDamage) / 2));
}

export function getFireBreathDamage(character: CharacterState, bonusMagicDamage = 0): number {
  return FIRE_BREATH_BASE_DAMAGE + getMagicDamage(character, bonusMagicDamage);
}

// Priest Basic Attack: light divine energy beam from the Grimoire dealing Magical Damage
export function getPriestBasicAttackRange(
  character: CharacterState,
  bonusMagicDamage = 0
): { min: number; max: number } {
  const magic = getMagicDamage(character, bonusMagicDamage);
  if (!character.equippedWeapon) {
    return { min: 1 + magic, max: 1 + magic };
  }
  return {
    min: character.equippedWeapon.baseMinDamage + magic,
    max: character.equippedWeapon.baseMaxDamage + magic,
  };
}

export function getPhysicalDefense(
  character: CharacterState,
  isDwarfLowHp = false,
  bonusPhysicalDefense = 0
): number {
  return (
    Math.floor(character.attributes.constitution / 2) +
    getDwarfDefenseBonus(character, isDwarfLowHp) +
    bonusPhysicalDefense
  );
}

export function getMagicDefense(
  character: CharacterState,
  isDwarfLowHp = false,
  bonusMagicDefense = 0
): number {
  return (
    Math.floor(character.attributes.wisdom / 2) +
    getDwarfDefenseBonus(character, isDwarfLowHp) +
    bonusMagicDefense
  );
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
  const bonusPhysicalDefense = modifiers?.bonusPhysicalDefense ?? 0;
  const bonusMagicDefense = modifiers?.bonusMagicDefense ?? 0;
  const isDwarfLowHp = modifiers?.isDwarfLowHp ?? false;

  return {
    physicalDamage: getWeaponDamageRange(character, bonusPhysical),
    magicDamage: getMagicDamage(character, bonusMagic),
    physicalDefense: getPhysicalDefense(character, isDwarfLowHp, bonusPhysicalDefense),
    magicDefense: getMagicDefense(character, isDwarfLowHp, bonusMagicDefense),
    healingBonus: getWisdomHealingBonus(character),
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

export function rollPriestBasicAttackDamage(
  character: CharacterState,
  bonusMagicDamage = 0
): number {
  const range = getPriestBasicAttackRange(character, bonusMagicDamage);
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
  critDamageBonusPctOverride?: number;
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
  const critBonusPct = params.critDamageBonusPctOverride ?? CRIT_DAMAGE_BONUS_PCT;
  const damageAfterCrit = isCritical
    ? Math.round(params.baseDamage * (1 + critBonusPct / 100))
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

export function getEnemyOccupiedCells(enemyPos: GridPos, sizeCells = 1): GridPos[] {
  const size = Math.max(1, sizeCells);
  const cells: GridPos[] = [];
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      cells.push({ x: enemyPos.x + dx, y: enemyPos.y + dy });
    }
  }
  return cells;
}

export function isEnemyCellAt(
  x: number,
  y: number,
  enemyPos: GridPos,
  sizeCells = 1
): boolean {
  const size = Math.max(1, sizeCells);
  return x >= enemyPos.x && x < enemyPos.x + size && y >= enemyPos.y && y < enemyPos.y + size;
}

export function getDistanceToEnemy(
  from: GridPos,
  enemyPos: GridPos,
  sizeCells = 1
): number {
  const cells = getEnemyOccupiedCells(enemyPos, sizeCells);
  let best = Infinity;
  for (const c of cells) {
    const d = getDistance(from.x, from.y, c.x, c.y);
    if (d < best) best = d;
  }
  return best;
}

export function getDistanceMetersToEnemy(
  from: GridPos,
  enemyPos: GridPos,
  sizeCells = 1
): string {
  return (getDistanceToEnemy(from, enemyPos, sizeCells) * CELL_METERS)
    .toFixed(1)
    .replace('.', ',');
}

export function getNearestEnemyCell(
  from: GridPos,
  enemyPos: GridPos,
  sizeCells = 1
): GridPos {
  const cells = getEnemyOccupiedCells(enemyPos, sizeCells);
  let bestCell = cells[0];
  let bestDist = Infinity;
  let bestEuclid = Infinity;
  for (const c of cells) {
    const d = getDistance(from.x, from.y, c.x, c.y);
    const euclid = Math.hypot(from.x - c.x, from.y - c.y);
    if (d < bestDist || (d === bestDist && euclid < bestEuclid)) {
      bestDist = d;
      bestEuclid = euclid;
      bestCell = c;
    }
  }
  return bestCell;
}

export function getEnemyCenterPx(
  enemyPos: GridPos,
  sizeCells = 1
): { x: number; y: number } {
  const size = Math.max(1, sizeCells);
  return {
    x: (enemyPos.x + size / 2) * CELL_PIXEL_SIZE,
    y: (enemyPos.y + size / 2) * CELL_PIXEL_SIZE,
  };
}

export function isObstacleCell(x: number, y: number): boolean {
  return TACTICAL_OBSTACLES.some((o) => o.x === x && o.y === y);
}

// Enemy facing & backstab geometry for Rogue's Letalidade (left/right matches token sprite orientation)
export function computeFacingToward(
  from: GridPos,
  to: GridPos,
  fallback: EnemyFacing = 'left',
  fromSizeCells = 1
): EnemyFacing {
  const centerX = from.x + (Math.max(1, fromSizeCells) - 1) / 2;
  const dx = to.x - centerX;
  if (dx < -0.001) return 'left';
  if (dx > 0.001) return 'right';
  return fallback === 'right' ? 'right' : 'left';
}

export function getFacingVector(facing: EnemyFacing): GridPos {
  switch (facing) {
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
  }
}

export function isBehindFacing(
  attackerPos: GridPos,
  targetPos: GridPos,
  targetFacing: EnemyFacing,
  targetSizeCells = 1
): boolean {
  const size = Math.max(1, targetSizeCells);
  if (getDistanceToEnemy(attackerPos, targetPos, size) !== 1) {
    return false;
  }
  switch (targetFacing) {
    case 'left':
      return attackerPos.x === targetPos.x + size;
    case 'right':
      return attackerPos.x === targetPos.x - 1;
    case 'up':
      return attackerPos.y === targetPos.y + size;
    case 'down':
      return attackerPos.y === targetPos.y - 1;
  }
}

export function getBackstabCells(
  targetPos: GridPos,
  targetFacing: EnemyFacing,
  targetSizeCells = 1
): GridPos[] {
  const size = Math.max(1, targetSizeCells);
  const cells: GridPos[] = [];
  for (let row = targetPos.y - 1; row <= targetPos.y + size; row++) {
    for (let col = targetPos.x - 1; col <= targetPos.x + size; col++) {
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) continue;
      if (isObstacleCell(col, row)) continue;
      if (isEnemyCellAt(col, row, targetPos, size)) continue;
      if (isBehindFacing({ x: col, y: row }, targetPos, targetFacing, size)) {
        cells.push({ x: col, y: row });
      }
    }
  }
  return cells;
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

// Computes all grid cells inside Consagração's 4.0m circular radius from the chosen center point
export function getConsecrationAreaCells(center: GridPos): GridPos[] {
  const cells: GridPos[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const distMeters = Math.hypot(col - center.x, row - center.y) * CELL_METERS;
      if (distMeters <= CONSECRATION_RADIUS_METERS + 0.05) {
        cells.push({ x: col, y: row });
      }
    }
  }
  return cells;
}

export interface GallantChargeTarget {
  path: GridPos[];
  distanceMeters: number;
  passedThroughEnemy: boolean;
  hitsEnemy: boolean;
}

// Computes all valid straight-line landing cells up to 9.0m (6 cells) in cardinal directions.
// Can pass THROUGH enemies (including 2x2 large bosses), cannot pass through solid obstacles, and cannot stop on an alive enemy cell.
// Strikes the enemy if the charge passes through them OR charges directly up to their front along the same line.
export function getGallantChargeTargets(
  origin: GridPos,
  enemyPos: GridPos,
  enemyAlive: boolean,
  enemySizeCells = 1
): Map<string, GallantChargeTarget> {
  const targets = new Map<string, GallantChargeTarget>();
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  for (const dir of dirs) {
    const linePath: GridPos[] = [{ x: origin.x, y: origin.y }];
    let passedEnemy = false;

    for (let step = 1; step <= GALLANT_CHARGE_RANGE_CELLS; step++) {
      const nx = origin.x + dir.dx * step;
      const ny = origin.y + dir.dy * step;

      if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) break;
      if (isObstacleCell(nx, ny)) break;

      linePath.push({ x: nx, y: ny });

      const isEnemyCell = enemyAlive && isEnemyCellAt(nx, ny, enemyPos, enemySizeCells);
      if (isEnemyCell) {
        passedEnemy = true;
        // Can pass through the enemy cell(s), but cannot end movement occupying any enemy square
        continue;
      }

      const hitsDirectlyAhead =
        enemyAlive && isEnemyCellAt(nx + dir.dx, ny + dir.dy, enemyPos, enemySizeCells);

      targets.set(`${nx},${ny}`, {
        path: [...linePath],
        distanceMeters: step * CELL_METERS,
        passedThroughEnemy: passedEnemy,
        hitsEnemy: passedEnemy || hitsDirectlyAhead,
      });
    }
  }

  return targets;
}

export function getReachableCellsForSize(
  startX: number,
  startY: number,
  maxMeters: number,
  blockedCells: GridPos[],
  sizeCells = 1
): Map<string, ReachableCell> {
  const size = Math.max(1, sizeCells);
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

  const isFootprintValid = (ax: number, ay: number): boolean => {
    if (ax < 0 || ax + size > GRID_COLS || ay < 0 || ay + size > GRID_ROWS) {
      return false;
    }
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const cx = ax + dx;
        const cy = ay + dy;
        if (blockedCells.some((b) => b.x === cx && b.y === cy)) {
          return false;
        }
      }
    }
    return true;
  };

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

      if (newCost <= maxMeters + 0.001 && isFootprintValid(nx, ny)) {
        const key = `${nx},${ny}`;
        if (!minCost.has(key) || newCost < (minCost.get(key) ?? Infinity)) {
          minCost.set(key, newCost);
          parentMap.set(key, curKey);
          queue.push({ x: nx, y: ny, cost: newCost });
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

export function getReachableCells(
  startX: number,
  startY: number,
  maxMeters: number,
  blockedCells: GridPos[]
): Map<string, ReachableCell> {
  return getReachableCellsForSize(startX, startY, maxMeters, blockedCells, 1);
}

export function calculateKnockbackTrajectory(
  attackerPos: GridPos,
  targetPos: GridPos,
  pushMeters: number,
  attackerSizeCells = 1
): { path: GridPos[]; metersPushed: number; hitObstacle: boolean } {
  const nearestAttacker = getNearestEnemyCell(targetPos, attackerPos, attackerSizeCells);
  const stepX = Math.sign(targetPos.x - nearestAttacker.x);
  const stepY = Math.sign(targetPos.y - nearestAttacker.y);

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
      isObstacleCell(nx, ny) || isEnemyCellAt(nx, ny, attackerPos, attackerSizeCells);

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

export function computeEnemyMove(
  enemyPos: GridPos,
  playerPos: GridPos,
  maxMeters = MAX_MOVE_METERS,
  sizeCells = 1,
  extraBlockedCells: GridPos[] = []
): { path: GridPos[]; metersSpent: number } {
  const size = Math.max(1, sizeCells);
  const startDist = getDistanceToEnemy(playerPos, enemyPos, size);
  if (startDist <= 1) {
    return { path: [{ ...enemyPos }], metersSpent: 0 };
  }

  const blocked = [...TACTICAL_OBSTACLES, playerPos, ...extraBlockedCells];
  const reachable = getReachableCellsForSize(enemyPos.x, enemyPos.y, maxMeters, blocked, size);
  let bestKey: string | null = null;
  let bestDist = startDist;
  let bestEuclidean = Math.hypot(
    playerPos.x - (enemyPos.x + (size - 1) / 2),
    playerPos.y - (enemyPos.y + (size - 1) / 2)
  );
  let bestCost = Infinity;

  for (const [key, data] of reachable.entries()) {
    const end = data.path[data.path.length - 1];
    const d = getDistanceToEnemy(playerPos, end, size);
    const euclid = Math.hypot(
      playerPos.x - (end.x + (size - 1) / 2),
      playerPos.y - (end.y + (size - 1) / 2)
    );
    const isStrictlyCloser =
      d < bestDist ||
      (d === bestDist && euclid < bestEuclidean - 1e-6) ||
      (d === bestDist && Math.abs(euclid - bestEuclidean) <= 1e-6 && data.cost < bestCost);

    if (isStrictlyCloser) {
      bestDist = d;
      bestEuclidean = euclid;
      bestCost = data.cost;
      bestKey = key;
    }
  }

  if (bestKey) {
    const best = reachable.get(bestKey)!;
    return { path: best.path, metersSpent: best.cost };
  }

  return { path: [{ ...enemyPos }], metersSpent: 0 };
}

export function computeGoblinMove(
  enemyPos: GridPos,
  playerPos: GridPos
): { path: GridPos[]; metersSpent: number } {
  return computeEnemyMove(enemyPos, playerPos, MAX_MOVE_METERS, 1);
}

// Computes all grid cells within a radiusMeters AoE measured from the boss's occupied footprint
export function getSlimeLeapSlamAreaCells(
  landingPos: GridPos,
  sizeCells = SLIME_MOTHER_SIZE_CELLS,
  radiusMeters = SLIME_MOTHER_LEAP_AOE_RADIUS_METERS
): GridPos[] {
  const cells: GridPos[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const nearest = getNearestEnemyCell({ x: col, y: row }, landingPos, sizeCells);
      const distMeters = Math.hypot(col - nearest.x, row - nearest.y) * CELL_METERS;
      if (distMeters <= radiusMeters + 0.05) {
        cells.push({ x: col, y: row });
      }
    }
  }
  return cells;
}

export function isCellInSlimeLeapAoE(
  targetCell: GridPos,
  landingPos: GridPos,
  sizeCells = SLIME_MOTHER_SIZE_CELLS,
  radiusMeters = SLIME_MOTHER_LEAP_AOE_RADIUS_METERS
): boolean {
  const nearest = getNearestEnemyCell(targetCell, landingPos, sizeCells);
  const distMeters = Math.hypot(targetCell.x - nearest.x, targetCell.y - nearest.y) * CELL_METERS;
  return distMeters <= radiusMeters + 0.05;
}

// Finds the best landing position for Salto Gosmento:
// If player is already within the 6.0m AoE from current position, leaps in place (same spot!).
// Otherwise leaps up to 6.0m to a valid 2x2 landing spot so the 6.0m AoE slam hits the player.
export function computeSlimeLeapLanding(
  bossPos: GridPos,
  playerPos: GridPos,
  blockedCells: GridPos[],
  sizeCells = SLIME_MOTHER_SIZE_CELLS,
  leapRangeMeters = SLIME_MOTHER_LEAP_RANGE_METERS,
  aoeRadiusMeters = SLIME_MOTHER_LEAP_AOE_RADIUS_METERS
): { landingPos: GridPos; didRelocate: boolean; leapMeters: number } | null {
  if (isCellInSlimeLeapAoE(playerPos, bossPos, sizeCells, aoeRadiusMeters)) {
    return { landingPos: { ...bossPos }, didRelocate: false, leapMeters: 0 };
  }

  const size = Math.max(1, sizeCells);
  const isFootprintFree = (ax: number, ay: number): boolean => {
    if (ax < 0 || ax + size > GRID_COLS || ay < 0 || ay + size > GRID_ROWS) return false;
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const cx = ax + dx;
        const cy = ay + dy;
        if (isObstacleCell(cx, cy)) return false;
        if (cx === playerPos.x && cy === playerPos.y) return false;
        if (blockedCells.some((b) => b.x === cx && b.y === cy)) return false;
      }
    }
    return true;
  };

  let best: { landingPos: GridPos; leapMeters: number; distToPlayer: number } | null = null;
  for (let ay = 0; ay <= GRID_ROWS - size; ay++) {
    for (let ax = 0; ax <= GRID_COLS - size; ax++) {
      const leapMeters = Math.hypot(ax - bossPos.x, ay - bossPos.y) * CELL_METERS;
      if (leapMeters > leapRangeMeters + 0.05) continue;
      if (!isFootprintFree(ax, ay)) continue;
      if (!isCellInSlimeLeapAoE(playerPos, { x: ax, y: ay }, size, aoeRadiusMeters)) continue;

      const distToPlayer = Math.hypot(
        playerPos.x - (ax + (size - 1) / 2),
        playerPos.y - (ay + (size - 1) / 2)
      );
      if (
        !best ||
        distToPlayer < best.distToPlayer - 1e-4 ||
        (Math.abs(distToPlayer - best.distToPlayer) <= 1e-4 && leapMeters < best.leapMeters)
      ) {
        best = { landingPos: { x: ax, y: ay }, leapMeters, distToPlayer };
      }
    }
  }

  if (!best) return null;
  return {
    landingPos: best.landingPos,
    didRelocate: best.landingPos.x !== bossPos.x || best.landingPos.y !== bossPos.y,
    leapMeters: Math.round(best.leapMeters * 10) / 10,
  };
}

// Finds a free cell adjacent to the Slime Mãe 2x2 footprint to spawn a Slime Pequena
export function findSlimeSummonCell(
  bossPos: GridPos,
  bossSizeCells: number,
  blockedCells: GridPos[],
  playerPos: GridPos
): GridPos | null {
  const size = Math.max(1, bossSizeCells);
  const candidates: GridPos[] = [];
  for (let row = bossPos.y - 1; row <= bossPos.y + size; row++) {
    for (let col = bossPos.x - 1; col <= bossPos.x + size; col++) {
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) continue;
      if (isEnemyCellAt(col, row, bossPos, size)) continue;
      if (isObstacleCell(col, row)) continue;
      if (col === playerPos.x && row === playerPos.y) continue;
      if (blockedCells.some((b) => b.x === col && b.y === row)) continue;
      candidates.push({ x: col, y: row });
    }
  }
  if (candidates.length === 0) return null;
  // Prefer cells closest to the player so the summoned slime immediately pressures the hero
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - playerPos.x, a.y - playerPos.y) -
      Math.hypot(b.x - playerPos.x, b.y - playerPos.y)
  );
  return candidates[0];
}

export function createSmallSlimeMinion(
  instanceNumber: number,
  spawnPos: GridPos,
  facing: EnemyFacing
): import('./types').CombatMinion {
  return {
    instanceId: `small_slime_${Date.now()}_${instanceNumber}_${Math.floor(Math.random() * 1000)}`,
    name: `Slime Pequena #${instanceNumber}`,
    portraitUrl: SLIME_MINION_PORTRAIT_URL,
    hp: SMALL_SLIME_MAX_HP,
    maxHp: SMALL_SLIME_MAX_HP,
    mp: SMALL_SLIME_MAX_MP,
    maxMp: SMALL_SLIME_MAX_MP,
    ep: SMALL_SLIME_MAX_EP,
    maxEp: SMALL_SLIME_MAX_EP,
    moveMeters: SMALL_SLIME_MOVE_METERS,
    attributes: {
      strength: 2,
      constitution: 2,
      dexterity: 4,
      intelligence: 1,
      charisma: 0,
      wisdom: 0,
    },
    dmg: SMALL_SLIME_BASIC_DAMAGE,
    magicDamage: SMALL_SLIME_SPIT_DAMAGE,
    physicalDefense: 1, // CON 2 -> 1 Def. Física
    magicDefense: 0,
    critChance: BASE_CRIT_CHANCE + Math.floor(4 / 2), // DEX 4 -> 3%
    critDamageBonus: CRIT_DAMAGE_BONUS_PCT,
    evasionChance: BASE_EVASION_CHANCE + Math.floor(4 / 2), // DEX 4 -> 3%
    hitChance: BASE_HIT_CHANCE + 4, // DEX 4 -> 94%
    attackName: 'Investida Ácida',
    poisonChance: SMALL_SLIME_POISON_CHANCE,
    poisonDamagePct: SLIME_MOTHER_POISON_HP_PCT,
    poisonRounds: SLIME_MOTHER_POISON_ROUNDS,
    spitName: 'Cuspe Gosmento',
    spitMpCost: SMALL_SLIME_SPIT_MP_COST,
    spitRangeCells: SMALL_SLIME_SPIT_RANGE_CELLS,
    spitDamage: SMALL_SLIME_SPIT_DAMAGE,
    spitPoisonChance: SMALL_SLIME_SPIT_POISON_CHANCE,
    spitCooldown: 0,
    spitCooldownMax: SMALL_SLIME_SPIT_COOLDOWN,
    x: spawnPos.x,
    y: spawnPos.y,
    facing,
    stunnedTurns: 0,
    tauntedTurns: 0,
    tauntedBy: null,
    tauntedDefenseBonus: 0,
    bleedTurns: 0,
    bleedDamagePerTurn: 0,
  };
}

export function evaluateReactionSkill(
  skill: ReactionSkill,
  combatState: CombatState,
  character: CharacterState
): ReactionEvaluation {
  const hasEnergy = combatState.player.ep >= skill.epCost;
  const hasWeapon = !skill.requiresWeapon || character.equippedWeapon !== null;
  const attackerId = combatState.pendingAttack?.attackerId;
  const attackingMinion =
    attackerId && attackerId !== 'primary'
      ? combatState.minions.find((m) => m.instanceId === attackerId)
      : null;
  const dist = attackingMinion
    ? getDistance(
        combatState.player.x,
        combatState.player.y,
        attackingMinion.x,
        attackingMinion.y
      )
    : getDistanceToEnemy(
        { x: combatState.player.x, y: combatState.player.y },
        { x: combatState.enemy.x, y: combatState.enemy.y },
        combatState.enemy.sizeCells
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

export function createInitialCombatState(
  character: CharacterState,
  enemyId: EnemyId = 'goblin'
): CombatState {
  const maxHp = getMaxHp(character);
  const maxMp = getMaxMp(character);
  const maxEp = getMaxEp(character);

  const playerRoll = Math.floor(Math.random() * 20) + 1;
  const playerTotalInit = playerRoll + character.attributes.dexterity;

  const isSlimeMother = enemyId === 'slime_mother';

  const enemyDex = isSlimeMother ? 3 : 2;
  const enemyRoll = Math.floor(Math.random() * 20) + 1;
  const enemyTotalInit = enemyRoll + enemyDex;

  const enemyState = isSlimeMother
    ? {
        id: 'slime_mother' as EnemyId,
        name: 'Slime Mãe',
        title: 'Chefe Abissal · Grande (2×2)',
        isBoss: true,
        sizeCells: SLIME_MOTHER_SIZE_CELLS,
        portraitUrl: SLIME_MOTHER_PORTRAIT_URL,
        hp: SLIME_MOTHER_MAX_HP,
        maxHp: SLIME_MOTHER_MAX_HP,
        mp: SLIME_MOTHER_MAX_MP,
        maxMp: SLIME_MOTHER_MAX_MP,
        ep: 100,
        maxEp: 100,
        moveMeters: SLIME_MOTHER_MOVE_METERS,
        trueSight: true,
        attributes: {
          strength: 5,
          constitution: 5,
          dexterity: 3,
          intelligence: 0,
          charisma: 0,
          wisdom: 0,
        },
        dmg: SLIME_MOTHER_BASIC_DAMAGE,
        magicDamage: 0,
        physicalDefense: Math.floor(5 / 2), // CON 5 -> 2 Def. Física
        magicDefense: 0,
        critChance: BASE_CRIT_CHANCE + Math.floor(3 / 2), // DEX 3 -> 2%
        critDamageBonus: CRIT_DAMAGE_BONUS_PCT,
        evasionChance: BASE_EVASION_CHANCE + Math.floor(3 / 2), // DEX 3 -> 2%
        hitChance: BASE_HIT_CHANCE + 3, // DEX 3 -> 93%
        attackName: 'Pancada Ácida',
        poisonChance: SLIME_MOTHER_POISON_CHANCE,
        poisonDamagePct: SLIME_MOTHER_POISON_HP_PCT,
        poisonRounds: SLIME_MOTHER_POISON_ROUNDS,
        heavyBlowCooldown: 0,
        tankBusterCooldown: 0,
        tankBusterCharging: false,
        tankBusterTarget: null,
        tankBusterTargetStartPos: null,
        tankBusterStartDist: 0,
        leapSlamCooldown: 0,
        summonChance: SLIME_MOTHER_SUMMON_CHANCE,
        maxMinions: SLIME_MOTHER_MAX_MINIONS,
        skills: {
          tankBuster: {
            id: 'slime_impact',
            name: 'Impacto Gosmento',
            damagePctOfTargetMaxHp: SLIME_MOTHER_TANK_BUSTER_HP_PCT,
            chargeRounds: 1,
            cooldown: SLIME_MOTHER_TANK_BUSTER_COOLDOWN,
            chaseMoveMultiplier: SLIME_MOTHER_TANK_BUSTER_CHASE_MULTIPLIER,
          },
          leapSlam: {
            id: 'slime_leap_slam',
            name: 'Salto Gosmento',
            leapRangeMeters: SLIME_MOTHER_LEAP_RANGE_METERS,
            aoeRadiusMeters: SLIME_MOTHER_LEAP_AOE_RADIUS_METERS,
            physicalDamage: SLIME_MOTHER_LEAP_PHYSICAL_DAMAGE,
            magicDamage: SLIME_MOTHER_LEAP_MAGIC_DAMAGE,
            poisonChance: SLIME_MOTHER_LEAP_POISON_CHANCE,
            cooldown: SLIME_MOTHER_LEAP_COOLDOWN,
          },
        },
        dexterity: enemyDex,
        x: 11,
        y: 4,
        initiative: enemyTotalInit,
        initiativeRoll: enemyRoll,
        stunnedTurns: 0,
        tauntedTurns: 0,
        tauntedBy: null,
        tauntedDefenseBonus: 0,
        facing: 'left' as EnemyFacing,
        bleedTurns: 0,
        bleedDamagePerTurn: 0,
      }
    : {
        id: 'goblin' as EnemyId,
        name: 'Goblin Espadachim',
        title: 'Saqueador de Arena',
        isBoss: false,
        sizeCells: 1,
        portraitUrl: GOBLIN_PORTRAIT_URL,
        hp: 40,
        maxHp: 40,
        mp: 0,
        maxMp: 0,
        ep: 100,
        maxEp: 100,
        moveMeters: MAX_MOVE_METERS,
        trueSight: false,
        attributes: {
          strength: 2,
          constitution: 2,
          dexterity: 2,
          intelligence: 0,
          charisma: 0,
          wisdom: 0,
        },
        dmg: 2,
        magicDamage: 0,
        physicalDefense: 1,
        magicDefense: 0,
        critChance: BASE_CRIT_CHANCE,
        critDamageBonus: CRIT_DAMAGE_BONUS_PCT,
        evasionChance: BASE_EVASION_CHANCE,
        hitChance: BASE_HIT_CHANCE,
        attackName: 'Golpe de Espada Curta',
        poisonChance: 0,
        poisonDamagePct: 0,
        poisonRounds: 0,
        heavyBlowCooldown: 0,
        tankBusterCooldown: 0,
        tankBusterCharging: false,
        tankBusterTarget: null,
        tankBusterTargetStartPos: null,
        tankBusterStartDist: 0,
        leapSlamCooldown: 0,
        summonChance: 0,
        maxMinions: 0,
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
        dexterity: enemyDex,
        x: 13,
        y: 5,
        initiative: enemyTotalInit,
        initiativeRoll: enemyRoll,
        stunnedTurns: 0,
        tauntedTurns: 0,
        tauntedBy: null,
        tauntedDefenseBonus: 0,
        facing: 'left' as EnemyFacing,
        bleedTurns: 0,
        bleedDamagePerTurn: 0,
      };

  return {
    player: {
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      ep: maxEp,
      maxEp,
      arcaneArmorTurns: 0,
      sacredShieldHp: 0,
      sacredShieldTurns: 0,
      regenerationTurns: 0,
      regenerationHealPerTurn: 0,
      poisonTurns: 0,
      poisonDamagePerTurn: 0,
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
      stealthTurns: 0,
      sprintActiveThisTurn: false,
    },
    enemy: enemyState,
    minions: [],
    selectedTargetId: 'primary',
    pendingMinionTurns: [],
    isActive: true,
    outcome: 'ongoing',
    isMoveModeActive: false,
    isFireBreathModeActive: false,
    isGallantChargeModeActive: false,
    isConsecrationModeActive: false,
    isAnimatingMove: false,
    awaitingReaction: false,
    pendingAttack: null,
    currentTurn: playerTotalInit >= enemyTotalInit ? 'player' : 'enemy',
    round: 1,
  };
}
