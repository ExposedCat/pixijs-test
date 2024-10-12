import type { GameState } from '../init/state.ts';
import type { HitBox, BaseEntity } from '../entities/base-entity.ts';

export type CollidesArgs = {
  hitbox: HitBox;
  x: number;
  y: number;
  state: GameState;
  skipEntity?: BaseEntity;
};

export function collides({ x, y, hitbox, state, skipEntity }: CollidesArgs) {
  const movableCollision = state.entities.some(entity => {
    return (
      entity !== skipEntity &&
      x < entity.x + entity.hitbox.offsetX + entity.hitbox.width &&
      x + hitbox.width > entity.x + entity.hitbox.offsetX &&
      y < entity.y + entity.hitbox.offsetY + entity.hitbox.height &&
      y + hitbox.height > entity.y + entity.hitbox.offsetY
    );
  });

  const player = state.player;
  const playerCollision =
    x < player.x + player.hitbox.offsetX + player.hitbox.width &&
    x + hitbox.width > player.x + player.hitbox.offsetX &&
    y < player.y + player.hitbox.offsetY + player.hitbox.height &&
    y + hitbox.height > player.y + player.hitbox.offsetY;

  return movableCollision || playerCollision;
}

export type DistanceArgs = {
  from: BaseEntity;
  to: BaseEntity;
  fromX?: number;
  fromY?: number;
};

export function distance({ from, to, fromX, fromY }: DistanceArgs) {
  const x = (fromX ?? from.x) + from.width / 2;
  const y = (fromY ?? from.y) + from.height / 2;
  const toX = to.x + to.width / 2;
  const toY = to.x + to.height / 2;
  return Math.sqrt(Math.pow(toX - x, 2) + Math.pow(toY - y, 2));
}
