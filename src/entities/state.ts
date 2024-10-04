import type { GameMap } from './game-map.ts';
import type { MovableEntity } from './entity.ts';
import type { Character } from './character.ts';

export type GameStateArgs = {
  map: GameMap;
  player: Character;
  movables: MovableEntity[];
};

export class GameState {
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
  }

  // TODO: Refactor
  playerCollides(player: Character, newX: number, newY: number) {
    return this.movables.some(movable => {
      return (
        newX < movable.virtualX + movable.width &&
        newX + player.width > movable.virtualX &&
        newY < movable.virtualY + movable.height &&
        newY + player.height > movable.virtualY
      );
    });
  }

  movableCollides(entity: MovableEntity, newX: number, newY: number) {
    const movableCollision = this.movables.some(movable => {
      return (
        movable !== entity &&
        newX < movable.x + movable.width &&
        newX + entity.width > movable.x &&
        newY < movable.y + movable.height &&
        newY + entity.height > movable.y
      );
    });

    const playerCollision =
      newX < this.player.x + this.player.width &&
      newX + entity.width > this.player.x &&
      newY < this.player.y + this.player.height &&
      newY + entity.height > this.player.y;

    return movableCollision || playerCollision;
  }
}
