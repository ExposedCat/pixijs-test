import type { Application, Renderer } from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';

import { parseTileset } from './tileset.ts';
import { randomInt } from './math.ts';

export type CreateMapArgs = {
  app: Application<Renderer>;
  width: number;
  height: number;
};

export async function createMap({ width, height, app }: CreateMapArgs) {
  const tileset = await parseTileset({
    fileName: 'background',
    width: 64,
    height: 16,
    rowSize: 4,
    columnSize: 1,
    names: ['1', '2', '3', '4'],
    animationDuration: 1,
  });

  console.log(tileset);

  const tiles = Array.from({ length: height }).map(() =>
    Array.from({ length: width }).map(() => {
      const filled = randomInt(1, 10) === 1;
      return filled ? randomInt(1, 3) : 4;
    }),
  );

  const tilemap = new CompositeTilemap();

  for (let y = 0; y < height; y += 16) {
    for (let x = 0; x < width; x += 16) {
      const tile = tiles[y / 16]?.[x / 16];
      if (tile) {
        tilemap.tile(tileset.textures[`${tile}0`], x, y);
      } else {
        console.log('Not found', x / 16, y / 16);
      }
    }
  }

  app.stage.addChild(tilemap);

  const move = (x: number, y: number) => tilemap.pivot.set(x, y);

  return { move };
}
