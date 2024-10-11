import type { TickerCallback } from 'pixi.js';

import { randomInt } from '../utils/math.ts';
import { StaticEntity } from './static-entity.ts';
import type { InitStaticEntityArgs } from './static-entity.ts';

export type InitPlantArgs = Omit<InitStaticEntityArgs, 'hp' | 'rowSize' | 'columnSize' | 'names' | 'animationDuration'>;

export class Plant extends StaticEntity {
  private time = 0;
  private growLevelMS = randomInt(3_000, 5_000);

  private updateGrowth() {
    this.sprite.texture = this.spriteSheet.animations[`grow${this.growthLevel}`][0];
  }

  private get growthLevel(): number {
    return this.time > this.growLevelMS * 4
      ? 4
      : this.time > this.growLevelMS * 3
        ? 3
        : this.time > this.growLevelMS * 2
          ? 2
          : 1;
  }

  async init(args: InitPlantArgs) {
    await this.initStatic({
      ...args,
      hp: 1,
      rowSize: 4,
      columnSize: 1,
      names: ['grow1', 'grow2', 'grow3', 'grow4'],
    });

    const lifeCycle: TickerCallback<any> = ({ deltaMS }) => {
      this.time += deltaMS;
      this.updateGrowth();
      if (this.growthLevel === 4 || this.hp <= 0) {
        args.app.ticker.remove(lifeCycle);
      }
    };

    args.app.ticker.add(lifeCycle);
  }
}
