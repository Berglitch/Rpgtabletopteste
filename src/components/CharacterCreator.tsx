import { useState } from 'react';
import {
  BookOpen,
  Check,
  Crosshair,
  Crown,
  Droplet,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Leaf,
  Minus,
  Plus,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Sun,
  Sword,
  Swords,
  Target,
  Wand2,
  Wind,
  Zap,
} from 'lucide-react';
import {
  APPEARANCE_OPTIONS,
  ARCANE_ARMOR_DURATION_ROUNDS,
  ARCANE_ARMOR_MP_COST,
  ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS,
  ATTRIBUTE_LIST,
  CLASS_LIST,
  CONSECRATION_CAST_RANGE_METERS,
  CONSECRATION_HEAL,
  CONSECRATION_MP_COST,
  CONSECRATION_RADIUS_METERS,
  DAGGER_THROW_BLEED_DAMAGE,
  DAGGER_THROW_BLEED_ROUNDS,
  DAGGER_THROW_BONUS_DAMAGE,
  DAGGER_THROW_EP_COST,
  DAGGER_THROW_RANGE_METERS,
  GALLANT_CHARGE_BONUS_DAMAGE,
  GALLANT_CHARGE_EP_COST,
  GALLANT_CHARGE_RANGE_METERS,
  BANNER_OF_GLORY_CAST_RANGE_METERS,
  BANNER_OF_GLORY_DURATION_ROUNDS,
  BANNER_OF_GLORY_MAGIC_DAMAGE,
  BANNER_OF_GLORY_MP_COST,
  BANNER_OF_GLORY_RADIUS_METERS,
  BANNER_OF_GLORY_SHIELD_HP,
  HIGH_ELF_MP_PER_LEVEL,
  INITIAL_POINTS,
  KNIGHT_TAUNT_DEFENSE_BONUS,
  KNIGHT_TAUNT_EP_COST,
  LETHALITY_CRIT_CHANCE,
  LETHALITY_EP_COST,
  LETHALITY_STEALTH_CRIT_DMG_BONUS,
  PRIEST_BASIC_EP_COST,
  PRIEST_BASIC_RANGE_METERS,
  RACE_LIST,
  RAISE_GUARD_EP_COST,
  RAISE_GUARD_PHYSICAL_DEFENSE_BONUS,
  RESTORING_LIGHT_BASE_HEAL,
  RESTORING_LIGHT_MP_COST,
  SACRED_PROTECTION_MP_COST,
  SACRED_PROTECTION_SHIELD_HP,
  SPRINT_EP_COST,
  STEALTH_BONUS_DAMAGE,
  STEALTH_DETECTION_CHANCE,
  STEALTH_DURATION_ROUNDS,
  STEALTH_EP_COST,
  STEALTH_EXTRA_DAMAGE_TAKEN,
  getAppearanceOption,
  getArcaneBoltDamage,
  getArcaneBoltUpgradedDamage,
  getCharacterPortraitUrl,
  getClassDefinition,
  getDwarfDefenseBonus,
  getFireBreathDamage,
  getGenderLabel,
  getHighElfLevelMpBonus,
  getMageBasicAttackRange,
  getMaxEp,
  getMaxHp,
  getMaxMp,
  getPriestBasicAttackRange,
  getRaceDefinition,
  getScaledHealAmount,
  getSecondaryStats,
  getWeaponDamageRange,
} from '../game/engine';
import type {
  AttributeKey,
  CharacterState,
  ClassDefinition,
  ClassId,
  GenderId,
  RaceDefinition,
  RaceId,
} from '../game/types';
import { PortraitImage } from './PortraitImage';

interface CharacterCreatorProps {
  character: CharacterState;
  onNameChange: (name: string) => void;
  onSelectRace: (raceId: RaceId, autoMatchPortrait: boolean) => void;
  onSelectClass: (classId: ClassId, autoMatchPortrait: boolean) => void;
  onSelectGender: (gender: GenderId) => void;
  onSelectPortrait: (portraitId: string) => void;
  onIncrementAttribute: (attr: AttributeKey) => void;
  onDecrementAttribute: (attr: AttributeKey) => void;
  onResetAttributes: () => void;
  onConfirmCharacter: () => void;
}

const ATTRIBUTE_ICONS: Record<AttributeKey, typeof Swords> = {
  strength: Swords,
  constitution: Shield,
  dexterity: Target,
  intelligence: BookOpen,
  charisma: Crown,
  wisdom: Eye,
};

const RACE_ICONS: Record<RaceId, typeof Flame> = {
  human: Flame,
  high_elf: Sparkles,
  dwarf: Shield,
  dryad: Leaf,
};

const CLASS_ICONS: Record<ClassId, typeof Swords> = {
  warrior: Swords,
  knight: Shield,
  rogue: EyeOff,
  mage: Wand2,
  priest: Sun,
};

