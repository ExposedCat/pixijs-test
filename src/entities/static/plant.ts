import type { Ticker } from 'pixi.js';

import { collides } from '../../utils/geometry.ts';
import type { GameState } from '../../init/state.ts';
import { randomInt } from '../../helpers/math.ts';
import { StaticEntity } from './static-entity.ts';
import type { InitStaticEntityArgs } from './static-entity.ts';

export type InitPlantArgs = Omit<InitStaticEntityArgs, 'hp' | 'rowSize' | 'columnSize' | 'names' | 'animationDuration'>;

export const MAX_PLANTS = 30;

export class Plant extends StaticEntity {
  private time = 0;
  private growLevelMS = randomInt(3_000, 5_000);

  private updateGrowth() {
    this.sprite.texture = this.spriteSheet.animations[`grow${this.growthLevel}`][0];
  }

  lifeCycle(ticker: Ticker) {
    super.lifeCycle(ticker);
    if (this.alive) {
      this.time += ticker.deltaMS;
      this.updateGrowth();
      if (this.growthLevel === 4 || this.hp <= 0) {
        this.alive = false;
      }
    }
  }

  async init(args: InitPlantArgs) {
    await this.initStatic({
      ...args,
      hp: 1,
      rowSize: 4,
      columnSize: 1,
      names: ['grow1', 'grow2', 'grow3', 'grow4'],
    });
    this.initialized = true;
  }

  get growthLevel(): number {
    return this.time > this.growLevelMS * 4
      ? 4
      : this.time > this.growLevelMS * 3
        ? 3
        : this.time > this.growLevelMS * 2
          ? 2
          : 1;
  }

  static async create(state: GameState) {
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
      // FIXME: Collision check doesn't work
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
}
