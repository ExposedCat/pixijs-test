import { Assets, Spritesheet, Texture } from 'pixi.js';
import type { SpritesheetData } from 'pixi.js';

export type ParseTileSheetArgs = {
  width: number;
  height: number;
  rowSize: number;
  columnSize: number;
  fileName: string;
  names: string[];
  animationDuration: number;
};

export async function parseTileset({
  width,
  height,
  rowSize,
  columnSize,
  fileName,
  names,
  animationDuration,
}: ParseTileSheetArgs) {
  await Assets.load(`/assets/tilesets/${fileName}.png`);
  const atlas: SpritesheetData = {
    frames: {},
    meta: {
      image: `/assets/tilesets/${fileName}.png`,
      format: 'RGBA8888',
      size: { w: width, h: height },
      scale: 1,
    },
    animations: Object.fromEntries(
      names.map(name => [name, Array.from({ length: animationDuration }).map((_, i) => `${name}${i}`)]),
    ),
  };

  const tileWidth = width / rowSize;
  const tileHeight = height / columnSize;

  console.log(tileWidth, tileHeight);

  for (let y = 0; y < height; y += tileHeight) {
    for (let x = 0; x < width; x += tileWidth) {
      const globalNumber = x / tileWidth + 1 + (y / tileHeight) * rowSize - 1;
      const groupNumber = (globalNumber / animationDuration) | 0;
      const localNumber = globalNumber - groupNumber * animationDuration;

      const name = `${names[groupNumber]}${localNumber}`;
      atlas.frames[name] = {
        frame: {
          x,
          y,
          w: tileWidth,
          h: tileHeight,
        },
        sourceSize: { w: tileWidth, h: tileHeight },
        spriteSourceSize: { x: 0, y: 0, w: tileWidth, h: tileHeight },
      };
    }
  }

  console.log(atlas);

  const spritesheet = new Spritesheet(Texture.from(atlas.meta.image!), atlas);
  await spritesheet.parse();

  return spritesheet;
}
