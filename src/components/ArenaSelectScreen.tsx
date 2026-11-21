import { useState } from 'react';
import { ArrowLeft, Crown, Shield, Skull, Swords } from 'lucide-react';
import {
  ARENA_DEFINITIONS,
  getAppearanceOption,
  getClassDefinition,
  getRaceDefinition,
  type ArenaDefinition,
} from '../game/engine';
import type { CharacterState, EnemyId } from '../game/types';
import { PortraitImage } from './PortraitImage';

interface ArenaSelectScreenProps {
  character: CharacterState;
  onSelectArena: (enemyId: EnemyId) => void;
  onBackToSheet: () => void;
}

export function ArenaSelectScreen({
  character,
  onSelectArena,
  onBackToSheet,
}: ArenaSelectScreenProps) {
  const [hoveredArenaId, setHoveredArenaId] = useState<EnemyId | null>(null);

  const heroName = character.name.trim() || 'Valerius';
  const heroPortrait = getAppearanceOption(character.portraitId).imageUrl;
  const raceDef = getRaceDefinition(character.raceId);
  const classDef = getClassDefinition(character.classId);

  return (
    <section
      aria-label="Seleção de Arena"
      className="space-y-8 animate-[fadeIn_0.25s_ease-out]"
    >
      {/* Header Row: Title + Hero Ready Indicator + Back */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#4a3622] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-[0.2em] text-[#c79a4b]">
            <Swords className="w-3.5 h-3.5" />
            <span>Salão das Arenas</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-[#f2dfb9]">
            Escolha o Campo de Batalha
          </h1>
          <p className="text-sm text-[#a6957e] max-w-2xl">
            Passe o mouse sobre o grid de cada arena para ver o inimigo e o nível de dificuldade
            antes de iniciar o combate.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-sm border border-[#4a3622] bg-[#16100b]/90">
            <PortraitImage
              src={heroPortrait}
              alt={heroName}
              variant="hero"
              className="w-8 h-8 rounded-full object-cover object-top border border-[#b88940]"
            />
            <div className="leading-tight">
              <div className="font-serif text-xs font-bold text-[#f3d189]">{heroName}</div>
              <div className="text-[11px] text-[#a6957e]">
                {raceDef.name} · {classDef.name}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToSheet}
            className="medieval-btn-iron min-h-10 px-4 py-2 rounded-sm font-serif text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Ficha</span>
          </button>
        </div>
      </div>

      {/* Arena Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {ARENA_DEFINITIONS.map((arena: ArenaDefinition) => {
          const isHovered = hoveredArenaId === arena.id;
          const isVeryHard = arena.difficulty === 'Muito Difícil';

          return (
            <button
              key={arena.id}
              type="button"
              onClick={() => onSelectArena(arena.id)}
              onMouseEnter={() => setHoveredArenaId(arena.id)}
              onMouseLeave={() =>
                setHoveredArenaId((cur) => (cur === arena.id ? null : cur))
              }
              onFocus={() => setHoveredArenaId(arena.id)}
              onBlur={() =>
                setHoveredArenaId((cur) => (cur === arena.id ? null : cur))
              }
              aria-label={`Arena ${arena.arenaName} — Monstro: ${arena.monsterName}, Dificuldade: ${arena.difficulty}`}
              className={`group relative text-left rounded-sm overflow-hidden border-2 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865] ${
                isVeryHard
                  ? 'border-[#5a3b22] hover:border-[#4ade80] hover:shadow-[0_0_32px_rgba(74,222,128,0.22)]'
                  : 'border-[#5a3b22] hover:border-[#e5b865] hover:shadow-[0_0_32px_rgba(229,184,101,0.22)]'
              } bg-[#110c08]`}
            >
              {/* Arena Grid Icon Preview (Full Battleground Map + Subtle Tactical Grid Mesh) */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={arena.gridImageUrl}
                  alt={`Grid da arena ${arena.arenaName}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Subtle Tactical Grid Overlay so it clearly reads as the playable arena grid */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-45"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,244,214,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,244,214,0.16) 1px, transparent 1px)',
                    backgroundSize: '12.5% 20%',
                  }}
                />

                {/* Soft vignette for contrast */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0d0906]/90 via-[#0d0906]/15 to-[#0d0906]/35 transition-opacity duration-300 group-hover:opacity-95"
                />

                {/* Resting Nameplate (Bottom-Left) */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3 transition-all duration-300 ${
                    isHovered ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f5e7c9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {arena.arenaName}
                    </h2>
                  </div>
                  <span className="text-[11px] font-serif text-[#cbb595] bg-[#140e09]/85 border border-[#523b23] px-2.5 py-1 rounded-xs">
                    Inspecionar
                  </span>
                </div>

                {/* HOVER / FOCUS OVERLAY: Place Name + Monster Name + Difficulty Only (No HP, No Spoilers) */}
                <div
                  className={`absolute inset-0 p-5 flex flex-col justify-between bg-[#0e0a07]/84 backdrop-blur-[3px] transition-all duration-250 ${
                    isHovered
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  {/* Top Row: Place Name + Difficulty Stamp */}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#f5e7c9] leading-tight">
                      {arena.arenaName}
                    </h2>

                    <div
                      className={`px-3 py-1 rounded-xs border font-serif text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shrink-0 ${
                        isVeryHard
                          ? 'bg-[#361012]/95 border-[#ef4444] text-[#fecaca]'
                          : 'bg-[#33200b]/95 border-[#f59e0b] text-[#fde68a]'
                      }`}
                    >
                      {isVeryHard ? (
                        <Skull className="w-3.5 h-3.5 text-[#f87171]" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-[#fbbf24]" />
                      )}
                      <span>{arena.difficulty}</span>
                    </div>
                  </div>

                  {/* Center Row: Monster Portrait & Name Only */}
                  <div className="flex items-center gap-4 my-auto py-2">
                    <div
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shrink-0 shadow-xl ${
                        arena.isBoss
                          ? 'border-[#4ade80] bg-[#0b1f13]'
                          : 'border-[#d9a043] bg-[#1e150e]'
                      }`}
                    >
                      <PortraitImage
                        src={arena.monsterPortraitUrl}
                        alt={arena.monsterName}
                        variant="enemy"
                        className={`w-full h-full object-cover ${
                          arena.isBoss ? 'object-center' : 'object-top'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="text-[11px] font-serif uppercase tracking-widest text-[#a6957e]">
                        Oponente
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {arena.isBoss && (
                          <Crown className="w-4 h-4 text-[#4ade80] shrink-0" />
                        )}
                        <h3
                          className={`font-serif text-xl sm:text-2xl font-bold leading-tight ${
                            arena.isBoss ? 'text-[#bbf7d0]' : 'text-[#f3d189]'
                          }`}
                        >
                          {arena.monsterName}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA Bar */}
                  <div className="pt-2.5 border-t border-[#3b2c1e] flex items-center justify-between gap-2">
                    <span className="text-xs font-serif text-[#a6957e]">
                      Dificuldade:{' '}
                      <strong
                        className={
                          isVeryHard ? 'text-[#f87171]' : 'text-[#fbbf24]'
                        }
                      >
                        {arena.difficulty}
                      </strong>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xs font-serif text-xs font-bold tracking-wide ${
                        arena.isBoss
                          ? 'bg-[#143d25] border border-[#4ade80]/70 text-[#dcfce7]'
                          : 'bg-[#38250f] border border-[#d9a043]/80 text-[#fef3c7]'
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Entrar nesta Arena</span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
