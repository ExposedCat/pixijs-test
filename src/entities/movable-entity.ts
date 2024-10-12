import type { Texture, TextureSource, Application, Renderer, Ticker } from 'pixi.js';

import { collides } from '../utils/geometry.ts';
import { Controls } from '../utils/controls.ts';
import type { MovementArgs } from '../utils/controls.ts';
import { BaseEntity } from './base-entity.ts';
import type { InitBaseEntityArgs } from './base-entity.ts';

export type InitMovableEntityArgs = InitBaseEntityArgs & {
  app: Application<Renderer>;
};

export type MovableEntityArgs = {
  speed: number;
  verticalAnimation?: boolean;
  keys?: MovementArgs;
  animationDelay?: number;
};

export class MovableEntity extends BaseEntity {
  protected speed!: number;

  protected controls!: Controls;
  protected lastDirection: 'left' | 'right' | 'up' | 'down' = 'left';

  protected verticalAnimation!: boolean;
  protected animation!: Texture<TextureSource<any>>[];
  protected animationDelay!: number;
  protected animationDuration!: number;
  protected animationTime = 0;
  protected textureId = 0;

  constructor({ keys = {}, ...rest }: MovableEntityArgs) {
    super();
    this.controls = new Controls(keys);
    Object.assign(this, rest);
    this.animationDelay ??= 250;
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
      !collides({
        skipEntity: this,
        hitbox: this.hitbox,
        state: this.state,
        x,
        y,
      })
    );
  }

  protected updateAnimation(deltaMS: number) {
    this.animationTime += deltaMS;
    if (this.animationTime > this.animationDelay) {
      this.animationTime = 0;
      this.textureId += 1;
      this.sprite.texture = this.animation[this.textureId % this.animationDuration];
    }
    const action = this.controls?.isMoving() ? 'running' : 'standing';
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
    if (this.controls) {
      let deltaX = 0;
      let deltaY = 0;

      if (this.controls.movement.up) {
        deltaY -= this.speed;
        if (this.verticalAnimation) this.lastDirection = 'up';
      } else if (this.controls.movement.down) {
        deltaY += this.speed;
        if (this.verticalAnimation) this.lastDirection = 'down';
      }
      if (this.controls.movement.left) {
        deltaX -= this.speed;
        this.lastDirection = 'left';
      } else if (this.controls.movement.right) {
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

  protected updateVisibility() {
    const playerOffsetX = this.state.player.width / 2;
    const playerOffsetY = this.state.player.height / 2;
    const playerX = this.state.player.x + playerOffsetX;
    const playerY = this.state.player.y + playerOffsetY;

    const selfOffsetX = this.width / 2;
    const selfOffsetY = this.height / 2;
    const selfX = this.x + selfOffsetX;
    const selfY = this.y + selfOffsetY;

    this.sprite.visible =
      Math.abs(playerY - selfY) <= this.state.player.initialY + playerOffsetY + selfOffsetY &&
      Math.abs(playerX - selfX) <= this.state.player.initialX + playerOffsetX + selfOffsetX;
  }

  protected async initMovable({ app, initialX, initialY, state, hitbox, ...tilesetArgs }: InitMovableEntityArgs) {
    await this.initBase({ app, initialX, initialY, state, hitbox, ...tilesetArgs });

    this.animation = this.spriteSheet.animations.standingLeft;
    this.animationDuration = tilesetArgs.animationDuration;

    this.sprite.texture = this.animation[0];

    app.stage.addChild(this.sprite);
  }

  lifeCycle(ticker: Ticker) {
    super.lifeCycle(ticker);
    this.updateMovement();
    if (this.sprite.visible) {
      this.updateAnimation(ticker.deltaMS);
    }
    this.updateVisibility();
  }
}
