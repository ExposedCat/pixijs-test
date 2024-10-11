import type { Application, Renderer } from 'pixi.js';

import type { GameMap } from './game-map.ts';
import type { MovableEntity } from './entity.ts';
import type { Character } from './character.ts';

export type GameStateArgs = {
  app: Application<Renderer>;
  map: GameMap;
  player: Character;
  movables: MovableEntity[];
};

export class GameState {
  app!: Application<Renderer>;
  map!: GameMap;
  player!: Character;
  movables!: MovableEntity[];

  offsetX = 0;
  offsetY = 0;

  constructor(args: GameStateArgs) {
    Object.assign(this, args);
  }

  handleMovement(offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.reorderEntities();
  }

  reorderEntities() {
    const newList = [...this.movables, this.player].sort((a, b) => {
      return a.y + a.hitbox.offsetY - (b.y + b.hitbox.offsetY);
    });

    let index = 1;
    for (const entity of newList) {
      this.app.stage.setChildIndex(entity.sprite, index++);
    }
  }
}