export function CharacterCreator({
  character,
  onNameChange,
  onSelectRace,
  onSelectClass,
  onSelectGender,
  onSelectPortrait,
  onIncrementAttribute,
  onDecrementAttribute,
  onResetAttributes,
  onConfirmCharacter,
}: CharacterCreatorProps) {
  const [hasManuallyPickedPortrait, setHasManuallyPickedPortrait] = useState(false);
  const [hoveredRaceId, setHoveredRaceId] = useState<RaceId | null>(null);
  const [hoveredClassId, setHoveredClassId] = useState<ClassId | null>(null);

  const raceDef = getRaceDefinition(character.raceId);
  const classDef = getClassDefinition(character.classId);
  const selectedAppearance = getAppearanceOption(character.portraitId);
  const genderAppearances = APPEARANCE_OPTIONS.filter((opt) => opt.gender === character.gender);
  const portraitUrl = getCharacterPortraitUrl(character);
  const maxHp = getMaxHp(character);
  const maxMp = getMaxMp(character);
  const maxEp = getMaxEp(character);
  const secondary = getSecondaryStats(character);
  const dwarfBonus = getDwarfDefenseBonus(character, false);
  const elfMpBonus = getHighElfLevelMpBonus(character);
  const spentPoints = INITIAL_POINTS - character.unspentPoints;

  const mageBasicRange = getMageBasicAttackRange(character);
  const arcaneBoltDmg = getArcaneBoltDamage(character);
  const arcaneBoltUpgradedDmg = getArcaneBoltUpgradedDamage(character);
  const fireBreathDmg = getFireBreathDamage(character);
  const gallantChargeRange = getWeaponDamageRange(character, GALLANT_CHARGE_BONUS_DAMAGE);
  const daggerThrowRange = getWeaponDamageRange(character, DAGGER_THROW_BONUS_DAMAGE);
  const lethalityRange = getWeaponDamageRange(character, character.attributes.dexterity);
  const priestBasicRange = getPriestBasicAttackRange(character);
  const priestRestoringHeal = getScaledHealAmount(RESTORING_LIGHT_BASE_HEAL, character);
  const priestConsecrationHeal = getScaledHealAmount(CONSECRATION_HEAL, character);

  const dmgText =
    secondary.physicalDamage.min === secondary.physicalDamage.max
      ? `${secondary.physicalDamage.min}`
      : `${secondary.physicalDamage.min}–${secondary.physicalDamage.max}`;

  const gallantChargeText =
    gallantChargeRange.min === gallantChargeRange.max
      ? `${gallantChargeRange.min}`
      : `${gallantChargeRange.min}–${gallantChargeRange.max}`;

  const daggerThrowText =
    daggerThrowRange.min === daggerThrowRange.max
      ? `${daggerThrowRange.min}`
      : `${daggerThrowRange.min}–${daggerThrowRange.max}`;

  const lethalityText =
    lethalityRange.min === lethalityRange.max
      ? `${lethalityRange.min}`
      : `${lethalityRange.min}–${lethalityRange.max}`;

  const priestBasicText =
    priestBasicRange.min === priestBasicRange.max
      ? `${priestBasicRange.min}`
      : `${priestBasicRange.min}–${priestBasicRange.max}`;

  const mageBasicText =
    mageBasicRange.min === mageBasicRange.max
      ? `${mageBasicRange.min}`
      : `${mageBasicRange.min}–${mageBasicRange.max}`;

  const handleRaceClick = (raceId: RaceId) => {
    onSelectRace(raceId, !hasManuallyPickedPortrait);
  };

  const handleClassClick = (classId: ClassId) => {
    onSelectClass(classId, !hasManuallyPickedPortrait);
  };

  const handleGenderClick = (gender: GenderId) => {
    setHasManuallyPickedPortrait(false);
    onSelectGender(gender);
  };

  const handlePortraitClick = (portraitId: string) => {
    setHasManuallyPickedPortrait(true);
    onSelectPortrait(portraitId);
  };

  const renderRaceTooltipCard = (race: RaceDefinition) => {
    const RaceIcon = RACE_ICONS[race.id];
    const previewMp =
      classDef.baseVitals.mp +
      character.attributes.intelligence * 4 +
      (race.id === 'high_elf' ? Math.max(1, character.level) * HIGH_ELF_MP_PER_LEVEL : 0);
    const previewDefPhys =
      Math.floor(character.attributes.constitution / 2) + (race.id === 'dwarf' ? 2 : 0);
    const previewDefMag =
      Math.floor(character.attributes.wisdom / 2) + (race.id === 'dwarf' ? 2 : 0);

    return (
      <div className="bg-[#150f0b]/98 border-2 border-[#c9943b] rounded-sm p-4 shadow-2xl shadow-black/90 backdrop-blur-md">
        <div className="flex items-start gap-2.5 pb-2.5 border-b border-[#473421]">
          <div className="w-8 h-8 rounded-sm bg-[#2d1f10] border border-[#c9943b] flex items-center justify-center text-[#f3d189] shrink-0">
            <RaceIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-sm font-bold text-[#f3d189] leading-tight">
              {race.name}
            </h3>
            <p className="text-[11px] italic text-[#a6957e] mt-0.5">{race.tagline}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="font-serif text-xs font-bold text-[#e5b865]">
            Passiva: {race.passive.name}
          </div>
          <p className="text-xs text-[#d6c7b2] mt-1 leading-relaxed">{race.passive.description}</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#3b2c1e] space-y-1">
          <div className="text-[10px] font-serif uppercase tracking-wider text-[#9e8c76]">
            Estatísticas com {classDef.name}
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono tabular-nums">
            <div className="bg-[#110c09] border border-[#3d2d1e] px-2 py-1 rounded-xs">
              <span className="text-[#9e8c76] block text-[9px]">Mana</span>
              <span className="text-[#84c4e6] font-bold">{previewMp}</span>
            </div>
            <div className="bg-[#110c09] border border-[#3d2d1e] px-2 py-1 rounded-xs">
              <span className="text-[#9e8c76] block text-[9px]">Def. Fís.</span>
              <span className="text-[#e5b865] font-bold">{previewDefPhys}</span>
            </div>
            <div className="bg-[#110c09] border border-[#3d2d1e] px-2 py-1 rounded-xs">
              <span className="text-[#9e8c76] block text-[9px]">Def. Mág.</span>
              <span className="text-[#a5b4fc] font-bold">{previewDefMag}</span>
            </div>
          </div>
          <ul className="pt-1.5 space-y-0.5 text-[11px] text-[#c7b59e]">
            {race.statHighlights.map((line) => (
              <li key={line} className="flex items-start gap-1.5">
                <span className="text-[#d9a043] mt-0.5">◈</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderClassTooltipCard = (cls: ClassDefinition) => {
    const ClassIcon = CLASS_ICONS[cls.id];
    const previewHp = cls.baseVitals.hp + character.attributes.constitution * 4;
    const previewMp =
      cls.baseVitals.mp + character.attributes.intelligence * 4 + elfMpBonus;

    return (
      <div className="bg-[#150f0b]/98 border-2 border-[#c9943b] rounded-sm p-4 shadow-2xl shadow-black/90 backdrop-blur-md">
        <div className="flex items-start gap-2.5 pb-2.5 border-b border-[#473421]">
          <div className="w-8 h-8 rounded-sm bg-[#2d1f10] border border-[#c9943b] flex items-center justify-center text-[#f3d189] shrink-0">
            <ClassIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-sm font-bold text-[#f3d189] leading-tight">
              {cls.name}
            </h3>
            <p className="text-[11px] italic text-[#a6957e] mt-0.5">{cls.roleLabel}</p>
          </div>
        </div>

        <p className="text-xs text-[#c7b59e] mt-2 leading-relaxed">{cls.tagline}</p>

        {/* Base Vitals Preview */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px] font-mono tabular-nums">
          <div className="bg-[#110c09] border border-[#5e2220] px-2 py-1.5 rounded-xs text-center">
            <span className="text-[#e0665e] block text-[9px]">Vida Base</span>
            <span className="text-[#f0b4ae] font-bold">
              {cls.baseVitals.hp}
              {previewHp !== cls.baseVitals.hp ? ` (${previewHp})` : ''}
            </span>
          </div>
          <div className="bg-[#110c09] border border-[#22475e] px-2 py-1.5 rounded-xs text-center">
            <span className="text-[#6bb4dc] block text-[9px]">Mana Base</span>
            <span className="text-[#b8dcf0] font-bold">
              {cls.baseVitals.mp}
              {previewMp !== cls.baseVitals.mp ? ` (${previewMp})` : ''}
            </span>
          </div>
          <div className="bg-[#110c09] border border-[#5e441d] px-2 py-1.5 rounded-xs text-center">
            <span className="text-[#e5b865] block text-[9px]">Energia</span>
            <span className="text-[#f4dab0] font-bold">{cls.baseVitals.ep}</span>
          </div>
        </div>

        {/* Basic Attack */}
        <div className="mt-3 pt-2.5 border-t border-[#3b2c1e]">
          <div className="text-[11px] font-serif font-bold text-[#f2dfb9]">
            Ataque Padrão: {cls.basicAttackName}
          </div>
          <p className="text-[11px] text-[#b39d82] mt-0.5 leading-snug">
            {cls.basicAttackDescription}
          </p>
        </div>

        {/* Class Starting Skills / Spells */}
        <div className="mt-2.5 pt-2.5 border-t border-[#3b2c1e] space-y-2">
          <div className="text-[10px] font-serif uppercase tracking-wider text-[#9e8c76]">
            {cls.id === 'mage' ? 'Magias Iniciais' : 'Habilidades Iniciais'}
          </div>
          {cls.skillSummaries.map((sk) => (
            <div key={sk.id} className="bg-[#110c09] border border-[#3a2b1d] rounded-xs p-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-xs font-bold text-[#e5b865]">{sk.name}</span>
                <span className="font-mono text-[10px] text-[#84c4e6] shrink-0">
                  {sk.costLabel}
                </span>
              </div>
              <p className="text-[11px] text-[#c7b59e] mt-0.5 leading-snug">{sk.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="criacao" className="space-y-8">
      {/* WoW-Style 3-Column Character Creation Stage */}
      <div className="medieval-panel rounded-md p-5 sm:p-7">
        <div className="text-center pb-5 border-b border-[#473421]">
          <p className="font-serif text-xs tracking-widest text-[#b88940] uppercase">
            Forja do Campeão
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#f3d189] tracking-wide mt-1">
            Criação de Personagem
          </h1>
          <p className="text-xs sm:text-sm text-[#a6957e] mt-1">
            Passe o mouse sobre as raças e classes laterais para inspecionar estatísticas, passivas e magias.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: RAÇAS (WoW Left Sidebar + Hover Card) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#3b2c1e]">
              <h2 className="font-serif text-xs font-bold uppercase tracking-widest text-[#e5b865]">
                Raças
              </h2>
              <span className="text-[11px] font-mono text-[#937f67]">{RACE_LIST.length}</span>
            </div>

            <div className="space-y-2">
              {RACE_LIST.map((race) => {
                const isSelected = character.raceId === race.id;
                const isHovered = hoveredRaceId === race.id;
                const RaceIcon = RACE_ICONS[race.id];

                return (
                  <div
                    key={race.id}
                    className="relative"
                    onMouseEnter={() => setHoveredRaceId(race.id)}
                    onMouseLeave={() => setHoveredRaceId((cur) => (cur === race.id ? null : cur))}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onFocus={() => setHoveredRaceId(race.id)}
                      onBlur={() => setHoveredRaceId((cur) => (cur === race.id ? null : cur))}
                      onClick={() => handleRaceClick(race.id)}
                      className={`w-full text-left p-3 rounded-sm border transition-all flex items-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865] ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#342311] to-[#21170e] border-[#e5b865] shadow-md shadow-black/50'
                          : 'bg-[#120d09] border-[#423120] hover:border-[#8f6a38] hover:bg-[#1c140e]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#422b12] border-[#e5b865] text-[#fde68a]'
                            : 'bg-[#1b140e] border-[#4d3924] text-[#a6957e]'
                        }`}
                      >
                        <RaceIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-sm font-bold text-[#f5e7ce] truncate">
                          {race.name}
                        </div>
                        <div className="text-[11px] text-[#b88940] truncate">
                          {race.passive.name}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-xs bg-[#c9943b] text-[#181008] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </button>

                    {/* Floating Hover Card (Desktop: right of Race item) */}
                    {isHovered && (
                      <div className="hidden lg:block absolute left-full top-0 ml-3 w-80 z-50 pointer-events-none">
                        {renderRaceTooltipCard(race)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Race Passive Quick Readout */}
            <div className="mt-3 p-3 rounded-sm bg-[#110c09] border border-[#473421]">
              <div className="text-[10px] font-serif uppercase tracking-wider text-[#937f67]">
                Passiva Selecionada
              </div>
              <div className="font-serif text-xs font-bold text-[#e5b865] mt-1">
                {raceDef.passive.name}
              </div>
              <p className="text-[11px] text-[#b5a38d] mt-1 leading-relaxed">
                {raceDef.passive.description}
              </p>
            </div>
          </div>

          {/* CENTER COLUMN: CHARACTER SHOWCASE PEDESTAL (WoW Centerpiece) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Hero Portrait Stage */}
            <div className="w-full max-w-md flex flex-col items-center">
              {/* WoW-Style Gender Selector Above Portrait */}
              <div
                className="w-full max-w-[300px] sm:max-w-[320px] mb-3 grid grid-cols-2 gap-2"
                role="group"
                aria-label="Escolha de Gênero"
              >
                {(['male', 'female'] as const).map((genderOption) => {
                  const isSelected = character.gender === genderOption;
                  const symbol = genderOption === 'male' ? '♂' : '♀';
                  const label = getGenderLabel(genderOption);

                  return (
                    <button
                      key={genderOption}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleGenderClick(genderOption)}
                      className={`h-9 px-3 rounded-sm border font-serif text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865] ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#3d2914] to-[#24170c] border-[#e5b865] text-[#f9e1a8] shadow-md shadow-black/50'
                          : 'bg-[#120d09] border-[#423120] text-[#a6957e] hover:border-[#8f6a38] hover:text-[#e6d5b8] hover:bg-[#1c140e]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`text-sm leading-none ${
                          isSelected ? 'text-[#f3d189]' : 'text-[#8f795e]'
                        }`}
                      >
                        {symbol}
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full max-w-[300px] sm:max-w-[320px] aspect-square rounded-sm overflow-hidden border-2 border-[#c9943b] bg-[#0e0a07] shadow-[0_0_45px_rgba(201,148,59,0.22),0_18px_38px_rgba(0,0,0,0.85)]">
                <PortraitImage
                  src={portraitUrl}
                  alt={`Retrato de ${character.name || 'Campeão'} (${raceDef.name} ${classDef.name} ${getGenderLabel(character.gender)})`}
                  variant="hero"
                  className="w-full h-full object-cover object-top"
                />
                {/* Subtle Bottom Vignette with Race/Class/Gender Heraldry */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0906] via-[#0d0906]/80 to-transparent pt-10 pb-3 px-4 text-center">
                  <div className="font-serif text-base font-bold text-[#f6e6c8] tracking-wide truncate">
                    {character.name.trim() || 'Sem Nome'}
                  </div>
                  <div className="text-xs font-serif text-[#e5b865] mt-0.5">
                    {raceDef.name} · {classDef.name} · {getGenderLabel(character.gender)} ·{' '}
                    <span className="font-mono tabular-nums">Nv. {character.level}</span>
                  </div>
                </div>
              </div>

              {/* Compact Live Vitals Bar Directly Below Portrait */}
              <div className="mt-4 w-full grid grid-cols-3 gap-2.5">
                <div className="bg-[#110c09] border border-[#5e2220] rounded-sm py-2 px-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#e0665e] font-semibold">
                    <Heart className="w-3 h-3 fill-[#b91c1c] text-[#dc2626]" />
                    <span>Vida</span>
                  </div>
                  <div className="font-mono tabular-nums text-lg font-bold text-[#f0b4ae] leading-tight mt-0.5">
                    {maxHp}
                  </div>
                </div>

                <div className="bg-[#110c09] border border-[#22475e] rounded-sm py-2 px-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#6bb4dc] font-semibold">
                    <Droplet className="w-3 h-3 fill-[#1d648c] text-[#38bdf8]" />
                    <span>Mana</span>
                  </div>
                  <div className="font-mono tabular-nums text-lg font-bold text-[#b8dcf0] leading-tight mt-0.5">
                    {maxMp}
                  </div>
                </div>

                <div className="bg-[#110c09] border border-[#5e441d] rounded-sm py-2 px-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#e5b865] font-semibold">
                    <Zap className="w-3 h-3 fill-[#b87c26] text-[#e5b865]" />
                    <span>Energia</span>
                  </div>
                  <div className="font-mono tabular-nums text-lg font-bold text-[#f4dab0] leading-tight mt-0.5">
                    {maxEp}
                  </div>
                </div>
              </div>

              {/* Appearance Strip (Filtered by Selected Gender) */}
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between text-xs mb-2 gap-2">
                  <span className="font-serif font-bold uppercase tracking-wider text-[#b39d82] text-[11px] shrink-0">
                    Aparência · {getGenderLabel(character.gender)}
                  </span>
                  <span className="text-[11px] text-[#e5b865] truncate">{selectedAppearance.label}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {genderAppearances.map((opt) => {
                    const isSelected = character.portraitId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        title={opt.label}
                        aria-label={`Escolher aparência ${opt.label}`}
                        aria-pressed={isSelected}
                        onClick={() => handlePortraitClick(opt.id)}
                        className={`aspect-square rounded-xs overflow-hidden border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865] ${
                          isSelected
                            ? 'border-[#fde68a] ring-1 ring-[#c9943b] scale-105 z-10'
                            : 'border-[#423120] opacity-75 hover:opacity-100 hover:border-[#8f6a38]'
                        }`}
                      >
                        <PortraitImage
                          src={opt.imageUrl}
                          alt={opt.label}
                          variant="hero"
                          className="w-full h-full object-cover object-top"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name Input & Primary Confirm CTA (WoW Bottom-Center Pedestal) */}
              <div className="mt-5 w-full space-y-3">
                <div>
                  <label
                    htmlFor="creator-name-input"
                    className="block text-center text-[11px] font-serif uppercase tracking-widest text-[#b39d82] mb-1.5"
                  >
                    Nome do Personagem
                  </label>
                  <input
                    id="creator-name-input"
                    type="text"
                    maxLength={32}
                    value={character.name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Digite o nome do herói..."
                    className="w-full text-center bg-[#110c09] border border-[#6e512e] focus:border-[#e5b865] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/40 rounded-sm px-4 py-2.5 font-serif text-lg font-bold text-[#f6e6c8] transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={onConfirmCharacter}
                  className="medieval-btn-gold w-full min-h-12 px-5 py-3 rounded-sm font-serif font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865]"
                >
                  <ScrollText className="w-4 h-4" />
                  <span>Confirmar Personagem e Abrir Ficha</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CLASSES (WoW Right Sidebar + Hover Card) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#3b2c1e]">
              <h2 className="font-serif text-xs font-bold uppercase tracking-widest text-[#e5b865]">
                Classes
              </h2>
              <span className="text-[11px] font-mono text-[#937f67]">{CLASS_LIST.length}</span>
            </div>

            <div className="space-y-2">
              {CLASS_LIST.map((cls) => {
                const isSelected = character.classId === cls.id;
                const isHovered = hoveredClassId === cls.id;
                const ClassIcon = CLASS_ICONS[cls.id];

                return (
                  <div
                    key={cls.id}
                    className="relative"
                    onMouseEnter={() => setHoveredClassId(cls.id)}
                    onMouseLeave={() => setHoveredClassId((cur) => (cur === cls.id ? null : cur))}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onFocus={() => setHoveredClassId(cls.id)}
                      onBlur={() => setHoveredClassId((cur) => (cur === cls.id ? null : cur))}
                      onClick={() => handleClassClick(cls.id)}
                      className={`w-full text-left p-3 rounded-sm border transition-all flex items-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865] ${
                        isSelected
                          ? cls.id === 'mage'
                            ? 'bg-gradient-to-r from-[#132538] to-[#1a1624] border-[#6bb4dc] shadow-md shadow-black/50'
                            : cls.id === 'knight'
                            ? 'bg-gradient-to-r from-[#2c2516] to-[#1c1914] border-[#f3d189] shadow-md shadow-black/50'
                            : cls.id === 'priest'
                            ? 'bg-gradient-to-r from-[#362d16] to-[#1f1c14] border-[#fef08a] shadow-md shadow-black/50'
                            : cls.id === 'rogue'
                            ? 'bg-gradient-to-r from-[#28162d] to-[#17121c] border-[#c084fc] shadow-md shadow-black/50'
                            : 'bg-gradient-to-r from-[#342311] to-[#21170e] border-[#e5b865] shadow-md shadow-black/50'
                          : 'bg-[#120d09] border-[#423120] hover:border-[#8f6a38] hover:bg-[#1c140e]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? cls.id === 'mage'
                              ? 'bg-[#173652] border-[#6bb4dc] text-[#bae6fd]'
                              : cls.id === 'knight'
                              ? 'bg-[#3d3118] border-[#f3d189] text-[#fef08a]'
                              : cls.id === 'priest'
                              ? 'bg-[#463a17] border-[#fef08a] text-[#fffbeb]'
                              : cls.id === 'rogue'
                              ? 'bg-[#361b40] border-[#c084fc] text-[#e9d5ff]'
                              : 'bg-[#422b12] border-[#e5b865] text-[#fde68a]'
                            : 'bg-[#1b140e] border-[#4d3924] text-[#a6957e]'
                        }`}
                      >
                        <ClassIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-sm font-bold text-[#f5e7ce] truncate">
                          {cls.name}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-[#b39d82] truncate">
                          {cls.baseVitals.hp} HP · {cls.baseVitals.mp} MP
                        </div>
                      </div>
                      {isSelected && (
                        <span
                          className={`w-5 h-5 rounded-xs flex items-center justify-center shrink-0 ${
                            cls.id === 'mage'
                              ? 'bg-[#38bdf8] text-[#082f49]'
                              : cls.id === 'knight'
                              ? 'bg-[#f3d189] text-[#1a1207]'
                              : cls.id === 'priest'
                              ? 'bg-[#fef08a] text-[#1f1606]'
                              : cls.id === 'rogue'
                              ? 'bg-[#c084fc] text-[#1f0c2e]'
                              : 'bg-[#c9943b] text-[#181008]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      )}
                    </button>

                    {/* Floating Hover Card (Desktop: left of Class item) */}
                    {isHovered && (
                      <div className="hidden lg:block absolute right-full top-0 mr-3 w-84 z-50 pointer-events-none">
                        {renderClassTooltipCard(cls)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Class Quick Summary */}
            <div className="mt-3 p-3 rounded-sm bg-[#110c09] border border-[#473421] space-y-2">
              <div className="text-[10px] font-serif uppercase tracking-wider text-[#937f67]">
                Arsenal de {classDef.name}
              </div>
              <div className="text-xs text-[#f2dfb9] font-serif font-bold">
                {classDef.basicAttackName}
              </div>
              <p className="text-[11px] text-[#a6957e] leading-snug">
                {classDef.basicAttackDescription}
              </p>
              <div className="pt-2 border-t border-[#3b2c1e] space-y-1.5">
                {classDef.skillSummaries.map((sk) => (
                  <div key={sk.id} className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-[#e5b865] font-serif font-semibold truncate">
                      {sk.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#84c4e6] shrink-0">
                      {sk.costLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Attribute Allocation + Live Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 6 Primary Attributes */}
        <div className="lg:col-span-7 medieval-panel rounded-md p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#473421]">
            <div>
              <h2 className="font-serif text-base font-bold text-[#e5b865] tracking-wider">
                Distribuição de Atributos
              </h2>
              <p className="text-xs text-[#a6957e] mt-0.5">
                Aloque seus {INITIAL_POINTS} pontos iniciais. Você também pode ajustar na ficha depois.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#110c09] border border-[#5c4327] px-3 py-1 rounded-sm text-right">
                <span className="text-[10px] font-serif text-[#b39d82] block">Pontos Livres</span>
                <span className="font-mono tabular-nums text-lg font-bold text-[#e5b865] leading-none">
                  {character.unspentPoints}
                </span>
              </div>
              <button
                type="button"
                onClick={onResetAttributes}
                disabled={spentPoints === 0}
                className="medieval-btn-iron h-9 px-3 rounded-sm text-xs font-serif font-bold flex items-center gap-1.5 transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetar</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#38291b] mt-1">
            {ATTRIBUTE_LIST.map((attr) => {
              const Icon = ATTRIBUTE_ICONS[attr.key];
              const allocated = character.attributes[attr.key];

              return (
                <div
                  key={attr.key}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-sm bg-[#120d09] border border-[#543d25] flex items-center justify-center shrink-0 text-[#d9a043]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-sm font-bold text-[#f3e5cc]">
                        {attr.label}
                      </h3>
                      <p className="text-xs text-[#ab9982] mt-0.5 leading-snug">
                        {attr.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center self-end sm:self-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label={`Diminuir ${attr.label}`}
                      disabled={allocated <= 0}
                      onClick={() => onDecrementAttribute(attr.key)}
                      className="medieval-btn-iron w-9 h-9 rounded-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-10 text-center font-mono tabular-nums text-lg font-bold text-[#e5b865]">
                      {allocated}
                    </span>

                    <button
                      type="button"
                      aria-label={`Aumentar ${attr.label}`}
                      disabled={character.unspentPoints <= 0}
                      onClick={() => onIncrementAttribute(attr.key)}
                      className="w-9 h-9 rounded-sm bg-[#3b2611] hover:bg-[#4f3316] border border-[#9e7032] text-[#f4d79b] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Secondary Stats & Spell Calculations */}
        <div className="lg:col-span-5 medieval-panel rounded-md p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#473421]">
            <h2 className="font-serif text-base font-bold text-[#e5b865] tracking-wider">
              Estatísticas Calculadas
            </h2>
            <p className="text-xs text-[#a6957e] mt-0.5">
              Atualizadas em tempo real conforme raça, classe e atributos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Sword className="w-3.5 h-3.5 text-[#f2dfb9]" />
                Dano Fís.
              </span>
              <span className="font-mono tabular-nums font-bold text-[#f2dfb9]">{dmgText}</span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#84c4e6]" />
                Dano Mág.
              </span>
              <span className="font-mono tabular-nums font-bold text-[#84c4e6]">
                {secondary.magicDamage}
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#e5b865]" />
                Def. Fís.
              </span>
              <span className="font-mono tabular-nums font-bold text-[#e5b865]">
                {secondary.physicalDefense}
                {dwarfBonus > 0 && (
                  <span className="text-[10px] text-[#86efac] font-normal ml-1">
                    (+{dwarfBonus})
                  </span>
                )}
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#a5b4fc]" />
                Def. Mág.
              </span>
              <span className="font-mono tabular-nums font-bold text-[#a5b4fc]">
                {secondary.magicDefense}
                {dwarfBonus > 0 && (
                  <span className="text-[10px] text-[#86efac] font-normal ml-1">
                    (+{dwarfBonus})
                  </span>
                )}
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#f09a4e]" />
                Crítico
              </span>
              <span className="font-mono tabular-nums font-bold text-[#f09a4e]">
                {secondary.critChance}%
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#fde047]" />
                Dano Crít.
              </span>
              <span className="font-mono tabular-nums font-bold text-[#fde047]">
                +{secondary.critDamageBonus}%
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#60c28c]" />
                Evasão
              </span>
              <span className="font-mono tabular-nums font-bold text-[#60c28c]">
                {secondary.evasionChance}%
              </span>
            </div>

            <div className="bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#e6d7be]" />
                Acerto
              </span>
              <span className="font-mono tabular-nums font-bold text-[#e6d7be]">
                {secondary.hitChance}%
              </span>
            </div>

            <div className="col-span-2 bg-[#120d09] border border-[#3d2e1e] rounded-sm px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#a6957e] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#34d399]" />
                Bônus de Cura (+1/3 Sab.)
              </span>
              <span className="font-mono tabular-nums font-bold text-[#6ee7b7]">
                +{secondary.healingBonus}
              </span>
            </div>
          </div>

          {/* Knight Live Skill Preview */}
          {character.classId === 'knight' && (
            <div className="pt-3 border-t border-[#473421] space-y-2">
              <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#f3d189]">
                Doutrina de Vanguarda (Cavaleiro)
              </div>
              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c4327] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">Provocar ({KNIGHT_TAUNT_EP_COST} EP · 6m · 2R)</span>
                  <span className="text-[#f3d189] font-bold">
                    +{KNIGHT_TAUNT_DEFENSE_BONUS} Def. Fís./Mág.
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c4327] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Levantar Guarda ({RAISE_GUARD_EP_COST} EP · Reação)
                  </span>
                  <span className="text-[#fde68a] font-bold">
                    +{RAISE_GUARD_PHYSICAL_DEFENSE_BONUS} Def. Física
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c4327] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Investida Galante ({GALLANT_CHARGE_EP_COST} EP · {GALLANT_CHARGE_RANGE_METERS}m)
                  </span>
                  <span className="text-[#fbbf24] font-bold">
                    {gallantChargeText} dano (+{GALLANT_CHARGE_BONUS_DAMAGE})
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#8a6823] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Estandarte da Glória ({BANNER_OF_GLORY_MP_COST} MP ·{' '}
                    {BANNER_OF_GLORY_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m · Raio{' '}
                    {BANNER_OF_GLORY_RADIUS_METERS}m · {BANNER_OF_GLORY_DURATION_ROUNDS}R)
                  </span>
                  <span className="text-[#fde047] font-bold">
                    {BANNER_OF_GLORY_MAGIC_DAMAGE} Mág. + Fís. · +{BANNER_OF_GLORY_SHIELD_HP} Escudo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Priest Live Divine Skills Preview */}
          {character.classId === 'priest' && (
            <div className="pt-3 border-t border-[#473421] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#fef08a]">
                  Bênçãos Sagradas (Sacerdote)
                </div>
                {secondary.healingBonus > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-[#6ee7b7]">
                    +{secondary.healingBonus} Cura (Sab.)
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c4b22] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Raio Divino ({PRIEST_BASIC_EP_COST} EP · {PRIEST_BASIC_RANGE_METERS}m)
                  </span>
                  <span className="text-[#fef08a] font-bold">{priestBasicText} mágico</span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#2d5a42] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Luz Restauradora ({RESTORING_LIGHT_MP_COST} MP)
                  </span>
                  <span className="text-[#6ee7b7] font-bold">
                    +{priestRestoringHeal} HP (+2/+3 MP)
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c4b22] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Consagração ({CONSECRATION_MP_COST} MP · {CONSECRATION_CAST_RANGE_METERS}m / r
                    {CONSECRATION_RADIUS_METERS}m)
                  </span>
                  <span className="text-[#fde68a] font-bold">+{priestConsecrationHeal} HP área</span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#6e5c2b] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Proteção Sagrada ({SACRED_PROTECTION_MP_COST} MP · 1R)
                  </span>
                  <span className="text-[#fffbeb] font-bold">
                    +{SACRED_PROTECTION_SHIELD_HP} Escudo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rogue Live Skills Preview */}
          {character.classId === 'rogue' && (
            <div className="pt-3 border-t border-[#473421] space-y-2">
              <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#d8b4fe]">
                Táticas das Sombras (Ladino)
              </div>
              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between bg-[#110c09] border border-[#5c2529] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Arremesso de Adaga ({DAGGER_THROW_EP_COST} EP · {DAGGER_THROW_RANGE_METERS}m)
                  </span>
                  <span className="text-[#fca5a5] font-bold">
                    {daggerThrowText} (+{DAGGER_THROW_BONUS_DAMAGE}) + {DAGGER_THROW_BLEED_DAMAGE}×
                    {DAGGER_THROW_BLEED_ROUNDS}R
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#4c2866] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Furtividade ({STEALTH_EP_COST} EP · {STEALTH_DURATION_ROUNDS}R · {STEALTH_DETECTION_CHANCE}% Percep.)
                  </span>
                  <span className="text-[#d8b4fe] font-bold">
                    +{STEALTH_BONUS_DAMAGE} dano / +{STEALTH_EXTRA_DAMAGE_TAKEN} rec.
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#1f4d3b] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">Disparada ({SPRINT_EP_COST} EP)</span>
                  <span className="text-[#6ee7b7] font-bold">2× Deslocamento (12m)</span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#6b213a] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Letalidade ({LETHALITY_EP_COST} EP · Costas)
                  </span>
                  <span className="text-[#fda4af] font-bold">
                    {lethalityText} (+Des) · {LETHALITY_CRIT_CHANCE}% Crít.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mage Live Spell Numbers Preview */}
          {character.classId === 'mage' && (
            <div className="pt-3 border-t border-[#473421] space-y-2">
              <div className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#84c4e6]">
                Poder das Magias (Mago)
              </div>
              <div className="space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex items-center justify-between bg-[#110c09] border border-[#2a3b4d] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">Golpe Básico (Físico)</span>
                  <span className="text-[#f2dfb9] font-bold">{mageBasicText} dano</span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#2a3b4d] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">Seta Arcana (3/5 MP · 9m)</span>
                  <span className="text-[#84c4e6] font-bold">
                    {arcaneBoltDmg} (1×) / 2×{arcaneBoltUpgradedDmg}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#2a3b4d] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">
                    Armadura Arcana ({ARCANE_ARMOR_MP_COST} MP · {ARCANE_ARMOR_DURATION_ROUNDS}R)
                  </span>
                  <span className="text-[#7dd3fc] font-bold">
                    +{ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} Def. Física
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#110c09] border border-[#4d281c] rounded-xs px-3 py-1.5">
                  <span className="text-[#d6c7b2]">Baforada de Fogo (9 MP · 6m)</span>
                  <span className="text-[#fb923c] font-bold">{fireBreathDmg} dano fogo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
