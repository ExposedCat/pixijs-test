import { Sprite } from 'pixi.js';
import type { Application, Renderer, Spritesheet, SpritesheetData, Ticker } from 'pixi.js';

import { parseTileset } from '../utils/tileset.ts';
import type { ParseTileSheetArgs } from '../utils/tileset.ts';
import type { GameState } from '../init/state.ts';

export type HitBox = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type InitBaseEntityArgs = ParseTileSheetArgs & {
  hp: number;
  app: Application<Renderer>;
  state: GameState;
  initialX: number;
  initialY: number;
  hitbox: HitBox;
};

export class BaseEntity {
  alive: boolean = true;
  initialized: boolean = false;
  hp!: number;

  protected state!: GameState;

  protected spriteSheet!: Spritesheet<SpritesheetData>;
  sprite!: Sprite;

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  hitbox!: HitBox;

  protected updatePosition() {
    this.sprite.x = this.virtualX;
    this.sprite.y = this.virtualY;
  }

  async initBase({ app, hp, initialX, initialY, state, hitbox, ...tilesetArgs }: InitBaseEntityArgs) {
    this.hp = hp;
    this.state = state;
    this.hitbox = hitbox;

    this.spriteSheet = await parseTileset(tilesetArgs);

    this.width = tilesetArgs.width / tilesetArgs.rowSize;
    this.height = tilesetArgs.height / tilesetArgs.columnSize;

    this.sprite = new Sprite(this.spriteSheet.animations[tilesetArgs.names[0]][0]);
    this.sprite.x = this.x = initialX;
    this.sprite.y = this.y = initialY;
  }

  lifeCycle(_ticker: Ticker) {
    if (this.sprite.visible) {
      this.updatePosition();
    }
  }

  get virtualX() {
    return this.x - this.state.offsetX;
  }

  get virtualY() {
    return this.y - this.state.offsetY;
  }

  hit(damage: number) {
    if (this.hp !== null) {
      this.hp -= damage;
    }
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  destroy() {
    this.initialized = false;
    this.sprite.destroy();
  }
}
