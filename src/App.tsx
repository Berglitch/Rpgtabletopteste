import { useEffect, useState } from 'react';
import { Swords } from 'lucide-react';
import { ArenaSelectScreen } from './components/ArenaSelectScreen';
import { CharacterCreator } from './components/CharacterCreator';
import { CharacterSheet } from './components/CharacterSheet';
import { TacticalArenaModal } from './components/TacticalArenaModal';
import { gameAudio } from './game/audio';
import {
  INITIAL_POINTS,
  buildCharacterClassSnapshot,
  buildCharacterRaceSnapshot,
  getAppearanceOption,
  getDefaultPortraitFor,
  getDefaultWeaponForClass,
  loadCharacterState,
  saveCharacterState,
} from './game/engine';
import type {
  AttributeKey,
  CharacterState,
  ClassId,
  EnemyId,
  GenderId,
  RaceId,
} from './game/types';

type AppView = 'creator' | 'sheet' | 'arenas';

export default function App() {
  const [character, setCharacter] = useState<CharacterState>(() => loadCharacterState());
  const [activeView, setActiveView] = useState<AppView>('creator');
  const [selectedArenaEnemyId, setSelectedArenaEnemyId] = useState<EnemyId>('goblin');
  const [isArenaOpen, setIsArenaOpen] = useState(false);

  // Auto-save character sheet changes to localStorage
  useEffect(() => {
    saveCharacterState(character);
  }, [character]);

  // Unlock browser Web Audio context on first user interaction
  useEffect(() => {
    const unlock = () => {
      gameAudio.init();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const handleNameChange = (name: string) => {
    setCharacter((prev) => ({ ...prev, name }));
  };

  const handleSelectRace = (raceId: RaceId, autoMatchPortrait: boolean) => {
    setCharacter((prev) => ({
      ...prev,
      raceId,
      race: buildCharacterRaceSnapshot(raceId),
      portraitId: autoMatchPortrait
        ? getDefaultPortraitFor(raceId, prev.classId, prev.gender)
        : prev.portraitId,
    }));
  };

  const handleSelectClass = (classId: ClassId, autoMatchPortrait: boolean) => {
    setCharacter((prev) => ({
      ...prev,
      classId,
      characterClass: buildCharacterClassSnapshot(classId),
      equippedWeapon:
        prev.equippedWeapon !== null ? getDefaultWeaponForClass(classId) : null,
      portraitId: autoMatchPortrait
        ? getDefaultPortraitFor(prev.raceId, classId, prev.gender)
        : prev.portraitId,
    }));
  };

  const handleSelectGender = (gender: GenderId) => {
    setCharacter((prev) => ({
      ...prev,
      gender,
      portraitId: getDefaultPortraitFor(prev.raceId, prev.classId, gender),
    }));
  };

  const handleSelectPortrait = (portraitId: string) => {
    const matchedOption = getAppearanceOption(portraitId);
    setCharacter((prev) => ({
      ...prev,
      gender: matchedOption.gender,
      portraitId,
    }));
  };

  const handleIncrementAttribute = (attr: AttributeKey) => {
    setCharacter((prev) => {
      if (prev.unspentPoints <= 0) return prev;
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: prev.attributes[attr] + 1,
        },
        unspentPoints: prev.unspentPoints - 1,
      };
    });
  };

  const handleDecrementAttribute = (attr: AttributeKey) => {
    setCharacter((prev) => {
      if (prev.attributes[attr] <= 0) return prev;
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attr]: prev.attributes[attr] - 1,
        },
        unspentPoints: prev.unspentPoints + 1,
      };
    });
  };

  const handleResetAttributes = () => {
    setCharacter((prev) => ({
      ...prev,
      attributes: {
        strength: 0,
        constitution: 0,
        dexterity: 0,
        intelligence: 0,
        charisma: 0,
        wisdom: 0,
      },
      unspentPoints: INITIAL_POINTS,
    }));
  };

  const handleToggleWeapon = () => {
    setCharacter((prev) => ({
      ...prev,
      equippedWeapon: prev.equippedWeapon ? null : getDefaultWeaponForClass(prev.classId),
    }));
  };

  const handleConfirmCharacter = () => {
    setCharacter((prev) => ({
      ...prev,
      name: prev.name.trim() || 'Valerius',
      hasCompletedCreation: true,
    }));
    setActiveView('sheet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCodex = () => {
    if (activeView !== 'sheet') {
      setActiveView('sheet');
      setTimeout(() => {
        document.getElementById('regras')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById('regras')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Clean 3-Zone Medieval Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#4d3924] bg-[#120d09]/95 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveView('creator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-serif text-lg sm:text-xl font-bold tracking-wider text-[#e5b865] whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Crônicas de Sangue &amp; Glória
          </button>

          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-serif tracking-wide text-[#b5a38d]">
            <button
              type="button"
              onClick={() => {
                setActiveView('creator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                activeView === 'creator'
                  ? 'text-[#e5b865] border-[#d9a043] font-bold'
                  : 'border-transparent hover:text-[#e5b865]'
              }`}
            >
              Criação
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('sheet');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 ${
                activeView === 'sheet'
                  ? 'text-[#e5b865] border-[#d9a043] font-bold'
                  : 'border-transparent hover:text-[#e5b865]'
              }`}
            >
              Ficha
            </button>
            <button
              type="button"
              onClick={handleNavigateToCodex}
              className="hidden md:inline-block border-b-2 border-transparent hover:text-[#e5b865] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Códice de Guerra
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveView('arenas');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="medieval-btn-gold min-h-10 px-4 py-2 rounded-sm font-serif font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5b865]"
            >
              <Swords className="w-4 h-4" />
              <span>Entrar na Arena</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-12">
        {activeView === 'creator' ? (
          <CharacterCreator
            character={character}
            onNameChange={handleNameChange}
            onSelectRace={handleSelectRace}
            onSelectClass={handleSelectClass}
            onSelectGender={handleSelectGender}
            onSelectPortrait={handleSelectPortrait}
            onIncrementAttribute={handleIncrementAttribute}
            onDecrementAttribute={handleDecrementAttribute}
            onResetAttributes={handleResetAttributes}
            onConfirmCharacter={handleConfirmCharacter}
          />
        ) : activeView === 'arenas' ? (
          <ArenaSelectScreen
            character={character}
            onSelectArena={(enemyId) => {
              setSelectedArenaEnemyId(enemyId);
              setIsArenaOpen(true);
            }}
            onBackToSheet={() => {
              setActiveView('sheet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            <CharacterSheet
              character={character}
              onNameChange={handleNameChange}
              onIncrementAttribute={handleIncrementAttribute}
              onDecrementAttribute={handleDecrementAttribute}
              onResetAttributes={handleResetAttributes}
              onToggleWeapon={handleToggleWeapon}
              onOpenArena={() => {
                setActiveView('arenas');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCreator={() => {
                setActiveView('creator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Medieval Codex of War Reference */}
            <section id="regras" className="pt-4 space-y-6">
              <div className="medieval-divider text-[#b88940] font-serif text-xs tracking-widest">
                CÓDICE DE GUERRA
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h2 className="font-serif text-base font-bold text-[#e5b865] tracking-wide">
                    Ação de Movimento &amp; Oportunidade
                  </h2>
                  <p className="text-sm text-[#b39d82] mt-2 leading-relaxed">
                    Cada combatente usa sua <strong className="text-[#ede3d2]">Ação de Movimento</strong> para
                    percorrer até <span className="font-mono tabular-nums text-[#f2dfb9]">6,0m</span> por turno
                    (ortogonal <span className="font-mono tabular-nums text-[#f2dfb9]">1,5m</span>, diagonal{' '}
                    <span className="font-mono tabular-nums text-[#7ec4e8]">3,0m</span>). Mover-se adjacente a um
                    inimigo ativo provoca <strong className="text-[#ede3d2]">Ataque de Oportunidade</strong>.
                  </p>
                </div>

                <div>
                  <h2 className="font-serif text-base font-bold text-[#e5b865] tracking-wide">
                    Ação Padrão: Classes em Combate
                  </h2>
                  <p className="text-sm text-[#b39d82] mt-2 leading-relaxed">
                    <strong className="text-[#ede3d2]">Guerreiros</strong> usam Golpe Duplo, Carrasco (+5/+7 dano) e reagem com Contra-Ataque.{' '}
                    <strong className="text-[#fde68a]">Cavaleiros</strong> investem com Investida Galante (9m, +5 Ataque Fís.),
                    Provocar (+3 Def. Fís./Mág.) e reagem com Levantar Guarda.{' '}
                    <strong className="text-[#bae6fd]">Magos</strong> canalizam Seta Arcana, Armadura Arcana e Baforada de Fogo.{' '}
                    <strong className="text-[#fffbeb]">Sacerdotes</strong> disparam Raio Divino e abençoam com Luz Restauradora, Consagração e Proteção Sagrada.
                  </p>
                </div>

                <div>
                  <h2 className="font-serif text-base font-bold text-[#e5b865] tracking-wide">
                    Defesas, Crítico &amp; Evasão
                  </h2>
                  <p className="text-sm text-[#b39d82] mt-2 leading-relaxed">
                    Cada ponto de <strong className="text-[#ede3d2]">Defesa Física/Mágica</strong> reduz o dano
                    recebido. Apenas ataques físicos causam{' '}
                    <strong className="text-[#ede3d2]">Crítico (+50%)</strong> (base{' '}
                    <span className="font-mono tabular-nums text-[#e5b865]">1%</span>), e a{' '}
                    <strong className="text-[#ede3d2]">Evasão</strong> (base{' '}
                    <span className="font-mono tabular-nums text-[#60c28c]">1%</span>) ignora completamente dano e
                    efeitos.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-[#3b2c1e] py-6 text-center text-xs font-serif tracking-wider text-[#8a7863]">
        <p>Crônicas de Sangue &amp; Glória · RPG Tático Medieval</p>
      </footer>

      <TacticalArenaModal
        isOpen={isArenaOpen}
        character={character}
        initialEnemyId={selectedArenaEnemyId}
        onClose={() => {
          setIsArenaOpen(false);
          setActiveView('sheet');
        }}
        onBackToArenaSelect={() => {
          setIsArenaOpen(false);
          setActiveView('arenas');
        }}
      />
    </div>
  );
}
