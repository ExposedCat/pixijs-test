import type { Application, Renderer } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

import { randomInt } from '../utils/math.ts';
import { parseTileset } from '../engine/tileset.ts';

export type CreateMapArgs = {
  app: Application<Renderer>;
  width: number;
  height: number;
};

export class GameMap {
  private tilemap!: CompositeTilemap;

  async init({ width, height, app }: CreateMapArgs) {
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
}
