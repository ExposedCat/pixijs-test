import { Sprite } from 'pixi.js';
import type { Application, Renderer, Spritesheet, SpritesheetData, Texture, TextureSource } from 'pixi.js';

import { Movement } from '../utils/movement.ts';
import { parseTileset } from '../engine/tileset.ts';
import type { ParseTileSheetArgs } from '../engine/tileset.ts';

export type InitAnimalArgs = Pick<ParseTileSheetArgs, 'fileName' | 'width' | 'height'> & {
  app: Application<Renderer>;
  initialX: number;
  initialY: number;
};

export class Animal {
  private animationDuration = 2;

  private speed = 1;

  private movement = new Movement({
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  });

  private sprite!: Sprite;
  private spriteSheet!: Spritesheet<SpritesheetData>;

  private x = 0;
  private y = 0;

  private offsetX = 0;
  private offsetY = 0;

  private lastDirection: 'left' | 'right' = 'left';
  private animation!: Texture<TextureSource<any>>[];

  private updatePosition() {
    this.sprite.x = this.x - this.offsetX;
    this.sprite.y = this.y - this.offsetY;
  }

  private updateAnimation() {
    const action = this.movement.isMoving() ? 'running' : 'standing';
    switch (this.lastDirection) {
      case 'left':
        this.animation = this.spriteSheet.animations[`${action}Left`];
        break;
      case 'right':
        this.animation = this.spriteSheet.animations[`${action}Right`];
        break;
    }
  }

  async init({ app, initialX, initialY, ...tilesetArgs }: InitAnimalArgs) {
    this.spriteSheet = await parseTileset({
      ...tilesetArgs,
      rowSize: 4,
      columnSize: 2,
      names: ['standingLeft', 'standingRight', 'runningLeft', 'runningRight'],
      animationDuration: this.animationDuration,
    });

    let textureId = 0;
    this.animation = this.spriteSheet.animations.standingLeft;

    this.sprite = new Sprite(this.animation[0]);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    app.stage.addChild(this.sprite);

    let elapsed = 0;
    app.ticker.add(({ deltaMS }) => {
      elapsed += deltaMS;
      if (elapsed > 250) {
        elapsed = 0;
        textureId += 1;
        this.sprite.texture = this.animation[textureId % this.animationDuration];
      }

      if (this.movement.state.up) {
        this.y -= this.speed;
      } else if (this.movement.state.down) {
        this.y += this.speed;
      }

      if (this.movement.state.left) {
        this.x -= this.speed;
        this.lastDirection = 'left';
      } else if (this.movement.state.right) {
        this.x += this.speed;
        this.lastDirection = 'right';
      }

      this.updateAnimation();
      this.updatePosition();
    });
  }

  setOffset(x: number, y: number) {
    this.offsetX = x;
    this.offsetY = y;
  }
}
