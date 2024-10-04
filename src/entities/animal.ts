import { MovableEntity } from './entity.ts';
import type { BaseInitArgs } from './entity.ts';

export class Animal extends MovableEntity {
  constructor() {
    super({
      keys: {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      },
      verticalAnimation: false,
      speed: 1,
      animationDelay: 250,
    });
  }

  async init(args: BaseInitArgs) {
    return this.initBase({
      ...args,
      rowSize: 4,
      columnSize: 2,
      names: ['standingLeft', 'standingRight', 'runningLeft', 'runningRight'],
      animationDuration: 2,
    });
  }
}
