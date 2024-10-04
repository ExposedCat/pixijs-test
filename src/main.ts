import { initPixiApp } from './pixi.ts';
import { createMap } from './map.ts';
import { createCharacter } from './character.ts';
import { createAnimal } from './animal.ts';

const root = document.querySelector<HTMLDivElement>('#root');
if (!root) {
  throw new Error('Root element not found');
}

const app = await initPixiApp({
  width: root.clientWidth,
  height: root.clientHeight,
});

root.appendChild(app.canvas);

const map = await createMap({
  app,
  width: app.screen.width * 2,
  height: app.screen.height * 2,
});

const pig = await createAnimal({
  app,
  initialX: 500,
  initialY: 500,
  fileName: 'pig',
  width: 168,
  height: 64,
});

await createCharacter({
  app,
  onMove: (x, y) => {
    pig.shift(x, y);
    map.move(x, y);
  },
});
