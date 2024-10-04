import { MovableEntity } from './entity.ts';
import type { BaseInitArgs } from './entity.ts';

export type InitCharacterArgs = Pick<BaseInitArgs, 'app'> & {
  onMove?: (x: number, y: number) => void;
};

export class Character extends MovableEntity {
  private onMove!: (x: number, y: number) => void;

  constructor() {
    super({
      keys: {
        w: 'up',
        a: 'left',
        s: 'down',
        d: 'right',
      },
      speed: 3,
      animationDelay: 100,
      verticalAnimation: true,
    });
  }

  protected updatePosition() {
    this.onMove(this.x, this.y);
  }

  setPosition(_x: number, _y: number): void {
    console.warn(`setPosition should not be called on Character`);
  }

  async init({ app, onMove }: InitCharacterArgs) {
    const width = 312;
    const height = 176;
    const rowSize = 12;
    const columnSize = 4;

    const tileWidth = width / rowSize;
    const tileHeight = height / columnSize;
    const initialX = (app.screen.width - tileWidth) / 2;
    const initialY = (app.screen.height - tileHeight) / 2;

    await this.initBase({
      app,
      initialX,
      initialY,
      fileName: 'character',
      width,
      height,
      rowSize,
      columnSize,
      names: [
        'standingLeft',
        'runningLeft',
        'standingDown',
        'standingRight',
        'runningDown',
        'runningRight',
        'standingUp',
        'runningUp',
      ],
      animationDuration: 6,
    });

    this.onMove = onMove ?? (() => {});
  }
}
