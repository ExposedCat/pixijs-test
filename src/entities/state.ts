import type { Application, Renderer } from 'pixi.js';

import type { Player } from './player.ts';
import type { GameMap } from './game-map.ts';
import type { BaseEntity } from './base-entity.ts';

export type GameStateArgs = {
  app: Application<Renderer>;
  map: GameMap;
  player: Player;
  entities: BaseEntity[];
};

export class GameState {
  app!: Application<Renderer>;
  map!: GameMap;
  player!: Player;
  entities!: BaseEntity[];

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
    const newList = [...this.entities, this.player].sort((a, b) => {
      return a.y + a.hitbox.offsetY - (b.y + b.hitbox.offsetY);
    });

    let index = 1;
    for (const entity of newList) {
      this.app.stage.setChildIndex(entity.sprite, index++);
    }
  }
}
