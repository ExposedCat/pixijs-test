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

  protected state!: GameState;

  protected movement: Movement | null = null;
  protected lastDirection: 'left' | 'right' | 'up' | 'down' = 'left';

  protected verticalAnimation!: boolean;
  protected animation!: Texture<TextureSource<any>>[];
  protected animationDelay!: number;
  protected animationDuration!: number;
  protected animationTime = 0;
  protected textureId = 0;

  protected spriteSheet!: Spritesheet<SpritesheetData>;
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

  protected collides(newX: number, newY: number) {
    const movableCollision = this.state.movables.some(movable => {
      return (
        movable !== this &&
        newX < movable.x + movable.hitbox.offsetX + movable.hitbox.width &&
        newX + this.hitbox.width > movable.x + movable.hitbox.offsetX &&
        newY < movable.y + movable.hitbox.offsetY + movable.hitbox.height &&
        newY + this.hitbox.height > movable.y + movable.hitbox.offsetY
      );
    });

    const player = this.state.player;
    const playerCollision =
      newX < player.x + player.hitbox.offsetX + player.hitbox.width &&
      newX + this.hitbox.width > player.x + player.hitbox.offsetX &&
      newY < player.y + player.hitbox.offsetY + player.hitbox.height &&
      newY + this.hitbox.height > player.y + player.hitbox.offsetY;

    return movableCollision || playerCollision;
  }

  protected canMove(changeX: number, changeY: number) {
    const x = this.x + changeX + this.hitbox.offsetX;
    const y = this.y + changeY + this.hitbox.offsetY;
    const { width, height } = this.hitbox;
    return (
      x > 0 && this.state.map.width > x + width && y > 0 && this.state.map.height > y + height && !this.collides(x, y)
    );
  }

  protected updateAnimation(deltaMS: number) {
    this.animationDuration += deltaMS;
    if (this.animationTime > this.animationDelay) {
      this.animationTime = 0;
      this.textureId += 1;
      this.sprite.texture = this.animation[this.textureId % this.animationDuration];
    }
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

  protected updateMovement() {
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
  }

  protected updatePosition() {
    this.sprite.x = this.virtualX;
    this.sprite.y = this.virtualY;
  }

  protected async initBase({ app, initialX, initialY, state, hitbox, ...tilesetArgs }: InitEntityArgs) {
    this.state = state;

    this.x = initialX;
    this.y = initialY;
    this.hitbox = hitbox;

    this.spriteSheet = await parseTileset({ ...tilesetArgs });
    this.width = tilesetArgs.width / tilesetArgs.rowSize;
    this.height = tilesetArgs.height / tilesetArgs.columnSize;

    this.animation = this.spriteSheet.animations.standingLeft;
    this.animationDuration = tilesetArgs.animationDuration;

    this.sprite = new Sprite(this.animation[0]);
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    app.ticker.add(({ deltaMS }) => {
      this.updateMovement();
      this.updateAnimation(deltaMS);
      this.updatePosition();
    });

    app.stage.addChild(this.sprite);
  }

  get virtualX() {
    return this.x - this.state.offsetX;
  }

  get virtualY() {
    return this.y - this.state.offsetY;
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
