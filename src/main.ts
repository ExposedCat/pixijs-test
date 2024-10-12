import { GameState } from './init/state.ts';
import { initPixi } from './init/engine.ts';
import { Plant } from './entities/static/plant.ts';
import { Player } from './entities/movable/player.ts';
import { Animal } from './entities/movable/animal.ts';
import { GameMap } from './entities/generic/game-map.ts';

const root = document.querySelector<HTMLDivElement>('#root');
if (!root) {
  throw new Error('Root element not found');
}

const app = await initPixi({
  width: root.clientWidth,
  height: root.clientHeight,
});

root.appendChild(app.canvas);

const map = new GameMap();
const pig = new Animal();
const player = new Player();

const state = new GameState({
  app,
  map,
  player,
  entities: [pig],
});

await map.init({
  app,
  state,
  width: app.screen.width * 2,
  height: app.screen.height * 2,
});

await pig.init({
  app,
  state,
  initialX: 500,
  initialY: 500,
  fileName: 'pig',
  width: 168,
  height: 64,
  hitbox: {
    offsetX: 12,
    offsetY: 8,
    height: 16,
    width: 24,
  },
});

await player.init({
  app,
  state,
  onMove: state.handleMovement.bind(state),
});

setInterval(() => Plant.create(state), 3_000);

app.ticker.add(ticker => {
  map.lifeCycle();
  for (const entity of [...state.entities, state.player]) {
    if (entity.initialized) {
      entity.lifeCycle(ticker);
    }
  }
});
