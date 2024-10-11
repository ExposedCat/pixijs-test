import { MovableEntity } from './movable-entity.ts';
import type { InitMovableEntityArgs } from './movable-entity.ts';

export type InitAnimalArgs = Omit<
  InitMovableEntityArgs,
  'hp' | 'rowSize' | 'columnSize' | 'names' | 'animationDuration'
>;

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

  async init(args: InitAnimalArgs) {
    return this.initMovable({
      ...args,
      hp: 30,
      rowSize: 4,
      columnSize: 2,
      names: ['standingLeft', 'standingRight', 'runningLeft', 'runningRight'],
      animationDuration: 2,
    });
  }
}
