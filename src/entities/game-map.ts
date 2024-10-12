import type { Application, Renderer } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

import { randomInt } from '../utils/math.ts';
import { parseTileset } from '../engine/tileset.ts';
import type { GameState } from './state.ts';

export type CreateMapArgs = {
  app: Application<Renderer>;
  state: GameState;
  width: number;
  height: number;
};

export class GameMap {
  private tilemap!: CompositeTilemap;
  private state!: GameState;

  width: number = 0;
  height: number = 0;

  async init({ width, height, app, state }: CreateMapArgs) {
    this.width = width;
    this.height = height;
    this.state = state;

    const tileset = await parseTileset({
      fileName: 'background',
      width: 64,
      height: 16,
      rowSize: 4,
      columnSize: 1,
      names: ['1', '2', '3', '4'],
      animationDuration: 1,
    });

    const tiles = Array.from({ length: height }).map(() =>
      Array.from({ length: width }).map(() => {
        const filled = randomInt(1, 10) === 1;
        return filled ? randomInt(1, 3) : 4;
      }),
    );

    this.tilemap = new CompositeTilemap();

    for (let y = 0; y < height; y += 16) {
      for (let x = 0; x < width; x += 16) {
        const tile = tiles[y / 16]?.[x / 16];
        if (tile) {
          this.tilemap.tile(tileset.textures[`${tile}0`], x, y);
        }
      }
    }

    app.stage.addChild(this.tilemap);
  }

  move(x: number, y: number) {
    this.tilemap.pivot.set(x, y);
  }

  lifeCycle() {
    this.move(this.state.offsetX, this.state.offsetY);
  }
}
