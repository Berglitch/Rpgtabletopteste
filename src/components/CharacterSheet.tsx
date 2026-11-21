import {
  BookOpen,
  Crosshair,
  Crown,
  Droplet,
  Eye,
  EyeOff,
  Flag,
  Flame,
  Heart,
  Megaphone,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Sword,
  Swords,
  Target,
  UserPen,
  Wand2,
  Wind,
  Zap,
} from 'lucide-react';
import {
  ARCANE_ARMOR_DURATION_ROUNDS,
  ARCANE_ARMOR_MP_COST,
  ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS,
  ATTRIBUTE_LIST,
  CONSECRATION_CAST_RANGE_METERS,
  CONSECRATION_HEAL,
  CONSECRATION_MP_COST,
  CONSECRATION_RADIUS_METERS,
  COUNTER_ATTACK_EP_COST,
  DAGGER_THROW_BLEED_DAMAGE,
  DAGGER_THROW_BLEED_ROUNDS,
  DAGGER_THROW_BONUS_DAMAGE,
  DAGGER_THROW_EP_COST,
  DAGGER_THROW_RANGE_METERS,
  DOUBLE_STRIKE_EP_COST,
  EXECUTIONER_BASE_BONUS_DAMAGE,
  EXECUTIONER_EP_COST,
  EXECUTIONER_LOW_HP_BONUS_DAMAGE,
  GALLANT_CHARGE_BONUS_DAMAGE,
  GALLANT_CHARGE_EP_COST,
  GALLANT_CHARGE_RANGE_METERS,
  BANNER_OF_GLORY_CAST_RANGE_METERS,
  BANNER_OF_GLORY_DURATION_ROUNDS,
  BANNER_OF_GLORY_MAGIC_DAMAGE,
  BANNER_OF_GLORY_MP_COST,
  BANNER_OF_GLORY_RADIUS_METERS,
  BANNER_OF_GLORY_SHIELD_HP,
  INITIAL_POINTS,
  KNIGHT_TAUNT_DEFENSE_BONUS,
  KNIGHT_TAUNT_EP_COST,
  LETHALITY_CRIT_CHANCE,
  LETHALITY_EP_COST,
  LETHALITY_STEALTH_CRIT_DMG_BONUS,
  PRIEST_BASIC_EP_COST,
  PRIEST_BASIC_RANGE_METERS,
  RAISE_GUARD_EP_COST,
  RAISE_GUARD_PHYSICAL_DEFENSE_BONUS,
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
  SPRINT_EP_COST,
  STEALTH_BONUS_DAMAGE,
  STEALTH_DETECTION_CHANCE,
  STEALTH_DURATION_ROUNDS,
  STEALTH_EP_COST,
  STEALTH_EXTRA_DAMAGE_TAKEN,
  getArcaneBoltDamage,
  getArcaneBoltUpgradedDamage,
  getCalculatedStrength,
  getCarryCapacity,
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
  getScaledHealAmount,
  getSecondaryStats,
  getWeaponDamageRange,
} from '../game/engine';
import type { AttributeKey, CharacterState } from '../game/types';
import { PortraitImage } from './PortraitImage';

interface CharacterSheetProps {
  character: CharacterState;
  onNameChange: (name: string) => void;
  onIncrementAttribute: (attr: AttributeKey) => void;
  onDecrementAttribute: (attr: AttributeKey) => void;
  onResetAttributes: () => void;
  onToggleWeapon: () => void;
  onOpenArena: () => void;
  onOpenCreator: () => void;
}

const ATTRIBUTE_ICONS: Record<AttributeKey, typeof Swords> = {
  strength: Swords,
  constitution: Shield,
  dexterity: Target,
  intelligence: BookOpen,
  charisma: Crown,
  wisdom: Eye,
};

