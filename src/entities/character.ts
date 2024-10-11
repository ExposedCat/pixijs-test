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

  protected collides(newX: number, newY: number) {
    return this.state.movables.some(movable => {
      return (
        newX < movable.virtualX + movable.hitbox.offsetX + movable.hitbox.width &&
        newX + this.hitbox.width > movable.virtualX + movable.hitbox.offsetX &&
        newY < movable.virtualY + movable.hitbox.offsetY + movable.hitbox.height &&
        newY + this.hitbox.height > movable.virtualY + movable.hitbox.offsetY
      );
    });
  }

  protected canMove(changeX: number, changeY: number) {
    const x = this.x + changeX + this.hitbox.offsetX;
    const y = this.y + changeY + this.hitbox.offsetY;
    const { width, height } = this.hitbox;
    return (
      x > 0 &&
      this.state.map.width > x + width &&
      y > 0 &&
      this.state.map.height > y + height &&
      !this.collides(this.initialX + changeX + this.hitbox.offsetX, this.initialY + changeY + this.hitbox.offsetY)
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
      hitbox: {
        offsetX: 6,
        offsetY: 24,
        width: 14,
        height: 12,
      },
    });

    this.onMove = onMove ?? (() => {});
  }
}
