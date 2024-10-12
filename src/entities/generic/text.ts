import { Text as NativeText } from 'pixi.js';
import type { TextOptions } from 'pixi.js';

export class Text extends NativeText {
  constructor(options?: TextOptions) {
    super({
      style: {
        fontFamily: 'Pixel',
        fill: 'white',
        stroke: {
          color: 'black',
          width: 3,
        },
        ...options?.style,
      },
      ...options,
    });
  }
}