export function CharacterSheet({
  character,
  onNameChange,
  onIncrementAttribute,
  onDecrementAttribute,
  onResetAttributes,
  onToggleWeapon,
  onOpenArena,
  onOpenCreator,
}: CharacterSheetProps) {
  const classDef = getClassDefinition(character.classId);
  const maxHp = getMaxHp(character);
  const maxMp = getMaxMp(character);
  const maxEp = getMaxEp(character);
  const totalStrength = getCalculatedStrength(character);
  const carryCapacity = getCarryCapacity(character);
  const secondary = getSecondaryStats(character);
  const dwarfDefBonus = getDwarfDefenseBonus(character, false);
  const elfMpBonus = getHighElfLevelMpBonus(character);
  const portraitUrl = getCharacterPortraitUrl(character);
  const dmgRange = secondary.physicalDamage;
  const executionerBaseRange = getWeaponDamageRange(character, EXECUTIONER_BASE_BONUS_DAMAGE);
  const executionerLowHpRange = getWeaponDamageRange(character, EXECUTIONER_LOW_HP_BONUS_DAMAGE);
  const gallantChargeRange = getWeaponDamageRange(character, GALLANT_CHARGE_BONUS_DAMAGE);
  const daggerThrowRange = getWeaponDamageRange(character, DAGGER_THROW_BONUS_DAMAGE);
  const lethalityRange = getWeaponDamageRange(character, character.attributes.dexterity);
  const priestBasicRange = getPriestBasicAttackRange(character);
  const priestRestoringBaseHeal = getScaledHealAmount(RESTORING_LIGHT_BASE_HEAL, character);
  const priestRestoringUpgradedHeal = getScaledHealAmount(
    RESTORING_LIGHT_BASE_HEAL + RESTORING_LIGHT_HEAL_UPGRADE_BONUS,
    character
  );
  const priestRestoringRegenHeal = getScaledHealAmount(
    RESTORING_LIGHT_REGEN_HEAL_PER_TURN,
    character
  );
  const priestConsecrationHeal = getScaledHealAmount(CONSECRATION_HEAL, character);
  const mageBasicRange = getMageBasicAttackRange(character);
  const arcaneBoltDmg = getArcaneBoltDamage(character);
  const arcaneBoltUpgradedDmg = getArcaneBoltUpgradedDamage(character);
  const fireBreathDmg = getFireBreathDamage(character);
  const spentPoints = INITIAL_POINTS - character.unspentPoints;

  const physicalDamageText =
    dmgRange.min === dmgRange.max ? `${dmgRange.min}` : `${dmgRange.min}–${dmgRange.max}`;
  const executionerBaseText =
    executionerBaseRange.min === executionerBaseRange.max
      ? `${executionerBaseRange.min}`
      : `${executionerBaseRange.min}–${executionerBaseRange.max}`;
  const executionerLowHpText =
    executionerLowHpRange.min === executionerLowHpRange.max
      ? `${executionerLowHpRange.min}`
      : `${executionerLowHpRange.min}–${executionerLowHpRange.max}`;
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

  const secondaryRows = [
    {
      key: 'physicalDamage',
      label: 'Dano Físico',
      value: physicalDamageText,
      hint: character.equippedWeapon
        ? `Arma (${character.equippedWeapon.baseMinDamage}–${character.equippedWeapon.baseMaxDamage}) + Força (+${Math.floor(totalStrength * 0.8)})`
        : `Desarmado + Força (+${Math.floor(totalStrength * 0.5)})`,
      icon: Sword,
      accent: 'text-[#f2dfb9]',
    },
    {
      key: 'magicDamage',
      label: 'Dano Mágico',
      value: `${secondary.magicDamage}`,
      hint: 'Inteligência (+1/pt) + Sabedoria (+1/2 pts)',
      icon: Sparkles,
      accent: 'text-[#84c4e6]',
    },
    {
      key: 'physicalDefense',
      label: 'Defesa Física',
      value: `${secondary.physicalDefense}`,
      hint:
        dwarfDefBonus > 0
          ? `Inclui +${dwarfDefBonus} de Pele Rígida (dobra para +4 com ≤ 40% HP)`
          : 'Cada ponto reduz 1 de dano físico recebido',
      icon: Shield,
      accent: 'text-[#e5b865]',
    },
    {
      key: 'magicDefense',
      label: 'Defesa Mágica',
      value: `${secondary.magicDefense}`,
      hint:
        dwarfDefBonus > 0
          ? `Inclui +${dwarfDefBonus} de Pele Rígida (dobra para +4 com ≤ 40% HP)`
          : 'Cada ponto reduz 1 de dano mágico recebido',
      icon: Eye,
      accent: 'text-[#a5b4fc]',
    },
    {
      key: 'critChance',
      label: 'Chance Crítica',
      value: `${secondary.critChance}%`,
      hint: 'Base 1% para todos (+1% a cada 2 pts em Destreza)',
      icon: Flame,
      accent: 'text-[#f09a4e]',
    },
    {
      key: 'critDamage',
      label: 'Dano Crítico',
      value: `+${secondary.critDamageBonus}%`,
      hint: 'Sempre +50% · apenas ataques físicos (salvo exceção)',
      icon: Zap,
      accent: 'text-[#fde047]',
    },
    {
      key: 'evasionChance',
      label: 'Chance de Evasão',
      value: `${secondary.evasionChance}%`,
      hint: 'Base 1% · ignora completamente dano e efeitos',
      icon: Wind,
      accent: 'text-[#60c28c]',
    },
    {
      key: 'hitChance',
      label: 'Chance de Acerto',
      value: `${secondary.hitChance}%`,
      hint: 'Base 90% (+1% por ponto em Destreza)',
      icon: Crosshair,
      accent: 'text-[#e6d7be]',
    },
    {
      key: 'healingBonus',
      label: 'Bônus de Cura',
      value: `+${secondary.healingBonus}`,
      hint: '+1 de cura flat a cada 3 pontos em Sabedoria',
      icon: Heart,
      accent: 'text-[#6ee7b7]',
    },
  ];

  return (
    <section id="ficha" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Medieval Champion Codex */}
      <div className="lg:col-span-5">
        <div className="medieval-panel rounded-md p-6">
          {/* Portrait & Heraldic Identity */}
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-sm overflow-hidden border-2 border-[#a87a38] bg-[#0e0a07] shadow-lg">
                <PortraitImage
                  src={portraitUrl}
                  alt={`Retrato de ${character.name || 'Campeão'}`}
                  variant="hero"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="mt-2 text-center font-serif text-xs tracking-wider text-[#e5b865] font-bold">
                Nível {character.level}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <label
                htmlFor="character-name"
                className="block text-xs font-serif tracking-wider text-[#b39d82] mb-1.5"
              >
                Nome do Campeão
              </label>
              <input
                id="character-name"
                type="text"
                maxLength={32}
                value={character.name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Valerius"
                className="w-full bg-[#110c09] border border-[#5a432a] focus:border-[#d9a043] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/40 rounded-sm px-3.5 py-2 font-serif text-lg font-bold text-[#f6e6c8] transition-colors"
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#b39d82]">
                <span>
                  Raça:{' '}
                  <strong className="text-[#ede3d2] font-semibold">{character.race.name}</strong>
                </span>
                <span aria-hidden="true" className="text-[#785a36]">
                  ◈
                </span>
                <span>
                  Classe:{' '}
                  <strong className="text-[#ede3d2] font-semibold">
                    {character.characterClass.name}
                  </strong>
                </span>
                <span aria-hidden="true" className="text-[#785a36]">
                  ◈
                </span>
                <span>
                  Gênero:{' '}
                  <strong className="text-[#ede3d2] font-semibold">
                    {getGenderLabel(character.gender)}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenCreator}
                className="mt-3 medieval-btn-iron h-8 px-3 rounded-sm text-xs font-serif font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPen className="w-3.5 h-3.5 text-[#d9a043]" />
                <span>Personalizar Campeão</span>
              </button>
            </div>
          </div>

          <div className="medieval-divider my-6 text-[#9e7437] text-xs select-none" aria-hidden="true">
            ◈
          </div>

          {/* Vital Resource Bars */}
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-sm font-bold text-[#e5b865] tracking-wider">
              Atributos Vitais
            </h2>
            <span className="text-xs italic text-[#937f67]">Crônica salva localmente</span>
          </div>

          <div className="space-y-4">
            {/* HP */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-[#e0665e]">
                  <Heart className="w-3.5 h-3.5 fill-[#b91c1c] text-[#dc2626]" />
                  Vida (HP)
                </span>
                <span className="font-mono tabular-nums text-[#f0b4ae] font-semibold">
                  {maxHp} / {maxHp}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0e0a07] rounded-xs overflow-hidden border border-[#5e2220]">
                <div
                  className="h-full bg-gradient-to-r from-[#7f1d1d] via-[#b91c1c] to-[#dc2626]"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-[#9e8c76] mt-1">
                Base {classDef.baseVitals.hp} ({classDef.name}) + 4 por ponto em Constituição.
              </p>
            </div>

            {/* MP */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-[#6bb4dc]">
                  <Droplet className="w-3.5 h-3.5 fill-[#1d648c] text-[#38bdf8]" />
                  Mana (MP)
                </span>
                <span className="font-mono tabular-nums text-[#b8dcf0] font-semibold">
                  {maxMp} / {maxMp}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0e0a07] rounded-xs overflow-hidden border border-[#22475e]">
                <div
                  className="h-full bg-gradient-to-r from-[#16425c] via-[#1d648c] to-[#2e85b8]"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-[#9e8c76] mt-1">
                Base {classDef.baseVitals.mp} ({classDef.name}) + 4 por ponto em Inteligência
                {character.raceId === 'high_elf'
                  ? ` + ${elfMpBonus} MP (Maestria Arcana · +2/nível).`
                  : '.'}
              </p>
            </div>

            {/* EP */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-[#e5b865]">
                  <Zap className="w-3.5 h-3.5 fill-[#b87c26] text-[#e5b865]" />
                  Energia (EP)
                </span>
                <span className="font-mono tabular-nums text-[#f4dab0] font-semibold">
                  {maxEp} / {maxEp}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0e0a07] rounded-xs overflow-hidden border border-[#5e441d]">
                <div
                  className="h-full bg-gradient-to-r from-[#8c5a14] via-[#c98b2c] to-[#e5b865]"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-[#9e8c76] mt-1">
                Base 100 fixa · regenera <strong className="text-[#e5b865] font-medium">+20 EP por turno</strong>.
              </p>
            </div>
          </div>

          <div className="medieval-divider my-6 text-[#9e7437] text-xs select-none" aria-hidden="true">
            ◈
          </div>

          {/* Racial Passive + Class Skills/Spells + Equipped Weapon */}
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-sm font-bold text-[#e5b865]">
                  {character.race.passive.name}
                </h3>
                <span className="text-xs text-[#937f67]">
                  Passiva Racial · {character.race.name}
                </span>
              </div>
              <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                {character.race.passive.description}
              </p>
            </div>

            {character.classId === 'warrior' ? (
              <>
                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#f2dfb9] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#f09a4e]" />
                      Golpe Duplo
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Ação Padrão · {DOUBLE_STRIKE_EP_COST} EP
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Arte Marcial de Guerreiro: desfere dois ataques físicos consecutivos com a espada
                    equipada no mesmo turno (alcance 1,5m).
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fda4af] flex items-center gap-1.5">
                      <Skull className="w-3.5 h-3.5 text-[#fb7185]" />
                      Carrasco
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {EXECUTIONER_EP_COST} EP · {executionerBaseText} / {executionerLowHpText} Fís.
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Golpe poderoso (alcance 1,5m): causa o dano do ataque básico{' '}
                    <span className="font-mono tabular-nums text-[#fda4af] font-semibold">
                      +{EXECUTIONER_BASE_BONUS_DAMAGE} de dano
                    </span>
                    . Se o inimigo estiver com{' '}
                    <strong className="text-[#ede3d2]">50% de vida ou menos</strong>, o bônus aumenta
                    para{' '}
                    <span className="font-mono tabular-nums text-[#fb7185] font-semibold">
                      +{EXECUTIONER_LOW_HP_BONUS_DAMAGE}
                    </span>
                    .
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#c7e6f7] flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-[#f09a4e]" />
                      Contra-Ataque
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Reação · {COUNTER_ATTACK_EP_COST} EP · 50% Dano
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Ao sofrer um ataque inimigo dentro do alcance da arma (1,5m), você desfere um{' '}
                    <strong className="text-[#ede3d2]">ataque básico</strong> contra o atacante
                    causando <span className="font-mono text-[#f2dfb9]">metade do dano</span>.
                  </p>
                </div>
              </>
            ) : character.classId === 'knight' ? (
              <>
                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#f2dfb9] flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-[#f28b82]" />
                      Provocar
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Ação Padrão · {KNIGHT_TAUNT_EP_COST} EP
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Obriga <strong className="text-[#ede3d2]">1 inimigo</strong> a até{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">6,0m</span> a atacar
                    exclusivamente você por{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">2 rodadas</span> e concede{' '}
                    <span className="font-mono tabular-nums text-[#fde68a] font-semibold">
                      +{KNIGHT_TAUNT_DEFENSE_BONUS} Defesa Física e Mágica
                    </span>{' '}
                    contra o inimigo enquanto o efeito de Provocar durar.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#f3d189]" />
                      Levantar Guarda
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Reação · {RAISE_GUARD_EP_COST} EP
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Habilidade de reação ativada ao receber um ataque inimigo: concede{' '}
                    <span className="font-mono tabular-nums text-[#fde68a] font-semibold">
                      +{RAISE_GUARD_PHYSICAL_DEFENSE_BONUS} de Defesa Física
                    </span>{' '}
                    contra o próximo ataque.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fde68a] flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-[#fbbf24]" />
                      Investida Galante
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {GALLANT_CHARGE_EP_COST} EP · {gallantChargeText} Físico
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Ataque em investida: avança em linha reta até{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {GALLANT_CHARGE_RANGE_METERS.toFixed(1).replace('.', ',')}m
                    </span>{' '}
                    em uma direção, <strong className="text-[#ede3d2]">podendo atravessar inimigos</strong>,
                    e golpeia o inimigo no trajeto com{' '}
                    <span className="font-mono tabular-nums text-[#fde68a] font-semibold">
                      +{GALLANT_CHARGE_BONUS_DAMAGE} de Ataque Físico
                    </span>{' '}
                    durante a investida.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-[#facc15]" />
                      Estandarte da Glória
                    </h3>
                    <span className="text-xs text-[#7dd3fc] font-mono tabular-nums font-medium">
                      {BANNER_OF_GLORY_MP_COST} MP ·{' '}
                      {BANNER_OF_GLORY_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m · Raio{' '}
                      {BANNER_OF_GLORY_RADIUS_METERS.toFixed(1).replace('.', ',')}m
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Lança uma lança com estandarte que finca no chão (até{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {BANNER_OF_GLORY_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m
                    </span>
                    ). Inimigos na área sofrem{' '}
                    <span className="font-mono tabular-nums text-[#93c5fd] font-semibold">
                      {BANNER_OF_GLORY_MAGIC_DAMAGE} de dano mágico
                    </span>{' '}
                    +{' '}
                    <span className="font-mono tabular-nums text-[#fde68a] font-semibold">
                      ataque físico do cavaleiro
                    </span>
                    . Uma área de energia da justiça se forma em um raio de{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {BANNER_OF_GLORY_RADIUS_METERS.toFixed(1).replace('.', ',')}m
                    </span>{' '}
                    por{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {BANNER_OF_GLORY_DURATION_ROUNDS} rodadas
                    </span>
                    , concedendo{' '}
                    <span className="font-mono tabular-nums text-[#fef08a] font-semibold">
                      {BANNER_OF_GLORY_SHIELD_HP} pontos de escudo
                    </span>{' '}
                    aos aliados no início de seus turnos.
                  </p>
                </div>
              </>
            ) : character.classId === 'priest' ? (
              <>
                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fef08a] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#facc15]" />
                      Raio Divino
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {PRIEST_BASIC_EP_COST} EP · {priestBasicText} Mágico ·{' '}
                      {PRIEST_BASIC_RANGE_METERS.toFixed(1).replace('.', ',')}m
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Ataque básico canalizado pelo <strong className="text-[#ede3d2]">Grimório Sagrado</strong>:
                    dispara um leve feixe de energia divina que causa dano mágico.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#6ee7b7] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#34d399]" />
                      Luz Restauradora
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      {RESTORING_LIGHT_MP_COST} MP (+{RESTORING_LIGHT_HEAL_UPGRADE_MP}/+
                      {RESTORING_LIGHT_REGEN_UPGRADE_MP} MP)
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Cura{' '}
                    <span className="font-mono tabular-nums text-[#6ee7b7] font-semibold">
                      {priestRestoringBaseHeal} HP
                    </span>
                    {secondary.healingBonus > 0 && (
                      <span className="font-mono text-[#86efac]">
                        {' '}
                        (+{secondary.healingBonus} Sab.)
                      </span>
                    )}{' '}
                    do alvo. Aprimoramentos:{' '}
                    <strong className="text-[#ede3d2]">+{RESTORING_LIGHT_HEAL_UPGRADE_MP} PM</strong>{' '}
                    aumenta a cura para{' '}
                    <span className="font-mono tabular-nums text-[#6ee7b7]">
                      {priestRestoringUpgradedHeal} HP
                    </span>
                    ;{' '}
                    <strong className="text-[#ede3d2]">+{RESTORING_LIGHT_REGEN_UPGRADE_MP} PM</strong>{' '}
                    concede <strong className="text-[#fde68a]">Regeneração</strong> (+
                    {priestRestoringRegenHeal} HP no início de cada turno por{' '}
                    {RESTORING_LIGHT_REGEN_ROUNDS} rodadas).
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fde68a] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#facc15]" />
                      Consagração
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      {CONSECRATION_MP_COST} MP · {CONSECRATION_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m (Raio{' '}
                      {CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m)
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Consagra um ponto a até{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {CONSECRATION_CAST_RANGE_METERS.toFixed(1).replace('.', ',')}m
                    </span>
                    , curando{' '}
                    <span className="font-mono tabular-nums text-[#6ee7b7] font-semibold">
                      {priestConsecrationHeal} pontos de vida
                    </span>
                    {secondary.healingBonus > 0 && (
                      <span className="font-mono text-[#86efac]">
                        {' '}
                        (+{secondary.healingBonus} Sab.)
                      </span>
                    )}{' '}
                    em um raio de{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {CONSECRATION_RADIUS_METERS.toFixed(1).replace('.', ',')}m
                    </span>
                    .
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fffbeb] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#fde68a]" />
                      Proteção Sagrada
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      {SACRED_PROTECTION_MP_COST} MP · +{SACRED_PROTECTION_SHIELD_HP} Escudo (
                      {SACRED_PROTECTION_DURATION_ROUNDS}R)
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Envolve o alvo com um escudo divino que concede{' '}
                    <span className="font-mono tabular-nums text-[#fef08a] font-semibold">
                      {SACRED_PROTECTION_SHIELD_HP} pontos de escudo (sobrevida)
                    </span>{' '}
                    durante {SACRED_PROTECTION_DURATION_ROUNDS} rodada.
                  </p>
                </div>
              </>
            ) : character.classId === 'rogue' ? (
              <>
                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fca5a5] flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-[#ef4444]" />
                      Arremesso de Adaga
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {DAGGER_THROW_EP_COST} EP · {DAGGER_THROW_RANGE_METERS.toFixed(1).replace('.', ',')}m · {daggerThrowText} Fís.
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Lança uma adaga causando dano físico padrão{' '}
                    <span className="font-mono text-[#fca5a5] font-semibold">
                      +{DAGGER_THROW_BONUS_DAMAGE} ({daggerThrowText})
                    </span>{' '}
                    e <strong className="text-[#fca5a5]">Sangramento</strong> ({DAGGER_THROW_BLEED_DAMAGE} de dano por rodada durante{' '}
                    {DAGGER_THROW_BLEED_ROUNDS} rodadas; não pode causar acerto crítico).
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#d8b4fe] flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-[#a855f7]" />
                      Furtividade
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {STEALTH_EP_COST} EP · {STEALTH_DURATION_ROUNDS} rodadas
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Entra em invisibilidade por {STEALTH_DURATION_ROUNDS} rodadas mantendo seu deslocamento normal (inimigos têm{' '}
                    <span className="font-mono text-[#e9d5ff] font-semibold">{STEALTH_DETECTION_CHANCE}%</span> de chance de perceber sua presença). Enquanto invisível, seu próximo ataque básico causa{' '}
                    <span className="font-mono text-[#d8b4fe] font-semibold">+{STEALTH_BONUS_DAMAGE} dano físico</span>, mas você sofre{' '}
                    <span className="font-mono text-[#fca5a5] font-semibold">+{STEALTH_EXTRA_DAMAGE_TAKEN} dano extra</span>. Atacar encerra a furtividade.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#6ee7b7] flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-[#10b981]" />
                      Disparada
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {SPRINT_EP_COST} EP · 2× Deslocamento
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Permite andar até o dobro do seu deslocamento (<span className="font-mono text-[#6ee7b7]">12,0m</span>) neste turno sem consumir sua Ação Padrão.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fda4af] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#f43f5e]" />
                      Letalidade
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      {LETHALITY_EP_COST} EP · {lethalityText} Fís. · Costas
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Usável apenas nas <strong className="text-[#ede3d2]">costas do inimigo</strong> (1,5m): desfere um ataque somando sua{' '}
                    <span className="font-mono text-[#fda4af] font-semibold">
                      Destreza (+{character.attributes.dexterity})
                    </span>{' '}
                    ao dano, com{' '}
                    <span className="font-mono text-[#fda4af] font-semibold">{LETHALITY_CRIT_CHANCE}% de chance crítica</span>. Se estiver invisível, ganha também{' '}
                    <span className="font-mono text-[#d8b4fe] font-semibold">+{LETHALITY_STEALTH_CRIT_DMG_BONUS}% de dano crítico</span> (+75% total).
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#f2dfb9] flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-[#e5b865]" />
                      Golpe Básico
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      15 EP · {mageBasicText} Físico
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Ataque físico corpo a corpo (1,5m) que causa dano igual a{' '}
                    <strong className="text-[#ede3d2]">Força + Dano Físico</strong>.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#bae6fd] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                      Seta Arcana
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      3 MP (+2 MP = 2 setas) · 9,0m
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Dispara uma seta de mana pura causando{' '}
                    <span className="font-mono tabular-nums text-[#bae6fd] font-semibold">
                      {arcaneBoltDmg} de dano mágico
                    </span>{' '}
                    (5 + Dano Mágico). Com +2 MP (5 MP total), dispara 2 setas causando metade do
                    dano em cada uma (
                    <span className="font-mono tabular-nums text-[#c4b5fd] font-semibold">
                      2×{arcaneBoltUpgradedDmg}
                    </span>
                    ).
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#bae6fd] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#7dd3fc]" />
                      Armadura Arcana
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      {ARCANE_ARMOR_MP_COST} MP · +{ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} Def. Fís. ·{' '}
                      {ARCANE_ARMOR_DURATION_ROUNDS}R
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Uso exclusivo em você: reveste o mago com placas de mana e concede{' '}
                    <span className="font-mono tabular-nums text-[#bae6fd] font-semibold">
                      +{ARCANE_ARMOR_PHYSICAL_DEFENSE_BONUS} de Defesa Física
                    </span>{' '}
                    durante{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">
                      {ARCANE_ARMOR_DURATION_ROUNDS} rodadas
                    </span>
                    .
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#fed7aa] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#f97316]" />
                      Baforada de Fogo
                    </h3>
                    <span className="text-xs text-[#fb923c] font-mono tabular-nums font-medium">
                      9 MP · Cone 6,0m
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Cone flamejante de 6 metros a partir de você, causando{' '}
                    <span className="font-mono tabular-nums text-[#fed7aa] font-semibold">
                      {fireBreathDmg} de dano de fogo
                    </span>{' '}
                    (12 + Dano Mágico) na área.
                  </p>
                </div>
              </>
            )}

            {/* Equipped Weapon Control */}
            <div className="pt-3.5 border-t border-[#3b2c1e]/80">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-[#d9a043] shrink-0" />
                    <span className="font-serif text-sm font-bold text-[#f5e7ce] truncate">
                      {character.equippedWeapon ? character.equippedWeapon.name : 'Desarmado'}
                    </span>
                  </div>
                  <p className="text-xs text-[#a6957e] mt-1 font-mono tabular-nums">
                    {character.equippedWeapon
                      ? `Empunhada · 1,5m · Dano Físico ${physicalDamageText}`
                      : `Sem arma · Dano Físico ${physicalDamageText} (desarmado)`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onToggleWeapon}
                  className="medieval-btn-iron shrink-0 min-h-10 px-3.5 py-2 rounded-sm text-xs font-serif font-bold tracking-wide transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/60 cursor-pointer"
                >
                  {character.equippedWeapon ? 'Guardar' : 'Empunhar'}
                </button>
              </div>
            </div>

            {/* Derived Carry Capacity */}
            <div className="pt-3.5 border-t border-[#3b2c1e]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-[#a6957e]">
                <Package className="w-3.5 h-3.5 text-[#8c6e46]" />
                Capacidade de Carga
              </span>
              <span className="font-mono tabular-nums text-[#ede3d2] font-semibold">
                {carryCapacity} kg{' '}
                <span className="text-[#8a7863] font-normal">(10 + {totalStrength} × 5)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Medieval Attribute Grimoire + Secondary Attributes */}
      <div id="atributos" className="lg:col-span-7 space-y-6">
        <div className="medieval-panel rounded-md p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#473421]">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#e5b865] tracking-wider">
                Distribuição de Atributos
              </h2>
              <p className="text-sm text-[#b39d82] mt-1">
                Todos os atributos partem de 0. Forje o estilo de batalha do seu campeão com {INITIAL_POINTS} pontos
                livres.
              </p>
            </div>

            <div className="text-right bg-[#110c09] border border-[#5c4327] px-4 py-2 rounded-sm">
              <div className="text-xs font-serif text-[#b39d82]">Pontos Livres</div>
              <div className="font-mono tabular-nums text-3xl font-bold text-[#e5b865] leading-none mt-1">
                {character.unspentPoints}
              </div>
            </div>
          </div>

          {/* 6 d20 Primary Attribute Rows */}
          <div className="divide-y divide-[#38291b] mt-2">
            {ATTRIBUTE_LIST.map((attr) => {
              const Icon = ATTRIBUTE_ICONS[attr.key];
              const allocated = character.attributes[attr.key];

              return (
                <div
                  key={attr.key}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-sm bg-[#120d09] border border-[#543d25] flex items-center justify-center shrink-0 text-[#d9a043]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-[#f3e5cc]">
                        {attr.label}
                      </h3>
                      <p className="text-xs text-[#ab9982] mt-0.5 leading-relaxed">
                        {attr.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center self-end sm:self-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      aria-label={`Diminuir ${attr.label}`}
                      disabled={allocated <= 0}
                      onClick={() => onDecrementAttribute(attr.key)}
                      className="medieval-btn-iron w-10 h-10 rounded-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/60"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-12 text-center font-mono tabular-nums">
                      <div className="text-xl font-bold text-[#e5b865] leading-tight">
                        {allocated}
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Aumentar ${attr.label}`}
                      disabled={character.unspentPoints <= 0}
                      onClick={() => onIncrementAttribute(attr.key)}
                      className="w-10 h-10 rounded-sm bg-[#3b2611] hover:bg-[#4f3316] border border-[#9e7032] text-[#f4d79b] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/60"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="medieval-divider my-5 text-[#9e7437] text-xs select-none" aria-hidden="true">
            ATRIBUTOS SECUNDÁRIOS
          </div>

          {/* 8 Derived Secondary Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryRows.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="bg-[#120d09] border border-[#453320] rounded-sm px-3.5 py-2.5 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${item.accent}`} />
                      <h3 className="font-serif text-xs font-bold text-[#f0e0c4] tracking-wide">
                        {item.label}
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#9e8c76] mt-1 leading-snug">{item.hint}</p>
                  </div>
                  <span
                    className={`font-mono tabular-nums text-base font-bold shrink-0 ${item.accent}`}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 mt-6 border-t border-[#473421] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResetAttributes}
              disabled={spentPoints === 0}
              className="medieval-btn-iron min-h-11 px-4 py-2.5 rounded-sm text-sm font-serif font-bold tracking-wide transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9943b]/60"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar Atributos</span>
            </button>

            <button
              type="button"
              onClick={onOpenArena}
              className="medieval-btn-gold min-h-11 px-6 py-2.5 rounded-sm font-serif font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865]"
            >
              <Swords className="w-4 h-4" />
              <span>Testar em Combate (Arena)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
