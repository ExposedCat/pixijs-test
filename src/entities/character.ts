import { MovableEntity } from './entity.ts';
import type { BaseInitArgs } from './entity.ts';

export type InitCharacterArgs = Pick<BaseInitArgs, 'app' | 'state'> & {
  onMove?: (x: number, y: number) => void;
};

export class Character extends MovableEntity {
  private onMove!: (x: number, y: number) => void;

  initialX!: number;
  initialY!: number;

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

  protected canMove(x: number, y: number) {
    return (
      this.x + x > 0 &&
      this.state.map.width > this.x + x + this.width &&
      this.y + y > 0 &&
      this.state.map.height > this.y + y + this.height &&
      !this.state.playerCollides(this, this.initialX + x, this.initialY + y)
    );
  }

  setPosition(_x: number, _y: number): void {
    console.warn(`setPosition should not be called on Character`);
  }
  updatePosition() {
    this.onMove(this.x - this.initialX, this.y - this.initialY);
  }

  async init({ app, state, onMove }: InitCharacterArgs) {
    const width = 312;
    const height = 176;
    const rowSize = 12;
    const columnSize = 4;

    const tileWidth = width / rowSize;
    const tileHeight = height / columnSize;
    this.initialX = (app.screen.width - tileWidth) / 2;
    this.initialY = (app.screen.height - tileHeight) / 2;

    await this.initBase({
      state,
      app,
      initialX: this.initialX,
      initialY: this.initialY,
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
