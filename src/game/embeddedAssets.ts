import { CORE_ASSETS } from './assets/coreAssets';
import { CLASSIC_PORTRAITS } from './assets/classicPortraits';
import { KNIGHT_PRIEST_PORTRAITS } from './assets/knightPriestPortraits';
import { ROGUE_PORTRAITS } from './assets/roguePortraits';

export const EMBEDDED_IMAGE_ASSETS: Record<string, string> = {
  ...CORE_ASSETS,
  ...CLASSIC_PORTRAITS,
  ...KNIGHT_PRIEST_PORTRAITS,
  ...ROGUE_PORTRAITS,
};
