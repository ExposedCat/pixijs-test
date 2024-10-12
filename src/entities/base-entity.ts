import { Sprite } from 'pixi.js';
import type { Application, Renderer, Spritesheet, SpritesheetData } from 'pixi.js';

import { parseTileset, type ParseTileSheetArgs } from '../engine/tileset.ts';
import type { GameState } from './state.ts';

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
  hp!: number;

  protected state!: GameState;

  protected spriteSheet!: Spritesheet<SpritesheetData>;
  sprite!: Sprite;

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  hitbox!: HitBox;

  destroy() {}

  protected updatePosition() {
    this.sprite.x = this.virtualX;
    this.sprite.y = this.virtualY;
  }

  protected baseLifeCycle() {
    if (this.sprite.visible) {
      this.updatePosition();
    }
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

    const lifeCycle = this.baseLifeCycle.bind(this);
    app.ticker.add(lifeCycle);
    this.destroy = () => app.ticker.remove(lifeCycle);
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
}
