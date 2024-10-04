import { Sprite } from 'pixi.js';
import type { Spritesheet, SpritesheetData, Texture, TextureSource, Application, Renderer } from 'pixi.js';

import { Movement } from '../utils/movement.ts';
import type { MovementArgs } from '../utils/movement.ts';
import { parseTileset, type ParseTileSheetArgs } from '../engine/tileset.ts';

export type InitEntityArgs = ParseTileSheetArgs & {
  app: Application<Renderer>;
  initialX: number;
  initialY: number;
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

  protected movement: Movement | null = null;

  protected sprite!: Sprite;
  protected spriteSheet!: Spritesheet<SpritesheetData>;

  protected x = 0;
  protected y = 0;

  protected offsetX = 0;
  protected offsetY = 0;

  protected lastDirection: 'left' | 'right' | 'up' | 'down' = 'left';
  protected animation!: Texture<TextureSource<any>>[];

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

  protected updatePosition() {
    this.sprite.x = this.x - this.offsetX;
    this.sprite.y = this.y - this.offsetY;
  }

  protected async initBase({ app, initialX, initialY, ...tilesetArgs }: InitEntityArgs) {
    this.x = initialX;
    this.y = initialY;

    this.spriteSheet = await parseTileset({ ...tilesetArgs });

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
        if (this.movement.state.up) {
          this.y -= this.speed;
          if (this.verticalAnimation) this.lastDirection = 'up';
        } else if (this.movement.state.down) {
          this.y += this.speed;
          if (this.verticalAnimation) this.lastDirection = 'down';
        }

        if (this.movement.state.left) {
          this.x -= this.speed;
          this.lastDirection = 'left';
        } else if (this.movement.state.right) {
          this.x += this.speed;
          this.lastDirection = 'right';
        }
      }

      this.updateAnimation();
      this.updatePosition();
    });
  }

  setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
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
