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
    for (const movable of this.movables) {
      movable.updatePosition();
    }
    this.map.move(offsetX, offsetY);
    this.reorderEntities();
  }

  // TODO: Refactor
  playerCollides(player: Character, newX: number, newY: number) {
    return this.movables.some(movable => {
      return (
        newX < movable.virtualX + movable.hitbox.offsetX + movable.hitbox.width &&
        newX + player.hitbox.width > movable.virtualX + movable.hitbox.offsetX &&
        newY < movable.virtualY + movable.hitbox.offsetY + movable.hitbox.height &&
        newY + player.hitbox.height > movable.virtualY + movable.hitbox.offsetY
      );
    });
  }

  movableCollides(entity: MovableEntity, newX: number, newY: number) {
    const movableCollision = this.movables.some(movable => {
      return (
        movable !== entity &&
        newX < movable.x + movable.hitbox.offsetX + movable.hitbox.width &&
        newX + entity.hitbox.width > movable.x + movable.hitbox.offsetX &&
        newY < movable.y + movable.hitbox.offsetY + movable.hitbox.height &&
        newY + entity.hitbox.height > movable.y + movable.hitbox.offsetY
      );
    });

    const playerCollision =
      newX < this.player.x + this.player.hitbox.offsetX + this.player.hitbox.width &&
      newX + entity.hitbox.width > this.player.x + this.player.hitbox.offsetX &&
      newY < this.player.y + this.player.hitbox.offsetY + this.player.hitbox.height &&
      newY + entity.hitbox.height > this.player.y + this.player.hitbox.offsetY;

    return movableCollision || playerCollision;
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
