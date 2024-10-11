import { randomInt } from '../utils/math.ts';
import { collides } from '../utils/geometry.ts';
import type { GameState } from './state.ts';
import { Plant } from './plant.ts';

export const MAX_PLANTS = 30;

export async function createPlant(state: GameState) {
  const plants = state.entities.filter(entity => entity instanceof Plant);
  if (plants.length === MAX_PLANTS) {
    return null;
  }

  const carrot = new Plant();
  let initialX: number;
  let initialY: number;

  const hitbox = {
    offsetX: 12,
    offsetY: 24,
    height: 20,
    width: 20,
  };

  do {
    initialX = randomInt(100, state.map.width - 100);
    initialY = randomInt(100, state.map.height - 100);
  } while (collides({ x: initialX, y: initialY, state, hitbox }));

  state.entities.push(carrot);

  await carrot.init({
    app: state.app,
    state,
    initialX,
    initialY,
    fileName: 'carrot',
    width: 160,
    height: 48,
    hitbox,
  });
}
