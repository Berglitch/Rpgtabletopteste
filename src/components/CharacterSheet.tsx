import {
  BookOpen,
  Crosshair,
  Crown,
  Droplet,
  Eye,
  Flame,
  Heart,
  Megaphone,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Shield,
  Sparkles,
  Sword,
  Swords,
  Target,
  UserPen,
  Wand2,
  Wind,
  Zap,
} from 'lucide-react';
import {
  ATTRIBUTE_LIST,
  INITIAL_POINTS,
  getArcaneBoltDamage,
  getArcaneShieldAmount,
  getCalculatedStrength,
  getCarryCapacity,
  getCharacterPortraitUrl,
  getClassDefinition,
  getDwarfDefenseBonus,
  getGenderLabel,
  getHighElfLevelMpBonus,
  getMageBasicAttackRange,
  getMaxEp,
  getMaxHp,
  getMaxMp,
  getSecondaryStats,
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
  const mageBasicRange = getMageBasicAttackRange(character);
  const arcaneBoltDmg = getArcaneBoltDamage(character);
  const arcaneShieldVal = getArcaneShieldAmount(character);
  const spentPoints = INITIAL_POINTS - character.unspentPoints;

  const physicalDamageText =
    dmgRange.min === dmgRange.max ? `${dmgRange.min}` : `${dmgRange.min}–${dmgRange.max}`;
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
                      <Megaphone className="w-3.5 h-3.5 text-[#f28b82]" />
                      Provocar I
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Ação Padrão · 30 EP
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Habilidade inicial de Guerreiro: afeta apenas{' '}
                    <strong className="text-[#ede3d2]">1 inimigo</strong> a até{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">6,0m</span>, obrigando-o a
                    atacar exclusivamente quem usou a habilidade durante{' '}
                    <span className="font-mono tabular-nums text-[#f2dfb9]">2 rodadas</span>.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#f2dfb9] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#f09a4e]" />
                      Golpe Duplo
                    </h3>
                    <span className="text-xs text-[#e5b865] font-mono tabular-nums font-medium">
                      Ação Padrão · 30 EP
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Arte Marcial de Guerreiro: desfere dois ataques físicos consecutivos com a espada
                    equipada no mesmo turno (alcance 1,5m).
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
                    (5 + Dano Mágico). Com +2 MP (5 MP total), dispara 2 setas no mesmo alvo ou em
                    alvos diferentes.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#3b2c1e]/80">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-sm font-bold text-[#bae6fd] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#7dd3fc]" />
                      Escudo Arcano
                    </h3>
                    <span className="text-xs text-[#84c4e6] font-mono tabular-nums font-medium">
                      5 MP · {arcaneShieldVal} Sobrevida
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a38d] mt-1 leading-relaxed">
                    Uso exclusivo em você: concede{' '}
                    <span className="font-mono tabular-nums text-[#bae6fd] font-semibold">
                      {arcaneShieldVal} pontos de Sobrevida
                    </span>{' '}
                    (5 + Inteligência) até ser quebrado.
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
                      12 de dano de fogo
                    </span>{' '}
                    na área.
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
