import { Sprite } from 'pixi.js';
import type { Spritesheet, SpritesheetData, Texture, TextureSource, Application, Renderer } from 'pixi.js';

import { Movement } from '../utils/movement.ts';
import type { MovementArgs } from '../utils/movement.ts';
import { parseTileset, type ParseTileSheetArgs } from '../engine/tileset.ts';
import type { GameState } from './state.ts';

export type HitBox = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type InitEntityArgs = ParseTileSheetArgs & {
  app: Application<Renderer>;
  state: GameState;
  initialX: number;
  initialY: number;
  hitbox: HitBox;
};

export type BaseInitArgs = Omit<InitEntityArgs, 'rowSize' | 'columnSize' | 'names' | 'animationDuration'>;

export type MovableEntityArgs = {
  speed: number;
  verticalAnimation?: boolean;
  keys?: MovementArgs;
  animationDelay?: number;
};

export class MovableEntity {
  protected speed!: number;
  protected animationDelay!: number;
  protected verticalAnimation!: boolean;

  protected state!: GameState;

  protected movement: Movement | null = null;

  protected spriteSheet!: Spritesheet<SpritesheetData>;

  protected lastDirection: 'left' | 'right' | 'up' | 'down' = 'left';
  protected animation!: Texture<TextureSource<any>>[];

  sprite!: Sprite;

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  hitbox!: HitBox;

  constructor({ keys, ...rest }: MovableEntityArgs) {
    if (keys) {
      this.movement = new Movement(keys);
    }
    Object.assign(this, rest);
    this.animationDelay ??= 250;
  }

  protected updateAnimation() {
    const action = this.movement?.isMoving() ? 'running' : 'standing';
    switch (this.lastDirection) {
      case 'left':
        this.animation = this.spriteSheet.animations[`${action}Left`];
        break;
      case 'right':
        this.animation = this.spriteSheet.animations[`${action}Right`];
        break;
      case 'up':
        this.animation = this.spriteSheet.animations[`${action}Up`];
        break;
      case 'down':
        this.animation = this.spriteSheet.animations[`${action}Down`];
        break;
    }
  }

  updatePosition() {
    this.sprite.x = this.virtualX;
    this.sprite.y = this.virtualY;
  }

  get virtualX() {
    return this.x - this.state.offsetX;
  }

  get virtualY() {
    return this.y - this.state.offsetY;
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
      !this.state.movableCollides(this, x, y)
    );
  }

  protected async initBase({ app, initialX, initialY, state, hitbox, ...tilesetArgs }: InitEntityArgs) {
    this.state = state;

    this.x = initialX;
    this.y = initialY;
    this.hitbox = hitbox;

    this.spriteSheet = await parseTileset({ ...tilesetArgs });
    this.width = tilesetArgs.width / tilesetArgs.rowSize;
    this.height = tilesetArgs.height / tilesetArgs.columnSize;

    let textureId = 0;
    this.animation = this.spriteSheet.animations.standingLeft;

    this.sprite = new Sprite(this.animation[0]);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    app.stage.addChild(this.sprite);

    let elapsed = 0;
    app.ticker.add(({ deltaMS }) => {
      elapsed += deltaMS;
      if (elapsed > this.animationDelay) {
        elapsed = 0;
        textureId += 1;
        this.sprite.texture = this.animation[textureId % tilesetArgs.animationDuration];
      }

      if (this.movement) {
        let deltaX = 0;
        let deltaY = 0;

        if (this.movement.state.up) {
          deltaY -= this.speed;
          if (this.verticalAnimation) this.lastDirection = 'up';
        } else if (this.movement.state.down) {
          deltaY += this.speed;
          if (this.verticalAnimation) this.lastDirection = 'down';
        }
        if (this.movement.state.left) {
          deltaX -= this.speed;
          this.lastDirection = 'left';
        } else if (this.movement.state.right) {
          deltaX += this.speed;
          this.lastDirection = 'right';
        }

        if (deltaX !== 0 && deltaY !== 0) {
          const factor = 1 / Math.sqrt(2);
          deltaX *= factor;
          deltaY *= factor;
        }

        if (deltaX !== 0 || deltaY !== 0) {
          if (this.canMove(deltaX, deltaY)) {
            this.x += deltaX;
            this.y += deltaY;
          } else {
            if (deltaX !== 0 && this.canMove(deltaX, 0)) {
              this.x += deltaX;
            }
            if (deltaY !== 0 && this.canMove(0, deltaY)) {
              this.y += deltaY;
            }
          }
        }
      }

      this.updateAnimation();
      this.updatePosition();
    });
  }

  setPosition(x: number, y: number) {
    if (this.verticalAnimation && this.y !== y) {
      this.lastDirection = y > this.y ? 'down' : 'up';
    }
    if (this.x !== x) {
      this.lastDirection = x > this.x ? 'right' : 'left';
    }
    this.x = x;
    this.y = y;
  }
}
